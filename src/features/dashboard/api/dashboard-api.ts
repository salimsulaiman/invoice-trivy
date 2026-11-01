import { apiClient } from "@/lib/api-client";

export async function getDashboardData() {
  const [invoices, customers, payments] = await Promise.all([
    apiClient.get<any[]>("/invoices"),
    apiClient.get<any[]>("/customers"),
    apiClient.get<any[]>("/payments")
  ]);

  return {
    invoices: invoices || [],
    payments: payments || [],
    customersCount: customers?.length || 0,
    customers: customers || []
  };
}