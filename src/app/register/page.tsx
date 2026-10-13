"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent } from "@/src/components/ui/Card";
import { subscriptionFlow } from "@/src/services/subscriptionFlowService";
import { useToast } from "@/src/contexts/ToastContext";
import { useActivities } from "@/src/hooks/queries/activities";
import { useGallerySlides } from "@/src/hooks/useGallerySlides";

export default function Register() {
  const router = useRouter();
  const toast = useToast();
  const { data: activities = [] } = useActivities();
  const gallerySlides = useGallerySlides();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", plan: "", activityId: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [slide, setSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Carrousel automatique — images de la galerie admin
  useEffect(() => {
    if (gallerySlides.length === 0) return;
    timerRef.current = setInterval(() => {
      setSlide((prev) => (prev + 1) % gallerySlides.length);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gallerySlides.length]);

  const goTo = (index: number) => {
    if (gallerySlides.length === 0) return;
    setSlide(((index % gallerySlides.length) + gallerySlides.length) % gallerySlides.length);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSlide((prev) => (prev + 1) % gallerySlides.length);
      }, 4000);
    }
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    if (!name) e.name = "Le nom est requis.";
    if (!email) e.email = "L'e-mail est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Adresse e-mail invalide.";
    if (!phone) e.phone = "Le téléphone est requis.";
    else if (!/^(\+243|0)\d{9}$/.test(phone.replace(/[\s.\-]/g, "")))
      e.phone = "Numéro invalide. Format attendu : +243 XXX XXX XXX.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const name = form.name.trim();
      const email = form.email.trim().toLowerCase();
      const phone = form.phone.trim();
      // Anti-doublon : une demande "En attente" existe déjà pour cet e-mail
      const all = await subscriptionFlow.requests();
      const duplicate = all.find(
        (request) =>
          String(request.email || "").trim().toLowerCase() === email &&
          request.status === "En attente" &&
          (request.subject === "Inscription" ||
            (request.subject && request.subject.toLowerCase().includes("abonnement")))
      );
      if (duplicate) {
        setErrors({ email: "Une demande est déjà en cours pour cet e-mail." });
        return;
      }
      const activity = activities.find((item) => String(item.id) === form.activityId) || null;
      const planName = form.plan || "Basique";
      await subscriptionFlow.createRequest({
        name,
        email,
        phone,
        subject: "Inscription",
        description: "Demande d'inscription",
        activityId: activity ? activity.id : undefined,
        activityName: activity ? activity.name : undefined,
        planId: planName.toLowerCase(),
        planName,
      });
      toast.addToast("Votre Inscription a été envoyée. Nous vous contacterons bientôt.", "success");
      router.push("/verification");
    } catch {
      toast.addToast("Impossible d'envoyer votre demande. Veuillez réessayer.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* ── COLONNE GAUCHE : CARROUSEL D'ACTIVITÉS ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500">
        {/* Images en carrousel */}
        {gallerySlides.map((slideItem, i) => (
          <div
            key={`${slideItem.src}-${i}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide % gallerySlides.length ? "opacity-100" : "opacity-0"}`}
          >
            <img src={slideItem.src} alt={slideItem.alt} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-900/40 to-primary-900/20" />
          </div>
        ))}

        {/* Contenu superposé */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo + lien accueil */}
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <img src="/aigles-logo.png" alt="Blason du Football Club Les Aigles du Congo" className="h-11 w-auto shrink-0 object-contain" />
              <span className="flex flex-col leading-none">
                <span className="text-lg font-bold uppercase tracking-[0.14em]">Les Aigles</span>
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#C8A44A]">du Congo</span>
              </span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Texte central */}
          <div className="text-white">
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Rejoignez notre communauté
              <br />
              <span className="text-primary-200">sportive dès aujourd'hui.</span>
            </h2>
            <p className="text-lg text-primary-100 max-w-md">
              {activities.length} activités encadrées par des professionnels certifiés, des installations modernes et un accompagnement personnalisé.
            </p>
          </div>

          {/* Contrôles du carrousel */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {gallerySlides.map((slideItem, i) => (
                <button
                  key={`${slideItem.src}-dot-${i}`}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === slide % gallerySlides.length ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
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

      {/* ── COLONNE DROITE : FORMULAIRE ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">Remplissez ce formulaire pour inscription basique.
              <img src="/aigles-logo.png" alt="Blason du Football Club Les Aigles du Congo" className="h-10 w-auto shrink-0 object-contain" />
              <span className="flex flex-col leading-none text-left">
                <span className="text-lg font-bold uppercase tracking-[0.14em] text-[#1A2A99] dark:text-white">Les Aigles</span>
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#C8A44A]">du Congo</span>
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Inscription</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400"></p>
          </div>

          {/* Titre desktop */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Inscription</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Remplissez ce formulaire pour inscription basique.</p>
          </div>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nom complet</label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="nom post-nom" error={!!errors.name} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jean@exemple.com" error={!!errors.email} />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Téléphone</label>
                  <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+243 XXX XXX XXX" error={!!errors.phone} />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="activity" className="text-sm font-medium text-slate-700 dark:text-slate-300">Activité souhaitée</label>
                  <select
                    id="activity"
                    value={form.activityId}
                    onChange={(e) => setForm({ ...form, activityId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-slate-700 dark:text-slate-50"
                  >
                    <option value="">Choisir une activité</option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={String(activity.id)}>{activity.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="plan" className="text-sm font-medium text-slate-700 dark:text-slate-300">Plan souhaité</label>
                  <select
                    id="plan"
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-slate-700 dark:text-slate-50"
                  >
                    <option value="">Basique (par défaut)</option>
                    <option value="Basique">Basique</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                <Button type="submit" size="lg" className="w-full mt-2" isLoading={loading}>Envoyer ma demande</Button>
              </form>

              {/* Lien vers la vérification */}
              <div className="mt-6 rounded-lg bg-primary-50 dark:bg-primary-900/20 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Vous avez déjà laissé une Inscription ?
                    </p>
                    <Link href="/verification" className="mt-1 inline-block text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400">
                      Vérifier le statut de ma demande →
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}