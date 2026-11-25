import type { Metadata } from "next";
import { Layout } from "../components/layout/Layout";
import { getSiteMenuSafe } from "../lib/server/site-menu";
import { getSiteDetailsSafe } from "../lib/server/site-details";
import { NotFoundContent } from "../components/site/NotFoundContent";

export const metadata: Metadata = { title: "Page not found | HP Global Infrra", robots: { index: false } };

/** Unmatched URLs outside the public site group. */
export default async function NotFound() {
  const [menu, site] = await Promise.all([getSiteMenuSafe(), getSiteDetailsSafe()]);
  return <Layout menu={menu} site={site}><NotFoundContent /></Layout>;
}
