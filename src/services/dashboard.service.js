import prisma from '../config/prisma.js';

export const getStats = async () => {
  const [residentCount, houseCount, totalCharges, totalPayments] = await Promise.all([
    prisma.resident.count(),
    prisma.house.count(),
    prisma.charge.aggregate({ _sum: { amount: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
  ]);

  const charges = totalCharges._sum.amount || 0;
  const payments = totalPayments._sum.amount || 0;
  const balance = charges - payments;

  return {
    residents: residentCount,
    houses: houseCount,
    totalBalance: balance,
    monthlyRevenue: payments, // Simplified for now
  };
};

export const getRecentActivity = async () => {
  const [recentCharges, recentPayments] = await Promise.all([
    prisma.charge.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        resident: {
          include: { house: true }
        }
      }
    }),
    prisma.payment.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      include: {
        resident: {
          include: { house: true }
        }
      }
    })
  ]);

  const activities = [
    ...recentCharges.map(c => ({
      id: `charge-${c.id}`,
      type: 'Charge',
      title: `${c.type} Applied`,
      amount: c.amount,
      resident: c.resident.name,
      house: c.resident.house?.name || 'N/A',
      date: c.createdAt,
      status: c.status
    })),
    ...recentPayments.map(p => ({
      id: `payment-${p.id}`,
      type: 'Payment',
      title: `Payment Received`,
      amount: -p.amount, // Negative for OPOS
      resident: p.resident.name,
      house: p.resident.house?.name || 'N/A',
      date: p.date,
      status: 'Paid'
    }))
  ];

  return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
};
