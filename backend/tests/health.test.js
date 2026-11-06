import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/database/prisma.js';

describe('GET /api/v1/health', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns 200 with status ok and connected db', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.db).toBe('connected');
    expect(res.body.data.timestamp).toBeDefined();
    expect(res.body.meta.requestId).toBeDefined();
  });
});

describe('Unknown route', () => {
  it('returns 404 with NOT_FOUND error', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
