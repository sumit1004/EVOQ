import env from '../../config/env.js';
import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { hashPassword, verifyPassword } from '../../utils/argon2.js';
import { generateSecureToken, hashToken } from '../../utils/tokens.js';
import { emailService } from '../../services/email.service.js';
import {
  ConflictError,
  UnauthenticatedError,
  ForbiddenError,
  ValidationError,
  AppError,
} from '../../utils/errors.js';

export class AuthService {
  /**
   * Register a new gamer user (default)
   */
  async registerGamer({ email, username, password }) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      if (existing.email.toLowerCase() === email.toLowerCase()) {
        throw new ConflictError('An account with this email already exists');
      }
      throw new ConflictError('This username is already taken');
    }

    const passwordHash = await hashPassword(password);
    const rawVerificationToken = generateSecureToken(32);
    const verificationTokenHash = hashToken(rawVerificationToken);
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const userId = generateUuid();
    const baseSlug = username.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 50) || 'gamer';
    const existingProfile = await prisma.gamerProfile.findUnique({ where: { slug: baseSlug } });
    const profileSlug = existingProfile ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          email,
          username,
          passwordHash,
          accountType: 'GAMER',
          status: 'ACTIVE',
        },
      }),
      prisma.gamerProfile.create({
        data: {
          id: generateUuid(),
          userId,
          slug: profileSlug,
          displayName: username,
        },
      }),
      prisma.emailToken.create({
        data: {
          id: generateUuid(),
          userId,
          tokenHash: verificationTokenHash,
          purpose: 'EMAIL_VERIFICATION',
          expiresAt: verificationExpiresAt,
        },
      }),
      prisma.auditLog.create({
        data: {
          id: generateUuid(),
          actorId: userId,
          action: 'GAMER_REGISTERED',
          resourceType: 'User',
          resourceId: userId,
          details: { email, username, accountType: 'GAMER' },
        },
      }),
    ]);

    await emailService.sendVerificationEmail(email, rawVerificationToken);

    return {
      userId: user.id,
      accountType: 'GAMER',
      verificationRequired: true,
      debugVerificationToken:
        env.NODE_ENV === 'test' ? rawVerificationToken : undefined,
    };
  }

  /**
   * Register a new organizer user
   */
  async registerOrganizer({ email, username, password, organizationName, displayName }) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      if (existing.email.toLowerCase() === email.toLowerCase()) {
        throw new ConflictError('An account with this email already exists');
      }
      throw new ConflictError('This username is already taken');
    }

    const passwordHash = await hashPassword(password);
    const rawVerificationToken = generateSecureToken(32);
    const verificationTokenHash = hashToken(rawVerificationToken);
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const userId = generateUuid();
    const orgId = generateUuid();

    // Unique slug for organization
    const baseOrgSlug = (organizationName || 'org')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .slice(0, 50) || 'org';

    const existingOrg = await prisma.organization.findUnique({
      where: { slug: baseOrgSlug },
    });
    const orgSlug = existingOrg ? `${baseOrgSlug}-${Date.now().toString(36).slice(-4)}` : baseOrgSlug;

    // Unique slug for organizer profile
    const baseUserSlug = username.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 50) || 'organizer';
    const existingOrgProfile = await prisma.organizerProfile.findUnique({
      where: { slug: baseUserSlug },
    });
    const organizerProfileSlug = existingOrgProfile ? `${baseUserSlug}-${Date.now().toString(36).slice(-4)}` : baseUserSlug;

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          email,
          username,
          passwordHash,
          accountType: 'ORGANIZER',
          status: 'ACTIVE',
        },
      }),
      prisma.organizerProfile.create({
        data: {
          id: generateUuid(),
          userId,
          slug: organizerProfileSlug,
          displayName: displayName || username,
        },
      }),
      prisma.organization.create({
        data: {
          id: orgId,
          name: organizationName,
          slug: orgSlug,
          ownerId: userId,
          orgType: 'ORGANIZER',
        },
      }),
      prisma.organizationMembership.create({
        data: {
          id: generateUuid(),
          organizationId: orgId,
          userId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      }),
      prisma.emailToken.create({
        data: {
          id: generateUuid(),
          userId,
          tokenHash: verificationTokenHash,
          purpose: 'EMAIL_VERIFICATION',
          expiresAt: verificationExpiresAt,
        },
      }),
      prisma.auditLog.create({
        data: {
          id: generateUuid(),
          actorId: userId,
          action: 'ORGANIZER_REGISTERED',
          resourceType: 'User',
          resourceId: userId,
          details: { email, username, organizationName, accountType: 'ORGANIZER' },
        },
      }),
    ]);

    await emailService.sendVerificationEmail(email, rawVerificationToken);

    return {
      userId: user.id,
      accountType: 'ORGANIZER',
      verificationRequired: true,
      debugVerificationToken:
        env.NODE_ENV === 'test' ? rawVerificationToken : undefined,
    };
  }

  /**
   * General register (delegates to Gamer or Organizer)
   */
  async register(data) {
    if (data.accountType === 'ORGANIZER' || data.organizationName) {
      return this.registerOrganizer(data);
    }
    return this.registerGamer(data);
  }

  /**
   * Log in user and create server-side session with account-type verification
   */
  async login({ email, password, portal, accountType }) {
    const expectedAccountType = portal || accountType;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.status !== 'ACTIVE') {
      // Run dummy verify to mitigate timing attacks
      await verifyPassword(
        '$argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQ$abcdefghijklmnopqrstuvwxyz0123456789',
        password
      );
      throw new UnauthenticatedError('Invalid email or password');
    }

    const isMatch = await verifyPassword(user.passwordHash, password);
    if (!isMatch) {
      throw new UnauthenticatedError('Invalid email or password');
    }

    // Strict Account Type enforcement:
    const actualType = user.accountType || 'GAMER';
    if (expectedAccountType && expectedAccountType !== actualType) {
      if (expectedAccountType === 'GAMER' && actualType === 'ORGANIZER') {
        throw new ForbiddenError(
          'This account is registered as an Organizer. Please use Organizer Login.'
        );
      }
      if (expectedAccountType === 'ORGANIZER' && actualType === 'GAMER') {
        throw new ForbiddenError(
          'This account is registered as a Gamer. Please use Gamer Login.'
        );
      }
    }

    // Generate session token and store hash
    const rawSessionToken = generateSecureToken(32);
    const sessionTokenHash = hashToken(rawSessionToken);
    const expiresAt = new Date(
      Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000
    );

    const sessionId = generateUuid();

    const [session] = await prisma.$transaction([
      prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          tokenHash: sessionTokenHash,
          expiresAt,
        },
      }),
      prisma.auditLog.create({
        data: {
          id: generateUuid(),
          actorId: user.id,
          action: 'USER_LOGGED_IN',
          resourceType: 'Session',
          resourceId: sessionId,
          details: { accountType: actualType },
        },
      }),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        accountType: actualType,
        status: user.status,
        emailVerified: !!user.emailVerifiedAt,
      },
      session,
      rawSessionToken,
    };
  }

  /**
   * Revoke current session
   */
  async logout(sessionTokenHash, userId) {
    if (!sessionTokenHash) return;

    await prisma.$transaction([
      prisma.session.updateMany({
        where: { tokenHash: sessionTokenHash },
        data: { revokedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          id: generateUuid(),
          actorId: userId || null,
          action: 'USER_LOGGED_OUT',
          resourceType: 'Session',
        },
      }),
    ]);
  }

  /**
   * Revoke all sessions for a user
   */
  async logoutAll(userId) {
    if (!userId) return;

    await prisma.$transaction([
      prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          id: generateUuid(),
          actorId: userId,
          action: 'USER_LOGGED_OUT_ALL',
          resourceType: 'User',
          resourceId: userId,
        },
      }),
    ]);
  }

  /**
   * Initiate forgot-password workflow
   */
  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    let debugResetToken;

    if (user && user.status === 'ACTIVE') {
      const rawResetToken = generateSecureToken(32);
      const resetTokenHash = hashToken(rawResetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.$transaction([
        // Invalidate older unused reset tokens
        prisma.emailToken.updateMany({
          where: {
            userId: user.id,
            purpose: 'PASSWORD_RESET',
            usedAt: null,
          },
          data: {
            usedAt: new Date(),
          },
        }),
        prisma.emailToken.create({
          data: {
            id: generateUuid(),
            userId: user.id,
            tokenHash: resetTokenHash,
            purpose: 'PASSWORD_RESET',
            expiresAt,
          },
        }),
        prisma.auditLog.create({
          data: {
            id: generateUuid(),
            actorId: user.id,
            action: 'PASSWORD_RESET_REQUESTED',
            resourceType: 'User',
            resourceId: user.id,
          },
        }),
      ]);

      await emailService.sendPasswordResetEmail(email, rawResetToken);
      if (env.NODE_ENV === 'test') {
        debugResetToken = rawResetToken;
      }
    }

    return {
      accepted: true,
      debugResetToken,
    };
  }

  /**
   * Reset password with valid token
   */
  async resetPassword({ token, newPassword }) {
    const tokenHash = hashToken(token);

    const emailToken = await prisma.emailToken.findFirst({
      where: {
        tokenHash,
        purpose: 'PASSWORD_RESET',
        usedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!emailToken) {
      throw new ValidationError('Invalid or expired password reset token');
    }

    if (new Date() > new Date(emailToken.expiresAt)) {
      throw new AppError('Password reset token has expired', 'TOKEN_EXPIRED', 410);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: emailToken.userId },
        data: { passwordHash },
      }),
      prisma.emailToken.update({
        where: { id: emailToken.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all existing sessions after password reset
      prisma.session.updateMany({
        where: {
          userId: emailToken.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
      prisma.auditLog.create({
        data: {
          id: generateUuid(),
          actorId: emailToken.userId,
          action: 'PASSWORD_RESET_COMPLETED',
          resourceType: 'User',
          resourceId: emailToken.userId,
        },
      }),
    ]);

    return { reset: true };
  }

  /**
   * Verify email address with token
   */
  async verifyEmail(token) {
    const tokenHash = hashToken(token);

    const emailToken = await prisma.emailToken.findFirst({
      where: {
        tokenHash,
        purpose: 'EMAIL_VERIFICATION',
        usedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!emailToken) {
      throw new ValidationError('Invalid or expired verification token');
    }

    if (new Date() > new Date(emailToken.expiresAt)) {
      throw new AppError('Verification token has expired', 'TOKEN_EXPIRED', 410);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: emailToken.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailToken.update({
        where: { id: emailToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          id: generateUuid(),
          actorId: emailToken.userId,
          action: 'EMAIL_VERIFIED',
          resourceType: 'User',
          resourceId: emailToken.userId,
        },
      }),
    ]);

    return { verified: true };
  }

  /**
   * Resend email verification
   */
  async resendVerification(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    let debugVerificationToken;

    if (user && !user.emailVerifiedAt && user.status === 'ACTIVE') {
      const rawVerificationToken = generateSecureToken(32);
      const verificationTokenHash = hashToken(rawVerificationToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.$transaction([
        prisma.emailToken.updateMany({
          where: {
            userId: user.id,
            purpose: 'EMAIL_VERIFICATION',
            usedAt: null,
          },
          data: {
            usedAt: new Date(),
          },
        }),
        prisma.emailToken.create({
          data: {
            id: generateUuid(),
            userId: user.id,
            tokenHash: verificationTokenHash,
            purpose: 'EMAIL_VERIFICATION',
            expiresAt,
          },
        }),
      ]);

      await emailService.sendVerificationEmail(email, rawVerificationToken);
      if (env.NODE_ENV === 'test') {
        debugVerificationToken = rawVerificationToken;
      }
    }

    return { sent: true, debugVerificationToken };
  }
}

export const authService = new AuthService();

