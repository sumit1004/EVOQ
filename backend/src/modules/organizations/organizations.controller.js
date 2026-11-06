import { organizationsService } from './organizations.service.js';

export class OrganizationsController {
  async list(req, res, next) {
    try {
      const orgs = await organizationsService.listOrganizations();
      res.status(200).json({
        data: orgs,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrgs(req, res, next) {
    try {
      const orgs = await organizationsService.getMyOrganizations(req.user.id);
      res.status(200).json({
        data: orgs,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const org = await organizationsService.createOrganization(req.user.id, req.body);
      res.status(201).json({
        data: org,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const org = await organizationsService.getOrganizationBySlug(req.params.slug);
      res.status(200).json({
        data: org,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const org = await organizationsService.updateOrganization(req.params.id, req.user.id, req.body);
      res.status(200).json({
        data: org,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async addStaff(req, res, next) {
    try {
      const membership = await organizationsService.addStaff(req.params.id, req.user.id, req.body);
      res.status(200).json({
        data: membership,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async removeStaff(req, res, next) {
    try {
      await organizationsService.removeStaff(req.params.id, req.user.id, req.params.userId);
      res.status(200).json({
        data: { success: true },
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const organizationsController = new OrganizationsController();

