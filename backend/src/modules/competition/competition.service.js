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
                        team: { select: { id: true, name: true, slug: true, logoUrl: true } },
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
                team: { select: { id: true, name: true, slug: true, logoUrl: true } },
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
                team: { select: { id: true, name: true, slug: true, logoUrl: true } },
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
          actorId,
          action: 'MATCHES_GENERATED',
          resourceType: 'TOURNAMENT',
          resourceId: tournamentId,
          details: {
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

  /**
   * List all rounds for a tournament with stages, groups, and match counts
   */
  async listTournamentRounds(tournamentId) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        stages: {
          include: {
            rounds: {
              orderBy: { sequence: 'asc' },
              include: {
                groups: {
                  orderBy: { sequence: 'asc' },
                  include: {
                    matches: { select: { id: true, matchNumber: true, status: true, title: true } },
                    standingSnapshots: {
                      where: { isCurrent: true },
                      include: {
                        rows: {
                          orderBy: { rank: 'asc' },
                          include: {
                            registration: {
                              include: {
                                team: { select: { id: true, name: true, slug: true, logoUrl: true } },
                                gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                matches: {
                  orderBy: { matchNumber: 'asc' },
                  select: { id: true, matchNumber: true, status: true, title: true, groupId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tournament) throw new NotFoundError('Tournament not found');

    const rounds = [];
    for (const stage of tournament.stages) {
      for (const r of stage.rounds) {
        rounds.push({
          ...r,
          stageName: stage.name,
          stageSequence: stage.sequence,
        });
      }
    }

    return rounds.sort((a, b) => a.sequence - b.sequence);
  }

  /**
   * Create a new round for a tournament
   */
  async createRound(tournamentId, actorId, { name, roundType = 'GROUP', sequence, stageId }) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { stages: { include: { rounds: true } } },
    });
    if (!tournament) throw new NotFoundError('Tournament not found');

    if (tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can create rounds');
    }

    let targetStageId = stageId;
    if (!targetStageId) {
      if (tournament.stages.length > 0) {
        targetStageId = tournament.stages[0].id;
      } else {
        const newStage = await prisma.tournamentStage.create({
          data: {
            id: generateUuid(),
            tournamentId,
            name: 'Main Tournament Stage',
            stageType: 'GROUP',
            sequence: 1,
            status: 'ACTIVE',
          },
        });
        targetStageId = newStage.id;
      }
    }

    let finalSequence = sequence;
    if (!finalSequence) {
      const allRounds = tournament.stages.flatMap((s) => s.rounds);
      const maxSeq = allRounds.reduce((max, r) => Math.max(max, r.sequence || 0), 0);
      finalSequence = maxSeq + 1;
    }

    const round = await prisma.tournamentRound.create({
      data: {
        id: generateUuid(),
        stageId: targetStageId,
        name,
        sequence: finalSequence,
        roundType,
        status: 'ACTIVE',
      },
      include: {
        stage: { select: { id: true, name: true, sequence: true } },
        groups: true,
        matches: true,
      },
    });

    return round;
  }

  /**
   * Get single round details
   */
  async getRoundById(roundId) {
    const round = await prisma.tournamentRound.findUnique({
      where: { id: roundId },
      include: {
        stage: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                slug: true,
                organizerUserId: true,
                format: true,
                formatConfig: true,
              },
            },
          },
        },
        groups: {
          orderBy: { sequence: 'asc' },
          include: {
            matches: {
              orderBy: { matchNumber: 'asc' },
              include: {
                participants: {
                  orderBy: { slot: 'asc' },
                  include: {
                    registration: {
                      include: {
                        team: { select: { id: true, name: true, slug: true, logoUrl: true } },
                        gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
                      },
                    },
                  },
                },
                credential: {
                  select: { id: true, roomId: true, isReleased: true, releasedAt: true, lobbyDetails: true },
                },
                result: {
                  select: { id: true, status: true, currentApprovedRevisionId: true },
                },
              },
            },
            standingSnapshots: {
              where: { isCurrent: true },
              include: {
                rows: {
                  orderBy: { rank: 'asc' },
                  include: {
                    registration: {
                      include: {
                        team: { select: { id: true, name: true, slug: true, logoUrl: true } },
                        gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        matches: {
          orderBy: { matchNumber: 'asc' },
          include: {
            group: { select: { id: true, name: true, sequence: true } },
            participants: {
              orderBy: { slot: 'asc' },
              include: {
                registration: {
                  include: {
                    team: { select: { id: true, name: true, slug: true, logoUrl: true } },
                    gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
                  },
                },
              },
            },
            credential: {
              select: { id: true, roomId: true, isReleased: true, releasedAt: true },
            },
            result: {
              select: { id: true, status: true, currentApprovedRevisionId: true },
            },
          },
        },
      },
    });

    if (!round) throw new NotFoundError('Tournament round not found');

    return round;
  }

  /**
   * Update round status
   */
  async updateRoundStatus(roundId, actorId, { status }) {
    const round = await prisma.tournamentRound.findUnique({
      where: { id: roundId },
      include: { stage: { include: { tournament: true } } },
    });
    if (!round) throw new NotFoundError('Tournament round not found');

    if (round.stage.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can update round status');
    }

    return prisma.tournamentRound.update({
      where: { id: roundId },
      data: { status },
      include: { stage: true },
    });
  }

  /**
   * Get eligible teams pool for a round (Round 1: all approved registrations; Round N > 1: qualified from Round N-1)
   */
  async getEligibleTeamsForRound(roundId) {
    const round = await prisma.tournamentRound.findUnique({
      where: { id: roundId },
      include: {
        stage: {
          include: {
            tournament: {
              include: {
                stages: {
                  include: {
                    rounds: { orderBy: { sequence: 'asc' } },
                  },
                },
              },
            },
          },
        },
        groups: {
          include: {
            standingSnapshots: {
              where: { isCurrent: true },
              include: { rows: true },
            },
            matches: {
              include: { participants: true },
            },
          },
        },
      },
    });

    if (!round) throw new NotFoundError('Tournament round not found');

    const tournament = round.stage.tournament;
    const allRounds = tournament.stages.flatMap((s) => s.rounds).sort((a, b) => a.sequence - b.sequence);
    const prevRound = allRounds.filter((r) => r.sequence < round.sequence).pop();

    let eligibleRegistrations = [];

    if (!prevRound || round.sequence === 1) {
      // Round 1: All approved registrations
      eligibleRegistrations = await prisma.tournamentRegistration.findMany({
        where: { tournamentId: tournament.id, status: 'APPROVED' },
        include: {
          team: { select: { id: true, name: true, slug: true, logoUrl: true } },
          gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
        },
      });
    } else {
      // Round N > 1: Qualified teams from prevRound
      const qualSnapshot = await prisma.standingSnapshot.findFirst({
        where: {
          tournamentId: tournament.id,
          sourceHash: `QUALIFIED_${prevRound.id}`,
          isCurrent: true,
        },
        include: {
          rows: {
            orderBy: { rank: 'asc' },
            include: {
              registration: {
                include: {
                  team: { select: { id: true, name: true, slug: true, logoUrl: true } },
                  gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
                },
              },
            },
          },
        },
      });

      if (qualSnapshot && qualSnapshot.rows.length > 0) {
        eligibleRegistrations = qualSnapshot.rows.map((r) => ({
          ...r.registration,
          qualificationRank: r.rank,
          qualificationPoints: r.points,
        }));
      } else {
        // Fallback: If no qualification snapshot was committed yet, allow all approved registrations
        eligibleRegistrations = await prisma.tournamentRegistration.findMany({
          where: { tournamentId: tournament.id, status: 'APPROVED' },
          include: {
            team: { select: { id: true, name: true, slug: true, logoUrl: true } },
            gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
          },
        });
      }
    }

    // Determine which registrations are already allocated to a group in this round
    const allocatedMap = new Map();
    for (const group of round.groups) {
      // From initial snapshot rows
      const snapshot = group.standingSnapshots[0];
      if (snapshot && snapshot.rows) {
        for (const row of snapshot.rows) {
          allocatedMap.set(row.registrationId, { groupId: group.id, groupName: group.name });
        }
      }
      // From matches
      for (const m of group.matches) {
        for (const p of m.participants) {
          allocatedMap.set(p.registrationId, { groupId: group.id, groupName: group.name });
        }
      }
    }

    const eligibleTeams = eligibleRegistrations.map((reg) => {
      const alloc = allocatedMap.get(reg.id);
      return {
        ...reg,
        isAllocated: Boolean(alloc),
        allocatedGroupId: alloc?.groupId || null,
        allocatedGroupName: alloc?.groupName || null,
      };
    });

    return {
      roundId,
      sequence: round.sequence,
      name: round.name,
      isFirstRound: !prevRound || round.sequence === 1,
      previousRoundId: prevRound?.id || null,
      previousRoundName: prevRound?.name || null,
      totalEligible: eligibleTeams.length,
      allocatedCount: eligibleTeams.filter((t) => t.isAllocated).length,
      unallocatedCount: eligibleTeams.filter((t) => !t.isAllocated).length,
      teams: eligibleTeams,
    };
  }

  /**
   * Create groups and allocate teams within a round (Transactional)
   */
  async createGroupsWithAllocation(roundId, actorId, { groups }) {
    const round = await prisma.tournamentRound.findUnique({
      where: { id: roundId },
      include: {
        stage: { include: { tournament: true } },
        groups: { orderBy: { sequence: 'asc' } },
      },
    });

    if (!round) throw new NotFoundError('Tournament round not found');
    if (round.stage.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can create groups and allocate teams');
    }

    if (!groups || groups.length === 0) {
      throw new ValidationError('At least 1 group is required.');
    }

    // Fetch eligible teams pool for this round
    const eligibleInfo = await this.getEligibleTeamsForRound(roundId);
    const eligibleIdSet = new Set(eligibleInfo.teams.map((t) => t.id));

    // Validate allocations: capacity limits, duplicate allocations, and eligibility
    const allAssignedIds = new Set();
    for (const g of groups) {
      const regIds = g.registrationIds || [];

      if (g.capacity !== undefined && g.capacity !== null && Number(g.capacity) > 0) {
        if (regIds.length > Number(g.capacity)) {
          throw new ValidationError(
            `Group "${g.name}" capacity exceeded: maximum capacity is ${g.capacity}, but ${regIds.length} teams were allocated.`
          );
        }
      }

      for (const regId of regIds) {
        if (!eligibleIdSet.has(regId)) {
          throw new ValidationError(`Cannot allocate ineligible or unregistered team ID: ${regId}`);
        }
        if (allAssignedIds.has(regId)) {
          throw new ValidationError(`Team with registration ID ${regId} cannot be allocated to multiple groups in the same round.`);
        }
        allAssignedIds.add(regId);
      }
    }

    return prisma.$transaction(async (tx) => {
      let nextSeq = (round.groups.length || 0) + 1;
      const createdGroups = [];

      for (const g of groups) {
        const groupId = generateUuid();
        const regIds = g.registrationIds || [];
        const capacity = (g.capacity !== undefined && g.capacity !== null && Number(g.capacity) > 0)
          ? Number(g.capacity)
          : (regIds.length > 0 ? regIds.length : null);

        const group = await tx.competitionGroup.create({
          data: {
            id: groupId,
            stageId: round.stageId,
            roundId: round.id,
            name: g.name,
            sequence: nextSeq++,
            capacity,
          },
        });

        // Create initial standing snapshot (even for empty groups)
        const snapshotId = generateUuid();
        await tx.standingSnapshot.create({
          data: {
            id: snapshotId,
            tournamentId: round.stage.tournamentId,
            stageId: round.stageId,
            groupId: groupId,
            calcVersion: 1,
            isCurrent: true,
            sourceHash: 'INITIAL_ALLOCATION',
          },
        });

        if (regIds.length > 0) {
          await tx.standingRow.createMany({
            data: regIds.map((regId, idx) => ({
              id: generateUuid(),
              snapshotId,
              registrationId: regId,
              rank: idx + 1,
              played: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              points: 0,
              metrics: { placement: null, eliminations: 0, initialSeed: idx + 1 },
            })),
          });
        }

        createdGroups.push(group);
      }

      return createdGroups;
    });
  }

  /**
   * Randomize group allocation (preview or commit atomically, sequential filling according to capacity)
   */
  async randomizeGroupAllocation(roundId, actorId, { groupCount = 1, groupCapacity, groupNames = [], registrationIds, commit = false }) {
    const round = await prisma.tournamentRound.findUnique({
      where: { id: roundId },
      include: { stage: { include: { tournament: true } } },
    });
    if (!round) throw new NotFoundError('Tournament round not found');

    if (round.stage.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can randomize group allocations');
    }

    if (groupCount < 1) {
      throw new ValidationError('Group count must be at least 1.');
    }

    let candidateIds = registrationIds;
    if (!candidateIds || candidateIds.length === 0) {
      const eligibleInfo = await this.getEligibleTeamsForRound(roundId);
      candidateIds = eligibleInfo.teams.filter((t) => !t.isAllocated).map((t) => t.id);
    }

    if (candidateIds.length === 0) {
      throw new ValidationError('No unallocated eligible teams available to randomize.');
    }

    // 1. Randomize eligible teams first (Fisher-Yates shuffle)
    const shuffled = [...candidateIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 2. Determine capacity per group
    const effectiveCapacity = (groupCapacity !== undefined && groupCapacity !== null && Number(groupCapacity) > 0)
      ? Number(groupCapacity)
      : Math.max(1, Math.ceil(shuffled.length / groupCount));

    // 3. Sequentially allocate teams: fill Group A up to capacity, then Group B, etc.
    const groupsSpec = [];
    let currentTeamIdx = 0;

    for (let g = 0; g < groupCount; g++) {
      const name = groupNames[g] || `Group ${String.fromCharCode(65 + g)}`;
      const assigned = [];

      while (assigned.length < effectiveCapacity && currentTeamIdx < shuffled.length) {
        assigned.push(shuffled[currentTeamIdx]);
        currentTeamIdx++;
      }

      groupsSpec.push({
        name,
        capacity: effectiveCapacity,
        registrationIds: assigned,
      });
    }

    // Any teams that could not fit within the configured groupCount * effectiveCapacity
    const unassignedRegistrationIds = shuffled.slice(currentTeamIdx);

    if (commit) {
      const createdGroups = await this.createGroupsWithAllocation(roundId, actorId, { groups: groupsSpec });
      return {
        committed: true,
        groups: createdGroups,
        distribution: groupsSpec,
        unassignedRegistrationIds,
        effectiveCapacity,
      };
    }

    return {
      committed: false,
      distribution: groupsSpec,
      unassignedRegistrationIds,
      effectiveCapacity,
    };
  }

  /**
   * Get single competition group by ID with allocated teams, matches and standings
   */
  async getGroupById(groupId) {
    const group = await prisma.competitionGroup.findUnique({
      where: { id: groupId },
      include: {
        stage: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                slug: true,
                organizerUserId: true,
                formatConfig: true,
              },
            },
          },
        },
        round: true,
        matches: {
          orderBy: { matchNumber: 'asc' },
          include: {
            participants: {
              orderBy: { slot: 'asc' },
              include: {
                registration: {
                  include: {
                    team: { select: { id: true, name: true, slug: true, logoUrl: true } },
                    gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
                  },
                },
              },
            },
            credential: {
              select: { id: true, roomId: true, isReleased: true, releasedAt: true, lobbyDetails: true },
            },
            result: {
              include: {
                revisions: { orderBy: { revisionNumber: 'desc' }, take: 1 },
              },
            },
          },
        },
        standingSnapshots: {
          where: { isCurrent: true },
          include: {
            rows: {
              orderBy: { rank: 'asc' },
              include: {
                registration: {
                  include: {
                    team: { select: { id: true, name: true, slug: true, logoUrl: true } },
                    gamerProfile: { select: { id: true, displayName: true, inGameName: true, avatarUrl: true, slug: true, evoqId: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!group) throw new NotFoundError('Competition group not found');

    // Extract allocated teams (from current snapshot rows or matches)
    let allocatedTeams = [];
    const snapshot = group.standingSnapshots[0];
    if (snapshot && snapshot.rows && snapshot.rows.length > 0) {
      allocatedTeams = snapshot.rows.map((r) => ({
        ...r.registration,
        rank: r.rank,
        points: r.points,
        played: r.played,
        wins: r.wins,
        metrics: r.metrics,
      }));
    } else if (group.matches.length > 0 && group.matches[0].participants) {
      allocatedTeams = group.matches[0].participants.map((p) => ({
        ...p.registration,
        slot: p.slot,
      }));
    }

    return {
      ...group,
      allocatedTeams,
    };
  }

  /**
   * Create matches for a group (Battle Royale lobby format with all allocated group teams as participants)
   */
  async createGroupMatches(groupId, actorId, { matchCount = 1, titles = [] }) {
    const group = await prisma.competitionGroup.findUnique({
      where: { id: groupId },
      include: {
        stage: { include: { tournament: true } },
        round: true,
        matches: { select: { id: true, matchNumber: true } },
        standingSnapshots: {
          where: { isCurrent: true },
          include: { rows: true },
        },
      },
    });

    if (!group) throw new NotFoundError('Competition group not found');
    if (group.stage.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can create matches for this group');
    }

    // Retrieve allocated registration IDs
    let assignedRegistrationIds = [];
    const currentSnapshot = group.standingSnapshots[0];
    if (currentSnapshot && currentSnapshot.rows && currentSnapshot.rows.length > 0) {
      assignedRegistrationIds = currentSnapshot.rows.map((r) => r.registrationId);
    } else {
      // Check existing matches in group
      const existingMatch = await prisma.match.findFirst({
        where: { groupId },
        include: { participants: true },
      });
      if (existingMatch && existingMatch.participants.length > 0) {
        assignedRegistrationIds = existingMatch.participants.map((p) => p.registrationId);
      }
    }

    if (assignedRegistrationIds.length === 0) {
      throw new ValidationError('Cannot create matches for a group with no allocated teams. Please allocate teams to this group first.');
    }

    return prisma.$transaction(async (tx) => {
      const startingMatchNum = (group.matches?.length || 0) + 1;
      const createdMatches = [];

      for (let i = 0; i < matchCount; i++) {
        const matchNum = startingMatchNum + i;
        const matchId = generateUuid();
        const title = titles[i] || `${group.name} - Match ${matchNum}`;

        const match = await tx.match.create({
          data: {
            id: matchId,
            tournamentId: group.stage.tournamentId,
            stageId: group.stageId,
            roundId: group.roundId,
            groupId: group.id,
            matchNumber: matchNum,
            title,
            status: 'SCHEDULED',
          },
        });

        // Fixture all allocated teams as participants
        const participantsData = assignedRegistrationIds.map((regId, slotIdx) => ({
          id: generateUuid(),
          matchId,
          registrationId: regId,
          slot: slotIdx + 1,
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

        await tx.matchParticipant.createMany({ data: participantsData });
        createdMatches.push(match);
      }

      return createdMatches;
    });
  }

  /**
   * Copy room credentials from the previous match in the same group
   */
  async copyMatchCredentials(matchId, actorId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
      },
    });

    if (!match) throw new NotFoundError('Match not found');
    if (match.tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can copy credentials');
    }

    if (!match.groupId) {
      throw new ValidationError('Match does not belong to a competition group.');
    }

    // Find previous match in the same group that has credentials configured
    const previousMatch = await prisma.match.findFirst({
      where: {
        groupId: match.groupId,
        id: { not: matchId },
        matchNumber: { lt: match.matchNumber },
        credential: { isNot: null },
      },
      orderBy: { matchNumber: 'desc' },
      include: { credential: true },
    });

    const sourceCredential = previousMatch?.credential || (
      await prisma.matchCredential.findFirst({
        where: {
          match: {
            groupId: match.groupId,
            id: { not: matchId },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    );

    if (!sourceCredential) {
      throw new NotFoundError('No previous match credentials found in this group to copy.');
    }

    const copied = await prisma.matchCredential.upsert({
      where: { matchId },
      create: {
        id: generateUuid(),
        matchId,
        roomId: sourceCredential.roomId,
        roomPasswordEncrypted: sourceCredential.roomPasswordEncrypted,
        lobbyDetails: sourceCredential.lobbyDetails,
        accessInstructions: sourceCredential.accessInstructions,
        isReleased: false,
      },
      update: {
        roomId: sourceCredential.roomId,
        roomPasswordEncrypted: sourceCredential.roomPasswordEncrypted,
        lobbyDetails: sourceCredential.lobbyDetails,
        accessInstructions: sourceCredential.accessInstructions,
        isReleased: false,
        releasedAt: null,
        releasedById: null,
      },
    });

    const decryptedPassword = decryptSecret(copied.roomPasswordEncrypted);

    return {
      matchId,
      roomId: copied.roomId,
      roomPassword: decryptedPassword,
      lobbyDetails: copied.lobbyDetails,
      accessInstructions: copied.accessInstructions,
      isReleased: copied.isReleased,
      copiedFromMatchId: sourceCredential.matchId,
    };
  }

  /**
   * Qualify teams from a round (Top-N per group or Manual selection) and store qualification snapshot
   */
  async qualifyTeams(roundId, actorId, { method = 'TOP_N', advancePerGroup = 6, qualifiedRegistrationIds = [] }) {
    const round = await prisma.tournamentRound.findUnique({
      where: { id: roundId },
      include: {
        stage: { include: { tournament: true } },
        groups: {
          include: {
            matches: {
              where: { status: 'COMPLETED' },
              include: { participants: true },
            },
            standingSnapshots: {
              where: { isCurrent: true },
              include: { rows: true },
            },
          },
        },
      },
    });

    if (!round) throw new NotFoundError('Tournament round not found');
    const tournament = round.stage.tournament;
    if (tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can qualify teams');
    }

    let qualifiedList = [];

    if (method === 'TOP_N') {
      const scoringRuleset = tournament.formatConfig?.scoringRuleset || {};

      for (const group of round.groups) {
        // Collect registrations for this group
        const groupRegs = await prisma.tournamentRegistration.findMany({
          where: {
            id: {
              in: group.standingSnapshots[0]?.rows?.map((r) => r.registrationId) ||
                group.matches.flatMap((m) => m.participants.map((p) => p.registrationId)),
            },
          },
          include: { team: true, gamerProfile: true },
        });

        // Compute standings for this group
        const standings = BattleRoyaleEngine.computeCumulativeStandings(group.matches, groupRegs, scoringRuleset);
        const topTeams = standings.slice(0, advancePerGroup);

        topTeams.forEach((t) => {
          const reg = groupRegs.find((r) => r.id === t.registrationId);
          qualifiedList.push({
            registrationId: t.registrationId,
            rank: t.rank,
            points: t.points,
            sourceGroupId: group.id,
            sourceGroupName: group.name,
            team: reg?.team || null,
            gamerProfile: reg?.gamerProfile || null,
          });
        });
      }
    } else {
      // MANUAL
      if (!qualifiedRegistrationIds || qualifiedRegistrationIds.length === 0) {
        throw new ValidationError('Please select at least one team to qualify.');
      }

      const regs = await prisma.tournamentRegistration.findMany({
        where: { id: { in: qualifiedRegistrationIds }, tournamentId: tournament.id },
        include: { team: true, gamerProfile: true },
      });

      qualifiedList = regs.map((r, idx) => ({
        registrationId: r.id,
        rank: idx + 1,
        points: 0,
        sourceGroupId: null,
        sourceGroupName: null,
        team: r.team,
        gamerProfile: r.gamerProfile,
      }));
    }

    if (qualifiedList.length === 0) {
      throw new ValidationError('No teams were qualified. Please verify match results and group standings.');
    }

    // Persist qualification snapshot in database
    return prisma.$transaction(async (tx) => {
      // Mark any existing qualification snapshot for this round as non-current
      await tx.standingSnapshot.updateMany({
        where: {
          tournamentId: tournament.id,
          sourceHash: `QUALIFIED_${round.id}`,
        },
        data: { isCurrent: false },
      });

      const snapshotId = generateUuid();
      await tx.standingSnapshot.create({
        data: {
          id: snapshotId,
          tournamentId: tournament.id,
          stageId: round.stageId,
          calcVersion: 1,
          isCurrent: true,
          sourceHash: `QUALIFIED_${round.id}`,
        },
      });

      await tx.standingRow.createMany({
        data: qualifiedList.map((q, idx) => ({
          id: generateUuid(),
          snapshotId,
          registrationId: q.registrationId,
          rank: idx + 1,
          played: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          points: q.points || 0,
          metrics: {
            sourceGroupId: q.sourceGroupId,
            sourceGroupName: q.sourceGroupName,
            qualified: true,
          },
        })),
      });

      return {
        roundId,
        method,
        qualifiedCount: qualifiedList.length,
        qualifiedTeams: qualifiedList,
      };
    });
  }

  /**
   * Advance to next round: completes current round and provisions Round N+1 with qualified teams as eligible pool
   */
  async advanceToNextRound(roundId, actorId, { roundName, roundType = 'GROUP' }) {
    const round = await prisma.tournamentRound.findUnique({
      where: { id: roundId },
      include: {
        stage: {
          include: {
            tournament: {
              include: { stages: { include: { rounds: true } } },
            },
          },
        },
      },
    });

    if (!round) throw new NotFoundError('Tournament round not found');
    const tournament = round.stage.tournament;
    if (tournament.organizerUserId !== actorId) {
      throw new ForbiddenError('Only tournament organizer can advance to the next round');
    }

    // Verify qualification snapshot exists
    const qualSnapshot = await prisma.standingSnapshot.findFirst({
      where: {
        tournamentId: tournament.id,
        sourceHash: `QUALIFIED_${round.id}`,
        isCurrent: true,
      },
      include: { rows: true },
    });

    if (!qualSnapshot || qualSnapshot.rows.length === 0) {
      throw new ValidationError('Please qualify teams from this round before creating the next round.');
    }

    const allRounds = tournament.stages.flatMap((s) => s.rounds);
    const nextSequence = round.sequence + 1;
    const finalRoundName = roundName || `Round ${nextSequence}`;

    return prisma.$transaction(async (tx) => {
      // Mark current round as COMPLETED
      await tx.tournamentRound.update({
        where: { id: roundId },
        data: { status: 'COMPLETED' },
      });

      // Create new Round N+1
      const nextRound = await tx.tournamentRound.create({
        data: {
          id: generateUuid(),
          stageId: round.stageId,
          name: finalRoundName,
          sequence: nextSequence,
          roundType,
          status: 'ACTIVE',
        },
        include: {
          stage: true,
        },
      });

      return {
        previousRoundId: round.id,
        nextRound,
        qualifiedCount: qualSnapshot.rows.length,
      };
    });
  }

  /**
   * Delete an individual match and all associated results/credentials/participants
   */
  async deleteMatch(matchId, userId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          include: { staffGrants: true },
        },
      },
    });

    if (!match) throw new NotFoundError('Match not found');

    const isAuthorized =
      match.tournament.organizerUserId === userId ||
      match.tournament.staffGrants.some((s) => s.userId === userId && ['ADMIN', 'MANAGER'].includes(s.role));

    if (!isAuthorized) {
      throw new ForbiddenError('You do not have permission to delete this match');
    }

    return prisma.$transaction(async (tx) => {
      const matchResult = await tx.matchResult.findUnique({
        where: { matchId },
        select: { id: true },
      });

      if (matchResult) {
        await tx.resultRevision.deleteMany({ where: { resultId: matchResult.id } });
        await tx.matchResult.delete({ where: { id: matchResult.id } });
      }

      await tx.matchCredential.deleteMany({ where: { matchId } });
      await tx.matchParticipant.deleteMany({ where: { matchId } });
      await tx.match.delete({ where: { id: matchId } });

      return { success: true, deletedMatchId: matchId };
    });
  }

  /**
   * Delete a competition group and all matches within it
   */
  async deleteGroup(groupId, userId) {
    const group = await prisma.competitionGroup.findUnique({
      where: { id: groupId },
      include: {
        stage: {
          include: {
            tournament: {
              include: { staffGrants: true },
            },
          },
        },
      },
    });

    if (!group) throw new NotFoundError('Group not found');

    const tournament = group.stage?.tournament;
    if (!tournament) throw new NotFoundError('Associated tournament not found');

    const isAuthorized =
      tournament.organizerUserId === userId ||
      tournament.staffGrants.some((s) => s.userId === userId && ['ADMIN', 'MANAGER'].includes(s.role));

    if (!isAuthorized) {
      throw new ForbiddenError('You do not have permission to delete this group');
    }

    return prisma.$transaction(async (tx) => {
      const groupMatches = await tx.match.findMany({
        where: { groupId },
        select: { id: true },
      });
      const matchIds = groupMatches.map((m) => m.id);

      if (matchIds.length > 0) {
        const results = await tx.matchResult.findMany({
          where: { matchId: { in: matchIds } },
          select: { id: true },
        });
        const resultIds = results.map((r) => r.id);

        if (resultIds.length > 0) {
          await tx.resultRevision.deleteMany({ where: { resultId: { in: resultIds } } });
          await tx.matchResult.deleteMany({ where: { id: { in: resultIds } } });
        }

        await tx.matchCredential.deleteMany({ where: { matchId: { in: matchIds } } });
        await tx.matchParticipant.deleteMany({ where: { matchId: { in: matchIds } } });
        await tx.match.deleteMany({ where: { id: { in: matchIds } } });
      }

      const snapshots = await tx.standingSnapshot.findMany({
        where: { groupId },
        select: { id: true },
      });
      const snapshotIds = snapshots.map((s) => s.id);

      if (snapshotIds.length > 0) {
        await tx.standingRow.deleteMany({ where: { snapshotId: { in: snapshotIds } } });
        await tx.standingSnapshot.deleteMany({ where: { id: { in: snapshotIds } } });
      }

      await tx.competitionGroup.delete({ where: { id: groupId } });

      return { success: true, deletedGroupId: groupId };
    });
  }

  /**
   * Delete a tournament round and all groups/matches within it
   */
  async deleteRound(roundId, userId) {
    const round = await prisma.tournamentRound.findUnique({
      where: { id: roundId },
      include: {
        stage: {
          include: {
            tournament: {
              include: { staffGrants: true },
            },
          },
        },
      },
    });

    if (!round) throw new NotFoundError('Round not found');

    const tournament = round.stage?.tournament;
    if (!tournament) throw new NotFoundError('Associated tournament not found');

    const isAuthorized =
      tournament.organizerUserId === userId ||
      tournament.staffGrants.some((s) => s.userId === userId && ['ADMIN', 'MANAGER'].includes(s.role));

    if (!isAuthorized) {
      throw new ForbiddenError('You do not have permission to delete this round');
    }

    return prisma.$transaction(async (tx) => {
      const roundMatches = await tx.match.findMany({
        where: { roundId },
        select: { id: true },
      });
      const matchIds = roundMatches.map((m) => m.id);

      if (matchIds.length > 0) {
        const results = await tx.matchResult.findMany({
          where: { matchId: { in: matchIds } },
          select: { id: true },
        });
        const resultIds = results.map((r) => r.id);

        if (resultIds.length > 0) {
          await tx.resultRevision.deleteMany({ where: { resultId: { in: resultIds } } });
          await tx.matchResult.deleteMany({ where: { id: { in: resultIds } } });
        }

        await tx.matchCredential.deleteMany({ where: { matchId: { in: matchIds } } });
        await tx.matchParticipant.deleteMany({ where: { matchId: { in: matchIds } } });
        await tx.match.deleteMany({ where: { id: { in: matchIds } } });
      }

      await tx.competitionGroup.deleteMany({ where: { roundId } });
      await tx.tournamentRound.delete({ where: { id: roundId } });

      return { success: true, deletedRoundId: roundId };
    });
  }

  /**
   * Delete a tournament stage and all associated rounds/groups/matches
   */
  async deleteStage(stageId, userId) {
    const stage = await prisma.tournamentStage.findUnique({
      where: { id: stageId },
      include: {
        tournament: {
          include: { staffGrants: true },
        },
      },
    });

    if (!stage) throw new NotFoundError('Stage not found');

    const tournament = stage.tournament;
    const isAuthorized =
      tournament.organizerUserId === userId ||
      tournament.staffGrants.some((s) => s.userId === userId && ['ADMIN', 'MANAGER'].includes(s.role));

    if (!isAuthorized) {
      throw new ForbiddenError('You do not have permission to delete this stage');
    }

    return prisma.$transaction(async (tx) => {
      const stageMatches = await tx.match.findMany({
        where: { stageId },
        select: { id: true },
      });
      const matchIds = stageMatches.map((m) => m.id);

      if (matchIds.length > 0) {
        const results = await tx.matchResult.findMany({
          where: { matchId: { in: matchIds } },
          select: { id: true },
        });
        const resultIds = results.map((r) => r.id);

        if (resultIds.length > 0) {
          await tx.resultRevision.deleteMany({ where: { resultId: { in: resultIds } } });
          await tx.matchResult.deleteMany({ where: { id: { in: resultIds } } });
        }

        await tx.matchCredential.deleteMany({ where: { matchId: { in: matchIds } } });
        await tx.matchParticipant.deleteMany({ where: { matchId: { in: matchIds } } });
        await tx.match.deleteMany({ where: { id: { in: matchIds } } });
      }

      const snapshots = await tx.standingSnapshot.findMany({
        where: { stageId },
        select: { id: true },
      });
      const snapshotIds = snapshots.map((s) => s.id);
      if (snapshotIds.length > 0) {
        await tx.standingRow.deleteMany({ where: { snapshotId: { in: snapshotIds } } });
        await tx.standingSnapshot.deleteMany({ where: { id: { in: snapshotIds } } });
      }

      await tx.competitionGroup.deleteMany({ where: { stageId } });
      await tx.tournamentRound.deleteMany({ where: { stageId } });
      await tx.tournamentStage.delete({ where: { id: stageId } });

      return { success: true, deletedStageId: stageId };
    });
  }
}

export const competitionService = new CompetitionService();
