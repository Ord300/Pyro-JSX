import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// ============================================================
// CONNEXION PAR QR CARTE — POST { token }
// Le token (cardToken) est unique par abonnement validé.
// ============================================================

const publicUser = (user: any) => {
  const { password: _password, ...rest } = user;
  return rest;
};

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Code QR manquant ou invalide." }, { status: 400 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { cardToken: token.trim() },
    });
    if (!subscription) {
      return NextResponse.json({ error: "Carte inconnue. Demandez une nouvelle carte depuis votre abonnement." }, { status: 404 });
    }
    if (subscription.status !== "Validée") {
      return NextResponse.json({ error: "Cet abonnement n'est pas actif." }, { status: 403 });
    }
    if (subscription.endDate && subscription.endDate < new Date().toISOString().slice(0, 10)) {
      return NextResponse.json({ error: "Cet abonnement a expiré. Renouvelez-le pour vous reconnecter." }, { status: 403 });
    }
    if (!subscription.email) {
      return NextResponse.json({ error: "Aucun compte lié à cette carte." }, { status: 404 });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: subscription.email.trim() } },
    });
    if (!user) {
      return NextResponse.json({ error: "Compte introuvable. Contactez le centre." }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date().toISOString().slice(0, 10) },
    });
    return NextResponse.json(publicUser(user));
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Connexion impossible" }, { status: 500 });
  }
}
