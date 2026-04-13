import prisma from '../config/prisma.js';

/**
 * Generic Email Service utilizing EmailJS REST API
 * Fetches configuration from SystemConfig table
 */
export const sendEmail = async ({ to_name, to_email, subject, message }) => {
  try {
    // 1. Fetch current configuration
    const settingsEntries = await prisma.systemConfig.findMany();
    const config = {};
    settingsEntries.forEach(s => config[s.key] = s.value);

    const emailjsServiceId = config.emailjs_service_id || 'service_ze5zfwu';
    const emailjsTemplateId = config.emailjs_template_id || 'template_h1n7gqa'; // Reusing this template
    const emailjsPublicKey = config.emailjs_public_key || 'I3fOfZW70y32ceu5q';

    console.log(`[Email Service] Attempting to send to ${to_email} with subject: ${subject}`);

    // 2. Fetch Logo from config if available
    const logo = config.billing_logo || '';
    const signature = config.billing_signature || config.company_name || 'Resident Pro Admin';

    // 3. Dispatch via EmailJS
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: emailjsServiceId,
        template_id: emailjsTemplateId,
        user_id: emailjsPublicKey,
        template_params: {
          to_name,
          to_email,
          subject, 
          message,
          amount: '', // Placeholder as template template_h1n7gqa might require this
          signature: signature,
          logo: logo
        }
      })
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error('[Email Service] EmailJS Error Status:', response.status, 'Body:', responseText);
      throw new Error(`EmailJS Error: ${responseText}`);
    }

    console.log('[Email Service] Successfully dispatched email. Response:', responseText);
    return { success: true };
  } catch (err) {
    console.error('[Email Service Error]', err);
    // We don't want to crash the whole process if email fails, but let the caller know
    return { success: false, error: err.message };
  }
};
