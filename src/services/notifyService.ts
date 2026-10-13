// ============================================================
// NOTIFY SERVICE (client) — 1 action importante = 1 notif in-app + 1 e-mail
// Usage : await notifyImportantAction("message_recu", { email, name, ... })
// Paiements : await notifyPaymentConfirmation("abonnement_valide" | "renouvellement" | "achat_equipement", {...})
// Honnêteté : chaque fonction retourne { emailed, simulated }. Si le SMTP
// n'est pas configuré, l'e-mail est SIMULÉ (log serveur) et les textes
// in-app le disent au lieu d'affirmer un envoi.
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

export type NotifyResult = { emailed: boolean; simulated: boolean };

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

function inAppMessage(action: ImportantAction, p: NotifyPayload, simulated = false): string {
  // Si l'e-mail est simulé (SMTP non configuré), on ne prétend jamais l'avoir envoyé :
  // la notification in-app devient la preuve, et le dit explicitement.
  const simNote = " (Envoi e-mail non configuré : retrouvez tout dans vos notifications.)";
  const sub = (sentText: string, simText: string) => (simulated ? simText + simNote : sentText);
  if (p.message) return simulated ? `${p.message}${simNote}` : p.message;
  switch (action) {
    case "demande_created":
      return sub(
        `Votre Inscription ${p.activityName ? `« ${p.activityName} »` : ""} ${p.planName ? `(${p.planName})` : ""} a été envoyée. Un e-mail de confirmation vous a été adressé.`,
        `Votre Inscription ${p.activityName ? `« ${p.activityName} »` : ""} ${p.planName ? `(${p.planName})` : ""} a été envoyée et enregistrée.`
      );
    case "demande_confirmed":
      return sub(
        `Bonne nouvelle ${p.name || ""} ! Votre demande a été confirmée. Finalisez votre abonnement. Un e-mail vous a été envoyé.`,
        `Bonne nouvelle ${p.name || ""} ! Votre demande a été confirmée. Finalisez votre abonnement.`
      );
    case "demande_rejected":
      return sub(
        `Votre demande a été refusée. Consultez votre e-mail pour plus d'informations.`,
        `Votre demande a été refusée. Contactez le centre via la messagerie pour plus d'informations.`
      );
    case "abonnement_valide":
      return sub(
        `Abonnement « ${p.activityName || ""} » validé (${p.amount || ""} ${p.currency || "USD"}). Reçu ${p.reference || ""}. Détails envoyés par e-mail.`,
        `Abonnement « ${p.activityName || ""} » validé (${p.amount || ""} ${p.currency || "USD"}). Reçu ${p.reference || ""}. Détails ci-dessous.`
      );
    case "renouvellement":
      return sub(
        `Renouvellement « ${p.activityName || ""} » confirmé jusqu'au ${p.endDate || ""}. Détails envoyés par e-mail.`,
        `Renouvellement « ${p.activityName || ""} » confirmé jusqu'au ${p.endDate || ""}. Détails ci-dessous.`
      );
    case "achat_equipement":
      return sub(
        `Achat confirmé (${p.amount || ""} ${p.currency || "USD"}). Facture ${p.reference || ""}. Détails envoyés par e-mail.`,
        `Achat confirmé (${p.amount || ""} ${p.currency || "USD"}). Facture ${p.reference || ""}. Détails ci-dessous.`
      );
    case "message_recu":
      return `${p.senderName || "Un expéditeur"} vous a écrit : ${(p.body || "").slice(0, 140)}`;
    case "presence":
      return `Présence enregistrée : ${p.activityName || ""} le ${p.date || ""} (${p.message || "Présent"}).`;
    case "compte_cree":
      return sub(
        `Bienvenue ${p.name || ""} ! Votre compte est créé. Identifiants envoyés par e-mail.`,
        `Bienvenue ${p.name || ""} ! Votre compte est créé. Vos identifiants sont disponibles auprès du centre.`
      );
    case "mot_de_passe":
      return sub(
        `Votre mot de passe a été modifié. Un e-mail de sécurité vous a été envoyé.`,
        `Votre mot de passe a été modifié.`
      );
    case "profil_modifie":
      return sub(
        `Votre profil a été mis à jour. Confirmation envoyée par e-mail.`,
        `Votre profil a été mis à jour.`
      );
    case "annonce":
      return p.message || p.title || "Nouvelle notification.";
    default:
      return p.message || "Action effectuée.";
  }
}

async function sendEmailOnly(action: ImportantAction, payload: NotifyPayload): Promise<NotifyResult> {
  const out: NotifyResult = { emailed: false, simulated: false };
  try {
    if (typeof window === "undefined") return out;
    const email = (payload.email || "").trim();
    if (!email || !email.includes("@")) return out;
    const res = await fetch("/api/notify/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: email, action, data: payload }),
    });
    if (!res.ok) {
      console.warn("[notify] e-mail non envoyé :", await res.text());
      return out;
    }
    const data = await res.json().catch(() => ({}));
    return { emailed: true, simulated: !!data?.simulated };
  } catch (e) {
    console.warn("[notify] e-mail erreur :", e);
    return out;
  }
}

/**
 * Notifie l'acteur : envoie l'e-mail PUIS crée la notification in-app
 * (le texte in-app dit la vérité sur l'envoi).
 * Retourne { emailed, simulated }. N'interrompt jamais l'appelant.
 */
export async function notifyImportantAction(action: ImportantAction, payload: NotifyPayload): Promise<NotifyResult> {
  const email = (payload.email || "").trim().toLowerCase();
  if (!email) return { emailed: false, simulated: false };
  const meta = TITLES[action] || { title: payload.title || "Notification", type: "info" };

  // 1) E-mail d'abord (pour connaître le statut réel avant de rédiger la notif)
  const mail = await sendEmailOnly(action, { ...payload, email });

  // 2) Notification in-app (prioritaire, ne doit pas échouer silencieusement)
  try {
    await notificationsDB.create({
      userEmail: email,
      title: payload.title || meta.title,
      message: inAppMessage(action, payload, mail.simulated),
      type: payload.type || meta.type,
      audience: payload.audience || "",
      createdAt: new Date().toISOString(),
      read: false,
    });
  } catch (e) {
    console.warn("[notify] in-app impossible :", e);
  }
  return mail;
}

/** Envoi d'e-mail seul (sans notif in-app), ex. copie admin. */
export async function sendImportantEmail(action: ImportantAction, payload: NotifyPayload): Promise<NotifyResult> {
  return sendEmailOnly(action, payload);
}

export type PaymentConfirmAction = "abonnement_valide" | "renouvellement" | "achat_equipement";

/**
 * Confirmation de paiement : notif in-app du payeur + e-mails serveur (payeur ET admin).
 * Les e-mails partent via POST /api/notify/payment (source unique, pas de doublon) :
 * le payeur reçoit sa confirmation, l'admin configuré (ADMIN_EMAIL) reçoit une copie.
 * Retourne { emailed, simulated }. N'interrompt jamais le parcours de paiement en cas d'échec.
 */
export async function notifyPaymentConfirmation(action: PaymentConfirmAction, payload: NotifyPayload): Promise<NotifyResult> {
  const email = (payload.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { emailed: false, simulated: false };
  const meta = TITLES[action] || { title: "Paiement confirmé", type: "success" };
  const out: NotifyResult = { emailed: false, simulated: false };

  // 1) E-mails payeur + admin via le serveur (pour connaître le statut réel)
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/notify/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: { ...payload, email } }),
      });
      if (!res.ok) {
        console.warn("[notify] e-mails paiement non envoyés :", await res.text());
      } else {
        const data = await res.json().catch(() => ({}));
        out.emailed = true;
        out.simulated = !!data?.simulated;
      }
    }
  } catch (e) {
    console.warn("[notify] e-mails paiement erreur :", e);
  }

  // 2) Notification in-app du payeur (texte honnête sur l'envoi)
  try {
    await notificationsDB.create({
      userEmail: email,
      title: payload.title || meta.title,
      message: inAppMessage(action, payload, out.simulated),
      type: payload.type || meta.type,
      audience: payload.audience || "",
      createdAt: new Date().toISOString(),
      read: false,
    });
  } catch (e) {
    console.warn("[notify] in-app paiement impossible :", e);
  }
  return out;
}
