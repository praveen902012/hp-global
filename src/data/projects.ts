import { iframeUrl, type FeaturedProjectContent } from "./featuredProject";

/** Extra content shown on a project's own page (stored as JSON on the portfolio project). */
export interface ProjectDetails {
  hero_image: string;
  overview: string;
  highlights: string[];
  facts: { label: string; value: string }[];
  video_url: string;
  gallery: { src: string; alt: string }[];
  amenities: { name: string; icon: string }[];
  layout_image: string;
  construction_images: string[];
  documents: { name: string; url: string; size: string }[];
}

export const emptyProjectDetails: ProjectDetails = {
  hero_image: "", overview: "", highlights: [], facts: [], video_url: "", gallery: [], amenities: [], layout_image: "", construction_images: [], documents: [],
};

const text = (value: unknown, max = 2000) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const list = (value: unknown, limit: number) => (Array.isArray(value) ? value.slice(0, limit) : []);
const record = (value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : {});

/** Cleans untrusted input into a ProjectDetails object (unknown keys are dropped). */
export function normalizeProjectDetails(value: unknown): ProjectDetails {
  const input = record(value);
  return {
    hero_image: text(input.hero_image, 500),
    overview: text(input.overview, 4000),
    highlights: list(input.highlights, 12).map((item) => text(item, 200)).filter(Boolean),
    facts: list(input.facts, 12).map((item) => ({ label: text(record(item).label, 60), value: text(record(item).value, 120) })).filter((item) => item.label && item.value),
    video_url: text(input.video_url, 500),
    gallery: list(input.gallery, 60).map((item) => ({ src: text(record(item).src, 500), alt: text(record(item).alt, 200) })).filter((item) => item.src),
    amenities: list(input.amenities, 40).map((item) => ({ name: text(record(item).name, 80), icon: text(record(item).icon, 500) })).filter((item) => item.name),
    layout_image: text(input.layout_image, 500),
    construction_images: list(input.construction_images, 40).map((item) => text(item, 500)).filter(Boolean),
    documents: list(input.documents, 30).map((item) => ({ name: text(record(item).name, 160), url: text(record(item).url, 500), size: text(record(item).size, 30) })).filter((item) => item.name && item.url),
  };
}

export const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

/** What a public project card/page needs. */
export interface PublicProject {
  id: number;
  slug: string;
  portfolio_category: "hpg" | "partner";
  project_type: "commercial" | "residential";
  title: string;
  location: string;
  description: string;
  price: string;
  image_url: string;
  tags: string[];
  status: string;
  is_featured: boolean;
}

export interface ProjectPage extends PublicProject {
  /** Heading shown on the page; `title` stays the project's name (used for enquiries and press). */
  display_title: string;
  accent_title: string;
  eyebrow: string;
  hero_image: string;
  overview: string;
  highlights: string[];
  facts: { label: string; value: string }[];
  video: { src: string; title: string } | null;
  gallery: { src: string; alt: string }[];
  amenities: { name: string; icon: string }[];
  layout_image: string;
  construction: { video_url: string; poster_url: string; images: string[] };
  documents: { name: string; url: string; size: string }[];
  enquiry: { status: string; items: string[]; button_label: string; note: string };
}

export const categoryLabel = (category: PublicProject["portfolio_category"]) => (category === "hpg" ? "HPG development" : "Partner project");
export const typeLabel = (type: PublicProject["project_type"]) => (type === "commercial" ? "Commercial" : "Residential");

/** Builds the page model; the featured project takes its media from the Featured Project editor. */
export function buildProjectPage(project: PublicProject, details: ProjectDetails, featured: FeaturedProjectContent | null, videoSrc: (url: string) => string | null): ProjectPage {
  if (project.is_featured && featured) {
    return {
      ...project,
      display_title: featured.hero.title || project.title,
      accent_title: featured.hero.accentTitle,
      eyebrow: featured.hero.eyebrow,
      location: featured.hero.location || project.location,
      hero_image: featured.hero.image_url || project.image_url,
      overview: details.overview || featured.home.description || project.description,
      highlights: details.highlights.length ? details.highlights : featured.sidebar.items,
      facts: details.facts,
      video: featured.iframe.src ? { src: iframeUrl(featured.iframe), title: featured.iframe.title } : null,
      gallery: featured.gallery,
      amenities: featured.amenities,
      layout_image: featured.layout.image_url,
      construction: featured.construction,
      documents: featured.documents,
      enquiry: featured.sidebar,
      status: project.status || featured.sidebar.status,
    };
  }
  const embed = details.video_url ? videoSrc(details.video_url) : null;
  return {
    ...project,
    display_title: project.title,
    accent_title: "",
    eyebrow: categoryLabel(project.portfolio_category),
    hero_image: details.hero_image || project.image_url,
    overview: details.overview || project.description,
    highlights: details.highlights.length ? details.highlights : project.tags,
    facts: details.facts,
    video: embed ? { src: embed, title: `${project.title} video` } : null,
    gallery: details.gallery,
    amenities: details.amenities,
    layout_image: details.layout_image,
    construction: { video_url: "", poster_url: "", images: details.construction_images },
    documents: details.documents,
    enquiry: { status: project.status, items: [], button_label: "Enquire now", note: "Our team will contact you within 24 hours to discuss your requirements." },
  };
}
