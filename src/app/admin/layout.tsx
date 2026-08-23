"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/src/components/layout/AdminSidebar";
import { AdminNavbar } from "@/src/components/layout/AdminNavbar";
import { useAuth } from "@/src/contexts/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const auth = useAuth();
  if (!auth.user || auth.user.role !== "Gestionnaire") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background dark:bg-dark-background text-slate-900 dark:text-slate-50 overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}