import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  SESSION_COOKIE_NAME: z.string().default('evoq_session'),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(72),
  CSRF_TOKEN_TTL_HOURS: z.coerce.number().int().positive().default(24),
  EMAIL_PROVIDER: z.string().default('console'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    '❌ Invalid environment configuration:\n',
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

const env = Object.freeze(parsed.data);

export default env;

