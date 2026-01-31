/**
 * Script to extract and update metadata for existing media files
 * Run with: npx tsx scripts/fix-media-metadata.ts
 */

import db from '../src/lib/db';
import { extractMetadata } from '../src/services/ffmpeg/metadata';
import { existsSync } from 'fs';

async function fixMediaMetadata() {
  console.log('🔍 Finding media files without metadata...\n');

  // Find all video/audio files without duration
  const mediaFiles = await db.mediaFile.findMany({
    where: {
      OR: [
        { duration: null },
        { duration: 0 },
      ],
      AND: {
        mimeType: {
          startsWith: 'video/',
        },
      },
    },
  });

  console.log(`📁 Found ${mediaFiles.length} files to process\n`);

  if (mediaFiles.length === 0) {
    console.log('✅ No files need metadata extraction!');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const file of mediaFiles) {
    console.log(`\n📹 Processing: ${file.filename}`);
    console.log(`   Path: ${file.vpsPath}`);

    if (!file.vpsPath || !existsSync(file.vpsPath)) {
      console.log(`   ❌ File not found on disk, skipping...`);
      errorCount++;
      continue;
    }

    try {
      const metadata = await extractMetadata(file.vpsPath);

      await db.mediaFile.update({
        where: { id: file.id },
        data: {
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height,
        },
      });

      console.log(`   ✅ Updated: duration=${metadata.duration}s, ${metadata.width}x${metadata.height}`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ Error:`, error);
      errorCount++;
    }
  }

  console.log(`\n\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📁 Total: ${mediaFiles.length}`);
}

// Run script
fixMediaMetadata()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
