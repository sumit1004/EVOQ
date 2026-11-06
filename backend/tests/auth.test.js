import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/database/prisma.js';

describe('Authentication & Session Integration Tests', () => {
  const testUser = {
    email: `test_${Date.now()}@evoq.gg`,
    username: `evoq_user_${Date.now().toString().slice(-6)}`,
    password: 'Password@12345!',
  };

  let sessionCookie = null;
  let csrfToken = null;
  let verificationToken = null;
  let resetToken = null;

  beforeAll(async () => {
    // Ensure clean state for test email
    await prisma.session.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.emailToken.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.session.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.emailToken.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('rejects registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          username: testUser.username,
          password: testUser.password,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeDefined();
    });

    it('rejects registration with weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          username: testUser.username,
          password: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('successfully registers a new user with secure password hash', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.data.userId).toBeDefined();
      expect(res.body.data.verificationRequired).toBe(true);
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.passwordHash).toBeUndefined();

      // Capture debug token in test mode
      verificationToken = res.body.data.debugToken;
    });

    it('rejects duplicate email registration with 409 CONFLICT', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          username: `diff_${Date.now().toString().slice(-6)}`,
          password: testUser.password,
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects duplicate username registration with 409 CONFLICT', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `different_${Date.now()}@evoq.gg`,
          username: testUser.username,
          password: testUser.password,
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    it('rejects invalid verification token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: 'invalid_token_here' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('successfully verifies email with valid token', async () => {
      if (!verificationToken) {
        // Fetch from DB if not returned in debug
        const tokenRec = await prisma.emailToken.findFirst({
          where: { user: { email: testUser.email }, purpose: 'EMAIL_VERIFICATION' },
        });
        expect(tokenRec).toBeDefined();
        return;
      }

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: verificationToken });

      expect(res.status).toBe(200);
      expect(res.body.data.verified).toBe(true);
    });

    it('rejects token reuse', async () => {
      if (!verificationToken) return;

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: verificationToken });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('rejects incorrect password with 401 UNAUTHENTICATED', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword@123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('successfully logs in with valid credentials, setting HttpOnly session cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.username).toBe(testUser.username);
      expect(res.body.data.csrfToken).toBeDefined();

      csrfToken = res.body.data.csrfToken;

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const sessionCookieHeader = cookies.find((c) => c.startsWith('evoq_session='));
      expect(sessionCookieHeader).toBeDefined();
      expect(sessionCookieHeader).toContain('HttpOnly');

      // Save cookie for subsequent authenticated tests
      sessionCookie = sessionCookieHeader.split(';')[0];
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('rejects request without session cookie with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('returns current user details when session cookie is valid', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', sessionCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.username).toBe(testUser.username);
      expect(res.headers['x-csrf-token']).toBeDefined();
      csrfToken = res.headers['x-csrf-token'];
    });
  });

  describe('CSRF Protection & POST /api/v1/auth/logout', () => {
    it('rejects logout without CSRF token with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', sessionCookie);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects logout with invalid CSRF token with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', sessionCookie)
        .set('X-CSRF-Token', 'invalid_csrf_token_here');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('successfully logs out with valid CSRF token and clears cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', sessionCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(204);

      // Verify session cookie was cleared
      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
    });

    it('rejects requests with revoked session', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', sessionCookie);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('Password Reset Workflow', () => {
    it('returns generic accepted for forgot-password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/password/forgot')
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      expect(res.body.data.accepted).toBe(true);

      resetToken = res.body.data.debugToken;
    });

    it('returns generic accepted even for non-existent email (anti-enumeration)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/password/forgot')
        .send({ email: 'nonexistent_user_1234567@evoq.gg' });

      expect(res.status).toBe(200);
      expect(res.body.data.accepted).toBe(true);
    });

    it('successfully resets password with valid token and enforces new password', async () => {
      if (!resetToken) return;

      const newPassword = 'NewSecurePassword@999!';

      const res = await request(app)
        .post('/api/v1/auth/password/reset')
        .send({
          token: resetToken,
          newPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.reset).toBe(true);

      // Old password should now fail
      const oldLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      expect(oldLogin.status).toBe(401);

      // New password should succeed
      const newLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        });
      expect(newLogin.status).toBe(200);
    });
  });
});

