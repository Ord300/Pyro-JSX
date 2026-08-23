"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { usersDB } from "@/src/services/dbService";
import { UserSidebar } from "@/src/components/layout/UserSidebar";
import { UserNavbar } from "@/src/components/layout/UserNavbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("current_user_email");
    if (email) {
      const found = usersDB.getAll<any>().find((item) => item.email.toLowerCase() === email);
      setUser(found || null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/login");
    }
    if (!isLoading && user?.mustChangePassword) {
      redirect("/change-password");
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background dark:bg-dark-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background dark:bg-dark-background text-slate-900 dark:text-slate-50 overflow-hidden">
      <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <UserNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}