"use client";

import { useState } from "react";
import { Bell, CheckCheck, Send } from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";

type Notice = { id: number; title: string; body: string; audience: string; date: string; read: number };
const initial: Notice[] = [
  { id: 1, title: "Fermeture exceptionnelle", body: "Le centre sera fermé dimanche pour maintenance.", audience: "Tous les abonnés", date: "16 août 2026", read: 42 },
  { id: 2, title: "Cours de Zumba ajouté", body: "Un nouveau créneau est disponible le samedi à 10h.", audience: "Membres Fitness", date: "14 août 2026", read: 18 }
];

export default function AdminNotifications() {
  const [notices, setNotices] = useState(initial);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("Tous les abonnés");
  const send = () => {
    if (!title.trim() || !body.trim()) return;
    setNotices((current) => [{ id: Date.now(), title, body, audience, date: "À l'instant", read: 0 }, ...current]);
    setTitle("");
    setBody("");
  };
  return (
    <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
      <Card className="h-fit p-5">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-600" />
          <h1 className="font-bold text-slate-900 dark:text-white">Nouvelle notification</h1>
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Destinataires</label>
            <select value={audience} onChange={(event) => setAudience(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
              <option>Tous les abonnés</option>
              <option>Membres Fitness</option>
              <option>Membres actifs</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Titre</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex. Nouveau cours" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Message</label>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700" placeholder="Rédigez votre notification…" />
          </div>
          <Button className="w-full" disabled={!title.trim() || !body.trim()} onClick={send}>
            <Send className="mr-2 h-4 w-4" />Envoyer la notification
          </Button>
        </div>
      </Card>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications envoyées</h2>
        <p className="mt-1 text-sm text-slate-500">Historique des communications aux membres.</p>
        <div className="mt-5 space-y-3">
          {notices.map((notice) => (
            <Card key={notice.id} className="p-5">
              <div className="flex gap-3">
                <div className="rounded-full bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/30">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{notice.title}</h3>
                    <span className="text-xs text-slate-500">{notice.date}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notice.body}</p>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="outline">{notice.audience}</Badge>
                    <span className="flex items-center text-xs text-slate-500">
                      <CheckCheck className="mr-1 h-3 w-3" />{notice.read} lus
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}