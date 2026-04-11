import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanData() {
  console.log('Starting data cleanup...');
  
  // Find all charges that match a resident's Recurring Charge Definitions
  // and mark them as isManual: false
  const residents = await prisma.resident.findMany({
    include: { chargeDefs: true }
  });

  let count = 0;
  for (const resident of residents) {
    const defTypes = resident.chargeDefs.map(d => d.type);
    
    if (defTypes.length > 0) {
      const result = await prisma.charge.updateMany({
        where: {
          residentId: resident.id,
          type: { in: defTypes },
          // Recurring charges always have a month string like '2026-05'
          month: { contains: '-' } 
        },
        data: { isManual: false }
      });
      count += result.count;
    }
  }

  console.log(`Updated ${count} charges to isManual: false`);
  await prisma.$disconnect();
}

cleanData().catch(err => {
  console.error(err);
  process.exit(1);
});
