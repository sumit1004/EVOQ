import { generateUuid } from '../../../utils/uuid.js';
import { ValidationError } from '../../../utils/errors.js';

export class BattleRoyaleEngine {
  /**
   * Generate Battle Royale stages, groups, rounds, and matches
   */
  static async generateBrStructure(tx, tournament, participants, options = {}) {
    const {
      teamsPerLobby = 12,
      matchesPerGroup = 3,
      maps = ['Map 1', 'Map 2', 'Map 3'],
      stageType = 'GROUP_STAGE_FINALS', // 'GROUP_STAGE_FINALS' | 'POINTS_TABLE' | 'SINGLE_STAGE'
      targetStageId,
    } = options;

    const count = participants.length;
    if (count < 2) {
      throw new ValidationError(`At least 2 approved teams are required to generate Battle Royale matches. Current: ${count}`);
    }

    const stage = targetStageId
      ? tournament.stages.find((s) => s.id === targetStageId)
      : tournament.stages[0];

    if (!stage) {
      throw new ValidationError('Target tournament stage not found.');
    }

    // Determine how many groups/lobbies are needed based on teamsPerLobby
    const numGroups = Math.max(1, Math.ceil(count / teamsPerLobby));
    const groups = [];

    // Create groups if numGroups > 1 or for stage clarity
    for (let g = 0; g < numGroups; g++) {
      const groupLetter = String.fromCharCode(65 + g); // Group A, Group B, ...
      const group = await tx.competitionGroup.create({
        data: {
          id: generateUuid(),
          stageId: stage.id,
          name: numGroups === 1 ? 'Main Lobby' : `Group ${groupLetter}`,
          sequence: g + 1,
          groupConfig: {
            teamsPerLobby,
            matchesPerGroup,
          },
        },
      });
      groups.push(group);
    }

    // Allocate participants to groups evenly (snake seed or sequential)
    const groupParticipants = Array.from({ length: numGroups }, () => []);
    participants.forEach((p, index) => {
      const groupIndex = index % numGroups;
      groupParticipants[groupIndex].push(p);
    });

    const createdMatches = [];

    // For each group, create rounds & matches
    for (let g = 0; g < numGroups; g++) {
      const group = groups[g];
      const assignedTeams = groupParticipants[g];

      for (let m = 0; m < matchesPerGroup; m++) {
        const matchNumber = m + 1;
        const mapName = maps[m % maps.length] || `Map ${matchNumber}`;

        const round = await tx.tournamentRound.create({
          data: {
            id: generateUuid(),
            stageId: stage.id,
            name: `${group.name} - Match ${matchNumber}`,
            sequence: matchNumber,
            roundType: 'GROUP',
            status: 'UPCOMING',
            roundConfig: {
              mapName,
            },
          },
        });

        const matchId = generateUuid();
        const match = await tx.match.create({
          data: {
            id: matchId,
            tournamentId: tournament.id,
            stageId: stage.id,
            groupId: group.id,
            roundId: round.id,
            matchNumber: matchNumber,
            title: `${group.name} - Match ${matchNumber} (${mapName})`,
            mapName: mapName,
            status: 'SCHEDULED',
            matchData: {
              engine: 'BATTLE_ROYALE',
              mapName,
              teamsCount: assignedTeams.length,
            },
          },
        });

        // Add each assigned team as a MatchParticipant in its slot
        const participantData = assignedTeams.map((p, slotIndex) => ({
          id: generateUuid(),
          matchId,
          registrationId: p.id,
          slot: slotIndex + 1,
          score: 0,
          isWinner: false,
          metrics: {
            placement: null,
            eliminations: 0,
            placementPoints: 0,
            eliminationPoints: 0,
            penalties: 0,
            bonus: 0,
            totalPoints: 0,
          },
        }));

        await tx.matchParticipant.createMany({ data: participantData });
        createdMatches.push(match);
      }
    }

    return {
      groups,
      matchesCount: createdMatches.length,
    };
  }

  /**
   * Calculate single match scores for all participants based on scoring ruleset
   */
  static calculateMatchScores(participantResults, ruleset = {}) {
    const {
      placementPoints = {
        1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0,
      },
      eliminationPointValue = 1,
    } = ruleset;

    return participantResults.map((pr) => {
      const placement = Number(pr.placement || pr.metrics?.placement || 999);
      const eliminations = Math.max(0, Number(pr.eliminations ?? pr.metrics?.eliminations ?? 0));
      const penalties = Math.max(0, Number(pr.penalties ?? pr.metrics?.penalties ?? 0));
      const bonus = Math.max(0, Number(pr.bonus ?? pr.metrics?.bonus ?? 0));

      const placePts = placementPoints[placement] !== undefined ? Number(placementPoints[placement]) : 0;
      const elimPts = eliminations * Number(eliminationPointValue || 1);
      const totalPoints = Math.max(0, placePts + elimPts + bonus - penalties);

      return {
        registrationId: pr.registrationId,
        slot: pr.slot,
        score: totalPoints,
        isWinner: placement === 1,
        metrics: {
          placement,
          eliminations,
          placementPoints: placePts,
          eliminationPoints: elimPts,
          penalties,
          bonus,
          totalPoints,
        },
      };
    });
  }

  /**
   * Calculate cumulative standings table from approved matches
   */
  static computeCumulativeStandings(matchesWithApprovedResults, registrations, ruleset = {}) {
    const tieBreakerOrder = ruleset.tieBreakers || [
      'TOTAL_POINTS',
      'MOST_WINS',
      'TOTAL_ELIMINATIONS',
      'PLACEMENT_POINTS',
      'LAST_MATCH_PLACEMENT',
    ];

    // Map registrationId -> accumulator
    const table = new Map();

    // Initialize all approved registrations
    for (const reg of registrations) {
      table.set(reg.id, {
        registrationId: reg.id,
        registration: reg,
        played: 0,
        wins: 0, // Booyahs or WWCDs
        eliminations: 0,
        placementPoints: 0,
        eliminationPoints: 0,
        penalties: 0,
        bonus: 0,
        points: 0,
        lastMatchPlacement: 999,
        placementsList: [],
      });
    }

    // Accumulate each match's results
    for (const m of matchesWithApprovedResults) {
      if (!m.participants) continue;
      for (const p of m.participants) {
        if (!table.has(p.registrationId)) continue;
        const entry = table.get(p.registrationId);
        const mtr = p.metrics || {};

        entry.played += 1;
        if (p.isWinner || Number(mtr.placement) === 1) {
          entry.wins += 1;
        }
        entry.eliminations += Number(mtr.eliminations || 0);
        entry.placementPoints += Number(mtr.placementPoints || 0);
        entry.eliminationPoints += Number(mtr.eliminationPoints || 0);
        entry.penalties += Number(mtr.penalties || 0);
        entry.bonus += Number(mtr.bonus || 0);
        entry.points += Number(p.score || mtr.totalPoints || 0);

        if (mtr.placement) {
          entry.lastMatchPlacement = Number(mtr.placement);
          entry.placementsList.push(Number(mtr.placement));
        }
      }
    }

    const rows = Array.from(table.values());

    // Deterministic sorting with tie-breaker order
    rows.sort((a, b) => {
      // 1. Primary: Total Points
      if (b.points !== a.points) return b.points - a.points;

      // 2. Tie Breakers
      for (const tb of tieBreakerOrder) {
        if (tb === 'MOST_WINS') {
          if (b.wins !== a.wins) return b.wins - a.wins;
        } else if (tb === 'TOTAL_ELIMINATIONS') {
          if (b.eliminations !== a.eliminations) return b.eliminations - a.eliminations;
        } else if (tb === 'PLACEMENT_POINTS') {
          if (b.placementPoints !== a.placementPoints) return b.placementPoints - a.placementPoints;
        } else if (tb === 'LAST_MATCH_PLACEMENT') {
          if (a.lastMatchPlacement !== b.lastMatchPlacement) return a.lastMatchPlacement - b.lastMatchPlacement;
        }
      }

      // Final fallback: Seed or registration time
      return (a.registration.seed || 999) - (b.registration.seed || 999);
    });

    // Assign rank 1..N
    return rows.map((row, idx) => ({
      rank: idx + 1,
      registrationId: row.registrationId,
      played: row.played,
      wins: row.wins,
      losses: row.played - row.wins,
      draws: 0,
      points: row.points,
      metrics: {
        eliminations: row.eliminations,
        placementPoints: row.placementPoints,
        eliminationPoints: row.eliminationPoints,
        penalties: row.penalties,
        bonus: row.bonus,
      },
      tieBreakValues: {
        wins: row.wins,
        eliminations: row.eliminations,
        lastMatchPlacement: row.lastMatchPlacement,
      },
    }));
  }

  /**
   * Advance Top-N teams from group stage to finals stage
   */
  static async advanceToFinalsStage(tx, tournament, fromStageId, toStageId, advancePerGroup = 6) {
    // 1. Get standings from fromStage
    const groups = await tx.competitionGroup.findMany({
      where: { stageId: fromStageId },
      include: {
        matches: {
          include: {
            participants: true,
          },
        },
      },
      orderBy: { sequence: 'asc' },
    });

    const qualifiedRegistrations = [];

    for (const group of groups) {
      // Get registrations in this group
      const regIds = new Set();
      group.matches.forEach((m) => m.participants.forEach((p) => regIds.add(p.registrationId)));

      const regs = await tx.tournamentRegistration.findMany({
        where: { id: { in: Array.from(regIds) } },
      });

      const standings = this.computeCumulativeStandings(group.matches, regs);
      const topQualified = standings.slice(0, advancePerGroup).map((s) => s.registrationId);
      qualifiedRegistrations.push(...topQualified);
    }

    // 2. Fetch full registration objects for qualified
    const qualifiedRegObjects = await tx.tournamentRegistration.findMany({
      where: { id: { in: qualifiedRegistrations } },
    });

    // 3. Generate finals matches
    const finalStage = await tx.tournamentStage.findUnique({
      where: { id: toStageId },
    });

    if (!finalStage) {
      throw new ValidationError('Finals stage not found.');
    }

    return this.generateBrStructure(tx, tournament, qualifiedRegObjects, {
      teamsPerLobby: qualifiedRegObjects.length,
      matchesPerGroup: 4,
      maps: ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine'],
      targetStageId: toStageId,
    });
  }
}

