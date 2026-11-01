import { apiClient } from "@/lib/api-client"
import type { CreateInvoiceInput, IInvoice } from "../types/invoice"

function normalizeInvoice(invoice: any): IInvoice {
  if (!invoice) return invoice;
  const normalized = { ...invoice };
  if (normalized.customer && !normalized.customers) {
    normalized.customers = normalized.customer;
  }
  if (normalized.items && !normalized.invoice_items) {
    normalized.invoice_items = normalized.items;
  }
  return normalized as IInvoice;
}

export async function getInvoices() {
  const data = await apiClient.get<any[]>("/invoices")
  return (data || []).map(normalizeInvoice)
}

export async function getInvoiceById(id: string) {
  const data = await apiClient.get<any>(`/invoices/${id}`)
  return normalizeInvoice(data)
}

export async function createInvoice(input: CreateInvoiceInput) {
  // Post the invoice and items payload directly. The Laravel API handles creation and project creation.
  const data = await apiClient.post<any>("/invoices", input)
  return normalizeInvoice(data)
}

export async function updateInvoice(id: string, updates: any) {
  // Put the updates to the invoice. The Laravel API handles item syncing and project updating.
  const data = await apiClient.put<any>(`/invoices/${id}`, updates)
  return normalizeInvoice(data)
}

export async function deleteInvoice(id: string) {
  await apiClient.delete(`/invoices/${id}`)
  return true
}

export async function updateInvoiceStatus(id: string, status: IInvoice['status']) {
  const data = await apiClient.patch<any>(`/invoices/${id}`, { status })
  return normalizeInvoice(data)
}