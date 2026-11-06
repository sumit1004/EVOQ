import { registrationsService } from './registrations.service.js';

export class RegistrationsController {
  async register(req, res, next) {
    try {
      const reg = await registrationsService.registerForTournament(
        req.params.tournamentId,
        req.user.id,
        req.body
      );
      res.status(201).json({
        data: reg,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const registrations = await registrationsService.listRegistrations(
        req.params.tournamentId,
        req.query.status
      );
      res.status(200).json({
        data: registrations,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const reg = await registrationsService.updateStatus(
        req.params.tournamentId,
        req.params.id,
        req.user.id,
        req.body
      );
      res.status(200).json({
        data: reg,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async withdraw(req, res, next) {
    try {
      const reg = await registrationsService.withdraw(req.params.tournamentId, req.user.id);
      res.status(200).json({
        data: reg,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const registrationsController = new RegistrationsController();

