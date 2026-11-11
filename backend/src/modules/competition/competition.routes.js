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

// Presets (PUBLIC)
router.get('/competition/presets/:gameSlug?', competitionController.getPresets);

// Tournament bracket/match discovery (PUBLIC)
router.get('/tournaments/:tournamentId/stages', competitionController.getStages);
router.get('/tournaments/:tournamentId/matches', competitionController.listMatches);

// Generate competition matches (ORGANIZER ONLY)
router.post(
  '/tournaments/:tournamentId/generate-matches',
  authenticate,
  requireOrganizer,
  validate(generateMatchesSchema),
  competitionController.generateMatches
);

// Advance stage (e.g. Groups -> Finals) (ORGANIZER ONLY)
router.post(
  '/tournaments/:tournamentId/stages/advance',
  authenticate,
  requireOrganizer,
  competitionController.advanceStage
);

// Individual match routes
router.get('/matches/:id', competitionController.getMatch);
router.patch('/matches/:id/schedule', authenticate, requireOrganizer, validate(scheduleMatchSchema), competitionController.scheduleMatch);

// Check-in workflow
router.post('/matches/:id/check-in/open', authenticate, requireOrganizer, competitionController.openCheckIn);
router.post('/matches/:id/check-in', authenticate, competitionController.checkIn);

// Match room credentials
router.post('/matches/:id/credentials', authenticate, requireOrganizer, validate(setMatchCredentialsSchema), competitionController.setCredentials);
router.post('/matches/:id/credentials/revoke', authenticate, requireOrganizer, competitionController.revokeCredentials);
router.get('/matches/:id/credentials', authenticate, competitionController.getCredentials);

export default router;
