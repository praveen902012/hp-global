import { isValidMenuHref } from "./siteMenu";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SectionBackground = "white" | "light" | "dark";

interface SectionBase { id: string; background: SectionBackground }

export interface HeroSection extends SectionBase {
  type: "hero"; eyebrow: string; title: string; accent_title: string; subtitle: string;
  image_url: string; button_label: string; button_href: string; height: "full" | "medium";
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
export interface CardsSection extends SectionBase {
  type: "cards"; heading: string; intro: string; cards: { image_url: string; title: string; description: string; link: string }[];
}
export interface StatsSection extends SectionBase {
  type: "stats"; heading: string; items: { value: string; label: string }[];
}
export interface VideoSection extends SectionBase {
  type: "video"; heading: string; url: string; caption: string;
}
export interface FaqSection extends SectionBase {
  type: "faq"; heading: string; items: { question: string; answer: string }[];
}
export interface CtaSection extends SectionBase {
  type: "cta"; heading: string; text: string; button_label: string; button_href: string;
}
export interface ContactFormSection extends SectionBase {
  type: "contact_form"; heading: string; intro: string;
}

export type PageSection =
  | HeroSection | TextSection | ImageTextSection | GallerySection | CardsSection
  | StatsSection | VideoSection | FaqSection | CtaSection | ContactFormSection;
export type SectionType = PageSection["type"];

export type PageStatus = "draft" | "published";

export interface PageContent {
  title: string;
  slug: string;
  meta_description: string;
  sections: PageSection[];
}

export interface SitePage extends PageContent {
  id: number;
  /** Set for built-in site pages (e.g. "about"): fixed URL, always live, cannot be deleted. */
  system_key: string | null;
  status: PageStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export type PageSummary = Omit<SitePage, "sections" | "meta_description"> & { section_count: number };

/* ------------------------------------------------------------------ */
/* Section catalogue (labels, descriptions and starter content)        */
/* ------------------------------------------------------------------ */

export const sectionCatalog: { type: SectionType; label: string; description: string }[] = [
  { type: "hero", label: "Hero banner", description: "Large heading over a background image, with an optional button." },
  { type: "text", label: "Text", description: "Heading and formatted paragraphs." },
  { type: "image_text", label: "Image + text", description: "An image beside a heading, text and optional button." },
  { type: "gallery", label: "Image gallery", description: "A grid of photos." },
  { type: "cards", label: "Cards", description: "A row of cards with image, title, text and link." },
  { type: "stats", label: "Key figures", description: "Big numbers with labels, e.g. 25+ Projects." },
  { type: "video", label: "Video", description: "Embedded YouTube or Vimeo video." },
  { type: "faq", label: "FAQ", description: "Questions that expand to show answers." },
  { type: "cta", label: "Call to action", description: "A banner with a heading and a button." },
  { type: "contact_form", label: "Contact form", description: "Name, email and message form; replies arrive in Contact Requests." },
];

export function newSectionId() {
  return `s_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function createSection(type: SectionType): PageSection {
  const id = newSectionId();
  switch (type) {
    case "hero": return { id, type, background: "dark", eyebrow: "", title: "Page title", accent_title: "", subtitle: "", image_url: "/hero_banner_real_estate_1774769760013.png", button_label: "", button_href: "", height: "medium" };
    case "text": return { id, type, background: "white", eyebrow: "", heading: "Section heading", body: "<p>Write your content here.</p>", align: "left" };
    case "image_text": return { id, type, background: "white", eyebrow: "", heading: "Section heading", accent_heading: "", body: "<p>Write your content here.</p>", image_url: "/commercial_building_investment_1774769793820.png", image_alt: "", image_position: "right", button_label: "", button_href: "" };
    case "gallery": return { id, type, background: "white", heading: "Gallery", columns: 3, images: [] };
    case "cards": return { id, type, background: "light", heading: "Highlights", intro: "", cards: [{ image_url: "", title: "Card title", description: "Short description.", link: "" }] };
    case "stats": return { id, type, background: "dark", heading: "", items: [{ value: "25+", label: "Years of experience" }, { value: "100+", label: "Projects delivered" }, { value: "5,000+", label: "Happy families" }] };
    case "video": return { id, type, background: "white", heading: "", url: "", caption: "" };
    case "faq": return { id, type, background: "light", heading: "Frequently asked questions", items: [{ question: "Your question?", answer: "The answer." }] };
    case "cta": return { id, type, background: "dark", heading: "Ready to talk?", text: "Our team will get back to you within 24 hours.", button_label: "Contact us", button_href: "/contact" };
    case "contact_form": return { id, type, background: "light", heading: "Get in touch", intro: "" };
  }
}

export const starterSections = (): PageSection[] => [createSection("hero"), createSection("text")];

/* ------------------------------------------------------------------ */
/* Built-in site pages that admins can edit with the page builder      */
/* ------------------------------------------------------------------ */

export interface SystemPageDefinition { key: string; slug: string; title: string; meta_description: string; sections: () => PageSection[] }

export const systemPages: SystemPageDefinition[] = [
  {
    key: "about",
    slug: "about",
    title: "Our Story",
    meta_description: "HP Global Infrra is committed to excellence in every facet of real estate, from investment advisory to property management.",
    // Same content and layout as the original hard-coded Our Story page.
    sections: () => [{
      id: "about_intro", type: "image_text", background: "white", eyebrow: "Our Origin", heading: "A Commitment to", accent_heading: "Excellence",
      body: "<p>At HP Global Infrra, we are committed to excellence in every facet of real estate. Our services range from investment advisory to property management, focusing on high-end projects that make a difference.</p><p>Our specialized approach includes mixed-use developments, smart solutions, and residential excellence, all backed by profound market insights.</p>",
      tagline: "Join us in shaping a new era of real estate advancement.",
      image_url: "/hero_banner_real_estate_1774769760013.png", image_alt: "HP Global Infrra Building", image_position: "right", button_label: "", button_href: "",
    }],
  },
];

export const systemPageByKey = (key: string | null | undefined) => systemPages.find((page) => page.key === key);

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

export const PAGE_LIMITS = { sections: 30, listItems: 24, short: 160, medium: 600, long: 2000, html: 60000, title: 120, meta: 300 };

class PageInputError extends Error {}

type Raw = Record<string, unknown>;
const obj = (value: unknown): Raw => (value && typeof value === "object" && !Array.isArray(value) ? value as Raw : {});
const pick = <T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(value as T) ? value as T : fallback);

function text(value: unknown, where: string, max: number, required = false) {
  const result = String(value ?? "").trim();
  if (required && !result) throw new PageInputError(`${where} is required.`);
  if (result.length > max) throw new PageInputError(`${where} must be ${max} characters or fewer.`);
  return result;
}
function link(value: unknown, where: string) {
  const result = text(value, where, 500);
  if (result && !isValidMenuHref(result)) throw new PageInputError(`${where} must be a site path like /contact, a full https:// URL, or a mailto:/tel: link.`);
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
export function normalizePageContent(value: unknown, sanitizeHtml: (html: string) => string = (html) => html, options: { fixedSlug?: string } = {}): { content: PageContent } | { error: string } {
  try {
    const input = obj(value);
    const title = text(input.title, "Page title", PAGE_LIMITS.title, true);
    // Built-in site pages keep their fixed URL (which is otherwise a reserved slug).
    const slug = options.fixedSlug ?? String(input.slug ?? "").trim().toLowerCase();
    const slugProblem = options.fixedSlug ? null : slugError(slug);
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
      let id = typeof raw.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(raw.id) ? raw.id : newSectionId();
      if (seen.has(id)) id = newSectionId();
      seen.add(id);
      const background = pick(raw.background, ["white", "light", "dark"] as const, "white");
      const html = (field: unknown, name: string) => {
        const result = sanitizeHtml(String(field ?? "")).trim();
        if (result.length > PAGE_LIMITS.html) throw new PageInputError(`${where}: ${name} is too long.`);
        return result;
      };

      switch (type) {
        case "hero": {
          const section: HeroSection = { id, type, background, eyebrow: text(raw.eyebrow, `${where}: small heading`, PAGE_LIMITS.short), title: text(raw.title, `${where}: title`, PAGE_LIMITS.short, true), accent_title: text(raw.accent_title, `${where}: accent title`, PAGE_LIMITS.short), subtitle: text(raw.subtitle, `${where}: subtitle`, PAGE_LIMITS.medium), image_url: image(raw.image_url, `${where}: background image`), button_label: text(raw.button_label, `${where}: button label`, 60), button_href: link(raw.button_href, `${where}: button link`), height: pick(raw.height, ["full", "medium"] as const, "medium") };
          buttonPair(section.button_label, section.button_href, where);
          return section;
        }
        case "text":
          return { id, type, background, eyebrow: text(raw.eyebrow, `${where}: small heading`, PAGE_LIMITS.short), heading: text(raw.heading, `${where}: heading`, PAGE_LIMITS.short), body: html(raw.body, "text"), align: pick(raw.align, ["left", "center"] as const, "left") };
        case "image_text": {
          const section: ImageTextSection = { id, type, background, eyebrow: text(raw.eyebrow, `${where}: small heading`, PAGE_LIMITS.short), heading: text(raw.heading, `${where}: heading`, PAGE_LIMITS.short), accent_heading: text(raw.accent_heading, `${where}: gold second line`, PAGE_LIMITS.short), body: html(raw.body, "text"), image_url: image(raw.image_url, `${where}: image`, true), image_alt: text(raw.image_alt, `${where}: image description`, PAGE_LIMITS.short), image_position: pick(raw.image_position, ["left", "right"] as const, "right"), tagline: text(raw.tagline, `${where}: closing line`, PAGE_LIMITS.short), button_label: text(raw.button_label, `${where}: button label`, 60), button_href: link(raw.button_href, `${where}: button link`) };
          buttonPair(section.button_label, section.button_href, where);
          return section;
        }
        case "gallery":
          return { id, type, background, heading: text(raw.heading, `${where}: heading`, PAGE_LIMITS.short), columns: pick(Number(raw.columns), [2, 3, 4] as const, 3), images: list(raw.images, `${where}: images`).map((item, position) => ({ src: image(item.src, `${where}: image ${position + 1}`, true), alt: text(item.alt, `${where}: image ${position + 1} description`, PAGE_LIMITS.short) })) };
        case "cards":
          return { id, type, background, heading: text(raw.heading, `${where}: heading`, PAGE_LIMITS.short), intro: text(raw.intro, `${where}: intro`, PAGE_LIMITS.medium), cards: list(raw.cards, `${where}: cards`).map((item, position) => ({ image_url: image(item.image_url, `${where}: card ${position + 1} image`), title: text(item.title, `${where}: card ${position + 1} title`, PAGE_LIMITS.short, true), description: text(item.description, `${where}: card ${position + 1} text`, PAGE_LIMITS.medium), link: link(item.link, `${where}: card ${position + 1} link`) })) };
        case "stats":
          return { id, type, background, heading: text(raw.heading, `${where}: heading`, PAGE_LIMITS.short), items: list(raw.items, `${where}: figures`).map((item, position) => ({ value: text(item.value, `${where}: figure ${position + 1} number`, 30, true), label: text(item.label, `${where}: figure ${position + 1} label`, 80, true) })) };
        case "video": {
          const url = text(raw.url, `${where}: video link`, 500);
          if (url && !toVideoEmbedUrl(url)) throw new PageInputError(`${where}: use a YouTube or Vimeo link.`);
          return { id, type, background, heading: text(raw.heading, `${where}: heading`, PAGE_LIMITS.short), url, caption: text(raw.caption, `${where}: caption`, PAGE_LIMITS.medium) };
        }
        case "faq":
          return { id, type, background, heading: text(raw.heading, `${where}: heading`, PAGE_LIMITS.short), items: list(raw.items, `${where}: questions`).map((item, position) => ({ question: text(item.question, `${where}: question ${position + 1}`, PAGE_LIMITS.medium, true), answer: text(item.answer, `${where}: answer ${position + 1}`, PAGE_LIMITS.long, true) })) };
        case "cta": {
          const section: CtaSection = { id, type, background, heading: text(raw.heading, `${where}: heading`, PAGE_LIMITS.short, true), text: text(raw.text, `${where}: text`, PAGE_LIMITS.medium), button_label: text(raw.button_label, `${where}: button label`, 60), button_href: link(raw.button_href, `${where}: button link`) };
          buttonPair(section.button_label, section.button_href, where);
          return section;
        }
        case "contact_form":
          return { id, type, background, heading: text(raw.heading, `${where}: heading`, PAGE_LIMITS.short), intro: text(raw.intro, `${where}: intro`, PAGE_LIMITS.medium) };
      }
    });
    return { content: { title, slug, meta_description, sections } };
  } catch (error) {
    if (error instanceof PageInputError) return { error: error.message };
    throw error;
  }
}
