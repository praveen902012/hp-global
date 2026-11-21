import { NextResponse } from "next/server";
import { listPressClippings } from "../../../lib/server/press";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public list of visible press clippings, optionally for one project (?project=Amrit%20Aarogyam). */
export async function GET(request: Request) {
  const project = new URL(request.url).searchParams.get("project")?.slice(0, 120) || undefined;
  return NextResponse.json(await listPressClippings({ enabledOnly: true, project }), { headers: { "Cache-Control": "no-store" } });
}
