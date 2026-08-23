"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "../ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";
import { usersDB } from "@/src/services/dbService";

export function UserNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const email = localStorage.getItem("current_user_email") || "";
  const name = email ? usersDB.getAll<any>().find((user) => user.email.toLowerCase() === email)?.name || email.split("@")[0] : "Abonné";
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-primary-500 border-2 border-white dark:border-slate-900"></span>
        </Button>
        <ThemeToggle />
        <div className="ml-2 flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold dark:bg-slate-800 dark:text-slate-200">
            {name.split(/[.\s_-]/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">{name}</span>
          <Link href="/">
            <Button variant="ghost" size="sm" className="hidden lg:block ml-2 text-xs">Quitter</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}