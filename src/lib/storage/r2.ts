import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME ?? "steward-files";

/**
 * Generate a key for storing a file.
 * Pattern: {orgId}/{entityType}/{entityId}/{timestamp}-{filename}
 */
export function generateStorageKey(
  orgId: string,
  entityType: string,
  entityId: string,
  filename: string
): string {
  const ts = Date.now();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${orgId}/${entityType}/${entityId}/${ts}-${safe}`;
}

/**
 * Get a short-lived signed URL for reading a file.
 */
export async function getSignedReadUrl(
  storageKey: string,
  expiresInSeconds = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: storageKey });
  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

/**
 * Get a short-lived signed URL for uploading a file directly from the browser.
 */
export async function getSignedUploadUrl(
  storageKey: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete a file from R2.
 */
export async function deleteFile(storageKey: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: storageKey }));
}
