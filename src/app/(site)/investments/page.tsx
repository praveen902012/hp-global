import type { Metadata } from "next";
import { Investments } from "../../../views/Investments";
import { listPublicProjectsSafe } from "../../../lib/server/portfolio";
import { PageSections } from "../../../components/sections/PageSections";
import { loadSystemPage, systemPageMetadata } from "../../../lib/server/site-pages";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("investments", { title: "Investments | HP Global Infrra", description: "Strategic, high-yield real estate investments — high-end projects, strategic plots, residential and commercial." });
}

export default async function Page() {
  const page = await loadSystemPage("investments");
  return page ? <PageSections sections={page.sections} /> : <Investments projects={await listPublicProjectsSafe()} />;
}
