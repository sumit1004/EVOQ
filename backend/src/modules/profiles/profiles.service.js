import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { generateUniqueEvoqId } from '../../utils/evoqId.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors.js';

export class ProfilesService {
  /**
   * Calculate profile completeness percentage and readiness.
   */
  calculateCompletion(profile, identities = []) {
    let score = 20; // base registered user
    if (profile.displayName) score += 15;
    if (profile.bio) score += 5;
    if (profile.avatarUrl) score += 15;
    if (profile.phoneNumber) score += 10;
    if (profile.primaryGameId) score += 15;
    if (identities.length > 0 || profile.inGameName) score += 15;
    if (profile.socialLinks && Object.keys(profile.socialLinks).length > 0) score += 5;
    const completeness = Math.min(score, 100);
    const isComplete = completeness >= 75 && !!profile.displayName && !!profile.primaryGameId && (identities.length > 0 || !!profile.inGameName);
    return { completeness, isComplete };
  }

  async getMyProfile(userId) {
    let profile = await prisma.gamerProfile.findUnique({
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

    // Ensure profile has permanent EVOQ ID if it was created previously without one
    if (!profile.evoqId) {
      const generatedId = await generateUniqueEvoqId(prisma);
      profile = await prisma.gamerProfile.update({
        where: { id: profile.id },
        data: { evoqId: generatedId },
        include: {
          gameIdentities: {
            include: { game: true },
          },
          user: {
            select: { id: true, email: true, username: true, createdAt: true },
          },
        },
      });
    }

    const { completeness, isComplete } = this.calculateCompletion(profile, profile.gameIdentities);
    return { ...profile, completeness, isComplete };
  }

  async upsertProfile(userId, rawData) {
    const { gameIdentity, ...data } = rawData;

    // Check slug collision
    const existingSlug = await prisma.gamerProfile.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug && existingSlug.userId !== userId) {
      throw new ConflictError(`The profile slug '${data.slug}' is already taken.`);
    }

    // Check existing profile for permanent evoqId
    const existingProfile = await prisma.gamerProfile.findUnique({
      where: { userId },
      select: { id: true, evoqId: true },
    });

    let evoqId = existingProfile?.evoqId;
    if (!evoqId) {
      evoqId = await generateUniqueEvoqId(prisma);
    }

    // If gameIdentity provided, ensure primaryGameId is synced
    if (gameIdentity?.gameId && !data.primaryGameId) {
      data.primaryGameId = gameIdentity.gameId;
    }
    if (gameIdentity?.inGameName && !data.inGameName) {
      data.inGameName = gameIdentity.inGameName;
    }

    const profile = await prisma.gamerProfile.upsert({
      where: { userId },
      create: {
        id: generateUuid(),
        userId,
        evoqId,
        ...data,
      },
      update: {
        ...data,
        evoqId, // Preserve permanent EVOQ ID
      },
      include: {
        gameIdentities: {
          include: { game: true },
        },
        user: {
          select: { id: true, email: true, username: true, createdAt: true },
        },
      },
    });

    // If gameIdentity was provided with onboarding/profile save, upsert it
    if (gameIdentity?.gameId && gameIdentity?.inGameName) {
      await this.addOrUpdateGameIdentity(userId, {
        gameId: gameIdentity.gameId,
        inGameName: gameIdentity.inGameName,
        inGameUid: gameIdentity.inGameUid || null,
        tagline: gameIdentity.tagline || null,
        serverRegion: gameIdentity.serverRegion || null,
        competitiveRole: gameIdentity.competitiveRole || null,
        isPrimary: true,
      });
    }

    // Reload with fresh identities
    const finalProfile = await prisma.gamerProfile.findUnique({
      where: { id: profile.id },
      include: {
        gameIdentities: {
          include: { game: true },
        },
        user: {
          select: { id: true, email: true, username: true, createdAt: true },
        },
      },
    });

    const { completeness, isComplete } = this.calculateCompletion(finalProfile, finalProfile.gameIdentities);
    return { ...finalProfile, completeness, isComplete };
  }

  async lookupByEvoqId(evoqId) {
    if (!evoqId || typeof evoqId !== 'string') {
      throw new NotFoundError('Invalid EVOQ ID format');
    }

    const normalizedId = evoqId.trim().toUpperCase();

    const profile = await prisma.gamerProfile.findUnique({
      where: { evoqId: normalizedId },
      include: {
        gameIdentities: {
          include: { game: true },
        },
        user: {
          select: { id: true, username: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundError(`Gamer with EVOQ ID '${normalizedId}' not found`);
    }

    // Do NOT expose private info (phone number, email)
    return {
      id: profile.id,
      userId: profile.userId,
      username: profile.user.username,
      displayName: profile.displayName,
      inGameName: profile.inGameName,
      avatarUrl: profile.avatarUrl,
      evoqId: profile.evoqId,
      primaryGameId: profile.primaryGameId,
      gameIdentities: profile.gameIdentities.map((gid) => ({
        id: gid.id,
        gameId: gid.gameId,
        gameName: gid.game?.name,
        gameSlug: gid.game?.slug,
        inGameName: gid.inGameName,
        inGameUid: gid.inGameUid,
        tagline: gid.tagline,
        isPrimary: gid.isPrimary,
      })),
      completeness: this.calculateCompletion(profile, profile.gameIdentities).completeness,
    };
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

