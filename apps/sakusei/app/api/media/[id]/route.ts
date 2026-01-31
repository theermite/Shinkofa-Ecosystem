import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import db from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    const { id } = await context.params;

    // Get media file from database
    const mediaFile = await db.mediaFile.findUnique({
      where: { id },
    });

    if (!mediaFile) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    // Delete physical file if it exists on VPS
    if (mediaFile.vpsPath && existsSync(mediaFile.vpsPath)) {
      try {
        await unlink(mediaFile.vpsPath);
        console.log(`[Delete Media] VPS file deleted: ${mediaFile.vpsPath}`);
      } catch (unlinkError) {
        console.warn(`[Delete Media] Failed to delete VPS file:`, unlinkError);
        // Continue anyway - we'll delete DB record
      }
    }

    // Delete database record (cascade will delete related EditedClips)
    await db.mediaFile.delete({
      where: { id },
    });

    console.log(`[Delete Media] MediaFile deleted from DB: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Media file deleted successfully',
      deletedFile: {
        id: mediaFile.id,
        filename: mediaFile.filename,
      },
    });
  } catch (error) {
    console.error('[Delete Media API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete media file' },
      { status: 500 }
    );
  }
}
