import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { encryptSecret, decryptSecret } from '../../utils/crypto.js';
import { notificationService } from '../../services/notification.service.js';
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
                        team: { select: { id: true, name: true, slug: true, logoUrl: true } },
                        gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true } },
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
        stage: { select: { name: true, sequence: true } },
        round: { select: { name: true, sequence: true, roundType: true } },
        group: { select: { name: true } },
        participants: {
          include: {
            registration: {
              include: {
                team: { select: { id: true, name: true, slug: true, logoUrl: true } },
                gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true } },
              },
            },
          },
          orderBy: { slot: 'asc' },
        },
        result: {
          select: { id: true, status: true, currentApprovedRevisionId: true },
        },
      },
      orderBy: [{ roundId: 'asc' }, { matchNumber: 'asc' }],
    });
  }

  /**
   * Get single match details
   */
  async getMatchById(matchId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: { select: { id: true, name: true, slug: true, format: true, organizerUserId: true } },
        stage: true,
        round: true,
        participants: {
          include: {
            registration: {
              include: {
                team: true,
                gamerProfile: true,
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
   * Automatic match generation based on format
   */
  async generateMatches(tournamentId, actorId, { stageId, randomizeSeeds }) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        stages: { orderBy: { sequence: 'asc' } },
        registrations: {
          where: { status: 'APPROVED' },
          orderBy: { seed: 'asc' },
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
        `Cannot generate bracket with fewer than 2 approved participants. Current: ${participants.length}`
      );
    }

    if (randomizeSeeds) {
      participants.sort(() => Math.random() - 0.5);
    }

    const targetStage = stageId
      ? tournament.stages.find((s) => s.id === stageId)
      : tournament.stages[0];

    if (!targetStage) throw new NotFoundError('Stage not found');

    return prisma.$transaction(async (tx) => {
      // 1. SINGLE ELIMINATION BRACKET GENERATION
      if (tournament.format === 'SINGLE_ELIMINATION' || tournament.format === 'DOUBLE_ELIMINATION') {
        const count = participants.length;
        const totalRounds = Math.ceil(Math.log2(count));
        const roundNames = ['Finals', 'Semifinals', 'Quarterfinals', 'Round of 16', 'Round of 32', 'Round of 64'];

        // Create Round 1
        const r1Name = totalRounds === 1 ? 'Finals' : totalRounds === 2 ? 'Semifinals' : roundNames[totalRounds - 1] || `Round 1`;
        const round1 = await tx.tournamentRound.create({
          data: {
            id: generateUuid(),
            stageId: targetStage.id,
            name: r1Name,
            sequence: 1,
            roundType: 'UPPER',
            status: 'UPCOMING',
          },
        });

        const matchesToCreate = Math.ceil(count / 2);
        for (let i = 0; i < matchesToCreate; i++) {
          const matchId = generateUuid();
          const p1 = participants[i * 2];
          const p2 = participants[i * 2 + 1];

          await tx.match.create({
            data: {
              id: matchId,
              tournamentId,
              stageId: targetStage.id,
              roundId: round1.id,
              matchNumber: i + 1,
              title: `Match ${i + 1}`,
              status: 'SCHEDULED',
            },
          });

          if (p1) {
            await tx.matchParticipant.create({
              data: {
                id: generateUuid(),
                matchId,
                registrationId: p1.id,
                slot: 1,
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
              },
            });
          }
        }

        // Create subsequent placeholder rounds if needed
        let currentMatches = matchesToCreate;
        let roundSeq = 2;
        while (currentMatches > 1) {
          currentMatches = Math.ceil(currentMatches / 2);
          const rName = currentMatches === 1 ? 'Finals' : currentMatches === 2 ? 'Semifinals' : `Round ${roundSeq}`;
          const nextRound = await tx.tournamentRound.create({
            data: {
              id: generateUuid(),
              stageId: targetStage.id,
              name: rName,
              sequence: roundSeq,
              roundType: 'UPPER',
              status: 'UPCOMING',
            },
          });

          for (let m = 0; m < currentMatches; m++) {
            await tx.match.create({
              data: {
                id: generateUuid(),
                tournamentId,
                stageId: targetStage.id,
                roundId: nextRound.id,
                matchNumber: m + 1,
                title: `${rName} Match ${m + 1}`,
                status: 'SCHEDULED',
              },
            });
          }
          roundSeq++;
        }
      } else if (tournament.format === 'ROUND_ROBIN') {
        // ROUND ROBIN GENERATION
        const round = await tx.tournamentRound.create({
          data: {
            id: generateUuid(),
            stageId: targetStage.id,
            name: 'Round Robin Stage',
            sequence: 1,
            roundType: 'GROUP',
            status: 'UPCOMING',
          },
        });

        let matchNum = 1;
        for (let i = 0; i < participants.length; i++) {
          for (let j = i + 1; j < participants.length; j++) {
            const matchId = generateUuid();
            await tx.match.create({
              data: {
                id: matchId,
                tournamentId,
                stageId: targetStage.id,
                roundId: round.id,
                matchNumber: matchNum++,
                title: `Match ${matchNum - 1}`,
                status: 'SCHEDULED',
              },
            });
            await tx.matchParticipant.createMany({
              data: [
                { id: generateUuid(), matchId, registrationId: participants[i].id, slot: 1 },
                { id: generateUuid(), matchId, registrationId: participants[j].id, slot: 2 },
              ],
            });
          }
        }
      } else {
        // BATTLE ROYALE / GENERAL LOBBY FORMAT
        const round = await tx.tournamentRound.create({
          data: {
            id: generateUuid(),
            stageId: targetStage.id,
            name: 'Match 1',
            sequence: 1,
            status: 'UPCOMING',
          },
        });

        const matchId = generateUuid();
        await tx.match.create({
          data: {
            id: matchId,
            tournamentId,
            stageId: targetStage.id,
            roundId: round.id,
            matchNumber: 1,
            title: 'Lobby Match 1',
            status: 'SCHEDULED',
          },
        });

        await tx.matchParticipant.createMany({
          data: participants.map((p, idx) => ({
            id: generateUuid(),
            matchId,
            registrationId: p.id,
            slot: idx + 1,
          })),
        });
      }

      // Update tournament state to ONGOING
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { status: 'ONGOING' },
      });
    });
  }

  /**
   * Schedule or update match details
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

    return prisma.match.update({
      where: { id: matchId },
      data: {
        ...(scheduleData.scheduledTime ? { scheduledTime: new Date(scheduleData.scheduledTime) } : {}),
        ...(scheduleData.lobbyInfo !== undefined ? { lobbyInfo: scheduleData.lobbyInfo } : {}),
        ...(scheduleData.serverRegion !== undefined ? { serverRegion: scheduleData.serverRegion } : {}),
        ...(scheduleData.status ? { status: scheduleData.status } : {}),
      },
    });
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
        const targetUserId = reg.registeredById;
        await notificationService.notifyUser({
          recipientId: targetUserId,
          type: 'MATCH_SCHEDULED',
          title: 'Room Credentials Released',
          message: `Lobby credentials for Match #${match.matchNumber} in ${match.tournament.name} are now available!`,
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

    // Check if user is a participant in this match
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
          : 'You are not a participant in this match'
      );
    }

    // Decrypt password safely
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
}

export const competitionService = new CompetitionService();

