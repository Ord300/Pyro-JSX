"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X, Save, Trash2, CalendarDays, ClipboardCheck } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { attendancesDB } from "@/src/services/dbService";
import { notifyImportantAction } from "@/src/services/notifyService";
import { loadTrainerContext, type TrainerContext } from "@/src/services/trainerSpace";
import { useToast } from "@/src/contexts/ToastContext";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TrainerAttendance() {
  const toast = useToast();
  const [ctx, setCtx] = useState<TrainerContext | null>(null);
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState(todayStr());
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    const c = await loadTrainerContext();
    setCtx(c);
    if (c && !activity && c.myActivityNames.length > 0) {
      setActivity(c.myActivityNames[0]);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sessionRows = useMemo(() => {
    if (!ctx || !activity) return [];
    return ctx.myAttendances.filter((a) => a.activityName === activity && a.date === date);
  }, [ctx, activity, date]);

  const roster = useMemo(() => {
    if (!ctx || !activity) return [];
    return ctx.mySubscriptions.filter((s) => s.activityName === activity);
  }, [ctx, activity]);

  // Initialise l'appel : valeurs enregistrées, sinon présent par défaut si abonnement validé
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    roster.forEach((s) => {
      const key = String(s.email ?? s.userName).toLowerCase();
      const existing = sessionRows.find((r) => String(r.email).toLowerCase() === key);
      initial[key] = existing ? !!existing.present : s.status === "Validée";
    });
    setMarks(initial);
  }, [roster, sessionRows]);

  const presentCount = roster.filter((s) => marks[String(s.email ?? s.userName).toLowerCase()]).length;

  const toggle = (key: string, value: boolean) =>
    setMarks((m) => ({ ...m, [key]: value }));

  const markAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    roster.forEach((s) => {
      next[String(s.email ?? s.userName).toLowerCase()] = value;
    });
    setMarks(next);
  };

  const save = async () => {
    if (!ctx || !activity || roster.length === 0) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const markedBy = ctx.trainer?.name ?? ctx.user?.name ?? "";
      for (const s of roster) {
        const key = String(s.email ?? s.userName).toLowerCase();
        const present = !!marks[key];
        const existing = sessionRows.find((r) => String(r.email).toLowerCase() === key);
        if (existing) {
          await attendancesDB.update(existing.id, { present, markedBy });
        } else {
          await attendancesDB.create({
            activityName: activity,
            email: s.email ?? "",
            userName: s.userName ?? "",
            date,
            present,
            markedBy,
            createdAt: now,
          });
        }
      }
      await reload();
      toast.addToast(`Présences enregistrées (${presentCount}/${roster.length} présents)`, "success");
      // Notifie chaque abonné présent (in-app + e-mail) — fire-and-forget
      roster.forEach((s) => {
        if (!s.email?.includes("@")) return;
        notifyImportantAction("presence", {
          email: s.email,
          name: s.userName,
          activityName: activity,
          date,
          message: marks[String(s.email ?? s.userName).toLowerCase()] ? "Présent(e)" : "Absent(e)",
        }).catch(() => {});
      });
    } catch {
      toast.addToast("Enregistrement impossible", "error");
    } finally {
      setSaving(false);
    }
  };

  const sessions = useMemo(() => {
    if (!ctx) return [];
    const map = new Map<string, { activityName: string; date: string; present: number; total: number }>();
    ctx.myAttendances.forEach((a) => {
      const key = `${a.activityName}|||${a.date}`;
      const entry = map.get(key) ?? { activityName: a.activityName, date: a.date, present: 0, total: 0 };
      entry.total += 1;
      if (a.present) entry.present += 1;
      map.set(key, entry);
    });
    return [...map.values()].sort((a, b) => (b.date + b.activityName).localeCompare(a.date + a.activityName));
  }, [ctx]);

  const deleteSession = async (activityName: string, sessionDate: string) => {
    if (!ctx || !confirm(`Supprimer l'appel du ${sessionDate} (${activityName}) ?`)) return;
    const rows = ctx.myAttendances.filter((a) => a.activityName === activityName && a.date === sessionDate);
    await Promise.all(rows.map((r) => attendancesDB.delete(r.id)));
    await reload();
    toast.addToast("Séance supprimée", "success");
  };

  if (!ctx) return <p className="text-sm text-slate-500">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-sky-950 dark:text-sky-50">Présences</h1>
        <p className="mt-1 text-sm text-sky-900/60 dark:text-sky-200/60">
          Marquez la présence de vos abonnés à chaque séance.
        </p>
      </div>

      {/* Appel de présence */}
      <Card className="p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Activité</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700">
              {ctx.myActivityNames.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date de la séance</label>
            <Input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => markAll(true)}>Tous présents</Button>
            <Button variant="outline" size="sm" onClick={() => markAll(false)}>Tous absents</Button>
          </div>
        </div>

        {roster.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aucun abonné sur cette activité.</p>
        ) : (
          <>
            <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
              {roster.map((s) => {
                const key = String(s.email ?? s.userName).toLowerCase();
                const present = !!marks[key];
                return (
                  <li key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                      {(s.userName ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{s.userName}</p>
                      <p className="text-xs text-slate-400">{s.email}</p>
                    </div>
                    <Badge variant={s.status === "Validée" ? "success" : "warning"} className="hidden sm:inline-flex">{s.status}</Badge>
                    <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => toggle(key, true)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors ${present ? "bg-green-600 text-white" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                      >
                        <Check className="h-3.5 w-3.5" />Présent
                      </button>
                      <button
                        onClick={() => toggle(key, false)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors ${!present ? "bg-red-500 text-white" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                      >
                        <X className="h-3.5 w-3.5" />Absent
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500"><strong className="text-slate-900 dark:text-white">{presentCount}/{roster.length}</strong> présent(s)</p>
              <Button onClick={save} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />{saving ? "Enregistrement…" : "Enregistrer l'appel"}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Historique des séances */}
      <Card className="p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <CalendarDays className="h-5 w-5 text-sky-600" />Historique des séances
        </h2>
        {sessions.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <ClipboardCheck className="h-4 w-4" />Aucune séance enregistrée pour le moment.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
            {sessions.map((s) => (
              <li key={`${s.activityName}-${s.date}`} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{s.activityName}</p>
                  <p className="text-xs text-slate-400">{s.date} · {s.present}/{s.total} présent(s)</p>
                </div>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: s.total > 0 ? `${Math.round((s.present / s.total) * 100)}%` : "0%" }}
                  />
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" title="Supprimer la séance" onClick={() => deleteSession(s.activityName, s.date)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
