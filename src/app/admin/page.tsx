"use client";

import { useEffect, useState } from "react";
import {
  Users, CreditCard, Activity, Dumbbell,
  Calendar, DollarSign, Clock, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { KPICard } from "@/src/components/dashboard/KPICard";
import { RevenueChart, SubscriptionsChart, ReservationsChart, ActivityDonutChart } from "@/src/components/dashboard/Charts";
import { Badge } from "@/src/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { paymentsDB, reservationsDB, subscriptionRequestsDB, subscriptionsDB, usersDB, activitiesDB, trainersDB } from "@/src/services/dbService";

const statusBadge = (status: string) => {
  const map: Record<string, React.ReactElement> = {
    "Réussi": <Badge variant="success">{status}</Badge>,
    "En attente": <Badge variant="warning">{status}</Badge>,
    "Échoué": <Badge variant="danger">{status}</Badge>,
    "Confirmée": <Badge variant="success">{status}</Badge>,
    "Annulée": <Badge variant="danger">{status}</Badge>,
  };
  return map[status] ?? <Badge>{status}</Badge>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({
    totalSubscribers: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    pendingRequests: 0,
    confirmedRequests: 0,
    totalActivities: 0,
    totalTrainers: 0,
    totalReservations: 0,
    totalRevenue: 0,
  });

  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<any[]>([]);
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);

  const compute = () => {
    const users = usersDB.getAll<any>();
    const subs = subscriptionsDB.getAll<any>();
    const reqs = subscriptionRequestsDB.getAll<any>();
    const acts = activitiesDB.getAll<any>();
    const trainers = trainersDB.getAll<any>();
    const reservations = reservationsDB.getAll<any>();
    const payments = paymentsDB.getAll<any>();

    const totalSubscribers = users.length;
    const activeSubscriptions = subs.filter((s: any) => s.status === "active").length;
    const expiredSubscriptions = subs.filter((s: any) => s.status === "expired").length;
    const totalActivities = acts.length;
    const totalTrainers = trainers.length;
    const totalReservations = reservations.length;
    const totalRevenue = payments.reduce((sum: any, p: any) => sum + (p.total ?? p.amount ?? 0), 0);

    const pendingRequests = reqs.filter((r: any) => r.status === "En attente").length;
    const confirmedRequests = reqs.filter((r: any) => r.status === "Confirmée").length;

    setStats({ totalSubscribers, activeSubscriptions, expiredSubscriptions, pendingRequests, confirmedRequests, totalActivities, totalTrainers, totalReservations, totalRevenue });
    setAllPayments(payments);
    setRecentPayments(payments.slice(-5).reverse());
    setAllReservations(reservations);
    const sortedRes = [...reservations].sort((a, b) => (a.date || "").localeCompare(b.date || "")).slice(0, 5);
    setRecentReservations(sortedRes);
    setAllSubscriptions(subs);
    setAllActivities(acts);
    setPendingRequests(reqs.filter((r: any) => r.status === "En attente").slice(0, 5));
  };

  useEffect(() => {
    compute();
    const onChange = () => compute();
    window.addEventListener("db-change", onChange as any);
    return () => window.removeEventListener("db-change", onChange as any);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Bienvenue ! Voici un aperçu de l'activité du centre sportif.
        </p>
      </div>

      {/* KPI Cards — Ligne 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        <KPICard title="Total abonnés" value={String(stats.totalSubscribers)} icon={Users} change={12.5} color="blue" />
        <KPICard title="Abonnements actifs" value={String(stats.activeSubscriptions)} icon={CreditCard} change={8.2} color="green" />
        <KPICard title="Abonnements expirés" value={String(stats.expiredSubscriptions)} icon={AlertCircle} change={-3.1} color="red" />
        <KPICard title="Demande confirmée" value={String(stats.confirmedRequests)} icon={Clock} change={5.0} color="green" />
        <KPICard title="Demandes en attente" value={String(stats.pendingRequests)} icon={Clock} change={5.0} color="amber" />
      </div>

      {/* KPI Cards — Ligne 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard title="Activités" value={String(stats.totalActivities)} icon={Activity} color="cyan" />
        <KPICard title="Entraîneurs" value={String(stats.totalTrainers)} icon={Dumbbell} color="purple" />
        <KPICard title="Réservations ce mois" value={String(stats.totalReservations)} icon={Calendar} change={18.7} color="blue" />
        <KPICard title="Revenus (USD)" value={`$${String(stats.totalRevenue)}`} icon={DollarSign} change={22.4} color="green" />
      </div>

      {/* Graphiques — Ligne 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart payments={allPayments} />
        <SubscriptionsChart subscriptions={allSubscriptions} />
      </div>

      {/* Graphiques — Ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReservationsChart reservations={allReservations} />
        </div>
        <ActivityDonutChart subscriptions={allSubscriptions} />
      </div>

      {/* Demandes en attente */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Demandes récentes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Demandes d'abonnement en attente de validation</p>
          </div>
          <Link href="/admin/requests">
            <Button variant="outline" size="sm">Voir tout</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
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
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="h-7 text-xs px-2">✓ Confirmer</Button>
                      <Button size="sm" variant="danger" className="h-7 text-xs px-2">✕ Refuser</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Derniers paiements & réservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paiements */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Derniers paiements</h3>
            <Link href="/admin/payments"><Button variant="ghost" size="sm">Voir tout →</Button></Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentPayments.map((p) => {
              const displayName = String(p.name || p.userName || p.email || "Utilisateur");
              const initials = displayName.split(" ").map((n) => n[0] || "").join("").slice(0, 3).toUpperCase();
              return (
                <div key={p.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{displayName}</p>
                      <p className="text-xs text-slate-400">{p.activity || "—"} · {p.method || "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">${p.amount ?? p.total ?? 0}</p>
                    {statusBadge(p.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Réservations */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Prochaines réservations</h3>
            <Button variant="ghost" size="sm" disabled>Voir tout →</Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentReservations.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                    {String(r.member || r.userName || "Membre").split(" ").map((n) => n[0] || "").join("").slice(0, 3)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{r.member || r.userName || "Membre"}</p>
                    <p className="text-xs text-slate-400">{r.activity || "—"} · {r.place || "—"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{r.date}</p>
                  <p className="text-xs text-slate-400">{r.time}</p>
                  {statusBadge(r.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}