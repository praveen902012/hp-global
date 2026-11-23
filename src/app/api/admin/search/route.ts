import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/server/auth";
import { query } from "../../../../lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchResult = import("../../../../lib/api").SearchResult;

/** One search box across projects, articles, pages, press and leads. */
export async function GET(request: Request) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const term = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (term.length < 2) return NextResponse.json({ results: [] });
  const like = `%${term}%`;
  const digits = term.replace(/\D/g, "");
  const [projects, articles, pages, press, enquiries, contacts] = await Promise.all([
    query<{ id: number; title: string; location: string }>("SELECT id, title, location FROM portfolio_projects WHERE title ILIKE $1 OR location ILIKE $1 ORDER BY title LIMIT 5", [like]),
    query<{ id: number; title: string; is_draft: boolean }>("SELECT id, title, is_draft FROM blogs WHERE title ILIKE $1 OR slug ILIKE $1 ORDER BY published_at DESC LIMIT 5", [like]),
    query<{ id: number; title: string; slug: string }>("SELECT id, title, slug FROM pages WHERE title ILIKE $1 OR slug ILIKE $1 ORDER BY title LIMIT 5", [like]),
    query<{ id: number; headline: string; publication: string }>("SELECT id, headline, publication FROM press_clippings WHERE headline ILIKE $1 OR publication ILIKE $1 OR project ILIKE $1 ORDER BY published_on DESC LIMIT 5", [like]),
    query<{ id: number; name: string; phone: string; project_title: string }>("SELECT id, name, phone, project_title FROM enquiries WHERE name ILIKE $1 OR project_title ILIKE $1 OR ($2 <> '' AND regexp_replace(phone, '\\D', '', 'g') LIKE '%' || $2 || '%') ORDER BY created_at DESC LIMIT 5", [like, digits.length >= 3 ? digits : ""]),
    query<{ id: number; name: string; email: string }>("SELECT id, name, email FROM contact_requests WHERE name ILIKE $1 OR email ILIKE $1 OR message ILIKE $1 ORDER BY created_at DESC LIMIT 5", [like]),
  ]);
  const results: SearchResult[] = [
    ...projects.rows.map((row) => ({ type: "Project" as const, title: row.title, detail: row.location, href: `/admin/properties/${row.id}` })),
    ...articles.rows.map((row) => ({ type: "Article" as const, title: row.title, detail: row.is_draft ? "Draft" : "Published", href: `/admin/articles/${row.id}` })),
    ...pages.rows.map((row) => ({ type: "Page" as const, title: row.title, detail: `/${row.slug}`, href: `/admin/pages/${row.id}` })),
    ...press.rows.map((row) => ({ type: "Press" as const, title: row.headline, detail: row.publication, href: `/admin/press?edit=${row.id}` })),
    ...enquiries.rows.map((row) => ({ type: "Enquiry" as const, title: row.name, detail: `${row.phone} · ${row.project_title}`, href: `/admin/enquiries?id=${row.id}` })),
    ...contacts.rows.map((row) => ({ type: "Contact request" as const, title: row.name, detail: row.email, href: `/admin/contacts?id=${row.id}` })),
  ];
  return NextResponse.json({ results }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
