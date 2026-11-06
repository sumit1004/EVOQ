import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prisma from '../database/prisma.js';
import { generateUuid } from '../utils/uuid.js';
import { ValidationError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

class MediaService {
  /**
   * Save uploaded base64 data or raw buffer safely.
   */
  async processUpload({ ownerId, dataUri, fileName = 'asset' }) {
    if (!dataUri || typeof dataUri !== 'string') {
      throw new ValidationError('Upload payload must be a valid base64 data URI');
    }

    const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new ValidationError('Invalid data URI format');
    }

    const mimeType = matches[1].toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new ValidationError(`Unsupported file type: ${mimeType}. Allowed: JPG, PNG, WEBP, GIF`);
    }

    const buffer = Buffer.from(matches[2], 'base64');
    if (buffer.length > MAX_FILE_SIZE) {
      throw new ValidationError('File size exceeds the 5 MB limit');
    }

    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : mimeType === 'image/gif' ? 'gif' : 'jpg';
    const assetId = generateUuid();
    const diskFileName = `${assetId}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, diskFileName);

    await fs.promises.writeFile(filePath, buffer);
    const publicUrl = `/uploads/${diskFileName}`;

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        id: assetId,
        ownerId,
        provider: 'LOCAL',
        providerAssetId: diskFileName,
        url: publicUrl,
        mimeType,
        fileSizeBytes: buffer.length,
        visibility: 'PUBLIC',
      },
    });

    return mediaAsset;
  }
}

export const mediaService = new MediaService();

