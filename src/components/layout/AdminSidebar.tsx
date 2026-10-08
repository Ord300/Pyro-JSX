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
  Image,
  LogOut
} from "lucide-react";
import { cn } from "@/src/utils/cn";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";

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
      { name: "Équipements", path: "/admin/equipment", icon: Box },
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
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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
        <div className="flex h-16 shrink-0 items-center px-5 border-b border-violet-500/15">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30">
              <Dumbbell className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              MoveUp
              <span className="ml-2 rounded-md border border-violet-400/40 bg-violet-500/15 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-widest text-violet-300">
                Admin
              </span>
            </span>
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
          {user && (
            <div className="flex items-center gap-3 px-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-bold text-white">
                {(user.name?.[0] ?? user.email?.[0] ?? "A").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">{user.name ?? "Admin"}</p>
                <p className="truncate text-xs text-slate-500">{user.email ?? ""}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
          <p className="px-3 text-xs text-slate-500">MoveUp · Console d&apos;administration</p>
        </div>
      </aside>
    </>
  );
}
