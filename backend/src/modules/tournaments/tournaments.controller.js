import { tournamentsService } from './tournaments.service.js';

export class TournamentsController {
  async list(req, res, next) {
    try {
      const result = await tournamentsService.listTournaments(req.query);
      res.status(200).json({
        data: result.tournaments,
        meta: {
          requestId: req.requestId,
          pagination: result.pagination,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const tournament = await tournamentsService.getTournamentById(req.params.id);
      res.status(200).json({
        data: tournament,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const currentUserId = req.user?.id || null;
      const tournament = await tournamentsService.getTournamentBySlug(req.params.slug, currentUserId);
      res.status(200).json({
        data: tournament,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const tournament = await tournamentsService.createTournament(req.user.id, req.body);
      res.status(201).json({
        data: tournament,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const tournament = await tournamentsService.updateTournament(req.params.id, req.user.id, req.body);
      res.status(200).json({
        data: tournament,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const tournament = await tournamentsService.updateStatus(req.params.id, req.user.id, req.body.status);
      res.status(200).json({
        data: tournament,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const dashboard = await tournamentsService.getOrganizerDashboard(req.user.id);
      res.status(200).json({
        data: dashboard,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const tournamentsController = new TournamentsController();

