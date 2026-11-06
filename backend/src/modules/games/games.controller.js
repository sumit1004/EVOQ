import { gamesService } from './games.service.js';

export class GamesController {
  async list(req, res, next) {
    try {
      const games = await gamesService.listGames(req.query);
      res.status(200).json({
        data: games,
        meta: { requestId: req.requestId, total: games.length },
      });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const game = await gamesService.getGameBySlug(req.params.slug);
      res.status(200).json({
        data: game,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const gamesController = new GamesController();

