import { z } from 'zod';

const passwordPolicy = z
  .string()
  .min(12, 'Password must be at least 12 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email cannot exceed 255 characters')
    .toLowerCase(),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be between 3 and 30 characters')
    .max(30, 'Username must be between 3 and 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username may only contain letters, numbers, underscores, and hyphens'
    ),
  password: passwordPolicy,
});

export const registerGamerSchema = registerSchema;

export const registerOrganizerSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email cannot exceed 255 characters')
    .toLowerCase(),
  username: z
    .string()
    .trim()
    .min(3, 'Organizer identifier must be between 3 and 30 characters')
    .max(30, 'Organizer identifier must be between 3 and 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Identifier may only contain letters, numbers, underscores, and hyphens'
    ),
  organizationName: z
    .string()
    .trim()
    .min(2, 'Organization name must be at least 2 characters')
    .max(128, 'Organization name cannot exceed 128 characters'),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(128)
    .optional(),
  password: passwordPolicy,
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  portal: z.enum(['GAMER', 'ORGANIZER']).optional(),
  accountType: z.enum(['GAMER', 'ORGANIZER']).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordPolicy,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

