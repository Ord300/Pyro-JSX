// ============================================================
// MAILER SERVEUR — Nodemailer + Gmail SMTP (App Password)
// Variables requises dans .env :
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=votre.email@gmail.com
//   SMTP_PASS=xxxx xxxx xxxx xxxx  (mot de passe d'application)
//   SMTP_FROM="MoveUp Centre Sportif <votre.email@gmail.com>"
// ============================================================

import nodemailer from "nodemailer";
import { buildEmail, type ImportantAction, type TemplateData } from "@/src/lib/emailTemplates";

let transporter: nodemailer.Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465, // true pour 465, false pour 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export interface SendMailInput {
  to: string;
  subject?: string;
  html?: string;
  text?: string;
  action?: ImportantAction;
  data?: TemplateData;
}

export async function sendMail({ to, subject, html, text, action, data }: SendMailInput): Promise<{ sent: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const dest = (to || "").trim();
  if (!dest || !dest.includes("@")) {
    return { sent: false, error: "Adresse e-mail destinataire invalide" };
  }

  // Construit le contenu depuis le template si action fournie
  let finalSubject = subject;
  let finalHtml = html;
  let finalText = text;
  if (action) {
    const built = buildEmail(action, data || {});
    finalSubject = finalSubject || built.subject;
    finalHtml = finalHtml || built.html;
    finalText = finalText || built.text;
  }
  if (!finalSubject || !finalHtml) {
    return { sent: false, error: "Sujet ou contenu manquant" };
  }

  // Mode démo : pas de SMTP configuré → on logue sans envoyer
  if (!isMailConfigured()) {
    console.log(`[MAIL-SIMULÉ] To=${dest} | Subject=${finalSubject}`);
    return { sent: true, simulated: true, messageId: `simulated-${Date.now()}` };
  }

  try {
    const tx = getTransporter();
    const info = await tx.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: dest,
      subject: finalSubject,
      html: finalHtml,
      text: finalText,
    });
    console.log(`[MAIL-ENVOYÉ] To=${dest} | Subject=${finalSubject} | id=${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (e: any) {
    console.error("[MAIL-ERREUR]", e?.message || e);
    return { sent: false, error: e?.message || "Envoi impossible" };
  }
}
