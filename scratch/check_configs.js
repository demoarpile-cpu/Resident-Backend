import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const configs = await prisma.systemConfig.findMany();
    console.log('Current Configs:', configs.map(c => ({ key: c.key, length: c.value?.length })));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
