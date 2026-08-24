"use client";

import { useState } from "react";
import Link from "next/link";
import { useActivities } from "@/src/hooks/queries/activities";
import { useScrollReveal } from "@/src/hooks/useScrollReveal";
import { Badge } from "@/src/components/ui/Badge";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Clock, Users, Sparkles, SearchX } from "lucide-react";

export default function Activities() {
  const { data: activities = [] } = useActivities();
  const categories = [...new Set(activities.map((a) => a.category))];
  const [selected, setSelected] = useState("Tous");
  useScrollReveal();

  const filtered = selected === "Tous" ? activities : activities.filter((a) => a.category === selected);

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* Header — moitié d'écran */}
      <div className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-500 px-6 py-12 text-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Badge className="mb-4 inline-flex items-center gap-1.5 bg-white/20 text-white border-white/30 backdrop-blur-sm reveal reveal-visible">
            <Sparkles className="h-3.5 w-3.5" />Nos disciplines
          </Badge>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl leading-tight reveal">Activités sportives</h1>
          <p className="mt-4 text-lg text-primary-100 reveal delay-200">Explorez l'ensemble de nos disciplines encadrées par des entraîneurs certifiés.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/85 reveal delay-300">
            <span><strong className="text-white">{activities.length}</strong> activités</span>
            <span><strong className="text-white">{categories.length}</strong> catégories</span>
            <span>Coachs certifiés</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center reveal">
          {["Tous", ...categories].map((cat) => {
            const count = cat === "Tous" ? activities.length : activities.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  selected === cat
                    ? "border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-600/25"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
                <span className={`rounded-full px-2 py-0.5 text-xs ${selected === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Grille d'activités */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center dark:border-slate-700">
            <SearchX className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-900 dark:text-white">Aucune activité trouvée</p>
            <p className="mt-1 text-sm text-slate-500">Essayez une autre catégorie.</p>
            <Button variant="outline" size="sm" className="mt-5" onClick={() => setSelected("Tous")}>Voir toutes les activités</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((activity, index) => (
              <Card key={activity.id} className={`group overflow-hidden border-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-slate-800 reveal ${index % 4 === 1 ? "delay-100" : index % 4 === 2 ? "delay-200" : index % 4 === 3 ? "delay-300" : ""}`}>
                <div className="relative h-44 overflow-hidden">
                  {activity.image?.startsWith("data:") || activity.image?.startsWith("http") ? (
                    <img src={activity.image} alt={activity.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-7xl transition-transform duration-500 group-hover:scale-110 dark:from-primary-900/20 dark:to-primary-800/20">{activity.icon}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary-700 shadow backdrop-blur-sm dark:bg-slate-900/90 dark:text-primary-400">
                    dès {activity.priceWeek} $
                  </span>
                  <Badge className="absolute bottom-3 left-3 border-0 bg-white/90 text-xs text-primary-700 shadow backdrop-blur-sm dark:bg-slate-900/90 dark:text-primary-400">{activity.category}</Badge>
                </div>

                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">{activity.name}</h3>
                  <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-500 dark:text-slate-400">{activity.description}</p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Clock className="h-3 w-3" />{activity.duration}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Users className="h-3 w-3" />{activity.capacity} pers.</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-[10px] font-bold text-white">
                      {activity.trainer?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">Coach <span className="font-medium text-slate-700 dark:text-slate-200">{activity.trainer}</span></p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-400">À partir de</p>
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{activity.priceWeek} USD<span className="text-xs font-normal text-slate-400">/sem.</span></p>
                    </div>
                    <Link href="/register"><Button size="sm">S'abonner</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
