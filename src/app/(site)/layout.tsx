import { Layout } from "../../components/layout/Layout";
import { getSiteMenuSafe } from "../../lib/server/site-menu";
import { getSiteDetailsSafe } from "../../lib/server/site-details";

// The menu is edited from the admin panel, so read it on every request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [menu, site] = await Promise.all([getSiteMenuSafe(), getSiteDetailsSafe()]);
  return <Layout menu={menu} site={site}>{children}</Layout>;
}
