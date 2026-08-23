"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usersDB } from "../services/dbService";

type User = any | null;

type AuthContextValue = {
  user: User;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string; user?: User }>;
  logout: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const email = localStorage.getItem("current_user_email");
    if (email) {
      const found = usersDB.getAll<any>().find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (found) setUser(found);
    }
  }, []);

  const login = async (email: string, password: string) => {
    return new Promise<{ ok: boolean; message?: string; user?: User }>((resolve) => {
      setTimeout(() => {
        const found = usersDB.getAll<any>().find((u) => u.email?.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!found) return resolve({ ok: false, message: "Adresse e-mail ou mot de passe incorrect." });
        localStorage.setItem("current_user_email", found.email.toLowerCase());
        setUser(found);
        resolve({ ok: true, user: found });
      }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem("current_user_email");
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
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