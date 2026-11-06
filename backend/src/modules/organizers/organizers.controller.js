import { organizersService } from './organizers.service.js';

export class OrganizersController {
  async getMe(req, res, next) {
    try {
      const profile = await organizersService.getMyProfile(req.user.id);
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
      const profile = await organizersService.upsertProfile(req.user.id, req.body);
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
      const profile = await organizersService.getPublicProfile(req.params.slug);
      res.status(200).json({
        data: profile,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const organizersController = new OrganizersController();

