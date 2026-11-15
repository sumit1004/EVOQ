import { competitionService } from './competition.service.js';
import { getPresetForGame, COMPETITION_PRESETS } from './competition.presets.js';

export class CompetitionController {
  getPresets(req, res) {
    const { gameSlug } = req.params;
    if (gameSlug) {
      const preset = getPresetForGame(gameSlug);
      return res.status(200).json({
        data: preset || null,
        meta: { requestId: req.requestId },
      });
    }
    return res.status(200).json({
      data: COMPETITION_PRESETS,
      meta: { requestId: req.requestId },
    });
  }

  async getStages(req, res, next) {
    try {
      const stages = await competitionService.getStages(req.params.tournamentId);
      res.status(200).json({
        data: stages,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async listMatches(req, res, next) {
    try {
      const matches = await competitionService.listMatches(req.params.tournamentId);
      res.status(200).json({
        data: matches,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getMatch(req, res, next) {
    try {
      const match = await competitionService.getMatchById(req.params.id);
      res.status(200).json({
        data: match,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async generateMatches(req, res, next) {
    try {
      await competitionService.generateMatches(req.params.tournamentId, req.user.id, req.body);
      res.status(200).json({
        data: { success: true, message: 'Matches successfully generated' },
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async scheduleMatch(req, res, next) {
    try {
      const match = await competitionService.scheduleMatch(req.params.id, req.user.id, req.body);
      res.status(200).json({
        data: match,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async openCheckIn(req, res, next) {
    try {
      const match = await competitionService.openCheckIn(req.params.id, req.user.id);
      res.status(200).json({
        data: match,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async checkIn(req, res, next) {
    try {
      const result = await competitionService.checkInParticipant(req.params.id, req.user.id);
      res.status(200).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async setCredentials(req, res, next) {
    try {
      const credential = await competitionService.setMatchCredentials(req.params.id, req.user.id, req.body);
      res.status(200).json({
        data: credential,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async revokeCredentials(req, res, next) {
    try {
      const result = await competitionService.revokeMatchCredentials(req.params.id, req.user.id);
      res.status(200).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getCredentials(req, res, next) {
    try {
      const credential = await competitionService.getMatchCredentials(req.params.id, req.user.id);
      res.status(200).json({
        data: credential,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async advanceStage(req, res, next) {
    try {
      const result = await competitionService.advanceStage(req.params.tournamentId, req.user.id, req.body);
      res.status(200).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteMatch(req, res, next) {
    try {
      const result = await competitionService.deleteMatch(req.params.id, req.user.id);
      res.status(200).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteGroup(req, res, next) {
    try {
      const result = await competitionService.deleteGroup(req.params.id, req.user.id);
      res.status(200).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteRound(req, res, next) {
    try {
      const result = await competitionService.deleteRound(req.params.id, req.user.id);
      res.status(200).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteStage(req, res, next) {
    try {
      const result = await competitionService.deleteStage(req.params.id, req.user.id);
      res.status(200).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  // ── Manual Tournament Competition Management (V1) ──

  async listTournamentRounds(req, res, next) {
    try {
      const rounds = await competitionService.listTournamentRounds(req.params.tournamentId);
      res.status(200).json({
        data: rounds,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async createRound(req, res, next) {
    try {
      const round = await competitionService.createRound(req.params.tournamentId, req.user.id, req.body);
      res.status(201).json({
        data: round,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getRound(req, res, next) {
    try {
      const round = await competitionService.getRoundById(req.params.roundId);
      res.status(200).json({
        data: round,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateRoundStatus(req, res, next) {
    try {
      const updated = await competitionService.updateRoundStatus(req.params.roundId, req.user.id, req.body);
      res.status(200).json({
        data: updated,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getEligibleTeams(req, res, next) {
    try {
      const result = await competitionService.getEligibleTeamsForRound(req.params.roundId);
      res.status(200).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async createGroups(req, res, next) {
    try {
      const groups = await competitionService.createGroupsWithAllocation(req.params.roundId, req.user.id, req.body);
      res.status(201).json({
        data: groups,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async randomizeGroups(req, res, next) {
    try {
      const result = await competitionService.randomizeGroupAllocation(req.params.roundId, req.user.id, req.body);
      res.status(200).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async getGroup(req, res, next) {
    try {
      const group = await competitionService.getGroupById(req.params.groupId);
      res.status(200).json({
        data: group,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async createGroupMatches(req, res, next) {
    try {
      const matches = await competitionService.createGroupMatches(req.params.groupId, req.user.id, req.body);
      res.status(201).json({
        data: matches,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async copyMatchCredentials(req, res, next) {
    try {
      const credential = await competitionService.copyMatchCredentials(req.params.id, req.user.id);
      res.status(200).json({
        data: credential,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async qualifyTeams(req, res, next) {
    try {
      const result = await competitionService.qualifyTeams(req.params.roundId, req.user.id, req.body);
      res.status(200).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }

  async advanceToNextRound(req, res, next) {
    try {
      const result = await competitionService.advanceToNextRound(req.params.roundId, req.user.id, req.body);
      res.status(201).json({
        data: result,
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const competitionController = new CompetitionController();
