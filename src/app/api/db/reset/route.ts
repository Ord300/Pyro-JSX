import { NextResponse } from "next/server";
import { resetDatabase } from "@/src/lib/dbRegistry";

export async function POST() {
  try {
    await resetDatabase();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Réinitialisation impossible" }, { status: 500 });
  }
}
