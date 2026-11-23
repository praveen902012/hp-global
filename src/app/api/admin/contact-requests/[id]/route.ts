import { NextResponse } from "next/server";
import { query } from "../../../../../lib/server/db";
import { requireAdminSession } from "../../../../../lib/server/auth";
import type { ContactRequest } from "../../../../../lib/api";

export const runtime = "nodejs";

interface Props { params: Promise<{ id: string }> }

/** Marks a contact request as read ({ read: true }) or unread ({ read: false }). */
export async function PATCH(request: Request, { params }: Props) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  const { read } = await request.json().catch(() => ({}));
  const result = await query<ContactRequest>(
    `UPDATE contact_requests SET read_at = CASE WHEN $1 THEN COALESCE(read_at, NOW()) ELSE NULL END
     WHERE id = $2 RETURNING id, name, email, message, read_at, created_at`,
    [read !== false, id],
  );
  if (!result.rowCount) return NextResponse.json({ error: "Message not found." }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  const result = await query("DELETE FROM contact_requests WHERE id = $1 RETURNING id", [id]);
  if (!result.rowCount) return NextResponse.json({ error: "Message not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
