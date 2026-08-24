import { NextRequest, NextResponse } from "next/server";
import { ensureSeed, getRecord, updateRecord, deleteRecord } from "@/src/lib/dbRegistry";

type Params = { params: Promise<{ resource: string; id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { resource, id } = await params;
  try {
    await ensureSeed();
    const record = await getRecord(resource, id);
    if (!record) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erreur base de données" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { resource, id } = await params;
  try {
    const data = await request.json();
    const updated = await updateRecord(resource, id, data);
    if (!updated) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Mise à jour impossible" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { resource, id } = await params;
  try {
    const ok = await deleteRecord(resource, id);
    if (!ok) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Suppression impossible" }, { status: 400 });
  }
}
