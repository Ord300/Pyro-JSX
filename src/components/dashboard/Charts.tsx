"use client";

import React from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

type RevenueChartProps = { payments?: any[] };
type SubscriptionsChartProps = { subscriptions?: any[] };
type ReservationsChartProps = { reservations?: any[] };
type ActivityDonutChartProps = { subscriptions?: any[] };

const tooltipStyle = {
  contentStyle: {
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    fontSize: "12px",
  },
};

// Graphique Revenus (Area) — paiements réussis uniquement, jamais de données mockées.
export function RevenueChart({ payments }: RevenueChartProps) {
  const data = React.useMemo(() => {
    const ok = (payments ?? []).filter((p) => p.status === "Réussi");
    if (ok.length === 0) return [];
    const map: Record<string, { month: string; revenue: number; ts: number }> = {};
    ok.forEach((p) => {
      const d = new Date(p.paidAt || p.createdAt || p.date || 0);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString("fr-FR", { month: "short" });
      if (!map[key]) map[key] = { month: label, revenue: 0, ts: d.getTime() };
      map[key].revenue += Number(p.total ?? p.amount) || 0;
    });
    return Object.values(map)
      .sort((a, b) => a.ts - b.ts)
      .map(({ month, revenue }) => ({ month, revenue, subscriptions: 0 }));
  }, [payments]);
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Évolution des revenus</h3>
        <p className="text-sm text-slate-400 mt-0.5">Revenus mensuels en USD (paiements réussis)</p>
        <p className="py-10 text-center text-sm text-slate-400">Aucun paiement réussi enregistré pour le moment.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Évolution des revenus</h3>
        <p className="text-sm text-slate-400 mt-0.5">Revenus mensuels en USD</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip {...tooltipStyle} formatter={(value) => [`$${Number(value ?? 0)}`, "Revenus"]} />
          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Graphique Abonnements (Bar) — vrais abonnements créés par mois calendaire.
export function SubscriptionsChart({ subscriptions }: SubscriptionsChartProps) {
  const data = React.useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) return [];
    const map: Record<string, { month: string; subscriptions: number; ts: number }> = {};
    subscriptions.forEach((s) => {
      const d = new Date(s.createdAt || s.startDate || 0);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString("fr-FR", { month: "short" });
      if (!map[key]) map[key] = { month: label, subscriptions: 0, ts: d.getTime() };
      map[key].subscriptions += 1;
    });
    return Object.values(map)
      .sort((a, b) => a.ts - b.ts)
      .map(({ month, subscriptions }) => ({ month, subscriptions }));
  }, [subscriptions]);
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Nouveaux abonnements</h3>
        <p className="text-sm text-slate-400 mt-0.5">Par mois</p>
        <p className="py-10 text-center text-sm text-slate-400">Aucun abonnement enregistré pour le moment.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Nouveaux abonnements</h3>
        <p className="text-sm text-slate-400 mt-0.5">Par mois</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} formatter={(value) => [Number(value ?? 0), "Abonnements"]} />
          <Bar dataKey="subscriptions" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Graphique Réservations (Line)
export function ReservationsChart({ reservations }: ReservationsChartProps) {
  const data = React.useMemo(() => {
    if (!reservations || reservations.length === 0) return [];
    const map: Record<string, number> = {};
    reservations.forEach((r) => {
      const d = new Date(r.date || r.createdAt || 0);
      if (Number.isNaN(d.getTime())) return;
      const key = d.toLocaleString("fr-FR", { weekday: "short" });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.keys(map).map((k) => ({ day: k, reservations: map[k] }));
  }, [reservations]);
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Réservations cette semaine</h3>
        <p className="text-sm text-slate-400 mt-0.5">Par jour</p>
        <p className="py-10 text-center text-sm text-slate-400">Aucune réservation enregistrée pour le moment.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Réservations cette semaine</h3>
        <p className="text-sm text-slate-400 mt-0.5">Par jour</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} formatter={(value) => [Number(value ?? 0), "Réservations"]} />
          <Line type="monotone" dataKey="reservations" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Graphique Activités (Donut Pie)
export function ActivityDonutChart({ subscriptions }: ActivityDonutChartProps) {
  const dist = React.useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) return [];
    const map: Record<string, number> = {};
    subscriptions.forEach((s: any) => {
      const name = s.activityName || s.activity || "Autre";
      map[name] = (map[name] || 0) + 1;
    });
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    return Object.keys(map).map((k, i) => ({ name: k, value: Math.round((map[k] / subscriptions.length) * 100), color: colors[i % colors.length] }));
  }, [subscriptions]);
  if (dist.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Activités populaires</h3>
        <p className="text-sm text-slate-400 mt-0.5">Répartition des abonnés</p>
        <p className="py-10 text-center text-sm text-slate-400">Aucun abonnement enregistré pour le moment.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Activités populaires</h3>
        <p className="text-sm text-slate-400 mt-0.5">Répartition des abonnés</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={dist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
              {dist.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={(value) => [`${Number(value ?? 0)}%`, "Abonnés"]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
          {dist.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-400 flex-1">{item.name}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}