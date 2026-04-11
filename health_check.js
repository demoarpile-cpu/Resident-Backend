import prisma from './src/config/prisma.js';

async function testUpdate() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }
    console.log('User found:', user.email);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Health Check ' + Date.now() }
    });
    console.log('Update successful:', updated.name);
  } catch (err) {
    console.error('Update FAILED:', err);
  } finally {
    process.exit();
  }
}

testUpdate();
