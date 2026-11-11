import { Router } from 'express';
import { tournamentsController } from './tournaments.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireOrganizer } from '../../middleware/authorize.js';
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

// Authenticated organizer dashboard (ORGANIZER ONLY)
router.get('/organizer/dashboard', authenticate, requireOrganizer, tournamentsController.getDashboard);

// Lookup by ID
router.get('/id/:id', tournamentsController.getById);

// Tournament creation (ORGANIZER ONLY)
router.post('/', authenticate, requireOrganizer, validate(createTournamentSchema), tournamentsController.create);

// Detail by slug (PUBLIC: supports optional auth via cookie parser so user's registration can be returned)
router.get('/:slug', (req, res, next) => {
  // If session cookie exists, authenticate, else continue
  if (req.cookies && Object.keys(req.cookies).length > 0) {
    return authenticate(req, res, () => tournamentsController.getBySlug(req, res, next));
  }
  return tournamentsController.getBySlug(req, res, next);
});

// Management by ID (ORGANIZER ONLY + ownership/staff check)
router.patch('/:id', authenticate, requireOrganizer, validate(updateTournamentSchema), tournamentsController.update);
router.post('/:id/status', authenticate, requireOrganizer, validate(updateTournamentStatusSchema), tournamentsController.updateStatus);

export default router;

