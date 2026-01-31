import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { transcribeQueue } from '@/lib/queue';
import { extractAudio, isAudioOnly } from '@/services/ffmpeg/extract-audio';
import { existsSync } from 'fs';
import { copyFileSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { mediaFileId, provider = 'groq' } = await request.json();

    if (!mediaFileId) {
      return NextResponse.json(
        { error: 'mediaFileId is required' },
        { status: 400 }
      );
    }

    console.log(`\n🎙️ [Transcribe API] Starting transcription for MediaFile: ${mediaFileId}`);

    // Get MediaFile from database
    const mediaFile = await db.mediaFile.findUnique({
      where: { id: mediaFileId },
    });

    if (!mediaFile) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    if (!mediaFile.vpsPath || !existsSync(mediaFile.vpsPath)) {
      return NextResponse.json(
        { error: 'Media file not found on disk' },
        { status: 404 }
      );
    }

    // Check if file is video or audio
    const isAudio = await isAudioOnly(mediaFile.vpsPath);
    let audioPath: string;

    if (isAudio) {
      // Audio file: create a temporary copy (Groq requires File object)
      const tempDir = path.join(process.cwd(), 'uploads', 'temp');
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      audioPath = path.join(tempDir, `audio_${timestamp}_${random}.mp3`);

      console.log(`[Transcribe API] Audio file detected, copying to temp: ${audioPath}`);
      copyFileSync(mediaFile.vpsPath, audioPath);
    } else {
      // Video file: extract audio
      console.log(`[Transcribe API] Video file detected, extracting audio...`);
      audioPath = await extractAudio(mediaFile.vpsPath);
      console.log(`[Transcribe API] Audio extracted: ${audioPath}`);
    }

    // Create BullMQ job
    const job = await transcribeQueue.add(
      'transcribe-media',
      {
        mediaFileId,
        audioPath,
        provider: provider as 'groq' | 'assemblyai' | 'deepseek',
      },
      {
        removeOnComplete: {
          age: 300, // Keep completed jobs for 5 minutes
          count: 10,
        },
        removeOnFail: false,
      }
    );

    console.log(`[Transcribe API] BullMQ job created: ${job.id}`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Transcription job created. Poll /api/processing/status/{jobId} for progress.',
    });
  } catch (error) {
    console.error('[Transcribe API] Error:', error);

    // Handle FFmpeg errors
    if (error instanceof Error) {
      if (error.message.includes('ffmpeg')) {
        return NextResponse.json(
          {
            error: 'FFmpeg error during audio extraction',
            details: error.message,
            installInstructions: {
              windows: 'Download from https://ffmpeg.org/download.html and add to PATH',
              linux: 'sudo apt install ffmpeg',
              mac: 'brew install ffmpeg',
            },
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}
