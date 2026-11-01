// lib/format-data.ts
export const formatChartData = (payments: any[]) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const data = months.map((month, index) => {
    const total = payments
      .filter(p => new Date(p.payment_date).getMonth() === index)
      .reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);

    return { name: month, total };
  });

  return data;
};