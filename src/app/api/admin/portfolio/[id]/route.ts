import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../lib/server/auth";
import { query } from "../../../../../lib/server/db";
import { getPortfolioProject, portfolioInput, portfolioInputError, savePortfolioProject } from "../../../../../lib/server/portfolio";

interface Props { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Props) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid project." }, { status: 400 });
  const project = await getPortfolioProject(Number(id));
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json(project, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function PUT(request: Request, { params }: Props) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid project." }, { status: 400 });
  const value = portfolioInput(await request.json().catch(() => ({})));
  const error = portfolioInputError(value);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const project = await savePortfolioProject(Number(id), value);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json(project);
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid project." }, { status: 400 });
  const result = await query("DELETE FROM portfolio_projects WHERE id=$1 RETURNING id", [id]);
  if (!result.rowCount) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
