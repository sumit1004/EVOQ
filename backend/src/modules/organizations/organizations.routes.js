import { Router } from 'express';
import { organizationsController } from './organizations.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  addStaffSchema,
} from './organizations.schema.js';

const router = Router();

// Public discovery
router.get('/', organizationsController.list);

// My organizations
router.get('/my/list', authenticate, organizationsController.getMyOrgs);

// Create organization
router.post('/', authenticate, validate(createOrganizationSchema), organizationsController.create);

// Detail by slug
router.get('/:slug', organizationsController.getBySlug);

// Management
router.patch('/:id', authenticate, validate(updateOrganizationSchema), organizationsController.update);
router.post('/:id/staff', authenticate, validate(addStaffSchema), organizationsController.addStaff);
router.delete('/:id/staff/:userId', authenticate, organizationsController.removeStaff);

export default router;

