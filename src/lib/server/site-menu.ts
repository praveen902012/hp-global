import { defaultSiteMenu, MAX_MENU_ITEMS, MAX_MENU_LABEL_LENGTH, normalizeSiteMenu, type SiteMenu } from "../../data/siteMenu";
import { query } from "./db";

const MENU_KEY = "site_menu";

export async function getSiteMenu(): Promise<SiteMenu> {
  const result = await query<{ content: unknown }>("SELECT content FROM site_settings WHERE key = $1", [MENU_KEY]);
  if (!result.rows[0]) return defaultSiteMenu;
  const parsed = normalizeSiteMenu(result.rows[0].content);
  if (!("menu" in parsed)) return defaultSiteMenu;
  // The old Listings page became Projects; point saved links at the new page.
  const upgrade = (items: SiteMenu["header"]) => items.map((entry) => entry.href === "/listings" ? { ...entry, href: "/projects", label: entry.label === "Listings" ? "Projects" : entry.label } : entry);
  return { header: upgrade(parsed.menu.header), footer: upgrade(parsed.menu.footer) };
}

/** For public pages: never let a database problem take the site navigation down. */
export async function getSiteMenuSafe(): Promise<SiteMenu> {
  try {
    return await getSiteMenu();
  } catch (error) {
    console.error("Failed to load site menu; using default", error);
    return defaultSiteMenu;
  }
}

export async function saveSiteMenu(menu: SiteMenu) {
  await query(
    "INSERT INTO site_settings (key, content, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()",
    [MENU_KEY, JSON.stringify(menu)],
  );
  return menu;
}

export type MenuLocation = "header" | "footer";

/** Which menus already contain a link to `href`. */
export async function menusLinkingTo(href: string): Promise<MenuLocation[]> {
  const menu = await getSiteMenu();
  return (["header", "footer"] as const).filter((key) => menu[key].some((item) => item.href === href));
}

/** Adds a link to the chosen menus (skipping menus that already link there). Returns menus that were full. */
export async function addMenuLink(href: string, label: string, locations: MenuLocation[]) {
  const menu = await getSiteMenu();
  const full: MenuLocation[] = [];
  let changed = false;
  for (const key of locations) {
    if (menu[key].some((item) => item.href === href)) continue;
    if (menu[key].length >= MAX_MENU_ITEMS) { full.push(key); continue; }
    menu[key] = [...menu[key], { label: label.slice(0, MAX_MENU_LABEL_LENGTH).trim(), href, enabled: true, new_tab: false }];
    changed = true;
  }
  if (changed) await saveSiteMenu(menu);
  return { full };
}

/** Removes every menu link pointing at `href`. Returns how many were removed. */
export async function removeMenuLinks(href: string) {
  const menu = await getSiteMenu();
  const header = menu.header.filter((item) => item.href !== href);
  const footer = menu.footer.filter((item) => item.href !== href);
  const removed = menu.header.length - header.length + menu.footer.length - footer.length;
  if (removed) await saveSiteMenu({ header, footer });
  return removed;
}

/** Points menu links at a page's new URL after its slug changes. */
export async function retargetMenuLinks(fromHref: string, toHref: string) {
  const menu = await getSiteMenu();
  let changed = false;
  const retarget = (items: SiteMenu["header"]) => items.map((item) => item.href === fromHref ? (changed = true, { ...item, href: toHref }) : item);
  const next = { header: retarget(menu.header), footer: retarget(menu.footer) };
  if (changed) await saveSiteMenu(next);
}
