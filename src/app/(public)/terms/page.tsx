import Link from "next/link";
import { Button } from "@/src/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Conditions d&apos;utilisation</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">FC Les Aigles du Congo — Centre sportif, Kinshasa.</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Objet</h2>
          <p className="mt-2">Le présent site permet de découvrir les activités du centre, de soumettre une Inscription, de payer son abonnement en ligne, de réserver des séances et de suivre ses reçus, présences et performances.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Compte abonné</h2>
          <p className="mt-2">L&apos;abonnement est personnel et non transférable. Le port de la carte d&apos;abonné (virtuelle ou QR) est obligatoire pour accéder aux installations. L&apos;abonné s&apos;engage à fournir des informations exactes et à modifier son mot de passe temporaire dès la première connexion.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Paiements</h2>
          <p className="mt-2">Le paiement est exigé à l&apos;avance pour la période choisie (semaine, mois ou année). Les paiements par Mobile Money sont simulés en mode démonstration ; seul un reçu au statut « Payé » vaut preuve de paiement. Aucun remboursement après 48 h suivant l&apos;activation de l&apos;abonnement.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Réservations et présences</h2>
          <p className="mt-2">Les activités sont soumises à disponibilité et à réservation. Le centre se réserve le droit de modifier les horaires. Les présences sont enregistrées par les entraîneurs à chaque séance.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Contact</h2>
          <p className="mt-2">Pour toute question : contact@lesaiglesducongo.cd — +243 812 345 678 — Kinshasa, RDC.</p>
        </section>
      </div>

      <Link href="/">
        <Button variant="outline" className="mt-10">
          <ArrowLeft className="mr-2 h-4 w-4" />Retour à l&apos;accueil
        </Button>
      </Link>
    </div>
  );
}
