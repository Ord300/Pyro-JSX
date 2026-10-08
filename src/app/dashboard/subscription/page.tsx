"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { SubscriptionWizard } from "@/src/components/subscription/SubscriptionWizard";
import { useActivities } from "@/src/hooks/queries/activities";
import { subscriptionsDB } from "@/src/services/dbService";
import { downloadMemberCard, ensureCardToken, generateQrDataUrl, getCardLoginUrl } from "@/src/services/cardService";
import { addPeriod, resolvePlanPeriod, subscriptionFlow } from "@/src/services/subscriptionFlowService";
import { CreditCard, QrCode, Download, RefreshCw, CheckCircle2, X, CalendarDays, ShieldCheck } from "lucide-react";

export default function UserSubscription() {
  const { data: activities = [] } = useActivities();
  const [showWizard, setShowWizard] = useState(false);
  const [lastReference, setLastReference] = useState("");
  const [activeSubscription, setActiveSubscription] = useState<any | null>(null);
  const [cardToken, setCardToken] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showRenewal, setShowRenewal] = useState(false);
  const [renewMethod, setRenewMethod] = useState<"M-Pesa" | "Orange Money">("M-Pesa");
  const [renewPhone, setRenewPhone] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState<{ endDate: string; reference: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const currentEmail = localStorage.getItem("current_user_email") || "";
      if (!currentEmail) return;
      const subscriptions = await subscriptionsDB.getAll<any>();
      const found =
        subscriptions.find((subscription) => subscription.status === "Validée" && subscription.email?.toLowerCase() === currentEmail) || null;
      setActiveSubscription(found);
      if (found) {
        try {
          const token = await ensureCardToken(found);
          if (token !== found.cardToken) setActiveSubscription({ ...found, cardToken: token });
          setCardToken(token);
          setQrDataUrl(await generateQrDataUrl(getCardLoginUrl(token)));
        } catch {
          // QR indisponible : la carte reste affichée sans QR
        }
      } else {
        setCardToken("");
        setQrDataUrl("");
      }
    };
    load();
    return subscriptionsDB.subscribe(() => load());
  }, []);

  const handleWizardComplete = (reference: string) => {
    setLastReference(reference);
    setShowWizard(false);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  const handleDownloadCard = async () => {
    if (!activeSubscription || !qrDataUrl || downloading) return;
    setDownloading(true);
    try {
      await downloadMemberCard(activeSubscription, qrDataUrl);
    } finally {
      setDownloading(false);
    }
  };

  const renewalActivity = activities.find((a) => a.id === activeSubscription?.activityId);
  const renewalPeriod = resolvePlanPeriod(activeSubscription?.planId, activeSubscription?.planName);
  const renewalAmount = renewalActivity
    ? renewalActivity[`price${renewalPeriod}` as "priceWeek" | "priceMonth" | "priceYear"]
    : Number(activeSubscription?.amount ?? 0);
  const newEndDate = (() => {
    if (!activeSubscription) return "";
    const currentEnd = new Date(activeSubscription.endDate);
    return addPeriod(currentEnd.getTime() > Date.now() ? currentEnd : new Date(), renewalPeriod)
      .toISOString()
      .slice(0, 10);
  })();

  const handleRenew = async () => {
    if (!activeSubscription || !renewPhone.trim()) return;
    setRenewing(true);
    try {
      const result = await subscriptionFlow.renewSubscription({
        subscription: activeSubscription,
        method: renewMethod,
        phone: renewPhone.trim(),
      });
      setRenewSuccess({ endDate: result.subscription.endDate, reference: result.receipt.reference });
      setShowRenewal(false);
      setRenewPhone("");
    } finally {
      setRenewing(false);
    }
  };

  if (showWizard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Nouvel abonnement</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Suivez les étapes pour souscrire à votre abonnement.
            </p>
          </div>
          <Button variant="outline" onClick={handleWizardCancel}>
            <X className="mr-2 h-4 w-4" />
            Fermer
          </Button>
        </div>
        <SubscriptionWizard onComplete={handleWizardComplete} onCancel={handleWizardCancel} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">Mon abonnement</h1>
          <p className="mt-1 text-sm text-emerald-900/60 dark:text-emerald-200/60">
            Gérez votre abonnement et votre carte virtuelle.
          </p>
        </div>
        <Link href="/verification"><Button><RefreshCw className="mr-2 h-4 w-4" />Vérifier ma demande</Button></Link>
      </div>

      {renewSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-200">
            Abonnement renouvelé avec succès ! Nouvelle date d&apos;expiration : <strong>{renewSuccess.endDate}</strong> · Reçu : <strong>{renewSuccess.reference}</strong>
          </p>
          <button onClick={() => setRenewSuccess(null)} className="ml-auto text-green-600 hover:text-green-800 dark:text-green-400"><X className="h-4 w-4" /></button>
        </div>
      )}

      {lastReference && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-200">
            Abonnement confirmé ! Référence : <strong>{lastReference}</strong>
          </p>
        </div>
      )}

      {activeSubscription ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Virtual Card */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 p-8 text-white shadow-lg">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/5" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-8 w-8" />
                    <span className="text-lg font-bold tracking-wider">CARTE ABONNÉ</span>
                  </div>
                  <Badge variant="success" className="bg-green-500/20 text-green-200">ACTIVE</Badge>
                </div>

                <div className="mt-8">
                  <p className="text-sm text-white/70">Titulaire</p>
                  <p className="text-xl font-semibold">{activeSubscription.userName}</p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-white/70">Formule</p>
                    <p className="font-semibold">{activeSubscription.planName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Activité</p>
                    <p className="font-semibold">{activeSubscription.activityName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Début</p>
                    <p className="font-semibold">{activeSubscription.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Fin</p>
                    <p className="font-semibold">{activeSubscription.endDate}</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR code de connexion de la carte abonné" className="h-16 w-16 rounded-lg bg-white p-1" />
                    ) : (
                      <QrCode className="h-12 w-12 text-white" />
                    )}
                    <div className="text-xs text-white/70">
                      <p>Scannez ce code</p>
                      <p>pour vous connecter</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/70">N° Abonné</p>
                    <p className="font-mono text-lg font-bold">SUB-{String(activeSubscription.id).padStart(4, "0")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => setShowRenewal(true)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Renouveler l&apos;abonnement
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadCard} disabled={!qrDataUrl || downloading}>
                <Download className="mr-2 h-4 w-4" />
                {downloading ? "Téléchargement…" : "Télécharger la carte"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowQr(true)} disabled={!qrDataUrl}>
                <QrCode className="mr-2 h-4 w-4" />
                Afficher le QR code
              </Button>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Détails de l'abonnement</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Statut</span>
                  <Badge variant="success">Validée</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Montant</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeSubscription.amount} {activeSubscription.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Méthode</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeSubscription.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Créé le</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeSubscription.createdAt?.slice(0, 10) || activeSubscription.createdAt}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Temps restant</span>
                  {(() => {
                    const daysLeft = Math.ceil((new Date(activeSubscription.endDate).getTime() - Date.now()) / 86_400_000);
                    return daysLeft > 0 ? (
                      <Badge variant={daysLeft <= 7 ? "warning" : "success"}>
                        {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""}
                      </Badge>
                    ) : (
                      <Badge variant="danger">Expiré</Badge>
                    );
                  })()}
                </div>
              </div>
              <Button className="mt-5 w-full" onClick={() => setShowRenewal(true)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Renouveler dès maintenant
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Activité incluse</h3>
              {(() => {
                const activity = activities.find((a) => a.id === activeSubscription.activityId);
                return activity ? (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-3xl">{activity.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{activity.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{activity.category}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <CreditCard className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Aucun abonnement actif</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Souscrivez à un abonnement pour accéder à toutes les installations du centre.
          </p>
          <Link href="/verification"><Button className="mt-6">Vérifier ma demande</Button></Link>
        </Card>
      )}

      {/* Modal QR code — connexion directe */}
      <Modal isOpen={showQr} onClose={() => setShowQr(false)} title="Mon QR code de connexion">
        {activeSubscription && (
          <div className="space-y-4 text-center">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR code de connexion unique" className="mx-auto h-56 w-56 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700" />
            )}
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Scannez ce code avec votre téléphone pour vous connecter directement à votre compte,
              sans saisir de mot de passe.
            </p>
            <p className="rounded-lg bg-slate-50 p-3 font-mono text-xs break-all text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {cardToken ? getCardLoginUrl(cardToken) : ""}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Code unique lié à votre abonnement {activeSubscription.memberNumber || `SUB-${String(activeSubscription.id).padStart(4, "0")}`}.
              Ne le partagez pas.
            </p>
            <Button className="w-full" onClick={handleDownloadCard} disabled={!qrDataUrl || downloading}>
              <Download className="mr-2 h-4 w-4" />
              {downloading ? "Téléchargement…" : "Télécharger la carte"}
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal de renouvellement */}
      <Modal isOpen={showRenewal} onClose={() => setShowRenewal(false)} title="Renouveler mon abonnement">
        {activeSubscription && (
          <div className="space-y-5">
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:border-emerald-900/50 dark:from-emerald-900/20 dark:to-teal-900/10">
              <div className="flex items-center justify-between py-0.5 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Activité</span>
                <strong className="text-slate-900 dark:text-white">{activeSubscription.activityName}</strong>
              </div>
              <div className="flex items-center justify-between py-0.5 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Formule</span>
                <strong className="text-slate-900 dark:text-white">{activeSubscription.planName}</strong>
              </div>
              <div className="flex items-center justify-between py-0.5 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Expire le</span>
                <strong className="text-slate-900 dark:text-white">{activeSubscription.endDate}</strong>
              </div>
              <div className="my-2 h-px bg-emerald-200 dark:bg-emerald-900/50" />
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" />
                Nouvelle expiration après renouvellement : <strong>{newEndDate}</strong>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Méthode de paiement</p>
              <div className="grid grid-cols-2 gap-3">
                {(["M-Pesa", "Orange Money"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRenewMethod(option)}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                      renewMethod === option
                        ? option === "M-Pesa"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Numéro Mobile Money</label>
              <Input value={renewPhone} onChange={(e) => setRenewPhone(e.target.value)} placeholder="08XXXXXXXX" />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Paiement sécurisé
              </span>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{renewalAmount} USD</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRenewal(false)}>Annuler</Button>
              <Button className="flex-1" disabled={renewing || !renewPhone.trim()} onClick={handleRenew}>
                <RefreshCw className={`mr-2 h-4 w-4 ${renewing ? "animate-spin" : ""}`} />
                {renewing ? "Traitement..." : `Payer ${renewalAmount} USD`}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}