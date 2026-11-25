import type { Metadata } from "next";
import { PrivacyPolicy } from "../../../views/PrivacyPolicy";
import { PageSections } from "../../../components/sections/PageSections";
import { loadSystemPage, systemPageMetadata } from "../../../lib/server/site-pages";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("privacy");
}

export default async function Page() {
  const page = await loadSystemPage("privacy");
  return page ? <PageSections sections={page.sections} /> : <PrivacyPolicy />;
}
