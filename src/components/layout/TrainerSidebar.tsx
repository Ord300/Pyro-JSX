"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  Activity,
  User,
  LogOut,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/src/utils/cn";
import { useAuth } from "@/src/contexts/AuthContext";

const menuItems = [
  { name: "Tableau de bord", path: "/trainer", icon: LayoutDashboard },
  { name: "Mes abonnés", path: "/trainer/subscribers", icon: Users },
  { name: "Présences", path: "/trainer/attendance", icon: ClipboardCheck },
  { name: "Mes activités", path: "/trainer/activities", icon: Activity },
  { name: "Profil", path: "/trainer/profile", icon: User },
];

export function TrainerSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-sky-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sky-800/40 bg-gradient-to-b from-sky-950 via-sky-900 to-cyan-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-sky-800/40">
          <Link href="/trainer" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20">
              <Dumbbell className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">ESPACE COACH</span>
              <span className="text-[10px] font-medium text-sky-400/80 tracking-wide uppercase">Mes abonnés</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sky-500/70">Navigation</p>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    pathname === item.path
                      ? "bg-sky-500/15 text-sky-300 border border-sky-500/20 shadow-lg shadow-sky-500/5"
                      : "text-sky-100/70 hover:text-white hover:bg-sky-500/10 border border-transparent"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    pathname === item.path
                      ? "text-sky-400"
                      : "text-sky-200/50 group-hover:text-sky-300"
                  )} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-3 pb-6 space-y-3">
          {user && (
            <div className="flex items-center gap-3 rounded-xl border border-sky-700/30 bg-sky-500/10 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-300">
                {(user.name?.[0] ?? user.email?.[0] ?? "C").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sky-100">{user.name ?? "Coach"}</p>
                <p className="truncate text-xs text-sky-300/60">{user.email ?? ""}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sky-200/70 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
