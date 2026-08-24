import Link from "next/link";
import { Dumbbell, Globe, Camera, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Dumbbell className="h-8 w-8 text-primary-600 dark:text-primary-500" />
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MoveUp</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Votre plateforme complète pour gérer vos activités sportives et abonnements en toute simplicité.
            </p>
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              <div>📞 +33 1 23 45 67 89</div>
              <div>✉️ contact@centre-sportif.example</div>
              <div>🏢 12 Rue du Sport, 75000 Paris</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">À propos</Link></li>
              <li><Link href="/activities" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Activités</Link></li>
              <li><Link href="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Légal</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Conditions d'utilisation</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Politique de confidentialité</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <span className="sr-only">Facebook</span>
                <Globe className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <span className="sr-only">Instagram</span>
                <Camera className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} MoveUp. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}