"use client";

import { useEffect, useState } from "react";
import {
  Users, CreditCard, Activity, Dumbbell,
  Calendar, DollarSign, Clock, AlertCircle, Check, X, CheckCircle2, ArrowRight,
  UserCheck, ClipboardList
} from "lucide-react";
import Link from "next/link";
import { KPICard } from "@/src/components/dashboard/KPICard";
import { RevenueChart, SubscriptionsChart, ActivityDonutChart } from "@/src/components/dashboard/Charts";
import { Badge } from "@/src/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { paymentsDB, subscriptionRequestsDB, subscriptionsDB, usersDB, activitiesDB, trainersDB, notificationsDB } from "@/src/services/dbService";
import { getDynamicStatus } from "@/src/utils/subscriptionStatus";

const statusBadge = (status: string) => {
  const map: Record<string, React.ReactElement> = {
    "Réussi": <Badge variant="success">{status}</Badge>,
    "En attente": <Badge variant="warning">{status}</Badge>,
    "Échoué": <Badge variant="danger">{status}</Badge>,
    "Confirmée": <Badge variant="success">{status}</Badge>,
    "Confirmé": <Badge variant="success">{status}</Badge>,
    "Annulée": <Badge variant="danger">{status}</Badge>,
    "Refusée": <Badge variant="danger">{status}</Badge>,
    "Validée": <Badge variant="success">{status}</Badge>,
    "Expirée": <Badge variant="danger">{status}</Badge>,
  };
  return map[status] ?? <Badge>{status}</Badge>;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
      {children}
    </h2>
  );
}

// Demandes d'abonnement uniquement (même filtre que /admin/requests).
const isSubscriptionRequest = (r: any) =>
  r.subject === "Inscription" || (r.subject && String(r.subject).toLowerCase().includes("abonnement"));

const normalizeRequest = (r: any) => ({
  id: r.id,
  name: r.name ?? r.userName ?? "",
  email: r.email ?? "",
  phone: r.phone ?? "",
  subject: r.subject ?? "",
  date: (r.createdAt || r.requestedAt || "").slice(0, 10),
  status: r.status,
});

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
// Variation réelle mois en cours vs mois précédent (undefined si non calculable).
const pctChange = (cur: number, prev: number): number | undefined => {
  if (prev <= 0) return undefined;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalAbonnes: 0,
    totalCoachs: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    pendingRequests: 0,
    confirmedRequests: 0,
    refusedRequests: 0,
    totalActivities: 0,
    totalTrainers: 0,
    totalRevenue: 0,
    subsChange: undefined,
    revenueChange: undefined,
  });

  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [actingId, setActingId] = useState<number | string | null>(null);

  const compute = async () => {
    const [users, subs, reqs, acts, trainers, payments] = await Promise.all([
      usersDB.getAll<any>(),
      subscriptionsDB.getAll<any>(),
      subscriptionRequestsDB.getAll<any>(),
      activitiesDB.getAll<any>(),
      trainersDB.getAll<any>(),
      paymentsDB.getAll<any>(),
    ]);

    // ---- Utilisateurs : vrais comptes en base ----
    const totalUsers = users.length;
    const totalAbonnes = users.filter((u: any) => u.role === "Abonné").length;
    const totalCoachs = users.filter((u: any) => u.role === "Entraîneur").length;

    // ---- Abonnements : statuts dynamiques (Validée + endDate dépassée => Expirée) ----
    // Abonnées valides = même calcul que le module Abonnés : utilisateurs avec le rôle
    // "Abonné" dont le DERNIER abonnement (trié par endDate) est dynamiquement "Validée".
    const dyn = (s: any) => getDynamicStatus(s);
    const totalSubscriptions = subs.length;
    const latestByEmail = new Map<string, any>();
    const sortedByEnd = [...subs].sort((a: any, b: any) => String(b.endDate || "").localeCompare(String(a.endDate || "")));
    for (const s of sortedByEnd) {
      const key = String(s.email || "").toLowerCase();
      if (key.includes("@") && !latestByEmail.has(key)) latestByEmail.set(key, s);
    }
    const activeSubscriptions = users
      .filter((u: any) => u.role === "Abonné")
      .filter((u: any) => {
        const sub = latestByEmail.get(String(u.email || "").toLowerCase()) ?? null;
        return sub ? dyn(sub) === "Validée" : false;
      }).length;
    const expiredSubscriptions = subs.filter((s: any) => dyn(s) === "Expirée").length;

    // ---- Demandes d'abonnement uniquement ----
    const subReqs = reqs.filter(isSubscriptionRequest);
    const pendingReqRows = subReqs.filter((r: any) => r.status === "En attente");
    const pendingRequestsCount = pendingReqRows.length;
    const confirmedRequests = subReqs.filter((r: any) => r.status === "Confirmée").length;
    const refusedRequests = subReqs.filter((r: any) => r.status === "Refusée").length;

    // ---- Revenus : paiements réussis uniquement ----
    const okPayments = payments.filter((p: any) => p.status === "Réussi");
    const totalRevenue = okPayments.reduce((sum: number, p: any) => sum + (Number(p.total ?? p.amount) || 0), 0);

    // ---- Variations réelles mois en cours vs mois précédent ----
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const subDate = (s: any) => new Date(s.createdAt || s.startDate || 0);
    const payDate = (p: any) => new Date(p.paidAt || p.createdAt || p.date || 0);
    const validDate = (d: Date) => !Number.isNaN(d.getTime());
    const subsThis = subs.filter((s: any) => { const d = subDate(s); return validDate(d) && monthKey(d) === monthKey(now); }).length;
    const subsPrev = subs.filter((s: any) => { const d = subDate(s); return validDate(d) && monthKey(d) === monthKey(prev); }).length;
    const revThis = okPayments.filter((p: any) => { const d = payDate(p); return validDate(d) && monthKey(d) === monthKey(now); })
      .reduce((sum: number, p: any) => sum + (Number(p.total ?? p.amount) || 0), 0);
    const revPrev = okPayments.filter((p: any) => { const d = payDate(p); return validDate(d) && monthKey(d) === monthKey(prev); })
      .reduce((sum: number, p: any) => sum + (Number(p.total ?? p.amount) || 0), 0);

    setStats({
      totalUsers, totalAbonnes, totalCoachs,
      totalSubscriptions, activeSubscriptions, expiredSubscriptions,
      pendingRequests: pendingRequestsCount, confirmedRequests, refusedRequests,
      totalActivities: acts.length, totalTrainers: trainers.length, totalRevenue,
      subsChange: pctChange(subsThis, subsPrev),
      revenueChange: pctChange(revThis, revPrev),
    });

    // ---- Listes récentes triées par date réelle ----
    const payTs = (p: any) => {
      const t = new Date(p.paidAt || p.createdAt || p.date || 0).getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    const sortedPayments = [...payments].sort((a, b) => payTs(b) - payTs(a));
    const reqTs = (r: any) => {
      const t = new Date(r.createdAt || r.requestedAt || 0).getTime();
      return Number.isNaN(t) ? (typeof r.id === "number" ? r.id : 0) : t;
    };
    const sortedPending = [...pendingReqRows].sort((a, b) => reqTs(b) - reqTs(a)).slice(0, 5).map(normalizeRequest);

    setAllPayments(payments);
    setRecentPayments(sortedPayments.slice(0, 5));
    setAllSubscriptions(subs);
    setAllActivities(acts);
    setPendingRequests(sortedPending);
  };

  useEffect(() => {
    compute();
    const onChange = () => compute();
    window.addEventListener("db-change", onChange as any);
    return () => window.removeEventListener("db-change", onChange as any);
  }, []);

  const handleRequestStatus = async (id: number | string, status: "Confirmée" | "Refusée") => {
    if (!confirm(`Confirmer cette action ? La demande passera « ${status} » et le demandeur sera notifié.`)) return;
    setActingId(id);
    try {
      const target = pendingRequests.find((r) => String(r.id) === String(id));
      await subscriptionRequestsDB.update(Number(id), { status });
      if (target?.email) {
        await notificationsDB.create({
          userEmail: String(target.email).toLowerCase(),
          title: status === "Confirmée" ? "Inscription confirmée" : "Inscription refusée",
          message: status === "Confirmée"
            ? `Bonne nouvelle ${target.name} ! Votre demande a été confirmée par l'administration.`
            : `Bonjour ${target.name}, votre demande a été refusée par l'administration.`,
          type: status === "Confirmée" ? "success" : "warning",
          audience: "Suivi de demande",
          createdAt: new Date().toISOString(),
          read: false,
        }).catch(() => {});
      }
      await compute();
    } finally {
      setActingId(null);
    }
  };

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Bienvenue ! Voici un aperçu de l'activité du centre sportif.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium capitalize text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />{today}
          </span>
          <Link href="/admin/requests">
            <Button size="sm" variant={stats.pendingRequests > 0 ? "primary" : "outline"}>
              <Clock className="mr-1.5 h-4 w-4" />
              Demandes en attente
              {stats.pendingRequests > 0 && (
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold">{stats.pendingRequests}</span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI — Utilisateurs (vrais comptes) */}
      <div>
        <SectionTitle>Utilisateurs — données réelles</SectionTitle>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <KPICard title="Total utilisateurs" value={String(stats.totalUsers)} icon={Users} color="blue" />
          <KPICard title="Abonnés" value={String(stats.totalAbonnes)} icon={UserCheck} color="cyan" />
          <KPICard title="Entraîneurs (comptes)" value={String(stats.totalCoachs)} icon={Dumbbell} color="purple" />
        </div>
      </div>

      {/* KPI — Abonnements (statuts dynamiques réels) */}
      <div>
        <SectionTitle>Abonnements — statuts réels</SectionTitle>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <KPICard title="Total abonnements" value={String(stats.totalSubscriptions)} icon={ClipboardList} change={stats.subsChange} color="blue" />
          <KPICard title="Abonnées valides" value={String(stats.activeSubscriptions)} icon={CreditCard} color="green" />
          <KPICard title="Expirés" value={String(stats.expiredSubscriptions)} icon={AlertCircle} color="red" />
        </div>
      </div>

      {/* KPI — Demandes + revenus */}
      <div>
        <SectionTitle>Demandes d'abonnement & revenus réels</SectionTitle>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          <KPICard title="Demandes en attente" value={String(stats.pendingRequests)} icon={Clock} color="amber" />
          <KPICard title="Demandes confirmées" value={String(stats.confirmedRequests)} icon={CheckCircle2} color="green" />
          <KPICard title="Demandes refusées" value={String(stats.refusedRequests)} icon={X} color="red" />
          <KPICard title="Activités" value={String(stats.totalActivities)} icon={Activity} color="cyan" />
          <KPICard title="Revenus réussis (USD)" value={`$${String(stats.totalRevenue)}`} icon={DollarSign} change={stats.revenueChange} color="green" />
        </div>
      </div>

      {/* Graphiques — Ligne 1 */}
      <div>
        <SectionTitle>Analytique — données réelles</SectionTitle>
        <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart payments={allPayments} />
          <SubscriptionsChart subscriptions={allSubscriptions} />
        </div>
      </div>

      {/* Graphiques — Ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityDonutChart subscriptions={allSubscriptions} />
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Abonnements expirés</h3>
          <p className="text-sm text-slate-400 mt-0.5">Calcul dynamique depuis les dates de fin</p>
          <p className="mt-4 text-4xl font-extrabold text-red-600 dark:text-red-400">{stats.expiredSubscriptions}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {stats.activeSubscriptions} abonné{stats.activeSubscriptions > 1 ? "s" : ""} valide{stats.activeSubscriptions > 1 ? "s" : ""} (hors coachs) · {stats.expiredSubscriptions} expiré{stats.expiredSubscriptions > 1 ? "s" : ""} · {stats.totalSubscriptions} au total
          </p>
        </div>
      </div>

      {/* Demandes en attente */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Demandes récentes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Demandes d'abonnement en attente de validation</p>
          </div>
          <Link href="/admin/requests">
            <Button variant="outline" size="sm">Voir tout <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
          </Link>
        </div>
        {pendingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="mb-3 h-11 w-11 text-green-500/70" />
            <p className="font-medium text-slate-900 dark:text-white">Aucune demande en attente</p>
            <p className="mt-1 text-sm text-slate-400">Toutes les demandes ont été traitées.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium text-slate-900 dark:text-white">{req.name}</TableCell>
                    <TableCell className="text-slate-500">{req.email}</TableCell>
                    <TableCell className="text-slate-500">{req.phone}</TableCell>
                    <TableCell className="text-slate-500">{req.date}</TableCell>
                    <TableCell>{statusBadge(req.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" className="h-7 px-2 text-xs" disabled={actingId === req.id} onClick={() => handleRequestStatus(req.id, "Confirmée")}><Check className="mr-1 h-3.5 w-3.5 text-green-600" />Confirmer</Button>
                        <Button size="sm" variant="danger" className="h-7 px-2 text-xs" disabled={actingId === req.id} onClick={() => handleRequestStatus(req.id, "Refusée")}><X className="mr-1 h-3.5 w-3.5" />Refuser</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Derniers paiements */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Derniers paiements</h3>
          <Link href="/admin/receipts"><Button variant="ghost" size="sm">Voir tout →</Button></Link>
        </div>
        {recentPayments.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">Aucun paiement enregistré.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentPayments.map((p) => {
              const displayName = String(p.userName || p.name || p.email || "Utilisateur");
              const initials = displayName.split(" ").map((n) => n[0] || "").join("").slice(0, 3).toUpperCase();
              return (
                <div key={p.id} className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{displayName}</p>
                      <p className="truncate text-xs text-slate-400">{p.activityName || p.activity || "—"} · {p.method || "—"}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">${p.total ?? p.amount ?? 0}</p>
                    {statusBadge(p.status)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
