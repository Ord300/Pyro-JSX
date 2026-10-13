import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sessionEmailFrom } from "@/src/lib/session";

// Session = cookie httpOnly signé. Sans jeton valide : 401 (pas de compte).
export async function GET(request: NextRequest) {
  try {
    const email = sessionEmailFrom(request);
    if (!email) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    const user = await prisma.user.findFirst({
      where: { email: { equals: email } },
    });
    if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    const { password: _password, ...rest } = user;
    return NextResponse.json(rest);
  } catch {
    return NextResponse.json({ error: "Session illisible." }, { status: 500 });
  }
}
