"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { usersDB } from "@/src/services/dbService";
import { TrainerSidebar } from "@/src/components/layout/TrainerSidebar";
import { TrainerNavbar } from "@/src/components/layout/TrainerNavbar";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const email = localStorage.getItem("current_user_email");
      if (email) {
        const users = await usersDB.getAll<any>();
        const found = users.find((item) => item.email.toLowerCase() === email);
        setUser(found || null);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/login");
    }
    if (!isLoading && user?.mustChangePassword) {
      redirect("/change-password");
    }
    if (!isLoading && user && user.role !== "Entraîneur") {
      redirect(user.role === "Gestionnaire" ? "/admin" : "/dashboard");
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-sky-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm text-sky-200">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-sky-950/5 text-slate-900 dark:text-slate-50 overflow-hidden">
      <TrainerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TrainerNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-sky-50/80 via-cyan-50/50 to-slate-50 dark:from-sky-950/20 dark:via-cyan-950/20 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
