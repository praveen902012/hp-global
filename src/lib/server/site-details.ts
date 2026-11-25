import { cache } from "react";
import { defaultSiteDetails, normalizeSiteDetails, siteLinks, type SiteDetails } from "../../data/siteDetails";
import { query } from "./db";

const KEY = "site_details";

export async function getSiteDetails(): Promise<SiteDetails> {
  const result = await query<{ content: unknown }>("SELECT content FROM site_settings WHERE key = $1", [KEY]);
  if (!result.rows[0]) return defaultSiteDetails;
  // Fill in anything missing from older saves, then validate; fall back to the defaults if it doesn't pass.
  const parsed = normalizeSiteDetails({ ...defaultSiteDetails, ...(result.rows[0].content as object) });
  return "details" in parsed ? parsed.details : defaultSiteDetails;
}

/** For public pages: one read per request, and a database problem never takes the site down. */
export const getSiteDetailsSafe = cache(async (): Promise<SiteDetails> => {
  try {
    return await getSiteDetails();
  } catch (error) {
    console.error("Failed to load site details; using defaults", error);
    return defaultSiteDetails;
  }
});

/** Ready-made phone, WhatsApp and social links for server components. */
export const getSiteLinks = cache(async () => siteLinks(await getSiteDetailsSafe()));

export async function saveSiteDetails(details: SiteDetails) {
  await query(
    "INSERT INTO site_settings (key, content, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()",
    [KEY, JSON.stringify(details)],
  );
  return details;
}
