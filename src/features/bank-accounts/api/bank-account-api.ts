import { apiClient } from "@/lib/api-client"
import type { IBankAccount } from "../types/bank-account"

export type BankAccountPayload = Omit<
  IBankAccount,
  "id" | "created_at" | "updated_at" | "sort_order"
> & { sort_order?: number }

export async function getBankAccounts() {
  return apiClient.get<IBankAccount[]>("/bank-accounts")
}

export async function createBankAccount(newBankAccount: BankAccountPayload) {
  return apiClient.post<IBankAccount>("/bank-accounts", newBankAccount)
}

export async function updateBankAccount(id: string, updates: Partial<BankAccountPayload>) {
  return apiClient.put<IBankAccount>(`/bank-accounts/${id}`, updates)
}

export async function deleteBankAccount(id: string) {
  await apiClient.delete(`/bank-accounts/${id}`)
  return true
}

export async function toggleBankAccountActive(id: string) {
  return apiClient.patch<IBankAccount>(`/bank-accounts/${id}/toggle-active`, {})
}

export async function reorderBankAccounts(ids: string[]) {
  return apiClient.post<IBankAccount[]>("/bank-accounts/reorder", { ids })
}