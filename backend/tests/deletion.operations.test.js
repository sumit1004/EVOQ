import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/database/prisma.js';
import { generateUuid } from '../src/utils/uuid.js';

describe('EVOQ Deletion Operations (Teams, Tournaments, Stages, Rounds, Groups, Matches)', () => {
  let organizer = null;
  let organizerCookie = null;
  let organizerCsrf = null;

  let gamer = null;
  let gamerCookie = null;
  let gamerCsrf = null;

  let game = null;
  const timestamp = Date.now();

  beforeAll(async () => {
    // 1. Register Organizer
    const resOrg = await request(app)
      .post('/api/v1/auth/register/organizer')
      .send({
        email: `del_org_${timestamp}@evoq.gg`,
        username: `del_org_${timestamp}`,
        organizationName: `Del Org ${timestamp}`,
        password: 'Password123!',
      });
    expect(resOrg.status).toBe(201);
    organizer = { id: resOrg.body.data.userId };

    const loginOrg = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: `del_org_${timestamp}@evoq.gg`,
        password: 'Password123!',
      });
    expect(loginOrg.status).toBe(200);
    organizerCookie = loginOrg.headers['set-cookie'];
    organizerCsrf = loginOrg.body.data.csrfToken;

    // 2. Register Gamer
    const resGamer = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `del_gamer_${timestamp}@evoq.gg`,
        username: `del_gamer_${timestamp}`,
        password: 'Password123!',
        accountType: 'GAMER',
      });
    expect(resGamer.status).toBe(201);
    gamer = { id: resGamer.body.data.userId };

    const loginGamer = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: `del_gamer_${timestamp}@evoq.gg`,
        password: 'Password123!',
      });
    expect(loginGamer.status).toBe(200);
    gamerCookie = loginGamer.headers['set-cookie'];
    gamerCsrf = loginGamer.body.data.csrfToken;

    // 3. Game
    game = await prisma.game.findFirst();
  });

  afterAll(async () => {
    const userIds = [organizer?.id, gamer?.id].filter(Boolean);
    if (userIds.length > 0) {
      // Find tournaments by organizer
      const tourneys = await prisma.tournament.findMany({
        where: { organizerUserId: { in: userIds } },
        select: { id: true },
      });
      const tIds = tourneys.map((t) => t.id);
      if (tIds.length > 0) {
        await prisma.matchParticipant.deleteMany({
          where: { match: { tournamentId: { in: tIds } } },
        });
        await prisma.matchCredential.deleteMany({
          where: { match: { tournamentId: { in: tIds } } },
        });
        await prisma.matchResult.deleteMany({
          where: { match: { tournamentId: { in: tIds } } },
        });
        await prisma.match.deleteMany({ where: { tournamentId: { in: tIds } } });
        await prisma.standingRow.deleteMany({
          where: { snapshot: { tournamentId: { in: tIds } } },
        });
        await prisma.standingSnapshot.deleteMany({ where: { tournamentId: { in: tIds } } });
        await prisma.competitionGroup.deleteMany({
          where: { stage: { tournamentId: { in: tIds } } },
        });
        await prisma.tournamentRound.deleteMany({
          where: { stage: { tournamentId: { in: tIds } } },
        });
        await prisma.tournamentStage.deleteMany({ where: { tournamentId: { in: tIds } } });
        await prisma.registrationMember.deleteMany({
          where: { registration: { tournamentId: { in: tIds } } },
        });
        await prisma.tournamentRegistration.deleteMany({ where: { tournamentId: { in: tIds } } });
        await prisma.tournamentStaff.deleteMany({ where: { tournamentId: { in: tIds } } });
        await prisma.tournament.deleteMany({ where: { id: { in: tIds } } });
      }

      await prisma.teamInvitation.deleteMany({
        where: { OR: [{ inviterId: { in: userIds } }, { inviteeId: { in: userIds } }] },
      });
      await prisma.teamRosterHistory.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.teamMembership.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.team.deleteMany({ where: { ownerId: { in: userIds } } });
      await prisma.organizationMembership.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.organization.deleteMany({ where: { ownerId: { in: userIds } } });
      await prisma.organizerProfile.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.gamerProfile.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.emailToken.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
      await prisma.notification.deleteMany({ where: { recipientId: { in: userIds } } });
      await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
  });

  it('1. Allows team owner to delete a squad (DELETE /api/v1/teams/:id)', async () => {
    // Gamer creates a team
    const createRes = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerCookie)
      .set('x-csrf-token', gamerCsrf)
      .send({
        name: `Team To Delete ${timestamp}`,
        maxMembers: 4,
      });
    expect(createRes.status).toBe(201);
    const teamId = createRes.body.data.id;

    // Verify team exists in database
    const teamBefore = await prisma.team.findUnique({ where: { id: teamId } });
    expect(teamBefore).toBeDefined();

    // Delete team
    const deleteRes = await request(app)
      .delete(`/api/v1/teams/${teamId}`)
      .set('Cookie', gamerCookie)
      .set('x-csrf-token', gamerCsrf);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.data.success).toBe(true);

    // Verify team is gone from database
    const teamAfter = await prisma.team.findUnique({ where: { id: teamId } });
    expect(teamAfter).toBeNull();
  });

  it('2. Rejects unauthorized user attempting to delete another team', async () => {
    // Gamer creates a team
    const createRes = await request(app)
      .post('/api/v1/teams')
      .set('Cookie', gamerCookie)
      .set('x-csrf-token', gamerCsrf)
      .send({
        name: `Protected Team ${timestamp}`,
        maxMembers: 4,
      });
    expect(createRes.status).toBe(201);
    const teamId = createRes.body.data.id;

    // Organizer (not the owner) tries to delete it
    const deleteRes = await request(app)
      .delete(`/api/v1/teams/${teamId}`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf);
    expect([401, 403]).toContain(deleteRes.status);
  });

  it('3. Allows organizer to delete an individual match (DELETE /api/v1/competition/matches/:id)', async () => {
    // Create tournament
    const tRes = await request(app)
      .post('/api/v1/tournaments')
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: `Match Delete Tourney ${timestamp}`,
        slug: `del-match-${timestamp}`,
        gameId: game.id,
        format: 'SINGLE_ELIMINATION',
        maxParticipants: 8,
        registrationStart: new Date(Date.now() - 3600000).toISOString(),
        registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
        startDate: new Date(Date.now() + 172800000).toISOString(),
      });
    expect(tRes.status).toBe(201);
    const tournamentId = tRes.body.data.id;

    // Manually create a stage, round, and match
    const stageId = generateUuid();
    await prisma.tournamentStage.create({
      data: {
        id: stageId,
        tournamentId,
        name: 'Knockout Stage',
        sequence: 1,
      },
    });

    const roundId = generateUuid();
    await prisma.tournamentRound.create({
      data: {
        id: roundId,
        stageId,
        name: 'Quarterfinals',
        sequence: 1,
      },
    });

    const matchId = generateUuid();
    await prisma.match.create({
      data: {
        id: matchId,
        tournamentId,
        stageId,
        roundId,
        matchNumber: 1,
        title: 'QF Match 1',
      },
    });

    // Delete match
    const deleteRes = await request(app)
      .delete(`/api/v1/competition/matches/${matchId}`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.data.success).toBe(true);

    const matchAfter = await prisma.match.findUnique({ where: { id: matchId } });
    expect(matchAfter).toBeNull();
  });

  it('4. Allows organizer to delete a competition group (DELETE /api/v1/competition/groups/:id)', async () => {
    // Create tournament & stage
    const tRes = await request(app)
      .post('/api/v1/tournaments')
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: `Group Delete Tourney ${timestamp}`,
        slug: `del-group-${timestamp}`,
        gameId: game.id,
        format: 'BATTLE_ROYALE',
        maxParticipants: 16,
        registrationStart: new Date(Date.now() - 3600000).toISOString(),
        registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
        startDate: new Date(Date.now() + 172800000).toISOString(),
      });
    expect(tRes.status).toBe(201);
    const tournamentId = tRes.body.data.id;

    const stageId = generateUuid();
    await prisma.tournamentStage.create({
      data: { id: stageId, tournamentId, name: 'Group Stage', sequence: 1 },
    });

    const groupId = generateUuid();
    await prisma.competitionGroup.create({
      data: { id: groupId, stageId, name: 'Group Alpha', sequence: 1 },
    });

    // Create match inside group
    const matchId = generateUuid();
    await prisma.match.create({
      data: { id: matchId, tournamentId, stageId, groupId, matchNumber: 1, title: 'Alpha Match 1' },
    });

    // Delete group
    const delRes = await request(app)
      .delete(`/api/v1/competition/groups/${groupId}`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf);
    expect(delRes.status).toBe(200);

    // Verify group and its matches were deleted
    const groupAfter = await prisma.competitionGroup.findUnique({ where: { id: groupId } });
    const matchAfter = await prisma.match.findUnique({ where: { id: matchId } });
    expect(groupAfter).toBeNull();
    expect(matchAfter).toBeNull();
  });

  it('5. Allows organizer to delete a tournament round (DELETE /api/v1/competition/rounds/:id)', async () => {
    const tRes = await request(app)
      .post('/api/v1/tournaments')
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: `Round Delete Tourney ${timestamp}`,
        slug: `del-round-${timestamp}`,
        gameId: game.id,
        format: 'SINGLE_ELIMINATION',
        maxParticipants: 8,
        registrationStart: new Date(Date.now() - 3600000).toISOString(),
        registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
        startDate: new Date(Date.now() + 172800000).toISOString(),
      });
    expect(tRes.status).toBe(201);
    const tournamentId = tRes.body.data.id;

    const stageId = generateUuid();
    await prisma.tournamentStage.create({
      data: { id: stageId, tournamentId, name: 'Main Bracket', sequence: 1 },
    });

    const roundId = generateUuid();
    await prisma.tournamentRound.create({
      data: { id: roundId, stageId, name: 'Round 1', sequence: 1 },
    });

    const matchId = generateUuid();
    await prisma.match.create({
      data: { id: matchId, tournamentId, stageId, roundId, matchNumber: 1, title: 'R1M1' },
    });

    // Delete round
    const delRes = await request(app)
      .delete(`/api/v1/competition/rounds/${roundId}`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf);
    expect(delRes.status).toBe(200);

    const roundAfter = await prisma.tournamentRound.findUnique({ where: { id: roundId } });
    const matchAfter = await prisma.match.findUnique({ where: { id: matchId } });
    expect(roundAfter).toBeNull();
    expect(matchAfter).toBeNull();
  });

  it('6. Allows organizer to delete a tournament stage (DELETE /api/v1/competition/stages/:id)', async () => {
    const tRes = await request(app)
      .post('/api/v1/tournaments')
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: `Stage Delete Tourney ${timestamp}`,
        slug: `del-stage-${timestamp}`,
        gameId: game.id,
        format: 'SINGLE_ELIMINATION',
        maxParticipants: 8,
        registrationStart: new Date(Date.now() - 3600000).toISOString(),
        registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
        startDate: new Date(Date.now() + 172800000).toISOString(),
      });
    expect(tRes.status).toBe(201);
    const tournamentId = tRes.body.data.id;

    const stageId = generateUuid();
    await prisma.tournamentStage.create({
      data: { id: stageId, tournamentId, name: 'Preliminary Stage', sequence: 1 },
    });

    // Delete stage
    const delRes = await request(app)
      .delete(`/api/v1/competition/stages/${stageId}`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf);
    expect(delRes.status).toBe(200);

    const stageAfter = await prisma.tournamentStage.findUnique({ where: { id: stageId } });
    expect(stageAfter).toBeNull();
  });

  it('7. Allows organizer to delete an entire tournament (DELETE /api/v1/tournaments/:id)', async () => {
    const tRes = await request(app)
      .post('/api/v1/tournaments')
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: `Tournament To Erase ${timestamp}`,
        slug: `del-erase-${timestamp}`,
        gameId: game.id,
        format: 'SINGLE_ELIMINATION',
        maxParticipants: 8,
        registrationStart: new Date(Date.now() - 3600000).toISOString(),
        registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
        startDate: new Date(Date.now() + 172800000).toISOString(),
      });
    expect(tRes.status).toBe(201);
    const tournamentId = tRes.body.data.id;

    // Delete tournament
    const delRes = await request(app)
      .delete(`/api/v1/tournaments/${tournamentId}`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf);
    expect(delRes.status).toBe(200);
    expect(delRes.body.data.success).toBe(true);

    const tourneyAfter = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    expect(tourneyAfter).toBeNull();
  });
});

