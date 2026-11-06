import { Router } from 'express';
import { registrationsController } from './registrations.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  registerTournamentSchema,
  updateRegistrationStatusSchema,
} from './registrations.schema.js';

const router = Router({ mergeParams: true });

// Public / participant listing
router.get('/', registrationsController.list);

// Authenticated actions
router.post('/', authenticate, validate(registerTournamentSchema), registrationsController.register);
router.post('/withdraw', authenticate, registrationsController.withdraw);
router.patch('/:id/status', authenticate, validate(updateRegistrationStatusSchema), registrationsController.updateStatus);

export default router;

