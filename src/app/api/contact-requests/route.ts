import { NextResponse } from "next/server";
import { query } from "../../../lib/server/db";
import type { ContactRequest } from "../../../lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { name, email, message } = await request.json().catch(() => ({}));

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const result = await query<ContactRequest>(
    `INSERT INTO contact_requests (name, email, message)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, message, created_at`,
    [name, email, message],
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
