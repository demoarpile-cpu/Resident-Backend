import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const residents = await prisma.resident.findMany({
    select: { id: true, name: true, house: { select: { name: true } } }
  });
  console.log('--- Residents ---');
  console.log(JSON.stringify(residents, null, 2));

  const txs = await prisma.bankTransaction.findMany();
  console.log('--- Bank Transactions ---');
  console.log(JSON.stringify(txs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
