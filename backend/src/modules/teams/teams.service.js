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
          select: { memberships: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

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
            },
            _count: { select: { memberships: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.team,
      myRole: m.role,
      joinedAt: m.joinedAt,
      membersCount: m.team.memberships?.length || m.team._count?.memberships || 1,
    }));
  }

  async createTeam(userId, data) {
    const existing = await prisma.team.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new ConflictError(`Team slug '${data.slug}' is already taken`);
    }

    const teamId = generateUuid();

    const [team] = await prisma.$transaction([
      prisma.team.create({
        data: {
          id: teamId,
          ownerId: userId,
          captainId: userId,
          ...data,
        },
      }),
      prisma.teamMembership.create({
        data: {
          id: generateUuid(),
          teamId,
          userId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      }),
      prisma.teamRosterHistory.create({
        data: {
          id: generateUuid(),
          teamId,
          userId,
          action: 'CREATED_TEAM',
          newRole: 'OWNER',
          changedById: userId,
        },
      }),
    ]);

    return team;
  }

  async getTeamBySlug(slug) {
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
                  select: { id: true, displayName: true, avatarUrl: true, inGameName: true, slug: true },
                },
              },
            },
          },
          orderBy: { role: 'asc' },
        },
        rosterHistory: {
          take: 20,
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

    return team;
  }

  async updateTeam(teamId, userId, updateData) {
    const membership = await prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    if (!membership || !['OWNER', 'CAPTAIN'].includes(membership.role)) {
      throw new ForbiddenError('Only the team owner or captain can modify team settings');
    }

    return prisma.team.update({
      where: { id: teamId },
      data: updateData,
    });
  }

  async inviteMember(teamId, inviterId, { evoqId, usernameOrEmail, role }) {
    const inviterMembership = await prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId: inviterId } },
    });

    if (!inviterMembership || !['OWNER', 'CAPTAIN', 'MANAGER'].includes(inviterMembership.role)) {
      throw new ForbiddenError('Only team leadership can invite players');
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { primaryGame: true },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    let invitee = null;
    let inviteeProfile = null;

    if (evoqId) {
      const normalizedEvoqId = evoqId.trim().toUpperCase();
      inviteeProfile = await prisma.gamerProfile.findUnique({
        where: { evoqId: normalizedEvoqId },
        include: {
          user: true,
          gameIdentities: true,
        },
      });

      if (!inviteeProfile) {
        throw new NotFoundError(`Gamer with EVOQ ID '${normalizedEvoqId}' not found`);
      }
      invitee = inviteeProfile.user;
    } else if (usernameOrEmail) {
      invitee = await prisma.user.findFirst({
        where: {
          OR: [
            { email: usernameOrEmail.toLowerCase() },
            { username: usernameOrEmail },
          ],
        },
        include: {
          gamerProfile: {
            include: { gameIdentities: true },
          },
        },
      });

      if (!invitee) {
        throw new NotFoundError(`User '${usernameOrEmail}' not found`);
      }
      inviteeProfile = invitee.gamerProfile;
    }

    if (!invitee) {
      throw new ValidationError('Please provide a valid EVOQ ID or Username/Email');
    }

    // Cannot invite yourself
    if (invitee.id === inviterId) {
      throw new ValidationError('You are already the creator/captain of this team');
    }

    // Check existing active membership
    const existingMember = await prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId: invitee.id } },
    });
    if (existingMember && existingMember.status === 'ACTIVE') {
      throw new ConflictError('Player is already an active member of this team');
    }

    // Check pending invitation
    const existingInvite = await prisma.teamInvitation.findFirst({
      where: { teamId, inviteeId: invitee.id, status: 'PENDING' },
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
        expiresAt,
      },
    });

    // Send notification to invitee
    await notificationService.notifyUser({
      recipientId: invitee.id,
      type: 'TEAM_INVITE',
      title: 'Team Invitation',
      message: `You have been invited to join ${team.name} as a ${role || 'PLAYER'}.`,
      payload: { teamId, teamSlug: team.slug, invitationId: invitation.id },
    });

    return invitation;
  }

  async getMyInvitations(userId) {
    return prisma.teamInvitation.findMany({
      where: {
        inviteeId: userId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        team: {
          select: { id: true, name: true, slug: true, logoUrl: true, primaryGame: true },
        },
        inviter: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondToInvitation(invitationId, userId, action) {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { team: true },
    });

    if (!invitation || invitation.inviteeId !== userId) {
      throw new NotFoundError('Invitation not found');
    }

    if (invitation.status !== 'PENDING' || new Date() > new Date(invitation.expiresAt)) {
      throw new ValidationError('This invitation is no longer valid');
    }

    if (action === 'REJECT') {
      return prisma.teamInvitation.update({
        where: { id: invitationId },
        data: { status: 'REJECTED' },
      });
    }

    // ACCEPT: transaction
    return prisma.$transaction(async (tx) => {
      await tx.teamInvitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' },
      });

      await tx.teamMembership.upsert({
        where: { teamId_userId: { teamId: invitation.teamId, userId } },
        create: {
          id: generateUuid(),
          teamId: invitation.teamId,
          userId,
          role: invitation.role,
          status: 'ACTIVE',
        },
        update: {
          role: invitation.role,
          status: 'ACTIVE',
          leftAt: null,
        },
      });

      await tx.teamRosterHistory.create({
        data: {
          id: generateUuid(),
          teamId: invitation.teamId,
          userId,
          action: 'JOINED_VIA_INVITE',
          newRole: invitation.role,
          changedById: userId,
        },
      });

      await notificationService.notifyUser({
        recipientId: invitation.inviterId,
        type: 'TEAM_INVITE_ACCEPTED',
        title: 'Invitation Accepted',
        message: `Your invitation to join ${invitation.team.name} was accepted.`,
        payload: { teamId: invitation.teamId, userId },
      });
    });
  }

  async removeMember(teamId, actorId, targetUserId) {
    const isSelf = actorId === targetUserId;

    const [actorMembership, targetMembership] = await Promise.all([
      prisma.teamMembership.findUnique({ where: { teamId_userId: { teamId, userId: actorId } } }),
      prisma.teamMembership.findUnique({ where: { teamId_userId: { teamId, userId: targetUserId } } }),
    ]);

    if (!targetMembership || targetMembership.status !== 'ACTIVE') {
      throw new NotFoundError('Member not found on this team');
    }

    // If leaving self, cannot be the sole OWNER
    if (isSelf && targetMembership.role === 'OWNER') {
      const ownerCount = await prisma.teamMembership.count({
        where: { teamId, role: 'OWNER', status: 'ACTIVE' },
      });
      if (ownerCount <= 1) {
        throw new ForbiddenError('Team owner must transfer ownership before leaving the team');
      }
    } else if (!isSelf) {
      // Must be OWNER or CAPTAIN
      if (!actorMembership || !['OWNER', 'CAPTAIN'].includes(actorMembership.role)) {
        throw new ForbiddenError('Permission denied to remove team member');
      }
      if (targetMembership.role === 'OWNER') {
        throw new ForbiddenError('Cannot remove the team owner');
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
}

export const teamsService = new TeamsService();

