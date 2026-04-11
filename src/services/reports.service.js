import prisma from '../config/prisma.js';

export const getFinancialSummary = async () => {
  const [totalCharges, totalPayments] = await Promise.all([
    prisma.charge.aggregate({ _sum: { amount: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } })
  ]);

  const charged = totalCharges._sum.amount || 0;
  const paid = totalPayments._sum.amount || 0;
  const outstanding = charged - paid;

  return {
    totalCharged: charged,
    totalReceived: paid,
    outstandingBalance: outstanding
  };
};

export const getMonthlyTrends = async () => {
  // 1. Get the last 6 months (including current)
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthStr);
  }

  // 2. Fetch all charges and payments for these months
  const [chargesByMonth, payments] = await Promise.all([
    prisma.charge.groupBy({
      by: ['month'],
      where: { month: { in: months } },
      _sum: { amount: true }
    }),
    prisma.payment.findMany({
      where: {
        date: {
          gte: new Date(now.getFullYear(), now.getMonth() - 5, 1)
        }
      }
    })
  ]);
  
  // 3. Map to the expected format
  return months.map(month => {
    const monthCharges = chargesByMonth.find(c => c.month === month)?._sum.amount || 0;
    
    // Total payments for this month (using payment date)
    const monthPayments = payments
      .filter(p => p.date.toISOString().startsWith(month))
      .reduce((sum, p) => sum + p.amount, 0);

    // Format for display (e.g. "Apr 2026")
    const d = new Date(month + '-01');
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      name: label,
      received: monthPayments,
      outstanding: Math.max(0, monthCharges - monthPayments)
    };
  });
};
