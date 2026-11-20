import { Layout } from "../../components/layout/Layout";
import { getSiteMenuSafe } from "../../lib/server/site-menu";

// The menu is edited from the admin panel, so read it on every request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const menu = await getSiteMenuSafe();
  return <Layout menu={menu}>{children}</Layout>;
}
