import { Router } from 'express';
import { organizersController } from './organizers.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { upsertOrganizerProfileSchema } from './organizers.schema.js';

const router = Router();

router.get('/me', authenticate, organizersController.getMe);
router.post('/me', authenticate, validate(upsertOrganizerProfileSchema), organizersController.upsert);
router.get('/:slug', organizersController.getPublic);

export default router;

