import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';
import { cutVideo, generateCutFilename, checkFFmpegInstalled } from '@/services/ffmpeg/cut';
import { filterTranscriptionByTimeRange } from '@/utils/transcription';

export async function POST(request: NextRequest) {
  try {
    // Check if FFmpeg is installed
    const ffmpegInstalled = await checkFFmpegInstalled();
    if (!ffmpegInstalled) {
      return NextResponse.json(
        {
          error: 'FFmpeg n\'est pas installé sur le serveur',
          hint: 'Veuillez installer FFmpeg pour utiliser la fonctionnalité d\'édition vidéo',
          installInstructions: {
            windows: 'Téléchargez FFmpeg depuis https://ffmpeg.org/download.html#build-windows',
            linux: 'sudo apt-get install ffmpeg',
            mac: 'brew install ffmpeg',
          },
        },
        { status: 503 }
      );
    }

    const { mediaFileId, startTime, endTime, clipName } = await request.json();

    // Validate request
    if (!mediaFileId || startTime === undefined || endTime === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: mediaFileId, startTime, endTime' },
        { status: 400 }
      );
    }

    if (startTime < 0 || endTime <= startTime) {
      return NextResponse.json(
        { error: 'Invalid trim points: endTime must be greater than startTime' },
        { status: 400 }
      );
    }

    // Get source media file
    const mediaFile = await db.mediaFile.findUnique({
      where: { id: mediaFileId },
    });

    if (!mediaFile) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    if (!mediaFile.vpsPath) {
      return NextResponse.json(
        { error: 'Media file has no VPS path. Upload or transfer file first.' },
        { status: 400 }
      );
    }

    // Generate output filename
    const outputFilename = generateCutFilename(mediaFile.filename, startTime, endTime);
    const outputPath = path.join(path.dirname(mediaFile.vpsPath), outputFilename);

    console.log(`[Editor Cut] Cutting ${mediaFile.filename}: ${startTime}s - ${endTime}s`);

    // Execute FFmpeg cut
    const duration = endTime - startTime;
    const result = await cutVideo({
      inputPath: mediaFile.vpsPath,
      outputPath,
      startTime,
      duration,
      onProgress: (progress) => {
        console.log(`[Editor Cut] Progress: ${progress}%`);
      },
    });

    if (!result.success) {
      console.error('[Editor Cut] Failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to cut video' },
        { status: 500 }
      );
    }

    console.log(`[Editor Cut] Success! Output: ${result.outputPath}`);

    // First, create MediaFile for the cut video
    const cutMediaFile = await db.mediaFile.create({
      data: {
        userId: mediaFile.userId,
        filename: outputFilename,
        mimeType: mediaFile.mimeType,
        fileSize: BigInt(result.fileSize || 0),
        duration: Math.floor(duration),
        width: mediaFile.width,
        height: mediaFile.height,
        vpsPath: result.outputPath,
        cdnUrl: null,
        thumbnailUrl: null,
        folder: 'EDITED_ANGE',
        tags: ['cut', 'edited'],
        status: 'READY',
        ftpStatus: 'PENDING',
        progress: 100,
      },
    });

    // Find existing EditedClip with transcription for this source media (to copy subtitles)
    const existingClipWithTranscription = await db.editedClip.findFirst({
      where: {
        sourceMediaId: mediaFile.id,
        transcription: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      select: { transcription: true },
    });

    // Filter and adjust transcription for the cut time range
    let filteredTranscription = null;
    if (existingClipWithTranscription?.transcription) {
      try {
        filteredTranscription = filterTranscriptionByTimeRange(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          existingClipWithTranscription.transcription as any,
          startTime,
          endTime
        );
        console.log(`[Editor Cut] Filtered transcription: ${filteredTranscription.segments.length} segments (${startTime}s-${endTime}s)`);
      } catch (error) {
        console.warn('[Editor Cut] Failed to filter transcription:', error);
        // Fallback to null if filtering fails (better than using unfiltered data)
        filteredTranscription = null;
      }
    }

    // Create EditedClip record with cutMediaFile reference
    // Use filtered transcription (adjusted timestamps relative to cut)
    const editedClip = await db.editedClip.create({
      data: {
        userId: mediaFile.userId,
        sourceMediaId: mediaFile.id,
        cutMediaFileId: cutMediaFile.id, // Link to cut media file
        name: clipName || `Clip ${new Date().toLocaleDateString()}`,
        startTime,
        endTime,
        transcription: filteredTranscription, // Filtered and adjusted transcription
        subtitleStyle: null,
      },
    });

    return NextResponse.json({
      success: true,
      editedClip: {
        id: editedClip.id,
        name: editedClip.name,
        startTime: editedClip.startTime,
        endTime: editedClip.endTime,
        duration,
      },
      mediaFile: {
        id: cutMediaFile.id,
        filename: cutMediaFile.filename,
        vpsPath: cutMediaFile.vpsPath,
        fileSize: Number(cutMediaFile.fileSize),
      },
      processingTime: result.duration,
    });
  } catch (error) {
    console.error('[Editor Cut API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
