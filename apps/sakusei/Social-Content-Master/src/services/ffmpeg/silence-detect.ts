import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';

export interface SilentSegment {
  start: number; // seconds
  end: number; // seconds
  duration: number; // seconds
}

export interface SilenceDetectionOptions {
  inputPath: string;
  silenceThreshold?: number; // dB, default -40
  minSilenceDuration?: number; // seconds, default 1.5
  onProgress?: (progress: number) => void;
}

export interface SilenceDetectionResult {
  success: boolean;
  silentSegments?: SilentSegment[];
  speechSegments?: SilentSegment[]; // Inverse of silent - where there's audio
  totalDuration?: number;
  totalSilence?: number;
  error?: string;
}

/**
 * Detect silent segments in audio/video using FFmpeg silencedetect filter
 * @param options - Detection options
 * @returns Array of silent segments with start/end times
 */
export async function detectSilence(options: SilenceDetectionOptions): Promise<SilenceDetectionResult> {
  const {
    inputPath,
    silenceThreshold = -40,
    minSilenceDuration = 1.5,
    onProgress,
  } = options;

  // Validate input file exists
  try {
    await fs.access(inputPath);
  } catch {
    return {
      success: false,
      error: `Input file not found: ${inputPath}`,
    };
  }

  return new Promise((resolve) => {
    const silentSegments: SilentSegment[] = [];
    let currentSilenceStart: number | null = null;
    let totalDuration = 0;

    // First, get total duration
    ffmpeg.ffprobe(inputPath, (probeErr, metadata) => {
      if (probeErr) {
        resolve({
          success: false,
          error: `Failed to probe file: ${probeErr.message}`,
        });
        return;
      }

      totalDuration = metadata.format.duration || 0;

      // Run silence detection
      // silencedetect outputs to stderr in format:
      // [silencedetect @ 0x...] silence_start: 1.234
      // [silencedetect @ 0x...] silence_end: 5.678 | silence_duration: 4.444
      const command = ffmpeg(inputPath)
        .audioFilters(`silencedetect=n=${silenceThreshold}dB:d=${minSilenceDuration}`)
        .format('null')
        .output('-') // Output to null (we only need stderr)
        .outputOptions(['-vn']); // No video output

      let stderrData = '';

      command.on('stderr', (line: string) => {
        stderrData += line + '\n';

        // Parse silence_start
        const startMatch = line.match(/silence_start:\s*([\d.]+)/);
        if (startMatch) {
          currentSilenceStart = parseFloat(startMatch[1]);
        }

        // Parse silence_end
        const endMatch = line.match(/silence_end:\s*([\d.]+)/);
        if (endMatch && currentSilenceStart !== null) {
          const end = parseFloat(endMatch[1]);
          silentSegments.push({
            start: currentSilenceStart,
            end,
            duration: end - currentSilenceStart,
          });
          currentSilenceStart = null;
        }
      });

      command.on('progress', (progress) => {
        if (onProgress && progress.percent) {
          onProgress(Math.min(99, Math.round(progress.percent)));
        }
      });

      command.on('end', () => {
        // Handle case where silence extends to end of file
        if (currentSilenceStart !== null) {
          silentSegments.push({
            start: currentSilenceStart,
            end: totalDuration,
            duration: totalDuration - currentSilenceStart,
          });
        }

        // Calculate speech segments (inverse of silence)
        const speechSegments = calculateSpeechSegments(silentSegments, totalDuration);

        const totalSilence = silentSegments.reduce((sum, seg) => sum + seg.duration, 0);

        if (onProgress) onProgress(100);

        resolve({
          success: true,
          silentSegments,
          speechSegments,
          totalDuration,
          totalSilence,
        });
      });

      command.on('error', (err) => {
        resolve({
          success: false,
          error: `FFmpeg error: ${err.message}`,
        });
      });

      command.run();
    });
  });
}

/**
 * Calculate speech segments from silent segments (inverse)
 */
function calculateSpeechSegments(silentSegments: SilentSegment[], totalDuration: number): SilentSegment[] {
  const speechSegments: SilentSegment[] = [];

  if (silentSegments.length === 0) {
    // No silence = entire file is speech
    return [{
      start: 0,
      end: totalDuration,
      duration: totalDuration,
    }];
  }

  // Sort by start time
  const sorted = [...silentSegments].sort((a, b) => a.start - b.start);

  let currentPos = 0;

  for (const silence of sorted) {
    if (silence.start > currentPos) {
      speechSegments.push({
        start: currentPos,
        end: silence.start,
        duration: silence.start - currentPos,
      });
    }
    currentPos = silence.end;
  }

  // Handle speech after last silence
  if (currentPos < totalDuration) {
    speechSegments.push({
      start: currentPos,
      end: totalDuration,
      duration: totalDuration - currentPos,
    });
  }

  return speechSegments;
}

/**
 * Convert speech segments to timeline segments format
 * Used to auto-generate segments that exclude silence
 */
export function speechSegmentsToTimelineSegments(
  speechSegments: SilentSegment[],
  minSegmentDuration: number = 0.5
): Array<{ startTime: number; endTime: number }> {
  return speechSegments
    .filter(seg => seg.duration >= minSegmentDuration)
    .map(seg => ({
      startTime: seg.start,
      endTime: seg.end,
    }));
}
