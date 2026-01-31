import { NextRequest, NextResponse } from 'next/server';
import { ftpQueue, transcribeQueue, transcodeQueue } from '@/lib/queue';
import { Queue } from 'bullmq';

type Params = Promise<{ jobId: string }>;

export async function GET(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    const { jobId } = await context.params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    // Try to find job in all queues
    const queues: Queue[] = [ftpQueue, transcribeQueue, transcodeQueue];
    let job = null;
    let queueName = '';

    for (const queue of queues) {
      const foundJob = await queue.getJob(jobId);
      if (foundJob) {
        job = foundJob;
        queueName = queue.name;
        break;
      }
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get job state and progress
    const state = await job.getState();
    const progress = job.progress || 0; // Progress is a number (0-100)
    const returnValue = job.returnvalue;
    const failedReason = job.failedReason;

    // Build response
    const response: Record<string, unknown> = {
      jobId: job.id,
      queue: queueName,
      state,
      progress,
      data: job.data,
      timestamp: job.timestamp,
    };

    // Add state-specific data
    if (state === 'completed' && returnValue) {
      response.result = returnValue;
    }

    if (state === 'failed' && failedReason) {
      response.failedReason = failedReason;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Job Status API] Error fetching job status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
