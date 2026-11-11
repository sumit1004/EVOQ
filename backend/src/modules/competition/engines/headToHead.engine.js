import { generateUuid } from '../../../utils/uuid.js';
import { ValidationError } from '../../../utils/errors.js';

export class HeadToHeadEngine {
  /**
   * Generate Single Elimination Bracket
   */
  static async generateSingleElimination(tx, tournament, participants, stage) {
    const count = participants.length;
    if (count < 2) {
      throw new ValidationError(`Single elimination requires at least 2 participants. Current: ${count}`);
    }

    // Determine total rounds needed (nearest power of 2)
    const totalRounds = Math.ceil(Math.log2(count));
    const bracketSize = Math.pow(2, totalRounds);
    const roundNames = ['Finals', 'Semifinals', 'Quarterfinals', 'Round of 16', 'Round of 32', 'Round of 64', 'Round of 128'];

    // Create all rounds upfront
    const createdRounds = [];
    for (let r = 1; r <= totalRounds; r++) {
      const remainingMatches = Math.pow(2, totalRounds - r);
      const nameIndex = totalRounds - r;
      const rName = roundNames[nameIndex] || `Round ${r}`;

      const round = await tx.tournamentRound.create({
        data: {
          id: generateUuid(),
          stageId: stage.id,
          name: rName,
          sequence: r,
          roundType: 'UPPER',
          status: r === 1 ? 'ACTIVE' : 'UPCOMING',
          roundConfig: {
            matchesCount: remainingMatches,
          },
        },
      });
      createdRounds.push(round);
    }

    // Seed participants into Round 1
    // Standard tournament seeding: 1 vs 8, 4 vs 5, 2 vs 7, 3 vs 6 (or standard sequential)
    const r1MatchesCount = bracketSize / 2;
    const r1Matches = [];

    for (let m = 0; m < r1MatchesCount; m++) {
      const matchId = generateUuid();
      const match = await tx.match.create({
        data: {
          id: matchId,
          tournamentId: tournament.id,
          stageId: stage.id,
          roundId: createdRounds[0].id,
          matchNumber: m + 1,
          title: `${createdRounds[0].name} - Match ${m + 1}`,
          status: 'SCHEDULED',
          seriesConfig: tournament.formatConfig?.seriesConfig || { format: 'BO3', mapsCount: 3 },
          matchData: {
            engine: 'HEAD_TO_HEAD',
            roundNumber: 1,
            bracketSlot: m + 1,
          },
        },
      });
      r1Matches.push(match);

      // Slot 1 and Slot 2
      const p1 = participants[m * 2];
      const p2 = participants[m * 2 + 1];

      if (p1) {
        await tx.matchParticipant.create({
          data: {
            id: generateUuid(),
            matchId,
            registrationId: p1.id,
            slot: 1,
            score: 0,
          },
        });
      }

      if (p2) {
        await tx.matchParticipant.create({
          data: {
            id: generateUuid(),
            matchId,
            registrationId: p2.id,
            slot: 2,
            score: 0,
          },
        });
      }
    }

    // Create empty placeholder matches for subsequent rounds
    for (let r = 2; r <= totalRounds; r++) {
      const round = createdRounds[r - 1];
      const matchesInThisRound = Math.pow(2, totalRounds - r);

      for (let m = 0; m < matchesInThisRound; m++) {
        await tx.match.create({
          data: {
            id: generateUuid(),
            tournamentId: tournament.id,
            stageId: stage.id,
            roundId: round.id,
            matchNumber: m + 1,
            title: `${round.name} - Match ${m + 1}`,
            status: 'SCHEDULED',
            seriesConfig: tournament.formatConfig?.seriesConfig || { format: 'BO3', mapsCount: 3 },
            matchData: {
              engine: 'HEAD_TO_HEAD',
              roundNumber: r,
              bracketSlot: m + 1,
            },
          },
        });
      }
    }

    return { totalRounds, matchesCreated: bracketSize - 1 };
  }

  /**
   * Generate Double Elimination Bracket (Upper & Lower Brackets + Grand Final)
   */
  static async generateDoubleElimination(tx, tournament, participants, stage) {
    const count = participants.length;
    if (count < 4) {
      throw new ValidationError(`Double elimination requires at least 4 participants. Current: ${count}`);
    }

    const totalUpperRounds = Math.ceil(Math.log2(count));
    const totalLowerRounds = (totalUpperRounds - 1) * 2;

    // 1. Upper Bracket Rounds
    const upperRounds = [];
    for (let r = 1; r <= totalUpperRounds; r++) {
      const rName = r === totalUpperRounds ? 'Upper Final' : `Upper Round ${r}`;
      const round = await tx.tournamentRound.create({
        data: {
          id: generateUuid(),
          stageId: stage.id,
          name: rName,
          sequence: r,
          roundType: 'UPPER',
          status: r === 1 ? 'ACTIVE' : 'UPCOMING',
        },
      });
      upperRounds.push(round);
    }

    // 2. Lower Bracket Rounds
    const lowerRounds = [];
    for (let r = 1; r <= totalLowerRounds; r++) {
      const rName = r === totalLowerRounds ? 'Lower Final' : `Lower Round ${r}`;
      const round = await tx.tournamentRound.create({
        data: {
          id: generateUuid(),
          stageId: stage.id,
          name: rName,
          sequence: totalUpperRounds + r,
          roundType: 'LOWER',
          status: 'UPCOMING',
        },
      });
      lowerRounds.push(round);
    }

    // 3. Grand Finals Round
    const grandFinalRound = await tx.tournamentRound.create({
      data: {
        id: generateUuid(),
        stageId: stage.id,
        name: 'Grand Finals',
        sequence: totalUpperRounds + totalLowerRounds + 1,
        roundType: 'FINALS',
        status: 'UPCOMING',
      },
    });

    // Populate Upper Round 1 matches with seeded participants
    const u1MatchesCount = Math.pow(2, totalUpperRounds - 1);
    for (let m = 0; m < u1MatchesCount; m++) {
      const matchId = generateUuid();
      await tx.match.create({
        data: {
          id: matchId,
          tournamentId: tournament.id,
          stageId: stage.id,
          roundId: upperRounds[0].id,
          matchNumber: m + 1,
          title: `Upper Round 1 - Match ${m + 1}`,
          status: 'SCHEDULED',
          seriesConfig: tournament.formatConfig?.seriesConfig || { format: 'BO3', mapsCount: 3 },
          matchData: {
            engine: 'HEAD_TO_HEAD',
            bracket: 'UPPER',
            roundNumber: 1,
            bracketSlot: m + 1,
          },
        },
      });

      const p1 = participants[m * 2];
      const p2 = participants[m * 2 + 1];

      if (p1) {
        await tx.matchParticipant.create({
          data: { id: generateUuid(), matchId, registrationId: p1.id, slot: 1, score: 0 },
        });
      }
      if (p2) {
        await tx.matchParticipant.create({
          data: { id: generateUuid(), matchId, registrationId: p2.id, slot: 2, score: 0 },
        });
      }
    }

    // Create empty placeholder matches for subsequent upper rounds
    for (let r = 2; r <= totalUpperRounds; r++) {
      const round = upperRounds[r - 1];
      const matchesCount = Math.pow(2, totalUpperRounds - r);
      for (let m = 0; m < matchesCount; m++) {
        await tx.match.create({
          data: {
            id: generateUuid(),
            tournamentId: tournament.id,
            stageId: stage.id,
            roundId: round.id,
            matchNumber: m + 1,
            title: `${round.name} - Match ${m + 1}`,
            status: 'SCHEDULED',
            seriesConfig: tournament.formatConfig?.seriesConfig || { format: 'BO3', mapsCount: 3 },
            matchData: {
              engine: 'HEAD_TO_HEAD',
              bracket: 'UPPER',
              roundNumber: r,
              bracketSlot: m + 1,
            },
          },
        });
      }
    }

    // Create placeholder matches for lower rounds
    for (let r = 1; r <= totalLowerRounds; r++) {
      const round = lowerRounds[r - 1];
      const matchesCount = Math.max(1, Math.floor(u1MatchesCount / Math.pow(2, Math.ceil(r / 2))));
      for (let m = 0; m < matchesCount; m++) {
        await tx.match.create({
          data: {
            id: generateUuid(),
            tournamentId: tournament.id,
            stageId: stage.id,
            roundId: round.id,
            matchNumber: m + 1,
            title: `${round.name} - Match ${m + 1}`,
            status: 'SCHEDULED',
            seriesConfig: tournament.formatConfig?.seriesConfig || { format: 'BO3', mapsCount: 3 },
            matchData: {
              engine: 'HEAD_TO_HEAD',
              bracket: 'LOWER',
              roundNumber: r,
              bracketSlot: m + 1,
            },
          },
        });
      }
    }

    // Create Grand Finals Match
    await tx.match.create({
      data: {
        id: generateUuid(),
        tournamentId: tournament.id,
        stageId: stage.id,
        roundId: grandFinalRound.id,
        matchNumber: 1,
        title: 'Grand Finals',
        status: 'SCHEDULED',
        seriesConfig: tournament.formatConfig?.seriesConfig || { format: 'BO5', mapsCount: 5 },
        matchData: {
          engine: 'HEAD_TO_HEAD',
          bracket: 'GRAND_FINALS',
          roundNumber: 1,
          bracketSlot: 1,
        },
      },
    });

    return { upperRounds: upperRounds.length, lowerRounds: lowerRounds.length };
  }

  /**
   * Generate Round Robin Fixtures (Every team plays every other team once)
   */
  static async generateRoundRobin(tx, tournament, participants, stage) {
    const count = participants.length;
    if (count < 2) {
      throw new ValidationError(`Round robin requires at least 2 participants. Current: ${count}`);
    }

    const round = await tx.tournamentRound.create({
      data: {
        id: generateUuid(),
        stageId: stage.id,
        name: 'Round Robin Stage',
        sequence: 1,
        roundType: 'GROUP',
        status: 'ACTIVE',
      },
    });

    let matchNum = 1;
    const matches = [];

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const matchId = generateUuid();
        const m = await tx.match.create({
          data: {
            id: matchId,
            tournamentId: tournament.id,
            stageId: stage.id,
            roundId: round.id,
            matchNumber: matchNum++,
            title: `Match ${matchNum - 1}: ${participants[i].team?.name || 'T1'} vs ${participants[j].team?.name || 'T2'}`,
            status: 'SCHEDULED',
            seriesConfig: tournament.formatConfig?.seriesConfig || { format: 'BO3', mapsCount: 3 },
            matchData: {
              engine: 'HEAD_TO_HEAD',
              format: 'ROUND_ROBIN',
            },
          },
        });

        await tx.matchParticipant.createMany({
          data: [
            { id: generateUuid(), matchId, registrationId: participants[i].id, slot: 1, score: 0 },
            { id: generateUuid(), matchId, registrationId: participants[j].id, slot: 2, score: 0 },
          ],
        });
        matches.push(m);
      }
    }

    return { totalMatches: matches.length };
  }

  /**
   * Generate Swiss System Round Pairings
   * Pairs participants by current win/loss record avoiding rematches
   */
  static async generateSwissRound(tx, tournament, stage, roundNumber = 1) {
    // 1. Fetch all participants and their match history in this stage
    const registrations = await tx.tournamentRegistration.findMany({
      where: { tournamentId: tournament.id, status: 'APPROVED' },
    });

    const previousMatches = await tx.match.findMany({
      where: { stageId: stage.id, status: 'COMPLETED' },
      include: { participants: true },
    });

    // Calculate win/loss for each participant
    const records = new Map();
    registrations.forEach((r) => {
      records.set(r.id, { reg: r, wins: 0, losses: 0, opponents: new Set() });
    });

    previousMatches.forEach((m) => {
      const p1 = m.participants[0];
      const p2 = m.participants[1];
      if (!p1 || !p2) return;

      if (records.has(p1.registrationId) && records.has(p2.registrationId)) {
        records.get(p1.registrationId).opponents.add(p2.registrationId);
        records.get(p2.registrationId).opponents.add(p1.registrationId);

        if (p1.isWinner) {
          records.get(p1.registrationId).wins += 1;
          records.get(p2.registrationId).losses += 1;
        } else if (p2.isWinner) {
          records.get(p2.registrationId).wins += 1;
          records.get(p1.registrationId).losses += 1;
        }
      }
    });

    // Group participants by win-loss score (e.g. 2-0, 1-1, 0-2)
    const list = Array.from(records.values());
    list.sort((a, b) => b.wins - a.wins || a.losses - b.losses);

    // Create Round
    const round = await tx.tournamentRound.create({
      data: {
        id: generateUuid(),
        stageId: stage.id,
        name: `Swiss Round ${roundNumber}`,
        sequence: roundNumber,
        roundType: 'GROUP',
        status: 'ACTIVE',
      },
    });

    // Pair candidates avoiding previous opponents
    const paired = new Set();
    let matchNum = 1;

    for (let i = 0; i < list.length; i++) {
      if (paired.has(list[i].reg.id)) continue;

      let opponentIndex = -1;
      for (let j = i + 1; j < list.length; j++) {
        if (!paired.has(list[j].reg.id) && !list[i].opponents.has(list[j].reg.id)) {
          opponentIndex = j;
          break;
        }
      }

      // If all rematches, pair with nearest unpaired
      if (opponentIndex === -1) {
        for (let j = i + 1; j < list.length; j++) {
          if (!paired.has(list[j].reg.id)) {
            opponentIndex = j;
            break;
          }
        }
      }

      if (opponentIndex !== -1) {
        paired.add(list[i].reg.id);
        paired.add(list[opponentIndex].reg.id);

        const matchId = generateUuid();
        await tx.match.create({
          data: {
            id: matchId,
            tournamentId: tournament.id,
            stageId: stage.id,
            roundId: round.id,
            matchNumber: matchNum++,
            title: `Swiss R${roundNumber} - Match ${matchNum - 1}`,
            status: 'SCHEDULED',
            seriesConfig: tournament.formatConfig?.seriesConfig || { format: 'BO3', mapsCount: 3 },
            matchData: {
              engine: 'HEAD_TO_HEAD',
              format: 'SWISS',
              roundNumber,
            },
          },
        });

        await tx.matchParticipant.createMany({
          data: [
            { id: generateUuid(), matchId, registrationId: list[i].reg.id, slot: 1, score: 0 },
            { id: generateUuid(), matchId, registrationId: list[opponentIndex].reg.id, slot: 2, score: 0 },
          ],
        });
      }
    }

    return { roundNumber, matchesCount: matchNum - 1 };
  }

  /**
   * Calculate Series Winner (BO1, BO3, BO5) and Map Scores
   */
  static calculateSeriesResult(mapScores = [], seriesFormat = 'BO3') {
    let p1Wins = 0;
    let p2Wins = 0;

    for (const m of mapScores) {
      const p1MapScore = Number(m.p1Score || 0);
      const p2MapScore = Number(m.p2Score || 0);

      if (p1MapScore > p2MapScore) {
        p1Wins += 1;
      } else if (p2MapScore > p1MapScore) {
        p2Wins += 1;
      }
    }

    const winsNeeded = seriesFormat === 'BO1' ? 1 : seriesFormat === 'BO5' ? 3 : 2;
    const isCompleted = p1Wins >= winsNeeded || p2Wins >= winsNeeded;
    const winnerSlot = p1Wins >= winsNeeded ? 1 : p2Wins >= winsNeeded ? 2 : null;

    return {
      p1Wins,
      p2Wins,
      winnerSlot,
      isCompleted,
    };
  }

  /**
   * Advance Winner and Loser in Single or Double Elimination Bracket
   */
  static async advanceBracket(tx, match, winningRegistrationId) {
    const round = await tx.tournamentRound.findUnique({
      where: { id: match.roundId },
      include: { stage: true },
    });
    if (!round) return;

    // SINGLE ELIMINATION ADVANCEMENT
    if (round.roundType === 'UPPER') {
      const nextSequence = round.sequence + 1;
      const nextRound = await tx.tournamentRound.findFirst({
        where: {
          stageId: round.stageId,
          sequence: nextSequence,
          roundType: 'UPPER',
        },
      });

      if (nextRound) {
        // Paired match: match 1 & 2 feed next match 1 (slot 1 & 2), match 3 & 4 feed next match 2...
        const targetMatchNumber = Math.ceil(match.matchNumber / 2);
        const targetSlot = (match.matchNumber % 2 === 1) ? 1 : 2;

        const targetMatch = await tx.match.findFirst({
          where: {
            roundId: nextRound.id,
            matchNumber: targetMatchNumber,
          },
        });

        if (targetMatch) {
          await tx.matchParticipant.upsert({
            where: {
              matchId_slot: {
                matchId: targetMatch.id,
                slot: targetSlot,
              },
            },
            create: {
              id: generateUuid(),
              matchId: targetMatch.id,
              registrationId: winningRegistrationId,
              slot: targetSlot,
              score: 0,
            },
            update: {
              registrationId: winningRegistrationId,
            },
          });
        }
      }
    }
  }

  /**
   * Compute Head-to-Head Standings (Wins, Losses, Map Differential, Points)
   */
  static computeStandings(matchesWithResults, registrations) {
    const table = new Map();

    registrations.forEach((reg) => {
      table.set(reg.id, {
        registrationId: reg.id,
        registration: reg,
        played: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        mapWins: 0,
        mapLosses: 0,
        mapDifferential: 0,
        points: 0,
      });
    });

    matchesWithResults.forEach((m) => {
      if (m.status !== 'COMPLETED' || !m.participants || m.participants.length < 2) return;

      const p1 = m.participants[0];
      const p2 = m.participants[1];

      if (!table.has(p1.registrationId) || !table.has(p2.registrationId)) return;

      const e1 = table.get(p1.registrationId);
      const e2 = table.get(p2.registrationId);

      e1.played += 1;
      e2.played += 1;

      e1.mapWins += Number(p1.score || 0);
      e1.mapLosses += Number(p2.score || 0);

      e2.mapWins += Number(p2.score || 0);
      e2.mapLosses += Number(p1.score || 0);

      if (p1.isWinner) {
        e1.wins += 1;
        e1.points += 3;
        e2.losses += 1;
      } else if (p2.isWinner) {
        e2.wins += 1;
        e2.points += 3;
        e1.losses += 1;
      } else {
        e1.draws += 1;
        e2.draws += 1;
        e1.points += 1;
        e2.points += 1;
      }
    });

    const rows = Array.from(table.values());
    rows.forEach((r) => {
      r.mapDifferential = r.mapWins - r.mapLosses;
    });

    // Sort: 1. Points, 2. Map Differential, 3. Map Wins, 4. Head-to-head win
    rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.mapDifferential !== a.mapDifferential) return b.mapDifferential - a.mapDifferential;
      if (b.mapWins !== a.mapWins) return b.mapWins - a.mapWins;
      return (a.registration.seed || 999) - (b.registration.seed || 999);
    });

    return rows.map((row, idx) => ({
      rank: idx + 1,
      registrationId: row.registrationId,
      played: row.played,
      wins: row.wins,
      losses: row.losses,
      draws: row.draws,
      points: row.points,
      metrics: {
        mapWins: row.mapWins,
        mapLosses: row.mapLosses,
        mapDifferential: row.mapDifferential,
      },
    }));
  }
}

