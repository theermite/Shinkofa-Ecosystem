import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import type { TimelineSegment } from '@/types/timeline';

export interface ConcatOptions {
  inputPath: string;
  outputPath: string;
  segments: TimelineSegment[];
  onProgress?: (progress: number) => void;
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow';
  crf?: number;
}

export interface ConcatResult {
  outputPath: string;
  duration: number;
  segmentCount: number;
  fileSize: number;
  processingTime: number;
}

/**
 * Concatène plusieurs segments d'une vidéo en utilisant le filtre complexe FFmpeg.
 * Utilise trim + concat pour extraire et assembler les segments.
 */
export async function concatenateSegments(
  options: ConcatOptions
): Promise<ConcatResult> {
  const startTime = Date.now();

  // Valider segments
  if (!options.segments || options.segments.length === 0) {
    throw new Error('No segments provided for concatenation');
  }

  // Filtrer segments actifs et trier
  const activeSegments = options.segments
    .filter((s) => !s.isDeleted)
    .sort((a, b) => a.startTime - b.startTime);

  if (activeSegments.length === 0) {
    throw new Error('No active segments to concatenate');
  }

  console.log('[Concat] Starting with options:', {
    input: options.inputPath,
    output: options.outputPath,
    segmentCount: activeSegments.length,
    totalDuration: activeSegments.reduce(
      (sum, s) => sum + (s.endTime - s.startTime),
      0
    ),
  });

  return new Promise((resolve, reject) => {
    try {
      const command = ffmpeg(options.inputPath);

      // Construire le filtre complexe
      const complexFilter = buildComplexFilter(activeSegments);
      console.log('[Concat] Complex filter:', complexFilter);

      // Configuration du codec et qualité
      command
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate('192k')
        .outputOptions([
          '-preset',
          options.preset || 'fast',
          '-crf',
          String(options.crf || 23),
          '-max_muxing_queue_size',
          '1024',
        ])
        .complexFilter(complexFilter)
        .map('[outv]')
        .map('[outa]')
        .format('mp4');

      // Track progress
      command.on('progress', (progress) => {
        const percent = Math.min(Math.round(progress.percent || 0), 100);
        console.log(`[Concat] Progress: ${percent}%`);
        if (options.onProgress) {
          options.onProgress(percent);
        }
      });

      // Handle completion
      command.on('end', async () => {
        const processingTime = Date.now() - startTime;
        console.log(`[Concat] Completed in ${processingTime}ms`);

        try {
          // Get output file info
          const stats = await fs.stat(options.outputPath);

          // Calculate total duration
          const totalDuration = activeSegments.reduce(
            (sum, s) => sum + (s.endTime - s.startTime),
            0
          );

          resolve({
            outputPath: options.outputPath,
            duration: totalDuration,
            segmentCount: activeSegments.length,
            fileSize: stats.size,
            processingTime,
          });
        } catch (error) {
          reject(new Error(`Failed to get output file stats: ${error}`));
        }
      });

      // Handle errors
      command.on('error', async (err) => {
        console.error('[Concat] Error:', err);

        // Cleanup partial output file
        try {
          await fs.unlink(options.outputPath);
          console.log('[Concat] Cleaned up partial output file');
        } catch (cleanupErr) {
          console.warn('[Concat] Failed to cleanup output file:', cleanupErr);
        }

        reject(new Error(`FFmpeg concat failed: ${err.message}`));
      });

      // Run FFmpeg
      command.save(options.outputPath);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Construit le filtre complexe FFmpeg pour concaténer les segments.
 *
 * Exemple pour 3 segments :
 * [0:v]trim=0:30,setpts=PTS-STARTPTS[v0];
 * [0:a]atrim=0:30,asetpts=PTS-STARTPTS[a0];
 * [0:v]trim=60:90,setpts=PTS-STARTPTS[v1];
 * [0:a]atrim=60:90,asetpts=PTS-STARTPTS[a1];
 * [0:v]trim=120:150,setpts=PTS-STARTPTS[v2];
 * [0:a]atrim=120:150,asetpts=PTS-STARTPTS[a2];
 * [v0][a0][v1][a1][v2][a2]concat=n=3:v=1:a=1[outv][outa]
 */
function buildComplexFilter(segments: TimelineSegment[]): string {
  const filterParts: string[] = [];
  const videoLabels: string[] = [];
  const audioLabels: string[] = [];

  segments.forEach((segment, index) => {
    // Video stream: trim + setpts
    filterParts.push(
      `[0:v]trim=${segment.startTime}:${segment.endTime},setpts=PTS-STARTPTS[v${index}]`
    );
    videoLabels.push(`[v${index}]`);

    // Audio stream: atrim + asetpts
    filterParts.push(
      `[0:a]atrim=${segment.startTime}:${segment.endTime},asetpts=PTS-STARTPTS[a${index}]`
    );
    audioLabels.push(`[a${index}]`);
  });

  // Concat filter
  const concatFilter = `${videoLabels.join('')}${audioLabels.join('')}concat=n=${
    segments.length
  }:v=1:a=1[outv][outa]`;

  filterParts.push(concatFilter);

  return filterParts.join('; ');
}

/**
 * Filtre et ajuste les timestamps de transcription pour les segments concaténés.
 * Les timestamps sont ajustés pour être relatifs à la vidéo finale concaténée.
 */
export function filterTranscriptionForSegments(
  transcription: any,
  segments: TimelineSegment[]
): any {
  if (!transcription || !transcription.segments) {
    return null;
  }

  const activeSegments = segments
    .filter((s) => !s.isDeleted)
    .sort((a, b) => a.startTime - b.startTime);

  const filteredSegments: any[] = [];
  let cumulativeOffset = 0;

  activeSegments.forEach((timeSegment) => {
    // Trouver segments transcription dans ce range temporel
    const matchingSegments = transcription.segments.filter(
      (ts: any) =>
        ts.start >= timeSegment.startTime && ts.end <= timeSegment.endTime
    );

    // Ajuster timestamps (relatif à la vidéo finale concaténée)
    matchingSegments.forEach((ts: any) => {
      filteredSegments.push({
        start: ts.start - timeSegment.startTime + cumulativeOffset,
        end: ts.end - timeSegment.startTime + cumulativeOffset,
        text: ts.text,
      });
    });

    // Incrémenter l'offset cumulatif
    cumulativeOffset += timeSegment.endTime - timeSegment.startTime;
  });

  return {
    segments: filteredSegments,
  };
}
