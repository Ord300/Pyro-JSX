import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center text-center px-4 bg-slate-50 dark:bg-slate-950">
      <div>
        <h1 className="text-8xl font-extrabold text-primary-600 dark:text-primary-400">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page introuvable</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">La page que vous recherchez n'existe pas.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 text-white px-6 py-3 font-medium hover:bg-primary-700 transition-colors">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}