import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { hashPassword, verifyPassword } from "@/src/lib/password";
import { sessionEmailFrom } from "@/src/lib/session";

// Changement de mot de passe : identité prouvée par la session,
// ancien mot de passe vérifié côté serveur, nouveau stocké hashé.
export async function POST(request: NextRequest) {
  try {
    const email = sessionEmailFrom(request);
    if (!email) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    const rawBody = await request.text();
    if (!rawBody.trim()) {
      return NextResponse.json({ error: "Corps de requête vide." }, { status: 400 });
    }
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
    }
    const { currentPassword, newPassword } = body;
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }
    const user = await prisma.user.findFirst({ where: { email: { equals: email } } });
    if (!user) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    const check = await verifyPassword(String(currentPassword ?? ""), (user as any).password);
    if (check === "invalid") {
      return NextResponse.json({ error: "L'ancien mot de passe est incorrect." }, { status: 403 });
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword), mustChangePassword: false },
    });
    const { password: _password, ...rest } = updated;
    return NextResponse.json(rest);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Changement impossible" }, { status: 500 });
  }
}
