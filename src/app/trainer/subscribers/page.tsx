"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Eye, X, Mail, Send, CalendarCheck } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/Table";
import { Modal } from "@/src/components/ui/Modal";
import { subscriptionsDB, messagesDB, notificationsDB } from "@/src/services/dbService";
import { loadTrainerContext, phoneOf, presenceStats, type TrainerContext } from "@/src/services/trainerSpace";
import { useToast } from "@/src/contexts/ToastContext";

const statusVariant = (s: string) =>
  s === "Validée" ? "success" : s === "Expirée" ? "warning" : s === "Annulée" ? "danger" : "default";

const MANAGEABLE_STATUSES = ["Validée", "Expirée", "Annulée"];

export default function TrainerSubscribers() {
  const toast = useToast();
  const [ctx, setCtx] = useState<TrainerContext | null>(null);
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("Toutes");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [selected, setSelected] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [contactTarget, setContactTarget] = useState<any | null>(null);
  const [contactSubject, setContactSubject] = useState("");
  const [contactBody, setContactBody] = useState("");
  const [sending, setSending] = useState(false);

  const reload = async () => {
    setCtx(await loadTrainerContext());
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    if (!ctx) return [];
    const q = search.toLowerCase();
    return ctx.mySubscriptions.filter((s) => {
      if (activityFilter !== "Toutes" && s.activityName !== activityFilter) return false;
      if (statusFilter !== "Tous" && s.status !== statusFilter) return false;
      if (q && !`${s.userName ?? ""} ${s.email ?? ""} ${s.memberNumber ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [ctx, search, activityFilter, statusFilter]);

  const openContact = (s: any) => {
    setContactTarget(s);
    setContactSubject(`Message de votre coach (${s.activityName})`);
    setContactBody("");
  };

  const sendContact = async () => {
    if (!contactTarget || !contactBody.trim() || sending) return;
    setSending(true);
    try {
      const now = new Date().toISOString();
      await messagesDB.create({
        email: contactTarget.email,
        userName: contactTarget.userName,
        sender: "Entraîneur",
        subject: contactSubject.trim() || "Message de votre coach",
        body: `— ${ctx?.trainer?.name ?? ctx?.user?.name ?? "Votre coach"} (${contactTarget.activityName}) —\n\n${contactBody.trim()}`,
        createdAt: now,
        readByAdmin: true,
        readBySubscriber: false,
      });
      await notificationsDB.create({
        userEmail: contactTarget.email,
        title: contactSubject.trim() || "Message de votre coach",
        message: contactBody.trim().slice(0, 200),
        type: "message",
        audience: "",
        createdAt: now,
        read: false,
      });
      toast.addToast(`Message envoyé à ${contactTarget.userName}`, "success");
      setContactTarget(null);
    } catch {
      toast.addToast("Envoi impossible", "error");
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (id: number, status: string) => {
    setSaving(true);
    try {
      const updated = await subscriptionsDB.update(id, { status });
      if (updated) {
        setSelected((prev: any) => (prev ? { ...prev, status } : prev));
        await reload();
        toast.addToast(`Abonnement « ${status} »`, "success");
      }
    } catch {
      toast.addToast("Mise à jour impossible", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!ctx) return <p className="text-sm text-slate-500">Chargement…</p>;

  if (!ctx.trainer) {
    return (
      <Card className="p-10 text-center">
        <p className="font-semibold text-slate-900 dark:text-white">Aucune fiche entraîneur liée à ce compte.</p>
        <p className="mt-1 text-sm text-slate-500">Demandez à l&apos;administration d&apos;associer votre email à votre fiche entraîneur.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-sky-950 dark:text-sky-50">Mes abonnés</h1>
        <p className="mt-1 text-sm text-sky-900/60 dark:text-sky-200/60">
          {filtered.length} abonné(s) sur vos activités ({ctx.myActivityNames.join(", ") || "aucune activité"})
        </p>
      </div>

      {/* Filtres */}
      <Card className="p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Rechercher par nom, email ou matricule…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)} className="rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700">
            <option>Toutes</option>
            {ctx.myActivityNames.map((n) => <option key={n}>{n}</option>)}
          </select>
          <div className="flex gap-2">
            {["Tous", "Validée", "Expirée", "Annulée"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${statusFilter === s ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Abonné</TableHead>
              <TableHead>Activité</TableHead>
              <TableHead>Formule</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-slate-400">Aucun abonné trouvé.</TableCell></TableRow>
            ) : filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                      {(s.userName ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{s.userName}</p>
                      <p className="text-xs text-slate-400">{s.email} · {phoneOf(ctx.users, s.email)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{s.activityName}</TableCell>
                <TableCell className="text-sm text-slate-500">{s.planName}</TableCell>
                <TableCell className="text-xs text-slate-500">{s.startDate} → {s.endDate}</TableCell>
                <TableCell><Badge variant={statusVariant(s.status) as any}>{s.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Voir / gérer" onClick={() => setSelected(s)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Contacter" onClick={() => openContact(s)}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal détail / gestion */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Fiche abonné">
        {selected && (() => {
          const stats = presenceStats(ctx.myAttendances, selected.email);
          return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-xl font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                {(selected.userName ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selected.userName}</h3>
                <Badge variant={statusVariant(selected.status) as any}>{selected.status}</Badge>
              </div>
              <Button size="sm" onClick={() => { setSelected(null); openContact(selected); }}>
                <Mail className="mr-1.5 h-4 w-4" />Contacter
              </Button>
            </div>
            {[
              ["Email", selected.email],
              ["Téléphone", phoneOf(ctx.users, selected.email)],
              ["Matricule", selected.memberNumber ?? "—"],
              ["Activité", selected.activityName],
              ["Formule", selected.planName],
              ["Période", `${selected.startDate} → ${selected.endDate}`],
              ["Montant", `${selected.amount} ${selected.currency ?? "USD"}`],
              ["Paiement", `${selected.paymentMethod ?? "—"} (${selected.paymentReference ?? "—"})`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b border-slate-100 py-2 text-sm dark:border-slate-800">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-900 dark:text-white">{val}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2.5 text-sm dark:bg-sky-900/20">
              <CalendarCheck className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
              <span className="text-slate-600 dark:text-slate-300">
                Présences : <strong>{stats.present}/{stats.total} séance(s)</strong>
                {stats.total > 0 && ` (${Math.round((stats.present / stats.total) * 100)} %)`}
              </span>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Changer le statut</label>
              <div className="flex gap-2">
                {MANAGEABLE_STATUSES.map((st) => (
                  <button
                    key={st}
                    disabled={saving || selected.status === st}
                    onClick={() => changeStatus(selected.id, st)}
                    className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all disabled:opacity-40 ${
                      selected.status === st
                        ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300"
                        : "border-slate-200 text-slate-500 hover:border-sky-300 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>
              <X className="mr-2 h-4 w-4" />Fermer
            </Button>
          </div>
          );
        })()}
      </Modal>

      {/* Modal contact */}
      <Modal isOpen={!!contactTarget} onClose={() => setContactTarget(null)} title="Contacter l'abonné">
        {contactTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              À <strong className="text-slate-900 dark:text-white">{contactTarget.userName}</strong> ({contactTarget.email})
              — le message apparaîtra dans sa messagerie et ses notifications.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium">Objet</label>
              <Input value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Message</label>
              <textarea
                rows={5}
                value={contactBody}
                onChange={(e) => setContactBody(e.target.value)}
                placeholder="Écrivez votre message (convocation, rappel de séance, félicitations…)…"
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" disabled={sending} onClick={() => setContactTarget(null)}>Annuler</Button>
              <Button className="flex-1" disabled={sending || !contactBody.trim()} onClick={sendContact}>
                <Send className="mr-2 h-4 w-4" />{sending ? "Envoi…" : "Envoyer"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
