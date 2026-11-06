import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';

export class OrganizersService {
  async getMyProfile(userId) {
    return prisma.organizerProfile.findUnique({
      where: { userId },
      include: {
        portfolioRecords: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async upsertProfile(userId, data) {
    const existingSlug = await prisma.organizerProfile.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug && existingSlug.userId !== userId) {
      throw new ConflictError(`Organizer slug '${data.slug}' is already taken`);
    }

    return prisma.organizerProfile.upsert({
      where: { userId },
      create: {
        id: generateUuid(),
        userId,
        ...data,
      },
      update: {
        ...data,
      },
      include: {
        portfolioRecords: true,
      },
    });
  }

  async getPublicProfile(slug) {
    const organizer = await prisma.organizerProfile.findUnique({
      where: { slug },
      include: {
        user: { select: { id: true, username: true, createdAt: true } },
        portfolioRecords: {
          orderBy: { createdAt: 'desc' },
          include: {
            tournament: {
              select: { id: true, name: true, slug: true, status: true, startDate: true },
            },
          },
        },
      },
    });

    if (!organizer) {
      throw new NotFoundError(`Organizer '${slug}' not found`);
    }

    // Calculate real credibility metrics from database
    const tournaments = await prisma.tournament.findMany({
      where: { organizerUserId: organizer.userId },
      include: {
        _count: {
          select: {
            registrations: { where: { status: 'APPROVED' } },
            matches: { where: { status: 'COMPLETED' } },
          },
        },
      },
    });

    const totalTournaments = tournaments.length;
    const completedTournaments = tournaments.filter((t) => t.status === 'COMPLETED').length;
    const approvedParticipants = tournaments.reduce((acc, t) => acc + (t._count?.registrations || 0), 0);
    const completedMatches = tournaments.reduce((acc, t) => acc + (t._count?.matches || 0), 0);

    const credibility = {
      totalTournaments,
      completedTournaments,
      approvedParticipants,
      completedMatches,
      verifiedStatus: organizer.verificationStatus,
      memberSince: organizer.createdAt,
    };

    return { ...organizer, credibility };
  }
}

export const organizersService = new OrganizersService();

