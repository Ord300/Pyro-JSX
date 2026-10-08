"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Loader2, CheckCircle2, XCircle, QrCode } from "lucide-react";

function QrLoginInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification de votre carte…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Code QR manquant ou invalide.");
      return;
    }
    const run = async () => {
      try {
        const response = await fetch("/api/auth/qr-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (!response.ok) {
          setStatus("error");
          setMessage(data?.error || "Connexion impossible avec cette carte.");
          return;
        }
        localStorage.setItem("current_user_email", String(data.email).toLowerCase());
        setStatus("success");
        setMessage(`Bienvenue ${data.name || ""} ! Redirection…`);
        const target = data?.mustChangePassword
          ? "/change-password"
          : data?.role === "Gestionnaire"
            ? "/admin"
            : data?.role === "Entraîneur"
              ? "/trainer"
              : "/dashboard";
        setTimeout(() => {
          window.location.href = target;
        }, 900);
      } catch {
        setStatus("error");
        setMessage("Serveur injoignable. Réessayez plus tard.");
      }
    };
    run();
  }, [token]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600 dark:text-primary-400" />
              <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Connexion par carte</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
              <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Connecté !</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Connexion impossible</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/login">
                  <Button className="w-full">Se connecter avec mot de passe</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">Retour à l&apos;accueil</Button>
                </Link>
              </div>
            </>
          )}
          {status === "loading" && (
            <QrCode className="mx-auto mt-6 h-6 w-6 text-slate-300 dark:text-slate-600" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function QrLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        </div>
      }
    >
      <QrLoginInner />
    </Suspense>
  );
}
