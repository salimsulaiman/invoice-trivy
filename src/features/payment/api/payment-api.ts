import { apiClient } from "@/lib/api-client"
import type { CreatePaymentInput, IPayment } from "../types/payment";

function normalizePayment(payment: any): IPayment {
  if (!payment) return payment;
  const normalized = { ...payment };
  if (normalized.invoice && !normalized.invoices) {
    normalized.invoices = normalized.invoice;
  }
  return normalized as IPayment;
}

export async function getPaymentsByInvoice(invoiceId: string) {
  // Query all payments and filter by invoice_id locally for robustness, or pass as query parameter.
  const data = await apiClient.get<any[]>("/payments")
  const payments = data || [];
  return payments
    .filter((p) => String(p.invoice_id) === String(invoiceId))
    .map(normalizePayment);
}

export async function getAllPayments() {
  const data = await apiClient.get<any[]>("/payments")
  return (data || []).map(normalizePayment);
}

function generateReferenceNumber() {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()
  const timestamp = Date.now().toString().slice(-6)
  return `PAY-${timestamp}-${random}`
}

export async function createPayment(input: CreatePaymentInput) {
  const reference_number = generateReferenceNumber()
  
  const payload = {
    invoice_id: input.invoice_id,
    user_id: input.user_id,
    amount_paid: input.amount_paid,
    payment_date: input.payment_date,
    method: input.method,
    reference_number,
    note: input.note
  }

  const data = await apiClient.post<any>("/payments", payload)
  return normalizePayment(data);
}

export async function deletePayment(id: string) {
  await apiClient.delete(`/payments/${id}`);
  return true;
}