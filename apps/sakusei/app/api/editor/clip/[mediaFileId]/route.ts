import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

type Params = Promise<{ mediaFileId: string }>;

/**
 * GET /api/editor/clip/[mediaFileId]
 * Load EditedClip with transcription for a media file
 */
export async function GET(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    const { mediaFileId } = await context.params;

    if (!mediaFileId) {
      return NextResponse.json(
        { error: 'mediaFileId is required' },
        { status: 400 }
      );
    }

    // Find EditedClip for this media file with transcription
    // Priority: most recent with transcription, fallback to most recent
    let editedClip = await db.editedClip.findFirst({
      where: {
        sourceMediaId: mediaFileId,
        transcription: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If no clip with transcription, get most recent
    if (!editedClip) {
      editedClip = await db.editedClip.findFirst({
        where: { sourceMediaId: mediaFileId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!editedClip) {
      return NextResponse.json(
        { clip: null, hasTranscription: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      clip: {
        id: editedClip.id,
        name: editedClip.name,
        startTime: editedClip.startTime,
        endTime: editedClip.endTime,
        transcription: editedClip.transcription,
      },
      hasTranscription: !!editedClip.transcription,
    });
  } catch (error) {
    console.error('[Editor Clip API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load clip' },
      { status: 500 }
    );
  }
}
