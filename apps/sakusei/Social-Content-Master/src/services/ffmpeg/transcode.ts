import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';

export interface TranscodeOptions {
  inputPath: string;
  outputPath: string;
  width: number;
  height: number;
  subtitlePath?: string;
  burnSubtitles?: boolean;
}

export interface TranscodeResult {
  outputPath: string;
  fileSize: number;
  duration: number;
  resolution: string;
  processingTime: number;
}

/**
 * Transcode video to specific resolution with optional subtitle burn-in
 * Supports aspect ratio conversion (cropping/padding as needed)
 */
export async function transcodeVideo(
  options: TranscodeOptions,
  onProgress?: (progress: number) => void
): Promise<TranscodeResult> {
  const startTime = Date.now();

  console.log('[Transcode] Starting with options:', {
    input: options.inputPath,
    output: options.outputPath,
    resolution: `${options.width}x${options.height}`,
    burnSubtitles: options.burnSubtitles,
  });

  return new Promise((resolve, reject) => {
    let command = ffmpeg(options.inputPath);

    // Video encoding settings
    command = command
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('192k')
      .videoBitrate('5000k')
      .fps(30)
      .format('mp4')
      .outputOptions([
        '-max_muxing_queue_size', '1024',
        '-timeout', '600000000', // 10 minutes max
      ]);

    // Resolution and scaling
    // Use scale filter with aspect ratio handling
    let videoFilters: string[] = [];

    // Calculate aspect ratios
    const targetAspect = options.width / options.height;

    // Scale to fit target resolution, padding/cropping as needed
    // Using scale with force_original_aspect_ratio and pad
    videoFilters.push(`scale=${options.width}:${options.height}:force_original_aspect_ratio=decrease`);
    videoFilters.push(`pad=${options.width}:${options.height}:(ow-iw)/2:(oh-ih)/2:black`);

    // Subtitle burn-in if requested
    if (options.burnSubtitles && options.subtitlePath) {
      const escapedSubPath = options.subtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:');
      videoFilters.push(`subtitles='${escapedSubPath}':force_style='FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=3,Outline=2,Shadow=1'`);
    }

    if (videoFilters.length > 0) {
      command = command.videoFilters(videoFilters.join(','));
    }

    // Track progress
    command.on('progress', (progress) => {
      const percent = Math.min(Math.round(progress.percent || 0), 100);
      console.log(`[Transcode] Progress: ${percent}%`);
      if (onProgress) {
        onProgress(percent);
      }
    });

    // Handle completion
    command.on('end', async () => {
      const processingTime = Date.now() - startTime;
      console.log(`[Transcode] Completed in ${processingTime}ms`);

      try {
        // Get output file info
        const stats = await fs.stat(options.outputPath);

        resolve({
          outputPath: options.outputPath,
          fileSize: stats.size,
          duration: 0, // Will be filled by caller if needed
          resolution: `${options.width}x${options.height}`,
          processingTime,
        });
      } catch (error) {
        reject(new Error(`Failed to get output file stats: ${error}`));
      }
    });

    // Handle errors
    command.on('error', async (err) => {
      console.error('[Transcode] Error:', err);

      // Cleanup partial output file
      try {
        await fs.unlink(options.outputPath);
        console.log('[Transcode] Cleaned up partial output file');
      } catch (cleanupErr) {
        console.warn('[Transcode] Failed to cleanup output file:', cleanupErr);
      }

      reject(new Error(`FFmpeg transcode failed: ${err.message}`));
    });

    // Run FFmpeg
    command.save(options.outputPath);
  });
}

/**
 * Get video metadata (duration, resolution)
 */
export async function getVideoMetadata(filePath: string): Promise<{
  duration: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get video metadata: ${err.message}`));
        return;
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
      });
    });
  });
}
