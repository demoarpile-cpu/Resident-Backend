import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gmail.com';
  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      password: hashedPassword,
      name: 'Admin'
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Admin'
    }
  });

  console.log('User Reset Successful:', { id: user.id, email: user.email });
}

main().catch(console.error).finally(() => prisma.$disconnect());
