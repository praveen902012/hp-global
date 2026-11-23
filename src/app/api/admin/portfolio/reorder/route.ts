import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../lib/server/auth";
import { query } from "../../../../../lib/server/db";

export const runtime = "nodejs";

/** Saves a new display order: { ids: [3, 1, 2] } sets sort_order 1, 2, 3 in that order. */
export async function POST(request: Request) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { ids } = await request.json().catch(() => ({}));
  if (!Array.isArray(ids) || !ids.length || ids.length > 500 || !ids.every((id) => Number.isInteger(id) && id > 0)) {
    return NextResponse.json({ error: "Invalid project order." }, { status: 400 });
  }
  await query(
    `UPDATE portfolio_projects AS p SET sort_order = o.position, updated_at = NOW()
     FROM unnest($1::bigint[]) WITH ORDINALITY AS o(id, position)
     WHERE p.id = o.id`,
    [ids],
  );
  return NextResponse.json({ ok: true });
}
