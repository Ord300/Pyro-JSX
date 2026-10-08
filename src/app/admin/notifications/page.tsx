"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Info, Send, Trash2, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { useActivities } from "@/src/hooks/queries/activities";
import { notificationsDB, subscriptionsDB, usersDB } from "@/src/services/dbService";
import { sendImportantEmail } from "@/src/services/notifyService";

type Notification = {
  id: number;
  userEmail: string;
  title: string;
  message: string;
  type: string;
  audience: string;
  createdAt: string;
  read: boolean;
};

const TYPE_OPTIONS = [
  { id: "info", label: "Information", icon: Info },
  { id: "success", label: "Succès", icon: CheckCircle2 },
  { id: "warning", label: "Alerte", icon: AlertTriangle },
];

export default function AdminNotifications() {
  const { data: activities = [] } = useActivities();
  const [notices, setNotices] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("Tous les abonnés");
  const [type, setType] = useState("info");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    setNotices(await notificationsDB.getAll<Notification>());
  }, []);

  useEffect(() => {
    load();
    return notificationsDB.subscribe(load);
  }, [load]);

  const audienceOptions = useMemo(
    () => ["Tous les abonnés", ...activities.map((activity) => `Membres ${activity.name}`)],
    [activities]
  );

  const send = async () => {
    if (!title.trim() || !body.trim() || sending) return;
    setSending(true);
    setFeedback("");
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [users, subs] = await Promise.all([usersDB.getAll<any>(), subscriptionsDB.getAll<any>()]);
      let emails: string[];
      if (audience === "Tous les abonnés") {
        emails = users.filter((user) => user.role === "Abonné").map((user) => user.email);
        if (emails.length === 0) {
          emails = subs.filter((sub) => sub.status === "Validée").map((sub) => String(sub.email).toLowerCase());
        }
      } else {
        const targetActivity = activities.find((activity) => `Membres ${activity.name}` === audience);
        emails = subs
          .filter((sub) => sub.status === "Validée" && sub.endDate >= today && sub.activityId === targetActivity?.id)
          .map((sub) => String(sub.email).toLowerCase());
      }
      const recipients = [...new Set(emails.filter(Boolean).map((email) => email.toLowerCase()))];
      if (recipients.length === 0) {
        setFeedback("Aucun destinataire trouvé pour cette audience.");
        return;
      }
      const createdAt = new Date().toISOString();
      await Promise.all(
        recipients.map((email) =>
          notificationsDB.create({
            userEmail: email,
            title: title.trim(),
            message: body.trim(),
            type,
            audience,
            createdAt,
            read: false,
          })
        )
      );
      // E-mail à chaque destinataire (copie de l'annonce) — sans bloquer
      const mailTitle = title.trim();
      const mailBody = body.trim();
      recipients.forEach((email) => {
        sendImportantEmail("annonce", { email, title: mailTitle, message: mailBody, type }).catch(() => {});
      });
      setTitle("");
      setBody("");
      setFeedback(`Notification envoyée à ${recipients.length} destinataire${recipients.length > 1 ? "s" : ""} (in-app + e-mail).`);
    } finally {
      setSending(false);
    }
  };

  // Regroupe les envois (même titre + même horodatage)
  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    notices.forEach((notice) => {
      const key = `${notice.title}|${notice.createdAt}`;
      map.set(key, [...(map.get(key) || []), notice]);
    });
    return Array.from(map.entries())
      .map(([key, rows]) => ({
        key,
        title: rows[0].title,
        message: rows[0].message,
        audience: rows[0].audience,
        type: rows[0].type,
        date: rows[0].createdAt,
        recipients: rows.length,
        reads: rows.filter((row) => row.read).length,
        ids: rows.map((row) => row.id),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notices]);

  const deleteGroup = async (ids: number[]) => {
    await Promise.all(ids.map((id) => notificationsDB.delete(id)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Envoyez des annonces ciblées à vos abonnés et suivez leur lecture.</p>
      </div>

      {feedback && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {feedback}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <Card className="h-fit p-5">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            <h2 className="font-bold text-slate-900 dark:text-white">Nouvelle notification</h2>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Destinataires</label>
              <select
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {audienceOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {TYPE_OPTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setType(id)}
                    className={`flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-2.5 text-[11px] font-semibold transition-all ${
                      type === id
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Titre</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex. Nouveau cours de Zumba" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Message</label>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder="Rédigez votre notification…"
              />
            </div>
            <Button className="w-full" disabled={!title.trim() || !body.trim() || sending} onClick={send}>
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Envoi en cours…" : "Envoyer la notification"}
            </Button>
          </div>
        </Card>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications envoyées</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Historique des communications aux membres.</p>
          <div className="mt-5 space-y-3">
            {groups.length === 0 ? (
              <Card className="p-10 text-center">
                <Bell className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Aucune notification envoyée pour le moment.</p>
              </Card>
            ) : (
              groups.map((group) => {
                const TypeIcon = TYPE_OPTIONS.find((option) => option.id === group.type)?.icon || Bell;
                return (
                  <Card key={group.key} className="p-5 transition-shadow hover:shadow-md">
                    <div className="flex gap-3">
                      <div className="rounded-full bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/30">
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{group.title}</h3>
                          <span className="text-xs text-slate-500">
                            {new Date(group.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{group.message}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <Badge variant="outline">{group.audience}</Badge>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Users className="h-3.5 w-3.5" />{group.recipients} destinataire{group.recipients > 1 ? "s" : ""}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <CheckCheck className="h-3.5 w-3.5" />{group.reads} lu{group.reads > 1 ? "s" : ""}
                          </span>
                          <Button variant="ghost" size="sm" className="ml-auto text-red-500 hover:text-red-600" onClick={() => deleteGroup(group.ids)}>
                            <Trash2 className="mr-1 h-3.5 w-3.5" />Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
