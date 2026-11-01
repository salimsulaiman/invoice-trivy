import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;


export interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
}


export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  metadata: UserMetadata;
  last_sign_in_at?: string;
}


export interface AuthResponse {
  user: AuthUser | null;
  session: any | null;
  error?: string;
}

export interface IUser {
  id: string | number;
  name: string | null;
  email: string | null;
  role: 'admin' | 'superadmin' | 'owner' | 'worker' | string;
  created_at?: string;
  has_signature?: boolean;
  has_pending_signature?: boolean;
}