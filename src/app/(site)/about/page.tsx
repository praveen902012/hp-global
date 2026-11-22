import type { Metadata } from "next";
import { About } from "../../../views/About";
import { PageSections } from "../../../components/sections/PageSections";
import { getSystemPage } from "../../../lib/server/pages";

// Content is edited from Admin → Pages → Our Story, so read it on every request.
export const dynamic = "force-dynamic";

async function loadStory() {
  try {
    return await getSystemPage("about");
  } catch (error) {
    console.error("Failed to load the Our Story page; showing the built-in version", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadStory();
  if (!page) return {};
  return { title: `${page.title} | HP Global Infrra`, description: page.meta_description || undefined };
}

export default async function Page() {
  const page = await loadStory();
  // Until the page has been set up in the admin (or if the database is unavailable), show the original page.
  if (!page || page.sections.length === 0) return <About />;
  return <PageSections sections={page.sections} />;
}
