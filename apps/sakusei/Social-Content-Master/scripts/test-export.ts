import 'dotenv/config';
import db from '@/lib/db';
import { transcodeQueue } from '@/lib/queue';
import path from 'path';
import fs from 'fs/promises';

async function testExport() {
  console.log('🧪 Testing multi-format export with subtitle burn-in...\n');

  try {
    // 1. Find a clip with transcription
    console.log('1. Finding clip with transcription...');
    const clip = await db.editedClip.findFirst({
      where: {
        transcription: { not: null },
      },
      include: {
        sourceMedia: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!clip) {
      console.error('❌ No clip with transcription found');
      process.exit(1);
    }

    console.log(`✅ Found clip: ${clip.name} (ID: ${clip.id})`);
    console.log(`   Transcription segments: ${(clip.transcription as any)?.segments?.length || 0}`);
    console.log(`   Source media: ${clip.sourceMedia?.filename}`);

    // 2. Clean old failed exports for this clip
    console.log('\n2. Cleaning old failed exports...');
    const deleted = await db.export.deleteMany({
      where: {
        clipId: clip.id,
        status: 'FAILED',
      },
    });
    console.log(`✅ Deleted ${deleted.count} failed exports`);

    // 3. Create two exports (TikTok + YouTube)
    console.log('\n3. Creating exports...');

    const tiktokExport = await db.export.create({
      data: {
        clipId: clip.id,
        format: 'TIKTOK_9_16',
        resolution: '1080x1920',
        aspectRatio: '9:16',
        status: 'PENDING',
        progress: 0,
      },
    });
    console.log(`✅ Created TikTok export: ${tiktokExport.id}`);

    const youtubeExport = await db.export.create({
      data: {
        clipId: clip.id,
        format: 'YOUTUBE_16_9',
        resolution: '1920x1080',
        aspectRatio: '16:9',
        status: 'PENDING',
        progress: 0,
      },
    });
    console.log(`✅ Created YouTube export: ${youtubeExport.id}`);

    // 4. Add jobs to transcode queue
    console.log('\n4. Adding jobs to transcode queue...');

    const tiktokJob = await transcodeQueue.add('transcode-video', {
      exportId: tiktokExport.id,
      clipId: clip.id,
      format: 'tiktok',
      width: 1080,
      height: 1920,
      burnSubtitles: true,
    });
    console.log(`✅ Added TikTok job: ${tiktokJob.id}`);

    const youtubeJob = await transcodeQueue.add('transcode-video', {
      exportId: youtubeExport.id,
      clipId: clip.id,
      format: 'youtube',
      width: 1920,
      height: 1080,
      burnSubtitles: true,
    });
    console.log(`✅ Added YouTube job: ${youtubeJob.id}`);

    // 5. Wait for jobs to complete
    console.log('\n5. Waiting for jobs to complete...');
    console.log('   (This may take a few minutes depending on video length)');

    let tiktokComplete = false;
    let youtubeComplete = false;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5s intervals)

    while ((!tiktokComplete || !youtubeComplete) && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s
      attempts++;

      // Check TikTok export
      if (!tiktokComplete) {
        const tiktokStatus = await db.export.findUnique({
          where: { id: tiktokExport.id },
        });
        if (tiktokStatus?.status === 'COMPLETED') {
          tiktokComplete = true;
          console.log(`✅ TikTok export completed (${tiktokStatus.progress}%)`);
        } else if (tiktokStatus?.status === 'FAILED') {
          console.error(`❌ TikTok export failed`);
          tiktokComplete = true;
        } else {
          console.log(`   TikTok: ${tiktokStatus?.progress}%`);
        }
      }

      // Check YouTube export
      if (!youtubeComplete) {
        const youtubeStatus = await db.export.findUnique({
          where: { id: youtubeExport.id },
        });
        if (youtubeStatus?.status === 'COMPLETED') {
          youtubeComplete = true;
          console.log(`✅ YouTube export completed (${youtubeStatus.progress}%)`);
        } else if (youtubeStatus?.status === 'FAILED') {
          console.error(`❌ YouTube export failed`);
          youtubeComplete = true;
        } else {
          console.log(`   YouTube: ${youtubeStatus?.progress}%`);
        }
      }
    }

    // 6. Verify files exist
    console.log('\n6. Verifying exported files...');

    const finalTiktok = await db.export.findUnique({
      where: { id: tiktokExport.id },
    });
    const finalYoutube = await db.export.findUnique({
      where: { id: youtubeExport.id },
    });

    if (finalTiktok?.vpsPath) {
      try {
        const stats = await fs.stat(finalTiktok.vpsPath);
        console.log(`✅ TikTok file exists: ${finalTiktok.vpsPath}`);
        console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      } catch (err) {
        console.error(`❌ TikTok file not found: ${finalTiktok.vpsPath}`);
      }
    } else {
      console.error('❌ TikTok export has no vpsPath');
    }

    if (finalYoutube?.vpsPath) {
      try {
        const stats = await fs.stat(finalYoutube.vpsPath);
        console.log(`✅ YouTube file exists: ${finalYoutube.vpsPath}`);
        console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      } catch (err) {
        console.error(`❌ YouTube file not found: ${finalYoutube.vpsPath}`);
      }
    } else {
      console.error('❌ YouTube export has no vpsPath');
    }

    console.log('\n✅ Test complete!');
    console.log('\nNext steps:');
    console.log('1. Manually verify subtitles are burned in the videos');
    console.log('2. Check video quality and aspect ratios');
    console.log('3. Test with different clips and formats');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await transcodeQueue.close();
    await db.$disconnect();
  }
}

testExport().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
