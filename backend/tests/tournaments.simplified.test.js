import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/database/prisma.js';
import { generateUuid } from '../src/utils/uuid.js';
import { getPresetForGame, COMPETITION_PRESETS } from '../src/modules/competition/competition.presets.js';

describe('EVOQ Tournament Creation Simplification & Placement Points', () => {
  let organizer = null;
  let organizerCookie = null;
  let organizerCsrf = null;
  let game = null;
  const timestamp = Date.now();

  beforeAll(async () => {
    // 1. Register and login Organizer
    const resOrg = await request(app)
      .post('/api/v1/auth/register/organizer')
      .send({
        email: `simp_org_${timestamp}@evoq.gg`,
        username: `simp_org_${timestamp}`,
        organizationName: `Simp Org ${timestamp}`,
        password: 'Password123!',
      });
    expect(resOrg.status).toBe(201);
    organizer = { id: resOrg.body.data.userId };

    const loginOrg = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: `simp_org_${timestamp}@evoq.gg`,
        password: 'Password123!',
      });
    expect(loginOrg.status).toBe(200);
    organizerCookie = loginOrg.headers['set-cookie'];
    organizerCsrf = loginOrg.body.data.csrfToken;

    // 2. Fetch Free Fire game
    game = await prisma.game.findFirst({ where: { slug: 'free-fire' } });
    if (!game) {
      game = await prisma.game.findFirst();
    }
  });

  afterAll(async () => {
    if (organizer?.id) {
      const tourneys = await prisma.tournament.findMany({
        where: { organizerUserId: organizer.id },
        select: { id: true },
      });
      const tIds = tourneys.map((t) => t.id);
      if (tIds.length > 0) {
        await prisma.tournamentStage.deleteMany({ where: { tournamentId: { in: tIds } } });
        await prisma.tournamentStaff.deleteMany({ where: { tournamentId: { in: tIds } } });
        await prisma.tournament.deleteMany({ where: { id: { in: tIds } } });
      }
      await prisma.organizationMembership.deleteMany({ where: { userId: organizer.id } });
      await prisma.organization.deleteMany({ where: { ownerId: organizer.id } });
      await prisma.organizerProfile.deleteMany({ where: { userId: organizer.id } });
      await prisma.emailToken.deleteMany({ where: { userId: organizer.id } });
      await prisma.auditLog.deleteMany({ where: { actorId: organizer.id } });
      await prisma.session.deleteMany({ where: { userId: organizer.id } });
      await prisma.user.deleteMany({ where: { id: organizer.id } });
    }
  });

  it('1. Loads verified official publisher preset for Free Fire', () => {
    const ffPreset = getPresetForGame('free-fire');
    expect(ffPreset).toBeDefined();
    expect(ffPreset.gameName).toBe('Free Fire');

    const brMode = ffPreset.modes.find((m) => m.id === 'battle-royale');
    expect(brMode).toBeDefined();
    expect(brMode.scoring.placementPoints[1]).toBe(12);
    expect(brMode.scoring.placementPoints[2]).toBe(9);
    expect(brMode.scoring.placementPoints[3]).toBe(8);
    expect(brMode.scoring.placementPoints[12]).toBe(0);
  });

  it('2. Successfully creates a tournament with custom Placement Points without timezone', async () => {
    const customPlacementPoints = {
      1: 15, // Custom 1st place points
      2: 11, // Custom 2nd place points
      3: 8,
      4: 6,
      5: 4,
    };

    const res = await request(app)
      .post('/api/v1/tournaments')
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: `Simplified Tourney ${timestamp}`,
        slug: `simp-tourney-${timestamp}`,
        description: 'Testing simplified creation wizard and placement points persistence',
        gameId: game.id,
        format: 'GROUP_STAGE_FINALS',
        participationType: 'TEAM',
        teamSize: 4,
        minParticipants: 2,
        maxParticipants: 24,
        registrationStart: new Date(Date.now() - 3600000).toISOString(),
        registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
        startDate: new Date(Date.now() + 172800000).toISOString(),
        // Note: timezone is omitted!
        locationMode: 'ONLINE',
        rules: 'Standard fair play rules apply',
        prizePool: '$2,500 USD',
        visibility: 'PUBLIC',
        formatConfig: {
          matchEngine: 'BATTLE_ROYALE',
          gameMode: 'battle-royale',
          scoringRuleset: {
            placementPoints: customPlacementPoints,
            eliminationPointValue: 1,
            tieBreakers: ['MOST_WINS', 'TOTAL_ELIMINATIONS', 'LAST_MATCH_PLACEMENT'],
          },
          placementPoints: customPlacementPoints,
        },
      });

    expect(res.status).toBe(201);
    const tournament = res.body.data;
    expect(tournament).toBeDefined();
    expect(tournament.id).toBeDefined();
    expect(tournament.name).toBe(`Simplified Tourney ${timestamp}`);
    expect(tournament.timezone).toBe('UTC'); // Defaulted cleanly
    expect(tournament.status).toBe('DRAFT');

    // Verify placement points are persisted in database
    const saved = await prisma.tournament.findUnique({
      where: { id: tournament.id },
    });
    expect(saved.formatConfig).toBeDefined();
    expect(saved.formatConfig.scoringRuleset.placementPoints[1]).toBe(15);
    expect(saved.formatConfig.scoringRuleset.placementPoints[2]).toBe(11);
    expect(saved.formatConfig.placementPoints[1]).toBe(15);
  });

  it('3. Confirms editing tournament placement points does NOT mutate global official preset', () => {
    const ffPreset = getPresetForGame('free-fire');
    const brMode = ffPreset.modes.find((m) => m.id === 'battle-royale');
    // The official global preset must still be 12 points for 1st place!
    expect(brMode.scoring.placementPoints[1]).toBe(12);
    expect(COMPETITION_PRESETS['free-fire'].modes[0].scoring.placementPoints[1]).toBe(12);
  });

  it('4. Allows publishing tournament without automatic match generation', async () => {
    // 1. Create tournament
    const createRes = await request(app)
      .post('/api/v1/tournaments')
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({
        name: `Publish No Auto Match ${timestamp}`,
        slug: `pub-no-match-${timestamp}`,
        gameId: game.id,
        format: 'SINGLE_ELIMINATION',
        registrationStart: new Date(Date.now() - 3600000).toISOString(),
        registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
        startDate: new Date(Date.now() + 172800000).toISOString(),
      });
    expect(createRes.status).toBe(201);
    const tournamentId = createRes.body.data.id;

    // 2. Publish tournament
    const pubRes = await request(app)
      .post(`/api/v1/tournaments/${tournamentId}/status`)
      .set('Cookie', organizerCookie)
      .set('x-csrf-token', organizerCsrf)
      .send({ status: 'PUBLISHED' });
    expect(pubRes.status).toBe(200);
    expect(pubRes.body.data.status).toBe('PUBLISHED');

    // 3. Confirm 0 matches were generated
    const matchCount = await prisma.match.count({
      where: { tournamentId },
    });
    expect(matchCount).toBe(0);
  });

  it('5. Retrieves tournament by either UUID or slug without 404', async () => {
    const slug = `pub-no-match-${timestamp}`;
    const bySlug = await request(app).get(`/api/v1/tournaments/id/${slug}`);
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.data.slug).toBe(slug);
  });
});

