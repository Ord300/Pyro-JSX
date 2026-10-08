"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Dumbbell,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  MailCheck,
  Printer,
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
  "/hero-basket.jpg",
  "/hero-yoga.jpg",
  "/hero-basket-2.jpg",
  "/equipe-aigles.jpg",
];

const HIGHLIGHTS = [
  { icon: Search, label: "Suivi en temps réel" },
  { icon: ShieldCheck, label: "Paiement sécurisé" },
  { icon: CheckCircle, label: "Accès immédiat" },
];

// Doit rester identique au mot de passe créé dans subscriptionFlowService.completePayment
const TEMP_PASSWORD = "Sport@2026";

export default function Verification() {
  const { data: activities = [] } = useActivities();
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState<ContactRequest | null | undefined>();
  const [activityId, setActivityId] = useState<number | null>(null);
  const [planId, setPlanId] = useState("month");
  const [method, setMethod] = useState<"M-Pesa" | "Orange Money">("M-Pesa");
  const [phone, setPhone] = useState("");
  const [receipt, setReceipt] = useState<any>();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [copied, setCopied] = useState<"email" | "password" | "member" | null>(null);
  const [showTempPwd, setShowTempPwd] = useState(false);
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
    const found = await subscriptionFlow.requestByEmail(email);
    setRequest(found);
    if (found?.activityId) setActivityId(Number(found.activityId));
    if (found?.planId) setPlanId(String(found.planId));
    setStep(2);
  };
  const isPhoneValid = /^(\+243|0)\d{9}$/.test(phone.replace(/\s/g, ""));
  const pay = async () => {
    if (!request || !activity || !phone || paying) return;
    if (!isPhoneValid) {
      setPayError("Numéro Mobile Money invalide. Format attendu : +243 XXX XXX XXX.");
      return;
    }
    setPaying(true);
    setPayError("");
    try {
      const result = await subscriptionFlow.completePayment({ request, activity, plan, method, phone });
      if (result.receipt) {
        setReceipt(result.receipt);
      } else {
        // Abonnement déjà validé mais reçu introuvable : pas de crash, message + lien historique.
        setPayError("Votre abonnement est déjà validé. Retrouvez votre reçu dans votre historique.");
      }
    } catch (e: any) {
      setPayError(e?.message || "Le paiement a échoué. Vérifiez votre connexion puis réessayez — aucun double débit ne sera appliqué.");
    } finally {
      setPaying(false);
    }
  };
  const goTo = (index: number) => {
    setSlide(((index % ACTIVITY_IMAGES.length) + ACTIVITY_IMAGES.length) % ACTIVITY_IMAGES.length);
  };

  const copyText = async (kind: "email" | "password" | "member", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };
  useEffect(() => {
    const timerRef = setInterval(() => {
      setSlide((prev) => (prev + 1) % ACTIVITY_IMAGES.length);
    }, 4000);
    return () => clearInterval(timerRef);
  }, []);

  // ── ÉCRAN REÇU / SUCCÈS PLEIN ÉCRAN ──
  if (receipt) {
    const credEmail = request?.email || receipt.email || "";
    const credRows = [
      { kind: "member" as const, label: "Matricule", value: receipt.memberNumber || "—" },
      { kind: "email" as const, label: "Identifiant", value: credEmail },
    ];
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-emerald-800 px-4 py-12">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
        <Card className="relative w-full max-w-2xl overflow-hidden border-slate-200 shadow-2xl dark:border-slate-800">
          {/* Bandeau succès */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-8 text-center text-white">
            <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/30" />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                <CheckCircle className="h-11 w-11 text-emerald-600" />
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Paiement réussi</p>
            <h1 className="mt-1 text-3xl font-extrabold">Bienvenue dans le club !</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-emerald-50">
              Votre abonnement est actif. Voici votre reçu et vos accès — gardez-les précieusement.
            </p>
            <div className="mx-auto mt-5 flex max-w-md flex-wrap items-center justify-center gap-2 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1"><Check className="h-3 w-3" />Payé</span>
              <span className="text-white/50">→</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1"><Check className="h-3 w-3" />Compte créé</span>
              <span className="text-white/50">→</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-emerald-700">3. Se connecter</span>
            </div>
          </div>

          <CardContent className="space-y-6 p-8">
            {/* Récapitulatif de l'abonnement */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Récapitulatif</p>
              <div className="grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
                {[
                  ["Activité", activity?.name || receipt.description?.split(" - ")[0] || "—"],
                  ["Formule", plan.name],
                  ["Montant", `${receipt.amount} ${receipt.currency || "USD"}`],
                  ["Paiement", receipt.paymentMethod || method],
                  ["Référence", receipt.reference],
                  ["Valide jusqu'au", endDate],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white" title={String(value)}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge d'accès — identifiants temporaires */}
            <div className="overflow-hidden rounded-2xl bg-slate-900 text-white shadow-lg dark:bg-slate-950 dark:ring-1 dark:ring-slate-700">
              <div className="flex items-center justify-between bg-white/5 px-5 py-3">
                <p className="flex items-center gap-2 text-sm font-bold">
                  <KeyRound className="h-4 w-4 text-amber-300" /> Vos identifiants de connexion
                </p>
                <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-300">Temporaire</span>
              </div>
              <div className="space-y-1 px-5 py-4">
                {credRows.map((row) => (
                  <div key={row.kind} className="flex items-center justify-between gap-3 border-b border-white/10 py-2.5 last:border-0">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">{row.label}</p>
                      <p className="truncate font-mono text-sm font-semibold">{row.value}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(row.kind, String(row.value))}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20"
                    >
                      {copied === row.kind ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === row.kind ? "Copié !" : "Copier"}
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Mot de passe temporaire</p>
                    <p className="font-mono text-sm font-semibold tracking-wider">{showTempPwd ? TEMP_PASSWORD : "••••••••••"}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTempPwd((v) => !v)}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20"
                    >
                      {showTempPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {showTempPwd ? "Masquer" : "Voir"}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText("password", TEMP_PASSWORD)}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20"
                    >
                      {copied === "password" ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === "password" ? "Copié !" : "Copier"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-400/10 px-5 py-3 text-xs leading-relaxed text-amber-200">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Modifiez ce mot de passe dès votre première connexion. Ces accès vous ont aussi été envoyés par e-mail.</span>
              </div>
            </div>

            <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <MailCheck className="h-4 w-4 text-emerald-500" /> Reçu et identifiants envoyés à {credEmail || "votre adresse e-mail"}
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/login" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto">
                  <LogIn className="mr-2 h-4 w-4" />Se connecter
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="flex-1 sm:flex-none" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />Facture PDF
              </Button>
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
                  <Input value={phone} onChange={(e) => { setPhone(e.target.value); setPayError(""); }} placeholder="08XXXXXXXX" />
                </Field>
                {payError && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-200">{payError}</p>
                )}
                <Button size="lg" className="w-full" disabled={!activity || !phone || paying} onClick={pay}>
                  {paying ? "Traitement en cours…" : `Confirmer le paiement · ${amount} USD`}
                </Button>
                {(!activity || !phone) && !paying && (
                  <p className="text-center text-xs text-slate-400">Choisissez une activité et saisissez votre numéro Mobile Money pour activer le paiement.</p>
                )}
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
