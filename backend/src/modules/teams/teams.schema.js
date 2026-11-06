import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().trim().min(2, 'Team name must be at least 2 characters').max(128),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(128)
    .regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric lowercase with hyphens'),
  logoUrl: z.string().url().max(512).optional().nullable().or(z.literal('')),
  coverUrl: z.string().url().max(512).optional().nullable().or(z.literal('')),
  description: z.string().trim().max(1000).optional().nullable(),
  primaryGameId: z.string().uuid().optional().nullable(),
  country: z.string().trim().max(64).optional().nullable(),
  region: z.string().trim().max(64).optional().nullable(),
});

export const updateTeamSchema = createTeamSchema.partial();

export const inviteTeamMemberSchema = z.object({
  usernameOrEmail: z.string().trim().min(1, 'Target user is required'),
  role: z.enum(['CAPTAIN', 'MANAGER', 'PLAYER', 'SUBSTITUTE']).default('PLAYER'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['CAPTAIN', 'MANAGER', 'PLAYER', 'SUBSTITUTE']),
});

export const respondInvitationSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT']),
});

