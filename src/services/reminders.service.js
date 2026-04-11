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

  // Fetch settings once at the start
  const settingsEntries = await prisma.systemConfig.findMany();
  const config = {};
  settingsEntries.forEach(s => config[s.key] = s.value);

  const emailjsServiceId = config.emailjs_service_id || 'service_ze5zfwu';
  const emailjsTemplateId = config.emailjs_template_id || 'template_h1n7gqa';
  const emailjsPublicKey = config.emailjs_public_key || 'I3fOfZW70y32ceu5q';
  const logo = config.billing_logo || '';

  return await prisma.$transaction(async (tx) => {
    const results = [];
    for (const id of residentIds) {
      // 1. Fetch Resident with balance info
      const residentRes = await tx.resident.findUnique({
        where: { id },
        include: { charges: true, payments: true }
      });

      const totalCharged = residentRes.charges.reduce((sum, c) => sum + c.amount, 0);
      const totalPaid = residentRes.payments.reduce((sum, p) => sum + p.amount, 0);
      const balance = totalCharged - totalPaid;

      // 2. Render content (Consistency check)
      const renderedBody = template
        .replaceAll('{Name}', residentRes.name)
        .replaceAll('{Amount}', `€${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

      const fullEmailMock = `${renderedBody}\n\n---\n${signature}`;

      // 3. Update Resident Status
      const resident = await tx.resident.update({
        where: { id },
        data: {
          reminderLevel: { increment: 1 },
          lastReminderDate: now,
        }
      });

      // 4. Create Reminder History Entry (storing rendered content for consistency)
      const history = await tx.reminder.create({
        data: {
          residentId: id,
          type: `Level ${resident.reminderLevel}`,
          date: now,
          status: 'SENT'
        }
      });

      console.log(`[Email System] Sending to ${resident.email}:\n${fullEmailMock}\n`);

      // 5. Actual Email Dispatch (EmailJS REST API)
      try {
        const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: emailjsServiceId,
            template_id: emailjsTemplateId,
            user_id: emailjsPublicKey,
            template_params: {
              to_name: residentRes.name,
              to_email: residentRes.email,
              message: fullEmailMock,
              amount: `€${balance.toFixed(2)}`,
              signature: signature,
              logo: logo
            }
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('[EmailJS Error]', errorText);
        } else {
          console.log('[Email System] Successfully dispatched via EmailJS');
        }
      } catch (emailErr) {
        console.error('[Email Dispatch Failed]', emailErr);
      }

      results.push({ resident, history });
    }
    return results;
  });
};
