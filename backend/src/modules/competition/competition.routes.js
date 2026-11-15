import { Router } from 'express';
import { competitionController } from './competition.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireOrganizer } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  generateMatchesSchema,
  scheduleMatchSchema,
  setMatchCredentialsSchema,
  createRoundSchema,
  updateRoundStatusSchema,
  createGroupsSchema,
  randomizeGroupsSchema,
  createGroupMatchesSchema,
  qualifyTeamsSchema,
  advanceToNextRoundSchema,
} from './competition.schema.js';

const router = Router();

// Presets (PUBLIC)
router.get('/competition/presets/:gameSlug?', competitionController.getPresets);

// Tournament bracket/match/round discovery (PUBLIC)
router.get('/tournaments/:tournamentId/stages', competitionController.getStages);
router.get('/tournaments/:tournamentId/rounds', competitionController.listTournamentRounds);
router.get('/tournaments/:tournamentId/matches', competitionController.listMatches);

// Manual Round Management (ORGANIZER ONLY)
router.post(
  '/tournaments/:tournamentId/rounds',
  authenticate,
  requireOrganizer,
  validate(createRoundSchema),
  competitionController.createRound
);

router.get('/competition/rounds/:roundId', competitionController.getRound);
router.patch(
  '/competition/rounds/:roundId/status',
  authenticate,
  requireOrganizer,
  validate(updateRoundStatusSchema),
  competitionController.updateRoundStatus
);

// Eligible Teams & Group Allocation
router.get('/competition/rounds/:roundId/eligible-teams', competitionController.getEligibleTeams);
router.post(
  '/competition/rounds/:roundId/groups',
  authenticate,
  requireOrganizer,
  validate(createGroupsSchema),
  competitionController.createGroups
);
router.post(
  '/competition/rounds/:roundId/groups/randomize',
  authenticate,
  requireOrganizer,
  validate(randomizeGroupsSchema),
  competitionController.randomizeGroups
);

// Group Details & Matches
router.get('/competition/groups/:groupId', competitionController.getGroup);
router.post(
  '/competition/groups/:groupId/matches',
  authenticate,
  requireOrganizer,
  validate(createGroupMatchesSchema),
  competitionController.createGroupMatches
);

// Qualification & Next Round Progression
router.post(
  '/competition/rounds/:roundId/qualify',
  authenticate,
  requireOrganizer,
  validate(qualifyTeamsSchema),
  competitionController.qualifyTeams
);
router.post(
  '/competition/rounds/:roundId/next-round',
  authenticate,
  requireOrganizer,
  validate(advanceToNextRoundSchema),
  competitionController.advanceToNextRound
);

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
router.get('/competition/matches/:id', competitionController.getMatch);
router.patch('/matches/:id/schedule', authenticate, requireOrganizer, validate(scheduleMatchSchema), competitionController.scheduleMatch);

// Check-in workflow
router.post('/matches/:id/check-in/open', authenticate, requireOrganizer, competitionController.openCheckIn);
router.post('/matches/:id/check-in', authenticate, competitionController.checkIn);

// Match room credentials
router.post('/matches/:id/credentials', authenticate, requireOrganizer, validate(setMatchCredentialsSchema), competitionController.setCredentials);
router.post('/competition/matches/:id/credentials', authenticate, requireOrganizer, validate(setMatchCredentialsSchema), competitionController.setCredentials);
router.post('/matches/:id/credentials/revoke', authenticate, requireOrganizer, competitionController.revokeCredentials);
router.post('/competition/matches/:id/credentials/revoke', authenticate, requireOrganizer, competitionController.revokeCredentials);
router.post('/matches/:id/credentials/copy-previous', authenticate, requireOrganizer, competitionController.copyMatchCredentials);
router.post('/competition/matches/:id/credentials/copy-previous', authenticate, requireOrganizer, competitionController.copyMatchCredentials);
router.get('/matches/:id/credentials', authenticate, competitionController.getCredentials);
router.get('/competition/matches/:id/credentials', authenticate, competitionController.getCredentials);

// Delete operations (ORGANIZER ONLY)
router.delete('/matches/:id', authenticate, requireOrganizer, competitionController.deleteMatch);
router.delete('/groups/:id', authenticate, requireOrganizer, competitionController.deleteGroup);
router.delete('/rounds/:id', authenticate, requireOrganizer, competitionController.deleteRound);
router.delete('/stages/:id', authenticate, requireOrganizer, competitionController.deleteStage);

// Route aliases under /competition/*
router.delete('/competition/matches/:id', authenticate, requireOrganizer, competitionController.deleteMatch);
router.delete('/competition/groups/:id', authenticate, requireOrganizer, competitionController.deleteGroup);
router.delete('/competition/rounds/:id', authenticate, requireOrganizer, competitionController.deleteRound);
router.delete('/competition/stages/:id', authenticate, requireOrganizer, competitionController.deleteStage);

export default router;
