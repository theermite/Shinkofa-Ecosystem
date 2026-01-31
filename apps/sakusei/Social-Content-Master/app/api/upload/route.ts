import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import db from '@/lib/db';
import { extractMetadata } from '@/services/ffmpeg/metadata';

// Helper to get file extension
function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
  };
  return map[mimeType] || 'bin';
}

// Helper to generate unique filename
function generateFilename(originalName: string, mimeType: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = getExtension(mimeType);
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  return `${baseName}_${timestamp}_${random}.${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get default user (Jay) - TODO: Replace with NextAuth session
    const defaultUser = await db.user.findFirst({
      where: { email: 'jaygonc@gmail.com' }
    });

    if (!defaultUser) {
      return NextResponse.json(
        { error: 'Default user not found. Run: npm run db:seed' },
        { status: 500 }
      );
    }

    // Validate file size (max 2GB for now)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_SIZE / 1024 / 1024 / 1024}GB` },
        { status: 400 }
      );
    }

    // Validate MIME type
    const allowedTypes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/ogg',
      'audio/webm',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = generateFilename(file.name, file.type);
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    console.log('[Upload] File saved, extracting metadata...');

    // Extract metadata for video/audio files
    let metadata = null;
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      try {
        metadata = await extractMetadata(filepath);
        console.log('[Upload] Metadata extracted:', metadata);
      } catch (metadataError) {
        console.warn('[Upload] Failed to extract metadata:', metadataError);
        // Continue anyway, metadata will be null
      }
    }

    // Create MediaFile record in database
    const mediaFile = await db.mediaFile.create({
      data: {
        userId: defaultUser.id,
        filename: file.name,
        mimeType: file.type,
        fileSize: BigInt(file.size),
        duration: metadata?.duration || null,
        width: metadata?.width || null,
        height: metadata?.height || null,
        vpsPath: filepath,
        folder: 'RAW_JAY',
        tags: [],
        status: 'UPLOADED',
        ftpStatus: 'PENDING',
        progress: 100,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: mediaFile.id,
        filename: mediaFile.filename,
        size: file.size,
        type: file.type,
        path: filepath,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
