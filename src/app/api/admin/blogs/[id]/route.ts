import { NextResponse } from "next/server";
import { query } from "../../../../../lib/server/db";
import { requireAdminSession } from "../../../../../lib/server/auth";
import { blogFields, blogInput } from "../../../../../lib/server/blog-input";
import type { ManagedBlog } from "../../../../../lib/api";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteProps) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid article ID." }, { status: 400 });
  const result = await query<ManagedBlog>(`SELECT ${blogFields} FROM blogs WHERE id = $1`, [id]);
  if (!result.rows[0]) return NextResponse.json({ error: "Article not found." }, { status: 404 });
  return NextResponse.json(result.rows[0], { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function PUT(request: Request, { params }: RouteProps) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid article ID." }, { status: 400 });

  const { input, error } = blogInput(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const result = await query<ManagedBlog>(
      `UPDATE blogs
       SET title = $1, slug = $2, author = $3, snippet = $4, content = $5,
           image_url = $6, published_at = $7, is_draft = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING ${blogFields}`,
      [input.title, input.slug, input.author, input.snippet, input.content, input.image_url, input.published_at, input.is_draft, id],
    );
    if (!result.rowCount) return NextResponse.json({ error: "Article not found." }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "That page address is already in use." }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid article ID." }, { status: 400 });
  }

  const result = await query("DELETE FROM blogs WHERE id = $1 RETURNING id", [id]);
  if (!result.rowCount) return NextResponse.json({ error: "Article not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
