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
  transferOwnershipSchema,
} from './teams.schema.js';

const router = Router();

// Public discovery
router.get('/', teamsController.list);

// Authenticated current user team routes (GAMER ONLY)
router.get('/my/list', authenticate, requireGamer, teamsController.getMyTeams);
router.get('/my/invitations', authenticate, requireGamer, teamsController.getMyInvitations);

// Create team (GAMER ONLY)
router.post('/', authenticate, requireGamer, validate(createTeamSchema), teamsController.create);

// Lookup team by ID
router.get('/by-id/:id', teamsController.getById);

// Team details by slug (PUBLIC)
router.get('/:slug', teamsController.getBySlug);

// Team management by ID (GAMER ONLY)
router.patch('/:id', authenticate, requireGamer, validate(updateTeamSchema), teamsController.update);
router.post('/:id/invitations', authenticate, requireGamer, validate(inviteTeamMemberSchema), teamsController.invite);
router.delete('/:id/invitations/:invitationId', authenticate, requireGamer, teamsController.cancelInvitation);
router.delete('/:id/members/:userId', authenticate, requireGamer, teamsController.removeMember);
router.post('/:id/leave', authenticate, requireGamer, teamsController.leaveTeam);
router.post(
  '/:id/transfer-ownership',
  authenticate,
  requireGamer,
  validate(transferOwnershipSchema),
  teamsController.transferOwnership
);
router.delete('/:id', authenticate, requireGamer, teamsController.delete);

// Invitation response (GAMER ONLY)
router.post(
  '/invitations/:id/respond',
  authenticate,
  requireGamer,
  validate(respondInvitationSchema),
  teamsController.respondInvitation
);

export default router;
