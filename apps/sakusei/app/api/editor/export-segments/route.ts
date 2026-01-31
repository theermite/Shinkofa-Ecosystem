import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';
import { concatenateSegments, filterTranscriptionForSegments } from '@/services/ffmpeg/concat';
import { checkFFmpegInstalled } from '@/services/ffmpeg/cut';
import type { TimelineSegment } from '@/types/timeline';

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

    const { mediaFileId, segments, clipName } = await request.json();

    // Validate request
    if (!mediaFileId || !segments || !Array.isArray(segments)) {
      return NextResponse.json(
        { error: 'Missing required fields: mediaFileId, segments' },
        { status: 400 }
      );
    }

    // Validate segments
    const activeSegments = (segments as TimelineSegment[]).filter((s) => !s.isDeleted);

    if (activeSegments.length === 0) {
      return NextResponse.json(
        { error: 'No active segments to export' },
        { status: 400 }
      );
    }

    // Validate segment durations
    const MIN_DURATION = 0.1; // 100ms minimum
    for (const segment of activeSegments) {
      if (segment.endTime - segment.startTime < MIN_DURATION) {
        return NextResponse.json(
          { error: `Segment ${segment.id} is too short (min ${MIN_DURATION}s)` },
          { status: 400 }
        );
      }
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
    const timestamp = Date.now();
    const outputFilename = `${path.parse(mediaFile.filename).name}_segments_${timestamp}.mp4`;
    const outputPath = path.join(path.dirname(mediaFile.vpsPath), outputFilename);

    console.log(`[Export Segments] Concatenating ${activeSegments.length} segments from ${mediaFile.filename}`);

    // Execute FFmpeg concatenation
    const result = await concatenateSegments({
      inputPath: mediaFile.vpsPath,
      outputPath,
      segments: activeSegments,
      onProgress: (progress) => {
        console.log(`[Export Segments] Progress: ${progress}%`);
      },
    });

    console.log(`[Export Segments] Success! Output: ${result.outputPath}`);

    // Create MediaFile for the concatenated video
    const concatMediaFile = await db.mediaFile.create({
      data: {
        userId: mediaFile.userId,
        filename: outputFilename,
        mimeType: mediaFile.mimeType,
        fileSize: BigInt(result.fileSize),
        duration: Math.floor(result.duration),
        width: mediaFile.width,
        height: mediaFile.height,
        vpsPath: result.outputPath,
        cdnUrl: null,
        thumbnailUrl: null,
        folder: 'EDITED_ANGE',
        tags: ['segments', 'concat', 'edited'],
        status: 'READY',
        ftpStatus: 'PENDING',
        progress: 100,
      },
    });

    // Find existing EditedClip with transcription for this source media
    const existingClipWithTranscription = await db.editedClip.findFirst({
      where: {
        sourceMediaId: mediaFile.id,
        transcription: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      select: { transcription: true },
    });

    // Filter and adjust transcription for the segments
    let filteredTranscription = null;
    if (existingClipWithTranscription?.transcription) {
      try {
        filteredTranscription = filterTranscriptionForSegments(
          existingClipWithTranscription.transcription as any,
          activeSegments
        );
        console.log(
          `[Export Segments] Filtered transcription: ${filteredTranscription?.segments?.length || 0} segments`
        );
      } catch (error) {
        console.warn('[Export Segments] Failed to filter transcription:', error);
        filteredTranscription = null;
      }
    }

    // Store segments in transcription JSON (extended format)
    const extendedTranscription = {
      ...(filteredTranscription || { segments: [] }),
      timelineSegments: activeSegments, // Store timeline segments for future editing
    };

    // Create EditedClip record
    const editedClip = await db.editedClip.create({
      data: {
        userId: mediaFile.userId,
        sourceMediaId: mediaFile.id,
        cutMediaFileId: concatMediaFile.id,
        name: clipName || `Clip Segments ${new Date().toLocaleDateString()}`,
        startTime: activeSegments[0].startTime,
        endTime: activeSegments[activeSegments.length - 1].endTime,
        transcription: extendedTranscription,
        subtitleStyle: null,
      },
    });

    return NextResponse.json({
      success: true,
      editedClip: {
        id: editedClip.id,
        name: editedClip.name,
        segments: activeSegments.length,
        duration: result.duration,
      },
      mediaFile: {
        id: concatMediaFile.id,
        filename: concatMediaFile.filename,
        vpsPath: concatMediaFile.vpsPath,
        fileSize: Number(concatMediaFile.fileSize),
      },
      processingTime: result.processingTime,
    });
  } catch (error) {
    console.error('[Export Segments API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
