"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { loadTrainerContext, type TrainerContext } from "@/src/services/trainerSpace";
import { formatAgeRange } from "@/src/data/mockData";
import { Cake, Clock, Users, Dumbbell } from "lucide-react";

export default function TrainerActivities() {
  const [ctx, setCtx] = useState<TrainerContext | null>(null);

  useEffect(() => {
    loadTrainerContext().then(setCtx);
  }, []);

  if (!ctx) return <p className="text-sm text-slate-500">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-sky-950 dark:text-sky-50">Mes activités</h1>
        <p className="mt-1 text-sm text-sky-900/60 dark:text-sky-200/60">
          Activités qui vous sont assignées par l&apos;administration.
        </p>
      </div>

      {ctx.myActivityNames.length === 0 ? (
        <Card className="p-10 text-center">
          <Dumbbell className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900 dark:text-white">Aucune activité assignée</p>
          <p className="mt-1 text-sm text-slate-500">Contactez l&apos;administration pour vous assigner des activités.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ctx.myActivityNames.map((name) => {
            const info = ctx.myActivities.find((a) => a.name === name);
            const subs = ctx.mySubscriptions.filter((s) => s.activityName === name);
            const active = subs.filter((s) => s.status === "Validée").length;
            return (
              <Card key={name} className="overflow-hidden p-0 shadow-sm">
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-100 text-5xl dark:from-sky-900/20 dark:to-cyan-800/20">
                  {info?.icon ?? "🏆"}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">{name}</h3>
                    {info && <Badge variant="default">{info.category}</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {info?.description ?? "Description non renseignée."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {info && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{info.duration}</span>}
                    {info && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{info.capacity} places</span>}
                    {info && formatAgeRange(info as any) && <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400"><Cake className="h-3.5 w-3.5" />{formatAgeRange(info as any)}</span>}
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                    <span className="text-slate-500">Abonnés actifs</span>
                    <span className="font-bold text-sky-700 dark:text-sky-300">{active} / {subs.length}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
