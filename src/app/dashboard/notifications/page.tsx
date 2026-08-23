"use client";

import { useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/utils/cn";
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  date: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Abonnement confirmé",
    message: "Votre abonnement mensuel Fitness a été activé avec succès.",
    type: "success",
    date: "2026-08-10",
    read: false,
  },
  {
    id: 2,
    title: "Réservation à venir",
    message: "Votre séance de Boxe est prévue demain à 18:00.",
    type: "info",
    date: "2026-08-14",
    read: false,
  },
  {
    id: 3,
    title: "Paiement en attente",
    message: "Votre paiement de 45 USD est en attente de confirmation.",
    type: "warning",
    date: "2026-08-12",
    read: true,
  },
  {
    id: 4,
    title: "Nouvelle activité disponible",
    message: "Le cours de Zumba est maintenant disponible dans le programme.",
    type: "info",
    date: "2026-08-08",
    read: true,
  },
];

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      default: return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : "Toutes les notifications sont lues"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Aucune notification</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Vous n'avez pas de notifications pour le moment.
            </p>
          </Card>
        )}

        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={cn(
              "p-4 transition-colors",
              !notification.read && "border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/10"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getTypeIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{notification.title}</h3>
                  <div className="flex items-center gap-2">
                    {!notification.read && <Badge variant="default">Nouveau</Badge>}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{notification.date}</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{notification.message}</p>
                <div className="mt-3 flex gap-2">
                  {!notification.read && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                      Marquer comme lu
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                    <Trash2 className="mr-1 h-3 w-3" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}