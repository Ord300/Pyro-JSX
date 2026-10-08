"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Menu, MessageSquare, Search, LogOut } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from '../ui/Button';
import { messagesDB } from '@/src/services/dbService';
import { useAuth } from '@/src/contexts/AuthContext';

export function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const load = useCallback(async () => {
    const rows = await messagesDB.getAll<any>();
    setUnreadMessages(rows.filter((row) => row.sender === "Abonné" && !row.readByAdmin).length);
  }, []);

  useEffect(() => {
    load();
    return messagesDB.subscribe(load);
  }, [load]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-violet-500/15 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden text-slate-300 hover:bg-white/5 hover:text-white">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex relative w-64 lg:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full rounded-lg border border-violet-500/20 bg-white/5 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/admin/notifications">
          <Button variant="ghost" size="icon" className="relative text-slate-300 hover:bg-white/5 hover:text-violet-300" title="Notifications">
            <Bell className="h-5 w-5" />
            {unreadMessages > 0 && (
              <span className="absolute top-1.5 right-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500 border border-slate-950"></span>
              </span>
            )}
          </Button>
        </Link>
        <Link href="/admin/messages">
          <Button variant="ghost" size="icon" className="relative text-slate-300 hover:bg-white/5 hover:text-violet-300" title="Messages des abonnés">
            <MessageSquare className="h-5 w-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white border-2 border-slate-950">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Button>
        </Link>
        <div className="ml-2 flex items-center gap-2 border-l border-violet-500/15 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 font-bold text-sm text-white shadow-md shadow-violet-500/40">
            {(user?.name?.[0] ?? user?.email?.[0] ?? "A").toUpperCase()}
          </div>
          <span className="hidden text-sm font-medium text-slate-200 sm:block">{user?.name ?? "Admin"}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Déconnexion" className="text-slate-300 hover:bg-red-500/10 hover:text-red-300">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
