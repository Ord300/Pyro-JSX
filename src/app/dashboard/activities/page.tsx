"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Modal } from "@/src/components/ui/Modal";
import { useActivities } from "@/src/hooks/queries/activities";
import { useTrainers } from "@/src/hooks/queries/trainers";
import {
  subscriptionRequestsDB,
  subscriptionsDB,
  usersDB,
} from "@/src/services/dbService";
import { subscriptionFlow } from "@/src/services/subscriptionFlowService";
import { formatAgeRange } from "@/src/data/mockData";
import {
  Activity as ActivityIcon,
  Cake,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Dumbbell,
  Hourglass,
  Send,
  Timer,
  User as UserIcon,
  Users,
  XCircle,
} from "lucide-react";

const statusVariant = (status: string) =>
  status === "Confirmée" ? "success" : status === "Refusée" ? "danger" : "warning";

const PLAN_OPTIONS = [
  { id: "week", name: "Formule Semaine", period: "Semaine", note: "7 jours d'accès" },
  { id: "month", name: "Formule Mensuelle", period: "Mois", note: "30 jours d'accès", popular: true },
  { id: "year", name: "Formule Annuelle", period: "Année", note: "365 jours d'accès" },
] as const;

const priceFor = (activity: any, planId: string) =>
  planId === "week" ? activity.priceWeek : planId === "month" ? activity.priceMonth : activity.priceYear;

export default function UserActivities() {
  const { data: activities = [] } = useActivities();
  const { data: trainers = [] } = useTrainers();
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [mySubscriptions, setMySubscriptions] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [planId, setPlanId] = useState("month");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const load = useCallback(async () => {
    const email = (
      localStorage.getItem("current_user_email") ||
      localStorage.getItem("current_subscriber_email") ||
      ""
    ).toLowerCase();
    setCurrentEmail(email || null);
    if (!email) return;
    const [users, subs, requests] = await Promise.all([
      usersDB.getAll<any>(),
      subscriptionsDB.getAll<any>(),
      subscriptionRequestsDB.getAll<any>(),
    ]);
    setCurrentUser(users.find((user) => user.email?.toLowerCase() === email) || null);
    setMySubscriptions(
      subs.filter((sub) => sub.status === "Validée" && sub.email?.toLowerCase() === email)
    );
    setMyRequests(requests.filter((request) => request.email?.toLowerCase() === email).sort((a, b) => b.id - a.id));
  }, []);

  useEffect(() => {
    load();
    const unsubs = [
      subscriptionsDB.subscribe(load),
      subscriptionRequestsDB.subscribe(load),
      usersDB.subscribe(load),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [load]);

  const getCoaches = (activity: any): string[] => {
    const fromTrainers = (trainers ?? [])
      .filter((t: any) => (t.activities ?? []).includes(activity.name))
      .map((t: any) => t.name);
    const names = [...fromTrainers];
    if (activity.trainer?.trim() && !names.includes(activity.trainer.trim())) names.push(activity.trainer.trim());
    return names;
  };

  const today = new Date().toISOString().slice(0, 10);
  const activeActivityIds = new Set(
    mySubscriptions.filter((sub) => sub.endDate >= today).map((sub) => sub.activityId)
  );
  const pendingActivityIds = new Set(
    myRequests.filter((request) => request.status === "En attente").map((request) => request.activityId)
  );

  const selectedPlan = selectedActivity
    ? PLAN_OPTIONS.find((plan) => plan.id === planId) || null
    : null;

  const openRequestModal = (activity: any) => {
    setSelectedActivity(activity);
    setPlanId("month");
    setSuccessMessage("");
  };

  const submitRequest = async () => {
    if (!selectedActivity || !currentEmail || !selectedPlan) return;
    setSubmitting(true);
    try {
      await subscriptionFlow.createRequest({
        name: currentUser?.name || currentUser?.userName || currentEmail.split("@")[0],
        email: currentEmail,
        phone: currentUser?.phone || "",
        subject: "Demande d'abonnement",
        description: `Demande d'abonnement ${selectedPlan.name} — ${selectedActivity.name} (depuis l'espace abonné)`,
        activityId: selectedActivity.id,
        activityName: selectedActivity.name,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
      });
      setSelectedActivity(null);
      setSuccessMessage(`Votre demande pour « ${selectedActivity.name} » (${selectedPlan.name}) a été envoyée. Elle est en cours de traitement par l'administration.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">Activités</h1>
        <p className="mt-1 text-sm text-emerald-900/60 dark:text-emerald-200/60">
          Découvrez les activités du centre et demandez un abonnement supplémentaire.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Grille des activités */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {activities.map((activity) => {
          const isActive = activeActivityIds.has(activity.id);
          const isPending = pendingActivityIds.has(activity.id);
          return (
            <Card key={activity.id} className="flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 p-5 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-3xl">{activity.icon}</span>
                  <div>
                    <p className="font-semibold">{activity.name}</p>
                    <p className="text-xs text-white/70">{activity.category}</p>
                  </div>
                </div>
                {isActive ? (
                  <Badge variant="success" className="bg-green-500/20 text-green-200">Abonné</Badge>
                ) : isPending ? (
                  <Badge variant="warning" className="bg-yellow-500/20 text-yellow-100">En attente</Badge>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{activity.description}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1"><UserIcon className="h-3.5 w-3.5" />{getCoaches(activity).length > 0 ? getCoaches(activity).join(", ") : "Aucun coach assigné"}</span>
                  <span className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5" />{activity.duration}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{activity.capacity} places</span>
                  {formatAgeRange(activity) && (
                    <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400"><Cake className="h-3.5 w-3.5" />{formatAgeRange(activity)}</span>
                  )}
                </div>

                <div className="mt-auto grid grid-cols-3 gap-2 text-center">
                  {PLAN_OPTIONS.map((plan) => (
                    <div key={plan.id} className="rounded-lg px-2 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">{plan.period}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{priceFor(activity, plan.id)}$</p>
                    </div>
                  ))}
                </div>

                {isActive ? (
                  <Button variant="outline" disabled className="w-full">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Déjà abonné à cette activité
                  </Button>
                ) : (
                  <Button
                    variant={isPending ? "outline" : "primary"}
                    disabled={isPending || submitting}
                    onClick={() => openRequestModal(activity)}
                    className="w-full"
                  >
                    {isPending ? (
                      <>
                        <Hourglass className="mr-2 h-4 w-4" />
                        Demande en cours de traitement
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Demander un abonnement
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Mes demandes */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Mes demandes d&apos;abonnement</h2>
        {myRequests.length === 0 ? (
          <Card className="p-10 text-center">
            <Dumbbell className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Aucune demande pour le moment. Choisissez une activité ci-dessus pour envoyer une demande.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {myRequests.map((request) => (
              <Card key={request.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl dark:bg-emerald-900/20">
                    {activities.find((a) => a.id === request.activityId)?.icon || <ActivityIcon className="h-5 w-5 text-emerald-600" />}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {request.activityName || request.description || "Abonnement"}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500 dark:text-slate-400">
                      {request.planName && <span>{request.planName}</span>}
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{(request.createdAt || "").slice(0, 10)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant(request.status)}>{request.status}</Badge>
                  {request.status === "Confirmée" && (
                    <Link href="/verification">
                      <Button size="sm"><CreditCard className="mr-2 h-4 w-4" />Finaliser le paiement</Button>
                    </Link>
                  )}
                  {request.status === "En attente" && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" />Traitement en cours</span>
                  )}
                  {request.status === "Refusée" && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-400"><XCircle className="h-3.5 w-3.5" />Contactez l&apos;administration</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de demande */}
      <Modal isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)} title="Demander un abonnement">
        {selectedActivity && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
              <span className="text-3xl">{selectedActivity.icon}</span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedActivity.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedActivity.category} · Coach {getCoaches(selectedActivity).length > 0 ? getCoaches(selectedActivity).join(", ") : "Non assigné"}
                  {formatAgeRange(selectedActivity) ? ` · ${formatAgeRange(selectedActivity)}` : ""}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Choisissez votre formule</p>
              <div className="space-y-2">
                {PLAN_OPTIONS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setPlanId(plan.id)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all ${
                      planId === plan.id
                        ? "border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/20"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {plan.name}
                        {"popular" in plan && plan.popular && (
                          <Badge variant="success" className="ml-2">Populaire</Badge>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{plan.note}</p>
                    </div>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">{priceFor(selectedActivity, plan.id)} USD</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              Votre demande sera examinée par l'administration. Une fois confirmée, vous pourrez finaliser le paiement
              depuis la page de vérification ou depuis la section « Mes demandes » ci-dessous.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedActivity(null)}>Annuler</Button>
              <Button className="flex-1" disabled={submitting} onClick={submitRequest}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Envoi..." : "Envoyer la demande"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CreditCardIcon() {
  return <CalendarDays className="mr-2 h-4 w-4" />;
}
