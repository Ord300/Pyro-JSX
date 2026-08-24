"use client";

import { useState, useEffect } from "react";
import { usePathname, redirect } from "next/navigation";
import { AdminSidebar } from "@/src/components/layout/AdminSidebar";
import { AdminNavbar } from "@/src/components/layout/AdminNavbar";
import { useAuth } from "@/src/contexts/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const auth = useAuth();
  if (!auth.isLoading && (!auth.user || auth.user.role !== "Gestionnaire")) {
    redirect("/login");
  }

  return (
    <div className="admin-scope flex h-screen bg-dark-background text-slate-50 overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main key={pathname} className="admin-fade-in flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
