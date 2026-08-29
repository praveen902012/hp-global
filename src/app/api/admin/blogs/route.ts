import { NextResponse } from "next/server";
import { query } from "../../../../lib/server/db";
import { requireAdminSession } from "../../../../lib/server/auth";
import type { ManagedBlog } from "../../../../lib/api";
import { blogs as builtInBlogs } from "../../../../data/blogData";
import { sanitizeArticleHtml } from "../../../../lib/server/article-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const existing = await query<{ slug: string }>("SELECT slug FROM blogs");
  const existingSlugs = new Set(existing.rows.map((article) => article.slug));
  const missingBuiltInArticles = builtInBlogs.filter((article) => !existingSlugs.has(article.slug));

  if (missingBuiltInArticles.length) {
    await Promise.all(missingBuiltInArticles.map((article) =>
      query(
        `INSERT INTO blogs (title, slug, author, snippet, content, image_url, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          article.title,
          article.slug,
          article.author,
          article.snippet,
          article.content,
          article.image,
          new Date(article.date).toISOString().slice(0, 10),
        ],
      ),
    ));
  }

  const result = await query<ManagedBlog>(
    `SELECT ${blogFields} FROM blogs ORDER BY published_at DESC, created_at DESC`,
  );
  return NextResponse.json(result.rows, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

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
  if (!isHttpUrl(input.image_url)) {
    return NextResponse.json({ error: "Cover image must be a valid HTTP or HTTPS URL." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.published_at)) {
    return NextResponse.json({ error: "Publish date is invalid." }, { status: 400 });
  }

  try {
    const result = await query<ManagedBlog>(
      `INSERT INTO blogs (title, slug, author, snippet, content, image_url, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${blogFields}`,
      [input.title, input.slug, input.author, input.snippet, input.content, input.image_url, input.published_at],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "That URL slug is already in use." }, { status: 409 });
    }
    throw error;
  }
}
