import { NextRequest, NextResponse } from "next/server";
import {
  ensureSeed,
  listRecords,
  createRecord,
  getStats,
  updateStats,
  replaceTimeSlots,
} from "@/src/lib/dbRegistry";

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
    const data = await request.json();
    const created = await createRecord(resource, data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
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
    return NextResponse.json({ error: "Ressource non remplaçable" }, { status: 405 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Mise à jour impossible" }, { status: 400 });
  }
}
