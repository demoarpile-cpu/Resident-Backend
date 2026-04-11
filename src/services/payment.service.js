import prisma from '../config/prisma.js';

export const allocatePayment = async (paymentId, allocations) => {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    let totalAllocated = 0;

    for (const allocation of allocations) {
      const { chargeId, amount } = allocation;

      if (amount <= 0) continue;

      const charge = await tx.charge.findUnique({
        where: { id: chargeId },
      });

      if (!charge) {
        throw new Error(`Charge not found: ${chargeId}`);
      }

      await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          chargeId: charge.id,
          amount: amount,
        },
      });

      const newPaidAmount = charge.paidAmount + amount;

      let newStatus = 'UNPAID';
      if (newPaidAmount >= charge.amount) {
        newStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        newStatus = 'PARTIAL';
      }

      await tx.charge.update({
        where: { id: charge.id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });

      totalAllocated += amount;
    }

    if (totalAllocated > payment.amount) {
      throw new Error('Total allocated amount exceeds the payment amount');
    }

    const unallocatedAmount = payment.amount - totalAllocated;

    if (unallocatedAmount > 0) {
      await tx.resident.update({
        where: { id: payment.residentId },
        data: {
          creditBalance: {
            increment: unallocatedAmount,
          },
        },
      });
    }

    return {
      success: true,
      paymentId: payment.id,
      totalAllocated,
      unallocatedAmount,
    };
  });
};

export const recordPayment = async (data) => {
  const { residentId, amount, date, method, note, allocations: manualAllocations } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Create the payment record
    const payment = await tx.payment.create({
      data: {
        residentId,
        amount,
        date: new Date(date),
        method,
        note: note || null,
      }
    });

    let totalAllocated = 0;

    // 2. Process manual allocations if provided
    if (manualAllocations && Array.isArray(manualAllocations)) {
      for (const allocation of manualAllocations) {
        const { chargeId, amount: allocAmount } = allocation;
        const numAllocAmount = parseFloat(allocAmount);

        if (numAllocAmount <= 0) continue;

        const charge = await tx.charge.findUnique({
          where: { id: chargeId },
        });

        if (!charge) {
          throw new Error(`Charge not found: ${chargeId}`);
        }

        // Create allocation record
        await tx.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            chargeId: charge.id,
            amount: numAllocAmount
          }
        });

        // Update charge status and paid amount
        const newPaidAmount = charge.paidAmount + numAllocAmount;
        const newStatus = newPaidAmount >= charge.amount ? 'PAID' : 'PARTIAL';

        await tx.charge.update({
          where: { id: charge.id },
          data: {
            paidAmount: newPaidAmount,
            status: newStatus
          }
        });

        totalAllocated += numAllocAmount;
      }
    }

    if (totalAllocated > amount) {
      throw new Error('Total allocated amount exceeds the payment amount');
    }

    // 3. If any amount remains unallocated, add to resident's credit balance
    const remainingAmount = amount - totalAllocated;
    if (remainingAmount > 0) {
      await tx.resident.update({
        where: { id: residentId },
        data: {
          creditBalance: { increment: remainingAmount }
        }
      });
    }

    return {
      payment,
      allocated: totalAllocated,
      toCredit: remainingAmount
    };
  });
};

export const getAllPayments = async () => {
  return await prisma.payment.findMany({
    include: {
      resident: {
        include: {
          house: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });
};
