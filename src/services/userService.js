import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

export const seedAdminUser = async () => {
  const adminEmail = 'admin@gmail.com';
  const defaultPassword = '123456';

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existing) {
    console.log('[SEED]: Creating default admin user...');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword
      }
    });
    console.log('[SEED]: Admin user created successfully.');
  }
};
