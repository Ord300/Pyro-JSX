"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card } from "@/src/components/ui/Card";

type Settings = { siteName: string; contactEmail: string; currency: string };

const STORAGE_KEY = "admin_settings";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({ siteName: "SPORT CENTER", contactEmail: "", currency: "USD" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    alert("Paramètres enregistrés");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Réglages globaux de l'application.</p>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nom du site</label>
            <Input value={settings.siteName} onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email de contact</label>
            <Input value={settings.contactEmail} onChange={(e) => setSettings((s) => ({ ...s, contactEmail: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Devise par défaut</label>
            <Input value={settings.currency} onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save}>Enregistrer</Button>
        </div>
      </Card>
    </div>
  );
}