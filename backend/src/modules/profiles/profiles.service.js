import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors.js';

export class ProfilesService {
  /**
   * Calculate profile completeness percentage.
   */
  calculateCompletion(profile, identities = []) {
    let score = 20; // base registered
    if (profile.displayName) score += 15;
    if (profile.bio) score += 10;
    if (profile.avatarUrl) score += 15;
    if (profile.country) score += 10;
    if (profile.primaryGameId) score += 10;
    if (profile.socialLinks && Object.keys(profile.socialLinks).length > 0) score += 10;
    if (identities.length > 0) score += 10;
    return Math.min(score, 100);
  }

  async getMyProfile(userId) {
    const profile = await prisma.gamerProfile.findUnique({
      where: { userId },
      include: {
        gameIdentities: {
          include: { game: true },
        },
        user: {
          select: { id: true, email: true, username: true, createdAt: true },
        },
      },
    });

    if (!profile) return null;

    const completeness = this.calculateCompletion(profile, profile.gameIdentities);
    return { ...profile, completeness };
  }

  async upsertProfile(userId, data) {
    // Check slug collision
    const existingSlug = await prisma.gamerProfile.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug && existingSlug.userId !== userId) {
      throw new ConflictError(`The profile slug '${data.slug}' is already taken.`);
    }

    const profile = await prisma.gamerProfile.upsert({
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
        gameIdentities: {
          include: { game: true },
        },
      },
    });

    const completeness = this.calculateCompletion(profile, profile.gameIdentities);
    return { ...profile, completeness };
  }

  async getPublicProfile(slug) {
    const profile = await prisma.gamerProfile.findUnique({
      where: { slug },
      include: {
        gameIdentities: {
          include: { game: true },
        },
        achievements: {
          orderBy: { awardedAt: 'desc' },
          include: {
            game: true,
            tournament: { select: { id: true, name: true, slug: true } },
            team: { select: { id: true, name: true, slug: true } },
          },
        },
        careerRecords: {
          orderBy: { createdAt: 'desc' },
          include: {
            tournament: { select: { id: true, name: true, slug: true, status: true, startDate: true } },
            game: true,
          },
        },
        statistics: {
          include: { game: true },
        },
        user: {
          select: { username: true, createdAt: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundError(`Gamer profile '${slug}' not found`);
    }

    if (profile.visibility === 'PRIVATE') {
      throw new ForbiddenError('This profile is set to private');
    }

    const completeness = this.calculateCompletion(profile, profile.gameIdentities);
    return { ...profile, completeness };
  }

  async addOrUpdateGameIdentity(userId, identityData) {
    const profile = await prisma.gamerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundError('Please create your gamer profile first.');
    }

    // If marked primary, unset other primary game identities
    if (identityData.isPrimary) {
      await prisma.gamerGameIdentity.updateMany({
        where: { profileId: profile.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return prisma.gamerGameIdentity.upsert({
      where: {
        profileId_gameId: {
          profileId: profile.id,
          gameId: identityData.gameId,
        },
      },
      create: {
        id: generateUuid(),
        profileId: profile.id,
        ...identityData,
      },
      update: {
        ...identityData,
      },
      include: { game: true },
    });
  }

  async removeGameIdentity(userId, gameId) {
    const profile = await prisma.gamerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundError('Gamer profile not found');
    }

    return prisma.gamerGameIdentity.deleteMany({
      where: {
        profileId: profile.id,
        gameId,
      },
    });
  }
}

export const profilesService = new ProfilesService();

