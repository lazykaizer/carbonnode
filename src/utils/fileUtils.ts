import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES } from './constants';

/**
 * Validates file type by checking MIME type (not just extension).
 */
export function isAllowedFileType(file: File): boolean {
  return ALLOWED_FILE_TYPES.includes(file.type);
}

/**
 * Validates file size against the maximum allowed.
 */
export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE_BYTES;
}

/**
 * Converts a File to a base64 string for API transmission.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Gets a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Creates an object URL for image preview.
 * Remember to revoke with URL.revokeObjectURL when done.
 */
export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
