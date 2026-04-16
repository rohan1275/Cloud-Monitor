"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  alertEmail?: string;
  emailNotifications?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_ROUTES = ["/login", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem("cm_token");
    const storedUser = localStorage.getItem("cm_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      const isPublic = PUBLIC_ROUTES.includes(pathname);
      if (!user && !isPublic) router.push("/login");
      if (user && isPublic) router.push("/");
    }
  }, [user, loading, pathname]);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem("cm_token", t);
    localStorage.setItem("cm_user", JSON.stringify(u));
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    router.push("/");
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/signup", { name, email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem("cm_token", t);
    localStorage.setItem("cm_user", JSON.stringify(u));
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    router.push("/");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("cm_token");
    localStorage.removeItem("cm_user");
    delete api.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("cm_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
