"use client";

import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Dumbbell, Users, Target, Globe, Heart, ShieldCheck, Clock, ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/src/hooks/useScrollReveal";

export default function About() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-primary-500 text-white py-24">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="mx-auto max-w-6xl px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <Badge className="mb-4 bg-white/20 text-white reveal reveal-visible">À propos</Badge>
            <h1 className="text-4xl font-extrabold leading-tight mb-4 reveal">À propos de notre centre sportif</h1>
            <p className="text-lg text-primary-100 mb-6 reveal delay-200">Nous offrons un espace moderne, sécurisé et connecté pour pratiquer vos activités préférées, encadré par des professionnels passionnés.</p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 reveal delay-300">
              <Link href="/activities"><Button className="bg-white text-primary-700">Découvrir nos activités</Button></Link>
              <Link href="/register"><Button variant="outline" className="text-white border-white/40">Devenir membre</Button></Link>
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
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
          <div className="reveal-left">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop"
                alt="Nos installations sportives"
                className="w-full rounded-lg shadow-xl object-cover img-zoom"
              />
              <div className="absolute -bottom-5 -right-5 rounded-xl bg-primary-600 px-5 py-4 text-white shadow-lg">
                <p className="text-2xl font-extrabold">10+</p>
                <p className="text-xs text-primary-100">Années d'expérience</p>
              </div>
            </div>
          </div>
          <div className="reveal-right delay-200">
            <Badge variant="default" className="mb-3 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">Qui sommes-nous ?</Badge>
            <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Un centre sportif pensé pour vous</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">Notre centre sportif regroupe des installations modernes et un encadrement d'experts. Nous accompagnons les sportifs de tous niveaux, du loisir à la compétition.</p>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Vision :</strong> Favoriser l'accès au sport pour tous, avec une expérience numérique fluide.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Engagement :</strong> Sécurité, propreté, et accompagnement personnalisé.</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Disponibilité :</strong> Ouvert 7j/7 avec des créneaux adaptés à tous les emplois du temps.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="reveal bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl text-center">
            <p className="text-3xl font-extrabold text-primary-600">10+</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Années d'expérience</p>
          </div>
          <div className="reveal delay-100 bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl text-center">
            <p className="text-3xl font-extrabold text-primary-600">200+</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Entraîneurs qualifiés</p>
          </div>
          <div className="reveal delay-200 bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl text-center">
            <p className="text-3xl font-extrabold text-primary-600">500+</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Membres actifs</p>
          </div>
          <div className="reveal delay-300 bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl text-center">
            <p className="text-3xl font-extrabold text-primary-600">15+</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Infrastructures</p>
          </div>
        </section>

        {/* NOTRE MISSION */}
        <section className="mb-16">
          <div className="text-center mb-10 reveal">
            <Badge variant="default" className="mb-3 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">Notre mission</Badge>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Permettre à chacun de pratiquer régulièrement et progresser</h3>
          </div>
          <Card className="p-8 reveal-scale">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Target className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-lg text-slate-900 dark:text-white">Notre engagement</p>
                <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">Nos programmes et services sont pensés pour simplifier l'accès au sport et suivre l'évolution de chaque membre, avec des équipements de dernière génération et un suivi personnalisé.</p>
              </div>
            </div>
          </Card>
        </section>

        {/* NOS VALEURS */}
        <section className="mb-16">
          <div className="text-center mb-10 reveal">
            <Badge variant="default" className="mb-3 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">Nos valeurs</Badge>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Ce qui nous guide</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow reveal">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Dumbbell className="h-7 w-7 text-primary-600" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Excellence</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Toujours viser la qualité et la performance.</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow reveal delay-100">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Users className="h-7 w-7 text-primary-600" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Respect</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Esprit d'équipe et fair-play.</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow reveal delay-200">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Heart className="h-7 w-7 text-primary-600" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Accessibilité</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sport pour tous, sans exception.</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow reveal delay-300">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Globe className="h-7 w-7 text-primary-600" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Innovation</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Expérience connectée et numérique.</p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl p-10 sm:p-14 text-center text-white reveal-scale">
          <h3 className="text-3xl font-bold mb-4">Votre prochaine étape commence ici</h3>
          <p className="text-primary-100 mb-8 text-lg">Rejoignez notre communauté et commencez votre transformation sportive.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/activities">
              <Button className="bg-white text-primary-700 hover:bg-primary-50 font-semibold w-full sm:w-auto">
                Découvrir nos activités <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="text-white border-white/50 hover:bg-white/10 w-full sm:w-auto">
                Devenir membre
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}