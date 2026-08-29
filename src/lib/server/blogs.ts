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

export async function getManagedBlogs() {
  const result = await query<BlogRow>(
    `SELECT id, slug, title, author, snippet, content, image_url, published_at
     FROM blogs
     ORDER BY published_at DESC, created_at DESC`,
  );
  return result.rows.map(mapBlog);
}

export async function getAllBlogs() {
  const managedBlogs = await getManagedBlogs();
  const managedSlugs = new Set(managedBlogs.map((blog) => blog.slug));
  return [...managedBlogs, ...builtInBlogs.filter((blog) => !managedSlugs.has(blog.slug))];
}

export async function getBlogBySlug(slug: string) {
  const result = await query<BlogRow>(
    `SELECT id, slug, title, author, snippet, content, image_url, published_at
     FROM blogs
     WHERE slug = $1
     LIMIT 1`,
    [slug],
  );
  if (result.rows[0]) return mapBlog(result.rows[0]);

  return builtInBlogs.find((blog) => blog.slug === slug) ?? null;
}
