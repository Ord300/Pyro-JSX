"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Dumbbell, Users, Target, Globe, Heart, ShieldCheck, Clock, ChevronRight, Sparkles, Award } from "lucide-react";
import { useScrollReveal } from "@/src/hooks/useScrollReveal";
import { useCounter } from "@/src/hooks/useCounter";
import { usersDB, placesDB } from "@/src/services/dbService";
import { useActivities } from "@/src/hooks/queries/activities";
import { useTrainers } from "@/src/hooks/queries/trainers";

// --- Composant Stat dynamique avec compteur animé ---
function StatCard({ label, value, index }: { label: string; value: number; index: number }) {
  const { count, ref } = useCounter(value);
  const delays = ["", "delay-100", "delay-200", "delay-300"];
  return (
    <div ref={ref} className={`reveal bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl text-center hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors duration-300 ${delays[index % 4]}`}>
      <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">+{count}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function About() {
  useScrollReveal();
  const { data: activities = [] } = useActivities();
  const { data: trainers = [] } = useTrainers();
  const [membersCount, setMembersCount] = useState(0);
  const [placesCount, setPlacesCount] = useState(0);

  useEffect(() => {
    const refresh = async () => {
      const [users, places] = await Promise.all([usersDB.getAll(), placesDB.getAll()]);
      setMembersCount(users.length);
      setPlacesCount(places.length);
    };
    refresh();
    const onChange = () => refresh();
    window.addEventListener("db-change", onChange as any);
    return () => window.removeEventListener("db-change", onChange as any);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* HERO — moitié d'écran */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-gradient-to-r from-primary-800 to-primary-500 text-white py-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <Badge className="mb-4 inline-flex items-center gap-1.5 bg-white/20 text-white backdrop-blur-sm reveal reveal-visible">
              <Sparkles className="h-3.5 w-3.5" /> À propos
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight mb-4 reveal">Un centre sportif pensé pour votre progression</h1>
            <p className="text-lg text-primary-100 mb-6 reveal delay-200">Nous offrons un espace moderne, sécurisé et connecté pour pratiquer vos activités préférées, encadré par des professionnels passionnés.</p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 reveal delay-300">
              <Link href="/activities"><Button className="bg-white text-primary-700 hover:bg-primary-50">Découvrir nos activités</Button></Link>
              <Link href="/register"><Button variant="outline" className="text-white border-white/40 hover:bg-white/10">Devenir membre</Button></Link>
            </div>
          </div>
          <div className="flex-1 reveal-right">
            <img
              src="https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1200&auto=format&fit=crop"
              alt="Centre sportif moderne"
              className="w-full rounded-xl shadow-2xl object-cover img-zoom"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 lg:px-8 py-16">
        {/* QUI SOMMES-NOUS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-20">
          <div className="reveal-left">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop"
                alt="Nos installations sportives"
                className="w-full rounded-xl shadow-xl object-cover img-zoom"
              />
              <div className="absolute -bottom-5 -right-3 sm:-right-5 rounded-xl bg-primary-600 px-5 py-4 text-white shadow-lg ring-4 ring-background dark:ring-dark-background">
                <p className="text-2xl font-extrabold">10+</p>
                <p className="text-xs text-primary-100">Années d'expérience</p>
              </div>
            </div>
          </div>
          <div className="reveal-right delay-200">
            <Badge variant="default" className="mb-3 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">Qui sommes-nous ?</Badge>
            <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Bien plus qu'une simple salle de sport</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">Notre centre sportif regroupe des installations modernes et un encadrement d'experts. Nous accompagnons les sportifs de tous niveaux, du loisir à la compétition.</p>
            <ul className="space-y-3">
              {[
                { icon: Target, title: "Vision", text: "Favoriser l'accès au sport pour tous, avec une expérience numérique fluide." },
                { icon: ShieldCheck, title: "Engagement", text: "Sécurité, propreté, et accompagnement personnalisé." },
                { icon: Clock, title: "Disponibilité", text: "Ouvert 7j/7 avec des créneaux adaptés à tous les emplois du temps." },
              ].map(({ icon: Icon, title, text }, i) => (
                <li key={title} className={`flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 reveal ${i === 0 ? "" : i === 1 ? "delay-100" : "delay-200"}`}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
                    <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* STATS — dynamiques */}
        <section id="stats" className="mb-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard index={0} value={trainers.length} label="Entraîneurs qualifiés" />
          <StatCard index={1} value={membersCount} label="Membres actifs" />
          <StatCard index={2} value={placesCount} label="Infrastructures" />
          <StatCard index={3} value={activities.length} label="Activités proposées" />
        </section>

        {/* NOTRE MISSION */}
        <section className="mb-20">
          <div className="text-center mb-10 reveal">
            <Badge variant="default" className="mb-3 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">Notre mission</Badge>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Permettre à chacun de pratiquer régulièrement et progresser</h3>
          </div>
          <Card className="overflow-hidden reveal-scale">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 p-8 items-center">
              <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-600/25">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <p className="font-bold text-lg text-slate-900 dark:text-white">Notre engagement</p>
                <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">Nos programmes et services sont pensés pour simplifier l'accès au sport et suivre l'évolution de chaque membre, avec des équipements de dernière génération et un suivi personnalisé.</p>
                <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-2">
                  {["Équipements modernes", "Suivi personnalisé", "Communauté active"].map((chip) => (
                    <span key={chip} className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      <Award className="h-3.5 w-3.5" />{chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* NOS VALEURS */}
        <section className="mb-20">
          <div className="text-center mb-10 reveal">
            <Badge variant="default" className="mb-3 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">Nos valeurs</Badge>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Ce qui nous guide</h3>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Quatre principes fondamentaux qui orientent chacune de nos décisions au quotidien.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Dumbbell, title: "Excellence", text: "Toujours viser la qualité et la performance.", delay: "" },
              { icon: Users, title: "Respect", text: "Esprit d'équipe et fair-play.", delay: "delay-100" },
              { icon: Heart, title: "Accessibilité", text: "Sport pour tous, sans exception.", delay: "delay-200" },
              { icon: Globe, title: "Innovation", text: "Expérience connectée et numérique.", delay: "delay-300" },
            ].map(({ icon: Icon, title, text, delay }) => (
              <Card key={title} className={`group p-6 text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 reveal ${delay}`}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 transition-transform duration-300 group-hover:scale-110 dark:bg-primary-900/30">
                  <Icon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{text}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-10 sm:p-14 text-center text-white reveal-scale">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="relative z-10 mx-auto max-w-2xl">
            <Dumbbell className="mx-auto mb-5 h-12 w-12 text-primary-200" />
            <h3 className="text-3xl font-bold mb-4">Votre prochaine étape commence ici</h3>
            <p className="text-primary-100 mb-8 text-lg">Rejoignez notre communauté et commencez votre transformation sportive dès aujourd'hui.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/activities">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold w-full sm:w-auto">
                  Découvrir nos activités <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 w-full sm:w-auto">
                  Devenir membre
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
