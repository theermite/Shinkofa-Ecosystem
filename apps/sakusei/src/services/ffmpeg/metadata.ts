import ffmpeg from 'fluent-ffmpeg';

export interface MediaMetadata {
  duration: number; // seconds
  width: number | null;
  height: number | null;
  hasVideo: boolean;
  hasAudio: boolean;
}

/**
 * Extract metadata from media file using ffprobe
 * @param filePath - Absolute path to media file
 * @returns Promise with metadata
 */
export async function extractMetadata(filePath: string): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('[FFprobe] Error extracting metadata:', err);
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      const audioStream = metadata.streams.find((s) => s.codec_type === 'audio');

      const result: MediaMetadata = {
        duration: Math.floor(metadata.format.duration || 0),
        width: videoStream?.width || null,
        height: videoStream?.height || null,
        hasVideo: !!videoStream,
        hasAudio: !!audioStream,
      };

      console.log('[FFprobe] Extracted metadata:', result);
      resolve(result);
    });
  });
}
