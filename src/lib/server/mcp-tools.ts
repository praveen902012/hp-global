/**
 * Tools offered by the content MCP endpoint (/api/mcp).
 *
 * Each tool calls the same admin API route handler the admin panel uses, so it
 * gets identical validation, HTML sanitising, slug checks and menu updates.
 * Leads (enquiries, contact requests) are deliberately not exposed, and there
 * are no tools that delete pages, articles, press clippings or projects.
 */
import * as pagesRoute from "../../app/api/admin/pages/route";
import * as pageRoute from "../../app/api/admin/pages/[id]/route";
import * as publishRoute from "../../app/api/admin/pages/[id]/publish/route";
import * as menuRoute from "../../app/api/admin/menu/route";
import * as siteDetailsRoute from "../../app/api/admin/site-details/route";
import * as blogsRoute from "../../app/api/admin/blogs/route";
import * as blogRoute from "../../app/api/admin/blogs/[id]/route";
import * as pressRoute from "../../app/api/admin/press/route";
import * as pressItemRoute from "../../app/api/admin/press/[id]/route";
import * as portfolioRoute from "../../app/api/admin/portfolio/route";
import * as projectRoute from "../../app/api/admin/portfolio/[id]/route";
import * as featuredRoute from "../../app/api/admin/featured-project/route";
import { createSection, ENQUIRE_LINK, normalizePageContent, fixedSectionPage, iconOptions, sectionCatalog, type PageSection, type SectionType, type SitePage } from "../../data/pages";
import { systemPagePath } from "../../data/systemPages";
import { emptyPressClipping, type PressClipping } from "../../data/press";
import type { McpScope } from "./mcp-context";
import { sanitizePageHtml } from "./page-content";

type Json = Record<string, unknown>;
type JsonSchema = Record<string, unknown>;
type Handler = (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>;

export class ToolError extends Error {}

export interface McpTool {
  name: string;
  title: string;
  description: string;
  scope: McpScope;
  inputSchema: JsonSchema;
  run: (args: Json) => Promise<unknown>;
}

/* ---------- helpers ---------- */

async function call(handler: unknown, method: string, path: string, body?: unknown, id?: number) {
  const request = new Request(`http://mcp.internal/api/admin${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const response = await (handler as Handler)(request, { params: Promise.resolve({ id: String(id ?? "") }) });
  const data = await response.json().catch(() => null) as Json | null;
  if (!response.ok) throw new ToolError(typeof data?.error === "string" ? data.error : `The request failed (${response.status}).`);
  return data;
}

const isPlainObject = (value: unknown): value is Json => !!value && typeof value === "object" && !Array.isArray(value);

/** Merges `changes` into `base`. Nested objects merge; arrays and plain values are replaced. */
function deepMerge(base: unknown, changes: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(changes)) return changes;
  const out: Json = { ...base };
  for (const [key, value] of Object.entries(changes)) out[key] = isPlainObject(value) && isPlainObject(base[key]) ? deepMerge(base[key], value) : value;
  return out;
}

function positiveInt(value: unknown, name: string) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new ToolError(`${name} must be a positive whole number.`);
  return number;
}

function objectArg(value: unknown, name: string) {
  if (!isPlainObject(value)) throw new ToolError(`${name} must be an object.`);
  return value;
}

/**
 * The page validator silently drops fields it doesn't accept. Run it before saving and
 * refuse if any field the caller sent would be lost, so the assistant learns the right names.
 */
function checkFieldsKept(page: SitePage, sections: unknown[], sectionId: string, type: SectionType, keys: string[]) {
  const parsed = normalizePageContent({ ...pageContent(page), sections }, sanitizePageHtml, page.system_key ? { fixedSlug: page.slug, systemKey: page.system_key } : {});
  if ("error" in parsed) return; // the save reports the real problem
  const saved = parsed.content.sections.find((section) => section.id === sectionId) as Json | undefined;
  if (!saved) return;
  const dropped = keys.filter((key) => key !== "id" && key !== "type" && !(key in saved));
  if (!dropped.length) return;
  const fields = [...new Set([...Object.keys(createSection(type)), ...Object.keys(saved)])].filter((key) => key !== "id" && key !== "type");
  throw new ToolError(`Nothing was saved: a ${type} section didn't accept ${dropped.map((key) => `"${key}"`).join(", ")} (unknown field or invalid value). Its fields are: ${fields.join(", ")}. See list_section_types for allowed values.`);
}

const str = (description: string, extra: JsonSchema = {}) => ({ type: "string", description, ...extra });
const int = (description: string) => ({ type: "integer", minimum: 1, description });
const schema = (properties: JsonSchema, required: string[] = []) => ({ type: "object", properties, required, additionalProperties: false });

const pageContent = (page: SitePage) => ({ title: page.title, slug: page.slug, meta_description: page.meta_description, seo_title: page.seo_title, share_image: page.share_image, sections: page.sections });
const getPage = async (id: number) => await call(pageRoute.GET, "GET", `/pages/${id}`, undefined, id) as unknown as SitePage;
const savePage = (id: number, content: unknown) => call(pageRoute.PUT, "PUT", `/pages/${id}`, content, id);

function withQuery(path: string, params: Record<string, unknown>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  const text = search.toString();
  return text ? `${path}?${text}` : path;
}

/* ---------- tools ---------- */

export const mcpTools: McpTool[] = [
  // Pages
  {
    name: "list_pages", title: "List pages", scope: "read",
    description: "Lists every page: the built-in website pages (Home, About, Services, …, always live) and custom pages (draft or published), with their id, path and status.",
    inputSchema: schema({}),
    run: async () => {
      const pages = await call(pagesRoute.GET, "GET", "/pages") as unknown as (SitePage & { section_count: number })[];
      return pages.map((page) => ({ id: page.id, title: page.title, path: systemPagePath(page.system_key, page.slug), status: page.system_key ? "website page (always live)" : page.status, system_key: page.system_key, section_count: page.section_count, updated_at: page.updated_at }));
    },
  },
  {
    name: "get_page", title: "Get a page", scope: "read",
    description: "Returns a page's full content: title, address, SEO fields and its sections in order. Give either the page id or its path (e.g. \"/about\", \"/\" for Home).",
    inputSchema: schema({ id: int("Page id from list_pages."), path: str("Page path, e.g. /about.") }),
    run: async (args) => {
      if (args.id !== undefined) return getPage(positiveInt(args.id, "id"));
      if (typeof args.path !== "string") throw new ToolError("Give the page id or path.");
      const wanted = `/${args.path.trim().replace(/^\/+|\/+$/g, "")}`;
      const pages = await call(pagesRoute.GET, "GET", "/pages") as unknown as SitePage[];
      const match = pages.find((page) => systemPagePath(page.system_key, page.slug) === wanted);
      if (!match) throw new ToolError(`No page has the path ${wanted}. Use list_pages to see them.`);
      return getPage(match.id);
    },
  },
  {
    name: "list_section_types", title: "List section types", scope: "read",
    description: "Describes every kind of page section, with an example of its fields (a fresh, empty section of that type). Read this before adding or reshaping sections.",
    inputSchema: schema({}),
    run: async () => ({
      notes: [
        `Button links can be a site path (/contact), a full https:// URL, or "${ENQUIRE_LINK}" to open the enquiry form.`,
        "Accented headings: put the words to colour gold in the matching `*_accent` field; they must appear in the heading text.",
        "Sections in the \"live\" group show data from Projects, Press or Articles; edit that data with the matching tools.",
        `"fixed" sections belong to one page each (${Object.entries(fixedSectionPage).map(([type, page]) => `${type} → /${page}`).join(", ")}) and can't be added elsewhere or removed.`,
        "Text fields that hold rich text accept simple HTML (p, h2, h3, strong, em, a, ul, ol, li); anything else is stripped.",
      ],
      icons: iconOptions.map((icon) => icon.value),
      types: sectionCatalog.map((entry) => {
        const { id: _id, ...template } = createSection(entry.type) as PageSection & { id: string };
        void _id;
        return { type: entry.type, label: entry.label, description: entry.description, group: entry.group, template };
      }),
    }),
  },
  {
    name: "create_page", title: "Create a page", scope: "write",
    description: "Creates a new custom page as a draft (not visible on the site) with starter sections. Publish it later with set_page_published.",
    inputSchema: schema({ title: str("Page title."), slug: str("Web address after the domain, lowercase with hyphens, e.g. nri-investment-desk.") }, ["title", "slug"]),
    run: (args) => call(pagesRoute.POST, "POST", "/pages", { title: args.title, slug: args.slug }),
  },
  {
    name: "update_page", title: "Update a page", scope: "write",
    description: "Changes a page's title, address, SEO fields or its whole list of sections. Only the fields you give change. Changes to website pages and published pages go live at once. To change a single section, prefer update_section.",
    inputSchema: schema({
      id: int("Page id."),
      title: str("Page title."),
      slug: str("Web address (custom pages only; website pages keep theirs)."),
      meta_description: str("Google description, about 160 characters."),
      seo_title: str("Title shown on Google. Blank uses \"<title> | <site name>\"."),
      share_image: str("Image URL used when the page is shared. Blank uses the default."),
      sections: { type: "array", items: { type: "object" }, description: "The complete, ordered list of sections. Keep each existing section's id." },
    }, ["id"]),
    run: async (args) => {
      const id = positiveInt(args.id, "id");
      const { id: _id, ...changes } = args;
      void _id;
      return savePage(id, { ...pageContent(await getPage(id)), ...changes });
    },
  },
  {
    name: "update_section", title: "Update a section", scope: "write",
    description: "Changes fields of one section on a page, found by its section id (from get_page). Only the fields you give change; its type can't be changed.",
    inputSchema: schema({ page_id: int("Page id."), section_id: str("The section's id."), changes: { type: "object", description: "Fields to change, e.g. {\"title\": \"…\"}." } }, ["page_id", "section_id", "changes"]),
    run: async (args) => {
      const id = positiveInt(args.page_id, "page_id");
      const changes = objectArg(args.changes, "changes");
      const page = await getPage(id);
      const index = page.sections.findIndex((section) => section.id === args.section_id);
      if (index < 0) throw new ToolError(`Section ${String(args.section_id)} isn't on this page. Use get_page to see the section ids.`);
      const current = page.sections[index];
      const sections = page.sections.map((section, position) => position === index ? { ...deepMerge(current, changes) as Json, id: current.id, type: current.type } : section);
      checkFieldsKept(page, sections, current.id, current.type, Object.keys(changes));
      return savePage(id, { ...pageContent(page), sections });
    },
  },
  {
    name: "add_section", title: "Add a section", scope: "write",
    description: "Adds a new section to a page, starting from that type's template (see list_section_types) with your fields filled in.",
    inputSchema: schema({
      page_id: int("Page id."),
      type: str("Section type, e.g. text, cards, faq, cta.", { enum: sectionCatalog.map((entry) => entry.type) }),
      fields: { type: "object", description: "Field values for the new section." },
      position: { type: "integer", minimum: 0, description: "Where to insert it (0 = top). Default: the end." },
    }, ["page_id", "type"]),
    run: async (args) => {
      const id = positiveInt(args.page_id, "page_id");
      const type = String(args.type) as SectionType;
      if (!sectionCatalog.some((entry) => entry.type === type)) throw new ToolError(`Unknown section type "${type}". Use list_section_types.`);
      const page = await getPage(id);
      const fields = args.fields === undefined ? {} : objectArg(args.fields, "fields");
      const fresh = createSection(type);
      const section = { ...deepMerge(fresh, fields) as Json, id: fresh.id, type };
      const sections: unknown[] = [...page.sections];
      const position = args.position === undefined ? sections.length : Math.min(Math.max(0, Number(args.position) || 0), sections.length);
      sections.splice(position, 0, section);
      checkFieldsKept(page, sections, fresh.id, type, Object.keys(fields));
      return savePage(id, { ...pageContent(page), sections });
    },
  },
  {
    name: "move_section", title: "Move a section", scope: "write",
    description: "Moves a section to a new position on its page (0 = top).",
    inputSchema: schema({ page_id: int("Page id."), section_id: str("The section's id."), position: { type: "integer", minimum: 0, description: "New position, 0 = top." } }, ["page_id", "section_id", "position"]),
    run: async (args) => {
      const id = positiveInt(args.page_id, "page_id");
      const page = await getPage(id);
      const index = page.sections.findIndex((section) => section.id === args.section_id);
      if (index < 0) throw new ToolError(`Section ${String(args.section_id)} isn't on this page.`);
      const sections = [...page.sections];
      const [moved] = sections.splice(index, 1);
      sections.splice(Math.min(Math.max(0, Number(args.position) || 0), sections.length), 0, moved);
      return savePage(id, { ...pageContent(page), sections });
    },
  },
  {
    name: "set_page_published", title: "Publish or unpublish a page", scope: "write",
    description: "Publishes a custom page (it goes live on the site) or turns it back into a draft (its menu links are removed). Website pages are always live and can't be unpublished. Confirm with the user before publishing.",
    inputSchema: schema({
      id: int("Page id."),
      published: { type: "boolean", description: "true to publish, false to make it a draft." },
      add_to_menu: { type: "array", items: { type: "string", enum: ["header", "footer"] }, description: "When publishing: menus to add a link to." },
      menu_label: str("When publishing: label for the menu link. Default: the page title."),
    }, ["id", "published"]),
    run: async (args) => {
      const id = positiveInt(args.id, "id");
      return call(publishRoute.POST, "POST", `/pages/${id}/publish`, { published: args.published === true, add_to_menu: args.add_to_menu, menu_label: args.menu_label }, id);
    },
  },

  // Menu and site details
  {
    name: "get_menu", title: "Get the menus", scope: "read",
    description: "Returns the header and footer menus: each link's label, href, whether it's shown (enabled) and whether it opens in a new tab.",
    inputSchema: schema({}),
    run: () => call(menuRoute.GET, "GET", "/menu"),
  },
  {
    name: "update_menu", title: "Update the menus", scope: "write",
    description: "Replaces the header and/or footer menu with the list you give (up to 12 links each). Lists you leave out stay as they are. Goes live at once.",
    inputSchema: schema({
      header: { type: "array", items: schema({ label: str("Link text."), href: str("Site path, https:// URL, mailto: or tel:."), enabled: { type: "boolean" }, new_tab: { type: "boolean" } }, ["label", "href"]) },
      footer: { type: "array", items: { type: "object" }, description: "Same shape as header." },
    }),
    run: async (args) => {
      const current = await call(menuRoute.GET, "GET", "/menu") as Json;
      const fill = (items: unknown) => Array.isArray(items) ? items.map((item) => ({ enabled: true, new_tab: false, ...objectArg(item, "menu link") })) : undefined;
      return call(menuRoute.PUT, "PUT", "/menu", { header: fill(args.header) ?? current.header, footer: fill(args.footer) ?? current.footer });
    },
  },
  {
    name: "get_site_details", title: "Get site details", scope: "read",
    description: "Returns the company details used across the site: name, tagline, phone, WhatsApp, email, address, social links and default share image.",
    inputSchema: schema({}),
    run: () => call(siteDetailsRoute.GET, "GET", "/site-details"),
  },
  {
    name: "update_site_details", title: "Update site details", scope: "write",
    description: "Changes site details (phone, email, address, social links …). Only the fields you give change. Goes live across the whole site at once.",
    inputSchema: schema({ changes: { type: "object", description: "Fields to change, using the names from get_site_details." } }, ["changes"]),
    run: async (args) => call(siteDetailsRoute.PUT, "PUT", "/site-details", deepMerge(await call(siteDetailsRoute.GET, "GET", "/site-details"), objectArg(args.changes, "changes"))),
  },

  // Articles (Journal)
  {
    name: "list_articles", title: "List articles", scope: "read",
    description: "Lists Journal articles (without their full text), newest first, 20 per page.",
    inputSchema: schema({ search: str("Words in the title or address."), status: str("Filter by status.", { enum: ["all", "draft", "published"] }), page: int("Page number, from 1.") }),
    run: async (args) => {
      const data = await call(blogsRoute.GET, "GET", withQuery("/blogs", { search: args.search, status: args.status === "all" ? undefined : args.status, page: args.page, limit: 20 })) as { items: Json[] } & Json;
      return { ...data, items: data.items.map(({ content: _content, ...item }) => { void _content; return item; }) };
    },
  },
  {
    name: "get_article", title: "Get an article", scope: "read",
    description: "Returns one Journal article in full, including its HTML text.",
    inputSchema: schema({ id: int("Article id.") }, ["id"]),
    run: (args) => { const id = positiveInt(args.id, "id"); return call(blogRoute.GET, "GET", `/blogs/${id}`, undefined, id); },
  },
  {
    name: "create_article", title: "Create an article", scope: "write",
    description: "Creates a Journal article. It's saved as a draft unless is_draft is false; publishing needs a summary, the text and a cover image.",
    inputSchema: schema({
      title: str("Headline."), slug: str("Web address, lowercase with hyphens."), author: str("Author. Default: HP Global Infrra."),
      snippet: str("Short summary shown on cards."), content: str("Article text as simple HTML."), image_url: str("Cover image URL (an uploaded /api/media/… image or https:// URL)."),
      published_at: str("Date, YYYY-MM-DD. Default: today."), is_draft: { type: "boolean", description: "Default true." },
    }, ["title", "slug"]),
    run: (args) => call(blogsRoute.POST, "POST", "/blogs", { ...args, is_draft: args.is_draft !== false }),
  },
  {
    name: "update_article", title: "Update an article", scope: "write",
    description: "Changes a Journal article. Only the fields you give change. Set is_draft false to publish, true to unpublish.",
    inputSchema: schema({ id: int("Article id."), changes: { type: "object", description: "Fields to change: title, slug, author, snippet, content, image_url, published_at, is_draft." } }, ["id", "changes"]),
    run: async (args) => {
      const id = positiveInt(args.id, "id");
      const current = await call(blogRoute.GET, "GET", `/blogs/${id}`, undefined, id);
      return call(blogRoute.PUT, "PUT", `/blogs/${id}`, { ...current, ...objectArg(args.changes, "changes") }, id);
    },
  },

  // Press
  {
    name: "list_press", title: "List press coverage", scope: "read",
    description: "Lists all press clippings (In the News): newspaper, TV and online coverage, with whether each is shown on the site.",
    inputSchema: schema({}),
    run: () => call(pressRoute.GET, "GET", "/press"),
  },
  {
    name: "create_press_clipping", title: "Add press coverage", scope: "write",
    description: "Adds a press clipping. media_type is print (needs image_url or document_url), video (needs video_url) or online (needs article_url).",
    inputSchema: schema({
      media_type: str("Kind of coverage.", { enum: ["print", "video", "online"] }), publication: str("Newspaper, channel or website."), headline: str("Headline."),
      summary: str("One or two sentences."), published_on: str("Date, YYYY-MM-DD."), project: str("Related project name, or blank."),
      image_url: str("Image URL."), document_url: str("PDF URL."), video_url: str("YouTube or Vimeo URL."), article_url: str("Link to the online story."),
      is_enabled: { type: "boolean", description: "Show on the site. Default true." },
    }, ["media_type", "publication", "headline"]),
    run: (args) => call(pressRoute.POST, "POST", "/press", { ...emptyPressClipping(), ...args }),
  },
  {
    name: "update_press_clipping", title: "Update press coverage", scope: "write",
    description: "Changes a press clipping. Only the fields you give change. Set is_enabled false to hide it from the site.",
    inputSchema: schema({ id: int("Clipping id."), changes: { type: "object", description: "Fields to change." } }, ["id", "changes"]),
    run: async (args) => {
      const id = positiveInt(args.id, "id");
      const { items } = await call(pressRoute.GET, "GET", "/press") as unknown as { items: PressClipping[] };
      const current = items.find((item) => item.id === id);
      if (!current) throw new ToolError("Press clipping not found.");
      return call(pressItemRoute.PUT, "PUT", `/press/${id}`, { ...current, ...objectArg(args.changes, "changes") }, id);
    },
  },

  // Projects
  {
    name: "list_projects", title: "List projects", scope: "read",
    description: "Lists portfolio projects, 20 per page. Filter by category (hpg = HP Global's own, partner) or type (residential, commercial).",
    inputSchema: schema({ search: str("Words in the title or location."), category: str("Category.", { enum: ["hpg", "partner"] }), type: str("Type.", { enum: ["residential", "commercial"] }), page: int("Page number, from 1.") }),
    run: (args) => call(portfolioRoute.GET, "GET", withQuery("/portfolio", { search: args.search, category: args.category, type: args.type, page: args.page, limit: 20 })),
  },
  {
    name: "get_project", title: "Get a project", scope: "read",
    description: "Returns one portfolio project in full: details, facts, images and its project page content.",
    inputSchema: schema({ id: int("Project id.") }, ["id"]),
    run: (args) => { const id = positiveInt(args.id, "id"); return call(projectRoute.GET, "GET", `/portfolio/${id}`, undefined, id); },
  },
  {
    name: "update_project", title: "Update a project", scope: "write",
    description: "Changes a portfolio project. Only the fields you give change; nested objects (like details) merge, lists are replaced.",
    inputSchema: schema({ id: int("Project id."), changes: { type: "object", description: "Fields to change, using the names from get_project." } }, ["id", "changes"]),
    run: async (args) => {
      const id = positiveInt(args.id, "id");
      const current = await call(projectRoute.GET, "GET", `/portfolio/${id}`, undefined, id);
      return call(projectRoute.PUT, "PUT", `/portfolio/${id}`, deepMerge(current, objectArg(args.changes, "changes")), id);
    },
  },
  {
    name: "get_featured_project", title: "Get the featured project", scope: "read",
    description: "Returns the content of the featured project page and its home-page block.",
    inputSchema: schema({}),
    run: () => call(featuredRoute.GET, "GET", "/featured-project"),
  },
  {
    name: "update_featured_project", title: "Update the featured project", scope: "write",
    description: "Changes the featured project content. Only the fields you give change; nested objects merge, lists are replaced.",
    inputSchema: schema({ changes: { type: "object", description: "Fields to change, using the names from get_featured_project." } }, ["changes"]),
    run: async (args) => call(featuredRoute.PUT, "PUT", "/featured-project", deepMerge(await call(featuredRoute.GET, "GET", "/featured-project"), objectArg(args.changes, "changes"))),
  },
];

export const toolsForScope = (scope: McpScope) => mcpTools.filter((tool) => scope === "write" || tool.scope === "read");
