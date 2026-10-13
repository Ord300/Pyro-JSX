import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { hashPassword, verifyPassword } from "@/src/lib/password";
import { setSessionCookie } from "@/src/lib/session";

const publicUser = (user: any) => {
  const { password: _password, ...rest } = user;
  return rest;
};

export async function POST(request: NextRequest) {
  try {
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
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "E-mail et mot de passe requis." }, { status: 400 });
    }
    const clean = String(email).trim().toLowerCase();
    // Insensible à la casse : exact puis minuscules.
    const user =
      (await prisma.user.findFirst({ where: { email: { equals: String(email).trim() } } })) ??
      (await prisma.user.findFirst({ where: { email: { equals: clean } } }));
    if (!user) {
      return NextResponse.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    }
    const check = await verifyPassword(String(password), (user as any).password);
    if (check === "invalid") {
      return NextResponse.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    }
    // Migration transparente : un mot de passe hérité en clair devient un hash.
    if (check === "legacy") {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(String(password)) },
      });
    }
    const fresh = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date().toISOString().slice(0, 10) },
    });
    const response = NextResponse.json(publicUser(fresh));
    setSessionCookie(response, fresh.email);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Connexion impossible" }, { status: 500 });
  }
}
