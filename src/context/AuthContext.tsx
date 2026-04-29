"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthContext] checking stored session");
    const stored = localStorage.getItem("mobelo_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        console.log("[AuthContext] restored session for:", parsed.email);
      } catch {
        console.warn("[AuthContext] failed to parse stored user");
        localStorage.removeItem("mobelo_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (user: User) => {
    console.log("[AuthContext] login:", user.email);
    setUser(user);
    localStorage.setItem("mobelo_user", JSON.stringify(user));
  };

  const logout = () => {
    console.log("[AuthContext] logout");
    setUser(null);
    localStorage.removeItem("mobelo_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
