import { notFound } from "next/navigation";
import { blogs } from "../../../../data/blogData";
import { getBlogBySlug } from "../../../../lib/server/blogs";
import { BlogPost } from "../../../../views/Blog/BlogPost";

// Managed article edits are stored in the database, so this page must read the
// latest version for every request rather than serving a build-time copy.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  return <BlogPost blog={blog} />;
}
