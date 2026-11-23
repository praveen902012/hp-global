import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/server/auth";
import { query } from "../../../../lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Badge counts for the admin sidebar. */
export async function GET() {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const result = await query<{ enquiries: number; contacts: number }>(
    `SELECT (SELECT COUNT(*)::int FROM enquiries WHERE status = 'new') AS enquiries,
            (SELECT COUNT(*)::int FROM contact_requests WHERE read_at IS NULL) AS contacts`,
  );
  return NextResponse.json(result.rows[0] ?? { enquiries: 0, contacts: 0 }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
