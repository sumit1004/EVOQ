import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { authRateLimiter, passwordResetRateLimiter } from '../../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from './auth.schema.js';

const router = Router();

// Registration
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

// Login
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

// Current User (Session check)
router.get('/me', authenticate, authController.me);

// Logout (current session)
router.post('/logout', authenticate, requireCsrf, authController.logout);

// Logout All sessions
router.post('/logout-all', authenticate, requireCsrf, authController.logoutAll);

// Forgot Password
router.post(
  '/password/forgot',
  passwordResetRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

// Reset Password
router.post(
  '/password/reset',
  passwordResetRateLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  '/reset-password',
  passwordResetRateLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Verify Email
router.post(
  '/verify-email',
  authRateLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail
);

// Resend Verification
router.post(
  '/resend-verification',
  authRateLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification
);

export default router;

