import { Queue, QueueOptions } from 'bullmq';

// Get Redis connection options
const getRedisConnection = () => {
  return {
    host: 'localhost',
    port: 6380,
    maxRetriesPerRequest: 3,
  };
};

// Queue configuration
const queueConfig: QueueOptions = {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 50, // Keep last 50 failed jobs
      age: 7 * 24 * 3600, // 7 days
    },
  },
};

// Job Types
export interface FTPTransferJob {
  mediaFileId: string;
  vpsPath: string;
  filename: string;
}

export interface TranscribeJob {
  mediaFileId: string;
  audioPath: string;
  provider: 'groq' | 'assemblyai' | 'deepseek';
}

export interface TranscodeJob {
  clipId: string;
  exportId: string;
  format: string;
  width: number;
  height: number;
  burnSubtitles: boolean;
}

// Create queues
export const ftpQueue = new Queue<FTPTransferJob>('ftp-transfer', queueConfig);
export const transcribeQueue = new Queue<TranscribeJob>('transcribe', queueConfig);
export const transcodeQueue = new Queue<TranscodeJob>('transcode', queueConfig);

// Queue health check
export async function getQueuesHealth() {
  const [ftpHealth, transcribeHealth, transcodeHealth] = await Promise.all([
    ftpQueue.getJobCounts(),
    transcribeQueue.getJobCounts(),
    transcodeQueue.getJobCounts(),
  ]);

  return {
    ftp: ftpHealth,
    transcribe: transcribeHealth,
    transcode: transcodeHealth,
  };
}

console.log('✅ BullMQ queues initialized');
