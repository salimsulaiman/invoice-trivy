import { useState, useMemo, useEffect } from "react";
import { getDashboardData } from "../api/dashboard-api";
import { formatChartData } from "@/lib/format-data";

export function useDashboard() {
  const [data, setData] = useState<{
    invoices: any[],
    payments: any[],
    customersCount: number,
    customers: any[]
  }>({
    invoices: [],
    payments: [],
    customersCount: 0,
    customers: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        setIsLoading(true);
        const res = await getDashboardData();
        setData(res);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { ...data, isLoading, error };
}

export function useDashboardFilter(invoices: any[] = [], payments: any[] = []) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const filteredPayments = useMemo(() => {
    return payments.filter((p: any) =>
      new Date(p.payment_date).getFullYear().toString() === selectedYear
    );
  }, [payments, selectedYear]);

  const chartData = useMemo(() => {
    return formatChartData(filteredPayments);
  }, [filteredPayments]);

  const stats = useMemo(() => {
    const totalRevenue = payments
      .filter(p =>
        new Date(p.payment_date).getFullYear().toString() === selectedYear
      )
      .reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0);

    const paidCount = invoices.filter(inv => inv.status === 'paid').length;
    const pendingCount = invoices.filter(inv => inv.status !== 'paid').length;

    return {
      totalRevenue,
      paidCount,
      pendingCount,
      totalCount: invoices.length
    };
  }, [invoices, payments, selectedYear]);

  const yearlyRevenue = useMemo(() => {
    const currentYear = selectedYear;
    const prevYear = (Number(selectedYear) - 1).toString();

    const current = payments
      .filter(p => new Date(p.payment_date).getFullYear().toString() === currentYear)
      .reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0);

    const previous = payments
      .filter(p => new Date(p.payment_date).getFullYear().toString() === prevYear)
      .reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0);

    return { current, previous };
  }, [payments, selectedYear]);

  const growth = useMemo(() => {
    if (yearlyRevenue.previous === 0) return 0;

    return (
      ((yearlyRevenue.current - yearlyRevenue.previous) /
        yearlyRevenue.previous) *
      100
    );
  }, [yearlyRevenue]);

  return {
    selectedYear,
    setSelectedYear,
    filteredPayments,
    chartData,
    stats,
    growth
  };
}