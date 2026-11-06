import { Router } from 'express';
import { resultsController } from './results.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  submitResultSchema,
  rejectResultSchema,
} from './results.schema.js';

const router = Router();

// Submit match result
router.post('/matches/:matchId/results', authenticate, validate(submitResultSchema), resultsController.submitResult);

// Review & Approval
router.post('/results/:id/approve', authenticate, resultsController.approveResult);
router.post('/results/:id/reject', authenticate, validate(rejectResultSchema), resultsController.rejectResult);

// Standings
router.get('/tournaments/:tournamentId/standings', resultsController.getStandings);

export default router;

