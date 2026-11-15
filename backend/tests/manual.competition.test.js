import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/database/prisma.js';
import { generateUuid } from '../src/utils/uuid.js';

describe('EVOQ Manual Tournament Competition Management System (V1)', () => {
  let organizer = null;
  let organizerCookie = null;
  let organizerCsrf = null;

  let gamer = null;
  let gamerCookie = null;
  let gamerCsrf = null;

  let game = null;
  let tournament = null;
  let registrations = [];
  const timestamp = Date.now();

  let createdRound1 = null;
  let createdGroups = [];
  let createdMatches = [];

  beforeAll(async () => {
    // 1. Register & Login Organizer
    const resOrg = await request(app)
      .post('/api/v1/auth/register/organizer')
      .send({
        email: `manual_org_${timestamp}@evoq.gg`,
        username: `manual_org_${timestamp}`,
        organizationName: `Manual Org ${timestamp}`,
        password: 'Password123!',
      });
    expect(resOrg.status).toBe(201);
    organizer = { id: resOrg.body.data.userId };

    const loginOrg = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: `manual_org_${timestamp}@evoq.gg`,
        password: 'Password123!',
      });
    expect(loginOrg.status).toBe(200);
    organizerCookie = loginOrg.headers['set-cookie'];
    organizerCsrf = loginOrg.body.data.csrfToken;

    // 2. Register & Login a Gamer
    const resGamer = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `gamer_p_${timestamp}@evoq.gg`,
        username: `gamer_p_${timestamp}`,
        password: 'Password123!',
      });
    expect(resGamer.status).toBe(201);
    gamer = { id: resGamer.body.data.userId };

    const loginGamer = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: `gamer_p_${timestamp}@evoq.gg`,
        password: 'Password123!',
      });
    expect(loginGamer.status).toBe(200);
    gamerCookie = loginGamer.headers['set-cookie'];
    gamerCsrf = loginGamer.body.data.csrfToken;

    // 3. Find a Game
    game = await prisma.game.findFirst();

    // 4. Create Tournament with custom placement points
    const customPlacementPoints = {
      1: 15,
      2: 12,
      3: 10,
      4: 8,
      5: 6,
      6: 4,
      7: 2,
      8: 1,
    };

    const tRes = await request(app)
      .post('/api/v1/tournaments')
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: `Championship Series ${timestamp}`,
        slug: `championship-series-${timestamp}`,
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
          gameMode: 'battle-royale',
          scoringRuleset: {
            placementPoints: customPlacementPoints,
            eliminationPointValue: 2,
            tieBreakers: ['TOTAL_POINTS', 'MOST_WINS', 'TOTAL_ELIMINATIONS', 'LAST_MATCH_PLACEMENT'],
          },
        },
      });
    expect(tRes.status).toBe(201);
    tournament = tRes.body.data;

    // 5. Seed 4 Teams & Approved Registrations
    for (let i = 1; i <= 4; i++) {
      const teamId = generateUuid();
      const team = await prisma.team.create({
        data: {
          id: teamId,
          name: `Squad ${i} - ${timestamp}`,
          slug: `squad-${i}-${timestamp}`,
          ownerId: i === 1 ? gamer.id : organizer.id,
          maxMembers: 4,
          primaryGameId: game.id,
        },
      });

      const reg = await prisma.tournamentRegistration.create({
        data: {
          id: generateUuid(),
          tournamentId: tournament.id,
          teamId: team.id,
          registeredById: i === 1 ? gamer.id : organizer.id,
          entrantType: 'TEAM',
          status: 'APPROVED',
          seed: i,
        },
        include: { team: true },
      });
      registrations.push(reg);
    }
  });

  afterAll(async () => {
    if (tournament?.id) {
      await prisma.matchCredential.deleteMany({ where: { match: { tournamentId: tournament.id } } });
      await prisma.matchParticipant.deleteMany({ where: { match: { tournamentId: tournament.id } } });
      await prisma.resultRevision.deleteMany({ where: { result: { match: { tournamentId: tournament.id } } } });
      await prisma.matchResult.deleteMany({ where: { match: { tournamentId: tournament.id } } });
      await prisma.match.deleteMany({ where: { tournamentId: tournament.id } });
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
    if (gamer?.id) {
      await prisma.emailToken.deleteMany({ where: { userId: gamer.id } });
      await prisma.teamMembership.deleteMany({ where: { userId: gamer.id } });
      await prisma.team.deleteMany({ where: { ownerId: gamer.id } });
      await prisma.gamerProfile.deleteMany({ where: { userId: gamer.id } });
      await prisma.session.deleteMany({ where: { userId: gamer.id } });
      await prisma.user.delete({ where: { id: gamer.id } }).catch(() => {});
    }
  });

  it('1. Creates Round 1 with automatic sequence and status ACTIVE', async () => {
    const res = await request(app)
      .post(`/api/v1/tournaments/${tournament.id}/rounds`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: 'Round 1 - Qualifiers',
        roundType: 'GROUP',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Round 1 - Qualifiers');
    expect(res.body.data.sequence).toBe(1);
    expect(res.body.data.status).toBe('ACTIVE');
    createdRound1 = res.body.data;
  });

  it('2. Retrieves eligible teams pool for Round 1 (all approved registrations)', async () => {
    const res = await request(app)
      .get(`/api/v1/competition/rounds/${createdRound1.id}/eligible-teams`)
      .set('Cookie', organizerCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.totalEligible).toBe(4);
    expect(res.body.data.isFirstRound).toBe(true);
    expect(res.body.data.unallocatedCount).toBe(4);
    expect(res.body.data.teams.length).toBe(4);
  });

  it('3. Creates 2 groups and allocates teams (2 teams per group)', async () => {
    const res = await request(app)
      .post(`/api/v1/competition/rounds/${createdRound1.id}/groups`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        groups: [
          {
            name: 'Group A',
            registrationIds: [registrations[0].id, registrations[1].id],
          },
          {
            name: 'Group B',
            registrationIds: [registrations[2].id, registrations[3].id],
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].name).toBe('Group A');
    expect(res.body.data[1].name).toBe('Group B');
    createdGroups = res.body.data;

    // Verify eligible-teams endpoint now shows all allocated
    const checkEligible = await request(app)
      .get(`/api/v1/competition/rounds/${createdRound1.id}/eligible-teams`)
      .set('Cookie', organizerCookie);
    expect(checkEligible.body.data.allocatedCount).toBe(4);
    expect(checkEligible.body.data.unallocatedCount).toBe(0);
  });

  it('4. Creates 2 matches for Group A (each fixturing both Group A teams)', async () => {
    const groupA = createdGroups[0];
    const res = await request(app)
      .post(`/api/v1/competition/groups/${groupA.id}/matches`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        matchCount: 2,
        titles: ['Group A - Match 1 (Bermuda)', 'Group A - Match 2 (Purgatory)'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].title).toBe('Group A - Match 1 (Bermuda)');
    expect(res.body.data[1].title).toBe('Group A - Match 2 (Purgatory)');
    createdMatches = res.body.data;

    // Verify participants were created
    const match1 = await prisma.match.findUnique({
      where: { id: createdMatches[0].id },
      include: { participants: true },
    });
    expect(match1.participants.length).toBe(2);
    expect(match1.participants.map((p) => p.registrationId).sort()).toEqual(
      [registrations[0].id, registrations[1].id].sort()
    );
  });

  it('5. Sets room credentials on Match 1 and tests copy-previous on Match 2', async () => {
    const match1 = createdMatches[0];
    const match2 = createdMatches[1];

    // Set credentials on Match 1
    const setRes = await request(app)
      .post(`/api/v1/competition/matches/${match1.id}/credentials`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        roomId: 'ROOM-101-ALPHA',
        roomPassword: 'SecretPassword99',
        lobbyDetails: 'Custom Room on Singapore Server',
        accessInstructions: 'Join slot according to team number.',
        isReleased: true,
      });
    expect(setRes.status).toBe(200);
    expect(setRes.body.data.isReleased).toBe(true);

    // Copy credentials to Match 2
    const copyRes = await request(app)
      .post(`/api/v1/competition/matches/${match2.id}/credentials/copy-previous`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf);
    expect(copyRes.status).toBe(200);
    expect(copyRes.body.data.roomId).toBe('ROOM-101-ALPHA');
    expect(copyRes.body.data.roomPassword).toBe('SecretPassword99');
    expect(copyRes.body.data.isReleased).toBe(false);
  });

  it('6. Enforces access control for room credentials (gamer vs organizer)', async () => {
    const match1 = createdMatches[0];

    // Gamer (who belongs to Team 1 in Group A) can view Match 1 credentials when released
    const gamerRes = await request(app)
      .get(`/api/v1/competition/matches/${match1.id}/credentials`)
      .set('Cookie', gamerCookie);
    expect(gamerRes.status).toBe(200);
    expect(gamerRes.body.data.roomId).toBe('ROOM-101-ALPHA');
    expect(gamerRes.body.data.roomPassword).toBe('SecretPassword99');

    // Match 2 credentials are not released yet; gamer should be rejected with 403
    const match2 = createdMatches[1];
    const gamerRes2 = await request(app)
      .get(`/api/v1/competition/matches/${match2.id}/credentials`)
      .set('Cookie', gamerCookie);
    expect(gamerRes2.status).toBe(403);

    // Organizer can view Match 2 credentials even when not released
    const orgRes2 = await request(app)
      .get(`/api/v1/competition/matches/${match2.id}/credentials`)
      .set('Cookie', organizerCookie);
    expect(orgRes2.status).toBe(200);
    expect(orgRes2.body.data.roomId).toBe('ROOM-101-ALPHA');
  });

  it('7. Enters match results with placements and kills, and calculates points using custom placement ruleset', async () => {
    const match1 = createdMatches[0];

    // Team 1: Placement 1 (15 pts) + 5 kills * 2 = 10 elim pts -> Total 25 pts
    // Team 2: Placement 2 (12 pts) + 2 kills * 2 = 4 elim pts -> Total 16 pts
    const resultRes = await request(app)
      .post(`/api/v1/competition/matches/${match1.id}/results`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        participantResults: [
          {
            registrationId: registrations[0].id,
            placement: 1,
            eliminations: 5,
          },
          {
            registrationId: registrations[1].id,
            placement: 2,
            eliminations: 2,
          },
        ],
        evidenceUrls: ['/uploads/match1-screenshot.png'],
        notes: 'Official lobby verification complete.',
      });

    expect(resultRes.status).toBe(201);
    const rev = resultRes.body.data;
    const pResults = rev.payload.participantResults;

    const team1Result = pResults.find((p) => p.registrationId === registrations[0].id);
    const team2Result = pResults.find((p) => p.registrationId === registrations[1].id);

    expect(team1Result.score).toBe(25);
    expect(team1Result.isWinner).toBe(true);
    expect(team1Result.metrics.placementPoints).toBe(15);
    expect(team1Result.metrics.eliminationPoints).toBe(10);

    expect(team2Result.score).toBe(16);
    expect(team2Result.isWinner).toBe(false);
    expect(team2Result.metrics.placementPoints).toBe(12);
    expect(team2Result.metrics.eliminationPoints).toBe(4);
  });

  it('8. Retrieves updated Group Standings and Round Standings', async () => {
    const groupA = createdGroups[0];

    // Group A Standings
    const groupStandingsRes = await request(app)
      .get(`/api/v1/competition/groups/${groupA.id}/standings`);
    expect(groupStandingsRes.status).toBe(200);
    const rows = groupStandingsRes.body.data.rows;
    expect(rows.length).toBe(2);
    expect(rows[0].rank).toBe(1);
    expect(rows[0].points).toBe(25);
    expect(rows[0].wins).toBe(1);
    expect(rows[1].rank).toBe(2);
    expect(rows[1].points).toBe(16);

    // Round 1 Standings
    const roundStandingsRes = await request(app)
      .get(`/api/v1/competition/rounds/${createdRound1.id}/standings`);
    expect(roundStandingsRes.status).toBe(200);
    expect(roundStandingsRes.body.data.rows.length).toBeGreaterThanOrEqual(2);
  });

  it('9. Qualifies top team from Group A and creates qualification snapshot', async () => {
    const qualRes = await request(app)
      .post(`/api/v1/competition/rounds/${createdRound1.id}/qualify`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        method: 'TOP_N',
        advancePerGroup: 1,
      });

    expect(qualRes.status).toBe(200);
    expect(qualRes.body.data.qualifiedCount).toBeGreaterThanOrEqual(1);
    const topTeam = qualRes.body.data.qualifiedTeams[0];
    expect(topTeam.registrationId).toBe(registrations[0].id);
  });

  it('10. Advances to Next Round (Round 2) and locks qualified teams as eligible pool', async () => {
    const advanceRes = await request(app)
      .post(`/api/v1/competition/rounds/${createdRound1.id}/next-round`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        roundName: 'Round 2 - Grand Finals',
        roundType: 'FINALS',
      });

    expect(advanceRes.status).toBe(201);
    const nextRound = advanceRes.body.data.nextRound;
    expect(nextRound.name).toBe('Round 2 - Grand Finals');
    expect(nextRound.sequence).toBe(2);
    expect(nextRound.status).toBe('ACTIVE');

    // Verify eligible teams for Round 2 only include the qualified teams from Round 1
    const eligibleRes = await request(app)
      .get(`/api/v1/competition/rounds/${nextRound.id}/eligible-teams`)
      .set('Cookie', organizerCookie);

    expect(eligibleRes.status).toBe(200);
    expect(eligibleRes.body.data.isFirstRound).toBe(false);
    expect(eligibleRes.body.data.teams.some((t) => t.id === registrations[0].id)).toBe(true);
  });
});
