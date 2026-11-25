import type { Metadata } from "next";
import { About } from "../../../views/About";
import { PageSections } from "../../../components/sections/PageSections";
import { loadSystemPage, systemPageMetadata } from "../../../lib/server/site-pages";

// Content is edited from Admin → Pages → Our Story, so read it on every request.
export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("about");
}

export default async function Page() {
  const page = await loadSystemPage("about");
  // If the database is unavailable, show the original page.
  if (!page) return <About />;
  return <PageSections sections={page.sections} />;
}
