import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ftpQueue } from '@/lib/queue';

export async function POST(request: NextRequest) {
  try {
    const { mediaFileId } = await request.json();

    if (!mediaFileId) {
      return NextResponse.json(
        { error: 'mediaFileId is required' },
        { status: 400 }
      );
    }

    // Get MediaFile from database
    const mediaFile = await db.mediaFile.findUnique({
      where: { id: mediaFileId },
    });

    if (!mediaFile) {
      return NextResponse.json(
        { error: 'MediaFile not found' },
        { status: 404 }
      );
    }

    // Validate MediaFile state
    if (!mediaFile.vpsPath) {
      return NextResponse.json(
        { error: 'MediaFile has no VPS path. Upload file first.' },
        { status: 400 }
      );
    }

    if (mediaFile.ftpStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: 'File already transferred to CDN', cdnUrl: mediaFile.cdnUrl },
        { status: 400 }
      );
    }

    if (mediaFile.ftpStatus === 'TRANSFERRING') {
      return NextResponse.json(
        { error: 'Transfer already in progress' },
        { status: 409 }
      );
    }

    // Add job to FTP queue
    const job = await ftpQueue.add(
      `ftp-transfer-${mediaFileId}`,
      {
        mediaFileId: mediaFile.id,
        vpsPath: mediaFile.vpsPath,
        filename: mediaFile.filename,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    console.log(`[FTP API] Job ${job.id} created for file: ${mediaFile.filename}`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'FTP transfer job created',
      mediaFileId: mediaFile.id,
    });
  } catch (error) {
    console.error('[FTP API] Error creating transfer job:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create FTP transfer job' },
      { status: 500 }
    );
  }
}
