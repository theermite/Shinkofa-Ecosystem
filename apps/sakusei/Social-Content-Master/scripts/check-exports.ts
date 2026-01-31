import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExports() {
  console.log('📊 Checking recent exports...\n');

  const exports = await prisma.export.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      clip: {
        select: {
          name: true,
          sourceMedia: {
            select: {
              filename: true,
            },
          },
        },
      },
    },
  });

  if (exports.length === 0) {
    console.log('❌ No exports found in database');
    return;
  }

  console.log(`✅ Found ${exports.length} recent exports:\n`);

  exports.forEach((exp, i) => {
    console.log(`${i + 1}. Export ID: ${exp.id}`);
    console.log(`   Clip: ${exp.clip.name}`);
    console.log(`   Format: ${exp.format}`);
    console.log(`   Resolution: ${exp.resolution}`);
    console.log(`   Status: ${exp.status}`);
    console.log(`   Progress: ${exp.progress}%`);
    console.log(`   VPS Path: ${exp.vpsPath || 'null'}`);
    console.log(`   CDN URL: ${exp.cdnUrl || 'null'}`);
    console.log(`   Created: ${exp.createdAt.toLocaleString()}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkExports().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
