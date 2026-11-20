import { defaultSiteMenu, normalizeSiteMenu, type SiteMenu } from "../../data/siteMenu";
import { query } from "./db";

const MENU_KEY = "site_menu";

export async function getSiteMenu(): Promise<SiteMenu> {
  const result = await query<{ content: unknown }>("SELECT content FROM site_settings WHERE key = $1", [MENU_KEY]);
  if (!result.rows[0]) return defaultSiteMenu;
  const parsed = normalizeSiteMenu(result.rows[0].content);
  return "menu" in parsed ? parsed.menu : defaultSiteMenu;
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
