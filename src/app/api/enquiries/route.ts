import { NextResponse } from "next/server";
import { query } from "../../../lib/server/db";
import type { Enquiry } from "../../../lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { name, phone, whatsapp_consent, project_title, source } = await request.json().catch(() => ({}));

  if (!name || !phone || !project_title) {
    return NextResponse.json({ error: "Name, phone, and project title are required." }, { status: 400 });
  }

  // The page the visitor sent the form from, e.g. "/projects/amrit-aarogyam".
  const page = typeof source === "string" && source.startsWith("/") ? source.slice(0, 200) : "";

  const result = await query<Enquiry>(
    `INSERT INTO enquiries (name, phone, whatsapp_consent, project_title, source)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, phone, whatsapp_consent, project_title, source, status, notes, created_at`,
    [name, phone, Boolean(whatsapp_consent), project_title, page],
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
