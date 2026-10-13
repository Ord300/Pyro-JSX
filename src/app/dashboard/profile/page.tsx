"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Mail, Phone, Save, Shield } from "lucide-react";
import { usersDB, subscriptionsDB } from "@/src/services/dbService";
import { getDynamicStatus } from "@/src/utils/subscriptionStatus";
import { notifyImportantAction } from "@/src/services/notifyService";

export default function UserProfile() {
  const [user, setUser] = useState<any | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const email = (localStorage.getItem("current_user_email") || "").toLowerCase();
      if (!email) return;
      const users = await usersDB.getAll<any>();
      const found = users.find((item) => item.email?.toLowerCase() === email) || null;
      setUser(found);
      if (found) {
        setFormData({
          name: found.name || "",
          email: found.email || "",
          phone: found.phone || "",
        });
        const allSubscriptions = await subscriptionsDB.getAll<any>();
        setSubscriptions(allSubscriptions.filter((s) => s.email?.toLowerCase() === String(found.email || "").toLowerCase()));
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await usersDB.update(user.id, { name: formData.name, phone: formData.phone });
    const savedEmail = user.email || "";
    const savedName = formData.name;
    setUser((prev: any) => (prev ? { ...prev, name: savedName, phone: formData.phone } : prev));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    if (savedEmail?.includes("@")) {
      notifyImportantAction("profil_modifie", { email: savedEmail, name: savedName }).catch(() => {});
    }
  };

  const initials = formData.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "•";

  const dynamicStatuses = subscriptions.map((s) => getDynamicStatus(s));
  const hasActiveSubscription = dynamicStatuses.includes("Validée");
  const hasExpiredSubscription = dynamicStatuses.includes("Expirée");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Mon profil</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gérez vos informations personnelles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="p-6 text-center">
          <div className="relative mx-auto h-24 w-24">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              {initials}
            </div>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{formData.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{formData.email}</p>
          <div className="mt-3">
            {hasActiveSubscription ? (
              <Badge variant="success">Abonné actif</Badge>
            ) : hasExpiredSubscription ? (
              <Badge variant="danger">Abonnement expiré</Badge>
            ) : (
              <Badge variant="warning">Sans abonnement</Badge>
            )}
          </div>
          <div className="mt-6 space-y-3 text-left text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="h-4 w-4" />
              {formData.email}
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Phone className="h-4 w-4" />
              {formData.phone || "—"}
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Informations personnelles</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {saved && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                  <p className="text-sm text-green-700 dark:text-green-300">✓ Profil mis à jour avec succès</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Shield className="h-4 w-4 text-green-600" />
                  Vos données sont protégées et confidentielles.
                </div>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}