import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, 'Organization name must be at least 2 characters').max(128),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(128)
    .regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric lowercase with hyphens'),
  logoUrl: z.string().url().max(512).optional().nullable().or(z.literal('')),
  coverUrl: z.string().url().max(512).optional().nullable().or(z.literal('')),
  description: z.string().trim().max(1000).optional().nullable(),
  location: z.string().trim().max(128).optional().nullable(),
  website: z.string().url().max(255).optional().nullable().or(z.literal('')),
  orgType: z.enum(['CLUB', 'ESPORTS_TEAM', 'TOURNAMENT_ORGANIZER', 'COMMUNITY']).default('TOURNAMENT_ORGANIZER'),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      discord: z.string().optional(),
      twitch: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const addStaffSchema = z.object({
  usernameOrEmail: z.string().trim().min(1),
  role: z.enum(['ADMIN', 'MANAGER', 'TOURNAMENT_ADMIN', 'STAFF']).default('STAFF'),
});

