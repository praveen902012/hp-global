import { query } from "./db";
import { getFeaturedProject } from "./featured-project";
import { toVideoEmbedUrl } from "../../data/pages";
import { buildProjectPage, normalizeProjectDetails, slugify, type ProjectDetails, type PublicProject } from "../../data/projects";

export type PortfolioCategory = "hpg" | "partner";
export type ProjectType = "commercial" | "residential";

export interface PortfolioProject {
  id: number;
  portfolio_category: PortfolioCategory;
  project_type: ProjectType;
  title: string;
  location: string;
  description: string;
  price: string;
  image_url: string;
  tags: string[];
  sort_order: number;
  is_enabled: boolean;
  slug: string;
  status: string;
  is_featured: boolean;
  details: ProjectDetails;
}

const COLUMNS = "id, portfolio_category, project_type, title, location, description, price, image_url, tags, sort_order, is_enabled, slug, status, is_featured, details";

const seedProjects: Omit<PortfolioProject, "id" | "is_enabled" | "slug" | "is_featured" | "details">[] = [
  { portfolio_category: "hpg", project_type: "residential", title: "Amrit Aarogyam", location: "Haridwar, Uttarakhand", description: "Wellness-centric luxury living with premium apartments, sky penthouses and therapeutic landscapes.", price: "Contact for pricing", image_url: "/assets/featured-project-details/projects-image/slider-05.jpg", tags: ["Wellness Living", "Premium Residences", "Haridwar"], sort_order: 1, status: "Now booking" },
  { portfolio_category: "partner", project_type: "commercial", title: "Trehan IRIS Broadway", location: "Greater Noida (West)", description: "A retail-led landmark with high-street retail, food court, multiplex and corporate offices.", price: "₹14 Lakhs*", image_url: "/images/iris_broadway.png", tags: ["Anchor Stores", "Food Court & Multiplex", "130M Road Frontage"], sort_order: 1, status: "" },
  { portfolio_category: "partner", project_type: "commercial", title: "Apex Park Square", location: "Greater Noida (West)", description: "Pre-leased retail, entertainment and lifestyle development with double-height shops.", price: "₹21 Lakhs*", image_url: "/images/apex_park_square.png", tags: ["90% Pre-Leased", "Double Height Shops", "600+ Cars Parking"], sort_order: 2, status: "" },
  { portfolio_category: "partner", project_type: "residential", title: "Forest Walk", location: "NH 24, Ghaziabad", description: "Fully-furnished boutique villas nestled in rich green environments.", price: "₹16,633/Sq.ft*", image_url: "/images/forestwalk.jpeg", tags: ["Furnished Villas", "Lush Greenery", "Possession 15 Mos"], sort_order: 1, status: "" },
  { portfolio_category: "partner", project_type: "residential", title: "Sobha Noida", location: "Noida", description: "Grandiose living crafted with German engineering and world-class aesthetics.", price: "Upcoming", image_url: "/images/sobha.jpg", tags: ["German Engineering", "Upcoming Launch", "1456 Quality Checks"], sort_order: 2, status: "Upcoming" },
  { portfolio_category: "partner", project_type: "residential", title: "TRUMP TOWER", location: "Sector 94, Noida", description: "Ultra-luxury residences with private elevators and skyline views.", price: "₹18–20 Cr", image_url: "/images/trump_tower.png", tags: ["Trump Brand Prestige", "Private Elevators", "Skyline Views"], sort_order: 3, status: "" },
  { portfolio_category: "partner", project_type: "residential", title: "Jacob & Co.", location: "Sector 97, Noida", description: "Iconic luxury residences with a signature clubhouse and expansive living spaces.", price: "₹8.40 Cr*", image_url: "/images/jacob_co.png", tags: ["G+39 Skyscrapers", "Signature Clubhouse", "Luxury Living"], sort_order: 4, status: "" },
  { portfolio_category: "partner", project_type: "residential", title: "CRC JOYOUS", location: "Techzone 4, Greater Noida (West)", description: "Luxury apartments and penthouses close to the proposed metro station.", price: "₹2.26 Cr", image_url: "/images/crc_joyous.png", tags: ["2, 3 & 4 BHK", "Proposed Metro", "RERA Compliant"], sort_order: 5, status: "" },
];

let backfilled: Promise<void> | null = null;

/** Gives older projects a URL slug, and marks the featured project, the first time the site runs after upgrading. */
async function backfillProjectPages() {
  const missing = await query<{ id: number; title: string }>("SELECT id, title FROM portfolio_projects WHERE slug IS NULL ORDER BY id");
  for (const row of missing.rows) await query("UPDATE portfolio_projects SET slug = $2 WHERE id = $1", [row.id, await uniqueSlug(row.title, row.id)]);
  if (!missing.rows.length) return;
  const featured = await query<{ count: number }>("SELECT COUNT(*)::int AS count FROM portfolio_projects WHERE is_featured");
  if (!featured.rows[0]?.count) {
    const content = await getFeaturedProject().catch(() => null);
    const name = (content?.home.cardTitle || `${content?.hero.title ?? ""} ${content?.hero.accentTitle ?? ""}`).trim();
    if (name) await query("UPDATE portfolio_projects SET is_featured = TRUE WHERE id = (SELECT id FROM portfolio_projects WHERE lower(title) = lower($1) ORDER BY id LIMIT 1)", [name]);
  }
}

export async function ensurePortfolioSeed() {
  const count = await query<{ count: number }>("SELECT COUNT(*)::int AS count FROM portfolio_projects");
  if (!count.rows[0]?.count) {
    for (const project of seedProjects) {
      await query(
        `INSERT INTO portfolio_projects (portfolio_category, project_type, title, location, description, price, image_url, tags, sort_order, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [project.portfolio_category, project.project_type, project.title, project.location, project.description, project.price, project.image_url, project.tags, project.sort_order, project.status],
      );
    }
  }
  backfilled ??= backfillProjectPages().catch((error) => { backfilled = null; throw error; });
  await backfilled;
}

/** A slug based on `title` that no other project uses. */
export async function uniqueSlug(title: string, excludeId: number | null = null, wanted?: string) {
  const base = slugify(wanted || title) || "project";
  for (let attempt = 1; attempt < 50; attempt += 1) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`;
    const taken = await query("SELECT 1 FROM portfolio_projects WHERE slug = $1 AND ($2::bigint IS NULL OR id <> $2)", [candidate, excludeId]);
    if (!taken.rowCount) return candidate;
  }
  return `${base}-${Date.now()}`;
}

function mapRow(row: PortfolioProject): PortfolioProject {
  return { ...row, details: normalizeProjectDetails(row.details) };
}

export function toPublicProject(project: PortfolioProject): PublicProject {
  const { id, slug, portfolio_category, project_type, title, location, description, price, image_url, tags, status, is_featured } = project;
  return { id, slug, portfolio_category, project_type, title, location, description, price, image_url, tags, status, is_featured };
}

export async function listPortfolioProjects() {
  await ensurePortfolioSeed();
  const rows = (await query<PortfolioProject>(`SELECT ${COLUMNS} FROM portfolio_projects WHERE is_enabled = TRUE ORDER BY is_featured DESC, portfolio_category, project_type, sort_order, id`)).rows;
  return rows.map(mapRow);
}

/** Public listing without page content. Never throws: an empty list is returned if the database is unavailable. */
export async function listPublicProjectsSafe(): Promise<PublicProject[]> {
  try {
    return (await listPortfolioProjects()).map(toPublicProject);
  } catch (error) {
    console.error("Failed to load portfolio projects", error);
    return [];
  }
}

export async function getProjectPageBySlug(slug: string) {
  await ensurePortfolioSeed();
  const result = await query<PortfolioProject>(`SELECT ${COLUMNS} FROM portfolio_projects WHERE slug = $1 AND is_enabled = TRUE LIMIT 1`, [slug]);
  const row = result.rows[0];
  if (!row) return null;
  const project = mapRow(row);
  const featured = project.is_featured ? await getFeaturedProject() : null;
  return buildProjectPage(toPublicProject(project), project.details, featured, toVideoEmbedUrl);
}

export async function getPortfolioProject(id: number) {
  await ensurePortfolioSeed();
  const result = await query<PortfolioProject>(`SELECT ${COLUMNS} FROM portfolio_projects WHERE id = $1`, [id]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function getFeaturedProjectSlug() {
  await ensurePortfolioSeed();
  const result = await query<{ slug: string }>("SELECT slug FROM portfolio_projects WHERE is_featured AND is_enabled ORDER BY id LIMIT 1");
  return result.rows[0]?.slug ?? null;
}

export async function listPortfolioProjectPage(options: {
  page: number;
  limit: number;
  search?: string;
  category?: PortfolioCategory;
  type?: ProjectType;
}) {
  await ensurePortfolioSeed();
  const clauses: string[] = [];
  const values: unknown[] = [];
  const add = (value: unknown) => { values.push(value); return `$${values.length}`; };
  if (options.search) { const parameter = add(`%${options.search}%`); clauses.push(`(title ILIKE ${parameter} OR location ILIKE ${parameter})`); }
  if (options.category) clauses.push(`portfolio_category = ${add(options.category)}`);
  if (options.type) clauses.push(`project_type = ${add(options.type)}`);
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = await query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM portfolio_projects ${where}`, values);
  const limit = add(options.limit);
  const offset = add((options.page - 1) * options.limit);
  const projects = await query<PortfolioProject>(`SELECT ${COLUMNS} FROM portfolio_projects ${where} ORDER BY is_featured DESC, portfolio_category, project_type, sort_order, id LIMIT ${limit} OFFSET ${offset}`, values);
  return { items: projects.rows.map(mapRow), pagination: { page: options.page, limit: options.limit, total: total.rows[0]?.count || 0 } };
}

/** Validated admin input for creating or updating a project. */
export function portfolioInput(body: Record<string, unknown>) {
  const tags = Array.isArray(body.tags) ? body.tags.map(String).map((tag) => tag.trim()).filter(Boolean) : String(body.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
  return {
    portfolio_category: String(body.portfolio_category || "") as PortfolioCategory,
    project_type: String(body.project_type || "") as ProjectType,
    title: String(body.title || "").trim(),
    location: String(body.location || "").trim(),
    description: String(body.description || "").trim(),
    price: String(body.price || "").trim(),
    image_url: String(body.image_url || "").trim(),
    tags,
    sort_order: Number(body.sort_order || 0),
    is_enabled: body.is_enabled !== false,
    slug: String(body.slug || "").trim().toLowerCase(),
    status: String(body.status || "").trim().slice(0, 40),
    is_featured: body.is_featured === true,
    details: normalizeProjectDetails(body.details),
  };
}
export type PortfolioInput = ReturnType<typeof portfolioInput>;

export function portfolioInputError(value: PortfolioInput) {
  if (!["hpg", "partner"].includes(value.portfolio_category) || !["commercial", "residential"].includes(value.project_type)) return "Choose a category and project type.";
  if (!value.title || !value.location || !value.description || !value.image_url) return "Complete all required project fields.";
  if (!Number.isFinite(value.sort_order)) return "Display order must be a number.";
  if (value.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) return "Page address may only use lowercase letters, numbers and hyphens.";
  return null;
}

/** Saves a project (insert when id is null). Keeps slugs unique and only one project featured. */
export async function savePortfolioProject(id: number | null, value: PortfolioInput) {
  const slug = await uniqueSlug(value.title, id, value.slug || undefined);
  if (value.is_featured) await query("UPDATE portfolio_projects SET is_featured = FALSE WHERE is_featured AND ($1::bigint IS NULL OR id <> $1)", [id]);
  const params = [value.portfolio_category, value.project_type, value.title, value.location, value.description, value.price, value.image_url, value.tags, value.sort_order, value.is_enabled, slug, value.status, value.is_featured, JSON.stringify(value.details)];
  const result = id === null
    ? await query<PortfolioProject>(`INSERT INTO portfolio_projects (portfolio_category, project_type, title, location, description, price, image_url, tags, sort_order, is_enabled, slug, status, is_featured, details) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING ${COLUMNS}`, params)
    : await query<PortfolioProject>(`UPDATE portfolio_projects SET portfolio_category=$1, project_type=$2, title=$3, location=$4, description=$5, price=$6, image_url=$7, tags=$8, sort_order=$9, is_enabled=$10, slug=$11, status=$12, is_featured=$13, details=$14, updated_at=NOW() WHERE id=$15 RETURNING ${COLUMNS}`, [...params, id]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}
