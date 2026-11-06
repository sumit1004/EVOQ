import { Router } from 'express';
import { registrationsController } from './registrations.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireGamer, requireOrganizer } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  registerTournamentSchema,
  updateRegistrationStatusSchema,
} from './registrations.schema.js';

const router = Router({ mergeParams: true });

// Public / participant listing (PUBLIC)
router.get('/', registrationsController.list);

// Authenticated gamer actions (GAMER ONLY)
router.post('/', authenticate, requireGamer, validate(registerTournamentSchema), registrationsController.register);
router.post('/withdraw', authenticate, requireGamer, registrationsController.withdraw);

// Organizer review / approval (ORGANIZER ONLY)
router.patch('/:id/status', authenticate, requireOrganizer, validate(updateRegistrationStatusSchema), registrationsController.updateStatus);

export default router;

