import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/server/auth";
import { createPage, listPages, PageConflictError } from "../../../../lib/server/pages";
import { PAGE_LIMITS, slugError } from "../../../../data/pages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Please sign in again." }, { status: 401 });

export async function GET() {
  if (!await requireAdminSession()) return unauthorized();
  return NextResponse.json(await listPages(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!await requireAdminSession()) return unauthorized();
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const title = String(body.title ?? "").trim();
  const slug = String(body.slug ?? "").trim().toLowerCase();
  if (!title) return NextResponse.json({ error: "Enter a page title." }, { status: 400 });
  if (title.length > PAGE_LIMITS.title) return NextResponse.json({ error: `The title must be ${PAGE_LIMITS.title} characters or fewer.` }, { status: 400 });
  const problem = slugError(slug);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  try {
    return NextResponse.json(await createPage(title, slug), { status: 201 });
  } catch (error) {
    if (error instanceof PageConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    throw error;
  }
}
