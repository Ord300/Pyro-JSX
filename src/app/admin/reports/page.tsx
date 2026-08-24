"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/utils/cn";
import { paymentsDB, subscriptionsDB, reservationsDB, usersDB } from "@/src/services/dbService";
import { TrendingUp, Users, DollarSign, Calendar, Download, BarChart3, PieChart } from "lucide-react";

type ReportPeriod = "week" | "month" | "year";
type ReportType = "revenue" | "subscriptions" | "reservations" | "users";

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

  const totalRevenue = payments
    .filter((p) => p.status === "Réussi")
    .reduce((sum, p) => sum + (p.total ?? p.amount ?? 0), 0);

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active" || s.status === "Validée").length;
  const pendingSubscriptions = subscriptions.filter((s) => s.status === "En attente" || s.status === "pending").length;
  const confirmedReservations = reservations.filter((r) => r.status === "Confirmée" || r.status === "confirmed").length;

  const revenueByMethod = payments
    .filter((p) => p.status === "Réussi")
    .reduce((acc, p) => {
      const m = p.method || "Autre";
      acc[m] = (acc[m] || 0) + (p.total ?? p.amount ?? 0);
      return acc;
    }, {} as Record<string, number>);

  const subscriptionByStatus = subscriptions.reduce((acc, s) => {
    const k = s.status || "unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reservationByStatus = reservations.reduce((acc, r) => {
    const k = r.status || "unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const kpis = [
    { label: "Revenu total", value: `${totalRevenue} USD`, icon: DollarSign, color: "text-green-600 dark:text-green-400", change: "+12.5%" },
    { label: "Abonnés actifs", value: activeSubscriptions, icon: Users, color: "text-blue-600 dark:text-blue-400", change: "+8.2%" },
    { label: "Réservations", value: reservations.length, icon: Calendar, color: "text-primary-600 dark:text-primary-400", change: "+15.3%" },
    { label: "Taux de conversion", value: `${Math.round((subscriptions.length / Math.max(users.length, 1)) * 100)}%`, icon: TrendingUp, color: "text-amber-600 dark:text-amber-400", change: "+3.1%" },
  ];

  const handleExport = () => {
    console.log("Export des rapports");
  };

  const renderBarChart = () => {
    const data: { label: string; value: number }[] = reportType === "revenue"
      ? Object.entries(revenueByMethod).map(([label, value]) => ({ label, value: Number(value) }))
      : reportType === "subscriptions"
        ? Object.entries(subscriptionByStatus).map(([label, value]) => ({ label, value: Number(value) }))
        : Object.entries(reservationByStatus).map(([label, value]) => ({ label, value: Number(value) }));

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
    const data: { label: string; value: number }[] = reportType === "revenue"
      ? Object.entries(revenueByMethod).map(([label, value]) => ({ label, value: Number(value) }))
      : reportType === "subscriptions"
        ? Object.entries(subscriptionByStatus).map(([label, value]) => ({ label, value: Number(value) }))
        : Object.entries(reservationByStatus).map(([label, value]) => ({ label, value: Number(value) }));

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"];

    let cumulativeAngle = 0;

    return (
      <div className="mt-6 flex items-center gap-8">
        <div className="relative h-48 w-48">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
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
                {((item.value / total) * 100).toFixed(1)}%
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
                <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">{kpi.change}</p>
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
              {(["week", "month", "year"] as ReportPeriod[]).map((p) => (
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
                  {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
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
                {reportType === "revenue" ? "Par méthode de paiement" : reportType === "subscriptions" ? "Par statut" : "Par statut"}
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
                {reportType === "revenue" ? "Répartition des revenus" : reportType === "subscriptions" ? "Répartition des abonnements" : "Répartition des réservations"}
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
          <Badge variant="default">{period === "week" ? "Cette semaine" : period === "month" ? "Ce mois" : "Cette année"}</Badge>
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
                <td className="py-3 pr-4 text-green-600 dark:text-green-400">↑ 12.5%</td>
                <td className="py-3"><Badge variant="success">Excellent</Badge></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-900 dark:text-white">Abonnements actifs</td>
                <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{activeSubscriptions}</td>
                <td className="py-3 pr-4 text-green-600 dark:text-green-400">↑ 8.2%</td>
                <td className="py-3"><Badge variant="success">Bon</Badge></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-900 dark:text-white">Abonnements en attente</td>
                <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{pendingSubscriptions}</td>
                <td className="py-3 pr-4 text-amber-600 dark:text-amber-400">→ Stable</td>
                <td className="py-3"><Badge variant="warning">À surveiller</Badge></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-900 dark:text-white">Réservations confirmées</td>
                <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{confirmedReservations}</td>
                <td className="py-3 pr-4 text-green-600 dark:text-green-400">↑ 15.3%</td>
                <td className="py-3"><Badge variant="success">Excellent</Badge></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-900 dark:text-white">Taux de rétention</td>
                <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">87.2%</td>
                <td className="py-3 pr-4 text-green-600 dark:text-green-400">↑ 4.1%</td>
                <td className="py-3"><Badge variant="success">Excellent</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}