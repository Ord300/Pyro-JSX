"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle, Clock, Search, XCircle } from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { mockSubscriptionPlans } from "@/src/data/subscriptionData";
import { useActivities } from "@/src/hooks/queries/activities";
import { subscriptionFlow, type ContactRequest } from "@/src/services/subscriptionFlowService";

export default function Verification() {
  const { data: activities = [] } = useActivities();
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState<ContactRequest | null | undefined>();
  const [activityId, setActivityId] = useState<number | null>(null);
  const [planId, setPlanId] = useState("month");
  const [method, setMethod] = useState<"M-Pesa" | "Orange Money">("M-Pesa");
  const [phone, setPhone] = useState("");
  const [receipt, setReceipt] = useState<any>();
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
  };
  const pay = () => {
    if (request && activity && phone) setReceipt(subscriptionFlow.completePayment({ request, activity, plan, method, phone }).receipt);
  };
  if (receipt)
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-950">
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
    );
  const outcome =
    request === null ? (
      <Result icon={XCircle} text="Aucune demande trouvée avec cette adresse e-mail." />
    ) : request?.status === "En attente" ? (
      <Result icon={Clock} text="Votre demande est encore en cours de traitement." />
    ) : request?.status === "Refusée" ? (
      <Result icon={XCircle} text="Votre demande d'abonnement a été refusée. Veuillez contacter l'administration." />
    ) : null;
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <Search className="mx-auto h-10 w-10 text-primary-600" />
          <h1 className="mt-3 text-3xl font-extrabold">Vérifier ma demande</h1>
          <p className="mt-2 text-slate-500">Utilisez l'adresse e-mail du formulaire Contact.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={verify} className="flex gap-3">
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" />
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />Vérifier
              </Button>
            </form>
          </CardContent>
        </Card>
        {outcome}
        {request?.status === "Refusée" && (
          <Link href="/contact">
            <Button variant="outline" className="mt-4">Nous contacter</Button>
          </Link>
        )}
        {request?.status === "Confirmée" && (
          <Card className="mt-6">
            <CardContent className="space-y-5 p-6">
              <div>
                <Badge variant="success">Demande confirmée</Badge>
                <h2 className="mt-2 text-xl font-bold">Finaliser mon abonnement</h2>
                <p className="text-sm text-slate-500">
                  {request.name} · {request.email} · {request.phone}
                </p>
              </div>
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
                <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="w-full rounded-lg border p-2 dark:bg-slate-800">
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