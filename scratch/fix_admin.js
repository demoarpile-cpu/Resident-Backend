import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  const email = 'admin@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    console.log(`Found user ${email}, current role: ${user.role}`);
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log(`Updated ${email} to ADMIN`);
  } else {
    console.log(`User ${email} not found`);
  }
  await prisma.$disconnect();
}

fix();
