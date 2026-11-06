import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { notificationService } from '../../services/notification.service.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors.js';

export class ResultsService {
  /**
   * Submit match results (creates a revision)
   */
  async submitResult(matchId, userId, { participantResults, evidenceUrls, notes }) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        participants: true,
        result: { include: { revisions: true } },
      },
    });

    if (!match) throw new NotFoundError('Match not found');

    // Participant or organizer can submit
    const isOrganizer = match.tournament.organizerUserId === userId;
    const isParticipant = match.participants.some((p) => p.registrationId);

    if (!isOrganizer && !isParticipant) {
      throw new ForbiddenError('You do not have permission to submit results for this match');
    }

    return prisma.$transaction(async (tx) => {
      // Ensure match result container exists
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
          payload: { participantResults, notes },
          evidenceUrls: evidenceUrls || [],
          status: isOrganizer ? 'APPROVED' : 'SUBMITTED', // auto-approve if submitted directly by organizer
          reviewedById: isOrganizer ? userId : null,
          reviewedAt: isOrganizer ? new Date() : null,
        },
      });

      if (isOrganizer) {
        // If organizer submitted directly, trigger immediate approval workflow
        await this.applyApprovedRevision(tx, match, matchResult, revision, participantResults);
      } else {
        // Notify organizer
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
   * Approve result revision (Authoritative operation)
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
        where: { matchId: match.id, registrationId: pr.registrationId },
        data: {
          score: pr.score,
          metrics: pr.metrics || null,
          isWinner: pr.isWinner || false,
        },
      });
    }

    // 2. Mark match completed
    await tx.match.update({
      where: { id: match.id },
      data: {
        status: 'COMPLETED',
        winningRegistrationId,
        endTime: new Date(),
      },
    });

    // 3. Update MatchResult
    await tx.matchResult.update({
      where: { id: matchResult.id },
      data: {
        currentApprovedRevisionId: revision.id,
        status: 'APPROVED',
      },
    });

    // 4. Bracket propagation: if single elimination, advance winner to next round match
    if (winningRegistrationId && match.round) {
      const nextRound = await tx.tournamentRound.findFirst({
        where: {
          stageId: match.stageId,
          sequence: match.round.sequence + 1,
        },
      });

      if (nextRound) {
        const nextMatchNumber = Math.ceil(match.matchNumber / 2);
        const nextSlot = match.matchNumber % 2 === 1 ? 1 : 2;

        const nextMatch = await tx.match.findFirst({
          where: {
            roundId: nextRound.id,
            matchNumber: nextMatchNumber,
          },
        });

        if (nextMatch) {
          await tx.matchParticipant.upsert({
            where: {
              matchId_slot: {
                matchId: nextMatch.id,
                slot: nextSlot,
              },
            },
            create: {
              id: generateUuid(),
              matchId: nextMatch.id,
              registrationId: winningRegistrationId,
              slot: nextSlot,
            },
            update: {
              registrationId: winningRegistrationId,
            },
          });
        }
      }
    }

    // 5. Recalculate Standings Snapshot
    await this.recalculateStandings(tx, match.tournamentId, match.stageId, match.groupId);

    // 6. Cross-Module: Check if Tournament Concluded -> Award Verified Achievements & Portfolio
    const remainingUnfinishedMatches = await tx.match.count({
      where: {
        tournamentId: match.tournamentId,
        status: { not: 'COMPLETED' },
      },
    });

    const isFinals = match.round?.name?.toLowerCase().includes('final') || remainingUnfinishedMatches === 0;

    if (isFinals && winningRegistrationId) {
      await this.awardTournamentAchievements(tx, match.tournament, match, winningRegistrationId, revision.id);
    }
  }

  /**
   * Recalculate tournament standings
   */
  async recalculateStandings(tx, tournamentId, stageId = null, groupId = null) {
    const matches = await tx.match.findMany({
      where: {
        tournamentId,
        status: 'COMPLETED',
        ...(stageId ? { stageId } : {}),
        ...(groupId ? { groupId } : {}),
      },
      include: { participants: true },
    });

    const statsMap = new Map();

    for (const m of matches) {
      for (const p of m.participants) {
        if (!statsMap.has(p.registrationId)) {
          statsMap.set(p.registrationId, {
            registrationId: p.registrationId,
            played: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            scoreFor: 0,
          });
        }
        const st = statsMap.get(p.registrationId);
        st.played += 1;
        st.scoreFor += p.score;
        if (p.isWinner) {
          st.wins += 1;
          st.points += 3;
        } else {
          st.losses += 1;
        }
      }
    }

    // Sort by points desc, scoreFor desc
    const sorted = Array.from(statsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.scoreFor - a.scoreFor;
    });

    // Mark previous snapshots inactive
    await tx.standingSnapshot.updateMany({
      where: { tournamentId, isCurrent: true },
      data: { isCurrent: false },
    });

    const snapshotId = generateUuid();
    await tx.standingSnapshot.create({
      data: {
        id: snapshotId,
        tournamentId,
        stageId,
        groupId,
        isCurrent: true,
      },
    });

    for (let i = 0; i < sorted.length; i++) {
      const row = sorted[i];
      await tx.standingRow.create({
        data: {
          id: generateUuid(),
          snapshotId,
          registrationId: row.registrationId,
          rank: i + 1,
          played: row.played,
          wins: row.wins,
          losses: row.losses,
          draws: row.draws,
          points: row.points,
        },
      });
    }
  }

  /**
   * Verified Achievements & Career Records generation (Phase 6 & 7)
   */
  async awardTournamentAchievements(tx, tournament, finalsMatch, winnerRegistrationId, revisionId) {
    const registrations = await tx.tournamentRegistration.findMany({
      where: { tournamentId: tournament.id, status: 'APPROVED' },
      include: {
        team: { include: { memberships: { include: { user: { include: { gamerProfile: true } } } } } },
        gamerProfile: true,
      },
    });

    for (const reg of registrations) {
      const isWinner = reg.id === winnerRegistrationId;
      const placement = isWinner ? 1 : 2; // Finals pairing
      const title = isWinner
        ? `Champion — ${tournament.name}`
        : `Runner-Up — ${tournament.name}`;
      const type = isWinner ? 'WINNER' : 'RUNNER_UP';

      // Gather gamer profiles (individual or all team members)
      const targetProfiles = reg.entrantType === 'INDIVIDUAL'
        ? [reg.gamerProfile].filter(Boolean)
        : reg.team?.memberships?.map((m) => m.user?.gamerProfile).filter(Boolean) || [];

      for (const gp of targetProfiles) {
        const idempotencyKey = `${tournament.id}_${gp.id}_${type}`;

        // 1. Award Verified Achievement
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
          update: {
            title,
            placement,
          },
        });

        // Add verification proof
        await tx.achievementProof.create({
          data: {
            id: generateUuid(),
            achievementId: achievement.id,
            proofType: 'RESULT_REVISION',
            description: `Official tournament result verified on EVOQ platform`,
            status: 'APPROVED',
          },
        });

        // 2. Update Career Record
        await tx.gamerCareerRecord.upsert({
          where: {
            gamerProfileId_tournamentId: {
              gamerProfileId: gp.id,
              tournamentId: tournament.id,
            },
          },
          create: {
            id: generateUuid(),
            gamerProfileId: gp.id,
            tournamentId: tournament.id,
            teamId: reg.teamId,
            gameId: tournament.gameId,
            teamName: reg.team?.name || null,
            finalPlacement: placement,
            matchesPlayed: 1,
            matchesWon: isWinner ? 1 : 0,
            startDate: tournament.startDate,
            endDate: tournament.endDate || new Date(),
            verified: true,
          },
          update: {
            finalPlacement: placement,
            matchesWon: isWinner ? 1 : 0,
          },
        });

        // 3. Update Gamer Statistics
        await tx.gamerStatistic.upsert({
          where: {
            gamerProfileId_gameId: {
              gamerProfileId: gp.id,
              gameId: tournament.gameId,
            },
          },
          create: {
            id: generateUuid(),
            gamerProfileId: gp.id,
            gameId: tournament.gameId,
            tournamentsPlayed: 1,
            tournamentsWon: isWinner ? 1 : 0,
            podiumFinishes: 1,
            matchesPlayed: 1,
            matchesWon: isWinner ? 1 : 0,
          },
          update: {
            tournamentsWon: isWinner ? { increment: 1 } : undefined,
            podiumFinishes: { increment: 1 },
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
                team: { select: { id: true, name: true, slug: true, logoUrl: true } },
                gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true } },
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

