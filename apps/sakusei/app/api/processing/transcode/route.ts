import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { transcodeQueue } from '@/lib/queue';

const prisma = new PrismaClient();

// Format definitions (matching ExportModal)
const FORMAT_SPECS: Record<string, { width: number; height: number; aspectRatio: string; prismaFormat: string }> = {
  tiktok: { width: 1080, height: 1920, aspectRatio: '9:16', prismaFormat: 'TIKTOK_9_16' },
  youtube: { width: 1920, height: 1080, aspectRatio: '16:9', prismaFormat: 'YOUTUBE_16_9' },
  linkedin: { width: 1920, height: 1080, aspectRatio: '16:9', prismaFormat: 'LINKEDIN_16_9' },
  instagram: { width: 1080, height: 1080, aspectRatio: '1:1', prismaFormat: 'INSTAGRAM_1_1' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clipId, formats, burnSubtitles } = body;

    console.log('[Transcode API] Request:', { clipId, formats, burnSubtitles });

    // Validate input
    if (!clipId || !formats || !Array.isArray(formats) || formats.length === 0) {
      return NextResponse.json(
        { error: 'clipId and formats array are required' },
        { status: 400 }
      );
    }

    // Validate formats
    const invalidFormats = formats.filter((f) => !FORMAT_SPECS[f]);
    if (invalidFormats.length > 0) {
      return NextResponse.json(
        { error: `Invalid formats: ${invalidFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // Get clip from database
    const clip = await prisma.editedClip.findUnique({
      where: { id: clipId },
      include: {
        sourceMedia: true,
      },
    });

    if (!clip) {
      return NextResponse.json(
        { error: `Clip not found: ${clipId}` },
        { status: 404 }
      );
    }

    // Create Export entries and jobs for each format
    const jobIds: string[] = [];
    const exportIds: string[] = [];

    for (const format of formats) {
      const spec = FORMAT_SPECS[format];

      // Create Export entry in database
      const exportEntry = await prisma.export.create({
        data: {
          clipId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          format: spec.prismaFormat as any, // Use the Prisma enum value
          resolution: `${spec.width}x${spec.height}`,
          aspectRatio: spec.aspectRatio,
          status: 'PENDING',
          progress: 0,
        },
      });

      exportIds.push(exportEntry.id);

      // Create BullMQ job
      const job = await transcodeQueue.add(
        `transcode-${format}`,
        {
          exportId: exportEntry.id,
          clipId,
          format,
          width: spec.width,
          height: spec.height,
          burnSubtitles: burnSubtitles ?? false,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      );

      jobIds.push(job.id as string);

      console.log(`[Transcode API] Created job ${job.id} for export ${exportEntry.id} (format: ${format})`);
    }

    return NextResponse.json({
      success: true,
      clipId,
      exportIds,
      jobIds,
      message: `Created ${formats.length} transcode job${formats.length > 1 ? 's' : ''}`,
    });
  } catch (error) {
    console.error('[Transcode API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
