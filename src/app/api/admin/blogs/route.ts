import { NextResponse } from "next/server";
import { query } from "../../../../lib/server/db";
import { requireAdminSession } from "../../../../lib/server/auth";
import type { ManagedBlog } from "../../../../lib/api";
import { ensureBuiltInBlogs } from "../../../../lib/server/blogs";
import { blogFields, blogInput } from "../../../../lib/server/blog-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  await ensureBuiltInBlogs();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 9));
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status");
  const values: unknown[] = [];
  const clauses: string[] = [];
  if (search) { values.push(`%${search}%`); clauses.push(`(title ILIKE $${values.length} OR slug ILIKE $${values.length})`); }
  if (status === "draft") clauses.push("is_draft");
  if (status === "published") clauses.push("NOT is_draft");
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [total, counts] = await Promise.all([
    query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM blogs ${where}`, values),
    query<{ published: number; draft: number }>("SELECT COUNT(*) FILTER (WHERE NOT is_draft)::int AS published, COUNT(*) FILTER (WHERE is_draft)::int AS draft FROM blogs"),
  ]);
  values.push(limit, (page - 1) * limit);
  const result = await query<ManagedBlog>(
    `SELECT ${blogFields} FROM blogs ${where} ORDER BY is_draft DESC, published_at DESC, created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  return NextResponse.json({ items: result.rows, pagination: { page, limit, total: total.rows[0]?.count || 0 }, counts: counts.rows[0] ?? { published: 0, draft: 0 } }, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { input, error } = blogInput(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const result = await query<ManagedBlog>(
      `INSERT INTO blogs (title, slug, author, snippet, content, image_url, published_at, is_draft)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${blogFields}`,
      [input.title, input.slug, input.author, input.snippet, input.content, input.image_url, input.published_at, input.is_draft],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "That page address is already in use." }, { status: 409 });
    }
    throw error;
  }
}
