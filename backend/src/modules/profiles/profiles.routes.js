import { Router } from 'express';
import { profilesController } from './profiles.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireGamer } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { upsertProfileSchema, addGameIdentitySchema } from './profiles.schema.js';

const router = Router();

// Current authenticated user profile (GAMER ONLY)
router.get('/me', authenticate, requireGamer, profilesController.getMe);
router.post('/me', authenticate, requireGamer, validate(upsertProfileSchema), profilesController.upsert);
router.patch('/me', authenticate, requireGamer, validate(upsertProfileSchema.partial()), profilesController.upsert);

// Game identities (GAMER ONLY)
router.post('/me/identities', authenticate, requireGamer, validate(addGameIdentitySchema), profilesController.addIdentity);
router.delete('/me/identities/:gameId', authenticate, requireGamer, profilesController.removeIdentity);

// EVOQ ID Lookup (AUTHENTICATED)
router.get('/lookup/evoq/:evoqId', authenticate, profilesController.lookupEvoq);
router.get('/lookup/evoq', authenticate, profilesController.lookupEvoq);

// Public gamer profile (PUBLIC)
router.get('/:slug', profilesController.getPublic);

export default router;

