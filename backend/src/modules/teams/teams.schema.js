import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Team name must be at least 2 characters')
    .max(128, 'Team name cannot exceed 128 characters')
    .refine((val) => val.length > 0 && !/^\s+$/.test(val), {
      message: 'Team name cannot be empty or whitespace only',
    }),
  maxMembers: z
    .coerce
    .number()
    .int('Team size must be a whole number')
    .min(1, 'Team size must be at least 1 member')
    .max(32, 'Team size cannot exceed 32 members')
    .default(4),
  logoUrl: z.string().trim().max(512).optional().nullable().or(z.literal('')),
  memberEvoqIds: z
    .array(z.string().trim().min(3))
    .max(31, 'Cannot invite more members than team capacity')
    .optional()
    .default([]),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(128)
    .regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric lowercase with hyphens')
    .optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  primaryGameId: z.string().uuid().optional().nullable().or(z.literal('')),
  country: z.string().trim().max(64).optional().nullable(),
  region: z.string().trim().max(64).optional().nullable(),
});

export const updateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Team name must be at least 2 characters')
    .max(128)
    .optional(),
  maxMembers: z
    .coerce
    .number()
    .int()
    .min(1, 'Team size must be at least 1 member')
    .max(32, 'Team size cannot exceed 32 members')
    .optional(),
  logoUrl: z.string().trim().max(512).optional().nullable().or(z.literal('')),
  description: z.string().trim().max(1000).optional().nullable(),
  primaryGameId: z.string().uuid().optional().nullable().or(z.literal('')),
});

export const updateTeamSizeSchema = z.object({
  maxMembers: z
    .coerce
    .number()
    .int('Team size must be a whole number')
    .min(1, 'Team size must be at least 1 member')
    .max(32, 'Team size cannot exceed 32 members'),
});

export const inviteTeamMemberSchema = z.object({
  evoqId: z.string().trim().optional(),
  usernameOrEmail: z.string().trim().optional(),
  role: z.enum(['CAPTAIN', 'MANAGER', 'PLAYER', 'SUBSTITUTE']).default('PLAYER'),
}).refine((data) => data.evoqId || data.usernameOrEmail, {
  message: 'Either EVOQ ID or Username/Email is required to invite a competitor',
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['CAPTAIN', 'MANAGER', 'PLAYER', 'SUBSTITUTE']),
});

export const respondInvitationSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT']),
});

export const transferOwnershipSchema = z.object({
  newOwnerUserId: z.string().uuid('Valid new owner user ID is required'),
});
