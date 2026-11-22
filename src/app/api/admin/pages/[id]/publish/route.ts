import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../../lib/server/auth";
import { getPageById, setPageStatus } from "../../../../../../lib/server/pages";
import { addMenuLink, menusLinkingTo, removeMenuLinks, type MenuLocation } from "../../../../../../lib/server/site-menu";
import { normalizePageContent } from "../../../../../../data/pages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/** Body: { published: boolean, add_to_menu?: ("header" | "footer")[], menu_label?: string } */
export async function POST(request: Request, { params }: Props) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Page not found." }, { status: 404 });
  const existing = await getPageById(Number(id));
  if (!existing) return NextResponse.json({ error: "Page not found." }, { status: 404 });
  if (existing.system_key) return NextResponse.json({ error: `"${existing.title}" is a built-in site page and is always live.` }, { status: 400 });
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const published = body.published === true;
  const href = `/${existing.slug}`;

  if (published) {
    // Re-check stored content before it goes live (e.g. a slug that became reserved later).
    const check = normalizePageContent(existing);
    if ("error" in check) return NextResponse.json({ error: `Fix this before publishing: ${check.error}` }, { status: 400 });
    if (existing.sections.length === 0) return NextResponse.json({ error: "Add at least one section before publishing." }, { status: 400 });
  }

  const page = await setPageStatus(existing.id, published);
  if (!page) return NextResponse.json({ error: "Page not found." }, { status: 404 });

  let menuFull: MenuLocation[] = [];
  let removedMenuLinks = 0;
  if (published) {
    const requested = Array.isArray(body.add_to_menu) ? body.add_to_menu.filter((value): value is MenuLocation => value === "header" || value === "footer") : [];
    const label = String(body.menu_label ?? "").trim() || page.title;
    if (requested.length) menuFull = (await addMenuLink(href, label, requested)).full;
  } else {
    // A draft page is not public, so take its links out of the menus to avoid dead links.
    removedMenuLinks = await removeMenuLinks(href);
  }
  return NextResponse.json({ ...page, menus: await menusLinkingTo(href), menu_full: menuFull, removed_menu_links: removedMenuLinks });
}
