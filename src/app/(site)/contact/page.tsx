import type { Metadata } from "next";
import { Contact } from "../../../views/Contact";
import { PageSections } from "../../../components/sections/PageSections";
import { loadSystemPage, systemPageMetadata } from "../../../lib/server/site-pages";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("contact", { title: "Contact | HP Global Infrra", description: "Call, WhatsApp or write to HP Global Infrra, or visit our office in Sector 63, Noida." });
}

export default async function Page() {
  const page = await loadSystemPage("contact");
  return page ? <PageSections sections={page.sections} /> : <Contact />;
}
