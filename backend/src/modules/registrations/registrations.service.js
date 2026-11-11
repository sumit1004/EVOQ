import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { notificationService } from '../../services/notification.service.js';
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors.js';

export class RegistrationsService {
  /**
   * Register a user or team for a tournament
   */
  async registerForTournament(tournamentId, userId, { entrantType, teamId, selectedRosterMemberIds }) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        _count: {
          select: { registrations: { where: { status: 'APPROVED' } } },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundError('Tournament not found');
    }

    if (!['PUBLISHED', 'REGISTRATION_OPEN'].includes(tournament.status)) {
      throw new ValidationError(`Registrations are currently closed for this tournament (Status: ${tournament.status})`);
    }

    const now = new Date();
    if (now > new Date(tournament.registrationDeadline)) {
      throw new ValidationError('Registration deadline has passed');
    }

    // Check capacity
    const isFull = tournament._count.registrations >= tournament.maxParticipants;
    const initialStatus = isFull ? 'WAITLISTED' : 'PENDING';

    // 1. INDIVIDUAL REGISTRATION
    if (entrantType === 'INDIVIDUAL') {
      const gamerProfile = await prisma.gamerProfile.findUnique({
        where: { userId },
      });
      if (!gamerProfile) {
        throw new ValidationError('You must create a gamer profile before registering for tournaments.');
      }

      // Check duplicate
      const existing = await prisma.tournamentRegistration.findUnique({
        where: {
          tournamentId_gamerProfileId: {
            tournamentId,
            gamerProfileId: gamerProfile.id,
          },
        },
      });

      if (existing) {
        if (existing.status === 'WITHDRAWN') {
          return prisma.tournamentRegistration.update({
            where: { id: existing.id },
            data: { status: initialStatus, registeredAt: new Date() },
          });
        }
        throw new ConflictError('You have already registered for this tournament');
      }

      const registrationId = generateUuid();
      const [registration] = await prisma.$transaction([
        prisma.tournamentRegistration.create({
          data: {
            id: registrationId,
            tournamentId,
            entrantType: 'INDIVIDUAL',
            gamerProfileId: gamerProfile.id,
            registeredById: userId,
            status: initialStatus,
          },
        }),
        prisma.registrationMember.create({
          data: {
            id: generateUuid(),
            registrationId,
            gamerProfileId: gamerProfile.id,
            role: 'STARTER',
            inGameName: gamerProfile.inGameName,
          },
        }),
      ]);

      return registration;
    }

    // 2. TEAM REGISTRATION
    if (!teamId) {
      throw new ValidationError('teamId is required for team registration');
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              include: { gamerProfile: true },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Verify game compatibility
    if (tournament.gameId && team.primaryGameId && team.primaryGameId !== tournament.gameId) {
      throw new ValidationError(`This team is configured for a different game than this tournament.`);
    }

    // Verify user is team captain or owner
    const myMembership = team.memberships.find((m) => m.userId === userId);
    if (!myMembership || !['OWNER', 'CAPTAIN'].includes(myMembership.role)) {
      throw new ForbiddenError('Only the team captain or owner can register the team');
    }

    // Check duplicate team registration
    const existingTeamReg = await prisma.tournamentRegistration.findUnique({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId,
        },
      },
    });

    if (existingTeamReg) {
      if (existingTeamReg.status === 'WITHDRAWN') {
        return prisma.tournamentRegistration.update({
          where: { id: existingTeamReg.id },
          data: { status: initialStatus, registeredAt: new Date() },
        });
      }
      throw new ConflictError('This team is already registered for this tournament');
    }

    // Check minimum team roster size
    const availableProfiles = team.memberships
      .map((m) => m.user?.gamerProfile)
      .filter(Boolean);

    if (availableProfiles.length < tournament.teamSize) {
      throw new ValidationError(
        `Team requires at least ${tournament.teamSize} member(s) with completed gamer profiles. Current: ${availableProfiles.length}`
      );
    }

    // Determine roster snapshot members
    const membersToSnapshot = selectedRosterMemberIds?.length
      ? availableProfiles.filter((p) => selectedRosterMemberIds.includes(p.id))
      : availableProfiles.slice(0, tournament.teamSize + 2); // Starters + up to 2 subs

    const registrationId = generateUuid();

    const [registration] = await prisma.$transaction([
      prisma.tournamentRegistration.create({
        data: {
          id: registrationId,
          tournamentId,
          entrantType: 'TEAM',
          teamId,
          registeredById: userId,
          status: initialStatus,
        },
      }),
      prisma.registrationMember.createMany({
        data: membersToSnapshot.map((profile, idx) => ({
          id: generateUuid(),
          registrationId,
          gamerProfileId: profile.id,
          role: idx < tournament.teamSize ? 'STARTER' : 'SUBSTITUTE',
          inGameName: profile.inGameName,
        })),
      }),
    ]);

    return registration;
  }

  /**
   * List all registrations for a tournament
   */
  async listRegistrations(tournamentId, statusFilter = null) {
    const where = { tournamentId };
    if (statusFilter) where.status = statusFilter;

    return prisma.tournamentRegistration.findMany({
      where,
      include: {
        gamerProfile: {
          select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true },
        },
        team: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        members: {
          include: {
            gamerProfile: { select: { displayName: true, inGameName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });
  }

  /**
   * Organizer approves, rejects or waitlists registration
   */
  async updateStatus(tournamentId, registrationId, actorId, { status, seed }) {
    // Check permission
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { staffGrants: true, organization: { include: { memberships: true } } },
    });

    if (!tournament) throw new NotFoundError('Tournament not found');

    const isOwner = tournament.organizerUserId === actorId;
    const isStaff = tournament.staffGrants.some((s) => s.userId === actorId && ['ADMIN', 'MANAGER'].includes(s.role));
    const isOrgAdmin = tournament.organization?.memberships.some((m) => m.userId === actorId && ['OWNER', 'ADMIN'].includes(m.role));

    if (!isOwner && !isStaff && !isOrgAdmin) {
      throw new ForbiddenError('You do not have permission to manage tournament registrations');
    }

    const reg = await prisma.tournamentRegistration.findUnique({
      where: { id: registrationId },
      include: { team: true, gamerProfile: true },
    });

    if (!reg) throw new NotFoundError('Registration not found');

    const updated = await prisma.tournamentRegistration.update({
      where: { id: registrationId },
      data: {
        status,
        ...(seed !== undefined ? { seed } : {}),
      },
    });

    // Notify registered user
    const recipientName = reg.team?.name || reg.gamerProfile?.displayName || 'Your registration';
    await notificationService.notifyUser({
      recipientId: reg.registeredById,
      type: 'TOURNAMENT_UPDATE',
      title: `Registration ${status}`,
      message: `${recipientName} registration for ${tournament.name} has been updated to ${status}.`,
      payload: { tournamentId, tournamentSlug: tournament.slug, status },
    });

    return updated;
  }

  async getEligibleTeams(tournamentId, userId) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { game: true },
    });

    if (!tournament) {
      throw new NotFoundError('Tournament not found');
    }

    // Find all teams where user is an active member
    const memberships = await prisma.teamMembership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        team: {
          include: {
            primaryGame: true,
            memberships: {
              where: { status: 'ACTIVE' },
              include: {
                user: {
                  include: { gamerProfile: true },
                },
              },
            },
            registrations: {
              where: { tournamentId },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => {
      const team = m.team;
      const gameMatches = !tournament.gameId || !team.primaryGameId || team.primaryGameId === tournament.gameId;
      const confirmedMembers = team.memberships || [];
      const meetsSize = confirmedMembers.length >= (tournament.teamSize || 1);
      const isCaptainOrOwner = ['OWNER', 'CAPTAIN'].includes(m.role);
      const existingRegistration = team.registrations?.[0] || null;
      const isRegistered = !!existingRegistration && existingRegistration.status !== 'WITHDRAWN';

      let eligibilityReason = 'Eligible';
      let isEligible = true;

      if (!isCaptainOrOwner) {
        isEligible = false;
        eligibilityReason = 'Only Team Captain or Owner can register';
      } else if (!gameMatches) {
        isEligible = false;
        eligibilityReason = `Team game (${team.primaryGame?.name || 'Unknown'}) does not match tournament game (${tournament.game?.name || 'Any'})`;
      } else if (!meetsSize) {
        isEligible = false;
        eligibilityReason = `Team has ${confirmedMembers.length} member(s), but tournament requires at least ${tournament.teamSize}`;
      } else if (isRegistered) {
        isEligible = false;
        eligibilityReason = `Already registered (${existingRegistration.status})`;
      }

      return {
        id: team.id,
        name: team.name,
        slug: team.slug,
        logoUrl: team.logoUrl,
        primaryGame: team.primaryGame,
        myRole: m.role,
        membersCount: confirmedMembers.length,
        requiredSize: tournament.teamSize,
        members: confirmedMembers.map((cm) => ({
          userId: cm.userId,
          role: cm.role,
          displayName: cm.user?.gamerProfile?.displayName || cm.user?.username,
          avatarUrl: cm.user?.gamerProfile?.avatarUrl,
          evoqId: cm.user?.gamerProfile?.evoqId,
          inGameName: cm.user?.gamerProfile?.inGameName,
        })),
        isEligible,
        eligibilityReason,
        isRegistered,
        existingRegistrationStatus: existingRegistration?.status || null,
      };
    });
  }

  /**
   * Participant withdraws registration
   */
  async withdraw(tournamentId, userId) {
    const reg = await prisma.tournamentRegistration.findFirst({
      where: { tournamentId, registeredById: userId },
    });

    if (!reg) {
      throw new NotFoundError('Registration not found');
    }

    return prisma.tournamentRegistration.update({
      where: { id: reg.id },
      data: { status: 'WITHDRAWN' },
    });
  }
}

export const registrationsService = new RegistrationsService();

