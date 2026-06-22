const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateFileMeta(
  fileName: string,
  mimeType: string,
  size?: number
): string | null {
  if (!fileName) return "File name is required";
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return `File type not allowed. Accepted: PDF, JPEG, PNG, WebP`;
  }
  if (size !== undefined && size > MAX_FILE_SIZE) {
    return `File exceeds 10 MB limit`;
  }
  return null;
}

export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE };
