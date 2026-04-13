import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:');
  users.forEach(u => console.log(`- ${u.email}`));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
