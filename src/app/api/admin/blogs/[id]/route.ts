import { NextResponse } from "next/server";
import { query } from "../../../../../lib/server/db";
import { requireAdminSession } from "../../../../../lib/server/auth";
import { sanitizeArticleHtml } from "../../../../../lib/server/article-content";
import type { ManagedBlog } from "../../../../../lib/api";

interface RouteProps {
  params: Promise<{ id: string }>;
}

const blogFields = `id, title, slug, author, snippet, content, image_url,
  published_at::text, created_at`;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PUT(request: Request, { params }: RouteProps) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid article ID." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const input = {
    title: String(body.title || "").trim(),
    slug: String(body.slug || "").trim().toLowerCase(),
    author: String(body.author || "").trim(),
    snippet: String(body.snippet || "").trim(),
    content: sanitizeArticleHtml(String(body.content || "")),
    image_url: String(body.image_url || "").trim(),
    published_at: String(body.published_at || "").trim(),
  };

  if (Object.values(input).some((value) => !value)) {
    return NextResponse.json({ error: "All article fields are required." }, { status: 400 });
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    return NextResponse.json({ error: "The URL slug may only contain lowercase letters, numbers, and hyphens." }, { status: 400 });
  }
  if (!isHttpUrl(input.image_url) || !/^\d{4}-\d{2}-\d{2}$/.test(input.published_at)) {
    return NextResponse.json({ error: "Cover image URL or publish date is invalid." }, { status: 400 });
  }

  try {
    const result = await query<ManagedBlog>(
      `UPDATE blogs
       SET title = $1, slug = $2, author = $3, snippet = $4, content = $5,
           image_url = $6, published_at = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING ${blogFields}`,
      [input.title, input.slug, input.author, input.snippet, input.content, input.image_url, input.published_at, id],
    );
    if (!result.rowCount) return NextResponse.json({ error: "Article not found." }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "That URL slug is already in use." }, { status: 409 });
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
