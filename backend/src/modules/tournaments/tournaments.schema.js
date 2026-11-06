import { z } from 'zod';

export const createTournamentSchema = z.object({
  name: z.string().trim().min(3, 'Tournament name must be at least 3 characters').max(255),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric lowercase with hyphens'),
  description: z.string().trim().max(4000).optional().nullable(),
  bannerUrl: z.string().url().max(512).optional().nullable().or(z.literal('')),
  thumbnailUrl: z.string().url().max(512).optional().nullable().or(z.literal('')),
  gameId: z.string().uuid('Valid game selection required'),
  organizationId: z.string().uuid().optional().nullable(),
  format: z.enum([
    'SINGLE_ELIMINATION',
    'DOUBLE_ELIMINATION',
    'ROUND_ROBIN',
    'GROUP_STAGE',
    'BATTLE_ROYALE',
    'CUSTOM',
  ]).default('SINGLE_ELIMINATION'),
  participationType: z.enum(['INDIVIDUAL', 'TEAM']).default('TEAM'),
  teamSize: z.coerce.number().int().min(1).max(20).default(5),
  minParticipants: z.coerce.number().int().min(2).default(2),
  maxParticipants: z.coerce.number().int().min(2).max(256).default(16),
  registrationStart: z.string().datetime(),
  registrationDeadline: z.string().datetime(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  timezone: z.string().default('UTC'),
  locationMode: z.enum(['ONLINE', 'LAN', 'HYBRID']).default('ONLINE'),
  locationDetails: z.string().max(255).optional().nullable(),
  rules: z.string().max(10000).optional().nullable(),
  prizePool: z.string().max(128).optional().nullable(),
  prizeStructure: z.any().optional().nullable(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).default('PUBLIC'),
  formatConfig: z.any().optional().nullable(),
});

export const updateTournamentSchema = createTournamentSchema.partial();

export const updateTournamentStatusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'PUBLISHED',
    'REGISTRATION_OPEN',
    'REGISTRATION_CLOSED',
    'ONGOING',
    'COMPLETED',
    'CANCELLED',
    'ARCHIVED',
  ]),
});

export const listTournamentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  gameId: z.string().uuid().optional(),
  status: z.string().optional(),
  format: z.string().optional(),
  participationType: z.enum(['INDIVIDUAL', 'TEAM']).optional(),
  sortBy: z.enum(['startDate', 'createdAt', 'name']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

