import prisma from './src/config/prisma.js';

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const houseCount = await prisma.house.count();
    console.log('✅ Connection successful! House count:', houseCount);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
