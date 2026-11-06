import { z } from 'zod';

export const upsertOrganizerProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(128),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric lowercase with hyphens'),
  bio: z.string().trim().max(1000).optional().nullable(),
  avatarUrl: z.string().url().max(512).optional().nullable().or(z.literal('')),
  coverUrl: z.string().url().max(512).optional().nullable().or(z.literal('')),
  location: z.string().trim().max(128).optional().nullable(),
  website: z.string().url().max(255).optional().nullable().or(z.literal('')),
  experience: z.string().trim().max(1000).optional().nullable(),
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

