import { z } from 'zod';

export const generateMatchesSchema = z.object({
  stageId: z.string().uuid().optional(),
  randomizeSeeds: z.boolean().default(false),
});

export const scheduleMatchSchema = z.object({
  scheduledTime: z.string().datetime().optional().nullable(),
  lobbyInfo: z.string().trim().max(255).optional().nullable(),
  serverRegion: z.string().trim().max(64).optional().nullable(),
  status: z.enum(['SCHEDULED', 'READY', 'LIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED']).optional(),
});

export const setMatchCredentialsSchema = z.object({
  roomId: z.string().trim().min(1, 'Room ID is required').max(128),
  roomPassword: z.string().trim().min(1, 'Room password is required').max(128),
  lobbyDetails: z.string().trim().max(2000).optional().nullable(),
  accessInstructions: z.string().trim().max(2000).optional().nullable(),
  isReleased: z.boolean().default(false),
});

export const createRoundSchema = z.object({
  name: z.string().trim().min(1, 'Round name is required').max(128),
  roundType: z.enum(['GROUP', 'UPPER', 'LOWER', 'FINALS']).default('GROUP'),
  sequence: z.number().int().positive().optional(),
  stageId: z.string().uuid().optional(),
});

export const updateRoundStatusSchema = z.object({
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']),
});

export const createGroupsSchema = z.object({
  groups: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Group name is required').max(128),
        registrationIds: z.array(z.string().uuid()).default([]),
        capacity: z.number().int().positive().optional().nullable(),
      })
    )
    .min(1, 'At least one group is required'),
});

export const randomizeGroupsSchema = z.object({
  groupCount: z.number().int().min(1, 'Minimum 1 group is required').max(32).default(1),
  groupCapacity: z.number().int().positive().optional().nullable(),
  groupNames: z.array(z.string().trim().min(1).max(128)).optional(),
  registrationIds: z.array(z.string().uuid()).optional(),
  commit: z.boolean().default(false),
});

export const createGroupMatchesSchema = z.object({
  matchCount: z.number().int().min(1, 'Must create at least 1 match').max(20, 'Max 20 matches per batch').default(1),
  titles: z.array(z.string().trim().max(128)).optional(),
});

export const qualifyTeamsSchema = z.object({
  method: z.enum(['TOP_N', 'MANUAL']).default('TOP_N'),
  advancePerGroup: z.number().int().min(1).max(100).default(6),
  qualifiedRegistrationIds: z.array(z.string().uuid()).optional(),
});

export const advanceToNextRoundSchema = z.object({
  roundName: z.string().trim().min(1).max(128).optional(),
  roundType: z.enum(['GROUP', 'FINALS', 'UPPER', 'LOWER']).default('GROUP'),
});


