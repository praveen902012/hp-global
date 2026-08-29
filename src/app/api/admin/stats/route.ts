import { NextResponse } from "next/server";
import { query } from "../../../../lib/server/db";
import { requireAdminSession } from "../../../../lib/server/auth";
import { blogs as builtInBlogs } from "../../../../data/blogData";
import { ensurePortfolioSeed } from "../../../../lib/server/portfolio";

export const runtime = "nodejs";

type PublishedArticleRow = {
  id: number;
  title: string;
  slug: string;
  published_at: string;
};

type PortfolioCategoryRow = {
  portfolio_category: "hpg" | "partner";
  count: number;
};

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  await ensurePortfolioSeed();

  const [blogs, properties, portfolioCategories, managedArticles] = await Promise.all([
    query<{ count: number }>("SELECT COUNT(*)::int AS count FROM blogs"),
    query<{ count: number }>("SELECT COUNT(*)::int AS count FROM portfolio_projects"),
    query<PortfolioCategoryRow>("SELECT portfolio_category, COUNT(*)::int AS count FROM portfolio_projects GROUP BY portfolio_category"),
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
    portfolioCategories: portfolioCategories.rows.reduce((counts, row) => ({ ...counts, [row.portfolio_category]: row.count }), { hpg: 0, partner: 0 }),
    publishedArticles,
  });
}
