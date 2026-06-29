import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, tokenIsExpired, tokenStore } from "../services/api";
import type { User } from "../types/user";

type AuthResponse = { token: string; expiresIn: number; user: User };
type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(fullName: string, email: string, password: string): Promise<{ requiresApproval: boolean }>;
  logout(): void;
  refreshUser(): Promise<void>;
  setUser(user: User): void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = tokenStore.get();
    if (!token || tokenIsExpired(token)) {
      logout();
      return;
    }
    const response = await apiRequest<{ user: User }>("/users/me");
    setUser(response.user);
  }, [logout]);

  useEffect(() => {
    refreshUser().catch(logout).finally(() => setLoading(false));
    const handleExpired = () => logout();
    window.addEventListener("auth:expired", handleExpired);
    const timer = window.setInterval(() => {
      const token = tokenStore.get();
      if (token && tokenIsExpired(token)) logout();
    }, 15_000);
    return () => {
      window.removeEventListener("auth:expired", handleExpired);
      window.clearInterval(timer);
    };
  }, [logout, refreshUser]);

  async function authenticate(path: string, body: object) {
    const response = await apiRequest<AuthResponse>(path, {
      method: "POST",
      body: JSON.stringify(body)
    });
    tokenStore.set(response.token);
    setUser(response.user);
  }

  async function registerAccount(fullName: string, email: string, password: string) {
    const response = await apiRequest<AuthResponse & { requiresApproval: boolean }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password })
    });
    if (response.token) {
      tokenStore.set(response.token);
      setUser(response.user);
    }
    return { requiresApproval: response.requiresApproval };
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: (email, password) => authenticate("/auth/login", { email, password }),
    register: registerAccount,
    logout,
    refreshUser,
    setUser
  }), [loading, logout, refreshUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
