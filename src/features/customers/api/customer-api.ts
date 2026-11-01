import { apiClient } from "@/lib/api-client"
import type { ICustomer } from "../types/customer"

export async function getCustomers() {
  return apiClient.get<ICustomer[]>("/customers")
}

export async function createCustomer(newCustomer: Omit<ICustomer, "id" | "created_at">) {
  return apiClient.post<ICustomer>("/customers", newCustomer)
}

export async function updateCustomer(id: string, updates: Partial<ICustomer>) {
  return apiClient.put<ICustomer>(`/customers/${id}`, updates)
}

export async function deleteCustomer(id: string) {
  await apiClient.delete(`/customers/${id}`)
  return true
}