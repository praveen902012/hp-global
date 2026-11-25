import type { Metadata } from "next";
import { cache } from "react";
import { getSystemPage } from "./pages";
import { getSiteLinks } from "./site-details";

/**
 * A built-in website page (Home, Services, …) as edited in Admin → Pages.
 * Returns null when it can't be loaded, so the route can show its original built-in version.
 */
export const loadSystemPage = cache(async (key: string) => {
  try {
    const page = await getSystemPage(key);
    return page && page.sections.length > 0 ? page : null;
  } catch (error) {
    console.error(`Failed to load the "${key}" page; showing the built-in version`, error);
    return null;
  }
});

/** Title, description and share image for a page, falling back to the Site details defaults. */
export async function pageMetadata(page: { title: string; seo_title: string; meta_description: string; share_image: string; system_key?: string | null }): Promise<Metadata> {
  const site = await getSiteLinks();
  const title = page.seo_title || (page.system_key === "home" ? site.site_name : `${page.title} | ${site.site_name}`);
  const description = page.meta_description || undefined;
  const image = page.share_image || site.share_image;
  return { title, description, openGraph: { title, description, siteName: site.site_name, ...(image ? { images: [image] } : {}) } };
}

export async function systemPageMetadata(key: string, fallback: Metadata = {}): Promise<Metadata> {
  const page = await loadSystemPage(key);
  return page ? pageMetadata(page) : fallback;
}
