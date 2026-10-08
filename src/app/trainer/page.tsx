"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { loadTrainerContext, phoneOf, type TrainerContext } from "@/src/services/trainerSpace";
import { Activity, Users, UserCheck, UserX, ArrowRight, Dumbbell } from "lucide-react";

const statusVariant = (s: string) =>
  s === "Validée" ? "success" : s === "Expirée" ? "warning" : s === "Annulée" ? "danger" : "default";

export default function TrainerDashboard() {
  const [ctx, setCtx] = useState<TrainerContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrainerContext().then((c) => {
      setCtx(c);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Chargement de votre espace…</p>;
  }

  if (!ctx?.trainer) {
    return (
      <Card className="p-10 text-center">
        <Dumbbell className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-3 font-semibold text-slate-900 dark:text-white">Aucune fiche entraîneur liée à ce compte</h2>
        <p className="mt-1 text-sm text-slate-500">Demandez à l&apos;administration d&apos;associer votre email ({ctx?.user?.email}) à votre fiche entraîneur.</p>
      </Card>
    );
  }

  const active = ctx.mySubscriptions.filter((s) => s.status === "Validée");
  const expired = ctx.mySubscriptions.filter((s) => s.status === "Expirée");

  const stats = [
    { label: "Mes activités", value: ctx.myActivityNames.length, icon: Activity, color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20" },
    { label: "Abonnés actifs", value: active.length, icon: UserCheck, color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" },
    { label: "Total abonnés", value: ctx.mySubscriptions.length, icon: Users, color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20" },
    { label: "Expirés", value: expired.length, icon: UserX, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
  ];

  const recent = [...ctx.mySubscriptions].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-sky-950 dark:text-sky-50">
          Bonjour, {ctx.trainer.name}
        </h1>
        <p className="mt-1 text-sm text-sky-900/60 dark:text-sky-200/60">
          {ctx.trainer.specialty} · {ctx.myActivityNames.length} activité(s) · {active.length} abonné(s) actif(s)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mes activités */}
        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Mes activités</h2>
            <Link href="/trainer/activities" className="flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {ctx.myActivityNames.length === 0 && (
              <p className="text-sm text-slate-500">Aucune activité assignée pour le moment.</p>
            )}
            {ctx.myActivityNames.map((name) => {
              const count = ctx.mySubscriptions.filter((s) => s.activityName === name).length;
              const info = ctx.myActivities.find((a) => a.name === name);
              return (
                <div key={name} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <span className="text-2xl">{info?.icon ?? "🏆"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{name}</p>
                    <p className="text-xs text-slate-500">{info?.category ?? "Activité"} · {count} abonné(s)</p>
                  </div>
                  <Badge variant="default">{count}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Abonnés récents */}
        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Abonnés récents</h2>
            <Link href="/trainer/subscribers" className="flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
              Gérer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recent.length === 0 && (
              <p className="text-sm text-slate-500">Aucun abonné sur vos activités pour le moment.</p>
            )}
            {recent.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                  {(s.userName ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{s.userName}</p>
                  <p className="truncate text-xs text-slate-500">{s.activityName} · {phoneOf(ctx.users, s.email)}</p>
                </div>
                <Badge variant={statusVariant(s.status) as any}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
