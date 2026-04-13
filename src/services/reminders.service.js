import prisma from '../config/prisma.js';

export const getOverdueResidents = async () => {
  // Logic: Residents with overall outstanding balance > 0
  const residents = await prisma.resident.findMany({
    include: {
      charges: true,
      payments: true,
      house: true,
    }
  });

  return residents.map(resident => {
    const totalCharged = resident.charges.reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = resident.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalCharged - totalPaid;

    return {
      ...resident,
      totalCharged,
      totalPaid,
      balance,
    };
  }).filter(r => r.balance > 0);
};

export const sendReminders = async (residentIds, { template, signature }) => {
  const now = new Date();

  // 1. Fetch settings with fallbacks
  const settingsEntries = await prisma.systemConfig.findMany();
  const config = {};
  settingsEntries.forEach(s => config[s.key] = s.value);

  const emailjsServiceId = config.emailjs_service_id || 'service_ze5zfwu';
  const emailjsTemplateId = config.emailjs_template_id || 'template_h1n7gqa';
  const emailjsPublicKey = config.emailjs_public_key || 'I3fOfZW70y32ceu5q';
  const logo = config.billing_logo || '';
  
  const defaultTemplate = 'Dear {Name},\n\nWe would like to remind you that your account currently has an outstanding balance of {Amount}.\n\nPlease ensure this is settled at your earliest convenience to avoid further action.\n\nThank you.';
  const safeTemplate = template || config.billing_reminder_template || defaultTemplate;
  const safeSignature = signature || config.billing_signature || 'Best regards,\nBilling Department';

  const results = [];

  // 2. Database Updates (Transaction)
  const dbUpdates = await prisma.$transaction(async (tx) => {
    const batchResults = [];
    for (const id of residentIds) {
      const residentRes = await tx.resident.findUnique({
        where: { id },
        include: { charges: true, payments: true }
      });

      if (!residentRes) continue;

      const totalCharged = residentRes.charges.reduce((sum, c) => sum + c.amount, 0);
      const totalPaid = residentRes.payments.reduce((sum, p) => sum + p.amount, 0);
      const balance = totalCharged - totalPaid;

      // Update Resident
      const resident = await tx.resident.update({
        where: { id },
        data: {
          reminderLevel: { increment: 1 },
          lastReminderDate: now,
        }
      });

      // Create Reminder History
      const history = await tx.reminder.create({
        data: {
          residentId: id,
          type: `Level ${resident.reminderLevel}`,
          date: now,
          status: 'SENT'
        }
      });

      batchResults.push({ resident, history, residentData: residentRes, balance });
    }
    return batchResults;
  });

  // 3. External Email Dispatch (Outside Transaction)
  for (const item of dbUpdates) {
    const { resident, history, residentData, balance } = item;

    // Render content
    const renderedBody = safeTemplate
      .replaceAll('{Name}', residentData.name || 'Resident')
      .replaceAll('{Amount}', `€${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    const fullEmailContent = `${renderedBody}\n\n---\n${safeSignature}`;

    console.log(`[Email System] Dispatching to ${residentData.email}...`);

    try {
      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailjsServiceId,
          template_id: emailjsTemplateId,
          user_id: emailjsPublicKey,
          template_params: {
            to_name: residentData.name,
            to_email: residentData.email,
            message: fullEmailContent,
            amount: `€${balance.toFixed(2)}`,
            signature: safeSignature,
            logo: logo
          }
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error(`[EmailJS Error] ${residentData.email}:`, errorText);
      } else {
        console.log(`[Email System] Successfully sent to ${residentData.email}`);
      }
    } catch (emailErr) {
      console.error(`[Email Dispatch Failed] ${residentData.email}:`, emailErr);
    }

    results.push({ resident, history });
  }

  return results;
};
