/**
 * Media metadata types
 */

export interface MediaMetadata {
  // Basic info
  title: string;
  description: string;
  author: string;

  // Tags/Keywords
  tags: string[];

  // Dates
  createdAt: Date | null;
  recordedAt: Date | null;

  // Technical info (read-only, from file)
  duration: number; // seconds
  width: number;
  height: number;
  codec: string;
  frameRate: number;
  bitrate: number;
  fileSize: number; // bytes
  fileName: string;
  mimeType: string;

  // Social media specific
  platform?: 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin';
  visibility?: 'public' | 'unlisted' | 'private';

  // Custom fields
  customFields?: Record<string, string>;
}

export const DEFAULT_MEDIA_METADATA: MediaMetadata = {
  title: '',
  description: '',
  author: '',
  tags: [],
  createdAt: null,
  recordedAt: null,
  duration: 0,
  width: 0,
  height: 0,
  codec: '',
  frameRate: 0,
  bitrate: 0,
  fileSize: 0,
  fileName: '',
  mimeType: '',
  visibility: 'public',
};

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Format duration to HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds === 0) return '00:00';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format bitrate to human readable
 */
export function formatBitrate(bps: number): string {
  if (bps === 0) return '0 bps';

  if (bps >= 1000000) {
    return `${(bps / 1000000).toFixed(2)} Mbps`;
  }
  if (bps >= 1000) {
    return `${(bps / 1000).toFixed(2)} Kbps`;
  }
  return `${bps} bps`;
}

/**
 * Format resolution
 */
export function formatResolution(width: number, height: number): string {
  if (width === 0 || height === 0) return 'Inconnu';

  // Common resolutions
  const resolutions: Record<string, string> = {
    '3840x2160': '4K UHD',
    '2560x1440': '2K QHD',
    '1920x1080': '1080p Full HD',
    '1280x720': '720p HD',
    '854x480': '480p SD',
    '640x360': '360p',
    '1080x1920': '1080x1920 (Vertical)',
    '720x1280': '720x1280 (Vertical)',
  };

  const key = `${width}x${height}`;
  return resolutions[key] || `${width}x${height}`;
}
