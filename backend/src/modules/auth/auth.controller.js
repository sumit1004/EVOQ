import env from '../../config/env.js';
import { authService } from './auth.service.js';
import { getSessionCookieOptions, getClearCookieOptions } from '../../utils/cookies.js';
import { generateCsrfToken } from '../../middleware/csrf.js';

export class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        data: {
          userId: result.userId,
          accountType: result.accountType,
          verificationRequired: result.verificationRequired,
          ...(result.debugVerificationToken ? { debugToken: result.debugVerificationToken } : {}),
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async registerGamer(req, res, next) {
    try {
      const result = await authService.registerGamer(req.body);

      res.status(201).json({
        data: {
          userId: result.userId,
          accountType: 'GAMER',
          verificationRequired: result.verificationRequired,
          ...(result.debugVerificationToken ? { debugToken: result.debugVerificationToken } : {}),
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async registerOrganizer(req, res, next) {
    try {
      const result = await authService.registerOrganizer(req.body);

      res.status(201).json({
        data: {
          userId: result.userId,
          accountType: 'ORGANIZER',
          verificationRequired: result.verificationRequired,
          ...(result.debugVerificationToken ? { debugToken: result.debugVerificationToken } : {}),
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { user, session, rawSessionToken } = await authService.login(req.body);

      res.cookie(env.SESSION_COOKIE_NAME, rawSessionToken, getSessionCookieOptions());

      const csrfToken = generateCsrfToken(session.tokenHash);
      if (csrfToken) {
        res.setHeader('X-CSRF-Token', csrfToken);
      }

      res.status(200).json({
        data: {
          summary: 'Login successful',
          user,
          csrfToken,
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async loginGamer(req, res, next) {
    try {
      const { user, session, rawSessionToken } = await authService.login({
        ...req.body,
        portal: 'GAMER',
      });

      res.cookie(env.SESSION_COOKIE_NAME, rawSessionToken, getSessionCookieOptions());

      const csrfToken = generateCsrfToken(session.tokenHash);
      if (csrfToken) {
        res.setHeader('X-CSRF-Token', csrfToken);
      }

      res.status(200).json({
        data: {
          summary: 'Gamer login successful',
          user,
          csrfToken,
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async loginOrganizer(req, res, next) {
    try {
      const { user, session, rawSessionToken } = await authService.login({
        ...req.body,
        portal: 'ORGANIZER',
      });

      res.cookie(env.SESSION_COOKIE_NAME, rawSessionToken, getSessionCookieOptions());

      const csrfToken = generateCsrfToken(session.tokenHash);
      if (csrfToken) {
        res.setHeader('X-CSRF-Token', csrfToken);
      }

      res.status(200).json({
        data: {
          summary: 'Organizer login successful',
          user,
          csrfToken,
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      const user = req.user;
      const csrfToken = generateCsrfToken(req.session.tokenHash);

      if (csrfToken) {
        res.setHeader('X-CSRF-Token', csrfToken);
      }

      res.status(200).json({
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          accountType: user.accountType || 'GAMER',
          status: user.status,
          emailVerified: !!user.emailVerifiedAt,
          capabilities: {
            canCreateTournament: user.accountType === 'ORGANIZER',
            canJoinTeam: user.accountType === 'GAMER',
          },
          csrfToken,
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      if (req.session?.tokenHash) {
        await authService.logout(req.session.tokenHash, req.user?.id);
      }

      res.clearCookie(env.SESSION_COOKIE_NAME, getClearCookieOptions());
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async logoutAll(req, res, next) {
    try {
      if (req.user?.id) {
        await authService.logoutAll(req.user.id);
      }

      res.clearCookie(env.SESSION_COOKIE_NAME, getClearCookieOptions());
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);

      res.status(200).json({
        data: {
          accepted: true,
          ...(result.debugResetToken ? { debugToken: result.debugResetToken } : {}),
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);

      res.status(200).json({
        data: {
          reset: result.reset,
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const result = await authService.verifyEmail(req.body.token);

      res.status(200).json({
        data: {
          verified: result.verified,
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async resendVerification(req, res, next) {
    try {
      const result = await authService.resendVerification(req.body.email);

      res.status(200).json({
        data: {
          sent: result.sent,
          ...(result.debugVerificationToken ? { debugToken: result.debugVerificationToken } : {}),
        },
        meta: {
          requestId: req.requestId,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

