"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";
import { usersDB } from "@/src/services/dbService";
import { useAuth } from "@/src/contexts/AuthContext";

export function TrainerNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [name, setName] = useState("Coach");
  const { logout } = useAuth();
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const email = localStorage.getItem("current_user_email") || "";
    if (!email) return;
    const users = await usersDB.getAll<any>();
    setName(users.find((user) => user.email.toLowerCase() === email)?.name || email.split("@")[0]);
  }, []);

  useEffect(() => {
    loadUser();
    return usersDB.subscribe(loadUser);
  }, [loadUser]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-sky-800/40 bg-sky-950/95 backdrop-blur-sm px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden text-sky-200 hover:bg-sky-500/10 hover:text-white">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="hidden lg:block text-sm font-medium text-sky-200/80">
          Espace entraîneur
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="ml-2 flex items-center gap-2 border-l border-sky-800/40 pl-4">
          <div className="h-8 w-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 font-bold text-sm">
            {name.split(/[.\s_-]/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <span className="hidden text-sm font-medium text-sky-100 sm:block">{name}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Déconnexion" className="text-sky-200 hover:bg-red-500/10 hover:text-red-300">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
