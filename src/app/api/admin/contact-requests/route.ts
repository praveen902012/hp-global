import { NextResponse } from "next/server";
import { query } from "../../../../lib/server/db";
import { requireAdminSession } from "../../../../lib/server/auth";
import type { ContactRequest } from "../../../../lib/api";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const result = await query<ContactRequest>(
    `SELECT id, name, email, message, created_at
     FROM contact_requests
     ORDER BY created_at DESC`,
  );

  return NextResponse.json(result.rows);
}
