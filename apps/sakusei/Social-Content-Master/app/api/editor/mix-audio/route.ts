import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';
import { promises as fs } from 'fs';
import { mixAudio, generateFrequencyWav } from '@/services/ffmpeg/audio-mix';
import { checkFFmpegInstalled } from '@/services/ffmpeg/cut';
import { FREQUENCY_OPTIONS, MUSIC_LIBRARY, DEFAULT_AUDIO_CONFIG } from '@/constants/audio';

export async function POST(request: NextRequest) {
  try {
    // Check if FFmpeg is installed
    const ffmpegInstalled = await checkFFmpegInstalled();
    if (!ffmpegInstalled) {
      return NextResponse.json(
        {
          error: "FFmpeg n'est pas installe sur le serveur",
          hint: 'Veuillez installer FFmpeg pour utiliser le mixage audio',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      mediaFileId,
      frequencyId,
      musicId,
      videoVolume,
      frequencyVolume,
      musicVolume,
      fadeInDuration,
      fadeOutDuration,
      customMusicPath, // For uploaded music
    } = body;

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

    // Resolve paths
    const uploadsDir = path.dirname(mediaFile.vpsPath);
    const timestamp = Date.now();
    const outputFilename = `${path.parse(mediaFile.filename).name}_mixed_${timestamp}.mp4`;
    const outputPath = path.join(uploadsDir, outputFilename);

    let backgroundMusicPath: string | undefined;
    let frequencyPath: string | undefined;

    // Get background music path
    if (musicId && musicId !== 'none') {
      const musicTrack = MUSIC_LIBRARY.find((m) => m.id === musicId);
      if (musicTrack?.url) {
        // Music is in public folder
        backgroundMusicPath = path.join(process.cwd(), 'public', musicTrack.url);

        // Verify file exists
        try {
          await fs.access(backgroundMusicPath);
        } catch {
          console.warn(`[Mix Audio] Music file not found: ${backgroundMusicPath}`);
          backgroundMusicPath = undefined;
        }
      }
    } else if (customMusicPath) {
      // Custom uploaded music
      backgroundMusicPath = customMusicPath;
    }

    // Generate frequency WAV if selected
    if (frequencyId && frequencyId !== 'none') {
      const freqOption = FREQUENCY_OPTIONS.find(
        (f) => f.value === frequencyId || f.value === Number(frequencyId)
      );

      if (freqOption && freqOption.type) {
        // Get video duration for frequency generation
        const duration = mediaFile.duration || 300; // Default 5 min if unknown

        frequencyPath = path.join(uploadsDir, `freq_${timestamp}.wav`);

        console.log(`[Mix Audio] Generating ${freqOption.name} frequency for ${duration}s`);

        const freqResult = await generateFrequencyWav(
          frequencyPath,
          typeof freqOption.value === 'number' ? freqOption.value : 432,
          duration,
          freqOption.type,
          freqOption.base,
          freqOption.offset
        );

        if (!freqResult.success) {
          console.warn(`[Mix Audio] Failed to generate frequency: ${freqResult.error}`);
          frequencyPath = undefined;
        }
      }
    }

    // Check if there's anything to mix
    if (!backgroundMusicPath && !frequencyPath && (videoVolume === undefined || videoVolume === 1)) {
      return NextResponse.json(
        { error: 'No audio modifications requested. Select music, frequency, or adjust volume.' },
        { status: 400 }
      );
    }

    console.log(`[Mix Audio] Mixing audio for ${mediaFile.filename}`);
    console.log(`[Mix Audio] Music: ${backgroundMusicPath || 'none'}`);
    console.log(`[Mix Audio] Frequency: ${frequencyPath || 'none'}`);

    // Execute mix
    const result = await mixAudio({
      videoPath: mediaFile.vpsPath,
      outputPath,
      backgroundMusicPath,
      frequencyPath,
      videoVolume: videoVolume ?? 1.0,
      musicVolume: musicVolume ?? DEFAULT_AUDIO_CONFIG.musicVolume,
      frequencyVolume: frequencyVolume ?? DEFAULT_AUDIO_CONFIG.frequencyVolume,
      fadeInDuration: fadeInDuration ?? DEFAULT_AUDIO_CONFIG.fadeInDuration,
      fadeOutDuration: fadeOutDuration ?? DEFAULT_AUDIO_CONFIG.fadeOutDuration,
      onProgress: (progress) => {
        console.log(`[Mix Audio] Progress: ${progress}%`);
      },
    });

    // Cleanup temp frequency file
    if (frequencyPath) {
      try {
        await fs.unlink(frequencyPath);
      } catch {
        // Ignore cleanup errors
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Audio mixing failed' },
        { status: 500 }
      );
    }

    // Create MediaFile for the mixed video
    const mixedMediaFile = await db.mediaFile.create({
      data: {
        userId: mediaFile.userId,
        filename: outputFilename,
        mimeType: mediaFile.mimeType,
        fileSize: BigInt(result.fileSize || 0),
        duration: Math.floor(result.duration || mediaFile.duration || 0),
        width: mediaFile.width,
        height: mediaFile.height,
        vpsPath: result.outputPath,
        cdnUrl: null,
        thumbnailUrl: null,
        folder: 'EDITED_ANGE',
        tags: ['mixed', 'audio', ...(frequencyId ? ['frequency'] : []), ...(musicId ? ['music'] : [])],
        status: 'READY',
        ftpStatus: 'PENDING',
        progress: 100,
      },
    });

    console.log(`[Mix Audio] Success! Output: ${result.outputPath}`);

    return NextResponse.json({
      success: true,
      mediaFile: {
        id: mixedMediaFile.id,
        filename: mixedMediaFile.filename,
        vpsPath: mixedMediaFile.vpsPath,
        fileSize: Number(mixedMediaFile.fileSize),
      },
      audioConfig: {
        frequency: frequencyId,
        music: musicId,
        videoVolume,
        frequencyVolume,
        musicVolume,
        fadeIn: fadeInDuration,
        fadeOut: fadeOutDuration,
      },
      processingTime: result.processingTime,
    });
  } catch (error) {
    console.error('[Mix Audio API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
