import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usersDB } from '../services/dbService';
import { UserSidebar } from '../components/layout/UserSidebar';
import { UserNavbar } from '../components/layout/UserNavbar';

export function UserLayout() {
  const email = localStorage.getItem('current_user_email');
  const user = email ? usersDB.getAll<any>().find(item => item.email.toLowerCase() === email) : null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background dark:bg-dark-background text-slate-900 dark:text-slate-50 overflow-hidden">
      <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <UserNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
