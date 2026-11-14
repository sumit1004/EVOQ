import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/database/prisma.js';

describe('Simplified Gamer Teams & EVOQ ID Member Invitations', () => {
  let gamerA = null;
  let gamerACookie = null;
  let gamerACsrf = null;
  let gamerAProfile = null;

  let gamerB = null;
  let gamerBCookie = null;
  let gamerBCsrf = null;
  let gamerBProfile = null;

  let gamerC = null;
  let gamerCCookie = null;
  let gamerCCsrf = null;
  let gamerCProfile = null;

  const timestamp = Date.now();

  beforeAll(async () => {
    // 1. Register Gamer A (Creator)
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `gamer_a_${timestamp}@evoq.gg`,
        username: `gamer_a_${timestamp}`,
        password: 'Password123!',
        accountType: 'GAMER',
      });
    expect(resA.status).toBe(201);
    gamerA = { id: resA.body.data.userId };

    const loginA = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: `gamer_a_${timestamp}@evoq.gg`,
        password: 'Password123!',
      });
    expect(loginA.status).toBe(200);
    gamerACookie = loginA.headers['set-cookie'];
    gamerACsrf = loginA.body.data.csrfToken;
    gamerAProfile = await prisma.gamerProfile.findUnique({ where: { userId: gamerA.id } });

    // 2. Register Gamer B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `gamer_b_${timestamp}@evoq.gg`,
        username: `gamer_b_${timestamp}`,
        password: 'Password123!',
        accountType: 'GAMER',
      });
    expect(resB.status).toBe(201);
    gamerB = { id: resB.body.data.userId };

    const loginB = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: `gamer_b_${timestamp}@evoq.gg`,
        password: 'Password123!',
      });
    expect(loginB.status).toBe(200);
    gamerBCookie = loginB.headers['set-cookie'];
    gamerBCsrf = loginB.body.data.csrfToken;
    gamerBProfile = await prisma.gamerProfile.findUnique({ where: { userId: gamerB.id } });

    // 3. Register Gamer C
    const resC = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `gamer_c_${timestamp}@evoq.gg`,
        username: `gamer_c_${timestamp}`,
        password: 'Password123!',
        accountType: 'GAMER',
      });
    expect(resC.status).toBe(201);
    gamerC = { id: resC.body.data.userId };

    const loginC = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: `gamer_c_${timestamp}@evoq.gg`,
        password: 'Password123!',
      });
    expect(loginC.status).toBe(200);
    gamerCCookie = loginC.headers['set-cookie'];
    gamerCCsrf = loginC.body.data.csrfToken;
    gamerCProfile = await prisma.gamerProfile.findUnique({ where: { userId: gamerC.id } });
  });

  afterAll(async () => {
    const userIds = [gamerA?.id, gamerB?.id, gamerC?.id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.teamInvitation.deleteMany({
        where: { OR: [{ inviterId: { in: userIds } }, { inviteeId: { in: userIds } }] },
      });
      await prisma.teamRosterHistory.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.teamMembership.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.team.deleteMany({
        where: { ownerId: { in: userIds } },
      });
      await prisma.emailToken.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.auditLog.deleteMany({
        where: { actorId: { in: userIds } },
      });
      await prisma.notification.deleteMany({
        where: { recipientId: { in: userIds } },
      });
      await prisma.gamerProfile.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.session.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }
  });

  it('1. Allows creating a Solo team (maxMembers = 1)', async () => {
    const res = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        name: `Solo Apex ${timestamp}`,
        maxMembers: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(`Solo Apex ${timestamp}`);
    expect(res.body.data.maxMembers).toBe(1);
    expect(res.body.data.ownerId).toBe(gamerA.id);

    // Verify creator is automatically the only confirmed member
    const memberships = await prisma.teamMembership.findMany({
      where: { teamId: res.body.data.id, status: 'ACTIVE' },
    });
    expect(memberships).toHaveLength(1);
    expect(memberships[0].userId).toBe(gamerA.id);
    expect(memberships[0].role).toBe('OWNER');
  });

  it('2. Allows creating a Duo team (maxMembers = 2)', async () => {
    const res = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        name: `Duo Kings ${timestamp}`,
        maxMembers: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.maxMembers).toBe(2);
  });

  it('3. Allows creating a Squad team (default size = 4) with optional logo', async () => {
    const res = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        name: `Squad Prime ${timestamp}`,
        logoUrl: '/uploads/custom-logo.png',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.maxMembers).toBe(4); // Default 4
    expect(res.body.data.logoUrl).toBe('/uploads/custom-logo.png');
  });

  it('4. Rejects invalid team names (empty or whitespace)', async () => {
    const res = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        name: '   ',
        maxMembers: 4,
      });

    expect(res.status).toBe(400);
  });

  it('5. Rejects inviting oneself using own EVOQ ID', async () => {
    const createTeamRes = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        name: `Self Invite Test ${timestamp}`,
        maxMembers: 4,
      });
    expect(createTeamRes.status).toBe(201);
    const teamId = createTeamRes.body.data.id;

    const inviteRes = await request(app)
      .post(`/api/v1/teams/${teamId}/invitations`)
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        evoqId: gamerAProfile.evoqId,
      });

    expect(inviteRes.status).toBe(400);
    expect(inviteRes.body.error.message).toMatch(/cannot invite yourself/i);
  });

  it('6. Rejects nonexistent EVOQ ID', async () => {
    const createTeamRes = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        name: `Nonexistent Invite Test ${timestamp}`,
        maxMembers: 4,
      });
    expect(createTeamRes.status).toBe(201);
    const teamId = createTeamRes.body.data.id;

    const inviteRes = await request(app)
      .post(`/api/v1/teams/${teamId}/invitations`)
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        evoqId: 'EVOQ-999999999',
      });

    expect(inviteRes.status).toBe(404);
  });

  it('7. Invites player using valid EVOQ ID and allows acceptance within capacity', async () => {
    // Create Trio Team (size 3)
    const createRes = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        name: `Trio Force ${timestamp}`,
        maxMembers: 3,
      });
    expect(createRes.status).toBe(201);
    const teamId = createRes.body.data.id;

    // Send invitation to Gamer B via EVOQ ID
    const inviteRes = await request(app)
      .post(`/api/v1/teams/${teamId}/invitations`)
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        evoqId: gamerBProfile.evoqId,
      });
    expect(inviteRes.status).toBe(201);
    const invitationId = inviteRes.body.data.id;
    expect(inviteRes.body.data.status).toBe('PENDING');

    // Gamer B receives invitation in /my/invitations
    const invitesBRes = await request(app)
      .get('/api/v1/teams/my/invitations')
      .set('Cookie', gamerBCookie);
    expect(invitesBRes.status).toBe(200);
    const foundInvite = invitesBRes.body.data.find((inv) => inv.id === invitationId);
    expect(foundInvite).toBeDefined();

    // Gamer B accepts invitation
    const respondRes = await request(app)
      .post(`/api/v1/teams/invitations/${invitationId}/respond`)
      .set('Cookie', gamerBCookie)
      .set('x-csrf-token', gamerBCsrf)
      .send({ action: 'ACCEPT' });
    expect(respondRes.status).toBe(200);

    // Verify Gamer B is now active member
    const activeMembers = await prisma.teamMembership.findMany({
      where: { teamId, status: 'ACTIVE' },
    });
    expect(activeMembers).toHaveLength(2); // Gamer A + Gamer B
  });

  it('8. Enforces capacity and prevents overfilling', async () => {
    // Create Duo Team (size 2)
    const createRes = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        name: `Duo Enforce ${timestamp}`,
        maxMembers: 2,
      });
    expect(createRes.status).toBe(201);
    const teamId = createRes.body.data.id;

    // Invite Gamer B (slot 2/2)
    const inviteBRes = await request(app)
      .post(`/api/v1/teams/${teamId}/invitations`)
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({ evoqId: gamerBProfile.evoqId });
    expect(inviteBRes.status).toBe(201);

    // Attempting to invite Gamer C should fail because team is at capacity (1 active + 1 pending = 2 max)
    const inviteCRes = await request(app)
      .post(`/api/v1/teams/${teamId}/invitations`)
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({ evoqId: gamerCProfile.evoqId });
    expect(inviteCRes.status).toBe(409);
    expect(inviteCRes.body.error.message).toMatch(/capacity/i);
  });

  it('9. Allows canceling an outgoing pending invitation', async () => {
    const createRes = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        name: `Cancel Invite Test ${timestamp}`,
        maxMembers: 4,
      });
    expect(createRes.status).toBe(201);
    const teamId = createRes.body.data.id;

    const inviteRes = await request(app)
      .post(`/api/v1/teams/${teamId}/invitations`)
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({ evoqId: gamerCProfile.evoqId });
    expect(inviteRes.status).toBe(201);
    const invitationId = inviteRes.body.data.id;

    // Cancel invitation
    const cancelRes = await request(app)
      .delete(`/api/v1/teams/${teamId}/invitations/${invitationId}`)
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf);
    expect(cancelRes.status).toBe(200);

    const invInDb = await prisma.teamInvitation.findUnique({ where: { id: invitationId } });
    expect(invInDb.status).toBe('CANCELLED');
  });

  it('10. Prevents reducing team size below current confirmed member count', async () => {
    // Create team with size 4, add Gamer B
    const createRes = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({
        name: `Resize Test ${timestamp}`,
        maxMembers: 4,
      });
    const teamId = createRes.body.data.id;

    const inviteRes = await request(app)
      .post(`/api/v1/teams/${teamId}/invitations`)
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({ evoqId: gamerBProfile.evoqId });
    await request(app)
      .post(`/api/v1/teams/invitations/${inviteRes.body.data.id}/respond`)
      .set('Cookie', gamerBCookie)
      .set('x-csrf-token', gamerBCsrf)
      .send({ action: 'ACCEPT' });

    // Team currently has 2 active members (A and B). Trying to shrink maxMembers to 1 must fail.
    const resizeRes = await request(app)
      .patch(`/api/v1/teams/${teamId}`)
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({ maxMembers: 1 });

    expect(resizeRes.status).toBe(400);
    expect(resizeRes.body.error.message).toMatch(/active members/i);

    // Resizing to 3 or 5 is allowed
    const validResize = await request(app)
      .patch(`/api/v1/teams/${teamId}`)
      .set('Cookie', gamerACookie)
      .set('x-csrf-token', gamerACsrf)
      .send({ maxMembers: 5 });
    expect(validResize.status).toBe(200);
    expect(validResize.body.data.maxMembers).toBe(5);
  });
});
