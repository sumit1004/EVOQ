import { Router } from 'express';
import { gamesController } from './games.controller.js';
import { validate } from '../../middleware/validate.js';
import { listGamesQuerySchema } from './games.schema.js';

const router = Router();

router.get('/', validate(listGamesQuerySchema, 'query'), gamesController.list);
router.get('/:slug', gamesController.getBySlug);

export default router;

