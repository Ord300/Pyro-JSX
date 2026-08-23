"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  CreditCard,
  Bell,
  History,
  User,
  FileText
} from "lucide-react";
import { cn } from "@/src/utils/cn";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Mon abonnement", path: "/dashboard/subscription", icon: CreditCard },
  { name: "Reçus", path: "/dashboard/receipts", icon: FileText },
  { name: "Historique", path: "/dashboard/history", icon: History },
  { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
  { name: "Profil", path: "/dashboard/profile", icon: User },
];

export function UserSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-emerald-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-emerald-800/40 bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-emerald-800/40">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
              <Dumbbell className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">ESPACE ABONNÉ</span>
              <span className="text-[10px] font-medium text-emerald-400/80 tracking-wide uppercase">Mon espace personnel</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-emerald-500/70">Navigation</p>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    pathname === item.path
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                      : "text-emerald-100/70 hover:text-white hover:bg-emerald-500/10 border border-transparent"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    pathname === item.path
                      ? "text-emerald-400"
                      : "text-emerald-200/50 group-hover:text-emerald-300"
                  )} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-3 pb-6">
          <div className="rounded-xl border border-emerald-700/30 bg-emerald-500/10 p-4">
            <p className="text-[11px] font-medium text-emerald-200/80">Besoin d'aide ?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-300/60">Contactez l'administration du centre sportif.</p>
          </div>
        </div>
      </aside>
    </>
  );
}