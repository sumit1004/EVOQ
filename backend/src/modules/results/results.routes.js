import { Router } from 'express';
import { resultsController } from './results.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireOrganizer } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  submitResultSchema,
  rejectResultSchema,
  correctResultSchema,
} from './results.schema.js';

const router = Router();

// Submit match result (Participants or Tournament Organizers)
router.post('/matches/:matchId/results', authenticate, validate(submitResultSchema), resultsController.submitResult);

// Review, Approval & Correction (ORGANIZER ONLY)
router.post('/results/:id/approve', authenticate, requireOrganizer, resultsController.approveResult);
router.post('/results/:id/reject', authenticate, requireOrganizer, validate(rejectResultSchema), resultsController.rejectResult);
router.post('/results/:id/correct', authenticate, requireOrganizer, validate(correctResultSchema), resultsController.correctResult);

// Standings (PUBLIC)
router.get('/tournaments/:tournamentId/standings', resultsController.getStandings);

export default router;
