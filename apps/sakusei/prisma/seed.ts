import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default user (Jay)
  const jay = await prisma.user.upsert({
    where: { email: 'jaygonc@gmail.com' },
    update: {},
    create: {
      email: 'jaygonc@gmail.com',
      name: 'Jay',
      role: 'CREATOR',
    },
  });

  console.log('✅ Default user created:', jay);

  // Create default user (Ange) - optional
  const ange = await prisma.user.upsert({
    where: { email: 'ange@theermite.com' },
    update: {},
    create: {
      email: 'ange@theermite.com',
      name: 'Ange',
      role: 'EDITOR',
    },
  });

  console.log('✅ Default user created:', ange);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
