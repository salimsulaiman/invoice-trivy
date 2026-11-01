import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser } from '@/features/auth/types/auth';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: IUser | null, token: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: (user, token) => set({ 
        user, 
        token,
        isAuthenticated: !!user && !!token, 
        isLoading: false 
      }),
      setLoading: (loading) => set({ isLoading: loading }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false, isLoading: false }),
    }),
    { name: 'auth-storage' }
  )
);