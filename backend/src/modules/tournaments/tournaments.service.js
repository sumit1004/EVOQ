import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors.js';

export class TournamentsService {
  /**
   * Public discovery with filters and pagination
   */
  async listTournaments(query = {}) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 12;
    const skip = (page - 1) * pageSize;

    const where = {};
    if (query.visibility) {
      where.visibility = query.visibility;
    } else {
      where.visibility = 'PUBLIC';
    }

    if (query.gameId) where.gameId = query.gameId;
    if (query.status) where.status = query.status;
    if (query.format) where.format = query.format;
    if (query.participationType) where.participationType = query.participationType;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
        { slug: { contains: query.search } },
      ];
    }

    const orderBy = { [query.sortBy || 'startDate']: query.sortOrder || 'asc' };

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        include: {
          game: true,
          organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
          organizerUser: { select: { id: true, username: true } },
          _count: {
            select: {
              registrations: { where: { status: 'APPROVED' } },
              matches: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy,
      }),
      prisma.tournament.count({ where }),
    ]);

    return {
      tournaments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * Get tournament details by ID
   */
  async getTournamentById(id) {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        game: true,
        organization: true,
        organizerUser: {
          select: { id: true, username: true, organizerProfile: true },
        },
        staffGrants: {
          include: { user: { select: { id: true, username: true } } },
        },
        stages: {
          orderBy: { sequence: 'asc' },
          include: {
            rounds: {
              orderBy: { sequence: 'asc' },
            },
            groups: {
              orderBy: { sequence: 'asc' },
            },
          },
        },
        _count: {
          select: {
            registrations: true,
            matches: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundError(`Tournament with ID '${id}' not found`);
    }

    return tournament;
  }

  /**
   * Get public tournament details by slug
   */
  async getTournamentBySlug(slug, currentUserId = null) {
    const tournament = await prisma.tournament.findUnique({
      where: { slug },
      include: {
        game: true,
        organization: true,
        organizerUser: {
          select: { id: true, username: true, organizerProfile: true },
        },
        staffGrants: {
          include: { user: { select: { id: true, username: true } } },
        },
        stages: {
          orderBy: { sequence: 'asc' },
          include: {
            rounds: {
              orderBy: { sequence: 'asc' },
            },
            groups: {
              orderBy: { sequence: 'asc' },
            },
          },
        },
        _count: {
          select: {
            registrations: true,
            matches: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundError(`Tournament '${slug}' not found`);
    }

    // Check user's own registration status if authenticated
    let myRegistration = null;
    if (currentUserId) {
      myRegistration = await prisma.tournamentRegistration.findFirst({
        where: {
          tournamentId: tournament.id,
          registeredById: currentUserId,
        },
        include: {
          team: { select: { id: true, name: true, slug: true } },
          members: {
            include: {
              gamerProfile: { select: { displayName: true, inGameName: true } },
            },
          },
        },
      });
    }

    return { ...tournament, myRegistration };
  }

  /**
   * Create tournament (Organizer wizard)
   */
  async createTournament(userId, data) {
    // Validate registration and start dates
    const regStart = new Date(data.registrationStart);
    const regEnd = new Date(data.registrationDeadline);
    const start = new Date(data.startDate);

    if (regStart >= regEnd) {
      throw new ValidationError('Registration start must precede registration deadline');
    }
    if (regEnd > start) {
      throw new ValidationError('Registration deadline must precede tournament start date');
    }

    const existingSlug = await prisma.tournament.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      throw new ConflictError(`Tournament slug '${data.slug}' already exists`);
    }

    // If organization provided, ensure user has owner/admin/manager rights in it
    if (data.organizationId) {
      const orgMembership = await prisma.organizationMembership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: data.organizationId,
            userId,
          },
        },
      });
      if (!orgMembership || !['OWNER', 'ADMIN', 'MANAGER', 'TOURNAMENT_ADMIN'].includes(orgMembership.role)) {
        throw new ForbiddenError('You do not have organizer privileges in this organization');
      }
    }

    const tournamentId = generateUuid();
    const isMultiStage = ['GROUP_STAGE_FINALS', 'GROUP_STAGE_KNOCKOUT'].includes(data.format);

    return prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.create({
        data: {
          id: tournamentId,
          organizerUserId: userId,
          status: 'DRAFT',
          ...data,
        },
      });

      // Default primary stage
      await tx.tournamentStage.create({
        data: {
          id: generateUuid(),
          tournamentId,
          name: isMultiStage ? 'Group Stage' : (data.format === 'GROUP_STAGE' ? 'Group Stage' : 'Main Stage'),
          stageType: (data.format === 'GROUP_STAGE' || isMultiStage) ? 'GROUP' : 'BRACKET',
          sequence: 1,
          status: 'UPCOMING',
        },
      });

      // Second stage for finals if multi-stage
      if (isMultiStage) {
        await tx.tournamentStage.create({
          data: {
            id: generateUuid(),
            tournamentId,
            name: 'Grand Finals',
            stageType: data.format === 'GROUP_STAGE_KNOCKOUT' ? 'BRACKET' : 'FINALS',
            sequence: 2,
            status: 'UPCOMING',
          },
        });
      }

      // Add organizer as admin staff
      await tx.tournamentStaff.create({
        data: {
          id: generateUuid(),
          tournamentId,
          userId,
          role: 'ADMIN',
          permissions: { all: true },
        },
      });

      return tournament;
    });
  }

  /**
   * Update tournament settings
   */
  async updateTournament(tournamentId, userId, updateData) {
    const tournament = await this.assertOrganizerPermission(tournamentId, userId);

    if (['COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(tournament.status)) {
      throw new ValidationError(`Cannot modify a tournament in ${tournament.status} state`);
    }

    return prisma.tournament.update({
      where: { id: tournamentId },
      data: updateData,
    });
  }

  /**
   * State transitions
   */
  async updateStatus(tournamentId, userId, newStatus) {
    const tournament = await this.assertOrganizerPermission(tournamentId, userId);

    // Lifecycle validation rules
    const validTransitions = {
      DRAFT: ['PUBLISHED', 'REGISTRATION_OPEN', 'CANCELLED'],
      PUBLISHED: ['REGISTRATION_OPEN', 'CANCELLED', 'DRAFT'],
      REGISTRATION_OPEN: ['REGISTRATION_CLOSED', 'ONGOING', 'CANCELLED'],
      REGISTRATION_CLOSED: ['ONGOING', 'REGISTRATION_OPEN', 'CANCELLED'],
      ONGOING: ['COMPLETED', 'CANCELLED'],
      COMPLETED: ['ARCHIVED'],
      CANCELLED: ['ARCHIVED'],
      ARCHIVED: [],
    };

    const allowed = validTransitions[tournament.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from ${tournament.status} to ${newStatus}`
      );
    }

    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: newStatus },
    });

    // If completed, trigger portfolio record generation for organizer & org
    if (newStatus === 'COMPLETED') {
      const approvedCount = await prisma.tournamentRegistration.count({
        where: { tournamentId, status: 'APPROVED' },
      });
      const completedMatchCount = await prisma.match.count({
        where: { tournamentId, status: 'COMPLETED' },
      });

      await prisma.organizerPortfolioRecord.upsert({
        where: { id: tournamentId }, // using tournamentId as id for deterministic record
        create: {
          id: tournamentId,
          organizerProfileId: null, // will link if organizer has profile
          organizationId: tournament.organizationId,
          tournamentId,
          title: tournament.name,
          gameName: null,
          participantCount: approvedCount,
          completedMatches: completedMatchCount,
          startDate: tournament.startDate,
          endDate: tournament.endDate || new Date(),
          isVerified: true,
          sourceType: 'EVOQ_EVENT',
        },
        update: {
          participantCount: approvedCount,
          completedMatches: completedMatchCount,
        },
      });
    }

    return updated;
  }

  /**
   * Operational dashboard metrics for organizers
   */
  async getOrganizerDashboard(userId) {
    const tournaments = await prisma.tournament.findMany({
      where: {
        OR: [
          { organizerUserId: userId },
          { staffGrants: { some: { userId } } },
          { organization: { memberships: { some: { userId } } } },
        ],
      },
      include: {
        game: true,
        _count: {
          select: {
            registrations: true,
            matches: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingRegistrationsCount = await prisma.tournamentRegistration.count({
      where: {
        status: 'PENDING',
        tournament: {
          OR: [
            { organizerUserId: userId },
            { staffGrants: { some: { userId } } },
          ],
        },
      },
    });

    const upcomingMatches = await prisma.match.findMany({
      where: {
        status: { in: ['SCHEDULED', 'READY', 'LIVE'] },
        tournament: {
          OR: [
            { organizerUserId: userId },
            { staffGrants: { some: { userId } } },
          ],
        },
      },
      include: {
        tournament: { select: { name: true, slug: true } },
        participants: {
          include: {
            registration: {
              include: { team: true, gamerProfile: true },
            },
          },
        },
      },
      orderBy: { scheduledTime: 'asc' },
      take: 5,
    });

    const metrics = {
      totalTournaments: tournaments.length,
      draft: tournaments.filter((t) => t.status === 'DRAFT').length,
      published: tournaments.filter((t) => ['PUBLISHED', 'REGISTRATION_OPEN'].includes(t.status)).length,
      ongoing: tournaments.filter((t) => t.status === 'ONGOING').length,
      completed: tournaments.filter((t) => t.status === 'COMPLETED').length,
      pendingRegistrations: pendingRegistrationsCount,
      tournaments,
      upcomingMatches,
    };

    return metrics;
  }

  /**
   * Helper: ensure user has rights to manage tournament
   */
  async assertOrganizerPermission(tournamentId, userId) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        staffGrants: true,
        organization: { include: { memberships: true } },
      },
    });

    if (!tournament) {
      throw new NotFoundError('Tournament not found');
    }

    if (tournament.organizerUserId === userId) return tournament;

    // Check staff
    const staff = tournament.staffGrants.find((s) => s.userId === userId);
    if (staff && ['ADMIN', 'MANAGER'].includes(staff.role)) return tournament;

    // Check organization
    if (tournament.organization) {
      const orgMem = tournament.organization.memberships.find((m) => m.userId === userId);
      if (orgMem && ['OWNER', 'ADMIN', 'TOURNAMENT_ADMIN'].includes(orgMem.role)) {
        return tournament;
      }
    }

    throw new ForbiddenError('You do not have permission to manage this tournament');
  }
}

export const tournamentsService = new TournamentsService();

