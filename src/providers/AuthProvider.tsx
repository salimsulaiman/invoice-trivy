import { useEffect } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { getCurrentUser } from "@/features/auth/api/auth-api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const syncUser = async () => {
      const token = useAuthStore.getState().token;
      if (!token) {
        clearAuth();
        setLoading(false);
        return;
      }
      try {
        const user = await getCurrentUser();
        if (user) {
          setAuth(user, token);
        } else {
          clearAuth();
        }
      } catch (error) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, [setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}