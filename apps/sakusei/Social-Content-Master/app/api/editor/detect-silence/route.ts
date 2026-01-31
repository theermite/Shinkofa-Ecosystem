import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { detectSilence, speechSegmentsToTimelineSegments } from '@/services/ffmpeg/silence-detect';
import { checkFFmpegInstalled } from '@/services/ffmpeg/cut';
import { SILENCE_DETECTION_CONFIG } from '@/constants/audio';

export async function POST(request: NextRequest) {
  try {
    // Check if FFmpeg is installed
    const ffmpegInstalled = await checkFFmpegInstalled();
    if (!ffmpegInstalled) {
      return NextResponse.json(
        {
          error: "FFmpeg n'est pas installe sur le serveur",
          hint: 'Veuillez installer FFmpeg pour utiliser la detection de silence',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { mediaFileId, silenceThreshold, minSilenceDuration, minSegmentDuration } = body;

    // Validate request
    if (!mediaFileId) {
      return NextResponse.json(
        { error: 'Missing required field: mediaFileId' },
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

    console.log(`[Silence Detection] Analyzing ${mediaFile.filename}`);

    // Run silence detection
    const result = await detectSilence({
      inputPath: mediaFile.vpsPath,
      silenceThreshold: silenceThreshold ?? SILENCE_DETECTION_CONFIG.silenceThreshold,
      minSilenceDuration: minSilenceDuration ?? SILENCE_DETECTION_CONFIG.minSilenceDuration,
      onProgress: (progress) => {
        console.log(`[Silence Detection] Progress: ${progress}%`);
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Silence detection failed' },
        { status: 500 }
      );
    }

    // Convert speech segments to timeline format
    const timelineSegments = speechSegmentsToTimelineSegments(
      result.speechSegments || [],
      minSegmentDuration ?? SILENCE_DETECTION_CONFIG.minSegmentDuration
    );

    console.log(
      `[Silence Detection] Found ${result.silentSegments?.length || 0} silent segments, ` +
      `${timelineSegments.length} speech segments`
    );

    return NextResponse.json({
      success: true,
      silentSegments: result.silentSegments,
      speechSegments: result.speechSegments,
      timelineSegments, // Ready-to-use segments for timeline
      stats: {
        totalDuration: result.totalDuration,
        totalSilence: result.totalSilence,
        silencePercentage: result.totalDuration
          ? Math.round((result.totalSilence! / result.totalDuration) * 100)
          : 0,
        silentSegmentsCount: result.silentSegments?.length || 0,
        speechSegmentsCount: timelineSegments.length,
      },
    });
  } catch (error) {
    console.error('[Silence Detection API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
