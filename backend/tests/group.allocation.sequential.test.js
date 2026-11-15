import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/database/prisma.js';
import { generateUuid } from '../src/utils/uuid.js';

describe('EVOQ Group Allocation Logic (Minimum 1 Group, Sequential Filling & Capacity)', () => {
  let organizer = null;
  let organizerCookie = null;
  let organizerCsrf = null;

  let game = null;
  let tournament = null;
  let round1 = null;
  const registrations = [];
  const timestamp = Date.now();

  beforeAll(async () => {
    // 1. Register & Login Organizer
    const resOrg = await request(app)
      .post('/api/v1/auth/register/organizer')
      .send({
        email: `alloc_org_${timestamp}@evoq.gg`,
        username: `alloc_org_${timestamp}`,
        organizationName: `Alloc Org ${timestamp}`,
        password: 'Password123!',
      });
    expect(resOrg.status).toBe(201);
    organizer = { id: resOrg.body.data.userId };

    const loginOrg = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: `alloc_org_${timestamp}@evoq.gg`,
        password: 'Password123!',
      });
    expect(loginOrg.status).toBe(200);
    organizerCookie = loginOrg.headers['set-cookie'];
    organizerCsrf = loginOrg.body.data.csrfToken;

    // 2. Fetch Game
    game = await prisma.game.findFirst();

    // 3. Create Tournament
    const tRes = await request(app)
      .post('/api/v1/tournaments')
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: `Allocation Tourney ${timestamp}`,
        slug: `alloc-tourney-${timestamp}`,
        gameId: game.id,
        format: 'BATTLE_ROYALE',
        participationType: 'TEAM',
        teamSize: 4,
        minParticipants: 2,
        maxParticipants: 16,
        registrationStart: new Date(Date.now() - 3600000).toISOString(),
        registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
        startDate: new Date(Date.now() + 172800000).toISOString(),
        formatConfig: {
          matchEngine: 'BATTLE_ROYALE',
          scoringRuleset: {
            placementPoints: { 1: 12, 2: 9, 3: 8 },
            eliminationPointValue: 1,
          },
        },
      });
    expect(tRes.status).toBe(201);
    tournament = tRes.body.data;

    // 4. Create Round 1
    const rRes = await request(app)
      .post(`/api/v1/tournaments/${tournament.id}/rounds`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: 'Round 1 - Group Stage',
        roundType: 'GROUP',
      });
    expect(rRes.status).toBe(201);
    round1 = rRes.body.data;

    // 5. Seed 8 Teams & Approved Registrations
    for (let i = 1; i <= 8; i++) {
      const teamId = generateUuid();
      const team = await prisma.team.create({
        data: {
          id: teamId,
          name: `Squad ${i} - ${timestamp}`,
          slug: `sq-${i}-${timestamp}`,
          ownerId: organizer.id,
          maxMembers: 4,
          primaryGameId: game.id,
        },
      });

      const reg = await prisma.tournamentRegistration.create({
        data: {
          id: generateUuid(),
          tournamentId: tournament.id,
          teamId: team.id,
          registeredById: organizer.id,
          entrantType: 'TEAM',
          status: 'APPROVED',
          seed: i,
        },
      });
      registrations.push(reg);
    }
  });

  afterAll(async () => {
    if (tournament?.id) {
      await prisma.standingRow.deleteMany({ where: { snapshot: { tournamentId: tournament.id } } });
      await prisma.standingSnapshot.deleteMany({ where: { tournamentId: tournament.id } });
      await prisma.competitionGroup.deleteMany({ where: { stage: { tournamentId: tournament.id } } });
      await prisma.tournamentRound.deleteMany({ where: { stage: { tournamentId: tournament.id } } });
      await prisma.tournamentStage.deleteMany({ where: { tournamentId: tournament.id } });
      await prisma.tournamentRegistration.deleteMany({ where: { tournamentId: tournament.id } });
      await prisma.tournamentStaff.deleteMany({ where: { tournamentId: tournament.id } });
      await prisma.tournament.delete({ where: { id: tournament.id } }).catch(() => {});
    }
    if (organizer?.id) {
      await prisma.auditLog.deleteMany({ where: { actorId: organizer.id } });
      await prisma.emailToken.deleteMany({ where: { userId: organizer.id } });
      await prisma.organizationMembership.deleteMany({ where: { userId: organizer.id } });
      await prisma.organization.deleteMany({ where: { ownerId: organizer.id } });
      await prisma.organizerProfile.deleteMany({ where: { userId: organizer.id } });
      await prisma.team.deleteMany({ where: { ownerId: organizer.id } });
      await prisma.session.deleteMany({ where: { userId: organizer.id } });
      await prisma.user.delete({ where: { id: organizer.id } }).catch(() => {});
    }
  });

  it('1. Allows creating a single-group round (1 group with 2 teams)', async () => {
    const res = await request(app)
      .post(`/api/v1/competition/rounds/${round1.id}/groups/randomize`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        groupCount: 1,
        registrationIds: [registrations[0].id, registrations[1].id],
        commit: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.committed).toBe(false);
    expect(res.body.data.distribution.length).toBe(1);
    expect(res.body.data.distribution[0].name).toBe('Group A');
    expect(res.body.data.distribution[0].registrationIds.length).toBe(2);
  });

  it('2. Sequential Allocation: 2 teams, 2 groups, capacity 2 (Group A: 2 teams, Group B: Empty)', async () => {
    const res = await request(app)
      .post(`/api/v1/competition/rounds/${round1.id}/groups/randomize`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        groupCount: 2,
        groupCapacity: 2,
        registrationIds: [registrations[0].id, registrations[1].id],
        commit: false,
      });

    expect(res.status).toBe(200);
    const dist = res.body.data.distribution;
    expect(dist.length).toBe(2);
    // Group A must be filled to capacity (2 teams)
    expect(dist[0].name).toBe('Group A');
    expect(dist[0].registrationIds.length).toBe(2);
    // Group B must be EMPTY (0 teams)
    expect(dist[1].name).toBe('Group B');
    expect(dist[1].registrationIds.length).toBe(0);
    expect(res.body.data.unassignedRegistrationIds.length).toBe(0);
  });

  it('3. Sequential Allocation: 5 teams, 3 groups, capacity 2 (Group A: 2, Group B: 2, Group C: 1)', async () => {
    const candidateIds = registrations.slice(0, 5).map((r) => r.id);
    const res = await request(app)
      .post(`/api/v1/competition/rounds/${round1.id}/groups/randomize`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        groupCount: 3,
        groupCapacity: 2,
        registrationIds: candidateIds,
        commit: false,
      });

    expect(res.status).toBe(200);
    const dist = res.body.data.distribution;
    expect(dist.length).toBe(3);
    expect(dist[0].registrationIds.length).toBe(2); // Group A full
    expect(dist[1].registrationIds.length).toBe(2); // Group B full
    expect(dist[2].registrationIds.length).toBe(1); // Group C remainder
    expect(res.body.data.unassignedRegistrationIds.length).toBe(0);
  });

  it('4. Sequential Allocation: 8 teams, 3 groups, capacity 3 (Group A: 3, Group B: 3, Group C: 2)', async () => {
    const candidateIds = registrations.map((r) => r.id);
    const res = await request(app)
      .post(`/api/v1/competition/rounds/${round1.id}/groups/randomize`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        groupCount: 3,
        groupCapacity: 3,
        registrationIds: candidateIds,
        commit: false,
      });

    expect(res.status).toBe(200);
    const dist = res.body.data.distribution;
    expect(dist.length).toBe(3);
    expect(dist[0].registrationIds.length).toBe(3); // Group A full
    expect(dist[1].registrationIds.length).toBe(3); // Group B full
    expect(dist[2].registrationIds.length).toBe(2); // Group C has remaining 2
    expect(res.body.data.unassignedRegistrationIds.length).toBe(0);
  });

  it('5. Allows one group with all 8 eligible teams', async () => {
    const candidateIds = registrations.map((r) => r.id);
    const res = await request(app)
      .post(`/api/v1/competition/rounds/${round1.id}/groups/randomize`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        groupCount: 1,
        groupCapacity: 8,
        registrationIds: candidateIds,
        commit: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.distribution.length).toBe(1);
    expect(res.body.data.distribution[0].registrationIds.length).toBe(8);
  });

  it('6. Rejects manual allocation when a group exceeds configured capacity', async () => {
    const res = await request(app)
      .post(`/api/v1/competition/rounds/${round1.id}/groups`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        groups: [
          {
            name: 'Group A',
            capacity: 2,
            registrationIds: [registrations[0].id, registrations[1].id, registrations[2].id], // 3 teams in capacity 2
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('capacity exceeded');
  });

  it('7. Rejects duplicate team allocation to multiple groups in the same round', async () => {
    const res = await request(app)
      .post(`/api/v1/competition/rounds/${round1.id}/groups`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        groups: [
          {
            name: 'Group A',
            capacity: 2,
            registrationIds: [registrations[0].id],
          },
          {
            name: 'Group B',
            capacity: 2,
            registrationIds: [registrations[0].id], // Duplicate team!
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('cannot be allocated to multiple groups');
  });

  it('8. Rejects ineligible or unregistered team allocation', async () => {
    const fakeUuid = generateUuid();
    const res = await request(app)
      .post(`/api/v1/competition/rounds/${round1.id}/groups`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        groups: [
          {
            name: 'Group A',
            capacity: 2,
            registrationIds: [fakeUuid],
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Cannot allocate ineligible or unregistered team');
  });

  it('9. Allows saving empty groups and reloads group assignments correctly', async () => {
    // Save 2 groups: Group A with 2 teams, Group B empty
    const saveRes = await request(app)
      .post(`/api/v1/competition/rounds/${round1.id}/groups`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        groups: [
          {
            name: 'Main Lobby',
            capacity: 2,
            registrationIds: [registrations[0].id, registrations[1].id],
          },
          {
            name: 'Reserve Lobby',
            capacity: 2,
            registrationIds: [], // Empty group
          },
        ],
      });

    expect(saveRes.status).toBe(201);
    expect(saveRes.body.data.length).toBe(2);
    const mainGroup = saveRes.body.data[0];
    const reserveGroup = saveRes.body.data[1];

    // Reload round details
    const roundDetailsRes = await request(app)
      .get(`/api/v1/competition/rounds/${round1.id}`)
      .set('Cookie', organizerCookie);
    expect(roundDetailsRes.status).toBe(200);
    expect(roundDetailsRes.body.data.groups.length).toBe(2);

    // Reload group details for mainGroup
    const mainGroupRes = await request(app)
      .get(`/api/v1/competition/groups/${mainGroup.id}`)
      .set('Cookie', organizerCookie);
    expect(mainGroupRes.status).toBe(200);
    expect(mainGroupRes.body.data.allocatedTeams.length).toBe(2);

    // Reload group details for reserveGroup (empty)
    const reserveGroupRes = await request(app)
      .get(`/api/v1/competition/groups/${reserveGroup.id}`)
      .set('Cookie', organizerCookie);
    expect(reserveGroupRes.status).toBe(200);
    expect(reserveGroupRes.body.data.allocatedTeams.length).toBe(0);
  });
});

