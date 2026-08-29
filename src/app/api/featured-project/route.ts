import { NextResponse } from "next/server";
import { getFeaturedProject } from "../../../lib/server/featured-project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getFeaturedProject(), { headers: { "Cache-Control": "no-store" } });
}
