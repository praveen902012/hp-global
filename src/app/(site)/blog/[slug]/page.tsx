import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { blogs } from "../../../../data/blogData";
import { getAllBlogs, getBlogBySlug } from "../../../../lib/server/blogs";
import { BlogPost } from "../../../../views/Blog/BlogPost";

// Managed article edits are stored in the database, so this page must read the
// latest version for every request rather than serving a build-time copy.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const load = cache((slug: string) => getBlogBySlug(slug));

export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const blog = await load((await params).slug).catch(() => null);
  if (!blog) return {};
  return { title: `${blog.title} | HP Global Infrra`, description: blog.snippet, openGraph: { images: blog.image ? [blog.image] : [] } };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const blog = await load(slug);
  if (!blog) notFound();
  const related = (await getAllBlogs().catch(() => blogs)).filter((item) => item.slug !== blog.slug).slice(0, 3);
  return <BlogPost blog={blog} related={related} url={`/blog/${blog.slug}`} />;
}
