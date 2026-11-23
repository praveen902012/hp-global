import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogEntry } from "../../data/blogData";

/** Estimated reading time from article HTML or text. */
export function readingMinutes(content: string) {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function ArticleCard({ blog, featured = false }: { blog: BlogEntry; featured?: boolean }) {
  return (
    <Link href={`/blog/${blog.slug}`} className={`group flex h-full flex-col overflow-hidden ${featured ? "" : ""}`}>
      <div className="aspect-[16/10] overflow-hidden rounded-[20px] bg-ivory-100">
        {blog.image && <img src={blog.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
      </div>
      <div className="flex flex-1 flex-col gap-3 pt-5">
        <p className="text-[13px] text-ink-muted"><span className="font-medium text-gold-700">{blog.author}</span><span aria-hidden> · </span>{blog.date}<span aria-hidden> · </span>{readingMinutes(blog.content)} min read</p>
        <h3 className="font-heading text-[22px] leading-[30px] text-ink transition-colors group-hover:text-gold-700">{blog.title}</h3>
        {blog.snippet && <p className="line-clamp-3 t-body-s text-ink-muted">{blog.snippet}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 t-label text-ink">Read article<ArrowRight size={16} className="text-gold-500 transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}
