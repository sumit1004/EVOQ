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

