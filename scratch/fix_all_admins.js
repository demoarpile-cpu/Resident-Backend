import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  const emails = ['admin@gmail.com', 'admin@resident-pro.com'];
  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      console.log(`Found user ${email}, current role: ${user.role}`);
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      });
      console.log(`Updated ${email} to ADMIN`);
    }
  }
  await prisma.$disconnect();
}

fix();
