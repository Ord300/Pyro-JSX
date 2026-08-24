"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { subscriptionsDB, reservationsDB, paymentsDB, usersDB } from "@/src/services/dbService";
import type { Reservation } from "@/src/types/reservation";
import { CreditCard, Calendar, Wallet, Bell, ArrowRight } from "lucide-react";

export default function UserDashboard() {
  const [user, setUser] = useState<any | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const email = localStorage.getItem("current_user_email") || "";
      if (!email) return;
      const [users, allSubscriptions, allReservations, allPayments] = await Promise.all([
        usersDB.getAll<any>(),
        subscriptionsDB.getAll<any>(),
        reservationsDB.getAll<Reservation>(),
        paymentsDB.getAll<any>(),
      ]);
      setUser(users.find((item) => item.email.toLowerCase() === email) || null);
      setSubscriptions(allSubscriptions.filter((subscription: any) => subscription.email?.toLowerCase() === email));
      setReservations(allReservations.filter((reservation: any) => reservation.email?.toLowerCase() === email));
      setPayments(allPayments.filter((payment: any) => payment.email?.toLowerCase() === email));
    };
    load();
  }, []);

  const activeSubscription = subscriptions.find((s) => s.status === "Validée");
  const upcomingReservations = reservations.filter((r) => r.status === "Confirmée");
  const recentPayments = payments.slice(0, 3);

  const stats = [
    { label: "Abonnement actif", value: activeSubscription ? "Actif" : "Aucun", icon: CreditCard, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Réservations à venir", value: upcomingReservations.length, icon: Calendar, color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20" },
    { label: "Paiements effectués", value: payments.filter((p) => p.status === "Réussi").length, icon: Wallet, color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" },
    { label: "Notifications", value: 3, icon: Bell, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">Bonjour, {user?.name || "Abonné"}</h1>
        <p className="mt-1 text-sm text-emerald-900/60 dark:text-emerald-200/60">
          {user?.memberNumber ? `Matricule : ${user.memberNumber}` : "Gérez votre abonnement, vos réservations et vos paiements."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-900/60 dark:text-emerald-200/60">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-emerald-950 dark:text-emerald-50">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Subscription */}
        <Card className="p-6 border-emerald-100 dark:border-emerald-900/40 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-emerald-950 dark:text-emerald-50">Mon abonnement</h2>
            <Link href="/dashboard/subscription" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
              Voir détails <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {activeSubscription ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-950 dark:text-emerald-50">{activeSubscription.planName}</p>
                  <p className="text-sm text-emerald-900/60 dark:text-emerald-200/60">{activeSubscription.activityName}</p>
                </div>
                <Badge variant="success">Actif</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-emerald-900/60 dark:text-emerald-200/60">Début</p>
                  <p className="font-medium text-emerald-950 dark:text-emerald-50">{activeSubscription.startDate}</p>
                </div>
                <div>
                  <p className="text-emerald-900/60 dark:text-emerald-200/60">Fin</p>
                  <p className="font-medium text-emerald-950 dark:text-emerald-50">{activeSubscription.endDate}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-emerald-300 p-6 text-center dark:border-emerald-700">
              <p className="text-sm text-emerald-900/60 dark:text-emerald-200/60">Aucun abonnement actif</p>
              <Link href="/dashboard/subscription" className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                Souscrire maintenant
              </Link>
            </div>
          )}
        </Card>

        {/* Upcoming Reservations */}
        <Card className="p-6 border-emerald-100 dark:border-emerald-900/40 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-emerald-950 dark:text-emerald-50">Prochaines réservations</h2>
            <Link href="/dashboard/history" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingReservations.length > 0 ? (
              upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center gap-3 rounded-lg border border-emerald-200/70 p-3 dark:border-emerald-800/70">
                  <span className="text-2xl">{reservation.activityIcon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-emerald-950 dark:text-emerald-50">{reservation.activityName}</p>
                    <p className="text-xs text-emerald-900/60 dark:text-emerald-200/60">
                      {reservation.date} à {reservation.time} • {reservation.placeName}
                    </p>
                  </div>
                  <Badge variant="default">Confirmée</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-emerald-900/60 dark:text-emerald-200/60">Aucune réservation à venir</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="p-6 border-emerald-100 dark:border-emerald-900/40 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-emerald-950 dark:text-emerald-50">Paiements récents</h2>
          <Link href="/dashboard/receipts" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-emerald-200 text-left text-xs uppercase tracking-wider text-emerald-900/50 dark:border-emerald-800 dark:text-emerald-200/50">
                <th className="pb-3 pr-4">Référence</th>
                <th className="pb-3 pr-4">Description</th>
                <th className="pb-3 pr-4">Méthode</th>
                <th className="pb-3 pr-4">Montant</th>
                <th className="pb-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-200/60 dark:divide-emerald-800/60">
              {recentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="py-3 pr-4 font-mono text-xs text-emerald-900/70 dark:text-emerald-200/70">{payment.reference}</td>
                  <td className="py-3 pr-4 text-emerald-950 dark:text-emerald-50">{payment.description}</td>
                  <td className="py-3 pr-4 text-emerald-900/60 dark:text-emerald-200/60">{payment.method}</td>
                  <td className="py-3 pr-4 font-medium text-emerald-950 dark:text-emerald-50">
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