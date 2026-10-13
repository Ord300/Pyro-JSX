import { NextRequest, NextResponse } from "next/server";
import { resetDatabase } from "@/src/lib/dbRegistry";
import { sessionEmailFrom } from "@/src/lib/session";
import { prisma } from "@/src/lib/prisma";

// Destructif : réservé à un Gestionnaire authentifié (session signée).
export async function POST(request: NextRequest) {
  try {
    const email = sessionEmailFrom(request);
    if (!email) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    const user = await prisma.user.findFirst({ where: { email: { equals: email } } });
    if (!user || user.role !== "Gestionnaire") {
      return NextResponse.json({ error: "Accès réservé à l'administration." }, { status: 403 });
    }
    await resetDatabase();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Réinitialisation impossible" }, { status: 500 });
  }
}
