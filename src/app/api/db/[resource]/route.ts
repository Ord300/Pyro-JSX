import { NextRequest, NextResponse } from "next/server";
import {
  ensureSeed,
  listRecords,
  createRecord,
  getStats,
  updateStats,
  replaceTimeSlots,
  replaceGallery,
} from "@/src/lib/dbRegistry";
import { sendMail } from "@/src/lib/mailer";
import { prisma } from "@/src/lib/prisma";

function adminEmail(): string {
  // Aucune adresse personnelle en dur : sans ADMIN_EMAIL/SMTP_USER configuré, pas d'alerte admin.
  return (process.env.ADMIN_EMAIL || process.env.SMTP_USER || "").trim();
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  try {
    if (resource === "stats") return NextResponse.json(await getStats());
    await ensureSeed();
    const items = await listRecords(resource);
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erreur base de données" }, { status: 400 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  try {
    await ensureSeed();
    // Lecture sûre du corps : un corps vide/invalide donne une 400 explicite, jamais un 500 opaque.
    const rawBody = await request.text();
    if (!rawBody.trim()) {
      console.error(`[API-DB] POST ${resource} — corps de requête vide`);
      return NextResponse.json({ error: "Corps de requête vide." }, { status: 400 });
    }
    let data: any;
    try {
      data = JSON.parse(rawBody);
    } catch {
      console.error(`[API-DB] POST ${resource} — corps JSON invalide`);
      return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
    }
    const created = await createRecord(resource, data);
    // Notifications automatiques à chaque Inscription — sans bloquer la réponse.
    // Source unique de vérité (serveur) : e-mail + notif in-app pour le demandeur ET pour l'admin.
    if (resource === "subscriptionRequests") {
      const admin = adminEmail();
      const requesterEmail = String((created as any)?.email || "").trim();
      const requesterName = (created as any)?.userName || (created as any)?.name || "";
      const payload = {
        name: requesterName,
        email: requesterEmail,
        phone: (created as any)?.phone || "",
        activityName: (created as any)?.activityName || "",
        planName: (created as any)?.planName || "",
      };
      const now = new Date().toISOString();
      // 1) E-mail de confirmation au demandeur (avec logs serveur visibles dans le terminal)
      if (requesterEmail.includes("@")) {
        let mailSent = false;
        try {
          const r = await sendMail({ to: requesterEmail, action: "demande_created", data: payload });
          mailSent = r.sent && !r.simulated;
          if (!r.sent) console.error("[DEMANDE] e-mail demandeur ÉCHEC:", r.error);
          else if (r.simulated) console.log("[DEMANDE] e-mail demandeur SIMULÉ (SMTP non configuré).");
        } catch (e: any) {
          console.error("[DEMANDE] e-mail demandeur ERREUR:", e?.message || e);
        }
        // Message honnête : on ne prétend l'e-mail que s'il est vraiment parti.
        const confirmMsg = mailSent
          ? `Votre Inscription ${payload.activityName ? `« ${payload.activityName} »` : ""} ${payload.planName ? `(${payload.planName})` : ""} a été envoyée. Un e-mail de confirmation vous a été adressé.`.trim()
          : `Votre Inscription ${payload.activityName ? `« ${payload.activityName} »` : ""} ${payload.planName ? `(${payload.planName})` : ""} a été envoyée et enregistrée. (Envoi e-mail non configuré : suivi disponible dans vos notifications.)`.trim();
        prisma.notification
          .create({
            data: {
              userEmail: requesterEmail.toLowerCase(),
              title: "Demande envoyée",
              message: confirmMsg,
              type: "info",
              audience: "Suivi de demande",
              createdAt: now,
              read: false,
            },
          })
          .catch(() => {});
      } else {
        console.error("[DEMANDE] pas d'e-mail demandeur — adresse manquante:", JSON.stringify((created as any)?.email));
      }
      // 2) Alerte admin (seulement si configuré)
      if (admin.includes("@")) {
      sendMail({ to: admin, action: "nouvelle_demande_admin", data: payload })
        .then((r) => {
          if (!r.sent) console.error("[DEMANDE] e-mail admin ÉCHEC:", r.error);
        })
        .catch((e) => console.error("[DEMANDE] e-mail admin ERREUR:", e?.message || e));
      prisma.notification
        .create({
          data: {
            userEmail: admin.toLowerCase(),
            title: "Nouvelle Inscription",
            message: `${payload.name} <${payload.email}> — ${payload.activityName} ${payload.planName ? `(${payload.planName})` : ""}`.trim(),
            type: "info",
            audience: "Admin",
            createdAt: now,
            read: false,
          },
        })
        .catch(() => {});
      } else {
        console.error("[DEMANDE] alerte admin ignorée : ADMIN_EMAIL/SMTP_USER non configuré.");
      }
    }
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error(`[API-DB] POST ${resource} — échec:`, error?.message || error);
    return NextResponse.json({ error: error?.message || "Création impossible" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  try {
    const data = await request.json();
    if (resource === "stats") return NextResponse.json(await updateStats(data));
    if (resource === "timeSlots") {
      await replaceTimeSlots(Array.isArray(data) ? data : []);
      return NextResponse.json({ ok: true });
    }
    if (resource === "gallery") {
      await replaceGallery(Array.isArray(data) ? data : []);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Ressource non remplaçable" }, { status: 405 });
  } catch (error: any) {
    console.error(`[API-DB] PUT ${resource} — échec:`, error?.message || error);
    return NextResponse.json({ error: error?.message || "Mise à jour impossible" }, { status: 400 });
  }
}
