import { NextRequest, NextResponse } from "next/server";
import { sendMail, isMailConfigured } from "@/src/lib/mailer";
import type { ImportantAction, TemplateData } from "@/src/lib/emailTemplates";

// POST /api/notify/email
// Body: { to, subject?, html?, text?, action?, data? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text, action, data } = body as {
      to: string;
      subject?: string;
      html?: string;
      text?: string;
      action?: ImportantAction;
      data?: TemplateData;
    };

    if (!to) return NextResponse.json({ error: "Champ 'to' requis." }, { status: 400 });
    if (!action && (!subject || (!html && !text))) {
      return NextResponse.json({ error: "Fournissez 'action' + 'data' ou 'subject' + 'html'/'text'." }, { status: 400 });
    }

    const result = await sendMail({ to, subject, html, text, action, data });
    if (!result.sent) {
      return NextResponse.json({ error: result.error || "Envoi impossible" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, simulated: result.simulated || false, messageId: result.messageId, configured: isMailConfigured() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur serveur" }, { status: 500 });
  }
}

// GET /api/notify/email → état de la config (sans exposer le secret)
export async function GET() {
  return NextResponse.json({
    configured: isMailConfigured(),
    host: process.env.SMTP_HOST || null,
    port: process.env.SMTP_PORT || null,
    user: process.env.SMTP_USER ? `${String(process.env.SMTP_USER).slice(0, 3)}***` : null,
    from: process.env.SMTP_FROM || null,
  });
}
