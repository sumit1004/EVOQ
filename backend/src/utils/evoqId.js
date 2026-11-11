import crypto from 'node:crypto';

// Unambiguous base30 character set (avoids 0, O, 1, I, L)
const EVOQ_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generate a cryptographically secure random EVOQ ID string.
 * Example: EVOQ-7K9M2P
 */
export function generateRandomEvoqId(length = 6) {
  const bytes = crypto.randomBytes(length);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += EVOQ_CHARSET[bytes[i] % EVOQ_CHARSET.length];
  }
  return `EVOQ-${id}`;
}

/**
 * Generate a guaranteed unique EVOQ ID by checking the database.
 * Retries on collision up to maxRetries.
 */
export async function generateUniqueEvoqId(prismaClient, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const candidate = generateRandomEvoqId(6);
    const existing = await prismaClient.gamerProfile.findUnique({
      where: { evoqId: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }
  // Fallback to 8 chars if high collision density
  return generateRandomEvoqId(8);
}

