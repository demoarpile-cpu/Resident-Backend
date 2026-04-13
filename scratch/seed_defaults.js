import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const configs = [
    { key: 'billing_reminder_template', value: 'Dear {Name},\n\nWe would like to remind you that your account currently has an outstanding balance of {Amount}.\n\nPlease ensure this is settled at your earliest convenience to avoid further action.\n\nThank you.' },
    { key: 'billing_signature', value: 'Best regards,\nBilling Department' },
    { key: 'emailjs_service_id', value: 'service_ze5zfwu' },
    { key: 'emailjs_template_id', value: 'template_h1n7gqa' },
    { key: 'emailjs_public_key', value: 'I3fOfZW70y32ceu5q' }
  ];

  console.log('Seeding system configurations...');
  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {}, // Don't overwrite if exists, unless you want to force reset
      create: config
    });
    console.log(`- Checked/Upserted ${config.key}`);
  }
  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
