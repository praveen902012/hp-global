import { redirect } from "next/navigation";
import { getFeaturedProjectSlug } from "../../../lib/server/portfolio";

export const dynamic = "force-dynamic";

/** Old URL for the featured project; it now lives at /projects/<slug>. */
export default async function Page() {
  const slug = await getFeaturedProjectSlug().catch(() => null);
  redirect(slug ? `/projects/${slug}` : "/projects");
}
