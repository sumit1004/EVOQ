import { describe, it, expect } from 'vitest';
import { BattleRoyaleEngine } from '../src/modules/competition/engines/battleRoyale.engine.js';
import { HeadToHeadEngine } from '../src/modules/competition/engines/headToHead.engine.js';
import { getPresetForGame, COMPETITION_PRESETS } from '../src/modules/competition/competition.presets.js';

describe('EVOQ Online Tournament Engine V1 — Unit Tests', () => {
  describe('Competition Presets & Rulesets', () => {
    it('retrieves official preset for Free Fire with Battle Royale and Clash Squad', () => {
      const preset = getPresetForGame('free-fire');
      expect(preset).toBeDefined();
      expect(preset.gameName).toBe('Free Fire');
      expect(preset.modes.length).toBeGreaterThanOrEqual(2);

      const brMode = preset.modes.find((m) => m.id === 'battle-royale');
      expect(brMode.matchEngine).toBe('BATTLE_ROYALE');
      expect(brMode.defaultTeamsPerLobby).toBe(12);
      expect(brMode.scoring.placementPoints[1]).toBe(12);
      expect(brMode.scoring.placementPoints[2]).toBe(9);
      expect(brMode.scoring.eliminationPointValue).toBe(1);

      const csMode = preset.modes.find((m) => m.id === 'clash-squad');
      expect(csMode.matchEngine).toBe('HEAD_TO_HEAD');
      expect(csMode.defaultTeamSize).toBe(4);
    });

    it('retrieves official preset for BGMI with Krafton BGIS 10-point system', () => {
      const preset = getPresetForGame('bgmi');
      expect(preset).toBeDefined();
      expect(preset.gameName).toBe('BGMI');

      const brMode = preset.modes[0];
      expect(brMode.defaultTeamsPerLobby).toBe(16);
      expect(brMode.scoring.placementPoints[1]).toBe(10);
      expect(brMode.scoring.placementPoints[2]).toBe(6);
      expect(brMode.scoring.placementPoints[3]).toBe(5);
      expect(brMode.scoring.placementPoints[8]).toBe(1);
      expect(brMode.scoring.placementPoints[9]).toBe(0);
    });

    it('retrieves official preset for Valorant with Double Elimination BO3 defaults', () => {
      const preset = getPresetForGame('valorant');
      expect(preset).toBeDefined();
      expect(preset.gameName).toBe('Valorant');

      const compMode = preset.modes[0];
      expect(compMode.matchEngine).toBe('HEAD_TO_HEAD');
      expect(compMode.defaultTeamSize).toBe(5);
      expect(compMode.defaultFormat).toBe('DOUBLE_ELIMINATION');
      expect(compMode.defaultSeries).toBe('BO3');
      expect(compMode.defaultMaps).toContain('Ascent');
      expect(compMode.defaultMaps).toContain('Bind');
    });

    it('retrieves official preset for Counter-Strike 2', () => {
      const preset = getPresetForGame('cs2');
      expect(preset).toBeDefined();
      expect(preset.gameName).toBe('Counter-Strike 2');

      const compMode = preset.modes[0];
      expect(compMode.matchEngine).toBe('HEAD_TO_HEAD');
      expect(compMode.defaultTeamSize).toBe(5);
      expect(compMode.defaultMaps).toContain('Mirage');
      expect(compMode.defaultMaps).toContain('Dust II');
    });

    it('retrieves official preset for Call of Duty: Mobile with MP and BR', () => {
      const preset = getPresetForGame('call-of-duty');
      expect(preset).toBeDefined();
      expect(preset.gameName).toBe('Call of Duty: Mobile');
      expect(preset.modes.length).toBe(2);

      const mpMode = preset.modes.find((m) => m.id === 'multiplayer-5v5');
      expect(mpMode.matchEngine).toBe('HEAD_TO_HEAD');

      const brMode = preset.modes.find((m) => m.id === 'battle-royale');
      expect(brMode.matchEngine).toBe('BATTLE_ROYALE');
      expect(brMode.scoring.placementPoints[1]).toBe(15);
    });
  });

  describe('Battle Royale Engine — Match Scoring', () => {
    const freeFireRuleset = {
      placementPoints: { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0 },
      eliminationPointValue: 1,
    };

    it('calculates placement and elimination points correctly for 1st place with 8 kills', () => {
      const results = BattleRoyaleEngine.calculateMatchScores(
        [
          { registrationId: 'reg-1', placement: 1, eliminations: 8 },
          { registrationId: 'reg-2', placement: 2, eliminations: 4 },
          { registrationId: 'reg-3', placement: 12, eliminations: 0 },
        ],
        freeFireRuleset
      );

      // Reg 1: 12 placement + 8 kills = 20 pts (isWinner = true)
      expect(results[0].score).toBe(20);
      expect(results[0].isWinner).toBe(true);
      expect(results[0].metrics.placementPoints).toBe(12);
      expect(results[0].metrics.eliminationPoints).toBe(8);

      // Reg 2: 9 placement + 4 kills = 13 pts (isWinner = false)
      expect(results[1].score).toBe(13);
      expect(results[1].isWinner).toBe(false);

      // Reg 3: 0 placement + 0 kills = 0 pts
      expect(results[2].score).toBe(0);
      expect(results[2].isWinner).toBe(false);
    });

    it('applies penalties and bonus points accurately in formula', () => {
      const results = BattleRoyaleEngine.calculateMatchScores(
        [
          { registrationId: 'reg-1', placement: 1, eliminations: 10, bonus: 2, penalties: 3 },
        ],
        freeFireRuleset
      );

      // Total = 12 (place) + 10 (kills) + 2 (bonus) - 3 (penalties) = 21
      expect(results[0].score).toBe(21);
      expect(results[0].metrics.bonus).toBe(2);
      expect(results[0].metrics.penalties).toBe(3);
    });
  });

  describe('Battle Royale Engine — Cumulative Standings & Deterministic Tie-Breakers', () => {
    const ruleset = {
      placementPoints: { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1 },
      eliminationPointValue: 1,
      tieBreakers: ['MOST_WINS', 'TOTAL_ELIMINATIONS', 'LAST_MATCH_PLACEMENT'],
    };

    const mockRegistrations = [
      { id: 'team-a', seed: 1, team: { name: 'Team Alpha' } },
      { id: 'team-b', seed: 2, team: { name: 'Team Bravo' } },
      { id: 'team-c', seed: 3, team: { name: 'Team Charlie' } },
    ];

    it('ranks team with most wins higher when total points are tied', () => {
      // Team Alpha: 1 win (12 + 2 = 14 pts)
      // Team Bravo: 0 wins, 2nd place + 5 kills (9 + 5 = 14 pts)
      const mockMatches = [
        {
          participants: [
            { registrationId: 'team-a', score: 14, isWinner: true, metrics: { placement: 1, eliminations: 2, placementPoints: 12, eliminationPoints: 2, totalPoints: 14 } },
            { registrationId: 'team-b', score: 14, isWinner: false, metrics: { placement: 2, eliminations: 5, placementPoints: 9, eliminationPoints: 5, totalPoints: 14 } },
            { registrationId: 'team-c', score: 4, isWinner: false, metrics: { placement: 7, eliminations: 0, placementPoints: 4, eliminationPoints: 0, totalPoints: 4 } },
          ],
        },
      ];

      const standings = BattleRoyaleEngine.computeCumulativeStandings(mockMatches, mockRegistrations, ruleset);

      expect(standings[0].registrationId).toBe('team-a'); // Rank 1 due to MOST_WINS tiebreaker
      expect(standings[0].rank).toBe(1);
      expect(standings[0].wins).toBe(1);

      expect(standings[1].registrationId).toBe('team-b'); // Rank 2
      expect(standings[1].rank).toBe(2);
      expect(standings[1].wins).toBe(0);

      expect(standings[2].registrationId).toBe('team-c');
      expect(standings[2].rank).toBe(3);
    });

    it('ranks team with more eliminations higher when points and wins are tied', () => {
      const mockMatches = [
        {
          participants: [
            { registrationId: 'team-a', score: 10, isWinner: false, metrics: { placement: 3, eliminations: 2, placementPoints: 8, eliminationPoints: 2, totalPoints: 10 } },
            { registrationId: 'team-b', score: 10, isWinner: false, metrics: { placement: 4, eliminations: 3, placementPoints: 7, eliminationPoints: 3, totalPoints: 10 } },
          ],
        },
      ];

      const standings = BattleRoyaleEngine.computeCumulativeStandings(mockMatches, mockRegistrations.slice(0, 2), ruleset);

      // Both have 0 wins, but Team Bravo has 3 elims vs Alpha 2 elims
      expect(standings[0].registrationId).toBe('team-b');
      expect(standings[1].registrationId).toBe('team-a');
    });
  });

  describe('Head-to-Head Engine — Series Scoring & Progression', () => {
    it('calculates BO1 series winner immediately after 1 map win', () => {
      const res = HeadToHeadEngine.calculateSeriesResult(
        [{ p1Score: 13, p2Score: 7 }],
        'BO1'
      );
      expect(res.isCompleted).toBe(true);
      expect(res.winnerSlot).toBe(1);
      expect(res.p1Wins).toBe(1);
      expect(res.p2Wins).toBe(0);
    });

    it('calculates BO3 series correctly when reaching 2 map wins', () => {
      // Map 1: P1 wins, Map 2: P2 wins, Map 3: P1 wins -> P1 wins 2-1
      const res = HeadToHeadEngine.calculateSeriesResult(
        [
          { p1Score: 13, p2Score: 11 },
          { p1Score: 9, p2Score: 13 },
          { p1Score: 13, p2Score: 8 },
        ],
        'BO3'
      );
      expect(res.isCompleted).toBe(true);
      expect(res.winnerSlot).toBe(1);
      expect(res.p1Wins).toBe(2);
      expect(res.p2Wins).toBe(1);
    });

    it('detects incomplete BO3 series when only 1 map has been played', () => {
      const res = HeadToHeadEngine.calculateSeriesResult(
        [{ p1Score: 13, p2Score: 10 }],
        'BO3'
      );
      expect(res.isCompleted).toBe(false);
      expect(res.winnerSlot).toBeNull();
      expect(res.p1Wins).toBe(1);
    });

    it('calculates BO5 series correctly when reaching 3 map wins', () => {
      const res = HeadToHeadEngine.calculateSeriesResult(
        [
          { p1Score: 5, p2Score: 13 },
          { p1Score: 7, p2Score: 13 },
          { p1Score: 8, p2Score: 13 },
        ],
        'BO5'
      );
      expect(res.isCompleted).toBe(true);
      expect(res.winnerSlot).toBe(2);
      expect(res.p2Wins).toBe(3);
    });
  });

  describe('Head-to-Head Engine — Standings Calculation', () => {
    const mockRegistrations = [
      { id: 'team-1', seed: 1 },
      { id: 'team-2', seed: 2 },
    ];

    it('computes match points (3 pts for win), map differential, and standings', () => {
      const mockMatches = [
        {
          status: 'COMPLETED',
          participants: [
            { registrationId: 'team-1', score: 2, isWinner: true },
            { registrationId: 'team-2', score: 1, isWinner: false },
          ],
        },
      ];

      const standings = HeadToHeadEngine.computeStandings(mockMatches, mockRegistrations);

      expect(standings[0].registrationId).toBe('team-1');
      expect(standings[0].points).toBe(3);
      expect(standings[0].wins).toBe(1);
      expect(standings[0].metrics.mapWins).toBe(2);
      expect(standings[0].metrics.mapLosses).toBe(1);
      expect(standings[0].metrics.mapDifferential).toBe(1);

      expect(standings[1].registrationId).toBe('team-2');
      expect(standings[1].points).toBe(0);
      expect(standings[1].losses).toBe(1);
      expect(standings[1].metrics.mapDifferential).toBe(-1);
    });
  });
});

