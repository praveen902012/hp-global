import { notFound } from "next/navigation";
import { blogs } from "../../../../data/blogData";
import { BlogPost } from "../../../../views/Blog/BlogPost";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (!blogs.some((blog) => blog.slug === slug)) {
    notFound();
  }

  return <BlogPost slug={slug} />;
}
