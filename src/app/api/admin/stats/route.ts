import { NextResponse } from "next/server";
import { query } from "../../../../lib/server/db";
import { requireAdminSession } from "../../../../lib/server/auth";
import { ensurePortfolioSeed } from "../../../../lib/server/portfolio";
import { listPages } from "../../../../lib/server/pages";
import { ensureBuiltInBlogs } from "../../../../lib/server/blogs";
import type { ContactRequest, Enquiry } from "../../../../lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ProjectRow { id: number; title: string; is_featured: boolean; gallery: number; documents: number }

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  await Promise.all([ensurePortfolioSeed(), ensureBuiltInBlogs()]);

  const [counts, enquiries, contacts, projects, pages] = await Promise.all([
    query<Record<string, number>>(`SELECT
      (SELECT COUNT(*)::int FROM enquiries WHERE status = 'new') AS new_enquiries,
      (SELECT COUNT(*)::int FROM enquiries WHERE created_at > NOW() - INTERVAL '7 days') AS enquiries_week,
      (SELECT COUNT(*)::int FROM enquiries WHERE status = 'new' AND created_at < NOW() - INTERVAL '1 day') AS waiting_enquiries,
      (SELECT COUNT(*)::int FROM contact_requests WHERE read_at IS NULL) AS unread_contacts,
      (SELECT COUNT(*)::int FROM contact_requests WHERE created_at > NOW() - INTERVAL '7 days') AS contacts_week,
      (SELECT COUNT(*)::int FROM portfolio_projects WHERE is_enabled) AS live_projects,
      (SELECT COUNT(*)::int FROM portfolio_projects WHERE NOT is_enabled) AS hidden_projects,
      (SELECT COUNT(*)::int FROM blogs WHERE NOT is_draft) AS published_articles,
      (SELECT COUNT(*)::int FROM blogs WHERE is_draft) AS draft_articles,
      (SELECT COUNT(*)::int FROM press_clippings WHERE is_enabled) AS press_items`),
    query<Enquiry>("SELECT id, name, phone, whatsapp_consent, project_title, source, status, notes, created_at FROM enquiries ORDER BY created_at DESC LIMIT 5"),
    query<ContactRequest>("SELECT id, name, email, message, read_at, created_at FROM contact_requests ORDER BY created_at DESC LIMIT 3"),
    query<ProjectRow>(`SELECT id, title, is_featured,
        jsonb_array_length(COALESCE(details->'gallery', '[]'::jsonb))::int AS gallery,
        jsonb_array_length(COALESCE(details->'documents', '[]'::jsonb))::int AS documents
      FROM portfolio_projects WHERE is_enabled ORDER BY title`),
    listPages(),
  ]);

  const c = counts.rows[0] ?? {};
  const attention: { id: string; title: string; detail: string; href: string; tone: "warning" | "info" }[] = [];
  if (c.waiting_enquiries) attention.push({ id: "enquiries", title: `${c.waiting_enquiries} ${c.waiting_enquiries === 1 ? "enquiry has" : "enquiries have"} waited over a day`, detail: "Call or WhatsApp them, then mark them Contacted.", href: "/admin/enquiries?status=new", tone: "warning" });
  if (c.unread_contacts) attention.push({ id: "contacts", title: `${c.unread_contacts} unread contact ${c.unread_contacts === 1 ? "request" : "requests"}`, detail: "Messages from the Contact page.", href: "/admin/contacts", tone: "warning" });
  if (!projects.rows.some((project) => project.is_featured)) attention.push({ id: "featured", title: "No featured project", detail: "Pick one project to show first on the home page.", href: "/admin/properties", tone: "info" });
  const incomplete = projects.rows.filter((project) => !project.is_featured && (!project.gallery || !project.documents));
  if (incomplete.length) {
    const names = incomplete.slice(0, 3).map((row) => row.title).join(", ") + (incomplete.length > 3 ? ` and ${incomplete.length - 3} more` : "");
    attention.push({ id: "projects", title: `${incomplete.length} project ${incomplete.length === 1 ? "page has" : "pages have"} no gallery or brochure`, detail: names, href: incomplete.length === 1 ? `/admin/properties/${incomplete[0].id}?tab=${incomplete[0].gallery ? "documents" : "media"}` : "/admin/properties", tone: "info" });
  }
  const draftPages = pages.filter((page) => page.status !== "published");
  if (draftPages.length) attention.push({ id: "pages", title: `${draftPages.length} draft ${draftPages.length === 1 ? "page" : "pages"}`, detail: draftPages.slice(0, 3).map((page) => page.title).join(", "), href: "/admin/pages", tone: "info" });
  if (c.draft_articles) attention.push({ id: "articles", title: `${c.draft_articles} draft ${c.draft_articles === 1 ? "article" : "articles"}`, detail: "Not yet visible in the Journal.", href: "/admin/articles?status=draft", tone: "info" });

  return NextResponse.json({
    counts: c,
    latestEnquiries: enquiries.rows,
    latestContacts: contacts.rows,
    attention,
  }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
