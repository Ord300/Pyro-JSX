import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Dumbbell, 
  LayoutDashboard, 
  CreditCard, 
  Calendar, 
  Bell, 
  History, 
  User,
  FileText
} from 'lucide-react';
import { cn } from '../../utils/cn';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Mon abonnement', path: '/dashboard/subscription', icon: CreditCard },
  { name: 'Réservations', path: '/dashboard/reservations', icon: Calendar },
  { name: 'Paiements', path: '/dashboard/payments', icon: CreditCard },
  { name: 'Reçus', path: '/dashboard/receipts', icon: FileText },
  { name: 'Historique', path: '/dashboard/history', icon: History },
  { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
  { name: 'Profil', path: '/dashboard/profile', icon: User },
];

export function UserSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary-600 dark:text-primary-500" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ESPACE ABONNÉ</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    location.pathname === item.path
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"
                  )} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
