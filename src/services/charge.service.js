import prisma from '../config/prisma.js';

const getMonthsBetween = (startDate) => {
  const start = new Date(startDate);
  const end = new Date();
  const startDay = start.getDate();
  
  const months = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const currentEnd = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= currentEnd) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    
    // Only add the month if the billing day has passsed in that month
    // OR if it's a past month.
    let isPastMonth = current < currentEnd;
    let isCurrentMonthAndDue = (current.getFullYear() === end.getFullYear() && 
                                current.getMonth() === end.getMonth() && 
                                end.getDate() >= startDay);

    if (isPastMonth || isCurrentMonthAndDue) {
      months.push(`${year}-${month}`);
    }
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
};

export const generateMonthlyCharges = async (residentId) => {
  const resident = await prisma.resident.findUnique({
    where: { id: residentId },
    include: { chargeDefs: true }
  });

  if (!resident) {
    throw new Error('Resident not found');
  }

  const generatedCharges = [];
  const start = new Date(resident.startDate);
  const billingDay = start.getDate();
  const now = new Date();

  for (const def of resident.chargeDefs) {
    // 1. If today is before def.startDate, skip.
    if (now < new Date(def.startDate)) continue;

    const billingType = def.billingType || 'recurring';
    const months = getMonthsBetween(def.startDate);

    for (const monthStr of months) {
      // 2. If one-time, ensure it only generates for its target month
      if (billingType === 'one-time') {
        const startMonthStr = new Date(def.startDate).toISOString().substring(0, 7);
        if (monthStr !== startMonthStr) continue;
      }

      const existingCharge = await prisma.charge.findFirst({
        where: {
          residentId: residentId,
          type: def.type,
          month: monthStr
        }
      });

      if (!existingCharge) {
        // Calculate the actual charge date using the billing day
        const [year, month] = monthStr.split('-').map(Number);
        
        // Handle last day of month if billing day doesn't exist (e.g. 31st in Feb)
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        const actualDay = Math.min(billingDay, lastDayOfMonth);
        const chargeDate = new Date(year, month - 1, actualDay);

        // Auto-calculate dueDate (14 days from charge date)
        const dueDate = new Date(chargeDate);
        dueDate.setDate(dueDate.getDate() + 14);

        const newCharge = await prisma.charge.create({
          data: {
            residentId: residentId,
            type: def.type,
            amount: def.amount,
            month: monthStr,
            date: chargeDate,
            dueDate: dueDate,
            billingType: billingType,
            status: 'UNPAID',
            paidAmount: 0,
            isManual: false
          }
        });
        generatedCharges.push(newCharge);
      }
    }
  }

  return {
    success: true,
    generatedCount: generatedCharges.length,
    charges: generatedCharges
  };
};

export const globalSyncCharges = async () => {
  const residents = await prisma.resident.findMany({
    select: { id: true }
  });

  let totalGenerated = 0;
  for (const resident of residents) {
    const result = await generateMonthlyCharges(resident.id);
    totalGenerated += result.generatedCount;
  }

  return { success: true, totalGenerated };
};

export const getResidentCharges = async (residentId) => {
  return await prisma.charge.findMany({
    where: { residentId },
    orderBy: { month: 'desc' }
  });
};

export const addChargeDefinition = async (data) => {
  const { residentId, type, amount, startDate, billingType } = data;
  return await prisma.chargeDefinition.create({
    data: {
      residentId,
      type,
      amount: parseFloat(amount),
      startDate: new Date(startDate),
      billingType: billingType || 'recurring'
    }
  });
};

export const getChargeDefinitions = async (residentId) => {
  return await prisma.chargeDefinition.findMany({
    where: { residentId }
  });
};

export const deleteChargeDefinition = async (id) => {
  return await prisma.chargeDefinition.delete({
    where: { id }
  });
};

export const createManualCharge = async (data) => {
  const { residentId, amount, month, type, status, date, dueDate, billingType, description, invoiceFile } = data;
  
  const chargeDate = date ? new Date(date) : new Date();
  
  // Default dueDate to 14 days from chargeDate if not provided
  const calculatedDueDate = dueDate ? new Date(dueDate) : new Date(chargeDate);
  if (!dueDate) {
    calculatedDueDate.setDate(calculatedDueDate.getDate() + 14);
  }

  return await prisma.charge.create({
    data: {
      residentId,
      amount: parseFloat(amount),
      month,
      type: type || 'Other',
      description,
      billingType: billingType || 'one-time',
      status: status || 'UNPAID',
      date: chargeDate,
      dueDate: calculatedDueDate,
      paidAmount: 0,
      isManual: true,
      invoiceFile: invoiceFile || null
    }
  });
};
export const updateCharge = async (id, data) => {
  const { amount, date, dueDate, billingType, description, invoiceFile } = data;

  if (amount && amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const chargeDate = date ? new Date(date) : undefined;
  const targetDueDate = dueDate ? new Date(dueDate) : undefined;

  if (chargeDate && targetDueDate && targetDueDate < chargeDate) {
    throw new Error('Due date cannot be before charge date');
  }

  return await prisma.charge.update({
    where: { id },
    data: {
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      date: chargeDate,
      dueDate: targetDueDate,
      billingType: billingType || undefined,
      description: description || undefined,
      invoiceFile: invoiceFile !== undefined ? invoiceFile : undefined
    }
  });
};

export const importCharges = async (residentId, chargeList) => {
  if (!Array.isArray(chargeList)) {
    throw new Error('Invalid charges format');
  }

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const item of chargeList) {
    try {
      // Basic formatting/defaulting
      const chargeDate = item.date ? new Date(item.date) : new Date();
      const month = item.month || chargeDate.toISOString().substring(0, 7);
      
      const charge = await createManualCharge({
        residentId,
        amount: item.amount,
        type: item.type || item.description || 'Imported',
        description: item.description,
        date: chargeDate,
        month,
        billingType: item.billingType || 'one-time',
        status: 'UNPAID'
      });
      
      results.push(charge);
      successCount++;
    } catch (err) {
      console.error('Error importing charge row:', item, err);
      errorCount++;
    }
  }

  return { success: true, successCount, errorCount, data: results };
};

export const deleteCharge = async (id) => {
  return await prisma.charge.delete({
    where: { id }
  });
};
