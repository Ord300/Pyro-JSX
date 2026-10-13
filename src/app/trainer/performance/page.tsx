"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Target,
  Plus,
  Trash2,
  Search,
  Trophy,
  Activity as ActivityIcon,
  Pencil,
  CheckCircle2,
  Flag,
  History,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/Table";
import { performancesDB, goalsDB } from "@/src/services/dbService";
import { confirmAction } from "@/src/components/ui/confirm";
import { loadTrainerContext, type TrainerContext } from "@/src/services/trainerSpace";
import { useToast } from "@/src/contexts/ToastContext";
import { notifyImportantAction } from "@/src/services/notifyService";

const METRICS = [
  { name: "Poids", unit: "kg" },
  { name: "Taille", unit: "cm" },
  { name: "Tour de taille", unit: "cm" },
  { name: "% Masse grasse", unit: "%" },
  { name: "Masse musculaire", unit: "kg" },
  { name: "Endurance (Cooper 12 min)", unit: "m" },
  { name: "Force (Développé couché)", unit: "kg" },
  { name: "Vitesse (100 m)", unit: "s" },
  { name: "Souplesse", unit: "cm" },
  { name: "Performance globale", unit: "/100" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

const unitOf = (metric: string) => METRICS.find((m) => m.name === metric)?.unit ?? "";

const initialsOf = (name?: string) =>
  (name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const goalProgress = (g: any) => {
  if (g.status === "Atteint") return 100;
  if (g.status === "Abandonné") return 0;
  if (g.targetValue == null || Number(g.targetValue) === 0) {
    return Math.min(100, Math.max(0, Number(g.currentValue) || 0));
  }
  const direction = g.direction ?? "increase";
  const current = Number(g.currentValue) || 0;
  const target = Number(g.targetValue);
  if (direction === "decrease") {
    if (target > 0 && current > 0) {
      return Math.min(100, (target / current) * 100);
    }
    return 0;
  }
  return Math.min(100, Math.max(0, (current / target) * 100));
};

const isGoalReached = (g: any, current: number) => {
  if (g.targetValue == null) return false;
  const target = Number(g.targetValue);
  if (Number.isNaN(target)) return false;
  const direction = g.direction ?? "increase";
  if (direction === "decrease") return current <= target;
  return current >= target;
};

export default function TrainerPerformance() {
  const toast = useToast();
  const getPreselectedEmail = () => {
    if (typeof window === "undefined") return "";
    try {
      return new URLSearchParams(window.location.search).get("email") ?? "";
    } catch {
      return "";
    }
  };
  const [ctx, setCtx] = useState<TrainerContext | null>(null);
  const [performances, setPerformances] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("Toutes");
  const [metricFilter, setMetricFilter] = useState("Tous");
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [chartMetric, setChartMetric] = useState<string>("Poids");

  // Modals — mesure
  const [perfModal, setPerfModal] = useState(false);
  const [perfForm, setPerfForm] = useState({ email: "", metric: "Poids", value: "", date: todayStr(), notes: "" });
  const [savingPerf, setSavingPerf] = useState(false);
  // Modals — objectif
  const [goalModal, setGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ email: "", title: "", description: "", targetValue: "", unit: "kg", deadline: "", activityName: "", direction: "increase" });
  const [savingGoal, setSavingGoal] = useState(false);
  // Mise à jour progression objectif
  const [progressTarget, setProgressTarget] = useState<any | null>(null);
  const [progressValue, setProgressValue] = useState("");

  const reload = async () => {
    const c = await loadTrainerContext();
    setCtx(c);
    const [perfs, gls] = await Promise.all([performancesDB.getAll<any>(), goalsDB.getAll<any>()]);
    // Restreint aux abonnés du coach
    const emails = new Set((c?.mySubscriptions ?? []).map((s: any) => String(s.email ?? "").toLowerCase()));
    setPerformances(perfs.filter((p) => emails.has(String(p.email ?? "").toLowerCase())));
    setGoals(gls.filter((g) => emails.has(String(g.email ?? "").toLowerCase())));
    const preselected = getPreselectedEmail();
    if (preselected && emails.has(preselected.toLowerCase())) {
      setSelectedEmail(preselected);
      setPerfForm((f) => ({ ...f, email: preselected }));
      const pre = c?.mySubscriptions.find((s: any) => String(s.email).toLowerCase() === preselected.toLowerCase());
      setGoalForm((f) => ({ ...f, email: preselected, activityName: pre?.activityName ?? f.activityName }));
    } else if (!selectedEmail && c && c.mySubscriptions.length > 0) {
      setSelectedEmail(c.mySubscriptions[0].email);
      setPerfForm((f) => ({ ...f, email: c.mySubscriptions[0].email }));
      setGoalForm((f) => ({ ...f, email: c.mySubscriptions[0].email, activityName: c.mySubscriptions[0].activityName }));
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Abonnés dédupliqués par e-mail (un même e-mail peut avoir plusieurs abonnements).
  const uniqueSubs = useMemo(() => {
    if (!ctx) return [];
    const map = new Map<string, any>();
    ctx.mySubscriptions.forEach((s: any) => {
      const key = String(s.email ?? s.userName).toLowerCase();
      if (!map.has(key)) map.set(key, s);
    });
    return [...map.values()];
  }, [ctx]);

  const subscribers = useMemo(() => {    if (!ctx) return [];
    const map = new Map<string, any>();
    ctx.mySubscriptions.forEach((s: any) => {
      const key = String(s.email ?? s.userName).toLowerCase();
      if (!map.has(key)) map.set(key, s);
    });
    const q = search.toLowerCase();
    return [...map.values()].filter((s) => {
      if (activityFilter !== "Toutes" && s.activityName !== activityFilter) return false;
      if (q && !`${s.userName ?? ""} ${s.email ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [ctx, search, activityFilter]);

  const selectedSub = useMemo(
    () => ctx?.mySubscriptions.find((s: any) => String(s.email).toLowerCase() === String(selectedEmail).toLowerCase()),
    [ctx, selectedEmail]
  );

  const selectedPerfs = useMemo(
    () =>
      performances
        .filter((p) => String(p.email).toLowerCase() === String(selectedEmail).toLowerCase())
        .sort((a, b) => String(a.date).localeCompare(String(b.date))),
    [performances, selectedEmail]
  );

  const selectedGoals = useMemo(
    () =>
      goals
        .filter((g) => String(g.email).toLowerCase() === String(selectedEmail).toLowerCase())
        .sort((a, b) => b.id - a.id),
    [goals, selectedEmail]
  );

  const filteredHistory = useMemo(() => {
    return performances
      .filter((p) => (metricFilter === "Tous" ? true : p.metric === metricFilter))
      .filter((p) => {
        const q = search.toLowerCase();
        if (!q) return true;
        return `${p.userName ?? ""} ${p.email ?? ""} ${p.metric ?? ""}`.toLowerCase().includes(q);
      })
      .sort((a, b) => `${b.date}`.localeCompare(`${a.date}`));
  }, [performances, metricFilter, search]);

  const chartData = useMemo(() => {
    return selectedPerfs
      .filter((p) => p.metric === chartMetric)
      .map((p) => ({ date: String(p.date).slice(5), fullDate: p.date, valeur: Number(p.value) }));
  }, [selectedPerfs, chartMetric]);

  const lastMeasure = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const firstMeasure = chartData.length > 0 ? chartData[0] : null;
  const evolution =
    lastMeasure && firstMeasure && chartData.length > 1
      ? Number(lastMeasure.valeur) - Number(firstMeasure.valeur)
      : null;

  const stats = useMemo(() => {
    const activeGoals = goals.filter((g) => g.status === "En cours").length;
    const reached = goals.filter((g) => g.status === "Atteint").length;
    return [
      { label: "Sportifs suivis", value: new Set(performances.map((p) => String(p.email).toLowerCase())).size, icon: ActivityIcon, color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20" },
      { label: "Mesures enregistrées", value: performances.length, icon: TrendingUp, color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" },
      { label: "Objectifs en cours", value: activeGoals, icon: Target, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
      { label: "Objectifs atteints", value: reached, icon: Trophy, color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20" },
    ];
  }, [performances, goals]);

  // ---------- Actions ----------
  const openPerfModal = (email?: string) => {
    const sub = ctx?.mySubscriptions.find((s: any) => String(s.email).toLowerCase() === String(email ?? selectedEmail).toLowerCase());
    setPerfForm({ email: sub?.email ?? selectedEmail, metric: "Poids", value: "", date: todayStr(), notes: "" });
    setPerfModal(true);
  };

  const savePerformance = async () => {
    if (String(perfForm.value ?? "").trim() === "") {
      toast.addToast("Saisissez une valeur de mesure", "error");
      return;
    }
    const val = Number(String(perfForm.value).replace(",", "."));
    if (!perfForm.email || !perfForm.metric || Number.isNaN(val)) {
      toast.addToast("Sélectionnez un sportif, une mesure et une valeur valide", "error");
      return;
    }
    setSavingPerf(true);
    try {
      const sub = ctx?.mySubscriptions.find((s: any) => String(s.email).toLowerCase() === String(perfForm.email).toLowerCase());
      await performancesDB.create({
        userId: sub?.userId ?? null,
        userName: sub?.userName ?? perfForm.email,
        email: perfForm.email,
        activityName: sub?.activityName ?? "",
        metric: perfForm.metric,
        value: val,
        unit: unitOf(perfForm.metric),
        date: perfForm.date || todayStr(),
        notes: perfForm.notes?.trim() || null,
        markedBy: ctx?.trainer?.name ?? ctx?.user?.name ?? "",
        createdAt: new Date().toISOString(),
      });
      setPerfModal(false);
      await reload();
      setSelectedEmail(perfForm.email);
      setChartMetric(perfForm.metric);
      toast.addToast("Progrès enregistré", "success");
      notifyImportantAction("annonce", {
        email: perfForm.email,
        name: sub?.userName ?? "",
        title: `Nouvelle mesure : ${perfForm.metric}`,
        message: `Votre coach a enregistré ${perfForm.metric} : ${val} ${unitOf(perfForm.metric)} le ${perfForm.date}.`,
        type: "success",
        audience: "Suivi performances",
      }).catch(() => {});
    } catch {
      toast.addToast("Enregistrement impossible", "error");
    } finally {
      setSavingPerf(false);
    }
  };

  const deletePerformance = async (id: number) => {
    if (!(await confirmAction({ title: "Supprimer la mesure", message: "Supprimer cette mesure ?", confirmLabel: "Supprimer" }))) return;
    try {
      await performancesDB.delete(id);
      await reload();
      toast.addToast("Mesure supprimée", "success");
    } catch {
      toast.addToast("Suppression impossible", "error");
    }
  };

  const openGoalModal = () => {
    const sub = ctx?.mySubscriptions.find((s: any) => String(s.email).toLowerCase() === String(selectedEmail).toLowerCase());
    setGoalForm({ email: selectedEmail, title: "", description: "", targetValue: "", unit: "kg", deadline: "", activityName: sub?.activityName ?? ctx?.myActivityNames[0] ?? "", direction: "increase" });
    setGoalModal(true);
  };

  const saveGoal = async () => {
    if (!goalForm.email || !goalForm.title.trim()) {
      toast.addToast("Sportif et titre requis", "error");
      return;
    }
    setSavingGoal(true);
    try {
      const sub = ctx?.mySubscriptions.find((s: any) => String(s.email).toLowerCase() === String(goalForm.email).toLowerCase());
      await goalsDB.create({
        userId: sub?.userId ?? null,
        userName: sub?.userName ?? goalForm.email,
        email: goalForm.email,
        activityName: goalForm.activityName || sub?.activityName || "",
        title: goalForm.title.trim(),
        description: goalForm.description?.trim() || null,
        targetValue: goalForm.targetValue === "" ? null : Number(String(goalForm.targetValue).replace(",", ".")),
        currentValue: 0,
        unit: goalForm.unit,
        deadline: goalForm.deadline || null,
        status: "En cours",
        direction: (goalForm as any).direction ?? "increase",
        markedBy: ctx?.trainer?.name ?? ctx?.user?.name ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setGoalModal(false);
      await reload();
      setSelectedEmail(goalForm.email);
      toast.addToast("Objectif fixé", "success");
      notifyImportantAction("annonce", {
        email: goalForm.email,
        name: sub?.userName ?? "",
        title: `Nouvel objectif : ${goalForm.title.trim()}`,
        message: `Votre coach vous a fixé un objectif « ${goalForm.title.trim()} »${goalForm.targetValue ? ` (cible : ${goalForm.targetValue} ${goalForm.unit})` : ""}.`,
        type: "info",
        audience: "Objectifs",
      }).catch(() => {});
    } catch {
      toast.addToast("Création impossible", "error");
    } finally {
      setSavingGoal(false);
    }
  };

  const saveProgress = async () => {
    if (!progressTarget) return;
    if (String(progressValue ?? "").trim() === "") {
      toast.addToast("Saisissez une valeur de progression", "error");
      return;
    }
    const val = Number(String(progressValue).replace(",", "."));
    if (Number.isNaN(val)) {
      toast.addToast("Valeur invalide", "error");
      return;
    }
    try {
      const reached = progressTarget.targetValue != null && isGoalReached(progressTarget, val);
      await goalsDB.update(progressTarget.id, {
        currentValue: val,
        status: reached ? "Atteint" : progressTarget.status === "Atteint" ? "En cours" : progressTarget.status,
        updatedAt: new Date().toISOString(),
      });
      setProgressTarget(null);
      await reload();
      toast.addToast(reached ? "Objectif atteint ! Bravo." : "Progression mise à jour", "success");
    } catch {
      toast.addToast("Mise à jour impossible", "error");
    }
  };

  const changeGoalStatus = async (g: any, status: string) => {
    try {
      await goalsDB.update(g.id, { status, updatedAt: new Date().toISOString() });
      await reload();
      toast.addToast(`Objectif « ${status} »`, "success");
    } catch {
      toast.addToast("Mise à jour impossible", "error");
    }
  };

  const deleteGoal = async (id: number) => {
    if (!(await confirmAction({ title: "Supprimer l'objectif", message: "Supprimer cet objectif ?", confirmLabel: "Supprimer" }))) return;
    try {
      await goalsDB.delete(id);
      await reload();
      toast.addToast("Objectif supprimé", "success");
    } catch {
      toast.addToast("Suppression impossible", "error");
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sky-950 dark:text-sky-50">Suivi des performances</h1>
          <p className="mt-1 text-sm text-sky-900/60 dark:text-sky-200/60">
            Enregistrez les progrès de vos abonnés, suivez leurs objectifs et consultez leurs résultats au fil du temps.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openPerfModal()}><Plus className="mr-1.5 h-4 w-4" />Mesure</Button>
          <Button variant="outline" onClick={openGoalModal}><Target className="mr-1.5 h-4 w-4" />Objectif</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Liste abonnés */}
        <Card className="p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Mes abonnés</h2>
            <Badge variant="default">{subscribers.length}</Badge>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Rechercher…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-800 dark:[&>option]:text-white">
            <option>Toutes</option>
            {ctx.myActivityNames.map((n) => <option key={n}>{n}</option>)}
          </select>
          <ul className="mt-3 max-h-[420px] space-y-1 overflow-y-auto pr-1">
            {subscribers.map((s) => {
              const active = String(s.email).toLowerCase() === String(selectedEmail).toLowerCase();
              const nbMes = performances.filter((p) => String(p.email).toLowerCase() === String(s.email).toLowerCase()).length;
              const nbGoals = goals.filter((g) => String(g.email).toLowerCase() === String(s.email).toLowerCase() && g.status === "En cours").length;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSelectedEmail(s.email)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${active ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                      {initialsOf(s.userName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{s.userName}</p>
                      <p className="truncate text-xs text-slate-400">{s.activityName} · {nbMes} mesure(s) · {nbGoals} objectif(s)</p>
                    </div>
                  </button>
                </li>
              );
            })}
            {subscribers.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Aucun abonné trouvé.</p>}
          </ul>
        </Card>

        {/* Fiche sportif + courbe */}
        <Card className="p-5 shadow-sm xl:col-span-2">
          {!selectedSub ? (
            <p className="py-10 text-center text-sm text-slate-400">Sélectionnez un abonné pour voir ses progrès.</p>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                    {initialsOf(selectedSub.userName)}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">{selectedSub.userName}</h2>
                    <p className="text-xs text-slate-500">{selectedSub.activityName} · {selectedSub.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select value={chartMetric} onChange={(e) => setChartMetric(e.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-800 dark:[&>option]:text-white">
                    {METRICS.map((m) => <option key={m.name}>{m.name}</option>)}
                  </select>
                  <Button size="sm" onClick={() => openPerfModal(selectedEmail)}><Plus className="mr-1 h-4 w-4" />Mesure</Button>
                </div>
              </div>

              {/* Résumé évolution */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800">
                  <p className="text-xs text-slate-500">Mesures ({chartMetric})</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{chartData.length}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800">
                  <p className="text-xs text-slate-500">Dernière valeur</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {lastMeasure ? `${lastMeasure.valeur} ${unitOf(chartMetric)}` : "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800">
                  <p className="text-xs text-slate-500">Évolution</p>
                  <p className={`text-xl font-bold ${evolution == null ? "text-slate-400" : evolution > 0 ? "text-green-600" : evolution < 0 ? "text-red-500" : "text-slate-500"}`}>
                    {evolution == null ? "—" : `${evolution > 0 ? "+" : ""}${Math.round(evolution * 100) / 100} ${unitOf(chartMetric)}`}
                  </p>
                </div>
              </div>

              {/* Courbe */}
              <div className="mt-4 h-64 w-full rounded-lg border border-slate-100 p-2 dark:border-slate-800">
                {chartData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-sm text-slate-400">
                    <TrendingUp className="mb-2 h-8 w-8 text-slate-300" />
                    Aucune mesure « {chartMetric} » pour ce sportif.
                    <button onClick={() => openPerfModal(selectedEmail)} className="mt-2 font-semibold text-sky-600 hover:underline">Enregistrer la première mesure</button>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                      <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate ?? ""} />
                      <Legend />
                      <Line type="monotone" dataKey="valeur" name={`${chartMetric} (${unitOf(chartMetric)})`} stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Historique mesures du sportif */}
              <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <History className="h-4 w-4" />Historique ({selectedPerfs.length})
              </h3>
              {selectedPerfs.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">Aucun progrès enregistré pour ce sportif.</p>
              ) : (
                <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
                  {[...selectedPerfs].reverse().map((p) => (
                    <li key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2.5 text-sm dark:border-slate-700">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{p.metric} — <span className="font-bold text-sky-700 dark:text-sky-300">{p.value} {p.unit}</span></p>
                        <p className="text-xs text-slate-400">{p.date}{p.notes ? ` · ${p.notes}` : ""}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deletePerformance(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Objectifs du sportif */}
              <div className="mt-5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <Flag className="h-4 w-4" />Objectifs ({selectedGoals.length})
                </h3>
                <Button size="sm" variant="outline" onClick={openGoalModal}><Plus className="mr-1 h-3.5 w-3.5" />Objectif</Button>
              </div>
              <div className="mt-2 space-y-3">
                {selectedGoals.length === 0 && <p className="text-sm text-slate-400">Aucun objectif fixé pour ce sportif.</p>}
                {selectedGoals.map((g) => {
                  const pct = goalProgress(g);
                  return (
                    <div key={g.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{g.title}</p>
                          <p className="text-xs text-slate-400">
                            {g.currentValue}{g.unit ? ` ${g.unit}` : ""}{g.targetValue != null ? ` / ${g.targetValue}${g.unit ? ` ${g.unit}` : ""}` : ""} · {g.activityName}
                            {g.deadline ? ` · Échéance : ${g.deadline}` : ""}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            Sens : {(g.direction ?? "increase") === "decrease" ? "Réduire" : "Augmenter"}
                          </p>
                          {g.description && <p className="mt-1 text-xs text-slate-500">{g.description}</p>}
                        </div>
                        <Badge variant={g.status === "Atteint" ? "success" : g.status === "Abandonné" ? "danger" : "warning"}>{g.status}</Badge>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className={`h-full rounded-full transition-all ${g.status === "Atteint" ? "bg-green-500" : "bg-sky-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setProgressTarget(g); setProgressValue(String(g.currentValue ?? "")); }}>
                          <Pencil className="mr-1 h-3.5 w-3.5" />Actualiser
                        </Button>
                        {g.status !== "Atteint" && (
                          <Button size="sm" variant="outline" onClick={() => changeGoalStatus(g, "Atteint")}>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />Atteint
                          </Button>
                        )}
                        {g.status === "En cours" && (
                          <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => changeGoalStatus(g, "Abandonné")}>Abandonner</Button>
                        )}
                        <Button size="icon" variant="ghost" className="ml-auto h-8 w-8 text-red-500" onClick={() => deleteGoal(g.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Historique global */}
      <Card className="overflow-hidden shadow-sm">
        <div className="flex flex-col gap-3 p-5 pb-0 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">Toutes les mesures ({filteredHistory.length})</h2>
          <div className="flex gap-2">
            <select value={metricFilter} onChange={(e) => setMetricFilter(e.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-800 dark:[&>option]:text-white">
              <option>Tous</option>
              {METRICS.map((m) => <option key={m.name}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div className="p-5 pt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sportif</TableHead>
                <TableHead>Mesure</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-slate-400">Aucune mesure enregistrée.</TableCell></TableRow>
              ) : filteredHistory.slice(0, 50).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                        {initialsOf(p.userName)}
                      </div>
                      <div>
                        <p className="font-medium">{p.userName}</p>
                        <p className="text-xs text-slate-400">{p.activityName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="default">{p.metric}</Badge></TableCell>
                  <TableCell className="font-bold">{p.value} {p.unit}</TableCell>
                  <TableCell className="text-sm text-slate-500">{p.date}</TableCell>
                  <TableCell className="text-xs text-slate-400">{p.markedBy || "—"}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deletePerformance(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal mesure */}
      <Modal isOpen={perfModal} onClose={() => setPerfModal(false)} title="Enregistrer un progrès">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Sportif</label>
            <select value={perfForm.email} onChange={(e) => setPerfForm({ ...perfForm, email: e.target.value })} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-800 dark:[&>option]:text-white">
              {uniqueSubs.map((s: any) => <option key={s.id} value={s.email}>{s.userName} — {s.activityName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Mesure</label>
              <select value={perfForm.metric} onChange={(e) => setPerfForm({ ...perfForm, metric: e.target.value })} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-800 dark:[&>option]:text-white">
                {METRICS.map((m) => <option key={m.name} value={m.name}>{m.name} ({m.unit})</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Valeur ({unitOf(perfForm.metric)})</label>
              <Input type="number" step="any" placeholder="Ex. 78.5" value={perfForm.value} onChange={(e) => setPerfForm({ ...perfForm, value: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <Input type="date" max={todayStr()} value={perfForm.date} onChange={(e) => setPerfForm({ ...perfForm, date: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes (optionnel)</label>
            <textarea rows={3} value={perfForm.notes} onChange={(e) => setPerfForm({ ...perfForm, notes: e.target.value })} placeholder="Contexte de la mesure, ressenti, conditions…" className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setPerfModal(false)}>Annuler</Button>
            <Button className="flex-1" disabled={savingPerf} onClick={savePerformance}>{savingPerf ? "Enregistrement…" : "Enregistrer"}</Button>
          </div>
        </div>
      </Modal>

      {/* Modal objectif */}
      <Modal isOpen={goalModal} onClose={() => setGoalModal(false)} title="Fixer un objectif">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Sportif</label>
            <select value={goalForm.email} onChange={(e) => setGoalForm({ ...goalForm, email: e.target.value })} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-800 dark:[&>option]:text-white">
              {uniqueSubs.map((s: any) => <option key={s.id} value={s.email}>{s.userName} — {s.activityName}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Titre de l&apos;objectif</label>
            <Input placeholder="Ex. Perdre 5 kg, Courir 10 km, +20 kg au squat…" value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description (optionnel)</label>
            <textarea rows={2} value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} placeholder="Détails, plan d'entraînement…" className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Cible</label>
              <Input type="number" step="any" placeholder="Ex. 75" value={goalForm.targetValue} onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Unité</label>
              <Input placeholder="kg, m, s…" value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Échéance</label>
              <Input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Activité</label>
            <select value={goalForm.activityName} onChange={(e) => setGoalForm({ ...goalForm, activityName: e.target.value })} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-800 dark:[&>option]:text-white">
              {ctx.myActivityNames.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sens</label>
            <select value={(goalForm as any).direction ?? "increase"} onChange={(e) => setGoalForm({ ...goalForm, direction: e.target.value })} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-800 dark:[&>option]:text-white">
              <option value="increase">Augmenter</option>
              <option value="decrease">Réduire</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setGoalModal(false)}>Annuler</Button>
            <Button className="flex-1" disabled={savingGoal} onClick={saveGoal}>{savingGoal ? "Création…" : "Fixer l'objectif"}</Button>
          </div>
        </div>
      </Modal>

      {/* Modal progression */}
      <Modal isOpen={!!progressTarget} onClose={() => setProgressTarget(null)} title="Actualiser la progression">
        {progressTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              <strong className="text-slate-900 dark:text-white">{progressTarget.title}</strong>
              {progressTarget.targetValue != null && ` — cible : ${progressTarget.targetValue} ${progressTarget.unit}`}
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium">Valeur actuelle ({progressTarget.unit || "unité"})</label>
              <Input type="number" step="any" value={progressValue} onChange={(e) => setProgressValue(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setProgressTarget(null)}>Annuler</Button>
              <Button className="flex-1" onClick={saveProgress}>Mettre à jour</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
