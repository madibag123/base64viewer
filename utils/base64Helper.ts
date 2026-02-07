/**
 * Cleans the input string by removing whitespace and newlines.
 */
export const cleanBase64 = (input: string): string => {
  return input.trim().replace(/\s/g, '');
};

/**
 * Attempts to detect the MIME type from the raw Base64 signature (magic bytes).
 */
export const detectMimeType = (base64: string): string => {
  // Common Base64 signatures
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  if (base64.startsWith('UklGR')) return 'image/webp';
  if (base64.startsWith('PHN2') || base64.startsWith('PD94b')) return 'image/svg+xml';
  if (base64.startsWith('Qk0')) return 'image/bmp';
  if (base64.startsWith('AAABAA')) return 'image/x-icon'; // ICO
  
  // Default fallback
  return 'image/png';
};

/**
 * Formats a loose Base64 string into a valid Data URL.
 * If it already has a header, it returns it cleaned.
 * If missing, it detects the type and adds the header.
 */
export const formatDataUrl = (input: string): string => {
  const cleaned = cleanBase64(input);
  if (!cleaned) return '';

  // Check if it already has the data:image prefix
  if (/^data:image\/[a-zA-Z0-9.+]+;base64,/.test(cleaned)) {
    return cleaned;
  }

  // Detect type and append
  const mimeType = detectMimeType(cleaned);
  return `data:${mimeType};base64,${cleaned}`;
};

/**
 * Calculates the rough size of the image in bytes from the Base64 string.
 */
export const calculateSize = (base64String: string): number => {
  // Remove header if present
  const base64Data = base64String.split(',')[1] || base64String;
  const padding = (base64Data.match(/=/g) || []).length;
  return (base64Data.length * 3) / 4 - padding;
};

/**
 * Formats bytes into human readable string.
 */
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
