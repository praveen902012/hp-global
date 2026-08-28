import { NextResponse } from "next/server";
import { query } from "../../../lib/server/db";
import type { Enquiry } from "../../../lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { name, phone, whatsapp_consent, project_title } = await request.json().catch(() => ({}));

  if (!name || !phone || !project_title) {
    return NextResponse.json({ error: "Name, phone, and project title are required." }, { status: 400 });
  }

  const result = await query<Enquiry>(
    `INSERT INTO enquiries (name, phone, whatsapp_consent, project_title)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, phone, whatsapp_consent, project_title, created_at`,
    [name, phone, Boolean(whatsapp_consent), project_title],
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
