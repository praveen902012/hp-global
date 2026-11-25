import type { Metadata } from "next";
import { Services } from "../../../views/Services";
import { PageSections } from "../../../components/sections/PageSections";
import { loadSystemPage, systemPageMetadata } from "../../../lib/server/site-pages";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("services");
}

export default async function Page() {
  const page = await loadSystemPage("services");
  return page ? <PageSections sections={page.sections} /> : <Services />;
}
