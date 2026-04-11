import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Houses
  const houseA1 = await prisma.house.upsert({
    where: { name: 'A1' },
    update: {},
    create: { name: 'A1', type: 'Residential' },
  });

  const houseB2 = await prisma.house.upsert({
    where: { name: 'B2' },
    update: {},
    create: { name: 'B2', type: 'Residential' },
  });

  // Create Residents
  await prisma.resident.create({
    data: {
      name: 'John Doe',
      houseId: houseA1.id,
      startDate: new Date('2024-01-01'),
      creditBalance: 0,
      chargeDefs: {
        create: [
          { type: 'Rent', amount: 800, startDate: new Date('2024-01-01') },
          { type: 'Service Fee', amount: 200, startDate: new Date('2024-01-01') },
        ],
      },
    },
  });

  await prisma.resident.create({
    data: {
      name: 'Jane Smith',
      houseId: houseB2.id,
      startDate: new Date('2024-02-15'),
      creditBalance: 100,
      chargeDefs: {
        create: [
          { type: 'Rent', amount: 950, startDate: new Date('2024-02-15') },
        ],
      },
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
