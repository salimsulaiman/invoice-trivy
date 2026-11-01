import { useAuthStore } from "@/store/use-auth-store";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL || "https://royalblue-zebra-481212.hostingersite.com/api";

function getToken(): string | null {
  const storageStr = localStorage.getItem("auth-storage");
  if (!storageStr) return null;
  try {
    const parsed = JSON.parse(storageStr);
    return parsed.state?.token || null;
  } catch (e) {
    return null;
  }
}

function handleUnauthorized() {
  // 1. Hapus token & data user
  useAuthStore.getState().clearAuth();

  // 2. Hapus cache auth
  queryClient.clear();

  // 3. Tampilkan pesan
  toast.error("Session expired. Please login again.");

  // 4. Redirect ke login
  window.location.href = "/auth/login";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Session expired. Please login again.");
  }

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),
    
  post: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  put: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  patch: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
