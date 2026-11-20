import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/server/auth";
import { getSiteMenu, saveSiteMenu } from "../../../../lib/server/site-menu";
import { normalizeSiteMenu } from "../../../../data/siteMenu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  return NextResponse.json(await getSiteMenu(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const parsed = normalizeSiteMenu(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  return NextResponse.json(await saveSiteMenu(parsed.menu));
}
