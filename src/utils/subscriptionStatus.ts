// Statut dynamique des abonnements — calculé depuis endDate, pas seulement `status` en base.
// Un abonnement "Validée" dont endDate < aujourd'hui est considéré comme expiré.

export const getTodayStr = (): string => new Date().toISOString().slice(0, 10);

export function isSubscriptionExpired(sub: any): boolean {
  if (!sub) return true;
  // Statut déjà marqué expiré en base
  if (sub.status === "Expirée" || sub.status === "expired") return true;
  // Sans date de fin, on se fie au statut
  if (!sub.endDate) return sub.status !== "Validée" && sub.status !== "active";
  return String(sub.endDate).slice(0, 10) < getTodayStr();
}

export function isSubscriptionActive(sub: any): boolean {
  if (!sub) return false;
  const statusOk = sub.status === "Validée" || sub.status === "active";
  if (!statusOk) return false;
  if (!sub.endDate) return true;
  return String(sub.endDate).slice(0, 10) >= getTodayStr();
}

/** Retourne le statut dynamique : "Validée" ou "Expirée" (conserve les autres statuts). */
export function getDynamicStatus(sub: any): string {
  if (!sub) return "Expirée";
  if (sub.status === "En attente" || sub.status === "Annulée" || sub.status === "Refusée") return sub.status;
  return isSubscriptionExpired(sub) ? "Expirée" : "Validée";
}

/** Jours restants avant expiration (négatif si expiré). */
export function getDaysLeft(sub: any): number {
  if (!sub?.endDate) return 0;
  return Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86_400_000);
}
