import env from '../config/env.js';

/**
 * Centralized error handler.
 *
 * Typed domain errors carry a `statusCode` and `code` property.
 * Unknown errors are treated as 500 INTERNAL_ERROR.
 * Stack traces are never sent to the client in production.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message =
    statusCode === 500 && env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred';

  // Log server-side — redact sensitive fields later
  console.error(`[${req.requestId}] ${code}: ${err.message}`);
  if (env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const body = {
    error: {
      code,
      message,
    },
    meta: {
      requestId: req.requestId,
    },
  };

  if (err.details) {
    body.error.details = err.details;
  }

  res.status(statusCode).json(body);
}

