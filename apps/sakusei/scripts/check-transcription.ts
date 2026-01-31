import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTranscription() {
  const mediaFileId = 'cmkqz7gyc000bu45c0matpd63';
  const clipId = 'cmkqzfdyq0003u4w08cqmhpxg';

  console.log('🔍 Checking transcription...\n');

  // Check EditedClip
  console.log('1. Checking EditedClip by clipId:');
  const clipById = await prisma.editedClip.findUnique({
    where: { id: clipId },
  });

  if (clipById) {
    console.log('   ✅ Found EditedClip:', {
      id: clipById.id,
      sourceMediaId: clipById.sourceMediaId,
      hasTranscription: !!clipById.transcription,
      transcriptionSegments: (clipById.transcription as any)?.segments?.length || 0,
    });
  } else {
    console.log('   ❌ EditedClip not found');
  }

  console.log('\n2. Checking EditedClip by sourceMediaId:');
  const clipsByMedia = await prisma.editedClip.findMany({
    where: { sourceMediaId: mediaFileId },
    orderBy: { createdAt: 'desc' },
  });

  if (clipsByMedia.length > 0) {
    console.log(`   ✅ Found ${clipsByMedia.length} EditedClips:`);
    clipsByMedia.forEach((clip, i) => {
      console.log(`   ${i + 1}. ID: ${clip.id}`);
      console.log(`      Name: ${clip.name}`);
      console.log(`      Has transcription: ${!!clip.transcription}`);
      console.log(`      Segments: ${(clip.transcription as any)?.segments?.length || 0}`);
      console.log(`      Created: ${clip.createdAt.toLocaleString()}`);
    });
  } else {
    console.log('   ❌ No EditedClips found');
  }

  console.log('\n3. Testing API endpoint simulation:');
  const apiResult = await prisma.editedClip.findFirst({
    where: { sourceMediaId: mediaFileId },
    orderBy: { createdAt: 'desc' },
  });

  if (apiResult) {
    console.log('   ✅ API would return:', {
      id: apiResult.id,
      hasTranscription: !!apiResult.transcription,
      segments: (apiResult.transcription as any)?.segments?.length || 0,
    });

    if (apiResult.transcription) {
      console.log('\n4. Transcription content preview:');
      const trans = apiResult.transcription as any;
      console.log('   Language:', trans.language);
      console.log('   Full text length:', trans.fullText?.length || 0);
      console.log('   First 3 segments:');
      trans.segments?.slice(0, 3).forEach((seg: any, i: number) => {
        console.log(`   ${i + 1}. [${seg.start.toFixed(2)}s - ${seg.end.toFixed(2)}s] ${seg.text}`);
      });
    }
  } else {
    console.log('   ❌ API would return null');
  }

  await prisma.$disconnect();
}

checkTranscription().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
