import { z } from 'zod';

export const submitResultSchema = z.object({
  participantResults: z.array(
    z.object({
      registrationId: z.string().uuid(),
      score: z.number().int().min(0).default(0),
      metrics: z.record(z.any()).optional(),
      isWinner: z.boolean().default(false),
    })
  ).min(1, 'At least one participant result is required'),
  evidenceUrls: z.array(z.string().url()).optional(),
  notes: z.string().max(1000).optional(),
});

export const rejectResultSchema = z.object({
  rejectionReason: z.string().trim().min(3, 'Rejection reason is required').max(1000),
});

export const correctResultSchema = z.object({
  participantResults: z.array(
    z.object({
      registrationId: z.string().uuid(),
      score: z.number().int().min(0).default(0),
      metrics: z.record(z.any()).optional(),
      isWinner: z.boolean().default(false),
    })
  ).min(1),
  reason: z.string().trim().min(5, 'Correction reason is required').max(1000),
  evidenceUrls: z.array(z.string().url()).optional(),
});

