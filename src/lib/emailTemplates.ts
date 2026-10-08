// ============================================================
// TEMPLATES E-MAIL — Actions importantes de la plateforme
// Chaque template retourne { subject, html, text }
// ============================================================

export type ImportantAction =
  | "demande_created"
  | "nouvelle_demande_admin"
  | "demande_confirmed"
  | "demande_rejected"
  | "abonnement_valide"
  | "renouvellement"
  | "achat_equipement"
  | "message_recu"
  | "presence"
  | "compte_cree"
  | "mot_de_passe"
  | "profil_modifie"
  | "annonce";

export interface TemplateData {
  name?: string;
  email?: string;
  activityName?: string;
  planName?: string;
  amount?: number | string;
  currency?: string;
  reference?: string;
  memberNumber?: string;
  startDate?: string;
  endDate?: string;
  method?: string;
  date?: string;
  title?: string;
  message?: string;
  subject?: string;
  body?: string;
  senderName?: string;
  [key: string]: any;
}

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MoveUp — Centre Sportif";
const BRAND = "#0d7a5f";

function layout(title: string, greeting: string, contentHtml: string, footerNote?: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:linear-gradient(135deg,#064e3b,#0d7a5f);padding:24px;text-align:center;color:#fff">
      <div style="font-size:22px;font-weight:800">${APP_NAME}</div>
      <div style="font-size:13px;opacity:.85;margin-top:4px">${title}</div>
    </div>
    <div style="padding:24px;background:#fff">
      <p style="font-size:15px;color:#0f172a">Bonjour <strong>${greeting}</strong>,</p>
      ${contentHtml}
      <div style="margin-top:20px;padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;color:#166534">
        Ceci est une confirmation automatique de l'action que vous avez effectuée sur la plateforme.
      </div>
    </div>
    <div style="padding:16px;text-align:center;font-size:12px;color:#94a3b8;background:#f8fafc">
      ${footerNote || "Ne répondez pas à cet e-mail — utilisez la messagerie de la plateforme pour nous contacter."}<br/>
      © ${new Date().getFullYear()} ${APP_NAME}
    </div>
  </div>`;
}

function row(label: string, value: string): string {
  return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px"><span style="color:#64748b">${label}</span><strong style="color:#0f172a">${value}</strong></div>`;
}

export function buildEmail(action: ImportantAction, d: TemplateData = {}): { subject: string; html: string; text: string } {
  const name = d.name || d.email?.split("@")[0] || "cher(e) membre";

  switch (action) {
    case "demande_created": {
      const subject = `Demande d'abonnement reçue — ${d.activityName || "MoveUp"}`;
      const html = layout(
        "Demande d'abonnement",
        name,
        `<p style="font-size:14px;color:#334155">Nous avons bien reçu votre demande d'abonnement. L'administration va l'examiner.</p>
        ${d.activityName ? row("Activité", d.activityName) : ""}
        ${d.planName ? row("Formule", d.planName) : ""}
        ${row("Statut", "En attente de validation")}`
      );
      return { subject, html, text: `${subject}\nActivité: ${d.activityName}\nFormule: ${d.planName}\nStatut: En attente` };
    }
    case "nouvelle_demande_admin": {
      const subject = `Nouvelle demande d'abonnement — ${d.name || d.email} (${d.activityName || "MoveUp"})`;
      const html = layout(
        "Nouvelle demande à traiter",
        "Admin",
        `<p style="font-size:14px;color:#334155">Une nouvelle demande d'abonnement vient d'être soumise sur la plateforme :</p>
        ${d.name ? row("Demandeur", d.name) : ""}
        ${d.email ? row("E-mail", d.email) : ""}
        ${d.phone ? row("Téléphone", d.phone) : ""}
        ${d.activityName ? row("Activité", d.activityName) : ""}
        ${d.planName ? row("Formule", d.planName) : ""}
        ${row("Statut", "En attente")}
        <p style="font-size:13px;color:#64748b">Traitez-la depuis Admin → Demandes d'abonnement.</p>`,
        "E-mail automatique d'alerte admin."
      );
      return { subject, html, text: `${subject}\nDemandeur: ${d.name} <${d.email}>\nActivité: ${d.activityName}\nFormule: ${d.planName}` };
    }
    case "demande_confirmed": {
      const subject = `Demande confirmée — finalisez votre abonnement`;
      const html = layout(
        "Demande confirmée",
        name,
        `<p style="font-size:14px;color:#334155">Bonne nouvelle ! Votre demande a été <strong style="color:${BRAND}">confirmée</strong>. Connectez-vous à la page de vérification pour finaliser le paiement.</p>
        ${d.activityName ? row("Activité", d.activityName) : ""}`
      );
      return { subject, html, text: subject };
    }
    case "demande_rejected": {
      const subject = `Demande d'abonnement — décision`;
      const html = layout(
        "Décision sur votre demande",
        name,
        `<p style="font-size:14px;color:#334155">Votre demande a été <strong style="color:#dc2626">refusée</strong> par l'administration. Contactez-nous via la messagerie pour plus d'informations.</p>`
      );
      return { subject, html, text: subject };
    }
    case "abonnement_valide":
    case "renouvellement": {
      const isRenew = action === "renouvellement";
      const subject = isRenew
        ? `Renouvellement confirmé — ${d.activityName} (${d.reference})`
        : `Abonnement validé — ${d.activityName} (${d.memberNumber || d.reference})`;
      const html = layout(
        isRenew ? "Renouvellement confirmé" : "Abonnement validé",
        name,
        `<p style="font-size:14px;color:#334155">${isRenew ? "Votre renouvellement a bien été enregistré." : "Votre paiement a réussi et votre abonnement est <strong>validé</strong>."}</p>
        ${d.activityName ? row("Activité", d.activityName) : ""}
        ${d.planName ? row("Formule", d.planName) : ""}
        ${d.amount ? row("Montant", `${d.amount} ${d.currency || "USD"}`) : ""}
        ${d.method ? row("Moyen de paiement", d.method) : ""}
        ${d.reference ? row("Référence", d.reference) : ""}
        ${d.memberNumber ? row("Matricule", d.memberNumber) : ""}
        ${d.startDate ? row("Début", d.startDate) : ""}
        ${d.endDate ? row("Fin", d.endDate) : ""}`
      );
      return { subject, html, text: subject };
    }
    case "achat_equipement": {
      const subject = `Achat confirmé — ${d.reference}`;
      const html = layout(
        "Achat d'équipements",
        name,
        `<p style="font-size:14px;color:#334155">Merci pour votre achat. Voici le récapitulatif :</p>
        ${d.amount ? row("Total", `${d.amount} ${d.currency || "USD"}`) : ""}
        ${d.method ? row("Moyen de paiement", d.method) : ""}
        ${d.reference ? row("Référence", d.reference) : ""}
        ${d.message ? `<p style="font-size:13px;color:#475569">${d.message}</p>` : ""}`
      );
      return { subject, html, text: subject };
    }
    case "message_recu": {
      const subject = d.subject ? `Nouveau message : ${d.subject}` : `Nouveau message de ${d.senderName || "la plateforme"}`;
      const html = layout(
        "Nouveau message",
        name,
        `<p style="font-size:14px;color:#334155"><strong>${d.senderName || "Un expéditeur"}</strong> vous a écrit :</p>
        <div style="background:#f8fafc;border-left:4px solid ${BRAND};padding:12px 16px;border-radius:0 8px 8px 0;font-size:14px;color:#334155">${(d.body || d.message || "").slice(0, 1000)}</div>
        <p style="font-size:13px;color:#64748b">Connectez-vous à votre messagerie pour répondre.</p>`
      );
      return { subject, html, text: subject };
    }
    case "presence": {
      const subject = `Présence enregistrée — ${d.activityName} (${d.date})`;
      const html = layout(
        "Présence",
        name,
        `<p style="font-size:14px;color:#334155">Votre présence a été enregistrée :</p>
        ${d.activityName ? row("Activité", d.activityName) : ""}
        ${d.date ? row("Séance", d.date) : ""}
        ${row("Statut", d.message || "Présent(e)")}`
      );
      return { subject, html, text: subject };
    }
    case "compte_cree": {
      const subject = `Bienvenue sur ${APP_NAME} — votre compte est créé`;
      const html = layout(
        "Bienvenue",
        name,
        `<p style="font-size:14px;color:#334155">Votre compte a été créé avec succès.</p>
        ${d.email ? row("Identifiant", d.email) : ""}
        ${d.memberNumber ? row("Matricule", d.memberNumber) : ""}
        ${d.message ? `<p style="font-size:13px;color:#475569">${d.message}</p>` : ""}`
      );
      return { subject, html, text: subject };
    }
    case "mot_de_passe": {
      const subject = `Mot de passe modifié — sécurité du compte`;
      const html = layout(
        "Sécurité du compte",
        name,
        `<p style="font-size:14px;color:#334155">Votre mot de passe vient d'être <strong>modifié</strong>. Si ce n'est pas vous, contactez immédiatement l'administration.</p>
        ${row("Date", new Date().toLocaleString("fr-FR"))}`
      );
      return { subject, html, text: subject };
    }
    case "profil_modifie": {
      const subject = `Profil mis à jour`;
      const html = layout(
        "Profil",
        name,
        `<p style="font-size:14px;color:#334155">Les informations de votre profil ont été mises à jour.</p>`
      );
      return { subject, html, text: subject };
    }
    case "annonce":
    default: {
      const subject = d.title || d.subject || `Notification — ${APP_NAME}`;
      const html = layout(
        d.title || "Notification",
        name,
        `<p style="font-size:14px;color:#334155">${d.message || d.body || ""}</p>`
      );
      return { subject, html, text: `${subject}\n${d.message || d.body || ""}` };
    }
  }
}
