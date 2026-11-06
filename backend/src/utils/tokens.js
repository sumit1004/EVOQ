import { randomBytes, createHash } from 'node:crypto';

export function generateSecureToken(byteLength = 32) {
  return randomBytes(byteLength).toString('hex');
}

export function hashToken(token) {
  if (typeof token !== 'string') {
    throw new Error('Token must be a string to hash');
  }
  return createHash('sha256').update(token).digest('hex');
}

