"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { usersDB } from "@/src/services/dbService";
import { loadTrainerContext, type TrainerContext } from "@/src/services/trainerSpace";
import { useToast } from "@/src/contexts/ToastContext";

export default function TrainerProfile() {
  const toast = useToast();
  const [ctx, setCtx] = useState<TrainerContext | null>(null);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTrainerContext().then((c) => {
      setCtx(c);
      setPhone(c?.user?.phone ?? "");
    });
  }, []);

  const savePhone = async () => {
    if (!ctx?.user) return;
    setSaving(true);
    try {
      await usersDB.update(ctx.user.id, { phone });
      setCtx({ ...ctx, user: { ...ctx.user, phone } });
      toast.addToast("Téléphone mis à jour", "success");
    } catch {
      toast.addToast("Mise à jour impossible", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!ctx) return <p className="text-sm text-slate-500">Chargement…</p>;

  const t = ctx.trainer;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-sky-950 dark:text-sky-50">Mon profil</h1>
        <p className="mt-1 text-sm text-sky-900/60 dark:text-sky-200/60">Vos informations personnelles et professionnelles.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {t?.image?.startsWith("data:") || t?.image?.startsWith("http") ? (
              <img src={t.image} alt={t.name} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-xl font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                {(t?.name ?? ctx.user?.name ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t?.name ?? ctx.user?.name}</h3>
              <p className="text-sm text-slate-500">{t?.specialty ?? "Entraîneur"} · {t?.experience ?? ""}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {[["Email", ctx.user?.email], ["Spécialité", t?.specialty ?? "—"], ["Expérience", t?.experience ?? "—"]].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-900 dark:text-white">{val}</span>
              </div>
            ))}
          </div>
          {t?.bio && <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.bio}</p>}
          {t && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(t.activities ?? []).map((a: string) => (
                <Badge key={a} variant="default">{a}</Badge>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white">Compte de connexion</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
              <span className="text-slate-500">Rôle</span>
              <Badge variant="default">{ctx.user?.role}</Badge>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
              <span className="text-slate-500">Statut</span>
              <Badge variant="success">{ctx.user?.status}</Badge>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Téléphone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243 8XX XXX XXX" />
            </div>
            <Button onClick={savePhone} disabled={saving} className="w-full">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <p className="text-xs text-slate-400">Pour modifier votre mot de passe, contactez l&apos;administration.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
