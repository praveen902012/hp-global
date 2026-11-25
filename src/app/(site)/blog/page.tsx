import type { Metadata } from "next";
import { BlogIndex } from "../../../views/Blog/BlogIndex";
import { getAllBlogs } from "../../../lib/server/blogs";
import { PageSections } from "../../../components/sections/PageSections";
import { loadSystemPage, systemPageMetadata } from "../../../lib/server/site-pages";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("blog", { title: "Journal | HP Global Infrra", description: "Market insights, buying guides and company news from HP Global Infrra." });
}

export default async function Page() {
  const page = await loadSystemPage("blog");
  if (page) return <PageSections sections={page.sections} />;
  return <BlogIndex blogs={await getAllBlogs()} />;
}
