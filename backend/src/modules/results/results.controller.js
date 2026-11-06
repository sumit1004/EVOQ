import { resultsService } from './results.service.js';

export class ResultsController {
  async submitResult(req, res, next) {
    try {
      const revision = await resultsService.submitResult(req.params.matchId, req.user.id, req.body);
      res.status(201).json({
        data: revision,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async approveResult(req, res, next) {
    try {
      await resultsService.approveResult(req.params.id, req.user.id);
      res.status(200).json({
        data: { success: true, message: 'Result approved and tournament data updated' },
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async rejectResult(req, res, next) {
    try {
      const revision = await resultsService.rejectResult(req.params.id, req.user.id, req.body);
      res.status(200).json({
        data: revision,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getStandings(req, res, next) {
    try {
      const standings = await resultsService.getStandings(req.params.tournamentId);
      res.status(200).json({
        data: standings,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const resultsController = new ResultsController();

