import { NextResponse } from "next/server";
import { query } from "../../../../lib/server/db";
import { requireAdminSession } from "../../../../lib/server/auth";
import type { Enquiry } from "../../../../lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const result = await query<Enquiry>(
    `SELECT id, name, phone, whatsapp_consent, project_title, source, status, notes, created_at
     FROM enquiries
     ORDER BY created_at DESC`,
  );

  return NextResponse.json(result.rows, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
