import { NextRequest, NextResponse } from "next/server";
import { sendMail, isMailConfigured } from "@/src/lib/mailer";
import { buildEmail } from "@/src/lib/emailTemplates";
import type { ImportantAction, TemplateData } from "@/src/lib/emailTemplates";
import { prisma } from "@/src/lib/prisma";

// Actions de paiement confirmées : e-mail au payeur + copie à l'admin.
// POST /api/notify/payment
// Body: { action: "abonnement_valide" | "renouvellement" | "achat_equipement", data: { email, name, ... } }
const PAYMENT_ACTIONS: ImportantAction[] = ["abonnement_valide", "renouvellement", "achat_equipement"];

function adminEmail(): string {
  return (process.env.ADMIN_EMAIL || process.env.SMTP_USER || "ordidimbi@gmail.com").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body as { action: ImportantAction; data: TemplateData & { email?: string; name?: string } };

    if (!action || !PAYMENT_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Action de paiement invalide." }, { status: 400 });
    }
    const payerEmail = String(data?.email || "").trim();
    if (!payerEmail.includes("@")) {
      console.error("[PAYMENT-MAIL] adresse payeur manquante/invalide");
      return NextResponse.json({ error: "Adresse e-mail du payeur requise." }, { status: 400 });
    }

    const built = buildEmail(action, data || {});
    const admin = adminEmail();
    const now = new Date().toISOString();

    // 1) E-mail de confirmation au payeur
    const payerResult = await sendMail({ to: payerEmail, subject: built.subject, html: built.html, text: built.text });

    // 2) Copie à l'admin (même contenu, objet préfixé)
    let adminResult = { sent: false, error: "non tenté" } as { sent: boolean; messageId?: string; error?: string };
    if (admin.toLowerCase() !== payerEmail.toLowerCase()) {
      adminResult = await sendMail({
        to: admin,
        subject: `[Admin] ${built.subject}`,
        html: built.html,
        text: `Copie admin — paiement de ${data?.name || payerEmail} <${payerEmail}>\n\n${built.text}`,
      });
    } else {
      // Le payeur EST l'admin : un seul envoi suffit.
      adminResult = { sent: true, messageId: payerResult.messageId };
    }

    // 3) Notification in-app pour l'admin (le payeur a déjà la sienne côté client)
    prisma.notification
      .create({
        data: {
          userEmail: admin.toLowerCase(),
          title: `Paiement reçu — ${data?.name || payerEmail}`,
          message: `${built.subject} — ${data?.amount || ""} ${data?.currency || "USD"} (${data?.method || ""})`.trim(),
          type: "success",
          audience: "Admin",
          createdAt: now,
          read: false,
        },
      })
      .catch(() => {});

    if (!payerResult.sent) console.error("[PAYMENT-MAIL] échec payeur:", payerResult.error);
    if (!adminResult.sent) console.error("[PAYMENT-MAIL] échec admin:", adminResult.error);

    console.log(`[PAYMENT-MAIL] action=${action} payeur=${payerEmail} ok=${payerResult.sent} admin=${admin} ok=${adminResult.sent} smtp=${isMailConfigured()}`);
    return NextResponse.json({ ok: true, payerSent: payerResult.sent, adminSent: adminResult.sent, simulated: payerResult.simulated || false });
  } catch (e: any) {
    console.error("[PAYMENT-MAIL] erreur:", e?.message || e);
    return NextResponse.json({ error: e?.message || "Erreur serveur" }, { status: 500 });
  }
}
