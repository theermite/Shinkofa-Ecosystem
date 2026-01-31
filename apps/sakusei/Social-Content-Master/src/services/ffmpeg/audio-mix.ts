import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { promises as fs } from 'fs';

export interface AudioMixOptions {
  videoPath: string; // Source video with audio
  outputPath: string;
  backgroundMusicPath?: string; // Optional background music
  frequencyPath?: string; // Optional frequency audio (generated WAV)
  videoVolume?: number; // 0-1, default 1
  musicVolume?: number; // 0-1, default 0.10
  frequencyVolume?: number; // 0-1, default 0.06 (subliminal)
  fadeInDuration?: number; // seconds for music/freq fade in
  fadeOutDuration?: number; // seconds for music/freq fade out
  onProgress?: (progress: number) => void;
}

export interface AudioMixResult {
  success: boolean;
  outputPath?: string;
  duration?: number;
  fileSize?: number;
  processingTime?: number;
  error?: string;
}

/**
 * Mix video audio with background music and/or frequency
 * Uses FFmpeg amix filter for multi-track mixing
 */
export async function mixAudio(options: AudioMixOptions): Promise<AudioMixResult> {
  const {
    videoPath,
    outputPath,
    backgroundMusicPath,
    frequencyPath,
    videoVolume = 1.0,
    musicVolume = 0.10,
    frequencyVolume = 0.06,
    fadeInDuration = 2,
    fadeOutDuration = 3,
    onProgress,
  } = options;

  const startTime = Date.now();

  // Validate video exists
  try {
    await fs.access(videoPath);
  } catch {
    return { success: false, error: `Video file not found: ${videoPath}` };
  }

  // Get video duration first
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, async (probeErr, metadata) => {
      if (probeErr) {
        resolve({ success: false, error: `Failed to probe video: ${probeErr.message}` });
        return;
      }

      const videoDuration = metadata.format.duration || 0;

      // Build complex filter for mixing
      const inputs: string[] = [videoPath];
      const filterParts: string[] = [];
      let audioStreams: string[] = ['[0:a]']; // Start with video audio
      let streamIndex = 1;

      // Add video audio with volume adjustment
      if (videoVolume !== 1.0) {
        filterParts.push(`[0:a]volume=${videoVolume}[va]`);
        audioStreams = ['[va]'];
      }

      // Add background music if provided
      if (backgroundMusicPath) {
        try {
          await fs.access(backgroundMusicPath);
          inputs.push(backgroundMusicPath);

          // Apply volume, loop to video duration, and fade
          const fadeOutStart = Math.max(0, videoDuration - fadeOutDuration);
          filterParts.push(
            `[${streamIndex}:a]aloop=loop=-1:size=2e+09,atrim=0:${videoDuration},` +
            `afade=t=in:st=0:d=${fadeInDuration},` +
            `afade=t=out:st=${fadeOutStart}:d=${fadeOutDuration},` +
            `volume=${musicVolume}[ma]`
          );
          audioStreams.push('[ma]');
          streamIndex++;
        } catch {
          console.warn(`[AudioMix] Background music not found: ${backgroundMusicPath}`);
        }
      }

      // Add frequency if provided
      if (frequencyPath) {
        try {
          await fs.access(frequencyPath);
          inputs.push(frequencyPath);

          // Apply volume, loop to video duration, and fade
          const fadeOutStart = Math.max(0, videoDuration - fadeOutDuration);
          filterParts.push(
            `[${streamIndex}:a]aloop=loop=-1:size=2e+09,atrim=0:${videoDuration},` +
            `afade=t=in:st=0:d=${fadeInDuration},` +
            `afade=t=out:st=${fadeOutStart}:d=${fadeOutDuration},` +
            `volume=${frequencyVolume}[fa]`
          );
          audioStreams.push('[fa]');
          streamIndex++;
        } catch {
          console.warn(`[AudioMix] Frequency file not found: ${frequencyPath}`);
        }
      }

      // If no additional audio, just copy
      if (audioStreams.length === 1 && videoVolume === 1.0) {
        console.log('[AudioMix] No additional audio to mix, copying original');
        try {
          await fs.copyFile(videoPath, outputPath);
          const stats = await fs.stat(outputPath);
          resolve({
            success: true,
            outputPath,
            duration: videoDuration,
            fileSize: stats.size,
            processingTime: Date.now() - startTime,
          });
        } catch (copyErr) {
          resolve({ success: false, error: `Failed to copy file: ${copyErr}` });
        }
        return;
      }

      // Build amix filter
      const amixInputs = audioStreams.join('');
      filterParts.push(`${amixInputs}amix=inputs=${audioStreams.length}:duration=first:dropout_transition=2[aout]`);

      const complexFilter = filterParts.join(';');

      console.log(`[AudioMix] Mixing ${audioStreams.length} audio streams`);
      console.log(`[AudioMix] Filter: ${complexFilter}`);

      // Build FFmpeg command
      let command = ffmpeg();

      // Add all inputs
      for (const input of inputs) {
        command = command.input(input);
      }

      command
        .complexFilter(complexFilter)
        .outputOptions([
          '-map', '0:v', // Video from first input
          '-map', '[aout]', // Mixed audio
          '-c:v', 'copy', // Copy video codec (no re-encode)
          '-c:a', 'aac', // Encode audio as AAC
          '-b:a', '192k', // Audio bitrate
          '-shortest', // End when shortest stream ends
        ])
        .output(outputPath);

      if (onProgress) {
        command.on('progress', (progress) => {
          if (progress.percent) {
            onProgress(Math.min(99, Math.round(progress.percent)));
          }
        });
      }

      command.on('end', async () => {
        try {
          const stats = await fs.stat(outputPath);
          if (onProgress) onProgress(100);

          resolve({
            success: true,
            outputPath,
            duration: videoDuration,
            fileSize: stats.size,
            processingTime: Date.now() - startTime,
          });
        } catch (statErr) {
          resolve({ success: false, error: `Output created but cannot read stats: ${statErr}` });
        }
      });

      command.on('error', (err) => {
        console.error('[AudioMix] FFmpeg error:', err);
        resolve({
          success: false,
          error: `FFmpeg error: ${err.message}`,
          processingTime: Date.now() - startTime,
        });
      });

      command.run();
    });
  });
}

/**
 * Generate WAV file from frequency using pure tone or binaural
 */
export async function generateFrequencyWav(
  outputPath: string,
  frequency: number,
  duration: number,
  type: 'pure' | 'binaural' = 'pure',
  binauralBase?: number,
  binauralOffset?: number
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    // Use FFmpeg to generate tone
    // For pure tone: sine wave at frequency
    // For binaural: two sine waves with offset (requires separate channels)

    let filterGraph: string;

    if (type === 'binaural' && binauralBase && binauralOffset) {
      // Binaural: left channel at base, right channel at base+offset
      const leftFreq = binauralBase;
      const rightFreq = binauralBase + binauralOffset;
      filterGraph = `sine=frequency=${leftFreq}:duration=${duration}[left];` +
        `sine=frequency=${rightFreq}:duration=${duration}[right];` +
        `[left][right]amerge=inputs=2[out]`;
    } else {
      // Pure tone: same frequency both channels
      filterGraph = `sine=frequency=${frequency}:duration=${duration},` +
        `aformat=channel_layouts=stereo[out]`;
    }

    ffmpeg()
      .input('anullsrc')
      .inputFormat('lavfi')
      .complexFilter(filterGraph)
      .outputOptions(['-map', '[out]'])
      .audioCodec('pcm_s16le')
      .audioFrequency(44100)
      .duration(duration)
      .output(outputPath)
      .on('end', () => {
        resolve({ success: true });
      })
      .on('error', (err) => {
        resolve({ success: false, error: `Failed to generate frequency: ${err.message}` });
      })
      .run();
  });
}
