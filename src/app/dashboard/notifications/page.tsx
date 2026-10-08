"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/utils/cn";
import { notificationsDB } from "@/src/services/dbService";
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Notification {
  id: number;
  userEmail: string;
  title: string;
  message: string;
  type: string;
  audience?: string;
  createdAt: string;
  read: boolean;
}

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const email = (
      localStorage.getItem("current_user_email") ||
      localStorage.getItem("current_subscriber_email") ||
      ""
    ).toLowerCase();
    if (!email) return;
    const rows = await notificationsDB.getAll<Notification>();
    setNotifications(
      rows
        .filter((row) => row.userEmail?.toLowerCase() === email)
        .sort((a, b) => b.id - a.id)
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    return notificationsDB.subscribe(load);
  }, [load]);

  const markAsRead = async (id: number) => {
    await notificationsDB.update(id, { read: true });
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => notificationsDB.update(n.id, { read: true })));
  };

  const deleteNotification = async (id: number) => {
    await notificationsDB.delete(id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      default: return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const formatDate = (value: string) => {
    const ts = new Date(value).getTime();
    if (Number.isNaN(ts)) return String(value ?? "");
    return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">Notifications</h1>
          <p className="mt-1 text-sm text-emerald-900/60 dark:text-emerald-200/60">
            {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : "Toutes les notifications sont lues"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Tout marquer comme lu
        </Button>
      </div>

      <div className="space-y-3">
        {!loading && notifications.length === 0 && (
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
              !notification.read && "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getTypeIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{notification.title}</h3>
                  <div className="flex items-center gap-2">
                    {!notification.read && <Badge variant="default">Nouveau</Badge>}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(notification.createdAt)}</span>
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
