import type { Metadata } from "next";
import { Home } from "../../views/Home";
import { blogs as builtInBlogs } from "../../data/blogData";
import { defaultFeaturedProject } from "../../data/featuredProject";
import { getAllBlogs } from "../../lib/server/blogs";
import { getFeaturedProject } from "../../lib/server/featured-project";
import { getFeaturedProjectSlug, listPublicProjectsSafe } from "../../lib/server/portfolio";
import { listPressClippings } from "../../lib/server/press";
import { loadSystemPage, systemPageMetadata } from "../../lib/server/site-pages";
import { PageSections } from "../../components/sections/PageSections";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("home");
}

/** Each block falls back gracefully so a database problem never takes the home page down. */
async function safe<T>(label: string, load: () => Promise<T>, fallback: T) {
  try {
    return await load();
  } catch (error) {
    console.error(`Home page: failed to load ${label}`, error);
    return fallback;
  }
}

export default async function Page() {
  // Edited in Admin → Pages → Home.
  const page = await loadSystemPage("home");
  if (page) return <PageSections sections={page.sections} />;
  const [latestBlogs, projects, featured, featuredSlug, press] = await Promise.all([
    safe("blogs", async () => (await getAllBlogs()).slice(0, 3), builtInBlogs.slice(0, 3)),
    listPublicProjectsSafe(),
    safe("featured project", getFeaturedProject, defaultFeaturedProject),
    safe("featured slug", getFeaturedProjectSlug, null),
    safe("press", async () => (await listPressClippings({ enabledOnly: true })).slice(0, 3), []),
  ]);
  return <Home latestBlogs={latestBlogs} projects={projects} featured={featured} featuredSlug={featuredSlug} press={press} />;
}
