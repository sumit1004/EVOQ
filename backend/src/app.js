import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import env from './config/env.js';
import healthRouter from './routes/health.routes.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();

// ── Security headers ─────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// ── Body parsing ─────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// ── Cookie parsing ───────────────────────────────
app.use(cookieParser());

// ── Request ID & logging ─────────────────────────
app.use((req, _res, next) => {
  req.requestId = randomUUID();
  next();
});
app.use(requestLogger);

// ── API routes ───────────────────────────────────
app.use('/api/v1/health', healthRouter);

// ── 404 / error handling ─────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

