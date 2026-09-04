import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StorageUploadResult {
  url: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  durationSeconds?: number;
}

export const ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

export const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.mp4', '.webm', '.mov'];

export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

/**
 * Validates audio/video file metadata before processing.
 */
export function validateMediaFile(
  file: { name: string; size: number; type: string }
): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 500MB.`,
    };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Allow general audio/video if browser sends generic stream
  const isAllowedMime =
    ALLOWED_MIME_TYPES.includes(file.type) ||
    file.type.startsWith('audio/') ||
    file.type.startsWith('video/') ||
    file.type === 'application/octet-stream';

  if (!isAllowedMime) {
    return {
      valid: false,
      error: `Unsupported MIME type "${file.type}".`,
    };
  }

  return { valid: true };
}

/**
 * Stores an uploaded media file safely.
 * In development or when S3 is unconfigured, stores to public/uploads with safe hashed filenames.
 */
export async function storeMediaFile(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<StorageUploadResult> {
  const ext = path.extname(originalFilename).toLowerCase() || '.mp3';
  const randomHash = crypto.randomBytes(16).toString('hex');
  const safeFilename = `mtg_rec_${Date.now()}_${randomHash}${ext}`;

  // Local development storage
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, safeFilename);
  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/${safeFilename}`;

  return {
    url: publicUrl,
    filename: safeFilename,
    sizeBytes: buffer.length,
    mimeType,
  };
}
