import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import env from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
// Derive a 32-byte key from existing session secret/salt
const SECRET_KEY = Buffer.from(
  (process.env.CREDENTIALS_ENCRYPTION_KEY || 'evoq_credentials_encryption_key_32b!').padEnd(32, '0').slice(0, 32)
);

export function encryptSecret(plainText) {
  if (!plainText) return '';
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptSecret(cipherText) {
  if (!cipherText || !cipherText.includes(':')) return '';
  try {
    const [ivHex, authTagHex, encryptedHex] = cipherText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return '***[DECRYPTION_FAILED]***';
  }
}

