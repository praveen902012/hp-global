import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../lib/server/auth";
import { saveDocument } from "../../../../../lib/server/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("document");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF document to upload." }, { status: 400 });
  try { return NextResponse.json({ document_url: await saveDocument(file), name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload document." }, { status: 400 }); }
}
