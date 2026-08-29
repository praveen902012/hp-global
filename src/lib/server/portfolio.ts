import { query } from "./db";

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
}

const seedProjects: Omit<PortfolioProject, "id" | "is_enabled">[] = [
  { portfolio_category: "hpg", project_type: "residential", title: "Amrit Aarogyam", location: "Haridwar, Uttarakhand", description: "Wellness-centric luxury living with premium apartments, sky penthouses and therapeutic landscapes.", price: "Contact for pricing", image_url: "/assets/featured-project-details/projects-image/slider-05.jpg", tags: ["Wellness Living", "Premium Residences", "Haridwar"], sort_order: 1 },
  { portfolio_category: "partner", project_type: "commercial", title: "Trehan IRIS Broadway", location: "Greater Noida (West)", description: "A retail-led landmark with high-street retail, food court, multiplex and corporate offices.", price: "₹14 Lakhs*", image_url: "/images/iris_broadway.png", tags: ["Anchor Stores", "Food Court & Multiplex", "130M Road Frontage"], sort_order: 1 },
  { portfolio_category: "partner", project_type: "commercial", title: "Apex Park Square", location: "Greater Noida (West)", description: "Pre-leased retail, entertainment and lifestyle development with double-height shops.", price: "₹21 Lakhs*", image_url: "/images/apex_park_square.png", tags: ["90% Pre-Leased", "Double Height Shops", "600+ Cars Parking"], sort_order: 2 },
  { portfolio_category: "partner", project_type: "residential", title: "Forest Walk", location: "NH 24, Ghaziabad", description: "Fully-furnished boutique villas nestled in rich green environments.", price: "₹16,633/Sq.ft*", image_url: "/images/forestwalk.jpeg", tags: ["Furnished Villas", "Lush Greenery", "Possession 15 Mos"], sort_order: 1 },
  { portfolio_category: "partner", project_type: "residential", title: "Sobha Noida", location: "Noida", description: "Grandiose living crafted with German engineering and world-class aesthetics.", price: "Upcoming", image_url: "/images/sobha.jpg", tags: ["German Engineering", "Upcoming Launch", "1456 Quality Checks"], sort_order: 2 },
  { portfolio_category: "partner", project_type: "residential", title: "TRUMP TOWER", location: "Sector 94, Noida", description: "Ultra-luxury residences with private elevators and skyline views.", price: "₹18–20 Cr", image_url: "/images/trump_tower.png", tags: ["Trump Brand Prestige", "Private Elevators", "Skyline Views"], sort_order: 3 },
  { portfolio_category: "partner", project_type: "residential", title: "Jacob & Co.", location: "Sector 97, Noida", description: "Iconic luxury residences with a signature clubhouse and expansive living spaces.", price: "₹8.40 Cr*", image_url: "/images/jacob_co.png", tags: ["G+39 Skyscrapers", "Signature Clubhouse", "Luxury Living"], sort_order: 4 },
  { portfolio_category: "partner", project_type: "residential", title: "CRC JOYOUS", location: "Techzone 4, Greater Noida (West)", description: "Luxury apartments and penthouses close to the proposed metro station.", price: "₹2.26 Cr", image_url: "/images/crc_joyous.png", tags: ["2, 3 & 4 BHK", "Proposed Metro", "RERA Compliant"], sort_order: 5 },
];

export async function ensurePortfolioSeed() {
  const count = await query<{ count: number }>("SELECT COUNT(*)::int AS count FROM portfolio_projects");
  if (count.rows[0]?.count) return;
  await Promise.all(seedProjects.map((project) => query(
    `INSERT INTO portfolio_projects (portfolio_category, project_type, title, location, description, price, image_url, tags, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [project.portfolio_category, project.project_type, project.title, project.location, project.description, project.price, project.image_url, project.tags, project.sort_order],
  )));
}

export async function listPortfolioProjects() {
  await ensurePortfolioSeed();
  return (await query<PortfolioProject>("SELECT id, portfolio_category, project_type, title, location, description, price, image_url, tags, sort_order, is_enabled FROM portfolio_projects WHERE is_enabled = TRUE ORDER BY portfolio_category, project_type, sort_order, id")).rows;
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
  const projects = await query<PortfolioProject>(`SELECT id, portfolio_category, project_type, title, location, description, price, image_url, tags, sort_order, is_enabled FROM portfolio_projects ${where} ORDER BY portfolio_category, project_type, sort_order, id LIMIT ${limit} OFFSET ${offset}`, values);
  return { items: projects.rows, pagination: { page: options.page, limit: options.limit, total: total.rows[0]?.count || 0 } };
}
