"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { usersDB } from "@/src/services/dbService";
import { notifyImportantAction } from "@/src/services/notifyService";

export default function ChangePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas.");
    const email = localStorage.getItem("current_user_email");
    const users = await usersDB.getAll<any>();
    const user = email && users.find((item) => item.email.toLowerCase() === email);
    if (!user) return router.push("/login");
    await usersDB.update(user.id, { password, mustChangePassword: false });
    notifyImportantAction("mot_de_passe", { email: user.email, name: user.name }).catch(() => {});
    if (user.role === "Gestionnaire") router.push("/admin");
    else if (user.role === "Entraîneur") router.push("/trainer");
    else router.push("/dashboard");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <LockKeyhole className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-4 text-center text-2xl font-bold text-slate-900 dark:text-white">Modifiez votre mot de passe</h1>
          <p className="mt-2 text-center text-sm text-slate-500">Pour sécuriser votre compte, choisissez un nouveau mot de passe avant d'accéder à votre espace.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div>
              <label className="mb-1 block text-sm font-medium">Nouveau mot de passe</label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirmer le mot de passe</label>
              <Input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
            </div>
            <Button className="w-full" type="submit">Enregistrer et accéder à mon espace</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}