import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sp_user");
      const token = localStorage.getItem("sp_access_token");
      if (stored && token) {
        try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const data = await api.login(email, password, rememberMe);
    setUser(data.user);
    localStorage.setItem("sp_user", JSON.stringify(data.user));
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await api.register(userData);
    setUser(data.user);
    localStorage.setItem("sp_user", JSON.stringify(data.user));
    return data;
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.fetch("/auth/me");
      setUser(data);
      localStorage.setItem("sp_user", JSON.stringify(data));
    } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
