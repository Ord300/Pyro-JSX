"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { cn } from "@/src/utils/cn";
import { useActivities } from "@/src/hooks/queries/activities";
import { mockSubscriptionPlans } from "@/src/data/subscriptionData";
import { mockPaymentProviders } from "@/src/data/paymentData";
import { processPayment } from "@/src/services/paymentService";
import type { PaymentMethod } from "@/src/types/payment";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, ShieldCheck } from "lucide-react";

interface SubscriptionWizardProps {
  onComplete: (reference: string) => void;
  onCancel: () => void;
}

const steps = [
  { id: 1, label: "Demande" },
  { id: 2, label: "Validation" },
  { id: 3, label: "Activité" },
  { id: 4, label: "Formule" },
  { id: 5, label: "Paiement" },
  { id: 6, label: "Confirmation" },
];

export function SubscriptionWizard({ onComplete, onCancel }: SubscriptionWizardProps) {
  const { data: activities = [] } = useActivities();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [error, setError] = useState("");

  const selectedActivityData = activities.find((a) => a.id === selectedActivity);
  const selectedPlanData = mockSubscriptionPlans.find((p) => p.id === selectedPlan);
  const selectedProviderData = mockPaymentProviders.find((p) => p.id === selectedProvider);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return agreedToTerms;
      case 3:
        return selectedActivity !== null;
      case 4:
        return selectedPlan !== null;
      case 5:
        return selectedProvider !== null && (selectedProvider === "cash" || phoneNumber.length >= 10);
      default:
        return false;
    }
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 5) {
      handlePayment();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePayment = async () => {
    if (!selectedPlanData || !selectedProviderData) return;
    setIsProcessing(true);
    setError("");

    const methodMap: Record<string, PaymentMethod> = {
      mpesa: "M-Pesa",
      "orange-money": "Orange Money",
      card: "Carte Bancaire",
      cash: "Espèces",
    };

    const result = await processPayment({
      amount: selectedPlanData.price,
      currency: selectedPlanData.currency,
      method: methodMap[selectedProviderData.id],
      phoneNumber: selectedProvider === "cash" ? undefined : phoneNumber,
      description: `Abonnement ${selectedPlanData.name} - ${selectedActivityData?.name}`,
    });

    setIsProcessing(false);

    if (result.success) {
      setPaymentReference(result.reference);
      setCurrentStep(6);
    } else {
      setError(result.message);
    }
  };

  const handleComplete = () => {
    onComplete(paymentReference);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  currentStep > step.id
                    ? "border-primary-600 bg-primary-600 text-white"
                    : currentStep === step.id
                      ? "border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                      : "border-slate-200 text-slate-400 dark:border-slate-700"
                )}
              >
                {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
              </div>
              <span className={cn(
                "mt-2 hidden text-xs font-medium sm:block",
                currentStep >= step.id ? "text-primary-600 dark:text-primary-400" : "text-slate-400"
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-2 rounded",
                currentStep > step.id ? "bg-primary-600" : "bg-slate-200 dark:bg-slate-700"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bienvenue dans le processus d'abonnement</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Ce processus vous guidera à travers les étapes suivantes :
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary-600" />
            Sélection de votre activité sportive
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary-600" />
            Choix de votre formule d'abonnement
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary-600" />
            Paiement sécurisé via M-Pesa, Orange Money ou carte bancaire
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary-600" />
            Confirmation immédiate de votre abonnement
          </li>
        </ul>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Note :</strong> Ceci est une simulation de paiement. Aucune transaction réelle ne sera effectuée.
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 p-6 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Conditions d'abonnement</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <p>1. L'abonnement est personnel et non transférable.</p>
          <p>2. Le paiement est exigé à l'avance pour la période choisie.</p>
          <p>3. Les activités sont soumises à disponibilité et réservation.</p>
          <p>4. Le centre se réserve le droit de modifier les horaires des activités.</p>
          <p>5. Aucun remboursement après 48h suivant l'activation de l'abonnement.</p>
          <p>6. Le port de la carte d'abonné est obligatoire pour accéder aux installations.</p>
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-slate-700 dark:text-slate-300">
          J'ai lu et j'accepte les conditions générales d'abonnement du centre sportif.
        </span>
      </label>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Choisissez votre activité</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => setSelectedActivity(activity.id)}
            className={cn(
              "rounded-lg border-2 p-4 text-left transition-all hover:shadow-md",
              selectedActivity === activity.id
                ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activity.icon}</span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{activity.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activity.category}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{activity.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>⏱ {activity.duration}</span>
              <span>👥 {activity.capacity} places</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Choisissez votre formule</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {mockSubscriptionPlans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={cn(
              "relative rounded-lg border-2 p-6 text-left transition-all hover:shadow-md",
              selectedPlan === plan.id
                ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
            )}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">
                Populaire
              </span>
            )}
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h4>
            <p className="mt-2 text-3xl font-bold text-primary-600 dark:text-primary-400">
              {plan.price} <span className="text-sm font-normal text-slate-500">{plan.currency}</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">/ {plan.period.toLowerCase()}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Paiement sécurisé</h3>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Récapitulatif</h4>
        <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <p>Activité : <strong>{selectedActivityData?.name}</strong></p>
          <p>Formule : <strong>{selectedPlanData?.name}</strong></p>
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
            Total : {selectedPlanData?.price} {selectedPlanData?.currency}
          </p>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Méthode de paiement</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {mockPaymentProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
                selectedProvider === provider.id
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
              )}
            >
              <span className="text-2xl">{provider.icon}</span>
              <div>
                <h5 className="font-medium text-slate-900 dark:text-white">{provider.name}</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">{provider.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedProvider && selectedProvider !== "cash" && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Numéro de téléphone ({selectedProviderData?.name})
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+243 XXX XXX XXX"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Vous recevrez une demande de confirmation sur votre téléphone.
          </p>
        </div>
      )}

      {selectedProvider === "cash" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💵 Vous pourrez payer en espèces à la réception du centre. Votre abonnement sera activé après confirmation du paiement.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        Paiement sécurisé - Aucune donnée sensible n'est stockée sur nos serveurs.
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Abonnement confirmé !</h3>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Votre demande d'abonnement a été traitée avec succès.
      </p>
      <div className="mx-auto mt-6 max-w-md rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Référence</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">{paymentReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Activité</span>
            <span className="font-semibold text-slate-900 dark:text-white">{selectedActivityData?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Formule</span>
            <span className="font-semibold text-slate-900 dark:text-white">{selectedPlanData?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Montant</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {selectedPlanData?.price} {selectedPlanData?.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Méthode</span>
            <span className="font-semibold text-slate-900 dark:text-white">{selectedProviderData?.name}</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Un reçu a été généré. Vous pouvez le consulter dans votre espace abonné.
      </p>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {renderStepIndicator()}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
        {renderStep()}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => currentStep === 1 ? onCancel() : setCurrentStep((prev) => Math.max(prev - 1, 1))}
          disabled={isProcessing}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {currentStep === 1 ? "Annuler" : "Retour"}
        </Button>

        {currentStep < 6 && (
          <Button onClick={handleNext} disabled={!canProceed() || isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                {currentStep === 5 ? "Payer" : "Continuer"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}

        {currentStep === 6 && (
          <Button onClick={handleComplete}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Terminer
          </Button>
        )}
      </div>
    </div>
  );
}