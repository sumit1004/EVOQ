import { Router } from 'express';
import { profilesController } from './profiles.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { upsertProfileSchema, addGameIdentitySchema } from './profiles.schema.js';

const router = Router();

// Current authenticated user profile
router.get('/me', authenticate, profilesController.getMe);
router.post('/me', authenticate, validate(upsertProfileSchema), profilesController.upsert);
router.patch('/me', authenticate, validate(upsertProfileSchema.partial()), profilesController.upsert);

// Game identities
router.post('/me/identities', authenticate, validate(addGameIdentitySchema), profilesController.addIdentity);
router.delete('/me/identities/:gameId', authenticate, profilesController.removeIdentity);

// Public gamer profile
router.get('/:slug', profilesController.getPublic);

export default router;

