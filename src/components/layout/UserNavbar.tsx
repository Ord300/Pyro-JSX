"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "../ui/Button";
import Link from "next/link";
import { notificationsDB, usersDB } from "@/src/services/dbService";

export function UserNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [name, setName] = useState("Abonné");
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUser = useCallback(async () => {
    const email = localStorage.getItem("current_user_email") || "";
    if (!email) return;
    const users = await usersDB.getAll<any>();
    setName(users.find((user) => user.email.toLowerCase() === email)?.name || email.split("@")[0]);
  }, []);

  const loadNotifications = useCallback(async () => {
    const email = (
      localStorage.getItem("current_user_email") ||
      localStorage.getItem("current_subscriber_email") ||
      ""
    ).toLowerCase();
    if (!email) return;
    const rows = await notificationsDB.getAll<any>();
    setUnreadCount(rows.filter((row) => row.userEmail?.toLowerCase() === email && !row.read).length);
  }, []);

  useEffect(() => {
    loadUser();
    loadNotifications();
    return notificationsDB.subscribe(loadNotifications);
  }, [loadUser, loadNotifications]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-emerald-800/40 bg-emerald-950/95 backdrop-blur-sm px-4 dark:border-emerald-800/40 dark:bg-emerald-950/95 sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden text-emerald-200 hover:bg-emerald-500/10 hover:text-white">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="hidden lg:block text-sm font-medium text-emerald-200/80">
          Espace personnel
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/dashboard/notifications">
          <Button variant="ghost" size="icon" className="relative text-emerald-200 hover:bg-emerald-500/10 hover:text-white" title="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-emerald-950 border-2 border-emerald-950">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>
        <div className="ml-2 flex items-center gap-2 border-l border-emerald-800/40 pl-4">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-sm">
            {name.split(/[.\s_-]/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <span className="hidden text-sm font-medium text-emerald-100 sm:block">{name}</span>
          <Link href="/">
            <Button variant="ghost" size="sm" className="hidden lg:block ml-2 text-xs text-emerald-200 hover:bg-emerald-500/10 hover:text-white">
              Quitter
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
