import { NextResponse } from "next/server";
import { query } from "../../../../lib/server/db";
import { requireAdminSession } from "../../../../lib/server/auth";
import { blogs as builtInBlogs } from "../../../../data/blogData";

export const runtime = "nodejs";

type PublishedArticleRow = {
  id: number;
  title: string;
  slug: string;
  published_at: string;
};

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const [blogs, properties, managedArticles] = await Promise.all([
    query<{ count: number }>("SELECT COUNT(*)::int AS count FROM blogs"),
    query<{ count: number }>("SELECT COUNT(*)::int AS count FROM properties"),
    query<PublishedArticleRow>(
      "SELECT id, title, slug, published_at::text FROM blogs ORDER BY published_at DESC, created_at DESC",
    ),
  ]);

  const publishedArticles = [
    ...managedArticles.rows.map((article) => ({
      id: `managed-${article.id}`,
      title: article.title,
      slug: article.slug,
      publishedAt: article.published_at,
    })),
    ...builtInBlogs.map((article) => ({
      id: `built-in-${article.id}`,
      title: article.title,
      slug: article.slug,
      publishedAt: article.date,
    })),
  ].sort((first, second) => new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime());

  return NextResponse.json({
    blogs: (blogs.rows[0]?.count || 0) + builtInBlogs.length,
    properties: properties.rows[0]?.count || 0,
    publishedArticles,
  });
}
