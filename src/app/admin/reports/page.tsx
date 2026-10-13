"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/utils/cn";
import { paymentsDB, subscriptionsDB, reservationsDB, usersDB } from "@/src/services/dbService";
import { isSubscriptionActive, isSubscriptionExpired, getDynamicStatus } from "@/src/utils/subscriptionStatus";
import { TrendingUp, Users, DollarSign, Calendar, Download, BarChart3, PieChart } from "lucide-react";

type ReportPeriod = "week" | "month" | "year";
type ReportType = "revenue" | "subscriptions" | "reservations" | "users";

const PERIOD_DAYS: Record<ReportPeriod, number> = {
  week: 7,
  month: 30,
  year: 365,
};

// Même logique que le dashboard admin : undefined si non calculable.
const pctChange = (cur: number, prev: number): number | undefined => {
  if (prev <= 0) return undefined;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
};

const getItemDateValue = (item: any): string | undefined =>
  item?.paidAt || item?.createdAt || item?.date || item?.startDate;

const toValidDate = (value: any): Date | null => {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatVariation = (change: number | undefined): string => {
  if (change === undefined) return "—";
  const sign = change > 0 ? "↑ " : change < 0 ? "↓ " : "→ ";
  const prefix = change > 0 ? "+" : "";
  return `${sign}${prefix}${change}%`;
};

const escapeCsvCell = (value: unknown): string =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function AdminReports() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [reportType, setReportType] = useState<ReportType>("revenue");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [p, s, r, u] = await Promise.all([
        paymentsDB.getAll<any>(),
        subscriptionsDB.getAll<any>(),
        reservationsDB.getAll<any>(),
        usersDB.getAll<any>(),
      ]);
      setPayments(p);
      setSubscriptions(s);
      setReservations(r);
      setUsers(u);
    };
    load();
  }, []);

  // ---- Plage courante : dateFrom/dateTo prioritaires, sinon période ----
  const now = new Date();
  const hasCustomRange = dateFrom !== "" || dateTo !== "";
  const rangeStart: Date = hasCustomRange
    ? (dateFrom ? new Date(`${dateFrom}T00:00:00`) : new Date(0))
    : new Date(now.getTime() - PERIOD_DAYS[period] * 86_400_000);
  const rangeEnd: Date = hasCustomRange
    ? (dateTo ? new Date(`${dateTo}T23:59:59.999`) : now)
    : now;
  const rangeDurationMs = Math.max(rangeEnd.getTime() - rangeStart.getTime(), 0);
  const prevStart = new Date(rangeStart.getTime() - rangeDurationMs);
  const prevEnd = rangeStart;

  const isInRange = (item: any, start: Date, end: Date): boolean => {
    const d = toValidDate(getItemDateValue(item));
    if (!d) return false;
    return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
  };

  const filteredPayments = payments.filter((p) => isInRange(p, rangeStart, rangeEnd));
  const filteredSubscriptions = subscriptions.filter((s) => isInRange(s, rangeStart, rangeEnd));
  const filteredReservations = reservations.filter((r) => isInRange(r, rangeStart, rangeEnd));
  const filteredUsers = users.filter((u) => isInRange(u, rangeStart, rangeEnd));

  const prevPayments = payments.filter((p) => isInRange(p, prevStart, prevEnd));
  const prevSubscriptions = subscriptions.filter((s) => isInRange(s, prevStart, prevEnd));
  const prevReservations = reservations.filter((r) => isInRange(r, prevStart, prevEnd));
  const prevUsers = users.filter((u) => isInRange(u, prevStart, prevEnd));

  const paymentAmount = (p: any) => Number(p.total ?? p.amount) || 0;

  const totalRevenue = filteredPayments
    .filter((p) => p.status === "Réussi")
    .reduce((sum, p) => sum + paymentAmount(p), 0);
  const prevRevenue = prevPayments
    .filter((p) => p.status === "Réussi")
    .reduce((sum, p) => sum + paymentAmount(p), 0);

  const activeSubscriptions = filteredSubscriptions.filter((s) => isSubscriptionActive(s)).length;
  const prevActiveSubscriptions = prevSubscriptions.filter((s) => isSubscriptionActive(s)).length;
  const expiredSubscriptions = filteredSubscriptions.filter((s) => isSubscriptionExpired(s)).length;
  const pendingSubscriptions = filteredSubscriptions.filter((s) => getDynamicStatus(s) === "En attente").length;
  const prevPendingSubscriptions = prevSubscriptions.filter((s) => getDynamicStatus(s) === "En attente").length;
  const confirmedReservations = filteredReservations.filter((r) => r.status === "Confirmée" || r.status === "confirmed").length;
  const prevConfirmedReservations = prevReservations.filter((r) => r.status === "Confirmée" || r.status === "confirmed").length;

  const conversionRate = (filteredSubscriptions.length / Math.max(filteredUsers.length, 1)) * 100;
  const prevConversionRate = (prevSubscriptions.length / Math.max(prevUsers.length, 1)) * 100;

  const revenueChange = pctChange(totalRevenue, prevRevenue);
  const activeSubsChange = pctChange(activeSubscriptions, prevActiveSubscriptions);
  const reservationsChange = pctChange(filteredReservations.length, prevReservations.length);
  const conversionChange = pctChange(
    Math.round(conversionRate * 10) / 10,
    Math.round(prevConversionRate * 10) / 10
  );
  const pendingChange = pctChange(pendingSubscriptions, prevPendingSubscriptions);
  const confirmedChange = pctChange(confirmedReservations, prevConfirmedReservations);

  const revenueByMethod = filteredPayments
    .filter((p) => p.status === "Réussi")
    .reduce((acc, p) => {
      const m = p.method || "Autre";
      acc[m] = (acc[m] || 0) + paymentAmount(p);
      return acc;
    }, {} as Record<string, number>);

  const subscriptionByStatus = filteredSubscriptions.reduce((acc, s) => {
    const k = getDynamicStatus(s) || "unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reservationByStatus = filteredReservations.reduce((acc, r) => {
    const k = r.status || "unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userByRole = filteredUsers.reduce((acc, u) => {
    const k = u.role || "Sans rôle";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userByStatus = filteredUsers.reduce((acc, u) => {
    const k = u.status || (u.isActive === false ? "Inactif" : "Actif");
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const kpis: { label: string; value: string | number; icon: typeof DollarSign; color: string; change: number | undefined }[] = [
    { label: "Revenu total", value: `${totalRevenue} USD`, icon: DollarSign, color: "text-green-600 dark:text-green-400", change: revenueChange },
    { label: "Abonnés actifs", value: activeSubscriptions, icon: Users, color: "text-blue-600 dark:text-blue-400", change: activeSubsChange },
    { label: "Réservations", value: filteredReservations.length, icon: Calendar, color: "text-primary-600 dark:text-primary-400", change: reservationsChange },
    { label: "Taux de conversion", value: `${Math.round(conversionRate)}%`, icon: TrendingUp, color: "text-amber-600 dark:text-amber-400", change: conversionChange },
  ];

  const getChartData = (): { label: string; value: number }[] => {
    if (reportType === "revenue")
      return Object.entries(revenueByMethod).map(([label, value]) => ({ label, value: Number(value) }));
    if (reportType === "subscriptions")
      return Object.entries(subscriptionByStatus).map(([label, value]) => ({ label, value: Number(value) }));
    if (reportType === "users")
      return Object.entries(userByRole).map(([label, value]) => ({ label, value: Number(value) }));
    return Object.entries(reservationByStatus).map(([label, value]) => ({ label, value: Number(value) }));
  };

  const getPieData = (): { label: string; value: number }[] => {
    if (reportType === "revenue")
      return Object.entries(revenueByMethod).map(([label, value]) => ({ label, value: Number(value) }));
    if (reportType === "subscriptions")
      return Object.entries(subscriptionByStatus).map(([label, value]) => ({ label, value: Number(value) }));
    if (reportType === "users")
      return Object.entries(userByStatus).map(([label, value]) => ({ label, value: Number(value) }));
    return Object.entries(reservationByStatus).map(([label, value]) => ({ label, value: Number(value) }));
  };

  const handleExport = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === "revenue") {
      headers = ["Date", "Utilisateur", "Méthode", "Statut", "Montant (USD)"];
      rows = filteredPayments.map((p) => [
        String(getItemDateValue(p) ?? ""),
        String(p.userName ?? p.name ?? p.email ?? ""),
        String(p.method ?? "Autre"),
        String(p.status ?? ""),
        String(paymentAmount(p)),
      ]);
    } else if (reportType === "subscriptions") {
      headers = ["Email", "Statut dynamique", "Début", "Fin", "Créé le"];
      rows = filteredSubscriptions.map((s) => [
        String(s.email ?? s.userName ?? s.name ?? ""),
        String(getDynamicStatus(s)),
        String(s.startDate ?? ""),
        String(s.endDate ?? ""),
        String(s.createdAt ?? ""),
      ]);
    } else if (reportType === "reservations") {
      headers = ["Utilisateur", "Activité", "Date", "Statut"];
      rows = filteredReservations.map((r) => [
        String(r.userName ?? r.name ?? r.email ?? ""),
        String(r.activityName ?? r.activity ?? ""),
        String(getItemDateValue(r) ?? ""),
        String(r.status ?? ""),
      ]);
    } else {
      headers = ["Nom", "Email", "Rôle", "Statut", "Créé le"];
      rows = filteredUsers.map((u) => [
        String(u.name ?? u.userName ?? ""),
        String(u.email ?? ""),
        String(u.role ?? "Sans rôle"),
        String(u.status ?? (u.isActive === false ? "Inactif" : "Actif")),
        String(getItemDateValue(u) ?? ""),
      ]);
    }

    const csv = [headers, ...rows]
      .map((line) => line.map(escapeCsvCell).join(";"))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-${reportType}-${period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderBarChart = () => {
    const data = getChartData();

    if (data.length === 0) {
      return <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Aucune donnée sur cette période.</p>;
    }

    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
      <div className="mt-6">
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="w-32 text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
              <div className="flex-1">
                <div className="h-6 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-16 text-right text-sm font-semibold text-slate-900 dark:text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const data = getPieData();

    if (data.length === 0) {
      return <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Aucune donnée sur cette période.</p>;
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"];

    let cumulativeAngle = 0;

    return (
      <div className="mt-6 flex items-center gap-8">
        <div className="relative h-48 w-48">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const angle = (percentage / 100) * 360;
              const startAngle = cumulativeAngle;
              cumulativeAngle += angle;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = ((startAngle + angle) * Math.PI) / 180;

              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);

              const largeArc = angle > 180 ? 1 : 0;

              return (
                <path
                  key={item.label}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0"}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Statistiques avancées</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Rapports détaillés et filtrables sur l'activité du centre.
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
                {kpi.change !== undefined && (
                  <p className={`mt-1 text-xs font-medium ${kpi.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {formatVariation(kpi.change)} vs période précédente
                  </p>
                )}
              </div>
              <div className={`rounded-lg bg-slate-100 p-3 dark:bg-slate-800 ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["revenue", "subscriptions", "reservations", "users"] as ReportType[]).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  reportType === type
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                )}
              >
                {type === "revenue" ? "Revenus" : type === "subscriptions" ? "Abonnements" : type === "reservations" ? "Réservations" : "Utilisateurs"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {((["week", "month", "year"] as ReportPeriod[])).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    period === p
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  )}
                >
                  {p === "week" ? "7 derniers jours" : p === "month" ? "30 derniers jours" : "12 derniers mois"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-slate-400">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Répartition</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {reportType === "revenue" ? "Par méthode de paiement" : reportType === "subscriptions" ? "Par statut (dynamique)" : reportType === "users" ? "Par rôle (Abonné / Entraîneur / Gestionnaire)" : "Par statut"}
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          {renderBarChart()}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Proportions</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {reportType === "revenue" ? "Répartition des revenus" : reportType === "subscriptions" ? "Répartition des abonnements" : reportType === "users" ? "Répartition des utilisateurs par statut" : "Répartition des réservations"}
              </p>
            </div>
            <PieChart className="h-5 w-5 text-slate-400" />
          </div>
          {renderPieChart()}
        </Card>
      </div>

      {/* Summary Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Résumé détaillé</h2>
          <Badge variant="default">{hasCustomRange ? `${dateFrom || "…"} → ${dateTo || "… "}` : period === "week" ? "7 derniers jours" : period === "month" ? "30 derniers jours" : "12 derniers mois"}</Badge>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="pb-3 pr-4">Indicateur</th>
                <th className="pb-3 pr-4">Valeur</th>
                <th className="pb-3 pr-4">Tendance</th>
                <th className="pb-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 pr-4 text-slate-900 dark:text-white">Revenu total</td>
                <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{totalRevenue} USD</td>
                <td className="py-3 pr-4 text-green-600 dark:text-green-400">{formatVariation(revenueChange)}</td>
                <td className="py-3"><Badge variant="success">Excellent</Badge></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-900 dark:text-white">Abonnements actifs</td>
                <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{activeSubscriptions}</td>
                <td className="py-3 pr-4 text-green-600 dark:text-green-400">{formatVariation(activeSubsChange)}</td>
                <td className="py-3"><Badge variant="success">Bon</Badge></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-900 dark:text-white">Abonnements en attente</td>
                <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{pendingSubscriptions}</td>
                <td className="py-3 pr-4 text-amber-600 dark:text-amber-400">{formatVariation(pendingChange)}</td>
                <td className="py-3"><Badge variant="warning">À surveiller</Badge></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-900 dark:text-white">Abonnements expirés (dynamique)</td>
                <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{expiredSubscriptions}</td>
                <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">Calculé depuis endDate</td>
                <td className="py-3"><Badge variant={expiredSubscriptions > 0 ? "danger" : "success"}>{expiredSubscriptions > 0 ? "Action requise" : "OK"}</Badge></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-900 dark:text-white">Réservations confirmées</td>
                <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{confirmedReservations}</td>
                <td className="py-3 pr-4 text-green-600 dark:text-green-400">{formatVariation(confirmedChange)}</td>
                <td className="py-3"><Badge variant="success">Excellent</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
