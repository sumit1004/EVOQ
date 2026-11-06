import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import env from './config/env.js';

// Routers
import healthRouter from './routes/health.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import gamesRouter from './modules/games/games.routes.js';
import profilesRouter from './modules/profiles/profiles.routes.js';
import teamsRouter from './modules/teams/teams.routes.js';
import organizationsRouter from './modules/organizations/organizations.routes.js';
import organizersRouter from './modules/organizers/organizers.routes.js';
import tournamentsRouter from './modules/tournaments/tournaments.routes.js';
import registrationsRouter from './modules/registrations/registrations.routes.js';
import competitionRouter from './modules/competition/competition.routes.js';
import resultsRouter from './modules/results/results.routes.js';
import notificationsRouter from './routes/notifications.routes.js';
import mediaRouter from './routes/media.routes.js';

import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Security headers ─────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── CORS ─────────────────────────────────────────
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    exposedHeaders: ['X-CSRF-Token'],
  })
);

// ── Body parsing ─────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Cookie parsing ───────────────────────────────
app.use(cookieParser());

// ── Static uploads ───────────────────────────────
app.use('/uploads', express.static(path.resolve(__dirname, '../public/uploads')));

// ── Request ID & logging ─────────────────────────
app.use((req, _res, next) => {
  req.requestId = randomUUID();
  next();
});
app.use(requestLogger);

// ── API routes ───────────────────────────────────
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/games', gamesRouter);
app.use('/api/v1/profiles', profilesRouter);
app.use('/api/v1/teams', teamsRouter);
app.use('/api/v1/organizations', organizationsRouter);
app.use('/api/v1/organizers', organizersRouter);
app.use('/api/v1/tournaments', tournamentsRouter);
app.use('/api/v1/tournaments/:tournamentId/registrations', registrationsRouter);
app.use('/api/v1', competitionRouter);
app.use('/api/v1', resultsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/media', mediaRouter);

// ── 404 / error handling ─────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
