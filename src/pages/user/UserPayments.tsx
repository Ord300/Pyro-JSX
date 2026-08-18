import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { mockPayments, mockPaymentProviders } from '../../data/paymentData';
import { processPayment } from '../../services/paymentService';
import { paymentsDB } from '../../services/dbService';
import type { PaymentMethod } from '../../types/payment';
import { Wallet, ShieldCheck, Loader2, CheckCircle2, X } from 'lucide-react';

export function UserPayments() {
  const email = localStorage.getItem('current_user_email') || '';
  const payments = paymentsDB.getAll<any>().filter(payment => payment.email?.toLowerCase() === email);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successReference, setSuccessReference] = useState('');

  const handlePayment = async () => {
    if (!selectedProvider || !amount) return;
    setIsProcessing(true);
    setError('');

    const methodMap: Record<string, PaymentMethod> = {
      mpesa: 'M-Pesa',
      'orange-money': 'Orange Money',
      card: 'Carte Bancaire',
      cash: 'Espèces',
    };

    const result = await processPayment({
      amount: parseFloat(amount),
      currency: 'USD',
      method: methodMap[selectedProvider],
      phoneNumber: selectedProvider === 'cash' ? undefined : phoneNumber,
      description: description || 'Paiement',
    });

    setIsProcessing(false);

    if (result.success) {
      setSuccessReference(result.reference);
      setShowPaymentModal(false);
      setSelectedProvider(null);
      setPhoneNumber('');
      setAmount('');
      setDescription('');
    } else {
      setError(result.message);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Réussi': return 'success';
      case 'En attente': return 'warning';
      case 'Échoué': return 'danger';
      case 'Remboursé': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Mes paiements</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gérez vos paiements et consultez votre historique.
          </p>
        </div>
        <Button onClick={() => setShowPaymentModal(true)}>
          <Wallet className="mr-2 h-4 w-4" />
          Effectuer un paiement
        </Button>
      </div>

      {successReference && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-200">
            Paiement effectué avec succès ! Référence : <strong>{successReference}</strong>
          </p>
        </div>
      )}

      {/* Payment Methods */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockPaymentProviders.map((provider) => (
          <Card key={provider.id} className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{provider.icon}</span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{provider.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{provider.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Historique des paiements</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="pb-3 pr-4">Référence</th>
                <th className="pb-3 pr-4">Description</th>
                <th className="pb-3 pr-4">Méthode</th>
                <th className="pb-3 pr-4">Montant</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">{payment.reference}</td>
                  <td className="py-3 pr-4 text-slate-900 dark:text-white">{payment.description}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{payment.method}</td>
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                    {payment.amount} {payment.currency}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                    {payment.createdAt.split('T')[0]}
                  </td>
                  <td className="py-3">
                    <Badge variant={getStatusVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Effectuer un paiement</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Montant (USD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Abonnement mensuel"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Méthode de paiement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mockPaymentProviders.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all',
                        selectedProvider === provider.id
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                      )}
                    >
                      <span className="text-xl">{provider.icon}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{provider.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedProvider && selectedProvider !== 'cash' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+243 XXX XXX XXX"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Paiement sécurisé - Aucune donnée sensible n'est stockée.
              </div>

              <Button
                className="w-full"
                onClick={handlePayment}
                disabled={!selectedProvider || !amount || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  'Payer'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
