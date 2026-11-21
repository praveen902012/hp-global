import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../lib/server/auth";
import { deletePressClipping, updatePressClipping } from "../../../../../lib/server/press";
import { normalizePressClipping } from "../../../../../data/press";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ error: "Clipping not found." }, { status: 404 });

export async function PUT(request: Request, { params }: Props) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return notFound();
  const parsed = normalizePressClipping(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const clipping = await updatePressClipping(Number(id), parsed.clipping);
  return clipping ? NextResponse.json(clipping) : notFound();
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id) || !await deletePressClipping(Number(id))) return notFound();
  return NextResponse.json({ ok: true });
}
