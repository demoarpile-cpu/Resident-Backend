import prisma from '../config/prisma.js';
import * as chargeService from '../services/charge.service.js';
import * as remindersService from '../services/reminders.service.js';
import * as settingsService from '../services/settings.service.js';

export const getAllResidents = async (req, res) => {
  try {
    const residents = await prisma.resident.findMany({
      include: {
        house: true,
        chargeDefs: true,
        charges: true,
        payments: true,
        reminders: true,
        notes: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: residents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createResident = async (req, res) => {
  try {
    const { name, email, debtorNumber, address, billingAddress, serviceRecipient, serviceRecipientAddress, houseId, startDate, creditBalance, monthlyCharge } = req.body;

    // Create resident and potentially initial charge definition in a transaction
    const resident = await prisma.$transaction(async (tx) => {
      const newResident = await tx.resident.create({
        data: {
          name,
          email,
          debtorNumber,
          address,
          billingAddress,
          serviceRecipient,
          serviceRecipientAddress,
          houseId,
          startDate: new Date(startDate),
          creditBalance: creditBalance || 0
        }
      });

      // Handle charges array (preferred) or monthlyCharge legacy field
      if (req.body.charges && Array.isArray(req.body.charges)) {
        const validCharges = req.body.charges.filter(c => c.type && parseFloat(c.amount) > 0);
        if (validCharges.length > 0) {
          await tx.chargeDefinition.createMany({
            data: validCharges.map(c => ({
              residentId: newResident.id,
              type: c.type,
              amount: parseFloat(c.amount),
              startDate: c.startDate ? new Date(c.startDate) : new Date(startDate),
              billingType: c.billingType || 'recurring'
            }))
          });
        }
      } else if (monthlyCharge && parseFloat(monthlyCharge) > 0) {
        // Fallback for older frontend versions
        await tx.chargeDefinition.create({
          data: {
            residentId: newResident.id,
            type: 'Rent',
            amount: parseFloat(monthlyCharge),
            startDate: new Date(startDate)
          }
        });
      }

      return newResident;
    });

    // After creation, trigger history generation to ensure status is correctly calculated (fixes "Paid" on new residents)
    await chargeService.generateMonthlyCharges(resident.id);

    // Fetch the full resident data to return
    const fullData = await prisma.resident.findUnique({
      where: { id: resident.id },
      include: {
        house: true,
        chargeDefs: true,
        charges: true,
        payments: true,
        reminders: true,
        notes: { orderBy: { createdAt: 'desc' } }
      }
    });

    res.json({ success: true, data: fullData });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'A resident with this email already exists (Unique constraint).' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getResidentById = async (req, res) => {
  try {
    const { id } = req.params;
    const resident = await prisma.resident.findUnique({
      where: { id },
      include: {
        house: true,
        chargeDefs: true,
        charges: true,
        payments: true,
        reminders: true,
        notes: { orderBy: { createdAt: 'desc' } }
      }
    });
    res.json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, debtorNumber, address, billingAddress, serviceRecipient, serviceRecipientAddress, houseId, startDate, creditBalance, charges } = req.body;

    const resident = await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      const updated = await tx.resident.update({
        where: { id },
        data: {
          name,
          email,
          debtorNumber,
          address,
          billingAddress,
          serviceRecipient,
          serviceRecipientAddress,
          houseId,
          startDate: startDate ? new Date(startDate) : undefined,
          creditBalance: creditBalance !== undefined ? parseFloat(creditBalance) : undefined
        }
      });

      // 2. Sync charge definitions if provided
      if (charges && Array.isArray(charges)) {
        // Delete existing and re-create for simplicity in syncing the breakdown list
        await tx.chargeDefinition.deleteMany({ where: { residentId: id } });

        const validCharges = charges.filter(c => c.type && parseFloat(c.amount) > 0);
        if (validCharges.length > 0) {
          await tx.chargeDefinition.createMany({
            data: validCharges.map(c => ({
              residentId: id,
              type: c.type,
              amount: parseFloat(c.amount),
              startDate: c.startDate ? new Date(c.startDate) : (startDate ? new Date(startDate) : updated.startDate),
              billingType: c.billingType || 'recurring'
            }))
          });
        }
      }

      return updated;
    });

    const fullData = await prisma.resident.findUnique({
      where: { id },
      include: {
        house: true,
        chargeDefs: true,
        charges: true,
        payments: true,
        reminders: true,
        notes: { orderBy: { createdAt: 'desc' } }
      }
    });

    res.json({ success: true, data: fullData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteResident = async (req, res) => {
  try {
    const { id } = req.params;

    // Use transaction to ensure safe deletion of dependent data
    await prisma.$transaction(async (tx) => {
      // 1. Delete payment allocations
      await tx.paymentAllocation.deleteMany({
        where: {
          OR: [
            { payment: { residentId: id } },
            { charge: { residentId: id } }
          ]
        }
      });

      // 2. Delete payments
      await tx.payment.deleteMany({ where: { residentId: id } });

      // 3. Delete charges
      await tx.charge.deleteMany({ where: { residentId: id } });

      // 4. Delete charge definitions
      await tx.chargeDefinition.deleteMany({ where: { residentId: id } });

      // 5. Delete aliases
      await tx.alias.deleteMany({ where: { residentId: id } });

      // 6. Delete reminders
      await tx.reminder.deleteMany({ where: { residentId: id } });

      // 7. Finally delete the resident
      await tx.resident.delete({ where: { id } });
    });

    res.json({ success: true, message: 'Resident and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getResidentLedger = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Generate monthly charges first (auto-sync)
    await chargeService.generateMonthlyCharges(id);

    // 2. Fetch charges and payments
    const charges = await prisma.charge.findMany({
      where: { residentId: id },
      orderBy: { month: 'desc' }
    });

    const payments = await prisma.payment.findMany({
      where: { residentId: id },
      orderBy: { date: 'desc' }
    });

    const resident = await prisma.resident.findUnique({
      where: { id },
      include: { reminders: true }
    });

    // 3. Calculate summary
    const totalCharged = charges.reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const outstanding = charges.reduce((sum, c) => sum + (c.amount - c.paidAmount), 0);
    const credit = resident.creditBalance || 0;

    // 4. Derive Status
    let status = 'PAID';
    if (charges.length === 0) {
      status = 'NO_CHARGES';
    } else if (outstanding > 0) {
      status = outstanding < totalCharged ? 'PARTIAL' : 'UNPAID';
    }

    res.json({
      success: true,
      data: {
        charges,
        payments,
        summary: {
          totalCharged,
          totalPaid,
          outstanding,
          credit,
          balance: outstanding - credit,
          status
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const logReminder = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch current settings for template and signature
    const settings = await settingsService.getSettings();
    const template = settings.billing_reminder_template;
    const signature = settings.billing_signature;

    // 2. Use the central reminders service to "send" (console log + prisma update)
    const results = await remindersService.sendReminders([id], { template, signature });

    res.json({ success: true, data: results[0].history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
