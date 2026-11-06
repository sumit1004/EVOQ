import { Router } from 'express';
import { organizationsController } from './organizations.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireOrganizer } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  addStaffSchema,
} from './organizations.schema.js';

const router = Router();

// Public discovery
router.get('/', organizationsController.list);

// My organizations (ORGANIZER ONLY)
router.get('/my/list', authenticate, requireOrganizer, organizationsController.getMyOrgs);

// Create organization (ORGANIZER ONLY)
router.post('/', authenticate, requireOrganizer, validate(createOrganizationSchema), organizationsController.create);

// Detail by slug (PUBLIC)
router.get('/:slug', organizationsController.getBySlug);

// Management (ORGANIZER ONLY + Organization RBAC in controller/service)
router.patch('/:id', authenticate, requireOrganizer, validate(updateOrganizationSchema), organizationsController.update);
router.post('/:id/staff', authenticate, requireOrganizer, validate(addStaffSchema), organizationsController.addStaff);
router.delete('/:id/staff/:userId', authenticate, requireOrganizer, organizationsController.removeStaff);

export default router;

