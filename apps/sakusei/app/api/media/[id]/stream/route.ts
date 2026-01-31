import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync, existsSync } from 'fs';
import db from '@/lib/db';
import type { ReadStream } from 'fs';

type Params = Promise<{ id: string }>;

export async function GET(
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

    if (!mediaFile.vpsPath) {
      return NextResponse.json(
        { error: 'Media file has no VPS path' },
        { status: 404 }
      );
    }

    // Check if file exists
    if (!existsSync(mediaFile.vpsPath)) {
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      );
    }

    // Get file stats
    const stat = statSync(mediaFile.vpsPath);
    const fileSize = stat.size;

    // Parse range header for video streaming
    const range = request.headers.get('range');

    if (range) {
      // Handle range request (video seeking)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = createReadStream(mediaFile.vpsPath, { start, end });

      // Create a custom Web Stream with proper error handling
      const webStream = createWebStreamFromNodeStream(fileStream);

      return new NextResponse(webStream, {
        status: 206, // Partial Content
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': mediaFile.mimeType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } else {
      // Full file request
      const fileStream = createReadStream(mediaFile.vpsPath);

      // Create a custom Web Stream with proper error handling
      const webStream = createWebStreamFromNodeStream(fileStream);

      return new NextResponse(webStream, {
        status: 200,
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': mediaFile.mimeType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('[Media Stream API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Convert Node.js ReadStream to Web ReadableStream with proper error handling
 */
function createWebStreamFromNodeStream(nodeStream: ReadStream): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk: Buffer) => {
        try {
          // Only enqueue if controller is not closed
          if (controller.desiredSize !== null) {
            controller.enqueue(chunk);
          }
        } catch (error) {
          // Stream already closed, just clean up
          nodeStream.destroy();
        }
      });

      nodeStream.on('end', () => {
        try {
          controller.close();
        } catch (error) {
          // Controller already closed, ignore
        }
      });

      nodeStream.on('error', (error) => {
        try {
          controller.error(error);
        } catch (err) {
          // Controller already closed, just log
          console.warn('[Stream] Error after close:', err);
        }
        nodeStream.destroy();
      });
    },

    cancel(reason) {
      // Client cancelled the stream (e.g., video seek)
      nodeStream.destroy();
    },
  });
}
