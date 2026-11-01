import { apiClient } from "@/lib/api-client"
import type { LoginInput, RegisterInput } from "../types/auth"

export async function login({ email, password }: LoginInput) {
  const data = await apiClient.post<any>("/login", {
    email,
    password,
  })

  const token = data.token || data.access_token || data.data?.token || data.data?.access_token;

  if (!token) {
    throw new Error("Token tidak ditemukan dalam respons server.");
  }

  const baseUrl = import.meta.env.VITE_API_URL || "https://royalblue-zebra-481212.hostingersite.com/api";
  let user = data.user || data.data?.user || data;

  try {
    const userRes = await fetch(`${baseUrl}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (userRes.ok) {
      user = await userRes.json();
    }
  } catch (err) {
    console.error("Gagal sinkronisasi profil user saat login:", err);
  }

  return { token, user }
}

export async function register({ email, password, name }: RegisterInput) {
  return apiClient.post<any>("/register", {
    email,
    password,
    name,
  })
}

export async function logout() {
  return apiClient.post<any>("/logout")
}

export async function getCurrentUser() {
  return apiClient.get<any>("/user")
}

export async function updateUserProfile(id: string | number, updates: any) {
  const payload = { ...updates }
  if (!payload.password) {
    delete payload.password
  }
  return apiClient.put<any>(`/users/${id}`, payload)
}