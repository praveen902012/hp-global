export interface MenuItem {
  label: string;
  href: string;
  enabled: boolean;
  new_tab: boolean;
}

export interface SiteMenu {
  header: MenuItem[];
  footer: MenuItem[];
}

export const MAX_MENU_ITEMS = 12;
export const MAX_MENU_LABEL_LENGTH = 40;

/** Pages that exist on the site, offered as suggestions in the admin menu editor. */
export const sitePages = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "Our Story" },
  { href: "/investments", label: "Investments" },
  { href: "/projects", label: "Projects" },
  { href: "/featured-project", label: "Featured Project" },
  { href: "/blog", label: "Journal" },
  { href: "/media", label: "In the News" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
];

const item = (label: string, href: string): MenuItem => ({ label, href, enabled: true, new_tab: false });

export const defaultSiteMenu: SiteMenu = {
  header: [
    item("Projects", "/projects"),
    item("Investments", "/investments"),
    item("Services", "/services"),
    item("Our Story", "/about"),
    item("Journal", "/blog"),
    item("In the News", "/media"),
    item("Contact", "/contact"),
  ],
  footer: [
    item("Projects", "/projects"),
    item("Investments", "/investments"),
    item("Services", "/services"),
    item("Our Story", "/about"),
    item("Journal", "/blog"),
    item("In the News", "/media"),
    item("Contact", "/contact"),
  ],
};

/** Internal paths ("/about", "/blog#latest"), http(s) URLs, mailto: and tel: links are allowed. */
export function isValidMenuHref(href: string) {
  if (/^\/(?!\/)[^\s]*$/.test(href)) return true;
  if (/^(mailto|tel):[^\s]+$/i.test(href)) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

/** Returns a cleaned menu, or an error message describing the first problem found. */
export function normalizeSiteMenu(value: unknown): { menu: SiteMenu } | { error: string } {
  if (!value || typeof value !== "object") return { error: "Menu data is missing." };
  const input = value as Record<string, unknown>;
  const menu: SiteMenu = { header: [], footer: [] };
  for (const [key, name] of [["header", "Header"], ["footer", "Footer"]] as const) {
    const list = input[key];
    if (!Array.isArray(list)) return { error: `${name} menu is missing.` };
    if (list.length > MAX_MENU_ITEMS) return { error: `${name} menu can have at most ${MAX_MENU_ITEMS} items.` };
    for (const [index, raw] of list.entries()) {
      const entry = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
      const label = String(entry.label ?? "").trim();
      const href = String(entry.href ?? "").trim();
      const position = `${name} item ${index + 1}`;
      if (!label) return { error: `${position} needs a label.` };
      if (label.length > MAX_MENU_LABEL_LENGTH) return { error: `${position}: label must be ${MAX_MENU_LABEL_LENGTH} characters or fewer.` };
      if (!isValidMenuHref(href)) return { error: `${position}: link must be a site path like /about, a full http(s) URL, or a mailto:/tel: link.` };
      menu[key].push({ label, href, enabled: entry.enabled !== false, new_tab: entry.new_tab === true });
    }
  }
  return { menu };
}
