import { NextResponse } from "next/server";
import { query } from "../../../../../lib/server/db";
import { requireAdminSession } from "../../../../../lib/server/auth";
import type { Enquiry } from "../../../../../lib/api";

export const runtime = "nodejs";

interface Props { params: Promise<{ id: string }> }
const STATUSES = ["new", "contacted", "closed"];

/** Updates an enquiry's status and/or private notes. */
export async function PATCH(request: Request, { params }: Props) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid enquiry." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const status = body.status === undefined ? null : String(body.status);
  const notes = body.notes === undefined ? null : String(body.notes).slice(0, 4000);
  if (status !== null && !STATUSES.includes(status)) return NextResponse.json({ error: "Choose New, Contacted or Closed." }, { status: 400 });

  const result = await query<Enquiry>(
    `UPDATE enquiries SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
     WHERE id = $3
     RETURNING id, name, phone, whatsapp_consent, project_title, source, status, notes, created_at`,
    [status, notes, id],
  );
  if (!result.rowCount) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid enquiry." }, { status: 400 });
  const result = await query("DELETE FROM enquiries WHERE id = $1 RETURNING id", [id]);
  if (!result.rowCount) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
