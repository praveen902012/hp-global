import type { Metadata } from "next";
import { BlogIndex } from "../../../views/Blog/BlogIndex";
import { getAllBlogs } from "../../../lib/server/blogs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Journal | HP Global Infrra", description: "Market insights, buying guides and company news from HP Global Infrra." };

export default async function Page() {
  const blogs = await getAllBlogs();
  return <BlogIndex blogs={blogs} />;
}
