import prisma from '../config/prisma.js';
import * as paymentService from './payment.service.js';

export const getTransactions = async () => {
  return await prisma.bankTransaction.findMany({
    orderBy: { date: 'desc' }
  });
};

export const createTransaction = async (data) => {
  return await prisma.bankTransaction.create({
    data: {
      description: data.description,
      amount: data.amount,
      date: new Date(data.date),
      status: 'UNMATCHED'
    }
  });
};

export const uploadTransactions = async (txs) => {
  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  if (!Array.isArray(txs)) {
    throw new Error('Invalid data format: transactions must be an array');
  }

  for (const tx of txs) {
    try {
      // Robust date parsing
      let txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) {
          // Try parsing common formats if ISO fails
          // Simple regex swap for DD/MM/YYYY to MM/DD/YYYY for JS Date constructor
          const parts = tx.date.split(/[-/.]/);
          if (parts.length === 3) {
              if (parts[0].length === 2 && parts[2].length === 4) {
                  // DD-MM-YYYY -> MM-DD-YYYY
                  txDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
              }
          }
      }
      
      // Fallback to today if still invalid
      if (isNaN(txDate.getTime())) txDate = new Date();
      
      // Check for existing transaction (Strict date match might be too hard, so we use a range or just description/amount if date is flaky)
      // For now, keep it simple but handle the Date object safely
      const existing = await prisma.bankTransaction.findFirst({
        where: {
          date: txDate,
          description: tx.description,
          amount: parseFloat(tx.amount),
        }
      });

      if (!existing) {
        await prisma.bankTransaction.create({
          data: {
            description: tx.description,
            amount: parseFloat(tx.amount),
            date: txDate,
            reference: tx.reference || null,
            status: 'UNMATCHED'
          }
        });
        importedCount++;
      } else {
        skippedCount++;
      }
    } catch (err) {
      console.error('Error importing transaction row:', tx, err);
      errorCount++;
    }
  }

  return { success: true, importedCount, skippedCount, errorCount };
};

export const matchTransaction = async (transactionId, residentId, allocations = []) => {
  const transaction = await prisma.bankTransaction.findUnique({
    where: { id: transactionId }
  });

  if (!transaction) throw new Error('Transaction not found');
  if (transaction.status === 'MATCHED') throw new Error('Transaction is already matched');

  return await prisma.$transaction(async (tx) => {
    // 1. Record the payment with allocations
    const payment = await paymentService.recordPayment({
      residentId,
      amount: transaction.amount,
      date: transaction.date,
      method: 'Bank Transfer',
      note: `Matched from bank: ${transaction.description}`,
      allocations
    });

    // 2. Update transaction status and store paymentId link
    await tx.bankTransaction.update({
      where: { id: transactionId },
      data: { 
        status: 'MATCHED',
        paymentId: payment.id // HARD LINK: Prevents duplication
      }
    });

    // 3. Store alias for future auto-matching
    await tx.alias.upsert({
      where: { description: transaction.description },
      update: { residentId },
      create: { description: transaction.description, residentId }
    });

    return payment;
  });
};

export const deleteTransaction = async (id) => {
  return await prisma.bankTransaction.delete({
    where: { id }
  });
};

export const unmatchTransaction = async (id) => {
  const transaction = await prisma.bankTransaction.findUnique({
    where: { id }
  });

  if (!transaction) throw new Error('Transaction not found');
  if (transaction.status !== 'MATCHED') return { success: true, message: 'Already unmatched' };

  return await prisma.$transaction(async (tx) => {
    if (transaction.paymentId) {
      // 1. Delete payment allocations first
      await tx.paymentAllocation.deleteMany({ where: { paymentId: transaction.paymentId } });
      
      // 2. Delete the EXACT payment linked to this transaction
      await tx.payment.delete({ 
        where: { id: transaction.paymentId } 
      }).catch(err => console.log("Payment already deleted or not found:", err));
    }

    // 3. Update bank transaction status back to UNMATCHED and clear link
    return await tx.bankTransaction.update({
      where: { id },
      data: { 
        status: 'UNMATCHED',
        paymentId: null 
      }
    });
  });
};

export const getSuggestedResident = async (description) => {
  // 1. Check exact alias
  const alias = await prisma.alias.findUnique({
    where: { description },
    include: { resident: true }
  });

  if (alias) return { resident: alias.resident, confidence: 'High', source: 'Alias' };

  // 2. Fuzzy match by name in description (Simplified)
  const residents = await prisma.resident.findMany({ include: { house: true } });
  for (const resident of residents) {
    if (description.toLowerCase().includes(resident.name.toLowerCase())) {
      return { resident, confidence: 'Medium', source: 'NameMatch' };
    }
    if (resident.house && description.toLowerCase().includes(resident.house.name.toLowerCase())) {
      return { resident, confidence: 'Medium', source: 'HouseMatch' };
    }
  }

  return null;
};

export const autoReconcile = async () => {
  const transactions = await prisma.bankTransaction.findMany({
    where: { status: 'UNMATCHED' }
  });

  let count = 0;
  for (const tx of transactions) {
    const suggestion = await getSuggestedResident(tx.description);
    
    // Only auto-reconcile if confidence is 'High' (Exact Alias Match)
    if (suggestion && suggestion.confidence === 'High') {
      await matchTransaction(tx.id, suggestion.resident.id);
      count++;
    }
  }

  return { success: true, count };
};
