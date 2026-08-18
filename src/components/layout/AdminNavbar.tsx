import React from 'react';
import { Bell, Menu, MessageSquare, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ThemeToggle } from './ThemeToggle';

export function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex relative w-64 lg:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input type="text" placeholder="Rechercher..." className="pl-10" />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
        </Button>
        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <div className="ml-2 flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold dark:bg-primary-900/50 dark:text-primary-400">
            A
          </div>
          <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">Admin</span>
        </div>
      </div>
    </header>
  );
}
