import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const residents = await prisma.resident.findMany({
    include: { 
      chargeDefs: true, 
      charges: true,
      payments: true
    }
  });
  console.log('--- Database Dump ---');
  console.log(JSON.stringify(residents, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
