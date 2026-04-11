import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'admin@gmail.com' }
  });
  console.log('User Found:', user ? { ...user, avatar: user.avatar ? user.avatar.substring(0, 50) + '...' : 'null' } : 'Not Found');
}

main().catch(console.error).finally(() => prisma.$disconnect());
