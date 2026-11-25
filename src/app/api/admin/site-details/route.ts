import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/server/auth";
import { getSiteDetails, saveSiteDetails } from "../../../../lib/server/site-details";
import { normalizeSiteDetails } from "../../../../data/siteDetails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Please sign in again." }, { status: 401 });

export async function GET() {
  if (!await requireAdminSession()) return unauthorized();
  return NextResponse.json(await getSiteDetails(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!await requireAdminSession()) return unauthorized();
  const parsed = normalizeSiteDetails(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  return NextResponse.json(await saveSiteDetails(parsed.details));
}
