import { blogs as builtInBlogs, type BlogEntry } from "../../data/blogData";
import { query } from "./db";

interface BlogRow {
  id: number;
  slug: string;
  title: string;
  author: string;
  snippet: string;
  content: string;
  image_url: string;
  published_at: string | Date;
}

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function mapBlog(row: BlogRow): BlogEntry {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author,
    date: formatDate(row.published_at),
    snippet: row.snippet,
    content: row.content,
    image: row.image_url,
    contentFormat: /<\/?[a-z][^>]*>/i.test(row.content) ? "html" : "text",
    managed: true,
  };
}

/** Published articles stored in the database (drafts are left out). */
export async function getManagedBlogs() {
  const result = await query<BlogRow & { is_draft: boolean }>(
    `SELECT id, slug, title, author, snippet, content, image_url, published_at, is_draft
     FROM blogs
     ORDER BY published_at DESC, created_at DESC`,
  );
  return result.rows;
}

export async function getAllBlogs() {
  const rows = await getManagedBlogs();
  // A built-in article that was saved as a draft in the admin stays hidden too.
  const managedSlugs = new Set(rows.map((blog) => blog.slug));
  return [...rows.filter((row) => !row.is_draft).map(mapBlog), ...builtInBlogs.filter((blog) => !managedSlugs.has(blog.slug))];
}

export async function getBlogBySlug(slug: string) {
  const result = await query<BlogRow>(
    `SELECT id, slug, title, author, snippet, content, image_url, published_at, is_draft
     FROM blogs
     WHERE slug = $1
     LIMIT 1`,
    [slug],
  );
  const row = result.rows[0] as (BlogRow & { is_draft: boolean }) | undefined;
  if (row) return row.is_draft ? null : mapBlog(row);

  return builtInBlogs.find((blog) => blog.slug === slug) ?? null;
}

/** Copies the built-in articles into the database once, so they can be edited in the admin. */
export async function ensureBuiltInBlogs() {
  const existing = await query<{ slug: string }>("SELECT slug FROM blogs");
  const existingSlugs = new Set(existing.rows.map((article) => article.slug));
  const missing = builtInBlogs.filter((article) => !existingSlugs.has(article.slug));
  await Promise.all(missing.map((article) =>
    query(
      `INSERT INTO blogs (title, slug, author, snippet, content, image_url, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING`,
      [article.title, article.slug, article.author, article.snippet, article.content, article.image, new Date(article.date).toISOString().slice(0, 10)],
    ),
  ));
}
