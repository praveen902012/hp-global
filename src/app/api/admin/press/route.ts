import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/server/auth";
import { createPressClipping, listPressClippings, listPressProjects } from "../../../../lib/server/press";
import { listPortfolioProjects } from "../../../../lib/server/portfolio";
import { getFeaturedProject } from "../../../../lib/server/featured-project";
import { normalizePressClipping } from "../../../../data/press";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const [items, featured, portfolio, used] = await Promise.all([
    listPressClippings(),
    getFeaturedProject().catch(() => null),
    listPortfolioProjects().catch(() => []),
    listPressProjects(false),
  ]);
  const featuredName = featured ? `${featured.hero.title} ${featured.hero.accentTitle}`.trim() : "";
  const projects = [...new Set([featuredName, ...portfolio.map((project) => project.title), ...used].filter(Boolean))];
  return NextResponse.json({ items, projects, featured_project: featuredName }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const parsed = normalizePressClipping(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  return NextResponse.json(await createPressClipping(parsed.clipping), { status: 201 });
}
