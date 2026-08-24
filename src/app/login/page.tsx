"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, Eye, EyeOff, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent } from "@/src/components/ui/Card";
import { useAuth } from "@/src/contexts/AuthContext";

const FACILITY_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
];

export default function Login() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [slide, setSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const auth = useAuth();

  // Carrousel automatique
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSlide((prev) => (prev + 1) % FACILITY_IMAGES.length);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goTo = (index: number) => {
    setSlide(((index % FACILITY_IMAGES.length) + FACILITY_IMAGES.length) % FACILITY_IMAGES.length);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSlide((prev) => (prev + 1) % FACILITY_IMAGES.length);
      }, 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await auth.login(form.email.trim(), form.password);
    setLoading(false);
    if (!res.ok) {
      setError(res.message || "Erreur");
      return;
    }
    const user = (res as any).user ?? auth.user;
    if (user?.role === "Gestionnaire") router.push("/admin");
    else router.push(user?.mustChangePassword ? "/change-password" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* ── COLONNE GAUCHE : FORMULAIRE ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Dumbbell className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MoveUp</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Bon retour parmi nous !</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Connectez-vous pour accéder à votre espace.</p>
          </div>

          {/* Titre desktop */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Bon retour parmi nous !</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Connectez-vous pour accéder à votre espace.</p>
          </div>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-200">{error}</p>}
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Adresse email</label>
                  <Input id="login-email" type="email" placeholder="jean@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</label>
                    <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline dark:text-primary-400">Mot de passe oublié ?</Link>
                  </div>
                  <div className="relative">
                    <Input id="login-password" type={showPwd ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="pr-10" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="remember" type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">Se souvenir de moi</label>
                </div>
                <Button type="submit" size="lg" className="w-full" isLoading={loading}>Se connecter</Button>
              </form>

              {/* Lien vers l'inscription */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pas encore de compte ?{" "}
                  <Link href="/register" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">S'inscrire</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── COLONNE DROITE : CARROUSEL INSTALLATIONS & ÉQUIPEMENTS ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500">
        {/* Images en carrousel */}
        {FACILITY_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100" : "opacity-0"}`}
          >
            <img src={img} alt={`Installation ${i + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-900/40 to-primary-900/20" />
          </div>
        ))}

        {/* Contenu superposé */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo + lien accueil */}
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-white">
              <Dumbbell className="h-9 w-9" />
              <span className="text-2xl font-extrabold tracking-tight">MoveUp</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Texte central */}
          <div className="text-white">
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Nos installations
              <br />
              <span className="text-primary-200">et équipements de pointe.</span>
            </h2>
            <p className="text-lg text-primary-100 max-w-md">
              Des machines modernes, des espaces adaptés et un accompagnement personnalisé pour chaque discipline.
            </p>
          </div>

          {/* Contrôles du carrousel */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {FACILITY_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
                  aria-label={`Aller à l'image ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goTo(slide - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => goTo(slide + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}