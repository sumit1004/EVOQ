import { z } from 'zod';

export const upsertProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').max(128),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters')
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  inGameName: z.string().trim().max(128).optional().nullable(),
  bio: z.string().trim().max(1000).optional().nullable(),
  avatarUrl: z.string().url().max(512).optional().nullable().or(z.literal('')),
  coverUrl: z.string().url().max(512).optional().nullable().or(z.literal('')),
  country: z.string().trim().max(64).optional().nullable(),
  state: z.string().trim().max(64).optional().nullable(),
  city: z.string().trim().max(64).optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gamerType: z.enum(['CASUAL', 'COMPETITIVE', 'SEMI_PRO', 'PRO', 'CREATOR']).default('COMPETITIVE'),
  primaryGameId: z.string().uuid().optional().nullable(),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      discord: z.string().optional(),
      twitch: z.string().optional(),
      youtube: z.string().optional(),
      steam: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional()
    .nullable(),
  website: z.string().url().max(255).optional().nullable().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).default('PUBLIC'),
});

export const addGameIdentitySchema = z.object({
  gameId: z.string().uuid(),
  inGameName: z.string().trim().min(1, 'In-game name (IGN) is required').max(128),
  inGameUid: z.string().trim().max(128).optional().nullable(),
  serverRegion: z.string().trim().max(64).optional().nullable(),
  competitiveRole: z.string().trim().max(64).optional().nullable(),
  isPrimary: z.boolean().default(false),
});

