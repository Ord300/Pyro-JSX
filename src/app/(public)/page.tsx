"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Dumbbell, Star, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Card, CardContent } from "@/src/components/ui/Card";
import { mockTestimonials } from "@/src/data/mockData";
import { usersDB, placesDB } from "@/src/services/dbService";
import { useActivities } from "@/src/hooks/queries/activities";
import { useTrainers } from "@/src/hooks/queries/trainers";
import { useGallery } from "@/src/hooks/queries/gallery";
import { useScrollReveal } from "@/src/hooks/useScrollReveal";
import { useCounter } from "@/src/hooks/useCounter";

// --- Composant Stat (design similaire à la page À propos) ---
function StatCard({ label, value, index }: { label: string; value: number; index: number }) {
  const { count, ref } = useCounter(value);
  const delays = ["", "delay-100", "delay-200", "delay-300"];
  return (
    <div ref={ref} className={`reveal bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl text-center ${delays[index % 4]}`}>
      <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">+{count}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

// --- Composant Étoiles ---
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
      ))}
    </div>
  );
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1600&auto=format&fit=crop",
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"monthly" | "yearly">("monthly");
  const [heroSlide, setHeroSlide] = useState(0);
  const { data: activities = [] } = useActivities();
  const { data: trainers = [] } = useTrainers();
  const { data: galleryImages = [] } = useGallery();
  const [membersCount, setMembersCount] = useState(0);
  const [placesCount, setPlacesCount] = useState(0);

  useScrollReveal();

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

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-primary-950 px-6 py-10">
        {/* Images des installations qui défilent en arrière-plan */}
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${i === heroSlide ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={img}
              alt={`Installation sportive ${i + 1}`}
              className={`h-full w-full object-cover ${i === heroSlide ? "animate-[hero-zoom_8s_ease-out_forwards]" : ""}`}
            />
          </div>
        ))}
        {/* Overlays pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/95 via-primary-900/80 to-primary-700/60" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative z-10 mx-auto max-w-6xl text-center">
          {/* Petit titre accrocheur */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm reveal">
            <Sparkles className="h-4 w-4 text-primary-200" />
            Le sport qui change tout — rejoignez le n°1 de la ville
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight reveal">
            Dépassez vos limites,
            <br />
            <span className="text-primary-200">excellez en performance.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-100 leading-relaxed reveal delay-200">
            Un espace sportif moderne pour vous entraîner, réserver vos activités et gérer votre abonnement en toute simplicité.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 reveal delay-300">
            <Link href="/activities">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold shadow-lg w-full sm:w-auto">
                Découvrir les activités <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-2 border-white/60 text-white hover:bg-white/10 w-full sm:w-auto">
                Commencer maintenant
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex justify-center reveal delay-400">
            <a href="#stats" className="flex flex-col items-center text-white/60 hover:text-white transition-colors animate-bounce">
              <ChevronDown className="h-6 w-6" />
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="bg-background dark:bg-dark-background py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard index={0} label="Membres actifs" value={membersCount} />
          <StatCard index={1} label="Activités proposées" value={activities.length} />
          <StatCard index={2} label="Entraîneurs experts" value={trainers.length} />
          <StatCard index={3} label="Espaces sportifs" value={placesCount} />
        </div>
      </section>

      {/* ── ACTIVITÉS ── */}
      <section className="bg-background dark:bg-dark-background py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14 reveal">
            <Badge variant="default" className="mb-3 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">Nos disciplines</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">Activités sportives</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Choisissez parmi nos activités encadrées par des professionnels certifiés.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.slice(0, 8).map((activity, index) => (
              <Card key={activity.id} className={`group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800 reveal ${index % 4 === 0 ? "delay-100" : index % 4 === 1 ? "delay-200" : index % 4 === 2 ? "delay-300" : "delay-400"}`}>
                {activity.image?.startsWith("data:") || activity.image?.startsWith("http") ? <img src={activity.image} alt={activity.name} className="h-36 w-full object-cover img-zoom" /> : <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-6xl dark:from-primary-900/20 dark:to-primary-800/20">{activity.icon}</div>}
                <CardContent className="p-4 pt-4">
                  <Badge variant="default" className="mb-2 text-xs bg-slate-100 dark:bg-slate-800">{activity.category}</Badge>
                  <h3 className="font-bold text-slate-900 dark:text-white">{activity.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{activity.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>⏱ {activity.duration}</span>
                    <span>👥 {activity.capacity} pers.</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{activity.priceMonth} USD/mois</span>
                    <Link href="/register">
                      <Button size="sm" variant="ghost" className="text-xs px-2 py-1">Voir →</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center reveal">
            <Link href="/activities">
              <Button size="lg" variant="outline">Voir toutes les activités</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION BANNIÈRE IMAGE ── */}
      <section className="relative overflow-hidden py-24 px-6 lg:px-8">
        <img
          src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2000&auto=format&fit=crop"
          alt="Entraînement salle de sport"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary-900/70" />
        <div className="relative mx-auto max-w-4xl text-center text-white reveal-scale">
          <Dumbbell className="mx-auto mb-6 h-14 w-14 text-primary-300" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Atteignez vos objectifs avec nos équipements de pointe</h2>
          <p className="text-lg text-primary-100 mb-8">
            Des machines modernes, des espaces adaptés et un accompagnement personnalisé pour chaque discipline.
          </p>
          <Link href="/activities">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold shadow-lg">
              Découvrir nos équipements <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── ENTRAÎNEURS ── */}
      <section className="bg-background dark:bg-dark-background py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14 reveal">
            <Badge variant="default" className="mb-3 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">L'équipe</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">Nos entraîneurs experts</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Des professionnels certifiés à votre service pour vous accompagner vers vos objectifs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.slice(0, 6).map((trainer, index) => (
              <Card key={trainer.id} className={`group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800 reveal-left ${index % 3 === 0 ? "delay-100" : index % 3 === 1 ? "delay-200" : "delay-300"}`}>
                <div className="h-40 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center overflow-hidden">
                  {trainer.image?.startsWith("data:") || trainer.image?.startsWith("http") ? <img src={trainer.image} alt={trainer.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-white/20" /> : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-4xl font-bold text-white">{trainer.name.split(" ").map((n) => n[0]).join("")}</div>}
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{trainer.name}</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{trainer.specialty}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{trainer.bio}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="success" className="text-xs">{trainer.experience} d'expérience</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center reveal">
            <Link href="/register"><Button size="lg" variant="outline">Rencontrer toute l'équipe</Button></Link>
          </div>
        </div>
      </section>

      {/* ── GALERIE IMAGES ── */}
      <section className="bg-slate-100 dark:bg-slate-900 py-12 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10 reveal">
            <Badge variant="default" className="mb-3 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">Nos installations</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">Découvrez notre centre</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages
              .filter((img) => img.visible)
              .sort((a, b) => a.order - b.order)
              .map((img, index) => (
                <img
                  key={img.id}
                  src={img.image}
                  alt={img.alt || img.title}
                  className={`h-40 w-full object-cover rounded-xl shadow-md reveal-scale ${index % 4 === 1 ? "delay-100" : index % 4 === 2 ? "delay-200" : index % 4 === 3 ? "delay-300" : ""} img-zoom`}
                />
              ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="bg-slate-50 dark:bg-slate-950 py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10 reveal">
            <Badge variant="default" className="mb-3 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">Témoignages</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">Ce que disent nos membres</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {mockTestimonials.map((t, index) => (
              <Card key={t.id} className={`p-5 flex flex-col gap-3 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow reveal ${index % 4 === 0 ? "delay-100" : index % 4 === 1 ? "delay-200" : index % 4 === 2 ? "delay-300" : "delay-400"}`}>
                <Stars rating={t.rating} />
                <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed flex-1">"{t.comment}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.activity}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl reveal-scale">
          <h2 className="text-4xl font-extrabold text-white">Prêt à commencer votre transformation ?</h2>
          <p className="mt-4 text-primary-100 text-lg">Rejoignez plus de 500 membres qui font déjà confiance à notre centre.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold shadow-lg w-full sm:w-auto">
                S'abonné maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}