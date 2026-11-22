import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../lib/server/auth";
import { deletePage, getPageById, PageConflictError, updatePage } from "../../../../../lib/server/pages";
import { menusLinkingTo, removeMenuLinks, retargetMenuLinks } from "../../../../../lib/server/site-menu";
import { sanitizePageHtml } from "../../../../../lib/server/page-content";
import { normalizePageContent } from "../../../../../data/pages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };
const unauthorized = () => NextResponse.json({ error: "Please sign in again." }, { status: 401 });
const notFound = () => NextResponse.json({ error: "Page not found." }, { status: 404 });
const parseId = async (params: Props["params"]) => { const { id } = await params; return /^\d+$/.test(id) ? Number(id) : null; };

export async function GET(_request: Request, { params }: Props) {
  if (!await requireAdminSession()) return unauthorized();
  const id = await parseId(params);
  const page = id === null ? null : await getPageById(id);
  if (!page) return notFound();
  return NextResponse.json({ ...page, menus: await menusLinkingTo(`/${page.slug}`) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request, { params }: Props) {
  if (!await requireAdminSession()) return unauthorized();
  const id = await parseId(params);
  if (id === null) return notFound();
  const existing = await getPageById(id);
  if (!existing) return notFound();
  const parsed = normalizePageContent(await request.json().catch(() => null), sanitizePageHtml, existing.system_key ? { fixedSlug: existing.slug } : {});
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const page = await updatePage(id, parsed.content);
    if (!page) return notFound();
    if (existing.slug !== page.slug) await retargetMenuLinks(`/${existing.slug}`, `/${page.slug}`);
    return NextResponse.json({ ...page, menus: await menusLinkingTo(`/${page.slug}`) });
  } catch (error) {
    if (error instanceof PageConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!await requireAdminSession()) return unauthorized();
  const id = await parseId(params);
  const existing = id === null ? null : await getPageById(id);
  if (existing?.system_key) return NextResponse.json({ error: `"${existing.title}" is a built-in site page and can't be deleted. You can edit its content instead.` }, { status: 400 });
  const slug = id === null ? null : await deletePage(id);
  if (!slug) return notFound();
  const removedLinks = await removeMenuLinks(`/${slug}`);
  return NextResponse.json({ ok: true, removed_menu_links: removedLinks });
}
