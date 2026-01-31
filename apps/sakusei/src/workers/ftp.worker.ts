// Load environment variables from .env.local
import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.cwd(), '.env.local') });

import { Worker, Job } from 'bullmq';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import db from '@/lib/db';
import { FTPTransferJob } from '@/lib/queue';
import { uploadToO2Switch } from '@/services/ftp/o2switch';

// Get Redis connection options
const getRedisConnection = () => ({
  host: 'localhost',
  port: 6380,
  maxRetriesPerRequest: 3,
});

// Create FTP worker
export const ftpWorker = new Worker<FTPTransferJob>(
  'ftp-transfer',
  async (job: Job<FTPTransferJob>) => {
    const { mediaFileId, vpsPath, filename } = job.data;

    console.log(`[FTP Worker] Processing job ${job.id} for file: ${filename}`);

    try {
      // Update job progress
      await job.updateProgress(10);

      // Check if file exists
      if (!existsSync(vpsPath)) {
        throw new Error(`File not found: ${vpsPath}`);
      }

      // Update MediaFile status to PROCESSING
      await db.mediaFile.update({
        where: { id: mediaFileId },
        data: { ftpStatus: 'TRANSFERRING' },
      });

      await job.updateProgress(25);

      // Upload to O2Switch
      console.log(`[FTP Worker] Uploading ${filename} to O2Switch...`);
      const result = await uploadToO2Switch(vpsPath, filename);

      if (!result.success) {
        throw new Error(result.error || 'FTP upload failed');
      }

      await job.updateProgress(75);

      // Update MediaFile with CDN URL
      await db.mediaFile.update({
        where: { id: mediaFileId },
        data: {
          cdnUrl: result.cdnUrl,
          ftpStatus: 'COMPLETED',
        },
      });

      console.log(`[FTP Worker] CDN URL updated: ${result.cdnUrl}`);

      await job.updateProgress(90);

      // Cleanup VPS file
      try {
        await unlink(vpsPath);
        console.log(`[FTP Worker] VPS file deleted: ${vpsPath}`);
      } catch (unlinkError) {
        console.warn(`[FTP Worker] Failed to delete VPS file: ${unlinkError}`);
        // Non-critical error, don't fail the job
      }

      await job.updateProgress(100);

      return {
        success: true,
        cdnUrl: result.cdnUrl,
        duration: result.duration,
      };
    } catch (error) {
      console.error(`[FTP Worker] Job ${job.id} failed:`, error);

      // Update MediaFile status to FAILED
      await db.mediaFile.update({
        where: { id: mediaFileId },
        data: { ftpStatus: 'FAILED' },
      });

      throw error; // Re-throw to mark job as failed
    }
  },
  {
    connection: getRedisConnection(),
    concurrency: 3, // Process max 3 FTP uploads at once
    limiter: {
      max: 5, // Max 5 jobs
      duration: 10000, // per 10 seconds
    },
  }
);

// Worker event handlers
ftpWorker.on('completed', (job) => {
  console.log(`✅ [FTP Worker] Job ${job.id} completed`);
});

ftpWorker.on('failed', (job, err) => {
  console.error(`❌ [FTP Worker] Job ${job?.id} failed:`, err.message);
});

ftpWorker.on('error', (err) => {
  console.error('❌ [FTP Worker] Worker error:', err);
});

console.log('✅ FTP Worker started');

export default ftpWorker;
