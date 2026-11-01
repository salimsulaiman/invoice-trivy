import { apiClient } from "@/lib/api-client"

export interface IUserModel {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'worker' | 'owner' | string;
  created_at?: string;
  has_signature?: boolean;
  has_pending_signature?: boolean;
}

export async function getUsers() {
  return apiClient.get<IUserModel[]>("/users")
}

export async function createUser(payload: Omit<IUserModel, 'id'> & { password?: string }) {
  return apiClient.post<IUserModel>("/users", payload)
}

export async function updateUser(id: string | number, payload: Partial<IUserModel> & { password?: string }) {
  const data = { ...payload }
  if (!data.password) {
    delete data.password
  }
  return apiClient.put<IUserModel>(`/users/${id}`, data)
}

export async function deleteUser(id: string | number) {
  await apiClient.delete(`/users/${id}`)
  return true
}
