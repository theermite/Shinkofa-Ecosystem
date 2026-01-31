// Load environment variables from .env.local
import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.cwd(), '.env.local') });

import { Worker, Job } from 'bullmq';
import { transcribeQueue, TranscribeJob } from '@/lib/queue';
import { transcribeWithGroq, segmentsToSRT, segmentsToVTT } from '@/services/transcription/groq';
import db from '@/lib/db';
import { existsSync, unlinkSync } from 'fs';

// Get Redis connection options
const getRedisConnection = () => ({
  host: 'localhost',
  port: 6380,
  maxRetriesPerRequest: 3,
});

/**
 * BullMQ Worker for audio/video transcription
 * Processes transcription jobs using Groq Whisper v3
 */
const transcribeWorker = new Worker<TranscribeJob>(
  'transcribe',
  async (job: Job<TranscribeJob>) => {
    const { mediaFileId, audioPath, provider } = job.data;

    console.log(`\n🎙️ [Transcribe Worker] Starting job ${job.id}`);
    console.log(`   MediaFile: ${mediaFileId}`);
    console.log(`   Audio Path: ${audioPath}`);
    console.log(`   Provider: ${provider}`);

    try {
      // Update progress: Starting
      await job.updateProgress(10);

      // Get MediaFile from database
      const mediaFile = await db.mediaFile.findUnique({
        where: { id: mediaFileId },
      });

      if (!mediaFile) {
        throw new Error(`MediaFile not found: ${mediaFileId}`);
      }

      // Check if audio file exists
      if (!existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
      }

      // Update progress: Transcribing
      await job.updateProgress(30);

      // Call Groq Whisper API
      console.log(`[Transcribe Worker] Calling Groq Whisper...`);
      const transcription = await transcribeWithGroq(audioPath, 'fr'); // Default to French

      console.log(`[Transcribe Worker] Transcription completed: ${transcription.segments.length} segments`);

      // Update progress: Saving to database
      await job.updateProgress(70);

      // Generate SRT and VTT formats
      const srtContent = segmentsToSRT(transcription.segments);
      const vttContent = segmentsToVTT(transcription.segments);

      // Check if EditedClip already exists for this media file (get most recent)
      let editedClip = await db.editedClip.findFirst({
        where: { sourceMediaId: mediaFileId },
        orderBy: { createdAt: 'desc' }, // Get most recent clip
      });

      if (!editedClip) {
        // Create new EditedClip
        editedClip = await db.editedClip.create({
          data: {
            sourceMediaId: mediaFileId,
            userId: mediaFile.userId,
            name: `${mediaFile.filename} - Transcription`,
            startTime: 0,
            endTime: mediaFile.duration || 0,
            transcription: {
              segments: transcription.segments,
              fullText: transcription.fullText,
              language: transcription.language,
              srt: srtContent,
              vtt: vttContent,
            } as any,
          },
        });

        console.log(`[Transcribe Worker] Created EditedClip: ${editedClip.id}`);
      } else {
        // Update existing EditedClip
        editedClip = await db.editedClip.update({
          where: { id: editedClip.id },
          data: {
            transcription: {
              segments: transcription.segments,
              fullText: transcription.fullText,
              language: transcription.language,
              srt: srtContent,
              vtt: vttContent,
            } as any,
          },
        });

        console.log(`[Transcribe Worker] Updated EditedClip: ${editedClip.id}`);
      }

      // Update progress: Cleanup
      await job.updateProgress(90);

      // Clean up temporary audio file
      try {
        if (existsSync(audioPath)) {
          unlinkSync(audioPath);
          console.log(`[Transcribe Worker] Cleaned up temp audio: ${audioPath}`);
        }
      } catch (cleanupError) {
        console.warn(`[Transcribe Worker] Failed to cleanup audio file:`, cleanupError);
        // Don't fail the job for cleanup errors
      }

      // Update progress: Complete
      await job.updateProgress(100);

      console.log(`✅ [Transcribe Worker] Job ${job.id} completed successfully`);

      return {
        success: true,
        clipId: editedClip.id,
        segmentCount: transcription.segments.length,
        segments: transcription.segments, // Return segments for frontend display
        language: transcription.language,
        duration: transcription.duration,
      };
    } catch (error) {
      console.error(`❌ [Transcribe Worker] Job ${job.id} failed:`, error);

      // Clean up audio file on error
      try {
        if (existsSync(audioPath)) {
          unlinkSync(audioPath);
        }
      } catch (cleanupError) {
        console.warn(`[Transcribe Worker] Failed to cleanup on error:`, cleanupError);
      }

      throw error;
    }
  },
  {
    connection: getRedisConnection(),
    concurrency: 2, // Process 2 transcription jobs in parallel
    limiter: {
      max: 10, // Max 10 jobs per duration
      duration: 60000, // 1 minute
    },
  }
);

// Event handlers
transcribeWorker.on('completed', (job, result) => {
  console.log(`✅ [Transcribe Worker] Job ${job.id} completed:`, result);
});

transcribeWorker.on('failed', (job, error) => {
  console.error(`❌ [Transcribe Worker] Job ${job?.id} failed:`, error);
});

transcribeWorker.on('active', (job) => {
  console.log(`🔄 [Transcribe Worker] Job ${job.id} started`);
});

transcribeWorker.on('progress', (job, progress) => {
  console.log(`📊 [Transcribe Worker] Job ${job.id} progress: ${progress}%`);
});

console.log('🎙️ Transcribe worker started and listening for jobs...');

export default transcribeWorker;
