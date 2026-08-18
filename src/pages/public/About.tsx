import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Dumbbell, Users, Target, Globe, Heart } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-primary-500 text-white py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <Badge className="mb-4 bg-white/20 text-white">À propos</Badge>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">À propos de notre centre sportif</h1>
            <p className="text-lg text-primary-100 mb-6">Nous offrons un espace moderne, sécurisé et connecté pour pratiquer vos activités préférées, encadré par des professionnels passionnés.</p>
            <div className="flex gap-3">
              <Link to="/activities"><Button className="bg-white text-primary-700">Découvrir nos activités</Button></Link>
              <Link to="/register"><Button variant="outline" className="text-white border-white/40">Devenir membre</Button></Link>
            </div>
          </div>
          <div className="flex-1">
            <img src="/assets/about-hero.jpg" alt="Centre sportif" className="w-full rounded-xl shadow-xl object-cover" />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 lg:px-8 py-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <img src="/assets/facilities.jpg" alt="Installations" className="w-full rounded-lg shadow-md object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Qui sommes-nous ?</h2>
            <p className="text-slate-600 mb-4">Notre centre sportif regroupe des installations modernes et un encadrement d'experts. Nous accompagnons les sportifs de tous niveaux, du loisir à la compétition.</p>
            <ul className="space-y-2 text-slate-500">
              <li><strong>Vision :</strong> Favoriser l'accès au sport pour tous, avec une expérience numérique fluide.</li>
              <li><strong>Mission :</strong> Offrir des infrastructures et un suivi professionnel pour améliorer la performance et le bien-être.</li>
              <li><strong>Engagement :</strong> Sécurité, propreté, et accompagnement personnalisé.</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-bold mb-6">Notre mission</h3>
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Target className="h-8 w-8 text-primary-600" />
              <div>
                <p className="font-semibold">Permettre à chacun de pratiquer régulièrement et progresser.</p>
                <p className="text-slate-600 mt-2">Nos programmes et services sont pensés pour simplifier l'accès au sport et suivre l'évolution de chaque membre.</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-bold mb-6">Nos valeurs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-5 text-center"><Dumbbell className="mx-auto mb-3 h-8 w-8 text-primary-600" /><h4 className="font-semibold">Excellence</h4><p className="text-sm text-slate-500 mt-2">Toujours viser la qualité.</p></Card>
            <Card className="p-5 text-center"><Users className="mx-auto mb-3 h-8 w-8 text-primary-600" /><h4 className="font-semibold">Respect</h4><p className="text-sm text-slate-500 mt-2">Esprit d'équipe et fair-play.</p></Card>
            <Card className="p-5 text-center"><Heart className="mx-auto mb-3 h-8 w-8 text-primary-600" /><h4 className="font-semibold">Accessibilité</h4><p className="text-sm text-slate-500 mt-2">Sport pour tous.</p></Card>
            <Card className="p-5 text-center"><Globe className="mx-auto mb-3 h-8 w-8 text-primary-600" /><h4 className="font-semibold">Innovation</h4><p className="text-sm text-slate-500 mt-2">Expérience connectée et numérique.</p></Card>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-bold mb-6">Nos infrastructures</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-4">Terrain de football</Card>
            <Card className="p-4">Salle de fitness</Card>
            <Card className="p-4">Salle de musculation</Card>
            <Card className="p-4">Terrain de basketball</Card>
            <Card className="p-4">Vestiaires</Card>
            <Card className="p-4">Espaces d'entraînement</Card>
          </div>
        </section>

        <section className="text-center py-12">
          <h3 className="text-2xl font-bold mb-4">Votre prochaine étape commence ici</h3>
          <p className="text-slate-600 mb-6">Rejoignez notre communauté et commencez votre transformation sportive.</p>
          <div className="flex justify-center gap-4">
            <Link to="/activities"><Button className="bg-primary-600 text-white">Découvrir nos activités</Button></Link>
            <Link to="/register"><Button variant="outline">Devenir membre</Button></Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default About;
