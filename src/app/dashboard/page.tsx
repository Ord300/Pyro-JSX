"use client";

import Link from "next/link";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { subscriptionsDB, reservationsDB, paymentsDB, usersDB } from "@/src/services/dbService";
import type { Reservation } from "@/src/types/reservation";
import { CreditCard, Calendar, Wallet, Bell, ArrowRight } from "lucide-react";

export default function UserDashboard() {
  const email = localStorage.getItem("current_user_email") || "";
  const user = usersDB.getAll<any>().find((item) => item.email.toLowerCase() === email);
  const subscriptions = subscriptionsDB.getAll<any>().filter((subscription) => subscription.email?.toLowerCase() === email);
  const reservations = reservationsDB.getAll<Reservation>().filter((reservation: any) => reservation.email?.toLowerCase() === email);
  const payments = paymentsDB.getAll<any>().filter((payment) => payment.email?.toLowerCase() === email);

  const activeSubscription = subscriptions.find((s) => s.status === "Validée");
  const upcomingReservations = reservations.filter((r) => r.status === "Confirmée");
  const recentPayments = payments.slice(0, 3);

  const stats = [
    { label: "Abonnement actif", value: activeSubscription ? "Actif" : "Aucun", icon: CreditCard, color: "text-primary-600 dark:text-primary-400" },
    { label: "Réservations à venir", value: upcomingReservations.length, icon: Calendar, color: "text-blue-600 dark:text-blue-400" },
    { label: "Paiements effectués", value: payments.filter((p) => p.status === "Réussi").length, icon: Wallet, color: "text-green-600 dark:text-green-400" },
    { label: "Notifications", value: 3, icon: Bell, color: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Bonjour, {user?.name || "Abonné"}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {user?.memberNumber ? `Matricule : ${user.memberNumber}` : "Gérez votre abonnement, vos réservations et vos paiements."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`rounded-lg bg-slate-100 p-3 dark:bg-slate-800 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Subscription */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Mon abonnement</h2>
            <Link href="/dashboard/subscription" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Voir détails <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {activeSubscription ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{activeSubscription.planName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{activeSubscription.activityName}</p>
                </div>
                <Badge variant="success">Actif</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Début</p>
                  <p className="font-medium text-slate-900 dark:text-white">{activeSubscription.startDate}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Fin</p>
                  <p className="font-medium text-slate-900 dark:text-white">{activeSubscription.endDate}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucun abonnement actif</p>
              <Link href="/dashboard/subscription" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Souscrire maintenant
              </Link>
            </div>
          )}
        </Card>

        {/* Upcoming Reservations */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Prochaines réservations</h2>
            <Link href="/dashboard/reservations" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingReservations.length > 0 ? (
              upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <span className="text-2xl">{reservation.activityIcon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{reservation.activityName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {reservation.date} à {reservation.time} • {reservation.placeName}
                    </p>
                  </div>
                  <Badge variant="default">Confirmée</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucune réservation à venir</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Paiements récents</h2>
          <Link href="/dashboard/payments" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="pb-3 pr-4">Référence</th>
                <th className="pb-3 pr-4">Description</th>
                <th className="pb-3 pr-4">Méthode</th>
                <th className="pb-3 pr-4">Montant</th>
                <th className="pb-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">{payment.reference}</td>
                  <td className="py-3 pr-4 text-slate-900 dark:text-white">{payment.description}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{payment.method}</td>
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                    {payment.amount} {payment.currency}
                  </td>
                  <td className="py-3">
                    <Badge variant={payment.status === "Réussi" ? "success" : payment.status === "Échoué" ? "danger" : "warning"}>
                      {payment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}