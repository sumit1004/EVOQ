import env from '../config/env.js';
import prisma from '../database/prisma.js';
import { hashToken } from '../utils/tokens.js';
import { UnauthenticatedError } from '../utils/errors.js';
import { getClearCookieOptions } from '../utils/cookies.js';
import { generateCsrfToken } from './csrf.js';

export async function authenticate(req, res, next) {
  try {
    const rawToken = req.cookies?.[env.SESSION_COOKIE_NAME];

    if (!rawToken || typeof rawToken !== 'string') {
      throw new UnauthenticatedError('Authentication required');
    }

    const tokenHash = hashToken(rawToken);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });

    if (!session) {
      res.clearCookie(env.SESSION_COOKIE_NAME, getClearCookieOptions());
      throw new UnauthenticatedError('Invalid or expired session');
    }

    if (session.revokedAt) {
      res.clearCookie(env.SESSION_COOKIE_NAME, getClearCookieOptions());
      throw new UnauthenticatedError('Session has been revoked');
    }

    if (new Date() > new Date(session.expiresAt)) {
      res.clearCookie(env.SESSION_COOKIE_NAME, getClearCookieOptions());
      throw new UnauthenticatedError('Session has expired');
    }

    if (!session.user || session.user.status !== 'ACTIVE') {
      res.clearCookie(env.SESSION_COOKIE_NAME, getClearCookieOptions());
      throw new UnauthenticatedError('User account is inactive');
    }

    // Attach to request
    req.session = session;
    req.user = session.user;

    // Attach CSRF token header for subsequent mutating calls
    const csrfToken = generateCsrfToken(session.tokenHash);
    if (csrfToken) {
      res.setHeader('X-CSRF-Token', csrfToken);
    }

    next();
  } catch (err) {
    next(err);
  }
}

