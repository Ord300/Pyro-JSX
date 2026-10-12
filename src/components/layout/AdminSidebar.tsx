"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Bell,
  MessageSquare,
  BarChart,
  Settings,
  Activity,
  Box,
  Image
} from "lucide-react";
import { cn } from "@/src/utils/cn";
import { LogoutButton } from "@/src/components/auth/LogoutButton";

const menuGroups = [
  {
    title: "Dashboard",
    items: [{ name: "Aperçu", path: "/admin", icon: LayoutDashboard }]
  },
  {
    title: "Gestion",
    items: [
      { name: "Utilisateurs", path: "/admin/users", icon: Users },
      { name: "Abonnés", path: "/admin/subscribers", icon: UserCheck },
      { name: "Demandes", path: "/admin/requests", icon: FileText },
    ]
  },
  {
    title: "Sport",
    items: [
      { name: "Activités", path: "/admin/activities", icon: Activity },
      { name: "Entraîneurs", path: "/admin/trainers", icon: Dumbbell },
      { name: "Galerie", path: "/admin/gallery", icon: Image },
    ]
  },
  {
    title: "Transactions",
    items: [
      { name: "Reçus", path: "/admin/receipts", icon: FileText },
    ]
  },
  {
    title: "Communication",
    items: [
      { name: "Notifications", path: "/admin/notifications", icon: Bell },
      { name: "Messages", path: "/admin/messages", icon: MessageSquare },
    ]
  },
  {
    title: "Système",
    items: [
      { name: "Rapports", path: "/admin/reports", icon: BarChart },
      { name: "Paramètres", path: "/admin/settings", icon: Settings },
    ]
  }
];

export function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar — identité violette admin */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-violet-500/15 bg-slate-950/95 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-20 shrink-0 items-center justify-center px-5 border-b border-violet-500/15">
          <Link href="/admin" className="flex items-center justify-center">
            <img
              src="/aigles-logo.png"
              alt="Blason du Football Club Les Aigles du Congo"
              className="h-14 w-auto shrink-0 object-contain"
            />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h4 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {group.title}
              </h4>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
                  return (
                    <li key={item.name} className="px-3">
                      <Link
                        href={item.path}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "admin-nav-item group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                          active
                            ? "admin-nav-active bg-gradient-to-r from-violet-500/20 to-fuchsia-500/5 text-violet-200 shadow-inner shadow-violet-500/10"
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors",
                          active ? "text-violet-300" : "text-slate-500 group-hover:text-violet-300"
                        )} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-violet-500/15 p-4 space-y-3">
          <LogoutButton variant="sidebar" onDone={() => setIsOpen(false)} />
          <p className="px-3 text-xs text-slate-500">Aigles du congo · Console d&apos;administration</p>
        </div>
      </aside>
    </>
  );
}
