import { createHmac, timingSafeEqual } from 'node:crypto';
import env from '../config/env.js';
import { ForbiddenError } from '../utils/errors.js';

const CSRF_SECRET = process.env.CSRF_SECRET || env.SESSION_COOKIE_NAME + '_csrf_secret_salt';

export function generateCsrfToken(sessionTokenHash) {
  if (!sessionTokenHash) return null;
  return createHmac('sha256', CSRF_SECRET)
    .update(sessionTokenHash)
    .digest('hex');
}

export function verifyCsrfToken(sessionTokenHash, clientToken) {
  if (!sessionTokenHash || !clientToken || typeof clientToken !== 'string') {
    return false;
  }
  const expectedToken = generateCsrfToken(sessionTokenHash);
  if (!expectedToken) return false;

  const expectedBuffer = Buffer.from(expectedToken);
  const clientBuffer = Buffer.from(clientToken);

  if (expectedBuffer.length !== clientBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, clientBuffer);
}

/**
 * Middleware that enforces CSRF token for mutating requests when a session is active.
 */
export function requireCsrf(req, _res, next) {
  // Safe methods do not require CSRF
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // If there's an active session, verify CSRF token
  if (req.session && req.session.tokenHash) {
    const clientToken =
      req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];

    if (!verifyCsrfToken(req.session.tokenHash, clientToken)) {
      return next(new ForbiddenError('Invalid or missing CSRF token'));
    }
  }

  next();
}

