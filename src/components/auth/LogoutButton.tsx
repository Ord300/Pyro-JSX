"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { cn } from "@/src/utils/cn";

type LogoutButtonProps = {
  variant?: "sidebar" | "icon";
  className?: string;
  onDone?: () => void;
};

/**
 * Bouton de déconnexion fiable :
 * - vide le localStorage (toutes les clés de session)
 * - réinitialise le contexte auth
 * - redirection FORCÉE via window.location (pas router.push qui peut rester bloqué
 *   dans le layout admin protégé par redirect).
 */
export function LogoutButton({ variant = "sidebar", className, onDone }: LogoutButtonProps) {
  const { logout } = useAuth();
  const [leaving, setLeaving] = useState(false);

  const handleLogout = () => {
    if (leaving) return;
    setLeaving(true);
    try {
      logout();
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem("current_user_email");
      localStorage.removeItem("current_subscriber_email");
    } catch {
      // ignore (SSR)
    }
    onDone?.();
    // Redirection dure : garantit la sortie de /admin même si le router est bloqué.
    window.location.assign("/login");
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={leaving}
        title="Déconnexion"
        aria-label="Déconnexion"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50",
          className
        )}
      >
        <LogOut className={cn("h-5 w-5", leaving && "animate-pulse")} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={leaving}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50",
        className
      )}
    >
      <LogOut className={cn("h-5 w-5", leaving && "animate-pulse")} />
      {leaving ? "Déconnexion…" : "Déconnexion"}
    </button>
  );
}
