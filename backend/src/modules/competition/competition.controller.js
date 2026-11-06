import { competitionService } from './competition.service.js';

export class CompetitionController {
  async getStages(req, res, next) {
    try {
      const stages = await competitionService.getStages(req.params.tournamentId);
      res.status(200).json({
        data: stages,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async listMatches(req, res, next) {
    try {
      const matches = await competitionService.listMatches(req.params.tournamentId);
      res.status(200).json({
        data: matches,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getMatch(req, res, next) {
    try {
      const match = await competitionService.getMatchById(req.params.id);
      res.status(200).json({
        data: match,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async generateMatches(req, res, next) {
    try {
      await competitionService.generateMatches(req.params.tournamentId, req.user.id, req.body);
      res.status(200).json({
        data: { success: true, message: 'Matches successfully generated' },
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async scheduleMatch(req, res, next) {
    try {
      const match = await competitionService.scheduleMatch(req.params.id, req.user.id, req.body);
      res.status(200).json({
        data: match,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async setCredentials(req, res, next) {
    try {
      const credential = await competitionService.setMatchCredentials(req.params.id, req.user.id, req.body);
      res.status(200).json({
        data: credential,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getCredentials(req, res, next) {
    try {
      const credential = await competitionService.getMatchCredentials(req.params.id, req.user.id);
      res.status(200).json({
        data: credential,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const competitionController = new CompetitionController();

