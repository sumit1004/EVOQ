import { Router } from 'express';
import { teamsController } from './teams.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
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

// Authenticated current user team routes
router.get('/my/list', authenticate, teamsController.getMyTeams);
router.get('/my/invitations', authenticate, teamsController.getMyInvitations);

// Create team
router.post('/', authenticate, validate(createTeamSchema), teamsController.create);

// Team details by slug
router.get('/:slug', teamsController.getBySlug);

// Team management by ID
router.patch('/:id', authenticate, validate(updateTeamSchema), teamsController.update);
router.post('/:id/invitations', authenticate, validate(inviteTeamMemberSchema), teamsController.invite);
router.delete('/:id/members/:userId', authenticate, teamsController.removeMember);

// Invitation response
router.post('/invitations/:id/respond', authenticate, validate(respondInvitationSchema), teamsController.respondInvitation);

export default router;

