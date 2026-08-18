import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { Footer } from '../components/layout/Footer';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-dark-background text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
