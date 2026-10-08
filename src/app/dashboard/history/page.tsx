"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { cn } from "@/src/utils/cn";
import { paymentsDB, reservationsDB, subscriptionsDB, usersDB } from "@/src/services/dbService";
import {
  History,
  Search,
  CreditCard,
  CalendarDays,
  Dumbbell,
  Wallet,
  MapPin,
  Clock,
  TrendingUp,
} from "lucide-react";

type HistoryType = "all" | "subscriptions" | "reservations" | "payments";
type Period = "all" | "7d" | "30d" | "year";

type TimelineItem = {
  kind: Exclude<HistoryType, "all">;
  id: string;
  ts: number;
  data: any;
};

const DAY_MS = 86_400_000;

const toDate = (value?: string | null) => {
  if (!value) return NaN;
  return new Date(value).getTime();
};

const formatDate = (value?: string | null) => {
  const ts = toDate(value);
  if (Number.isNaN(ts)) return String(value ?? "—");
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

const formatRelative = (ts: number) => {
  const days = Math.floor((Date.now() - ts) / DAY_MS);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 31) return `Il y a ${days} jours`;
  const months = Math.floor(days / 30);
  return `Il y a ${months} mois`;
};

export default function UserHistory() {
  const [filter, setFilter] = useState<HistoryType>("all");
  const [period, setPeriod] = useState<Period>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const load = useCallback(async () => {
    const email = localStorage.getItem("current_user_email") || localStorage.getItem("current_subscriber_email");
    setCurrentEmail(email?.toLowerCase() ?? null);
    const [users, subs, resas, pays] = await Promise.all([
      usersDB.getAll<any>(),
      subscriptionsDB.getAll<any>(),
      reservationsDB.getAll<any>(),
      paymentsDB.getAll<any>(),
    ]);
    setCurrentUser(email ? users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null : null);
    setSubscriptions(subs);
    setReservations(resas);
    setPayments(pays);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const unsubs = [
      subscriptionsDB.subscribe(load),
      reservationsDB.subscribe(load),
      paymentsDB.subscribe(load),
      usersDB.subscribe(load),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [load]);

  const matchesUser = useCallback(
    (item: any) => {
      if (!currentEmail) return false;
      if (String(item.email || "").toLowerCase() === currentEmail) return true;
      if (currentUser && item.userId === currentUser.id) return true;
      const name = String(currentUser?.name || "").toLowerCase();
      return Boolean(name) && String(item.userName || "").toLowerCase().includes(name);
    },
    [currentEmail, currentUser]
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Validée":
      case "Réussi":
      case "Confirmée":
      case "Terminée":
        return "success";
      case "En attente":
        return "warning";
      case "Expirée":
      case "Échoué":
      case "Annulée":
      case "Refusée":
        return "danger";
      default:
        return "default";
    }
  };

  const periodStart = useMemo(() => {
    if (period === "all") return 0;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 365;
    return Date.now() - days * DAY_MS;
  }, [period]);

  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    subscriptions.filter(matchesUser).forEach((sub) => {
      const ts = toDate(sub.createdAt) || toDate(sub.startDate) || 0;
      items.push({ kind: "subscriptions", id: `sub-${sub.id}`, ts, data: sub });
    });
    reservations.filter(matchesUser).forEach((res) => {
      const ts = toDate(res.createdAt) || toDate(`${res.date}T${res.time || "00:00"}`) || toDate(res.date) || 0;
      items.push({ kind: "reservations", id: `res-${res.id}`, ts, data: res });
    });
    payments.filter(matchesUser).forEach((pay) => {
      const ts = toDate(pay.paidAt) || toDate(pay.createdAt) || 0;
      items.push({ kind: "payments", id: `pay-${pay.id}`, ts, data: pay });
    });

    return items.sort((a, b) => b.ts - a.ts);
  }, [subscriptions, reservations, payments, matchesUser]);

  const totalSpent = useMemo(
    () =>
      timeline
        .filter(({ kind, data }) => kind === "payments" && data.status === "Réussi")
        .reduce((sum, { data }) => sum + (Number(data.amount) || 0), 0),
    [timeline]
  );

  const activeSubscriptionsCount = useMemo(() => {
    const now = Date.now();
    return timeline.filter(
      ({ kind, data }) => kind === "subscriptions" && data.status === "Validée" && toDate(data.endDate) >= now
    ).length;
  }, [timeline]);

  const counts = useMemo(() => {
    const base: Record<HistoryType, number> = { all: 0, subscriptions: 0, reservations: 0, payments: 0 };
    timeline.forEach(({ kind }) => {
      base[kind] += 1;
      base.all += 1;
    });
    return base;
  }, [timeline]);

  const matchesFilters = useCallback(
    ({ kind, data, ts }: TimelineItem) => {
      if (filter !== "all" && filter !== kind) return false;
      if (ts < periodStart) return false;
      const q = search.trim().toLowerCase();
      if (q) {
        const haystack =
          kind === "subscriptions"
            ? `${data.planName} ${data.activityName} ${data.memberNumber}`
            : kind === "reservations"
              ? `${data.activityName} ${data.placeName}`
              : `${data.description} ${data.reference} ${data.method}`;
        if (!String(haystack || "").toLowerCase().includes(q)) return false;
      }
      return true;
    },
    [filter, periodStart, search]
  );

  const visibleItems = useMemo(() => timeline.filter(matchesFilters), [timeline, matchesFilters]);
  const grouped = useMemo(
    () => ({
      subscriptions: visibleItems.filter(({ kind }) => kind === "subscriptions"),
      reservations: visibleItems.filter(({ kind }) => kind === "reservations"),
      payments: visibleItems.filter(({ kind }) => kind === "payments"),
    }),
    [visibleItems]
  );

  const subscriptionProgress = (sub: any) => {
    const start = toDate(sub.startDate);
    const end = toDate(sub.endDate);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return sub.status === "Validée" ? 100 : 0;
    return Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
  };

  const stats = [
    { label: "Total dépensé", value: `${totalSpent.toFixed(0)} USD`, icon: Wallet, tone: "text-primary-600 dark:text-primary-400", bg: "bg-primary-50 dark:bg-primary-900/20" },
    { label: "Abonnements actifs", value: String(activeSubscriptionsCount), icon: Dumbbell, tone: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Réservations", value: String(counts.reservations), icon: CalendarDays, tone: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Mon historique</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Consultez l'ensemble de vos activités passées.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone, bg }) => (
          <Card key={label} className="flex items-center gap-4 p-4">
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", bg)}>
              <Icon className={cn("h-5 w-5", tone)} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
              {loading ? (
                <div className="mt-1 h-5 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              ) : (
                <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "subscriptions", "reservations", "payments"] as HistoryType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                filter === type
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              )}
            >
              {type === "all" ? "Tout" : type === "subscriptions" ? "Abonnements" : type === "reservations" ? "Réservations" : "Paiements"}
              {!loading && (
                <span className={cn("ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold", filter === type ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700")}>
                  {counts[type]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="h-10 rounded-lg border border-slate-300 bg-transparent px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Toute la période</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="year">Année en cours</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-1/4 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </Card>
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Aucun résultat</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {timeline.length === 0
              ? "Votre historique apparaîtra ici dès votre première activité."
              : "Aucun élément ne correspond à votre recherche."}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.subscriptions.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Abonnements ({grouped.subscriptions.length})
              </h2>
              <div className="space-y-3">
                {grouped.subscriptions.map(({ id, data: sub }) => {
                  const progress = subscriptionProgress(sub);
                  const daysLeft = Math.ceil((toDate(sub.endDate) - Date.now()) / DAY_MS);
                  return (
                    <Card key={id} className="p-4 transition-shadow hover:shadow-md">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-600/25">
                            <Dumbbell className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{sub.planName}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{sub.activityName}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusVariant(sub.status)}>{sub.status}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <span>{formatDate(sub.startDate)} → {formatDate(sub.endDate)}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{sub.amount} {sub.currency}</span>
                        <span>• {sub.paymentMethod}</span>
                        {daysLeft > 0 && sub.status === "Validée" && (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">{daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""}</span>
                        )}
                      </div>
                      {sub.status === "Validée" && (
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {grouped.reservations.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Réservations ({grouped.reservations.length})
              </h2>
              <div className="space-y-3">
                {grouped.reservations.map(({ id, ts, data: res }) => (
                  <Card key={id} className="p-4 transition-shadow hover:shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl dark:bg-amber-900/20">
                          {res.activityIcon || "🏋️"}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{res.activityName}</p>
                          <div className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(res.date)} à {res.time}</span>
                            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{res.placeName}</span>
                            <span className="hidden items-center gap-1 sm:inline-flex"><Clock className="h-3.5 w-3.5" />{formatRelative(ts)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(res.status)}>{res.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {grouped.payments.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Paiements ({grouped.payments.length})
              </h2>
              <div className="space-y-3">
                {grouped.payments.map(({ id, ts, data: pay }) => (
                  <Card key={id} className="p-4 transition-shadow hover:shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                          <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </span>
                        <div>
                          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{pay.reference}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{pay.description}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {pay.method} • {formatDate(pay.paidAt || pay.createdAt)} • {formatRelative(ts)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center justify-end gap-1 font-bold text-slate-900 dark:text-white">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          {pay.amount} {pay.currency}
                        </p>
                        <Badge variant={getStatusVariant(pay.status)}>{pay.status}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
