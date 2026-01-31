import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { promises as fs } from 'fs';

export interface FFmpegCutOptions {
  inputPath: string;
  outputPath: string;
  startTime: number; // seconds
  duration: number; // seconds
  onProgress?: (progress: number) => void; // 0-100
}

export interface FFmpegCutResult {
  success: boolean;
  outputPath?: string;
  duration?: number; // processing time in ms
  fileSize?: number; // bytes
  error?: string;
}

/**
 * Cut/trim video using FFmpeg
 * @param options - Cut options with input/output paths and trim points
 * @returns Result with output path or error
 */
export async function cutVideo(options: FFmpegCutOptions): Promise<FFmpegCutResult> {
  const { inputPath, outputPath, startTime, duration, onProgress } = options;
  const startProcessTime = Date.now();

  return new Promise((resolve) => {
    // Validate input file exists
    fs.access(inputPath)
      .catch(() => {
        resolve({
          success: false,
          error: `Input file not found: ${inputPath}`,
        });
        return Promise.reject();
      })
      .then(() => {
        // Get video duration first
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
          if (err) {
            resolve({
              success: false,
              error: `Failed to probe video: ${err.message}`,
            });
            return;
          }

          const videoDuration = metadata.format.duration || 0;

          // Validate trim points
          if (startTime < 0 || startTime >= videoDuration) {
            resolve({
              success: false,
              error: `Invalid start time: ${startTime} (video duration: ${videoDuration}s)`,
            });
            return;
          }

          if (duration <= 0) {
            resolve({
              success: false,
              error: `Invalid duration: ${duration}`,
            });
            return;
          }

          // Execute FFmpeg cut
          const command = ffmpeg(inputPath)
            .setStartTime(startTime)
            .setDuration(duration)
            .output(outputPath)
            .videoCodec('libx264') // Re-encode with H.264
            .audioCodec('aac') // Re-encode audio with AAC
            .outputOptions([
              '-preset fast', // Fast encoding preset
              '-crf 23', // Constant Rate Factor (quality: 0-51, lower = better)
            ]);

          // Progress tracking
          if (onProgress) {
            command.on('progress', (progress) => {
              if (progress.percent) {
                onProgress(Math.min(99, Math.round(progress.percent)));
              }
            });
          }

          // Success
          command.on('end', async () => {
            const processingDuration = Date.now() - startProcessTime;

            try {
              const stats = await fs.stat(outputPath);

              if (onProgress) onProgress(100);

              resolve({
                success: true,
                outputPath,
                duration: processingDuration,
                fileSize: stats.size,
              });
            } catch (statErr) {
              resolve({
                success: false,
                error: `Output file created but cannot read stats: ${statErr}`,
              });
            }
          });

          // Error
          command.on('error', (err) => {
            resolve({
              success: false,
              error: `FFmpeg error: ${err.message}`,
              duration: Date.now() - startProcessTime,
            });
          });

          // Run command
          command.run();
        });
      });
  });
}

/**
 * Generate unique output filename for cut video
 * @param originalFilename - Original file name
 * @param startTime - Start trim point
 * @param endTime - End trim point
 * @returns New filename with trim info
 */
export function generateCutFilename(
  originalFilename: string,
  startTime: number,
  endTime: number
): string {
  const ext = path.extname(originalFilename);
  const baseName = path.basename(originalFilename, ext);
  const timestamp = Date.now();

  const startStr = Math.floor(startTime).toString().padStart(4, '0');
  const endStr = Math.floor(endTime).toString().padStart(4, '0');

  return `${baseName}_cut_${startStr}-${endStr}_${timestamp}${ext}`;
}

/**
 * Get FFmpeg version and check if installed
 */
export async function checkFFmpegInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      if (err) {
        console.error('FFmpeg not found:', err.message);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
