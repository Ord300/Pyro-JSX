"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type User = any | null;

type LoginResult = { ok: boolean; message?: string; user?: User };

type AuthContextValue = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restauration de session : le cookie httpOnly signé fait foi.
  // L'e-mail local n'est qu'un pense-bête d'affichage/filtrage.
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      if (typeof window === "undefined") return;
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const found = await response.json();
        if (!cancelled) {
          setUser(found ?? null);
          if (found?.email) {
            try {
              localStorage.setItem("current_user_email", String(found.email).toLowerCase());
            } catch {
              // ignore
            }
          }
        }
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
      try {
        localStorage.setItem("current_user_email", String(data.email).toLowerCase());
      } catch {
        // ignore
      }
      setUser(data);
      return { ok: true, user: data };
    } catch {
      return { ok: false, message: "Serveur injoignable. Réessayez plus tard." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore : on nettoie quand même côté client
    }
    try {
      localStorage.removeItem("current_user_email");
      localStorage.removeItem("current_subscriber_email");
    } catch {
      // ignore (SSR)
    }
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
