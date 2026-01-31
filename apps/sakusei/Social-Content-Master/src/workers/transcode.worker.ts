import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { transcodeQueue } from '@/lib/queue';
import { transcodeVideo, getVideoMetadata } from '@/services/ffmpeg/transcode';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

interface TranscodeJobData {
  exportId: string;
  clipId: string;
  format: string;
  width: number;
  height: number;
  burnSubtitles: boolean;
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Transcode worker
const transcodeWorker = new Worker<TranscodeJobData>(
  'transcode',
  async (job: Job<TranscodeJobData>) => {
    console.log(`🎬 [TranscodeWorker] ===== JOB ${job.id} STARTED =====`);
    const { exportId, clipId, format, width, height, burnSubtitles } = job.data;

    console.log(`[TranscodeWorker] Export ID: ${exportId}`);
    console.log(`[TranscodeWorker] Clip ID: ${clipId}`);
    console.log(`[TranscodeWorker] Format: ${format} (${width}x${height})`);
    console.log('[TranscodeWorker] Full job data:', JSON.stringify(job.data, null, 2));

    try {
      // Update export status to PROCESSING
      await prisma.export.update({
        where: { id: exportId },
        data: {
          status: 'PROCESSING',
          progress: 0,
        },
      });

      // Get clip from database with cutMediaFile and sourceMedia
      const clip = await prisma.editedClip.findUnique({
        where: { id: clipId },
        include: {
          cutMediaFile: true,
          sourceMedia: true,
        },
      });

      if (!clip) {
        throw new Error(`Clip not found: ${clipId}`);
      }

      // Use cutMediaFile if available (trimmed clip), otherwise fallback to sourceMedia (full video)
      const inputMediaPath = clip.cutMediaFile?.vpsPath || clip.sourceMedia?.vpsPath;

      if (!inputMediaPath) {
        throw new Error(`No media path found for clip ${clipId}. Need either cutMediaFile or sourceMedia.`);
      }

      console.log(`[TranscodeWorker] Using input file: ${inputMediaPath}`);
      console.log(`[TranscodeWorker] Source type: ${clip.cutMediaFile ? 'cutMediaFile (trimmed)' : 'sourceMedia (full video)'}`);
      if (clip.cutMediaFile) {
        console.log(`[TranscodeWorker] Clip duration: ${clip.endTime - clip.startTime}s (${clip.startTime}s - ${clip.endTime}s)`);
      }

      // Generate output filename
      const outputFilename = `${clip.name}_${format}_${Date.now()}.mp4`;
      const outputPath = path.join(UPLOAD_DIR, outputFilename);

      // Get subtitle path if burn-in requested
      let subtitlePath: string | undefined;
      if (burnSubtitles && clip.transcription) {
        // Generate SRT file from transcription JSON
        const srtFilename = `${clip.name}_${Date.now()}.srt`;
        const srtPath = path.join(UPLOAD_DIR, srtFilename);

        const segments = (clip.transcription as any).segments || [];
        const srtContent = segments
          .map((seg: any, index: number) => {
            const startTime = formatSrtTime(seg.start);
            const endTime = formatSrtTime(seg.end);
            return `${index + 1}\n${startTime} --> ${endTime}\n${seg.text}\n`;
          })
          .join('\n');

        await fs.writeFile(srtPath, srtContent, 'utf-8');
        subtitlePath = srtPath;

        console.log(`[TranscodeWorker] Created SRT file: ${srtPath}`);
      }

      // Transcode video
      console.log(`[TranscodeWorker] Transcoding to ${width}x${height}...`);

      const result = await transcodeVideo(
        {
          inputPath: inputMediaPath,
          outputPath,
          width,
          height,
          subtitlePath,
          burnSubtitles,
        },
        async (progress) => {
          // Update job progress
          await job.updateProgress(progress);

          // Update export progress in database
          await prisma.export.update({
            where: { id: exportId },
            data: { progress },
          });

          console.log(`[TranscodeWorker] Export ${exportId} progress: ${progress}%`);
        }
      );

      // Get video metadata
      const metadata = await getVideoMetadata(outputPath);

      // Generate CDN URL (relative path for now, FTP transfer will happen later)
      const cdnUrl = `/uploads/${outputFilename}`;

      // Update export in database
      await prisma.export.update({
        where: { id: exportId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          vpsPath: outputPath,
          cdnUrl,
          fileSize: result.fileSize,
          duration: metadata.duration,
        },
      });

      // Cleanup subtitle file if created
      if (subtitlePath) {
        await fs.unlink(subtitlePath).catch((err) => {
          console.warn(`[TranscodeWorker] Failed to delete SRT file: ${err.message}`);
        });
      }

      console.log(`[TranscodeWorker] Job ${job.id} completed successfully`);

      return {
        exportId,
        outputPath,
        cdnUrl,
        fileSize: result.fileSize,
        resolution: result.resolution,
        processingTime: result.processingTime,
      };
    } catch (error) {
      console.error(`[TranscodeWorker] Job ${job.id} failed:`, error);

      // Update export status to FAILED
      await prisma.export.update({
        where: { id: exportId },
        data: {
          status: 'FAILED',
          progress: 0,
        },
      });

      throw error;
    }
  },
  {
    connection: {
      host: 'localhost',
      port: 6380, // Same as queue.ts configuration
    },
    concurrency: 1, // Process 1 transcode job at a time (sequential to prevent OOM)
  }
);

transcodeWorker.on('completed', (job) => {
  console.log(`✅ [TranscodeWorker] Job ${job.id} completed successfully`);
});

transcodeWorker.on('failed', (job, err) => {
  console.error(`❌ [TranscodeWorker] Job ${job?.id} FAILED:`, err);
  console.error('[TranscodeWorker] Error stack:', err.stack);
});

transcodeWorker.on('error', (err) => {
  console.error('❌ [TranscodeWorker] WORKER ERROR:', err);
  console.error('[TranscodeWorker] Error stack:', err.stack);
});

transcodeWorker.on('active', (job) => {
  console.log(`🔄 [TranscodeWorker] Job ${job.id} is now active`);
});

console.log('🎬 [TranscodeWorker] Worker started and listening for jobs on queue "transcode"...');
console.log('[TranscodeWorker] Concurrency: 1 job at a time (sequential to prevent OOM)');
console.log('[TranscodeWorker] Upload directory:', UPLOAD_DIR);

// Helper function to format time for SRT format (HH:MM:SS,mmm)
function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
}

export default transcodeWorker;
