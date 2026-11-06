import { Router } from 'express';
import { tournamentsController } from './tournaments.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  createTournamentSchema,
  updateTournamentSchema,
  updateTournamentStatusSchema,
  listTournamentsQuerySchema,
} from './tournaments.schema.js';

const router = Router();

// Public discovery
router.get('/', validate(listTournamentsQuerySchema, 'query'), tournamentsController.list);

// Authenticated organizer dashboard
router.get('/organizer/dashboard', authenticate, tournamentsController.getDashboard);

// Tournament creation
router.post('/', authenticate, validate(createTournamentSchema), tournamentsController.create);

// Detail by slug (supports optional auth via cookie parser so user's registration can be returned)
router.get('/:slug', (req, res, next) => {
  // If session cookie exists, authenticate, else continue
  if (req.cookies && Object.keys(req.cookies).length > 0) {
    return authenticate(req, res, () => tournamentsController.getBySlug(req, res, next));
  }
  return tournamentsController.getBySlug(req, res, next);
});

// Management by ID
router.patch('/:id', authenticate, validate(updateTournamentSchema), tournamentsController.update);
router.post('/:id/status', authenticate, validate(updateTournamentStatusSchema), tournamentsController.updateStatus);

export default router;

