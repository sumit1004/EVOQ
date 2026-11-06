import { Router } from 'express';
import { teamsController } from './teams.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireGamer } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  createTeamSchema,
  updateTeamSchema,
  inviteTeamMemberSchema,
  respondInvitationSchema,
} from './teams.schema.js';

const router = Router();

// Public discovery
router.get('/', teamsController.list);

// Authenticated current user team routes (GAMER ONLY)
router.get('/my/list', authenticate, requireGamer, teamsController.getMyTeams);
router.get('/my/invitations', authenticate, requireGamer, teamsController.getMyInvitations);

// Create team (GAMER ONLY)
router.post('/', authenticate, requireGamer, validate(createTeamSchema), teamsController.create);

// Team details by slug (PUBLIC)
router.get('/:slug', teamsController.getBySlug);

// Team management by ID (GAMER ONLY)
router.patch('/:id', authenticate, requireGamer, validate(updateTeamSchema), teamsController.update);
router.post('/:id/invitations', authenticate, requireGamer, validate(inviteTeamMemberSchema), teamsController.invite);
router.delete('/:id/members/:userId', authenticate, requireGamer, teamsController.removeMember);

// Invitation response (GAMER ONLY)
router.post('/invitations/:id/respond', authenticate, requireGamer, validate(respondInvitationSchema), teamsController.respondInvitation);

export default router;

