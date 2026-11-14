import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { generateSecureToken, hashToken } from '../../utils/tokens.js';
import { notificationService } from '../../services/notification.service.js';
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors.js';

export class TeamsService {
  /**
   * Public or filtered list of teams
   */
  async listTeams(query = {}) {
    const where = { status: 'ACTIVE' };
    if (query.gameId) where.primaryGameId = query.gameId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { slug: { contains: query.search } },
      ];
    }

    return prisma.team.findMany({
      where,
      include: {
        primaryGame: true,
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Get all teams where the user is an active member
   */
  async getMyTeams(userId) {
    const memberships = await prisma.teamMembership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        team: {
          include: {
            primaryGame: true,
            captain: { select: { id: true, username: true } },
            owner: { select: { id: true, username: true } },
            memberships: {
              where: { status: 'ACTIVE' },
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    gamerProfile: {
                      select: {
                        id: true,
                        displayName: true,
                        inGameName: true,
                        avatarUrl: true,
                        evoqId: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
              orderBy: { joinedAt: 'asc' },
            },
            invitations: {
              where: {
                status: 'PENDING',
                expiresAt: { gt: new Date() },
              },
              include: {
                invitee: {
                  select: {
                    id: true,
                    username: true,
                    gamerProfile: {
                      select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        evoqId: true,
                        inGameName: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
            _count: {
              select: {
                memberships: { where: { status: 'ACTIVE' } },
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => {
      const activeMembers = m.team.memberships || [];
      const pendingInvites = m.team.invitations || [];
      const isLeadership = ['OWNER', 'CAPTAIN'].includes(m.role);

      return {
        ...m.team,
        myRole: m.role,
        joinedAt: m.joinedAt,
        maxMembers: m.team.maxMembers || 4,
        membersCount: activeMembers.length,
        members: activeMembers,
        // Only leadership sees pending outgoing team invites
        pendingInvitations: isLeadership ? pendingInvites : [],
      };
    });
  }

  /**
   * Create a simplified team:
   * - Name (required)
   * - Team Size (maxMembers, default 4)
   * - Logo URL (optional)
   * - Member EVOQ IDs (optional invitations at creation)
   */
  async createTeam(userId, data) {
    const rawName = (data.name || '').trim();
    if (!rawName || rawName.length < 2) {
      throw new ValidationError('Team name must be at least 2 characters long');
    }

    const maxMembers = Number(data.maxMembers) || 4;
    if (maxMembers < 1 || maxMembers > 32) {
      throw new ValidationError('Team size must be between 1 and 32 members');
    }

    // Generate unique slug
    let teamSlug = (data.slug || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!teamSlug) {
      teamSlug = rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'team';
    }

    // Ensure slug uniqueness
    const existingSlug = await prisma.team.findUnique({
      where: { slug: teamSlug },
    });
    if (existingSlug) {
      const suffix = Math.random().toString(36).substring(2, 6);
      teamSlug = `${teamSlug.substring(0, 120)}-${suffix}`;
    }

    const teamId = generateUuid();
    const logoUrl = data.logoUrl ? String(data.logoUrl).trim() : null;

    // Creator is member #1
    // Check if initial member invitations exceed remaining slots
    const memberEvoqIds = Array.isArray(data.memberEvoqIds)
      ? [...new Set(data.memberEvoqIds.map((id) => (id || '').trim().toUpperCase()).filter(Boolean))]
      : [];

    const availableSlots = maxMembers - 1;
    if (memberEvoqIds.length > availableSlots) {
      throw new ValidationError(
        `Team size is ${maxMembers} (1 creator + ${availableSlots} member slots). You cannot invite ${memberEvoqIds.length} players.`
      );
    }

    // Pre-resolve all invited gamer profiles if any
    const resolvedInvitees = [];
    if (memberEvoqIds.length > 0) {
      for (const evoqId of memberEvoqIds) {
        const profile = await prisma.gamerProfile.findUnique({
          where: { evoqId },
          include: { user: true },
        });

        if (!profile) {
          throw new NotFoundError(`Gamer with EVOQ ID '${evoqId}' does not exist.`);
        }

        if (profile.userId === userId) {
          throw new ValidationError(`You cannot invite yourself (${evoqId}) to your own team.`);
        }

        resolvedInvitees.push({
          profile,
          user: profile.user,
        });
      }
    }

    // Execute atomic team creation
    const createdTeam = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          id: teamId,
          name: rawName,
          slug: teamSlug,
          maxMembers,
          logoUrl,
          description: data.description?.trim() || null,
          primaryGameId: data.primaryGameId || null,
          country: data.country?.trim() || null,
          region: data.region?.trim() || null,
          ownerId: userId,
          captainId: userId,
          status: 'ACTIVE',
        },
      });

      // Add creator as OWNER
      await tx.teamMembership.create({
        data: {
          id: generateUuid(),
          teamId,
          userId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });

      // Audit roster history
      await tx.teamRosterHistory.create({
        data: {
          id: generateUuid(),
          teamId,
          userId,
          action: 'CREATED_TEAM',
          newRole: 'OWNER',
          changedById: userId,
        },
      });

      // Dispatch invitations
      for (const invitee of resolvedInvitees) {
        const rawToken = generateSecureToken(32);
        const tokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const invitationId = generateUuid();
        await tx.teamInvitation.create({
          data: {
            id: invitationId,
            teamId,
            inviterId: userId,
            inviteeId: invitee.user.id,
            role: 'PLAYER',
            tokenHash,
            status: 'PENDING',
            expiresAt,
          },
        });
      }

      return team;
    });

    // Send async notifications outside transaction
    for (const invitee of resolvedInvitees) {
      try {
        await notificationService.notifyUser({
          recipientId: invitee.user.id,
          type: 'TEAM_INVITE',
          title: 'Squad Invitation',
          message: `You were invited to join squad "${rawName}".`,
          payload: { teamId, teamSlug: createdTeam.slug },
        });
      } catch (err) {
        console.error('Failed to dispatch notification for team invite:', err);
      }
    }

    return createdTeam;
  }

  /**
   * Get team details by Slug (with membership and active invites for leaders)
   */
  async getTeamBySlug(slug, currentUserId = null) {
    const team = await prisma.team.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, username: true } },
        captain: { select: { id: true, username: true } },
        primaryGame: true,
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                gamerProfile: {
                  select: {
                    id: true,
                    displayName: true,
                    avatarUrl: true,
                    inGameName: true,
                    evoqId: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        invitations: {
          where: {
            status: 'PENDING',
            expiresAt: { gt: new Date() },
          },
          include: {
            invitee: {
              select: {
                id: true,
                username: true,
                gamerProfile: {
                  select: {
                    id: true,
                    displayName: true,
                    avatarUrl: true,
                    evoqId: true,
                    inGameName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        rosterHistory: {
          take: 15,
          orderBy: { createdAt: 'desc' },
        },
        achievements: {
          include: { game: true, tournament: { select: { name: true, slug: true } } },
          take: 10,
        },
      },
    });

    if (!team) {
      throw new NotFoundError(`Team '${slug}' not found`);
    }

    const isLeader =
      currentUserId &&
      (team.ownerId === currentUserId ||
        team.captainId === currentUserId ||
        team.memberships.some((m) => m.userId === currentUserId && ['OWNER', 'CAPTAIN'].includes(m.role)));

    return {
      ...team,
      // Hide pending invitation details from general public viewers
      invitations: isLeader ? team.invitations : [],
    };
  }

  /**
   * Get team details by ID
   */
  async getTeamById(teamId, currentUserId = null) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: { select: { id: true, username: true } },
        captain: { select: { id: true, username: true } },
        primaryGame: true,
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                gamerProfile: {
                  select: {
                    id: true,
                    displayName: true,
                    avatarUrl: true,
                    inGameName: true,
                    evoqId: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        invitations: {
          where: {
            status: 'PENDING',
            expiresAt: { gt: new Date() },
          },
          include: {
            invitee: {
              select: {
                id: true,
                username: true,
                gamerProfile: {
                  select: {
                    id: true,
                    displayName: true,
                    avatarUrl: true,
                    evoqId: true,
                    inGameName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    const isLeader =
      currentUserId &&
      (team.ownerId === currentUserId ||
        team.captainId === currentUserId ||
        team.memberships.some((m) => m.userId === currentUserId && ['OWNER', 'CAPTAIN'].includes(m.role)));

    return {
      ...team,
      invitations: isLeader ? team.invitations : [],
    };
  }

  /**
   * Update team info (Name, Logo, MaxMembers)
   */
  async updateTeam(teamId, userId, updateData) {
    const membership = await prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    if (!membership || !['OWNER', 'CAPTAIN'].includes(membership.role)) {
      throw new ForbiddenError('Only the team owner or captain can modify team settings');
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        memberships: { where: { status: 'ACTIVE' } },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Validate size change
    if (updateData.maxMembers !== undefined) {
      const newMax = Number(updateData.maxMembers);
      if (newMax < 1 || newMax > 32) {
        throw new ValidationError('Team size must be between 1 and 32 members');
      }

      const activeCount = team.memberships.length;
      if (newMax < activeCount) {
        throw new ValidationError(
          `Cannot reduce team size to ${newMax} because the team currently has ${activeCount} active members. Remove members first.`
        );
      }

      // Check if team is registered in active tournaments requiring a higher roster size
      const activeRegs = await prisma.tournamentRegistration.findMany({
        where: { teamId, status: { in: ['PENDING', 'APPROVED'] } },
        include: { tournament: { select: { name: true, teamSize: true } } },
      });

      for (const reg of activeRegs) {
        if (newMax < (reg.tournament.teamSize || 1)) {
          throw new ValidationError(
            `Cannot reduce team size below ${reg.tournament.teamSize} while registered in tournament "${reg.tournament.name}".`
          );
        }
      }
    }

    const data = {};
    if (updateData.name) data.name = updateData.name.trim();
    if (updateData.maxMembers !== undefined) data.maxMembers = Number(updateData.maxMembers);
    if (updateData.logoUrl !== undefined) data.logoUrl = updateData.logoUrl ? updateData.logoUrl.trim() : null;
    if (updateData.description !== undefined) data.description = updateData.description?.trim() || null;
    if (updateData.primaryGameId !== undefined) data.primaryGameId = updateData.primaryGameId || null;

    return prisma.team.update({
      where: { id: teamId },
      data,
    });
  }

  /**
   * Invite member by EVOQ ID (or Username/Email)
   */
  async inviteMember(teamId, inviterId, { evoqId, usernameOrEmail, role = 'PLAYER' }) {
    const inviterMembership = await prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId: inviterId } },
    });

    if (!inviterMembership || !['OWNER', 'CAPTAIN'].includes(inviterMembership.role)) {
      throw new ForbiddenError('Only the team owner or captain can invite new members');
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        memberships: { where: { status: 'ACTIVE' } },
        invitations: {
          where: {
            status: 'PENDING',
            expiresAt: { gt: new Date() },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check capacity (active members + pending invitations)
    const maxCapacity = team.maxMembers || 4;
    const currentActive = team.memberships.length;
    const currentPending = team.invitations.length;

    if (currentActive + currentPending >= maxCapacity) {
      throw new ConflictError(
        `Team capacity reached (max ${maxCapacity} members: ${currentActive} confirmed, ${currentPending} pending invitations).`
      );
    }

    let invitee = null;
    let inviteeProfile = null;

    if (evoqId) {
      const normalizedEvoqId = evoqId.trim().toUpperCase();
      inviteeProfile = await prisma.gamerProfile.findUnique({
        where: { evoqId: normalizedEvoqId },
        include: { user: true },
      });

      if (!inviteeProfile) {
        throw new NotFoundError(`Gamer with EVOQ ID '${normalizedEvoqId}' does not exist.`);
      }
      invitee = inviteeProfile.user;
    } else if (usernameOrEmail) {
      invitee = await prisma.user.findFirst({
        where: {
          OR: [
            { email: usernameOrEmail.toLowerCase().trim() },
            { username: usernameOrEmail.trim() },
          ],
        },
        include: { gamerProfile: true },
      });

      if (!invitee) {
        throw new NotFoundError(`User '${usernameOrEmail}' not found.`);
      }
      inviteeProfile = invitee.gamerProfile;
    }

    if (!invitee) {
      throw new ValidationError('A valid EVOQ ID or Username/Email is required');
    }

    // Cannot invite oneself
    if (invitee.id === inviterId) {
      throw new ValidationError('You cannot invite yourself to your own team');
    }

    // Check existing active membership
    const existingMember = await prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId: invitee.id } },
    });
    if (existingMember && existingMember.status === 'ACTIVE') {
      throw new ConflictError('Player is already a confirmed active member of this team');
    }

    // Check pending invitation
    const existingInvite = await prisma.teamInvitation.findFirst({
      where: { teamId, inviteeId: invitee.id, status: 'PENDING', expiresAt: { gt: new Date() } },
    });
    if (existingInvite) {
      throw new ConflictError('An active invitation is already pending for this player');
    }

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.teamInvitation.create({
      data: {
        id: generateUuid(),
        teamId,
        inviterId,
        inviteeId: invitee.id,
        role: role || 'PLAYER',
        tokenHash,
        status: 'PENDING',
        expiresAt,
      },
      include: {
        invitee: {
          select: {
            id: true,
            username: true,
            gamerProfile: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                evoqId: true,
                inGameName: true,
              },
            },
          },
        },
      },
    });

    // Dispatch notification
    await notificationService.notifyUser({
      recipientId: invitee.id,
      type: 'TEAM_INVITE',
      title: 'Squad Invitation',
      message: `You were invited to join ${team.name}.`,
      payload: { teamId, teamSlug: team.slug, invitationId: invitation.id },
    });

    return invitation;
  }

  /**
   * Cancel an outgoing pending invitation (by Team Owner/Captain)
   */
  async cancelInvitation(teamId, actorId, invitationId) {
    const actorMembership = await prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId: actorId } },
    });

    if (!actorMembership || !['OWNER', 'CAPTAIN'].includes(actorMembership.role)) {
      throw new ForbiddenError('Only the team owner or captain can cancel invitations');
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.teamId !== teamId) {
      throw new NotFoundError('Invitation not found for this squad');
    }

    if (invitation.status !== 'PENDING') {
      throw new ValidationError(`Cannot cancel invitation with status '${invitation.status}'`);
    }

    return prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Get all pending invitations received by the current user
   */
  async getMyInvitations(userId) {
    return prisma.teamInvitation.findMany({
      where: {
        inviteeId: userId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            maxMembers: true,
            primaryGame: true,
            _count: {
              select: { memberships: { where: { status: 'ACTIVE' } } },
            },
          },
        },
        inviter: {
          select: {
            username: true,
            gamerProfile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Respond to invitation (ACCEPT / REJECT)
   * With atomic capacity check inside transaction to prevent concurrent overfilling!
   */
  async respondToInvitation(invitationId, userId, action) {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { team: true },
    });

    if (!invitation || invitation.inviteeId !== userId) {
      throw new NotFoundError('Invitation not found or does not belong to your account');
    }

    if (invitation.status !== 'PENDING' || new Date() > new Date(invitation.expiresAt)) {
      throw new ValidationError('This invitation is no longer active or has expired');
    }

    if (action === 'REJECT') {
      return prisma.teamInvitation.update({
        where: { id: invitationId },
        data: { status: 'REJECTED' },
      });
    }

    // ACCEPT: atomic transaction with capacity enforcement
    return prisma.$transaction(async (tx) => {
      // 1. Fetch team with lock/current state
      const team = await tx.team.findUnique({
        where: { id: invitation.teamId },
      });

      if (!team || team.status !== 'ACTIVE') {
        throw new ValidationError('This team is no longer active');
      }

      // 2. Count current active members
      const activeCount = await tx.teamMembership.count({
        where: { teamId: invitation.teamId, status: 'ACTIVE' },
      });

      const maxAllowed = team.maxMembers || 4;
      if (activeCount >= maxAllowed) {
        throw new ConflictError(
          `Cannot join team: Squad is already at full capacity (${activeCount}/${maxAllowed} members).`
        );
      }

      // 3. Mark invitation accepted
      await tx.teamInvitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' },
      });

      // 4. Upsert membership to active
      await tx.teamMembership.upsert({
        where: { teamId_userId: { teamId: invitation.teamId, userId } },
        create: {
          id: generateUuid(),
          teamId: invitation.teamId,
          userId,
          role: invitation.role || 'PLAYER',
          status: 'ACTIVE',
        },
        update: {
          role: invitation.role || 'PLAYER',
          status: 'ACTIVE',
          leftAt: null,
        },
      });

      // 5. Record roster history
      await tx.teamRosterHistory.create({
        data: {
          id: generateUuid(),
          teamId: invitation.teamId,
          userId,
          action: 'JOINED_VIA_INVITE',
          newRole: invitation.role || 'PLAYER',
          changedById: userId,
        },
      });

      // 6. Notify team owner
      try {
        await notificationService.notifyUser({
          recipientId: invitation.inviterId,
          type: 'TEAM_INVITE_ACCEPTED',
          title: 'Squad Invite Accepted',
          message: `A player accepted your invitation to join ${team.name}.`,
          payload: { teamId: invitation.teamId, userId },
        });
      } catch (err) {
        console.error('Failed to notify team leader:', err);
      }

      return { success: true, teamId: team.id };
    });
  }

  /**
   * Remove member or Leave team
   */
  async removeMember(teamId, actorId, targetUserId) {
    const isSelf = actorId === targetUserId;

    const [actorMembership, targetMembership, team] = await Promise.all([
      prisma.teamMembership.findUnique({ where: { teamId_userId: { teamId, userId: actorId } } }),
      prisma.teamMembership.findUnique({ where: { teamId_userId: { teamId, userId: targetUserId } } }),
      prisma.team.findUnique({ where: { id: teamId } }),
    ]);

    if (!targetMembership || targetMembership.status !== 'ACTIVE') {
      throw new NotFoundError('Member is not active on this team');
    }

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Owner leaving logic
    if (isSelf && targetMembership.role === 'OWNER') {
      const activeMembersCount = await prisma.teamMembership.count({
        where: { teamId, status: 'ACTIVE' },
      });

      if (activeMembersCount > 1) {
        throw new ForbiddenError(
          'As the team owner, you must transfer ownership to another member before leaving the squad.'
        );
      }
      // If owner is sole member, leaving marks team INACTIVE/disbanded
      return prisma.$transaction([
        prisma.teamMembership.update({
          where: { teamId_userId: { teamId, userId: targetUserId } },
          data: { status: 'FORMER', leftAt: new Date() },
        }),
        prisma.team.update({
          where: { id: teamId },
          data: { status: 'DISBANDED' },
        }),
        prisma.teamRosterHistory.create({
          data: {
            id: generateUuid(),
            teamId,
            userId: targetUserId,
            action: 'DISBANDED_TEAM',
            oldRole: targetMembership.role,
            changedById: actorId,
          },
        }),
      ]);
    }

    // Removing another member
    if (!isSelf) {
      if (!actorMembership || !['OWNER', 'CAPTAIN'].includes(actorMembership.role)) {
        throw new ForbiddenError('Only the team owner or captain can remove squad members');
      }
      if (targetMembership.role === 'OWNER') {
        throw new ForbiddenError('Cannot remove the team owner from the squad');
      }
    }

    return prisma.$transaction([
      prisma.teamMembership.update({
        where: { teamId_userId: { teamId, userId: targetUserId } },
        data: { status: 'FORMER', leftAt: new Date() },
      }),
      prisma.teamRosterHistory.create({
        data: {
          id: generateUuid(),
          teamId,
          userId: targetUserId,
          action: isSelf ? 'LEFT_TEAM' : 'REMOVED_BY_LEADER',
          oldRole: targetMembership.role,
          changedById: actorId,
        },
      }),
    ]);
  }

  /**
   * Transfer Ownership
   */
  async transferOwnership(teamId, currentOwnerId, newOwnerUserId) {
    if (currentOwnerId === newOwnerUserId) {
      throw new ValidationError('You are already the owner of this team');
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    if (team.ownerId !== currentOwnerId) {
      throw new ForbiddenError('Only the team owner can transfer ownership');
    }

    const newOwnerMembership = await prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId: newOwnerUserId } },
    });

    if (!newOwnerMembership || newOwnerMembership.status !== 'ACTIVE') {
      throw new ValidationError('New owner must be an active confirmed member of this squad');
    }

    return prisma.$transaction([
      // Update team owner
      prisma.team.update({
        where: { id: teamId },
        data: { ownerId: newOwnerUserId },
      }),
      // Downgrade old owner to CAPTAIN
      prisma.teamMembership.update({
        where: { teamId_userId: { teamId, userId: currentOwnerId } },
        data: { role: 'CAPTAIN' },
      }),
      // Upgrade new owner to OWNER
      prisma.teamMembership.update({
        where: { teamId_userId: { teamId, userId: newOwnerUserId } },
        data: { role: 'OWNER' },
      }),
      // Record history
      prisma.teamRosterHistory.create({
        data: {
          id: generateUuid(),
          teamId,
          userId: newOwnerUserId,
          action: 'OWNERSHIP_TRANSFERRED',
          oldRole: newOwnerMembership.role,
          newRole: 'OWNER',
          changedById: currentOwnerId,
        },
      }),
    ]);
  }

  /**
   * Delete Team (Owner only)
   */
  async deleteTeam(teamId, userId) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    if (team.ownerId !== userId) {
      throw new ForbiddenError('Only the team owner can delete this squad');
    }

    // Check if team is in an active/live tournament
    const activeReg = await prisma.tournamentRegistration.findFirst({
      where: {
        teamId,
        tournament: {
          status: { in: ['LIVE', 'ONGOING', 'IN_PROGRESS'] },
        },
      },
      include: { tournament: { select: { name: true } } },
    });

    if (activeReg) {
      throw new ConflictError(
        `Cannot delete squad while participating in live tournament "${activeReg.tournament.name}".`
      );
    }

    return prisma.$transaction(async (tx) => {
      // 1. Delete invitations
      await tx.teamInvitation.deleteMany({ where: { teamId } });
      // 2. Delete roster history
      await tx.teamRosterHistory.deleteMany({ where: { teamId } });
      // 3. Delete memberships
      await tx.teamMembership.deleteMany({ where: { teamId } });
      // 4. Detach from registrations (or nullify)
      await tx.tournamentRegistration.updateMany({
        where: { teamId },
        data: { teamId: null },
      });
      // 5. Delete team
      await tx.team.delete({ where: { id: teamId } });
      return { success: true, deletedTeamId: teamId };
    });
  }
}

export const teamsService = new TeamsService();
