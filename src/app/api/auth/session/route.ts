import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json(null);
  const user = await prisma.user.findFirst({
    where: { email: { equals: email.trim() } },
  });
  if (!user) return NextResponse.json(null);
  const { password: _password, ...rest } = user;
  return NextResponse.json(rest);
}
