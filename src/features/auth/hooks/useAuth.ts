import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login, logout } from "../api/auth-api";
import { useAuthStore } from "@/store/use-auth-store";

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Login failed");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
    },
    onError: (error: any) => {
      // Even if network request fails, clear local auth
      queryClient.clear();
      clearAuth();
      toast.error(error.message || "Logout failed");
    }
  });
}