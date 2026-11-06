import { Router } from 'express';
import { organizersController } from './organizers.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireOrganizer } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { upsertOrganizerProfileSchema } from './organizers.schema.js';

const router = Router();

// Current authenticated organizer profile (ORGANIZER ONLY)
router.get('/me', authenticate, requireOrganizer, organizersController.getMe);
router.post('/me', authenticate, requireOrganizer, validate(upsertOrganizerProfileSchema), organizersController.upsert);

// Public organizer profile (PUBLIC)
router.get('/:slug', organizersController.getPublic);

export default router;

