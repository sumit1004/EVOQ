import { z } from 'zod';

export const registerTournamentSchema = z.object({
  entrantType: z.enum(['INDIVIDUAL', 'TEAM']).default('TEAM'),
  teamId: z.string().uuid().optional().nullable(),
  selectedRosterMemberIds: z.array(z.string().uuid()).optional(), // specific gamerProfileIds for team registration
});

export const updateRegistrationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'WAITLISTED', 'PENDING']),
  seed: z.number().int().positive().optional().nullable(),
});

