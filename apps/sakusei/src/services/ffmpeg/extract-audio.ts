import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Extract audio from video file to MP3 format
 * @param videoPath - Path to source video file
 * @param outputPath - Optional output path. If not provided, creates temp file in uploads/temp/
 * @returns Path to extracted audio file
 */
export async function extractAudio(
  videoPath: string,
  outputPath?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate output path if not provided
    if (!outputPath) {
      const tempDir = path.join(process.cwd(), 'uploads', 'temp');
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
      }

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      outputPath = path.join(tempDir, `audio_${timestamp}_${random}.mp3`);
    }

    console.log(`[FFmpeg] Extracting audio from: ${videoPath}`);
    console.log(`[FFmpeg] Output path: ${outputPath}`);

    ffmpeg(videoPath)
      .outputOptions([
        '-vn', // No video
        '-acodec', 'libmp3lame', // MP3 codec
        '-ab', '192k', // Audio bitrate 192kbps
        '-ar', '44100', // Sample rate 44.1kHz
        '-ac', '2', // Stereo
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log(`[FFmpeg] Command: ${commandLine}`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`[FFmpeg] Progress: ${Math.floor(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log(`[FFmpeg] Audio extraction completed: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (error, stdout, stderr) => {
        console.error('[FFmpeg] Error:', error);
        console.error('[FFmpeg] stderr:', stderr);
        reject(new Error(`Audio extraction failed: ${error.message}`));
      })
      .run();
  });
}

/**
 * Check if file is audio-only (no video stream)
 * @param filePath - Path to media file
 * @returns True if file is audio-only
 */
export async function isAudioOnly(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const hasVideo = metadata.streams.some((s) => s.codec_type === 'video');
      resolve(!hasVideo);
    });
  });
}
