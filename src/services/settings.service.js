import prisma from '../config/prisma.js';

export const getSettings = async () => {
  const configs = await prisma.systemConfig.findMany();
  const settings = {};
  configs.forEach(c => {
    settings[c.key] = c.value;
  });
  return settings;
};

export const updateSettings = async (settings) => {
  if (!settings || typeof settings !== 'object') {
    throw new Error('Invalid settings object provided');
  }

  const entries = Object.entries(settings);
  const results = [];

  for (const [key, value] of entries) {
    const result = await prisma.systemConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) }
    });
    results.push(result);
  }

  return results;
};

export const getIntegrations = async () => {
  return await prisma.integration.findMany();
};

export const updateIntegration = async (id, data) => {
  return await prisma.integration.update({
    where: { id },
    data
  });
};

// Seed initial configurations and integrations if they don't exist
export const seedSystemConfig = async () => {
  // Seed Integrations
  const intCount = await prisma.integration.count();
  if (intCount === 0) {
    await prisma.integration.createMany({
      data: [
        { name: 'Bank Connection', description: 'Reconcile statement CSVs automatically.', status: 'CONNECTED', connected: true, icon: 'Globe' },
        { name: 'DATEV Export', description: 'Standard accounting exports formats support.', status: 'DISCONNECTED', connected: false, icon: 'FileText' },
        { name: 'Email Service', description: 'Send automated tenant notifications setups.', status: 'CONNECTED', connected: true, icon: 'Mail' }
      ]
    });
  }

  // Seed Defaults
  const configCount = await prisma.systemConfig.count();
  if (configCount === 0) {
    await prisma.systemConfig.createMany({
      data: [
        { key: 'billing_reminder_template', value: 'Dear {Name},\n\nWe would like to remind you that your account currently has an outstanding balance of {Amount}.\n\nPlease ensure this is settled at your earliest convenience to avoid further action.\n\nThank you.' },
        { key: 'billing_signature', value: 'Best regards,\nBilling Department' }
      ]
    });
  }

  // Seed Admin User
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@residence.com',
        password: 'password123',
        avatar: null
      }
    });
  }
};
