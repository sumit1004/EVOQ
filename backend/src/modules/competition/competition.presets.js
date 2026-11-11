/**
 * EVOQ Tournament Competition Presets & Rulesets
 * Standardized competitive presets for supported esports titles.
 */

export const COMPETITION_PRESETS = {
  // ── 1. FREE FIRE ──
  'free-fire': {
    gameId: 'free-fire',
    gameName: 'Free Fire',
    modes: [
      {
        id: 'battle-royale',
        name: 'Battle Royale',
        matchEngine: 'BATTLE_ROYALE',
        defaultTeamSize: 4,
        minRosterSize: 4,
        maxRosterSize: 6,
        defaultTeamsPerLobby: 12,
        allowedTeamsPerLobby: [12, 10, 8, 6],
        supportedFormats: ['GROUP_STAGE_FINALS', 'POINTS_TABLE', 'GROUP_STAGE', 'CUSTOM'],
        defaultFormat: 'GROUP_STAGE_FINALS',
        defaultMaps: ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nexterra'],
        scoring: {
          placementPoints: {
            1: 12,
            2: 9,
            3: 8,
            4: 7,
            5: 6,
            6: 5,
            7: 4,
            8: 3,
            9: 2,
            10: 1,
            11: 0,
            12: 0,
          },
          eliminationPointValue: 1,
          tieBreakers: ['MOST_WINS', 'TOTAL_ELIMINATIONS', 'LAST_MATCH_PLACEMENT'],
        },
      },
      {
        id: 'clash-squad',
        name: 'Clash Squad (4v4)',
        matchEngine: 'HEAD_TO_HEAD',
        defaultTeamSize: 4,
        minRosterSize: 4,
        maxRosterSize: 5,
        supportedFormats: ['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'CUSTOM'],
        defaultFormat: 'SINGLE_ELIMINATION',
        defaultSeries: 'BO3',
        allowedSeries: ['BO1', 'BO3', 'BO5'],
        defaultMaps: ['Bermuda CS', 'Kalahari CS', 'Purgatory CS'],
        scoring: {
          pointsForWin: 1,
          pointsForLoss: 0,
        },
      },
    ],
  },

  // ── 2. BGMI (BATTLEGROUNDS MOBILE INDIA) ──
  bgmi: {
    gameId: 'bgmi',
    gameName: 'BGMI',
    modes: [
      {
        id: 'battle-royale',
        name: 'Battle Royale (Squad)',
        matchEngine: 'BATTLE_ROYALE',
        defaultTeamSize: 4,
        minRosterSize: 4,
        maxRosterSize: 6,
        defaultTeamsPerLobby: 16,
        allowedTeamsPerLobby: [16, 20, 12],
        supportedFormats: ['GROUP_STAGE_FINALS', 'POINTS_TABLE', 'GROUP_STAGE', 'CUSTOM'],
        defaultFormat: 'GROUP_STAGE_FINALS',
        defaultMaps: ['Erangel', 'Miramar', 'Sanhok', 'Vikendi'],
        scoring: {
          // Official BGIS / Krafton 10-point system
          placementPoints: {
            1: 10,
            2: 6,
            3: 5,
            4: 4,
            5: 3,
            6: 2,
            7: 1,
            8: 1,
            9: 0,
            10: 0,
            11: 0,
            12: 0,
            13: 0,
            14: 0,
            15: 0,
            16: 0,
          },
          eliminationPointValue: 1,
          tieBreakers: ['MOST_WINS', 'TOTAL_ELIMINATIONS', 'PLACEMENT_POINTS', 'LAST_MATCH_PLACEMENT'],
        },
      },
    ],
  },

  // ── 3. VALORANT ──
  valorant: {
    gameId: 'valorant',
    gameName: 'Valorant',
    modes: [
      {
        id: 'competitive-5v5',
        name: '5v5 Competitive Mode',
        matchEngine: 'HEAD_TO_HEAD',
        defaultTeamSize: 5,
        minRosterSize: 5,
        maxRosterSize: 7,
        supportedFormats: ['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'SWISS', 'ROUND_ROBIN', 'GROUP_STAGE_KNOCKOUT', 'CUSTOM'],
        defaultFormat: 'DOUBLE_ELIMINATION',
        defaultSeries: 'BO3',
        allowedSeries: ['BO1', 'BO3', 'BO5'],
        defaultMaps: ['Ascent', 'Bind', 'Haven', 'Split', 'Lotus', 'Sunset', 'Abyss'],
        scoring: {
          pointsForWin: 1,
          pointsForLoss: 0,
        },
      },
    ],
  },

  // ── 4. COUNTER-STRIKE 2 ──
  cs2: {
    gameId: 'cs2',
    gameName: 'Counter-Strike 2',
    modes: [
      {
        id: 'competitive-5v5',
        name: '5v5 Competitive Mode',
        matchEngine: 'HEAD_TO_HEAD',
        defaultTeamSize: 5,
        minRosterSize: 5,
        maxRosterSize: 7,
        supportedFormats: ['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'SWISS', 'ROUND_ROBIN', 'GROUP_STAGE_KNOCKOUT', 'CUSTOM'],
        defaultFormat: 'DOUBLE_ELIMINATION',
        defaultSeries: 'BO3',
        allowedSeries: ['BO1', 'BO3', 'BO5'],
        defaultMaps: ['Mirage', 'Inferno', 'Nuke', 'Dust II', 'Anubis', 'Ancient', 'Vertigo'],
        scoring: {
          pointsForWin: 1,
          pointsForLoss: 0,
        },
      },
    ],
  },

  // ── 5. CALL OF DUTY MOBILE ──
  'call-of-duty': {
    gameId: 'call-of-duty',
    gameName: 'Call of Duty: Mobile',
    modes: [
      {
        id: 'multiplayer-5v5',
        name: 'Multiplayer (5v5 Search & Destroy / Hardpoint)',
        matchEngine: 'HEAD_TO_HEAD',
        defaultTeamSize: 5,
        minRosterSize: 5,
        maxRosterSize: 7,
        supportedFormats: ['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'CUSTOM'],
        defaultFormat: 'SINGLE_ELIMINATION',
        defaultSeries: 'BO3',
        allowedSeries: ['BO1', 'BO3', 'BO5'],
        defaultMaps: ['Firing Range', 'Summit', 'Raid', 'Standoff', 'Crash'],
        scoring: {
          pointsForWin: 1,
          pointsForLoss: 0,
        },
      },
      {
        id: 'battle-royale',
        name: 'Battle Royale (Squad)',
        matchEngine: 'BATTLE_ROYALE',
        defaultTeamSize: 4,
        minRosterSize: 4,
        maxRosterSize: 6,
        defaultTeamsPerLobby: 16,
        allowedTeamsPerLobby: [16, 20, 25],
        supportedFormats: ['GROUP_STAGE_FINALS', 'POINTS_TABLE', 'CUSTOM'],
        defaultFormat: 'POINTS_TABLE',
        defaultMaps: ['Isolated', 'Blackout'],
        scoring: {
          placementPoints: {
            1: 15,
            2: 12,
            3: 10,
            4: 8,
            5: 6,
            6: 4,
            7: 2,
            8: 1,
            9: 0,
            10: 0,
          },
          eliminationPointValue: 1,
          tieBreakers: ['MOST_WINS', 'TOTAL_ELIMINATIONS', 'LAST_MATCH_PLACEMENT'],
        },
      },
    ],
  },
};

/**
 * Helper to retrieve preset by game slug or ID
 */
export function getPresetForGame(gameIdentifier) {
  if (!gameIdentifier) return null;
  const key = String(gameIdentifier).toLowerCase();
  for (const [k, v] of Object.entries(COMPETITION_PRESETS)) {
    if (k === key || v.gameId === key || v.gameName.toLowerCase() === key) {
      return v;
    }
  }
  return null;
}

