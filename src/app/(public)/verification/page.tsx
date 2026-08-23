"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle, Clock, Search, XCircle } from "lucide-react";
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
  const verify = (event: React.FormEvent) => {
    event.preventDefault();
    setRequest(subscriptionFlow.requestByEmail(email));
    setStep(2);
  };
  const pay = () => {
    if (request && activity && phone) setReceipt(subscriptionFlow.completePayment({ request, activity, plan, method, phone }).receipt);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* ── COLONNE GAUCHE : CARROUSEL D'ACTIVITÉS ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500">
        {ACTIVITY_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100" : "opacity-0"}`}
          >
            <img src={img} alt={`Activité ${i + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-900/40 to-primary-900/20" />
          </div>
        ))}

        <div className="relative z-10 flex flex-col justify-between p-6 w-full">
          <div className="text-white">
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Vérifier ma demande
              <br />
              <span className="text-primary-200">sportive.</span>
            </h2>
            <p className="text-lg text-primary-100 max-w-md">
              Entrez votre adresse e-mail pour retrouver votre demande d'abonnement.
            </p>
          </div>

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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                aria-label="Image précédente"
              >
                <i className="lucide-chevron-left h-5 w-5" />
              </button>
              <button
                onClick={() => goTo(slide + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                aria-label="Image suivante"
              >
                <i className="lucide-chevron-right h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── COLONNE DROITE : FORMULAIRE VERIFICATION ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <i className="lucide-dumbbell h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SPORT CENTER</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Vérifier ma demande</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Utilisez l'adresse e-mail du formulaire Contact.</p>
          </div>

          {step === 1 && (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-8">
                <form onSubmit={verify} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
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
                  <Button type="submit" className="w-full">
                    <Search className="mr-2 h-4 w-4" />Vérifier
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && request && request.status === "En attente" && (
            <Card className="mt-6">
              <CardContent className="p-6 text-center">
                <Clock className="mx-auto h-14 w-14 text-amber-600" />{" "}
                <p className="mt-3">Votre demande est encore en cours de traitement.</p>
              </CardContent>
            </Card>
          )}

          {step === 2 && request && request.status === "Refusée" && (
            <Card className="mt-6">
              <CardContent className="p-6 text-center">
                <XCircle className="mx-auto h-9 w-9 text-red-600" />{" "}
                <p className="mt-3">Votre demande d'abonnement a été refusée. Veuillez contacter l'administration.</p>
              </CardContent>
            </Card>
          )}

          {step === 2 && request && request.status === "Confirmée" && (
            <Card className="mt-6">
              <CardContent className="space-y-5 p-6">
                <Badge variant="success">Demande confirmée</Badge>
                <h2 className="mt-2 text-xl font-bold">Finaliser mon abonnement</h2>
                <p className="text-sm text-slate-500">
                  {request.name} · {request.email} · {request.phone}
                </p>
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
                  <div className="rounded-lg bg-primary-50 p-4 text-sm dark:bg-primary-900/20">
                    Activité : <strong>{activity.name}</strong>
                    <br />
                    Type : <strong>{plan.period}</strong>
                    <br />
                    Prix : <strong>{amount} USD</strong>
                    <br />
                    Début : aujourd'hui · Expiration : <strong>{endDate}</strong>
                  </div>
                )}
                <Field label="Méthode Mobile Money">
                  <div className="flex gap-3">
                    <Button type="button" variant={method === "M-Pesa" ? "primary" : "outline"} onClick={() => setMethod("M-Pesa")}>
                      M-Pesa
                    </Button>
                    <Button type="button" variant={method === "Orange Money" ? "primary" : "outline"} onClick={() => setMethod("Orange Money")}>
                      Orange Money
                    </Button>
                  </div>
                </Field>
                <Field label="Numéro Mobile Money">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08XXXXXXXX" />
                </Field>
                <Button className="w-full" disabled={!activity || !phone} onClick={pay}>
                  Confirmer le paiement · {amount} USD
                </Button>
              </CardContent>
            </Card>
          )}

          {receipt && (
            <div className="min-h-screen bg-slate-950 px-4 py-16 dark:bg-slate-950">
              <Card className="mx-auto max-w-xl">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="mx-auto h-14 w-14 text-green-600" />
                  <h1 className="mt-4 text-2xl font-bold">Paiement confirmé — vous êtes maintenant abonné</h1>
                  <p className="mt-2 text-slate-500">
                    Matricule : <strong>{receipt.memberNumber}</strong>
                    <br />
                    Reçu : {receipt.reference}
                  </p>
                  <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
                    Votre compte est créé.
                    <br />
                    Identifiant : <strong>{request?.email}</strong>
                    <br />
                    Mot de passe temporaire : <strong>Sport@2026</strong>
                    <br />
                    Vous devrez le modifier à votre première connexion.
                  </div>
                  <div className="mt-6 flex justify-center gap-3">
                    <Button onClick={() => window.print()}>Télécharger la facture PDF</Button>
                    <Link href="/login">
                      <Button variant="outline">Se connecter</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
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
function Result({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <Card className="mt-6">
      <CardContent className="p-6 text-center">
        <Icon className="mx-auto h-9 w-9 text-amber-600" />
        <p className="mt-3">{text}</p>
      </CardContent>
    </Card>
  );
}