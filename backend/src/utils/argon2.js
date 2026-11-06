import argon2 from 'argon2';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 2,
};

export async function hashPassword(plainPassword) {
  if (typeof plainPassword !== 'string' || !plainPassword) {
    throw new Error('Password must be a non-empty string');
  }
  return argon2.hash(plainPassword, ARGON2_OPTIONS);
}

export async function verifyPassword(hash, plainPassword) {
  if (typeof hash !== 'string' || typeof plainPassword !== 'string') {
    return false;
  }
  try {
    return await argon2.verify(hash, plainPassword);
  } catch (error) {
    return false;
  }
}

