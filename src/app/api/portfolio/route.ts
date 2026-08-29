import { NextResponse } from "next/server";
import { listPortfolioProjects } from "../../../lib/server/portfolio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listPortfolioProjects(), { headers: { "Cache-Control": "no-store" } });
}
