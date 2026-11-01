import { useAuthStore } from "@/store/use-auth-store";
import { Navigate, Outlet } from "react-router-dom";

export function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}