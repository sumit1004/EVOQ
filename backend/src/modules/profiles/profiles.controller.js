import { profilesService } from './profiles.service.js';

export class ProfilesController {
  async getMe(req, res, next) {
    try {
      const profile = await profilesService.getMyProfile(req.user.id);
      res.status(200).json({
        data: profile,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async upsert(req, res, next) {
    try {
      const profile = await profilesService.upsertProfile(req.user.id, req.body);
      res.status(200).json({
        data: profile,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getPublic(req, res, next) {
    try {
      const profile = await profilesService.getPublicProfile(req.params.slug);
      res.status(200).json({
        data: profile,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async addIdentity(req, res, next) {
    try {
      const identity = await profilesService.addOrUpdateGameIdentity(req.user.id, req.body);
      res.status(200).json({
        data: identity,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async lookupEvoq(req, res, next) {
    try {
      const evoqId = req.params.evoqId || req.query.evoqId;
      const profile = await profilesService.lookupByEvoqId(evoqId);
      res.status(200).json({
        data: profile,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async removeIdentity(req, res, next) {
    try {
      await profilesService.removeGameIdentity(req.user.id, req.params.gameId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

export const profilesController = new ProfilesController();

