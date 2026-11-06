import { teamsService } from './teams.service.js';

export class TeamsController {
  async list(req, res, next) {
    try {
      const teams = await teamsService.listTeams(req.query);
      res.status(200).json({
        data: teams,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyTeams(req, res, next) {
    try {
      const teams = await teamsService.getMyTeams(req.user.id);
      res.status(200).json({
        data: teams,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const team = await teamsService.createTeam(req.user.id, req.body);
      res.status(201).json({
        data: team,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const team = await teamsService.getTeamBySlug(req.params.slug);
      res.status(200).json({
        data: team,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const team = await teamsService.updateTeam(req.params.id, req.user.id, req.body);
      res.status(200).json({
        data: team,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async invite(req, res, next) {
    try {
      const invitation = await teamsService.inviteMember(req.params.id, req.user.id, req.body);
      res.status(201).json({
        data: invitation,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyInvitations(req, res, next) {
    try {
      const invitations = await teamsService.getMyInvitations(req.user.id);
      res.status(200).json({
        data: invitations,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async respondInvitation(req, res, next) {
    try {
      await teamsService.respondToInvitation(req.params.id, req.user.id, req.body.action);
      res.status(200).json({
        data: { success: true },
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req, res, next) {
    try {
      await teamsService.removeMember(req.params.id, req.user.id, req.params.userId);
      res.status(200).json({
        data: { success: true },
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const teamsController = new TeamsController();

