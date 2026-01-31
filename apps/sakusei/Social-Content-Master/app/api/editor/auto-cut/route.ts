import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';
import { detectSilence, speechSegmentsToTimelineSegments } from '@/services/ffmpeg/silence-detect';
import { concatenateSegments } from '@/services/ffmpeg/concat';
import { checkFFmpegInstalled } from '@/services/ffmpeg/cut';
import { SILENCE_DETECTION_CONFIG } from '@/constants/audio';

/**
 * Auto-cut API: Detect silence, remove blanks, create new video
 *
 * This endpoint:
 * 1. Detects silent segments in the video
 * 2. Concatenates speech segments (removes silence)
 * 3. Creates a new MediaFile with the cut video
 * 4. Returns the new video for use in the editor
 */
export async function POST(request: NextRequest) {
  try {
    // Check if FFmpeg is installed
    const ffmpegInstalled = await checkFFmpegInstalled();
    if (!ffmpegInstalled) {
      return NextResponse.json(
        {
          error: "FFmpeg n'est pas installe sur le serveur",
          hint: 'Veuillez installer FFmpeg pour utiliser l\'auto-cut',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { mediaFileId, silenceThreshold, minSilenceDuration } = body;

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

    console.log(`[Auto-Cut] Starting for ${mediaFile.filename}`);

    // Step 1: Detect silence
    console.log('[Auto-Cut] Step 1: Detecting silence...');
    const silenceResult = await detectSilence({
      inputPath: mediaFile.vpsPath,
      silenceThreshold: silenceThreshold ?? SILENCE_DETECTION_CONFIG.silenceThreshold,
      minSilenceDuration: minSilenceDuration ?? SILENCE_DETECTION_CONFIG.minSilenceDuration,
    });

    if (!silenceResult.success) {
      return NextResponse.json(
        { error: silenceResult.error || 'Silence detection failed' },
        { status: 500 }
      );
    }

    // Convert to timeline segments
    const timelineSegments = speechSegmentsToTimelineSegments(
      silenceResult.speechSegments || [],
      SILENCE_DETECTION_CONFIG.minSegmentDuration
    );

    console.log(`[Auto-Cut] Found ${timelineSegments.length} speech segments`);

    if (timelineSegments.length === 0) {
      return NextResponse.json(
        { error: 'No speech segments found. The video might be entirely silent.' },
        { status: 400 }
      );
    }

    // If only 1 segment covering most of the video, no need to cut
    const totalSpeechDuration = timelineSegments.reduce(
      (sum, seg) => sum + (seg.endTime - seg.startTime),
      0
    );
    const silencePercentage = silenceResult.totalDuration
      ? Math.round((silenceResult.totalSilence! / silenceResult.totalDuration) * 100)
      : 0;

    if (silencePercentage < 5) {
      return NextResponse.json({
        success: true,
        noChanges: true,
        message: 'Less than 5% silence detected. No cuts needed.',
        stats: {
          totalDuration: silenceResult.totalDuration,
          totalSilence: silenceResult.totalSilence,
          silencePercentage,
          segmentsCount: timelineSegments.length,
        },
      });
    }

    // Step 2: Concatenate speech segments (remove silence)
    console.log('[Auto-Cut] Step 2: Concatenating speech segments...');

    const timestamp = Date.now();
    const outputFilename = `${path.parse(mediaFile.filename).name}_autocut_${timestamp}.mp4`;
    const outputPath = path.join(path.dirname(mediaFile.vpsPath), outputFilename);

    // Convert to TimelineSegment format for concat
    const segmentsForConcat = timelineSegments.map((seg, index) => ({
      id: `seg-${index}`,
      startTime: seg.startTime,
      endTime: seg.endTime,
      isDeleted: false,
      createdAt: Date.now() + index,
    }));

    const concatResult = await concatenateSegments({
      inputPath: mediaFile.vpsPath,
      outputPath,
      segments: segmentsForConcat,
      onProgress: (progress) => {
        console.log(`[Auto-Cut] Concat progress: ${progress}%`);
      },
    });

    console.log(`[Auto-Cut] Concatenation complete: ${concatResult.outputPath}`);

    // Step 3: Create new MediaFile for the cut video
    const cutMediaFile = await db.mediaFile.create({
      data: {
        userId: mediaFile.userId,
        filename: outputFilename,
        mimeType: mediaFile.mimeType,
        fileSize: BigInt(concatResult.fileSize),
        duration: Math.floor(concatResult.duration),
        width: mediaFile.width,
        height: mediaFile.height,
        vpsPath: concatResult.outputPath,
        cdnUrl: null,
        thumbnailUrl: null,
        folder: 'EDITED_ANGE',
        tags: ['autocut', 'silence-removed'],
        status: 'READY',
        ftpStatus: 'PENDING',
        progress: 100,
      },
    });

    // Step 4: Create EditedClip record linking source to cut
    const editedClip = await db.editedClip.create({
      data: {
        userId: mediaFile.userId,
        sourceMediaId: mediaFile.id,
        cutMediaFileId: cutMediaFile.id,
        name: `Auto-cut ${new Date().toLocaleDateString()}`,
        startTime: 0,
        endTime: concatResult.duration,
        transcription: null,
        subtitleStyle: null,
      },
    });

    console.log(`[Auto-Cut] Complete! New video: ${cutMediaFile.id}`);

    return NextResponse.json({
      success: true,
      // New video to use in editor
      newMediaFile: {
        id: cutMediaFile.id,
        filename: cutMediaFile.filename,
        duration: cutMediaFile.duration,
        url: `/api/media/${cutMediaFile.id}/stream`,
      },
      // Stats
      stats: {
        originalDuration: silenceResult.totalDuration,
        newDuration: concatResult.duration,
        silenceRemoved: silenceResult.totalSilence,
        silencePercentage,
        segmentsCount: timelineSegments.length,
        timeSaved: Math.round(silenceResult.totalSilence || 0),
      },
      editedClip: {
        id: editedClip.id,
        name: editedClip.name,
      },
      processingTime: concatResult.processingTime,
    });
  } catch (error) {
    console.error('[Auto-Cut API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
