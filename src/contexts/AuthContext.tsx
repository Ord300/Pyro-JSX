"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type User = any | null;

type LoginResult = { ok: boolean; message?: string; user?: User };

type AuthContextValue = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restauration de session : on relit l'e-mail stocké puis on
  // recharge le profil depuis la base de données (SQLite via API).
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      if (typeof window === "undefined") return;
      const email = localStorage.getItem("current_user_email");
      if (!email) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/auth/session?email=${encodeURIComponent(email)}`, { cache: "no-store" });
        const found = await response.json();
        if (!cancelled) setUser(found ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, message: data?.error || "Connexion impossible." };
      localStorage.setItem("current_user_email", data.email.toLowerCase());
      setUser(data);
      return { ok: true, user: data };
    } catch {
      return { ok: false, message: "Serveur injoignable. Réessayez plus tard." };
    }
  };

  const logout = () => {
    localStorage.removeItem("current_user_email");
    localStorage.removeItem("current_subscriber_email");
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    login,
    logout,
    isAdmin: !!user && user.role === "Gestionnaire",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthProvider;
