import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

const publicUser = (user: any) => {
  const { password: _password, ...rest } = user;
  return rest;
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "E-mail et mot de passe requis." }, { status: 400 });
    }
    const user = await prisma.user.findFirst({
      where: { email: { equals: String(email).trim() } },
    });
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
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
