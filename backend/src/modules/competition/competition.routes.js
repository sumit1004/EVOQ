import { Router } from 'express';
import { competitionController } from './competition.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireOrganizer } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  generateMatchesSchema,
  scheduleMatchSchema,
  setMatchCredentialsSchema,
} from './competition.schema.js';

const router = Router();

// Tournament bracket/match discovery (PUBLIC)
router.get('/tournaments/:tournamentId/stages', competitionController.getStages);
router.get('/tournaments/:tournamentId/matches', competitionController.listMatches);
router.post(
  '/tournaments/:tournamentId/generate-matches',
  authenticate,
  requireOrganizer,
  validate(generateMatchesSchema),
  competitionController.generateMatches
);

// Individual match routes
router.get('/matches/:id', competitionController.getMatch);
router.patch('/matches/:id/schedule', authenticate, requireOrganizer, validate(scheduleMatchSchema), competitionController.scheduleMatch);

// Match room credentials
router.post('/matches/:id/credentials', authenticate, requireOrganizer, validate(setMatchCredentialsSchema), competitionController.setCredentials);
router.get('/matches/:id/credentials', authenticate, competitionController.getCredentials);

export default router;

