import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/server/auth";
import { listPortfolioProjectPage, type PortfolioCategory, type PortfolioProject, type ProjectType } from "../../../../lib/server/portfolio";
import { query } from "../../../../lib/server/db";

function input(body: Record<string, unknown>) {
  const portfolio_category = String(body.portfolio_category || "") as PortfolioCategory;
  const project_type = String(body.project_type || "") as ProjectType;
  const tags = Array.isArray(body.tags) ? body.tags.map(String).filter(Boolean) : String(body.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
  return { portfolio_category, project_type, title: String(body.title || "").trim(), location: String(body.location || "").trim(), description: String(body.description || "").trim(), price: String(body.price || "").trim(), image_url: String(body.image_url || "").trim(), tags, sort_order: Number(body.sort_order || 0), is_enabled: body.is_enabled !== false };
}
function valid(value: ReturnType<typeof input>) { return ["hpg", "partner"].includes(value.portfolio_category) && ["commercial", "residential"].includes(value.project_type) && value.title && value.location && value.description && value.image_url && Number.isFinite(value.sort_order); }

export async function GET(request: Request) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 9));
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  return NextResponse.json(await listPortfolioProjectPage({
    page, limit, search: searchParams.get("search")?.trim() || undefined,
    category: category === "hpg" || category === "partner" ? category : undefined,
    type: type === "commercial" || type === "residential" ? type : undefined,
  }));
}
export async function POST(request: Request) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const value = input(await request.json().catch(() => ({})));
  if (!valid(value)) return NextResponse.json({ error: "Complete all required project fields." }, { status: 400 });
  const result = await query<PortfolioProject>(`INSERT INTO portfolio_projects (portfolio_category, project_type, title, location, description, price, image_url, tags, sort_order, is_enabled) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, portfolio_category, project_type, title, location, description, price, image_url, tags, sort_order, is_enabled`, Object.values(value));
  return NextResponse.json(result.rows[0], { status: 201 });
}
