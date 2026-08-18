import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SubscriptionWizard } from '../../components/subscription/SubscriptionWizard';
import { useActivities } from '../../hooks/queries/activities';
import { subscriptionsDB } from '../../services/dbService';
import { Link } from 'react-router-dom';
import { CreditCard, QrCode, Download, RefreshCw, CheckCircle2, X } from 'lucide-react';

export function UserSubscription() {
  const { data: activities = [] } = useActivities();
  const [showWizard, setShowWizard] = useState(false);
  const [lastReference, setLastReference] = useState('');
  const currentEmail = localStorage.getItem('current_user_email') || '';
  const activeSubscription = subscriptionsDB.getAll<any>().find(subscription => subscription.status === 'Validée' && subscription.email?.toLowerCase() === currentEmail);

  const handleWizardComplete = (reference: string) => {
    setLastReference(reference);
    setShowWizard(false);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Mon abonnement</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gérez votre abonnement et votre carte virtuelle.
          </p>
        </div>
        <Link to="/verification"><Button><RefreshCw className="mr-2 h-4 w-4" />Vérifier ma demande</Button></Link>
      </div>

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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 text-white shadow-lg">
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
                    <QrCode className="h-12 w-12 text-white" />
                    <div className="text-xs text-white/70">
                      <p>Scannez ce code</p>
                      <p>à l'entrée du centre</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/70">N° Abonné</p>
                    <p className="font-mono text-lg font-bold">SUB-{String(activeSubscription.id).padStart(4, '0')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Télécharger la carte
              </Button>
              <Button variant="outline" size="sm">
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
                  <span className="font-semibold text-slate-900 dark:text-white">{activeSubscription.createdAt}</span>
                </div>
              </div>
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
          <Link to="/verification"><Button className="mt-6">Vérifier ma demande</Button></Link>
        </Card>
      )}
    </div>
  );
}
