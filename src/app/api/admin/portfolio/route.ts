import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/server/auth";
import { listPortfolioProjectPage, portfolioInput, portfolioInputError, savePortfolioProject } from "../../../../lib/server/portfolio";

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
  const value = portfolioInput(await request.json().catch(() => ({})));
  const error = portfolioInputError(value);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json(await savePortfolioProject(null, value), { status: 201 });
}
