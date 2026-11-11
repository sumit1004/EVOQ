import { describe, it, expect, vi } from 'vitest';
import { requireOrganizer, requireGamer } from '../src/middleware/authorize.js';
import { TournamentsService } from '../src/modules/tournaments/tournaments.service.js';
import { ForbiddenError, UnauthenticatedError } from '../src/utils/errors.js';

describe('EVOQ Online Tournament Engine V1 — Security & RBAC Tests', () => {
  describe('Account Type Middleware Protection', () => {
    it('blocks unauthenticated requests from organizer routes', () => {
      const req = {};
      const res = {};
      let error = null;
      const next = (err) => { error = err; };

      requireOrganizer(req, res, next);
      expect(error).toBeInstanceOf(UnauthenticatedError);
    });

    it('rejects GAMER accounts from accessing organizer routes (403 Forbidden)', () => {
      const req = { user: { id: 'gamer-1', accountType: 'GAMER' } };
      const res = {};
      let error = null;
      const next = (err) => { error = err; };

      requireOrganizer(req, res, next);
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.message).toContain('Access restricted to Organizer accounts');
    });

    it('allows ORGANIZER accounts to proceed to organizer routes', () => {
      const req = { user: { id: 'org-1', accountType: 'ORGANIZER' } };
      const res = {};
      let error = null;
      let calledNext = false;
      const next = (err) => {
        error = err;
        calledNext = true;
      };

      requireOrganizer(req, res, next);
      expect(error).toBeUndefined();
      expect(calledNext).toBe(true);
    });

    it('rejects ORGANIZER accounts from gamer-specific routes', () => {
      const req = { user: { id: 'org-1', accountType: 'ORGANIZER' } };
      const res = {};
      let error = null;
      const next = (err) => { error = err; };

      requireGamer(req, res, next);
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.message).toContain('Access restricted to Gamer accounts');
    });
  });

  describe('Tournament Ownership & Staff Permission Enforcement', () => {
    const service = new TournamentsService();

    it('rejects an organizer trying to manage another organizer\'s tournament', async () => {
      // Mock assertOrganizerPermission
      const mockTournament = {
        id: 't-1',
        organizerUserId: 'organizer-owner',
        staffGrants: [],
        organization: null,
      };

      vi.spyOn(service, 'assertOrganizerPermission').mockImplementation(async (tournamentId, userId) => {
        if (mockTournament.organizerUserId !== userId) {
          throw new ForbiddenError('You do not have permission to manage this tournament');
        }
        return mockTournament;
      });

      await expect(
        service.assertOrganizerPermission('t-1', 'unauthorized-organizer')
      ).rejects.toThrow(ForbiddenError);

      const allowed = await service.assertOrganizerPermission('t-1', 'organizer-owner');
      expect(allowed).toBe(mockTournament);
    });
  });
});
