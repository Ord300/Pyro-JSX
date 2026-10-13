import Link from "next/link";
import { Button } from "@/src/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">FC Les Aigles du Congo — Centre sportif, Kinshasa.</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Données collectées</h2>
          <p className="mt-2">Nom, e-mail, téléphone, abonnements, paiements, réservations, présences et mesures de performance. Ces données servent exclusivement à la gestion sportive et administrative du centre.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Mots de passe</h2>
          <p className="mt-2">Les mots de passe sont stockés sous forme chiffrée (hachage) et ne sont jamais visibles par l&apos;administration. Modifiez votre mot de passe temporaire dès la première connexion et ne le partagez jamais.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Confidentialité des suivis</h2>
          <p className="mt-2">Votre historique (abonnements, paiements, reçus) n&apos;est visible que par vous, votre entraîneur et l&apos;administration. Aucune correspondance approximative n&apos;est utilisée : seul votre compte exact donne accès à vos données.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Notifications et e-mails</h2>
          <p className="mt-2">Le centre vous notifie dans l&apos;application pour chaque action importante. Les e-mails ne sont envoyés que si le service est configuré ; dans le cas contraire, vos notifications in-app font foi.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Vos droits</h2>
          <p className="mt-2">Vous pouvez demander la correction ou la suppression de vos données à l&apos;accueil du centre : contact@lesaiglesducongo.cd — +243 812 345 678.</p>
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
