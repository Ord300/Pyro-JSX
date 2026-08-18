import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import { mockSubscriptions } from '../../data/subscriptionData';
import { mockReservations } from '../../data/reservationData';
import { paymentsDB, usersDB } from '../../services/dbService';
import { History, Search } from 'lucide-react';

type HistoryType = 'all' | 'subscriptions' | 'reservations' | 'payments';

export function UserHistory() {
  const [filter, setFilter] = useState<HistoryType>('all');
  const [search, setSearch] = useState('');

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Validée':
      case 'Réussi':
      case 'Confirmée':
      case 'Terminée':
        return 'success';
      case 'En attente':
        return 'warning';
      case 'Expirée':
      case 'Échoué':
      case 'Annulée':
        return 'danger';
      default:
        return 'default';
    }
  };

  const filteredSubscriptions = mockSubscriptions.filter((s) => {
    if (filter !== 'all' && filter !== 'subscriptions') return false;
    if (search && !s.planName.toLowerCase().includes(search.toLowerCase()) && !s.activityName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredReservations = mockReservations.filter((r) => {
    if (filter !== 'all' && filter !== 'reservations') return false;
    if (search && !r.activityName.toLowerCase().includes(search.toLowerCase()) && !r.placeName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Payments for current user
  const currentEmail = localStorage.getItem('current_user_email') || localStorage.getItem('current_subscriber_email');
  const currentUser = currentEmail ? usersDB.getAll<any>().find(u => u.email?.toLowerCase() === currentEmail.toLowerCase()) : null;
  const allPayments = paymentsDB.getAll<any>();
  const filteredPayments = allPayments.filter((p) => {
    if (filter !== 'all' && filter !== 'payments') return false;
    const matchesUser = currentUser ? (p.userId === currentUser.id || String(p.email || '').toLowerCase() === currentEmail?.toLowerCase() || String(p.userName || '').toLowerCase().includes((currentUser.name || '').toLowerCase())) : false;
    if (!matchesUser) return false;
    if (search && !String(p.description || '').toLowerCase().includes(search.toLowerCase()) && !String(p.reference || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalItems = filteredSubscriptions.length + filteredReservations.length + filteredPayments.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Mon historique</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Consultez l'ensemble de vos activités passées.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'subscriptions', 'reservations', 'payments'] as HistoryType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                filter === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              {type === 'all' ? 'Tout' : type === 'subscriptions' ? 'Abonnements' : type === 'reservations' ? 'Réservations' : 'Paiements'}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:w-64"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {totalItems === 0 && (
          <Card className="p-12 text-center">
            <History className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Aucun résultat</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Aucun élément ne correspond à votre recherche.
            </p>
          </Card>
        )}

        {filteredSubscriptions.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Abonnements
            </h2>
            <div className="space-y-3">
              {filteredSubscriptions.map((sub) => (
                <Card key={sub.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{sub.planName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{sub.activityName}</p>
                    </div>
                    <Badge variant={getStatusVariant(sub.status)}>{sub.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span>📅 {sub.startDate} → {sub.endDate}</span>
                    <span>💰 {sub.amount} {sub.currency}</span>
                    <span>💳 {sub.paymentMethod}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredReservations.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Réservations
            </h2>
            <div className="space-y-3">
              {filteredReservations.map((res) => (
                <Card key={res.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{res.activityIcon}</span>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{res.activityName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {res.date} à {res.time} • {res.placeName}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(res.status)}>{res.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredPayments.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Paiements
            </h2>
            <div className="space-y-3">
              {filteredPayments.map((pay) => (
                <Card key={pay.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{pay.reference}</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{pay.description}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {pay.method} • {pay.createdAt.split('T')[0]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">{pay.amount} {pay.currency}</p>
                      <Badge variant={getStatusVariant(pay.status)}>{pay.status}</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}