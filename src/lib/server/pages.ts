import { type PageContent, type PageSection, type PageSummary, type SitePage, starterSections, systemPageByKey, systemPages } from "../../data/pages";
import { query } from "./db";

interface PageRow {
  id: string | number;
  slug: string;
  title: string;
  meta_description: string;
  sections: PageSection[];
  status: "draft" | "published";
  system_key: string | null;
  published_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

const iso = (value: Date | string | null) => (value === null ? null : new Date(value).toISOString());
const columns = "id, slug, title, meta_description, sections, status, system_key, published_at, created_at, updated_at";

function mapPage(row: PageRow): SitePage {
  return {
    id: Number(row.id), slug: row.slug, title: row.title, meta_description: row.meta_description,
    sections: Array.isArray(row.sections) ? row.sections : [], status: row.status, system_key: row.system_key ?? null,
    published_at: iso(row.published_at), created_at: iso(row.created_at)!, updated_at: iso(row.updated_at)!,
  };
}

export class PageConflictError extends Error {}

function rethrowUnique(error: unknown, slug: string): never {
  if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "23505") {
    throw new PageConflictError(`Another page already uses the URL "/${slug}".`);
  }
  throw error;
}

/**
 * Creates the editable records for built-in site pages (e.g. Our Story) the first time,
 * pre-filled with the page's original content. Safe to call repeatedly.
 */
let systemPagesReady: Promise<void> | null = null;
export function ensureSystemPages() {
  systemPagesReady ??= (async () => {
    for (const page of systemPages) {
      await query(
        `INSERT INTO pages (title, slug, meta_description, sections, status, system_key, published_at)
         VALUES ($1, $2, $3, $4, 'published', $5, NOW())
         ON CONFLICT DO NOTHING`,
        [page.title, page.slug, page.meta_description, JSON.stringify(page.sections()), page.key],
      );
    }
  })().catch((error) => { systemPagesReady = null; throw error; });
  return systemPagesReady;
}

/** The stored content of a built-in site page, or null if it hasn't been created yet. */
export async function getSystemPage(key: string) {
  if (!systemPageByKey(key)) return null;
  const result = await query<PageRow>(`SELECT ${columns} FROM pages WHERE system_key = $1`, [key]);
  return result.rows[0] ? mapPage(result.rows[0]) : null;
}

export async function listPages(): Promise<PageSummary[]> {
  await ensureSystemPages();
  const result = await query<PageRow & { section_count: number }>(
    `SELECT id, slug, title, status, system_key, published_at, created_at, updated_at, jsonb_array_length(sections)::int AS section_count
     FROM pages ORDER BY (system_key IS NULL), updated_at DESC`,
  );
  return result.rows.map((row) => ({
    id: Number(row.id), slug: row.slug, title: row.title, status: row.status, system_key: row.system_key ?? null, section_count: row.section_count,
    published_at: iso(row.published_at), created_at: iso(row.created_at)!, updated_at: iso(row.updated_at)!,
  }));
}

export async function getPageById(id: number) {
  const result = await query<PageRow>(`SELECT ${columns} FROM pages WHERE id = $1`, [id]);
  return result.rows[0] ? mapPage(result.rows[0]) : null;
}

export async function getPageBySlug(slug: string) {
  const result = await query<PageRow>(`SELECT ${columns} FROM pages WHERE slug = $1`, [slug]);
  return result.rows[0] ? mapPage(result.rows[0]) : null;
}

export async function createPage(title: string, slug: string) {
  try {
    const result = await query<PageRow>(
      `INSERT INTO pages (title, slug, sections) VALUES ($1, $2, $3) RETURNING ${columns}`,
      [title, slug, JSON.stringify(starterSections().map((section, index) => index === 0 && section.type === "hero" ? { ...section, title } : section))],
    );
    return mapPage(result.rows[0]);
  } catch (error) {
    rethrowUnique(error, slug);
  }
}

export async function updatePage(id: number, content: PageContent) {
  try {
    const result = await query<PageRow>(
      `UPDATE pages SET title = $1, slug = $2, meta_description = $3, sections = $4, updated_at = NOW() WHERE id = $5 RETURNING ${columns}`,
      [content.title, content.slug, content.meta_description, JSON.stringify(content.sections), id],
    );
    return result.rows[0] ? mapPage(result.rows[0]) : null;
  } catch (error) {
    rethrowUnique(error, content.slug);
  }
}

export async function setPageStatus(id: number, published: boolean) {
  const result = await query<PageRow>(
    `UPDATE pages SET status = $1, published_at = CASE WHEN $1 = 'published' THEN COALESCE(published_at, NOW()) ELSE published_at END, updated_at = NOW()
     WHERE id = $2 RETURNING ${columns}`,
    [published ? "published" : "draft", id],
  );
  return result.rows[0] ? mapPage(result.rows[0]) : null;
}

export async function deletePage(id: number) {
  const result = await query<{ slug: string }>("DELETE FROM pages WHERE id = $1 RETURNING slug", [id]);
  return result.rows[0]?.slug ?? null;
}
