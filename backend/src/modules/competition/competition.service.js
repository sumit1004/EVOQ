import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { encryptSecret, decryptSecret } from '../../utils/crypto.js';
import { notificationService } from '../../services/notification.service.js';
import { BattleRoyaleEngine } from './engines/battleRoyale.engine.js';
import { HeadToHeadEngine } from './engines/headToHead.engine.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors.js';

export class CompetitionService {
  /**
   * List stages, rounds, and groups for a tournament
   */
  async getStages(tournamentId) {
    return prisma.tournamentStage.findMany({
      where: { tournamentId },
      include: {
        rounds: {
          orderBy: { sequence: 'asc' },
          include: {
            matches: {
              orderBy: { matchNumber: 'asc' },
              include: {
                participants: {
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
            },
          },
        },
        groups: {
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: { sequence: 'asc' },
    });
  }

  /**
   * List matches for a tournament
   */
  async listMatches(tournamentId) {
    return prisma.match.findMany({
      where: { tournamentId },
      include: {
        stage: { select: { id: true, name: true, sequence: true } },
        round: { select: { id: true, name: true, sequence: true, roundType: true } },
        group: { select: { id: true, name: true } },
        participants: {
          include: {
            registration: {
              include: {
                team: { select: { id: true, name: true, slug: true, logoUrl: true, tag: true } },
                gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
              },
            },
          },
          orderBy: { slot: 'asc' },
        },
        result: {
          select: { id: true, status: true, currentApprovedRevisionId: true },
        },
      },
      orderBy: [{ stageId: 'asc' }, { roundId: 'asc' }, { matchNumber: 'asc' }],
    });
  }

  /**
   * Get single match details
   */
  async getMatchById(matchId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            slug: true,
            format: true,
            organizerUserId: true,
            formatConfig: true,
            game: true,
          },
        },
        stage: true,
        round: true,
        group: true,
        participants: {
          include: {
            registration: {
              include: {
                team: { select: { id: true, name: true, slug: true, logoUrl: true, tag: true } },
                gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
                members: { include: { gamerProfile: true } },
              },
            },
          },
          orderBy: { slot: 'asc' },
        },
        result: {
          include: {
            revisions: {
              orderBy: { revisionNumber: 'desc' },
            },
          },
        },
      },
    });

    if (!match) throw new NotFoundError('Match not found');
    return match;
  }

  /**
   * Automatic match generation based on format and competition engine
   */
  async generateMatches(tournamentId, actorId, options = {}) {
    const { stageId, randomizeSeeds = false } = options;

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        game: true,
        stages: { orderBy: { sequence: 'asc' } },
        registrations: {
          where: { status: 'APPROVED' },
          orderBy: { seed: 'asc' },
          include: {
            team: true,
            gamerProfile: true,
          },
        },
      },
    });

    if (!tournament) throw new NotFoundError('Tournament not found');
    if (tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only the tournament organizer can generate matches');
    }

    const participants = [...tournament.registrations];
    if (participants.length < 2) {
      throw new ValidationError(
        `Cannot generate competition structure with fewer than 2 approved participants. Current: ${participants.length}`
      );
    }

    if (randomizeSeeds) {
      participants.sort(() => Math.random() - 0.5);
    }

    const targetStage = stageId
      ? tournament.stages.find((s) => s.id === stageId)
      : tournament.stages[0];

    if (!targetStage) throw new NotFoundError('Stage not found');

    const formatConfig = tournament.formatConfig || {};
    const matchEngine = formatConfig.matchEngine || (tournament.format === 'BATTLE_ROYALE' ? 'BATTLE_ROYALE' : 'HEAD_TO_HEAD');

    return prisma.$transaction(async (tx) => {
      // ── 1. BATTLE ROYALE ENGINE ──
      if (matchEngine === 'BATTLE_ROYALE' || tournament.format === 'BATTLE_ROYALE') {
        const teamsPerLobby = formatConfig.teamsPerLobby || 12;
        const matchesPerGroup = formatConfig.matchesPerGroup || 3;
        const maps = formatConfig.maps || ['Map 1', 'Map 2', 'Map 3'];

        await BattleRoyaleEngine.generateBrStructure(tx, tournament, participants, {
          teamsPerLobby,
          matchesPerGroup,
          maps,
          targetStageId: targetStage.id,
        });
      }
      // ── 2. HEAD-TO-HEAD ENGINE ──
      else {
        const format = tournament.format;

        if (format === 'DOUBLE_ELIMINATION') {
          await HeadToHeadEngine.generateDoubleElimination(tx, tournament, participants, targetStage);
        } else if (format === 'ROUND_ROBIN') {
          await HeadToHeadEngine.generateRoundRobin(tx, tournament, participants, targetStage);
        } else if (format === 'SWISS') {
          await HeadToHeadEngine.generateSwissRound(tx, tournament, targetStage, 1);
        } else {
          // Default: SINGLE_ELIMINATION
          await HeadToHeadEngine.generateSingleElimination(tx, tournament, participants, targetStage);
        }
      }

      // Update tournament state to ONGOING
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { status: 'ONGOING' },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: generateUuid(),
          userId: actorId,
          action: 'MATCHES_GENERATED',
          resourceType: 'TOURNAMENT',
          resourceId: tournamentId,
          payload: {
            format: tournament.format,
            matchEngine,
            participantsCount: participants.length,
          },
        },
      });

      return { success: true };
    });
  }

  /**
   * Schedule match with timezone and venue/server support
   */
  async scheduleMatch(matchId, actorId, scheduleData) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: true },
    });
    if (!match) throw new NotFoundError('Match not found');

    if (match.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only the tournament organizer can schedule matches');
    }

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: {
        ...(scheduleData.scheduledTime ? { scheduledTime: new Date(scheduleData.scheduledTime) } : {}),
        ...(scheduleData.lobbyInfo !== undefined ? { lobbyInfo: scheduleData.lobbyInfo } : {}),
        ...(scheduleData.serverRegion !== undefined ? { serverRegion: scheduleData.serverRegion } : {}),
        ...(scheduleData.status ? { status: scheduleData.status } : {}),
      },
    });

    // Notify participants
    const participants = await prisma.matchParticipant.findMany({
      where: { matchId },
      include: { registration: true },
    });

    for (const p of participants) {
      await notificationService.notifyUser({
        recipientId: p.registration.registeredById,
        type: 'MATCH_SCHEDULED',
        title: 'Match Schedule Updated',
        message: `Match #${match.matchNumber} has been updated in ${match.tournament.name}.`,
        payload: { matchId, tournamentId: match.tournamentId },
      });
    }

    return updated;
  }

  /**
   * Open match check-in window
   */
  async openCheckIn(matchId, actorId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: true, participants: { include: { registration: true } } },
    });
    if (!match) throw new NotFoundError('Match not found');

    if (match.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can open check-in');
    }

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: { status: 'CHECK_IN_OPEN' },
    });

    for (const p of match.participants) {
      await notificationService.notifyUser({
        recipientId: p.registration.registeredById,
        type: 'MATCH_CHECK_IN_OPEN',
        title: 'Match Check-In Now Open',
        message: `Check-in is now open for Match #${match.matchNumber} in ${match.tournament.name}. Please confirm your readiness.`,
        payload: { matchId, tournamentId: match.tournamentId },
      });
    }

    return updated;
  }

  /**
   * Participant checks in to match
   */
  async checkInParticipant(matchId, userId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        participants: {
          include: {
            registration: {
              include: { team: { include: { memberships: true } } },
            },
          },
        },
      },
    });

    if (!match) throw new NotFoundError('Match not found');

    const participant = match.participants.find((p) => {
      const reg = p.registration;
      if (reg.registeredById === userId) return true;
      if (reg.entrantType === 'TEAM' && reg.team) {
        return reg.team.memberships.some((m) => m.userId === userId && m.status === 'ACTIVE');
      }
      return false;
    });

    if (!participant) {
      throw new ForbiddenError('You are not an eligible participant in this match');
    }

    await prisma.tournamentRegistration.update({
      where: { id: participant.registrationId },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    });

    return { success: true, message: 'Check-in confirmed!' };
  }

  /**
   * Set protected room credentials (Encrypted AES-256-GCM)
   */
  async setMatchCredentials(matchId, actorId, data) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        participants: {
          include: {
            registration: {
              include: { team: { include: { memberships: true } }, gamerProfile: true },
            },
          },
        },
      },
    });

    if (!match) throw new NotFoundError('Match not found');
    if (match.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can set room credentials');
    }

    const roomPasswordEncrypted = encryptSecret(data.roomPassword);

    const credential = await prisma.matchCredential.upsert({
      where: { matchId },
      create: {
        id: generateUuid(),
        matchId,
        roomId: data.roomId,
        roomPasswordEncrypted,
        lobbyDetails: data.lobbyDetails,
        accessInstructions: data.accessInstructions,
        isReleased: data.isReleased,
        releasedAt: data.isReleased ? new Date() : null,
        releasedById: data.isReleased ? actorId : null,
      },
      update: {
        roomId: data.roomId,
        roomPasswordEncrypted,
        lobbyDetails: data.lobbyDetails,
        accessInstructions: data.accessInstructions,
        isReleased: data.isReleased,
        ...(data.isReleased ? { releasedAt: new Date(), releasedById: actorId } : {}),
      },
    });

    // Notify participants if released
    if (data.isReleased) {
      for (const p of match.participants) {
        const reg = p.registration;
        await notificationService.notifyUser({
          recipientId: reg.registeredById,
          type: 'CREDENTIALS_RELEASED',
          title: 'Room Credentials Available',
          message: `Lobby credentials for Match #${match.matchNumber} in ${match.tournament.name} have been released!`,
          payload: { matchId, tournamentId: match.tournamentId },
        });
      }
    }

    return {
      matchId,
      roomId: credential.roomId,
      isReleased: credential.isReleased,
      releasedAt: credential.releasedAt,
    };
  }

  /**
   * Revoke room credentials
   */
  async revokeMatchCredentials(matchId, actorId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: true },
    });
    if (!match) throw new NotFoundError('Match not found');

    if (match.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can revoke credentials');
    }

    await prisma.matchCredential.update({
      where: { matchId },
      data: {
        isReleased: false,
        releasedAt: null,
        releasedById: null,
      },
    });

    return { success: true, message: 'Room credentials revoked' };
  }

  /**
   * Retrieve room credentials (with strict eligibility check)
   */
  async getMatchCredentials(matchId, userId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        credential: true,
        participants: {
          include: {
            registration: {
              include: { team: { include: { memberships: true } } },
            },
          },
        },
      },
    });

    if (!match || !match.credential) {
      throw new NotFoundError('No room credentials configured for this match');
    }

    const isOrganizer = match.tournament.organizerUserId === userId;

    let isParticipant = false;
    for (const p of match.participants) {
      const reg = p.registration;
      if (reg.registeredById === userId) {
        isParticipant = true;
        break;
      }
      if (reg.entrantType === 'TEAM' && reg.team) {
        const isTeamMember = reg.team.memberships.some((m) => m.userId === userId && m.status === 'ACTIVE');
        if (isTeamMember) {
          isParticipant = true;
          break;
        }
      }
    }

    if (!isOrganizer && (!isParticipant || !match.credential.isReleased)) {
      throw new ForbiddenError(
        !match.credential.isReleased
          ? 'Room credentials have not been released by the organizer yet'
          : 'You are not an authorized participant in this match'
      );
    }

    const decryptedPassword = decryptSecret(match.credential.roomPasswordEncrypted);

    return {
      matchId: match.id,
      roomId: match.credential.roomId,
      roomPassword: decryptedPassword,
      lobbyDetails: match.credential.lobbyDetails,
      accessInstructions: match.credential.accessInstructions,
      isReleased: match.credential.isReleased,
      releasedAt: match.credential.releasedAt,
    };
  }

  /**
   * Advance teams from group stage to finals
   */
  async advanceStage(tournamentId, actorId, { fromStageId, toStageId, advancePerGroup = 6 }) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { stages: true },
    });
    if (!tournament) throw new NotFoundError('Tournament not found');

    if (tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can advance tournament stages');
    }

    return prisma.$transaction(async (tx) => {
      return BattleRoyaleEngine.advanceToFinalsStage(tx, tournament, fromStageId, toStageId, advancePerGroup);
    });
  }
}

export const competitionService = new CompetitionService();
