import { isValidMenuHref } from "./siteMenu";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SectionBackground = "white" | "light" | "dark";

interface SectionBase { id: string; background: SectionBackground }

/** Button links may also be "#enquire", which opens the enquiry form instead of a page. */
export const ENQUIRE_LINK = "#enquire";

export interface HeroSection extends SectionBase {
  type: "hero"; eyebrow: string; title: string; accent_title: string; subtitle: string;
  image_url: string; button_label: string; button_href: string; height: "full" | "large" | "medium" | "auto";
  /** "image": text over a photo. "plain": page heading on a light background, no photo. */
  style?: "image" | "plain";
  button2_label?: string; button2_href?: string;
  /** Shows a small card linking to the featured project (home page). */
  show_featured?: boolean;
  /** Layout details kept from the original hand-built pages (not shown in the editor). */
  title_width?: number; subtitle_width?: number; tight?: boolean;
}
export interface TextSection extends SectionBase {
  type: "text"; eyebrow: string; heading: string; body: string; align: "left" | "center";
}
export interface ImageTextSection extends SectionBase {
  type: "image_text"; eyebrow: string; heading: string; accent_heading: string; body: string; image_url: string; image_alt: string;
  image_position: "left" | "right"; button_label: string; button_href: string; tagline?: string;
}
export interface GallerySection extends SectionBase {
  type: "gallery"; heading: string; columns: 2 | 3 | 4; images: { src: string; alt: string }[];
}
export type CardProjects = "" | "residential" | "commercial" | "high_end";
export interface CardsSection extends SectionBase {
  type: "cards"; heading: string; intro: string;
  cards: { image_url: string; title: string; description: string; link: string; link_label?: string; projects?: CardProjects }[];
  eyebrow?: string; accent?: string;
  /** "grid": cards side by side. "rows": large photo beside numbered text, alternating sides. */
  layout?: "grid" | "rows";
}
export interface StatsSection extends SectionBase {
  type: "stats"; heading: string; items: { value: string; label: string }[];
  /** "strip": a slim row of figures with a line under it. */
  layout?: "band" | "strip";
}
export interface VideoSection extends SectionBase {
  type: "video"; heading: string; url: string; caption: string;
}
export interface FaqSection extends SectionBase {
  type: "faq"; heading: string; items: { question: string; answer: string }[];
  eyebrow?: string; accent?: string; intro?: string; layout?: "stacked" | "side";
}
export interface CtaSection extends SectionBase {
  type: "cta"; heading: string; text: string; button_label: string; button_href: string;
  /** "simple": centred text and button. "band": dark photo card with booking and WhatsApp buttons. "strip": light box with an icon. */
  style?: "simple" | "band" | "strip";
  eyebrow?: string; accent?: string; icon?: string;
}
export interface ContactFormSection extends SectionBase {
  type: "contact_form"; heading: string; intro: string;
}
export interface IconCardsSection extends SectionBase {
  type: "icon_cards"; eyebrow: string; heading: string; accent: string; intro: string;
  /** "cards": boxed cards. "list": items beside the heading. "steps": numbered steps. */
  style: "cards" | "list" | "steps";
  button_label: string; button_href: string;
  cards: { icon: string; title: string; text: string; link: string }[];
}
export interface ServiceSection extends SectionBase {
  type: "service"; eyebrow: string; title: string; text: string; image_url: string; image_position: "left" | "right";
  includes: string[]; button_label: string; button_href: string; show_call: boolean;
}
export interface LegalTextSection extends SectionBase {
  type: "legal_text"; eyebrow: string; heading: string; updated: string; body: string;
}
export type ProjectFilter = "all" | "hpg" | "partner" | "residential" | "commercial";
export interface ProjectsSection extends SectionBase {
  type: "projects"; eyebrow: string; heading: string; accent: string; intro: string; filter: ProjectFilter; limit: number; button_label: string;
}
export interface FeaturedProjectSection extends SectionBase {
  type: "featured_project"; button_label: string; brochure_label: string;
}
export interface PressSection extends SectionBase {
  type: "press"; eyebrow: string; heading: string; accent: string; link_label: string; limit: number;
}
export interface ArticlesSection extends SectionBase {
  type: "articles"; eyebrow: string; heading: string; accent: string; link_label: string; limit: number;
}
export interface ProjectsListSection extends SectionBase { type: "projects_list" }
export interface PressListSection extends SectionBase {
  type: "press_list"; show_contact: boolean; contact_heading: string; contact_text: string; contact_button: string;
}
export interface ArticlesListSection extends SectionBase { type: "articles_list" }
export interface ContactDetailsSection extends SectionBase {
  type: "contact_details"; office_heading: string; response_text: string; visits_text: string;
}

export type PageSection =
  | HeroSection | TextSection | ImageTextSection | GallerySection | CardsSection
  | StatsSection | VideoSection | FaqSection | CtaSection | ContactFormSection
  | IconCardsSection | ServiceSection | LegalTextSection
  | ProjectsSection | FeaturedProjectSection | PressSection | ArticlesSection
  | ProjectsListSection | PressListSection | ArticlesListSection | ContactDetailsSection;
export type SectionType = PageSection["type"];

export type PageStatus = "draft" | "published";

export interface PageContent {
  title: string;
  slug: string;
  meta_description: string;
  /** Title shown on Google; blank uses "<page title> | <website name>". */
  seo_title: string;
  /** Picture shown when the page is shared; blank uses the default from Site details. */
  share_image: string;
  sections: PageSection[];
}

export interface SitePage extends PageContent {
  id: number;
  /** Set for built-in website pages (e.g. "home", "about"): fixed URL, always live, cannot be deleted. */
  system_key: string | null;
  status: PageStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export type PageSummary = Omit<SitePage, "sections" | "meta_description" | "seo_title" | "share_image"> & { section_count: number };

/* ------------------------------------------------------------------ */
/* Section catalogue (labels, descriptions and starter content)        */
/* ------------------------------------------------------------------ */

/** "content": filled in by hand. "live": fills itself from projects, press or articles. "fixed": always on one website page. */
export type SectionGroup = "content" | "live" | "fixed";

export const sectionCatalog: { type: SectionType; label: string; description: string; group: SectionGroup; isNew?: boolean }[] = [
  { type: "hero", label: "Hero banner", description: "Large heading over a photo, or a plain page heading, with up to two buttons.", group: "content" },
  { type: "text", label: "Text", description: "Heading and formatted paragraphs.", group: "content" },
  { type: "image_text", label: "Image + text", description: "An image beside a heading, text and optional button.", group: "content" },
  { type: "gallery", label: "Image gallery", description: "A grid of photos.", group: "content" },
  { type: "cards", label: "Cards", description: "Photo cards side by side, or large photo rows.", group: "content" },
  { type: "icon_cards", label: "Icon cards", description: "Short points with an icon — as cards, a list or numbered steps.", group: "content", isNew: true },
  { type: "service", label: "Service", description: "A service with photo, description, what's included and a button.", group: "content", isNew: true },
  { type: "stats", label: "Key figures", description: "Big numbers with labels, e.g. 25+ Projects.", group: "content" },
  { type: "video", label: "Video", description: "Embedded YouTube or Vimeo video.", group: "content" },
  { type: "faq", label: "FAQ", description: "Questions that expand to show answers.", group: "content" },
  { type: "cta", label: "Call to action", description: "A banner or box with a heading and a button.", group: "content" },
  { type: "contact_form", label: "Contact form", description: "Name, email and message form; replies arrive in Contact Requests.", group: "content" },
  { type: "legal_text", label: "Legal text", description: "Long text with numbered headings and a contents list, e.g. a privacy policy.", group: "content", isNew: true },
  { type: "projects", label: "Projects", description: "Your published projects, updated automatically.", group: "live", isNew: true },
  { type: "featured_project", label: "Featured project", description: "The project chosen in Featured project, with photos and highlights.", group: "live", isNew: true },
  { type: "press", label: "Press", description: "Your latest press coverage.", group: "live", isNew: true },
  { type: "articles", label: "Articles", description: "Your latest Journal articles.", group: "live", isNew: true },
  { type: "projects_list", label: "Projects list", description: "Every published project, with filters.", group: "fixed" },
  { type: "press_list", label: "Press list", description: "All press coverage, with a project filter.", group: "fixed" },
  { type: "articles_list", label: "Articles list", description: "Every published article, with search and topics.", group: "fixed" },
  { type: "contact_details", label: "Contact details", description: "Phone, WhatsApp, email, the contact form and office details.", group: "fixed" },
];

/** Fixed sections belong to one website page each and can't be added, copied or removed. */
export const fixedSectionPage: Partial<Record<SectionType, string>> = { projects_list: "projects", press_list: "media", articles_list: "blog", contact_details: "contact" };
export const isLiveSection = (type: SectionType) => sectionCatalog.find((entry) => entry.type === type)?.group !== "content";

/** Icons editors can pick for icon cards and boxes. */
export const iconOptions: { value: string; label: string }[] = [
  { value: "trending-up", label: "Growth" }, { value: "key-round", label: "Key" }, { value: "land-plot", label: "Plot" },
  { value: "shield-check", label: "Shield" }, { value: "user-round-check", label: "Advisor" }, { value: "file-text", label: "Document" },
  { value: "user-round", label: "Person" }, { value: "globe", label: "Globe" }, { value: "layers", label: "Layers" },
  { value: "search", label: "Search" }, { value: "calendar-days", label: "Calendar" }, { value: "building", label: "Building" },
  { value: "house", label: "Home" }, { value: "handshake", label: "Handshake" }, { value: "phone", label: "Phone" },
  { value: "mail", label: "Email" }, { value: "map-pin", label: "Location" }, { value: "star", label: "Star" },
  { value: "clock", label: "Clock" }, { value: "circle-check", label: "Tick" }, { value: "wallet", label: "Wallet" }, { value: "sparkles", label: "Sparkle" },
];

export function newSectionId() {
  return `s_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function createSection(type: SectionType): PageSection {
  const id = newSectionId();
  switch (type) {
    case "hero": return { id, type, background: "dark", eyebrow: "", title: "Page title", accent_title: "", subtitle: "", image_url: "/hero_banner_real_estate_1774769760013.png", button_label: "", button_href: "", height: "medium", style: "image", button2_label: "", button2_href: "", show_featured: false };
    case "text": return { id, type, background: "white", eyebrow: "", heading: "Section heading", body: "<p>Write your content here.</p>", align: "left" };
    case "image_text": return { id, type, background: "white", eyebrow: "", heading: "Section heading", accent_heading: "", body: "<p>Write your content here.</p>", image_url: "/commercial_building_investment_1774769793820.png", image_alt: "", image_position: "right", button_label: "", button_href: "" };
    case "gallery": return { id, type, background: "white", heading: "Gallery", columns: 3, images: [] };
    case "cards": return { id, type, background: "light", heading: "Highlights", intro: "", eyebrow: "", accent: "", layout: "grid", cards: [{ image_url: "", title: "Card title", description: "Short description.", link: "", link_label: "", projects: "" }] };
    case "stats": return { id, type, background: "dark", heading: "", layout: "band", items: [{ value: "25+", label: "Years of experience" }, { value: "100+", label: "Projects delivered" }, { value: "5,000+", label: "Happy families" }] };
    case "video": return { id, type, background: "white", heading: "", url: "", caption: "" };
    case "faq": return { id, type, background: "light", heading: "Frequently asked questions", eyebrow: "", accent: "", intro: "", layout: "stacked", items: [{ question: "Your question?", answer: "The answer." }] };
    case "cta": return { id, type, background: "dark", heading: "Ready to talk?", text: "Our team will get back to you within 24 hours.", button_label: "Contact us", button_href: "/contact", style: "simple", eyebrow: "", accent: "", icon: "globe" };
    case "contact_form": return { id, type, background: "light", heading: "Get in touch", intro: "" };
    case "icon_cards": return { id, type, background: "white", eyebrow: "", heading: "Why choose us", accent: "", intro: "", style: "cards", button_label: "", button_href: "", cards: [{ icon: "shield-check", title: "Verified projects", text: "Every project is checked by our team.", link: "" }, { icon: "user-round-check", title: "One advisor", text: "A single point of contact from start to finish.", link: "" }, { icon: "file-text", title: "Clear documents", text: "Brochures and price lists shared upfront.", link: "" }] };
    case "service": return { id, type, background: "white", eyebrow: "Service", title: "Service name", text: "Describe the service in a sentence or two.", image_url: "/commercial_building_investment_1774769793820.png", image_position: "left", includes: ["First thing included"], button_label: "Schedule a consultation", button_href: ENQUIRE_LINK, show_call: true };
    case "legal_text": return { id, type, background: "white", eyebrow: "Legal", heading: "Terms", updated: "", body: "<h2>1. First heading</h2><p>Write your text here.</p>" };
    case "projects": return { id, type, background: "white", eyebrow: "Our portfolio", heading: "Our projects", accent: "", intro: "", filter: "all", limit: 6, button_label: "View all projects" };
    case "featured_project": return { id, type, background: "light", button_label: "Explore project", brochure_label: "Download brochure" };
    case "press": return { id, type, background: "light", eyebrow: "In the news", heading: "What the press is saying", accent: "press", link_label: "All coverage", limit: 3 };
    case "articles": return { id, type, background: "white", eyebrow: "The Journal", heading: "Market insights & company news", accent: "insights", link_label: "Read the journal", limit: 3 };
    case "projects_list": return { id, type, background: "white" };
    case "press_list": return { id, type, background: "white", show_contact: true, contact_heading: "Press & media enquiries", contact_text: "For interviews, project information or high-resolution images, write to {email}.", contact_button: "Email the press desk" };
    case "articles_list": return { id, type, background: "white" };
    case "contact_details": return { id, type, background: "white", office_heading: "Head office", response_text: "We reply to every enquiry within 24 hours", visits_text: "By appointment — in person or on a video call" };
  }
}

export const starterSections = (): PageSection[] => [createSection("hero"), createSection("text")];

/* ------------------------------------------------------------------ */
/* Slugs and URLs                                                      */
/* ------------------------------------------------------------------ */

/** Top-level paths already used by the site; a page cannot take these slugs. */
export const reservedSlugs = new Set([
  "about", "services", "investments", "projects", "listings", "featured-project", "blog", "contact", "privacy",
  "admin", "api", "assets", "images", "uploads", "media", "_next", "favicon", "icons", "login", "logout",
  "sitemap", "robots", "search", "page", "pages", "preview", "404", "500",
]);

export function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function slugError(slug: string): string | null {
  if (!slug) return "Enter a URL slug.";
  if (slug.length > 80) return "The URL slug must be 80 characters or fewer.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return "The URL slug may only contain lowercase letters, numbers and single hyphens.";
  if (reservedSlugs.has(slug)) return `"/${slug}" is already used by the site. Choose another URL.`;
  return null;
}

/** Site paths ("/assets/x.jpg", "/api/media/x.png") and http(s) URLs. */
export function isValidImageUrl(value: string) {
  if (/^\/(?!\/)[^\s]*$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
}

/** Converts YouTube/Vimeo watch or share links into embed URLs; returns null for anything else. */
export function toVideoEmbedUrl(value: string): string | null {
  let url: URL;
  try { url = new URL(value.trim()); } catch { return null; }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const id = /^[A-Za-z0-9_-]{6,20}$/;
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const candidate = parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live" ? parts[1] : url.searchParams.get("v");
    return candidate && id.test(candidate) ? `https://www.youtube.com/embed/${candidate}` : null;
  }
  if (host === "youtu.be") {
    const candidate = url.pathname.slice(1);
    return id.test(candidate) ? `https://www.youtube.com/embed/${candidate}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const candidate = url.pathname.split("/").filter(Boolean).find((part) => /^\d{5,12}$/.test(part));
    return candidate ? `https://player.vimeo.com/video/${candidate}` : null;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export const PAGE_LIMITS = { sections: 30, listItems: 24, short: 160, medium: 600, long: 2000, html: 60000, title: 120, meta: 300, seoTitle: 120 };
/** Google shows about this many characters of a description. */
export const SEO_DESCRIPTION_TARGET = 160;

class PageInputError extends Error {}

type Raw = Record<string, unknown>;
const obj = (value: unknown): Raw => (value && typeof value === "object" && !Array.isArray(value) ? value as Raw : {});
const flag = (value: unknown) => value === true;
const count = (value: unknown, min: number, max: number, fallback: number) => { const n = Math.round(Number(value)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback; };
const pick = <T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(value as T) ? value as T : fallback);

function text(value: unknown, where: string, max: number, required = false) {
  const result = String(value ?? "").trim();
  if (required && !result) throw new PageInputError(`${where} is required.`);
  if (result.length > max) throw new PageInputError(`${where} must be ${max} characters or fewer.`);
  return result;
}
function link(value: unknown, where: string) {
  const result = text(value, where, 500);
  if (result && result !== ENQUIRE_LINK && !isValidMenuHref(result)) throw new PageInputError(`${where} must be a site path like /contact, a full https:// URL, or a mailto:/tel: link.`);
  return result;
}
function image(value: unknown, where: string, required = false) {
  const result = text(value, where, 1000, required);
  if (result && !isValidImageUrl(result)) throw new PageInputError(`${where} must be an uploaded image or a full https:// image URL.`);
  return result;
}
function list(value: unknown, where: string) {
  if (!Array.isArray(value)) return [];
  if (value.length > PAGE_LIMITS.listItems) throw new PageInputError(`${where} can have at most ${PAGE_LIMITS.listItems} items.`);
  return value.map(obj);
}
function buttonPair(label: string, href: string, where: string) {
  if (label && !href) throw new PageInputError(`${where}: add a link for the button, or clear the button label.`);
}

/**
 * Cleans and validates page content. `sanitizeHtml` is applied to rich-text fields
 * (pass the server sanitizer on the server; the identity function is fine for client-side checks).
 */
export function normalizePageContent(value: unknown, sanitizeHtml: (html: string) => string = (html) => html, options: { fixedSlug?: string; systemKey?: string | null } = {}): { content: PageContent } | { error: string } {
  try {
    const input = obj(value);
    const title = text(input.title, "Page name", PAGE_LIMITS.title, true);
    const seo_title = text(input.seo_title, "Title on Google", PAGE_LIMITS.seoTitle);
    const share_image = image(input.share_image, "Share image");
    // Built-in site pages keep their fixed URL (which is otherwise a reserved slug).
    const slug = options.fixedSlug ?? String(input.slug ?? "").trim().toLowerCase();
    const slugProblem = options.fixedSlug !== undefined ? null : slugError(slug);
    if (slugProblem) throw new PageInputError(slugProblem);
    const meta_description = text(input.meta_description, "Search description", PAGE_LIMITS.meta);
    if (!Array.isArray(input.sections)) throw new PageInputError("Page sections are missing.");
    if (input.sections.length > PAGE_LIMITS.sections) throw new PageInputError(`A page can have at most ${PAGE_LIMITS.sections} sections.`);

    const seen = new Set<string>();
    const sections = input.sections.map((rawSection, index): PageSection => {
      const raw = obj(rawSection);
      const type = raw.type as SectionType;
      const label = sectionCatalog.find((entry) => entry.type === type)?.label;
      if (!label) throw new PageInputError(`Section ${index + 1} has an unknown type.`);
      const where = `Section ${index + 1} (${label})`;
      const owner = fixedSectionPage[type];
      if (owner && owner !== options.systemKey) throw new PageInputError(`${where} can only be used on its own website page.`);
      let id = typeof raw.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(raw.id) ? raw.id : newSectionId();
      if (seen.has(id)) id = newSectionId();
      seen.add(id);
      const background = pick(raw.background, ["white", "light", "dark"] as const, "white");
      const html = (field: unknown, name: string) => {
        const result = sanitizeHtml(String(field ?? "")).trim();
        if (result.length > PAGE_LIMITS.html) throw new PageInputError(`${where}: ${name} is too long.`);
        return result;
      };

      const heading = (field: unknown, name = "heading", required = false) => text(field, `${where}: ${name}`, PAGE_LIMITS.short, required);
      switch (type) {
        case "hero": {
          const style = pick(raw.style, ["image", "plain"] as const, "image");
          const section: HeroSection = { id, type, background, style, eyebrow: heading(raw.eyebrow, "small heading"), title: heading(raw.title, "title", true), accent_title: heading(raw.accent_title, "gold words"), subtitle: text(raw.subtitle, `${where}: subtitle`, PAGE_LIMITS.medium), image_url: image(raw.image_url, `${where}: background image`), button_label: text(raw.button_label, `${where}: button label`, 60), button_href: link(raw.button_href, `${where}: button link`), button2_label: text(raw.button2_label, `${where}: second button label`, 60), button2_href: link(raw.button2_href, `${where}: second button link`), height: pick(raw.height, ["full", "large", "medium", "auto"] as const, "medium"), show_featured: flag(raw.show_featured), ...(raw.title_width ? { title_width: count(raw.title_width, 400, 1400, 900) } : {}), ...(raw.subtitle_width ? { subtitle_width: count(raw.subtitle_width, 400, 1000, 620) } : {}), ...(raw.tight ? { tight: true } : {}) };
          buttonPair(section.button_label, section.button_href, where);
          buttonPair(section.button2_label ?? "", section.button2_href ?? "", `${where} (second button)`);
          return section;
        }
        case "text":
          return { id, type, background, eyebrow: heading(raw.eyebrow, "small heading"), heading: heading(raw.heading), body: html(raw.body, "text"), align: pick(raw.align, ["left", "center"] as const, "left") };
        case "image_text": {
          const section: ImageTextSection = { id, type, background, eyebrow: heading(raw.eyebrow, "small heading"), heading: heading(raw.heading), accent_heading: heading(raw.accent_heading, "gold second line"), body: html(raw.body, "text"), image_url: image(raw.image_url, `${where}: image`, true), image_alt: heading(raw.image_alt, "image description"), image_position: pick(raw.image_position, ["left", "right"] as const, "right"), tagline: heading(raw.tagline, "closing line"), button_label: text(raw.button_label, `${where}: button label`, 60), button_href: link(raw.button_href, `${where}: button link`) };
          buttonPair(section.button_label, section.button_href, where);
          return section;
        }
        case "gallery":
          return { id, type, background, heading: heading(raw.heading), columns: pick(Number(raw.columns), [2, 3, 4] as const, 3), images: list(raw.images, `${where}: images`).map((item, position) => ({ src: image(item.src, `${where}: image ${position + 1}`, true), alt: text(item.alt, `${where}: image ${position + 1} description`, PAGE_LIMITS.short) })) };
        case "cards":
          return { id, type, background, eyebrow: heading(raw.eyebrow, "small heading"), heading: heading(raw.heading), accent: heading(raw.accent, "gold words"), intro: text(raw.intro, `${where}: intro`, PAGE_LIMITS.medium), layout: pick(raw.layout, ["grid", "rows"] as const, "grid"), cards: list(raw.cards, `${where}: cards`).map((item, position) => ({ image_url: image(item.image_url, `${where}: card ${position + 1} image`), title: text(item.title, `${where}: card ${position + 1} title`, PAGE_LIMITS.short, true), description: text(item.description, `${where}: card ${position + 1} text`, PAGE_LIMITS.medium), link: link(item.link, `${where}: card ${position + 1} link`), link_label: text(item.link_label, `${where}: card ${position + 1} link text`, 60), projects: pick(item.projects, ["", "residential", "commercial", "high_end"] as const, "") })) };
        case "stats":
          return { id, type, background, heading: heading(raw.heading), layout: pick(raw.layout, ["band", "strip"] as const, "band"), items: list(raw.items, `${where}: figures`).map((item, position) => ({ value: text(item.value, `${where}: figure ${position + 1} number`, 30, true), label: text(item.label, `${where}: figure ${position + 1} label`, 80, true) })) };
        case "video": {
          const url = text(raw.url, `${where}: video link`, 500);
          if (url && !toVideoEmbedUrl(url)) throw new PageInputError(`${where}: use a YouTube or Vimeo link.`);
          return { id, type, background, heading: heading(raw.heading), url, caption: text(raw.caption, `${where}: caption`, PAGE_LIMITS.medium) };
        }
        case "faq":
          return { id, type, background, eyebrow: heading(raw.eyebrow, "small heading"), heading: heading(raw.heading), accent: heading(raw.accent, "gold words"), intro: text(raw.intro, `${where}: intro`, PAGE_LIMITS.medium), layout: pick(raw.layout, ["stacked", "side"] as const, "stacked"), items: list(raw.items, `${where}: questions`).map((item, position) => ({ question: text(item.question, `${where}: question ${position + 1}`, PAGE_LIMITS.medium, true), answer: text(item.answer, `${where}: answer ${position + 1}`, PAGE_LIMITS.long, true) })) };
        case "cta": {
          const style = pick(raw.style, ["simple", "band", "strip"] as const, "simple");
          const section: CtaSection = { id, type, background, style, eyebrow: heading(raw.eyebrow, "small heading"), heading: heading(raw.heading, "heading", true), accent: heading(raw.accent, "gold words"), text: text(raw.text, `${where}: text`, PAGE_LIMITS.medium), icon: pick(raw.icon, iconOptions.map((option) => option.value), "globe"), button_label: text(raw.button_label, `${where}: button label`, 60), button_href: link(raw.button_href, `${where}: button link`) };
          if (style !== "band") buttonPair(section.button_label, section.button_href, where);
          return section;
        }
        case "contact_form":
          return { id, type, background, heading: heading(raw.heading), intro: text(raw.intro, `${where}: intro`, PAGE_LIMITS.medium) };
        case "icon_cards": {
          const section: IconCardsSection = { id, type, background, eyebrow: heading(raw.eyebrow, "small heading"), heading: heading(raw.heading), accent: heading(raw.accent, "gold words"), intro: text(raw.intro, `${where}: intro`, PAGE_LIMITS.medium), style: pick(raw.style, ["cards", "list", "steps"] as const, "cards"), button_label: text(raw.button_label, `${where}: button label`, 60), button_href: link(raw.button_href, `${where}: button link`), cards: list(raw.cards, `${where}: cards`).map((item, position) => ({ icon: pick(item.icon, iconOptions.map((option) => option.value), "circle-check"), title: text(item.title, `${where}: card ${position + 1} title`, PAGE_LIMITS.short, true), text: text(item.text, `${where}: card ${position + 1} text`, PAGE_LIMITS.medium), link: link(item.link, `${where}: card ${position + 1} link`) })) };
          buttonPair(section.button_label, section.button_href, where);
          return section;
        }
        case "service": {
          const includes = Array.isArray(raw.includes) ? raw.includes : [];
          if (includes.length > PAGE_LIMITS.listItems) throw new PageInputError(`${where}: "What's included" can have at most ${PAGE_LIMITS.listItems} items.`);
          const section: ServiceSection = { id, type, background, eyebrow: heading(raw.eyebrow, "small heading"), title: heading(raw.title, "title", true), text: text(raw.text, `${where}: description`, PAGE_LIMITS.long), image_url: image(raw.image_url, `${where}: image`, true), image_position: pick(raw.image_position, ["left", "right"] as const, "left"), includes: includes.map((item, position) => text(item, `${where}: included item ${position + 1}`, PAGE_LIMITS.short)).filter(Boolean), button_label: text(raw.button_label, `${where}: button label`, 60), button_href: link(raw.button_href, `${where}: button link`), show_call: flag(raw.show_call) };
          buttonPair(section.button_label, section.button_href, where);
          return section;
        }
        case "legal_text":
          return { id, type, background, eyebrow: heading(raw.eyebrow, "small heading"), heading: heading(raw.heading, "heading", true), updated: text(raw.updated, `${where}: last updated`, 60), body: html(raw.body, "text") };
        case "projects":
          return { id, type, background, eyebrow: heading(raw.eyebrow, "small heading"), heading: heading(raw.heading), accent: heading(raw.accent, "gold words"), intro: text(raw.intro, `${where}: intro`, PAGE_LIMITS.medium), filter: pick(raw.filter, ["all", "hpg", "partner", "residential", "commercial"] as const, "all"), limit: count(raw.limit, 1, 12, 6), button_label: text(raw.button_label, `${where}: button label`, 60) };
        case "featured_project":
          return { id, type, background, button_label: text(raw.button_label, `${where}: button label`, 60) || "Explore project", brochure_label: text(raw.brochure_label, `${where}: brochure button label`, 60) };
        case "press":
        case "articles":
          return { id, type, background, eyebrow: heading(raw.eyebrow, "small heading"), heading: heading(raw.heading), accent: heading(raw.accent, "gold words"), link_label: text(raw.link_label, `${where}: link text`, 60), limit: count(raw.limit, 1, 6, 3) };
        case "projects_list":
        case "articles_list":
          return { id, type, background };
        case "press_list":
          return { id, type, background, show_contact: flag(raw.show_contact), contact_heading: heading(raw.contact_heading, "box heading"), contact_text: text(raw.contact_text, `${where}: box text`, PAGE_LIMITS.medium), contact_button: text(raw.contact_button, `${where}: box button`, 60) };
        case "contact_details":
          return { id, type, background, office_heading: heading(raw.office_heading, "office heading"), response_text: heading(raw.response_text, "response time"), visits_text: heading(raw.visits_text, "site visits") };
      }
    });
    // Each website page keeps its fixed section (e.g. the project list on the Projects page).
    for (const [fixedType, owner] of Object.entries(fixedSectionPage)) {
      if (owner !== options.systemKey) continue;
      const found = sections.filter((section) => section.type === fixedType).length;
      const label = sectionCatalog.find((entry) => entry.type === fixedType)?.label ?? fixedType;
      if (found !== 1) throw new PageInputError(`The "${label}" section is always on this page and can't be removed or copied.`);
    }
    return { content: { title, slug, meta_description, seo_title, share_image, sections } };
  } catch (error) {
    if (error instanceof PageInputError) return { error: error.message };
    throw error;
  }
}
