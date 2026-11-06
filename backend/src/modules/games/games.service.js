import prisma from '../../database/prisma.js';
import { NotFoundError } from '../../utils/errors.js';

export class GamesService {
  async listGames(filter = {}) {
    const where = { status: filter.status || 'ACTIVE' };
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search } },
        { shortName: { contains: filter.search } },
        { genre: { contains: filter.search } },
      ];
    }
    return prisma.game.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getGameBySlug(slug) {
    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            tournaments: true,
            gamerGameIdentities: true,
            teams: true,
          },
        },
      },
    });
    if (!game) {
      throw new NotFoundError(`Game '${slug}' not found`);
    }
    return game;
  }
}

export const gamesService = new GamesService();

