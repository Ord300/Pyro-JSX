// ============================================================
// NOTIFY SERVICE (client) — 1 action importante = 1 notif in-app + 1 e-mail
// Usage : await notifyImportantAction("message_recu", { email, name, ... })
// Paiements : await notifyPaymentConfirmation("abonnement_valide" | "renouvellement" | "achat_equipement", {...})
// Ne bloque jamais l'UX : les erreurs e-mail sont avalées (console.warn).
// ============================================================

import { notificationsDB } from "@/src/services/dbService";
import type { ImportantAction, TemplateData } from "@/src/lib/emailTemplates";

export type NotifyPayload = TemplateData & {
  email: string;
  name?: string;
  title?: string;   // titre notif in-app (sinon déduit de l'action)
  message?: string; // message notif in-app
  type?: string;    // success | info | warning | message
  audience?: string;
};

const TITLES: Record<ImportantAction, { title: string; type: string }> = {
  demande_created: { title: "Demande envoyée", type: "info" },
  nouvelle_demande_admin: { title: "Nouvelle demande reçue", type: "info" },
  demande_confirmed: { title: "Demande confirmée", type: "success" },
  demande_rejected: { title: "Demande refusée", type: "warning" },
  abonnement_valide: { title: "Abonnement validé", type: "success" },
  renouvellement: { title: "Abonnement renouvelé", type: "success" },
  achat_equipement: { title: "Achat confirmé", type: "success" },
  message_recu: { title: "Nouveau message", type: "message" },
  presence: { title: "Présence enregistrée", type: "info" },
  compte_cree: { title: "Compte créé", type: "success" },
  mot_de_passe: { title: "Mot de passe modifié", type: "warning" },
  profil_modifie: { title: "Profil mis à jour", type: "info" },
  annonce: { title: "Notification", type: "info" },
};

function inAppMessage(action: ImportantAction, p: NotifyPayload): string {
  if (p.message) return p.message;
  switch (action) {
    case "demande_created":
      return `Votre demande d'abonnement ${p.activityName ? `« ${p.activityName} »` : ""} ${p.planName ? `(${p.planName})` : ""} a été envoyée. Un e-mail de confirmation vous a été adressé.`;
    case "demande_confirmed":
      return `Bonne nouvelle ${p.name || ""} ! Votre demande a été confirmée. Finalisez votre abonnement. Un e-mail vous a été envoyé.`;
    case "demande_rejected":
      return `Votre demande a été refusée. Consultez votre e-mail pour plus d'informations.`;
    case "abonnement_valide":
      return `Abonnement « ${p.activityName || ""} » validé (${p.amount || ""} ${p.currency || "USD"}). Reçu ${p.reference || ""}. Détails envoyés par e-mail.`;
    case "renouvellement":
      return `Renouvellement « ${p.activityName || ""} » confirmé jusqu'au ${p.endDate || ""}. Détails envoyés par e-mail.`;
    case "achat_equipement":
      return `Achat confirmé (${p.amount || ""} ${p.currency || "USD"}). Facture ${p.reference || ""}. Détails envoyés par e-mail.`;
    case "message_recu":
      return `${p.senderName || "Un expéditeur"} vous a écrit : ${(p.body || "").slice(0, 140)}`;
    case "presence":
      return `Présence enregistrée : ${p.activityName || ""} le ${p.date || ""} (${p.message || "Présent"}).`;
    case "compte_cree":
      return `Bienvenue ${p.name || ""} ! Votre compte est créé. Identifiants envoyés par e-mail.`;
    case "mot_de_passe":
      return `Votre mot de passe a été modifié. Un e-mail de sécurité vous a été envoyé.`;
    case "profil_modifie":
      return `Votre profil a été mis à jour. Confirmation envoyée par e-mail.`;
    case "annonce":
      return p.message || p.title || "Nouvelle notification.";
    default:
      return p.message || "Action effectuée.";
  }
}

async function sendEmailOnly(action: ImportantAction, payload: NotifyPayload): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false;
    const email = (payload.email || "").trim();
    if (!email || !email.includes("@")) return false;
    const res = await fetch("/api/notify/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: email, action, data: payload }),
    });
    if (!res.ok) {
      console.warn("[notify] e-mail non envoyé :", await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[notify] e-mail erreur :", e);
    return false;
  }
}

/**
 * Notifie l'acteur : crée la notification in-app + envoie l'e-mail.
 * À appeler après chaque action importante, avec l'e-mail de la personne qui l'a causée.
 */
export async function notifyImportantAction(action: ImportantAction, payload: NotifyPayload): Promise<void> {
  const email = (payload.email || "").trim().toLowerCase();
  if (!email) return;
  const meta = TITLES[action] || { title: payload.title || "Notification", type: "info" };

  // 1) Notification in-app (prioritaire, ne doit pas échouer silencieusement)
  try {
    await notificationsDB.create({
      userEmail: email,
      title: payload.title || meta.title,
      message: inAppMessage(action, payload),
      type: payload.type || meta.type,
      audience: payload.audience || "",
      createdAt: new Date().toISOString(),
      read: false,
    });
  } catch (e) {
    console.warn("[notify] in-app impossible :", e);
  }

  // 2) E-mail (secondaire, fire-and-forget)
  await sendEmailOnly(action, { ...payload, email });
}

/** Envoi d'e-mail seul (sans notif in-app), ex. copie admin. */
export async function sendImportantEmail(action: ImportantAction, payload: NotifyPayload): Promise<boolean> {
  return sendEmailOnly(action, payload);
}

export type PaymentConfirmAction = "abonnement_valide" | "renouvellement" | "achat_equipement";

/**
 * Confirmation de paiement : notif in-app du payeur + e-mails serveur (payeur ET admin).
 * Les e-mails partent via POST /api/notify/payment (source unique, pas de doublon) :
 * le payeur reçoit sa confirmation, l'admin (ordidimbi@gmail.com) reçoit une copie.
 * N'interrompt jamais le parcours de paiement en cas d'échec.
 */
export async function notifyPaymentConfirmation(action: PaymentConfirmAction, payload: NotifyPayload): Promise<void> {
  const email = (payload.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return;
  const meta = TITLES[action] || { title: "Paiement confirmé", type: "success" };

  // 1) Notification in-app du payeur (prioritaire)
  try {
    await notificationsDB.create({
      userEmail: email,
      title: payload.title || meta.title,
      message: inAppMessage(action, payload),
      type: payload.type || meta.type,
      audience: payload.audience || "",
      createdAt: new Date().toISOString(),
      read: false,
    });
  } catch (e) {
    console.warn("[notify] in-app paiement impossible :", e);
  }

  // 2) E-mails payeur + admin via le serveur (fire-and-forget)
  try {
    if (typeof window === "undefined") return;
    const res = await fetch("/api/notify/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data: { ...payload, email } }),
    });
    if (!res.ok) console.warn("[notify] e-mails paiement non envoyés :", await res.text());
  } catch (e) {
    console.warn("[notify] e-mails paiement erreur :", e);
  }
}
