import React from 'react';
import {
  Users, CreditCard, Activity, Dumbbell,
  Calendar, DollarSign, Clock, AlertCircle
} from 'lucide-react';
import { KPICard } from '../../components/dashboard/KPICard';
import { RevenueChart, SubscriptionsChart, ReservationsChart, ActivityDonutChart } from '../../components/dashboard/Charts';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { recentPayments, recentReservations, pendingRequests } from '../../data/adminData';
import { mockStats } from '../../data/mockData';
import { Link } from 'react-router-dom';

const statusBadge = (status: string) => {
  const map: Record<string, React.ReactElement> = {
    'Réussi':     <Badge variant="success">{status}</Badge>,
    'En attente': <Badge variant="warning">{status}</Badge>,
    'Échoué':     <Badge variant="danger">{status}</Badge>,
    'Confirmée':  <Badge variant="success">{status}</Badge>,
    'Annulée':    <Badge variant="danger">{status}</Badge>,
  };
  return map[status] ?? <Badge>{status}</Badge>;
};

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Bienvenue ! Voici un aperçu de l'activité du centre sportif.
        </p>
      </div>

      {/* KPI Cards — Ligne 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard title="Total abonnés" value={mockStats.totalSubscribers.toLocaleString()} icon={Users} change={12.5} color="blue" />
        <KPICard title="Abonnements actifs" value={mockStats.activeSubscriptions.toLocaleString()} icon={CreditCard} change={8.2} color="green" />
        <KPICard title="Abonnements expirés" value={mockStats.expiredSubscriptions.toLocaleString()} icon={AlertCircle} change={-3.1} color="red" />
        <KPICard title="Demandes en attente" value={mockStats.pendingRequests} icon={Clock} change={5.0} color="amber" />
      </div>

      {/* KPI Cards — Ligne 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard title="Activités" value={mockStats.totalActivities} icon={Activity} color="cyan" />
        <KPICard title="Entraîneurs" value={mockStats.totalTrainers} icon={Dumbbell} color="purple" />
        <KPICard title="Réservations ce mois" value={mockStats.totalReservations} icon={Calendar} change={18.7} color="blue" />
        <KPICard title="Revenus (USD)" value={`$${mockStats.totalRevenue.toLocaleString()}`} icon={DollarSign} change={22.4} color="green" />
      </div>

      {/* Graphiques — Ligne 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <SubscriptionsChart />
      </div>

      {/* Graphiques — Ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReservationsChart />
        </div>
        <ActivityDonutChart />
      </div>

      {/* Demandes en attente */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Demandes récentes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Demandes d'abonnement en attente de validation</p>
          </div>
          <Link to="/admin/requests">
            <Button variant="outline" size="sm">Voir tout</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium text-slate-900 dark:text-white">{req.name}</TableCell>
                  <TableCell className="text-slate-500">{req.email}</TableCell>
                  <TableCell className="text-slate-500">{req.phone}</TableCell>
                  <TableCell className="text-slate-500">{req.date}</TableCell>
                  <TableCell>{statusBadge(req.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="h-7 text-xs px-2">✓ Confirmer</Button>
                      <Button size="sm" variant="danger" className="h-7 text-xs px-2">✕ Refuser</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Derniers paiements & réservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paiements */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Derniers paiements</h3>
            <Link to="/admin/payments"><Button variant="ghost" size="sm">Voir tout →</Button></Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.activity} · {p.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">${p.amount}</p>
                  {statusBadge(p.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Réservations */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Prochaines réservations</h3>
            <Link to="/admin/reservations"><Button variant="ghost" size="sm">Voir tout →</Button></Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentReservations.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                    {r.member.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{r.member}</p>
                    <p className="text-xs text-slate-400">{r.activity} · {r.place}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{r.date}</p>
                  <p className="text-xs text-slate-400">{r.time}</p>
                  {statusBadge(r.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
