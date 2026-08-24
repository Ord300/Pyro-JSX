"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Dumbbell,
  MailCheck,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { mockSubscriptionPlans } from "@/src/data/subscriptionData";
import { useActivities } from "@/src/hooks/queries/activities";
import { subscriptionFlow, type ContactRequest } from "@/src/services/subscriptionFlowService";

const ACTIVITY_IMAGES = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
];

const HIGHLIGHTS = [
  { icon: Search, label: "Suivi en temps réel" },
  { icon: ShieldCheck, label: "Paiement sécurisé" },
  { icon: CheckCircle, label: "Accès immédiat" },
];

export default function Verification() {
  const { data: activities = [] } = useActivities();
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState<ContactRequest | null | undefined>();
  const [activityId, setActivityId] = useState<number | null>(null);
  const [planId, setPlanId] = useState("month");
  const [method, setMethod] = useState<"M-Pesa" | "Orange Money">("M-Pesa");
  const [phone, setPhone] = useState("");
  const [receipt, setReceipt] = useState<any>();
  const [slide, setSlide] = useState(0);
  const [step, setStep] = useState(1);
  const activity = activities.find((item) => item.id === activityId);
  const plan = mockSubscriptionPlans.find((item) => item.id === planId)!;
  const amount = activity ? activity[plan.period === "Semaine" ? "priceWeek" : plan.period === "Mois" ? "priceMonth" : "priceYear"] : 0;
  const endDate = useMemo(() => {
    const date = new Date();
    if (plan.period === "Semaine") date.setDate(date.getDate() + 7);
    else if (plan.period === "Mois") date.setMonth(date.getMonth() + 1);
    else date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().slice(0, 10);
  }, [plan]);
  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setRequest(await subscriptionFlow.requestByEmail(email));
    setStep(2);
  };
  const pay = async () => {
    if (request && activity && phone) {
      const result = await subscriptionFlow.completePayment({ request, activity, plan, method, phone });
      setReceipt(result.receipt);
    }
  };
  const goTo = (index: number) => {
    setSlide(((index % ACTIVITY_IMAGES.length) + ACTIVITY_IMAGES.length) % ACTIVITY_IMAGES.length);
  };
  useEffect(() => {
    const timerRef = setInterval(() => {
      setSlide((prev) => (prev + 1) % ACTIVITY_IMAGES.length);
    }, 4000);
    return () => clearInterval(timerRef);
  }, []);

  // ── ÉCRAN REÇU / SUCCÈS PLEIN ÉCRAN ──
  if (receipt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 px-4 py-12">
        <Card className="w-full max-w-xl border-slate-200 shadow-2xl dark:border-slate-800">
          <CardContent className="p-8 text-center sm:p-10">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-11 w-11 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Paiement confirmé !</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Vous êtes maintenant membre de MoveUp.</p>

            <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Matricule</p>
                <p className="mt-1 font-bold text-primary-600 dark:text-primary-400">{receipt.memberNumber}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Référence reçu</p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white">{receipt.reference}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
              <p className="mb-2 flex items-center justify-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4" /> Votre compte est créé
              </p>
              Identifiant : <strong>{request?.email}</strong>
              <br />
              Mot de passe temporaire : <strong>Sport@2026</strong>
              <br />
              <span className="text-xs opacity-80">Vous devrez le modifier à votre première connexion.</span>
            </div>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => window.print()}>
                <CalendarDays className="mr-2 h-4 w-4" />Télécharger la facture PDF
              </Button>
              <Link href="/login">
                <Button variant="outline" className="w-full sm:w-auto">Se connecter</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── COLONNE GAUCHE : CARROUSEL D'ACTIVITÉS ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500">
        {ACTIVITY_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100" : "opacity-0"}`}
          >
            <img src={img} alt={`Activité ${i + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-900/40 to-primary-900/20" />
          </div>
        ))}

        <div className="relative z-10 flex w-full flex-col p-10">
          {/* Barre supérieure */}
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-white">
              <Dumbbell className="h-9 w-9" />
              <span className="text-2xl font-extrabold tracking-tight">MoveUp</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Texte central — centré verticalement et horizontalement */}
          <div className="flex flex-1 flex-col items-center justify-center text-center text-white">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
              Suivi d'abonnement
            </span>
            <h2 className="max-w-lg text-4xl font-extrabold leading-tight">
              Vérifier ma demande
              <br />
              <span className="text-primary-200">sportive.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-primary-100">
              Entrez votre adresse e-mail pour retrouver votre demande d'abonnement et finaliser votre inscription.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 text-sm text-white/85">
                  <Icon className="h-4 w-4 text-primary-200" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Contrôles du carrousel */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {ACTIVITY_IMAGES.map((_, i) => (
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => goTo(slide + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── COLONNE DROITE : FORMULAIRE VÉRIFICATION ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* En-tête mobile */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MoveUp</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Vérifier ma demande</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Utilisez l'adresse e-mail du formulaire Contact.</p>
          </div>

          {/* Titre desktop au-dessus du formulaire */}
          <div className="mb-8 hidden text-center lg:block">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Suivi de votre demande</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Vérifiez le statut de votre demande et finalisez votre abonnement.</p>
          </div>

          {/* Indicateur d'étapes */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <StepDot active={step >= 1} done={step > 1} label="Email" />
            <div className={`h-0.5 w-10 rounded-full transition-colors duration-500 ${step > 1 ? "bg-primary-500" : "bg-slate-300 dark:bg-slate-700"}`} />
            <StepDot active={step >= 2} done={false} label="Statut" />
          </div>

          {/* ÉTAPE 1 : RECHERCHE PAR EMAIL */}
          {step === 1 && (
            <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
              <CardContent className="p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
                    <Search className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Retrouver ma demande</h2>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    Saisissez l'e-mail utilisé lors de votre demande d'abonnement.
                  </p>
                </div>
                <form onSubmit={verify} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Adresse email</label>
                    <Input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      error={false}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    <Search className="mr-2 h-4 w-4" />Vérifier le statut
                  </Button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Pas encore de demande ?{" "}
                  <Link href="/" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
                    Faire une demande
                  </Link>
                </p>
              </CardContent>
            </Card>
          )}

          {/* ÉTAPE 2 : EN ATTENTE */}
          {step === 2 && request && request.status === "En attente" && (
            <Card className="border-amber-200 shadow-sm dark:border-amber-900/50">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <Badge variant="warning">En cours de traitement</Badge>
                <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Demande en attente</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Votre demande est encore en cours de traitement par l'administration. Revenez vérifier plus tard.
                </p>
                <Button variant="outline" className="mt-6 w-full" onClick={() => { setStep(1); setEmail(""); }}>
                  Vérifier une autre adresse
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ÉTAPE 2 : REFUSÉE */}
          {step === 2 && request && request.status === "Refusée" && (
            <Card className="border-red-200 shadow-sm dark:border-red-900/50">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <Badge variant="danger">Refusée</Badge>
                <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Demande refusée</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Votre demande d'abonnement a été refusée. Veuillez contacter l'administration pour plus d'informations.
                </p>
                <Button variant="outline" className="mt-6 w-full" onClick={() => { setStep(1); setEmail(""); }}>
                  Réessayer avec une autre adresse
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ÉTAPE 2 : CONFIRMÉE → PAIEMENT */}
          {step === 2 && request && request.status === "Confirmée" && (
            <Card className="border-slate-200 shadow-sm dark:border-slate-800">
              <CardContent className="space-y-6 p-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <MailCheck className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge variant="success">Demande confirmée</Badge>
                  <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Finaliser mon abonnement</h2>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    {request.name} · {request.email} · {request.phone}
                  </p>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-700" />

                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Abonnement</p>
                <Field label="Activité sportive">
                  <select
                    value={activityId ?? ""}
                    onChange={(e) => setActivityId(Number(e.target.value))}
                    className="w-full rounded-lg border p-2 dark:bg-slate-800"
                  >
                    <option value="">Choisir une activité</option>
                    {activities.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Type d'abonnement">
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full rounded-lg border p-2 dark:bg-slate-800"
                  >
                    {mockSubscriptionPlans.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.period}
                      </option>
                    ))}
                  </select>
                </Field>

                {activity && (
                  <div className="rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100/60 p-4 text-sm dark:border-primary-900/50 dark:from-primary-900/20 dark:to-primary-900/10">
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-slate-500 dark:text-slate-400">Activité</span>
                      <strong>{activity.name}</strong>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-slate-500 dark:text-slate-400">Type</span>
                      <strong>{plan.period}</strong>
                    </div>
                    <div className="my-2 h-px bg-primary-200 dark:bg-primary-900/50" />
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-slate-500 dark:text-slate-400">Total</span>
                      <strong className="text-lg text-primary-600 dark:text-primary-400">{amount} USD</strong>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Début : aujourd'hui · Expiration : <strong>{endDate}</strong>
                    </div>
                  </div>
                )}

                <div className="h-px bg-slate-200 dark:bg-slate-700" />

                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Paiement Mobile Money</p>
                <Field label="Méthode de paiement">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod("M-Pesa")}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                        method === "M-Pesa"
                          ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />M-Pesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("Orange Money")}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                        method === "Orange Money"
                          ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />Orange Money
                    </button>
                  </div>
                </Field>
                <Field label="Numéro Mobile Money">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08XXXXXXXX" />
                </Field>
                <Button size="lg" className="w-full" disabled={!activity || !phone} onClick={pay}>
                  Confirmer le paiement · {amount} USD
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
          done
            ? "bg-green-500 text-white"
            : active
              ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
              : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
        }`}
      >
        {done ? <CheckCircle className="h-4 w-4" /> : ""}
      </span>
      <span className={`text-xs font-semibold ${active || done ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
        {label}
      </span>
    </div>
  );
}
