import { NextResponse } from "next/server";
import { listPortfolioProjects, toPublicProject } from "../../../lib/server/portfolio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json((await listPortfolioProjects()).map(toPublicProject), { headers: { "Cache-Control": "no-store" } });
}
