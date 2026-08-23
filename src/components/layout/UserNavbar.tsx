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
        <Button variant="ghost" size="icon" className="relative text-emerald-200 hover:bg-emerald-500/10 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-amber-400 border-2 border-emerald-950"></span>
        </Button>
        <ThemeToggle />
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