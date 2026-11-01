import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/store/use-auth-store"

export interface IUserSignature {
  id?: string | number;
  user_id: string | number;
  signature_path?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  approved_by?: string | number | null;
  approved_at?: string | null;
}

// Upload signature for the currently logged-in user
export async function uploadSignatureFile(file: File) {
  const formData = new FormData()
  formData.append("signature", file)
  return apiClient.post<any>("/user/signature", formData)
}

// Approve signature for a specific user ID
export async function approveUserSignature(userId: string | number) {
  return apiClient.post<any>(`/users/${userId}/signature/approve`)
}

// Reject signature for a specific user ID
export async function rejectUserSignature(userId: string | number, reason: string) {
  return apiClient.post<any>(`/users/${userId}/signature/reject`, {
    rejection_reason: reason,
  })
}

// Fetch signature image securely using Bearer token and convert to base64 Data URL
export async function fetchSignatureImageAsDataUrl(userId: string | number, isPending = false): Promise<string> {
  const token = useAuthStore.getState().token
  if (!token) throw new Error("Token tidak tersedia")
  if (!userId) throw new Error("User ID tidak valid")

  const baseUrl = import.meta.env.VITE_API_URL || "https://royalblue-zebra-481212.hostingersite.com/api"
  const url = `${baseUrl}/users/${userId}/signature${isPending ? "?pending=true" : ""}`

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Gagal mengunduh berkas tanda tangan")
  }

  const blob = await response.blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
