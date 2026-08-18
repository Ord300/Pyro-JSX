import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Dumbbell, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  FileText, 
  CreditCard, 
  Calendar, 
  Bell, 
  MessageSquare, 
  BarChart, 
  Settings,
  Activity,
  MapPin,
  Box
} from 'lucide-react';
import { cn } from '../../utils/cn';

const menuGroups = [
  {
    title: 'Dashboard',
    items: [{ name: 'Aperçu', path: '/admin', icon: LayoutDashboard }]
  },
  {
    title: 'Gestion',
    items: [
      { name: 'Utilisateurs', path: '/admin/users', icon: Users },
      { name: 'Abonnés', path: '/admin/subscribers', icon: UserCheck },
      { name: 'Demandes', path: '/admin/requests', icon: FileText },
          // Abonnements module removed per request
    ]
  },
  {
    title: 'Sport',
    items: [
      { name: 'Activités', path: '/admin/activities', icon: Activity },
      { name: 'Entraîneurs', path: '/admin/trainers', icon: Dumbbell },
      { name: 'Lieux', path: '/admin/places', icon: MapPin },
      { name: 'Équipements', path: '/admin/equipment', icon: Box },
    ]
  },
  {
    title: 'Transactions',
    items: [
      { name: 'Reçus', path: '/admin/receipts', icon: FileText },
    ]
  },
  {
    title: 'Communication',
    items: [
      { name: 'Notifications', path: '/admin/notifications', icon: Bell },
      { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
    ]
  },
  {
    title: 'Système',
    items: [
      { name: 'Rapports', path: '/admin/reports', icon: BarChart },
      { name: 'Paramètres', path: '/admin/settings', icon: Settings },
    ]
  }
];

export function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/admin" className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary-600 dark:text-primary-500" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SPORT ADMIN</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {group.title}
              </h4>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                          ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5",
                        location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"
                      )} />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
