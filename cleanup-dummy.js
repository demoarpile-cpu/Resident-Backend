import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Cleanup ---');

  // 1. Delete all Bank Transactions
  const deletedTxs = await prisma.bankTransaction.deleteMany({});
  console.log(`Deleted ${deletedTxs.count} bank transactions.`);

  // 2. Delete all Payments and Allocations
  const deletedAllocations = await prisma.paymentAllocation.deleteMany({});
  console.log(`Deleted ${deletedAllocations.count} payment allocations.`);

  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`Deleted ${deletedPayments.count} payments.`);

  // 3. Delete Resident "John Doe" (and his related data via cascade or manual)
  // Let's find him first
  const johnDoe = await prisma.resident.findFirst({
    where: { name: { contains: 'John Doe' } }
  });

  if (johnDoe) {
    // Delete his related data first as a precaution
    await prisma.charge.deleteMany({ where: { residentId: johnDoe.id } });
    await prisma.chargeDefinition.deleteMany({ where: { residentId: johnDoe.id } });
    await prisma.alias.deleteMany({ where: { residentId: johnDoe.id } });
    await prisma.reminder.deleteMany({ where: { residentId: johnDoe.id } });
    
    await prisma.resident.delete({ where: { id: johnDoe.id } });
    console.log('Deleted resident John Doe and his associated data.');
  }

  console.log('--- Cleanup Complete ---');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
