import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { notificationService } from '../../services/notification.service.js';
import { BattleRoyaleEngine } from '../competition/engines/battleRoyale.engine.js';
import { HeadToHeadEngine } from '../competition/engines/headToHead.engine.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors.js';

export class ResultsService {
  /**
   * Submit match results (creates a revision)
   */
  async submitResult(matchId, userId, payload) {
    const { participantResults, mapScores, evidenceUrls, notes } = payload;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        participants: true,
        result: { include: { revisions: true } },
      },
    });

    if (!match) throw new NotFoundError('Match not found');

    const isOrganizer = match.tournament.organizerUserId === userId;
    const isParticipant = match.participants.some((p) => p.registrationId);

    if (!isOrganizer && !isParticipant) {
      throw new ForbiddenError('You do not have permission to submit results for this match');
    }

    const matchEngine = match.tournament.formatConfig?.matchEngine ||
      (match.tournament.format === 'BATTLE_ROYALE' ? 'BATTLE_ROYALE' : 'HEAD_TO_HEAD');

    let processedResults = participantResults || [];

    // Calculate scores according to engine
    if (matchEngine === 'BATTLE_ROYALE') {
      const ruleset = match.tournament.formatConfig?.scoringRuleset || {};
      processedResults = BattleRoyaleEngine.calculateMatchScores(participantResults, ruleset);
    } else if (mapScores && mapScores.length > 0) {
      const seriesFormat = match.seriesConfig?.format || 'BO3';
      const seriesResult = HeadToHeadEngine.calculateSeriesResult(mapScores, seriesFormat);
      if (seriesResult.isCompleted && seriesResult.winnerSlot) {
        processedResults = match.participants.map((p) => ({
          registrationId: p.registrationId,
          slot: p.slot,
          score: p.slot === 1 ? seriesResult.p1Wins : seriesResult.p2Wins,
          isWinner: p.slot === seriesResult.winnerSlot,
          metrics: { mapScores, seriesWins: p.slot === 1 ? seriesResult.p1Wins : seriesResult.p2Wins },
        }));
      }
    }

    return prisma.$transaction(async (tx) => {
      let matchResult = match.result;
      if (!matchResult) {
        matchResult = await tx.matchResult.create({
          data: {
            id: generateUuid(),
            matchId,
            status: 'PENDING',
          },
        });
      }

      const nextRevNum = (match.result?.revisions?.length || 0) + 1;
      const revisionId = generateUuid();

      const revision = await tx.resultRevision.create({
        data: {
          id: revisionId,
          resultId: matchResult.id,
          revisionNumber: nextRevNum,
          submittedById: userId,
          payload: { participantResults: processedResults, mapScores, notes },
          evidenceUrls: evidenceUrls || [],
          status: isOrganizer ? 'APPROVED' : 'SUBMITTED',
          reviewedById: isOrganizer ? userId : null,
          reviewedAt: isOrganizer ? new Date() : null,
        },
      });

      if (isOrganizer) {
        await this.applyApprovedRevision(tx, match, matchResult, revision, processedResults);
      } else {
        await notificationService.notifyUser({
          recipientId: match.tournament.organizerUserId,
          type: 'RESULT_SUBMITTED',
          title: 'Match Result Submitted',
          message: `Results have been submitted for Match #${match.matchNumber} in ${match.tournament.name} and are awaiting review.`,
          payload: { matchId, tournamentId: match.tournamentId, revisionId: revision.id },
        });
      }

      return revision;
    });
  }

  /**
   * Approve result revision (Authoritative operation with idempotency)
   */
  async approveResult(resultId, actorId) {
    const matchResult = await prisma.matchResult.findUnique({
      where: { id: resultId },
      include: {
        match: {
          include: {
            tournament: { include: { game: true } },
            round: true,
            stage: true,
            participants: {
              include: {
                registration: {
                  include: {
                    team: { include: { memberships: { include: { user: { include: { gamerProfile: true } } } } } },
                    gamerProfile: true,
                  },
                },
              },
            },
          },
        },
        revisions: { orderBy: { revisionNumber: 'desc' } },
      },
    });

    if (!matchResult) throw new NotFoundError('Match result not found');

    const match = matchResult.match;
    if (match.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only the tournament organizer can approve results');
    }

    const latestRevision = matchResult.revisions[0];
    if (!latestRevision) throw new NotFoundError('No result revision found to approve');

    // Idempotency: If already approved with the current revision, return safely
    if (matchResult.status === 'APPROVED' && matchResult.currentApprovedRevisionId === latestRevision.id) {
      return latestRevision;
    }

    return prisma.$transaction(async (tx) => {
      await tx.resultRevision.update({
        where: { id: latestRevision.id },
        data: {
          status: 'APPROVED',
          reviewedById: actorId,
          reviewedAt: new Date(),
        },
      });

      const participantResults = latestRevision.payload?.participantResults || [];
      await this.applyApprovedRevision(tx, match, matchResult, latestRevision, participantResults);

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: generateUuid(),
          userId: actorId,
          action: 'RESULT_APPROVED',
          resourceType: 'MATCH_RESULT',
          resourceId: resultId,
          payload: { matchId: match.id, tournamentId: match.tournamentId, revisionNumber: latestRevision.revisionNumber },
        },
      });

      return latestRevision;
    });
  }

  /**
   * Result correction workflow: creates a revision, preserves previous version, and recalculates standings
   */
  async correctResult(resultId, actorId, { participantResults, mapScores, reason, evidenceUrls }) {
    const matchResult = await prisma.matchResult.findUnique({
      where: { id: resultId },
      include: {
        match: {
          include: {
            tournament: { include: { game: true } },
            round: true,
            stage: true,
            participants: true,
          },
        },
        revisions: { orderBy: { revisionNumber: 'desc' } },
      },
    });

    if (!matchResult) throw new NotFoundError('Match result not found');

    const match = matchResult.match;
    if (match.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only the tournament organizer can correct results');
    }

    const nextRevNum = (matchResult.revisions?.length || 0) + 1;
    const revisionId = generateUuid();

    const matchEngine = match.tournament.formatConfig?.matchEngine ||
      (match.tournament.format === 'BATTLE_ROYALE' ? 'BATTLE_ROYALE' : 'HEAD_TO_HEAD');

    let processedResults = participantResults || [];
    if (matchEngine === 'BATTLE_ROYALE') {
      const ruleset = match.tournament.formatConfig?.scoringRuleset || {};
      processedResults = BattleRoyaleEngine.calculateMatchScores(participantResults, ruleset);
    }

    return prisma.$transaction(async (tx) => {
      const newRevision = await tx.resultRevision.create({
        data: {
          id: revisionId,
          resultId: matchResult.id,
          revisionNumber: nextRevNum,
          submittedById: actorId,
          payload: { participantResults: processedResults, mapScores, correctionReason: reason },
          evidenceUrls: evidenceUrls || [],
          status: 'APPROVED',
          reviewedById: actorId,
          reviewedAt: new Date(),
        },
      });

      await this.applyApprovedRevision(tx, match, matchResult, newRevision, processedResults);

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: generateUuid(),
          userId: actorId,
          action: 'RESULT_CORRECTED',
          resourceType: 'MATCH_RESULT',
          resourceId: resultId,
          payload: {
            matchId: match.id,
            revisionNumber: nextRevNum,
            reason,
          },
        },
      });

      return newRevision;
    });
  }

  /**
   * Apply approved revision: updates match scores, winners, bracket propagation, standings & achievements
   */
  async applyApprovedRevision(tx, match, matchResult, revision, participantResults) {
    let winningRegistrationId = null;

    // 1. Update MatchParticipant scores and winner flags
    for (const pr of participantResults) {
      if (pr.isWinner) {
        winningRegistrationId = pr.registrationId;
      }

      await tx.matchParticipant.updateMany({
        where: {
          matchId: match.id,
          registrationId: pr.registrationId,
        },
        data: {
          score: Number(pr.score || 0),
          isWinner: Boolean(pr.isWinner),
          metrics: pr.metrics || {},
        },
      });
    }

    // 2. Update Match and MatchResult state
    await tx.match.update({
      where: { id: match.id },
      data: { status: 'COMPLETED' },
    });

    await tx.matchResult.update({
      where: { id: matchResult.id },
      data: {
        status: 'APPROVED',
        currentApprovedRevisionId: revision.id,
      },
    });

    // 3. Bracket advancement for Head-to-Head formats
    if (winningRegistrationId && match.roundId) {
      await HeadToHeadEngine.advanceBracket(tx, match, winningRegistrationId);
    }

    // 4. Standings snapshot recalculation
    await this.recalculateStandings(tx, match.tournamentId, match.stageId);

    // 5. If this is a final round / championship match, award achievements
    const isFinals = match.round?.name?.toLowerCase().includes('final') ||
      match.round?.roundType === 'FINALS';

    if (isFinals && winningRegistrationId) {
      await this.awardFinalTrophies(tx, match.tournament, winningRegistrationId, revision.id);
    }
  }

  /**
   * Recalculate standings snapshot for tournament stage
   */
  async recalculateStandings(tx, tournamentId, stageId) {
    const tournament = await tx.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          where: { status: 'APPROVED' },
          include: { team: true, gamerProfile: true },
        },
        matches: {
          where: { status: 'COMPLETED' },
          include: { participants: true },
        },
      },
    });

    if (!tournament) return;

    const matchEngine = tournament.formatConfig?.matchEngine ||
      (tournament.format === 'BATTLE_ROYALE' ? 'BATTLE_ROYALE' : 'HEAD_TO_HEAD');

    let rows = [];
    if (matchEngine === 'BATTLE_ROYALE') {
      const ruleset = tournament.formatConfig?.scoringRuleset || {};
      rows = BattleRoyaleEngine.computeCumulativeStandings(tournament.matches, tournament.registrations, ruleset);
    } else {
      rows = HeadToHeadEngine.computeStandings(tournament.matches, tournament.registrations);
    }

    // Mark previous snapshots as non-current
    await tx.standingSnapshot.updateMany({
      where: { tournamentId, isCurrent: true },
      data: { isCurrent: false },
    });

    // Create new snapshot
    const snapshotId = generateUuid();
    await tx.standingSnapshot.create({
      data: {
        id: snapshotId,
        tournamentId,
        stageId,
        isCurrent: true,
      },
    });

    // Bulk insert standing rows
    if (rows.length > 0) {
      await tx.standingRow.createMany({
        data: rows.map((r) => ({
          id: generateUuid(),
          snapshotId,
          registrationId: r.registrationId,
          rank: r.rank,
          played: r.played,
          wins: r.wins,
          losses: r.losses,
          draws: r.draws,
          points: r.points,
          metrics: r.metrics || {},
          tieBreakValues: r.tieBreakValues || {},
        })),
      });
    }
  }

  /**
   * Award verified tournament trophies to winners and runners-up
   */
  async awardFinalTrophies(tx, tournament, winnerRegistrationId, revisionId) {
    const registrations = await tx.tournamentRegistration.findMany({
      where: { tournamentId: tournament.id, status: 'APPROVED' },
      include: {
        team: { include: { memberships: { include: { user: { include: { gamerProfile: true } } } } } },
        gamerProfile: true,
      },
    });

    for (const reg of registrations) {
      const isWinner = reg.id === winnerRegistrationId;
      const placement = isWinner ? 1 : 2;
      const title = isWinner
        ? `Champion — ${tournament.name}`
        : `Runner-Up — ${tournament.name}`;
      const type = isWinner ? 'WINNER' : 'RUNNER_UP';

      const targetProfiles = reg.entrantType === 'INDIVIDUAL'
        ? [reg.gamerProfile].filter(Boolean)
        : reg.team?.memberships?.map((m) => m.user?.gamerProfile).filter(Boolean) || [];

      for (const gp of targetProfiles) {
        const idempotencyKey = `${tournament.id}_${gp.id}_${type}`;

        const achievement = await tx.gamerAchievement.upsert({
          where: { idempotencyKey },
          create: {
            id: generateUuid(),
            gamerProfileId: gp.id,
            tournamentId: tournament.id,
            teamId: reg.teamId,
            gameId: tournament.gameId,
            title,
            type,
            placement,
            verificationStatus: 'EVOQ_VERIFIED',
            sourceResultRevisionId: revisionId,
            idempotencyKey,
          },
          update: { title, placement },
        });

        await tx.achievementProof.create({
          data: {
            id: generateUuid(),
            achievementId: achievement.id,
            proofType: 'RESULT_REVISION',
            description: `Official tournament result verified on EVOQ platform`,
            status: 'APPROVED',
          },
        });
      }
    }
  }

  /**
   * Reject result revision
   */
  async rejectResult(resultId, actorId, { rejectionReason }) {
    const matchResult = await prisma.matchResult.findUnique({
      where: { id: resultId },
      include: {
        match: { include: { tournament: true } },
        revisions: { orderBy: { revisionNumber: 'desc' } },
      },
    });

    if (!matchResult) throw new NotFoundError('Match result not found');

    if (matchResult.match.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only the tournament organizer can reject results');
    }

    const latestRevision = matchResult.revisions[0];
    if (!latestRevision) throw new NotFoundError('No revision found');

    return prisma.resultRevision.update({
      where: { id: latestRevision.id },
      data: {
        status: 'REJECTED',
        reviewedById: actorId,
        reviewedAt: new Date(),
        rejectionReason,
      },
    });
  }

  /**
   * Get standings for tournament
   */
  async getStandings(tournamentId) {
    const snapshot = await prisma.standingSnapshot.findFirst({
      where: { tournamentId, isCurrent: true },
      include: {
        rows: {
          orderBy: { rank: 'asc' },
          include: {
            registration: {
              include: {
                team: { select: { id: true, name: true, slug: true, logoUrl: true, tag: true } },
                gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
              },
            },
          },
        },
      },
    });

    return snapshot || { rows: [] };
  }
}

export const resultsService = new ResultsService();
