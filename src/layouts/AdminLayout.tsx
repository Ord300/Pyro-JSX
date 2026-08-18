import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminNavbar } from '../components/layout/AdminNavbar';
import { usersDB } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

// AdminLayout protège toutes les routes /admin — redirige vers /login si non authentifié

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const auth = useAuth();
  if (!auth.user || auth.user.role !== 'Gestionnaire') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background dark:bg-dark-background text-slate-900 dark:text-slate-50 overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
