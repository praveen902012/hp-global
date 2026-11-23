import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BlogEntry } from "../../data/blogData";
import { ArticleCard, readingMinutes } from "../../components/site/ArticleCard";
import { ShareButtons } from "../../components/blog/ShareButtons";
import { EnquireButton } from "../../components/site/EnquiryProvider";
import { Eyebrow, TextLink, buttonClass } from "../../components/site/ui";

/** Adds ids to h2/h3 headings in article HTML and returns them for the table of contents. */
function withHeadingIds(html: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const used = new Set<string>();
  const content = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level: string, attributes: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").trim();
    if (!text || /\bid=/.test(attributes)) return match;
    let id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "section";
    while (used.has(id)) id = `${id}-x`;
    used.add(id);
    headings.push({ id, text, level: Number(level) });
    return `<h${level}${attributes} id="${id}">${inner}</h${level}>`;
  });
  return { content, headings };
}

export function BlogPost({ blog, related, url }: { blog: BlogEntry; related: BlogEntry[]; url: string }) {
  const isHtml = blog.contentFormat !== "text";
  const { content, headings } = isHtml ? withHeadingIds(blog.content) : { content: "", headings: [] };
  const toc = headings.filter((heading) => heading.level === 2).length >= 2 ? headings.filter((heading) => heading.level === 2) : headings;
  const initials = blog.author.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <article>
      <header className="bg-white">
        <div className="container-page flex flex-col gap-5 pb-8 pt-8 md:gap-6 md:pb-12 md:pt-12">
          <nav aria-label="Breadcrumb" className="t-body-s text-ink-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-ink">Home</Link></li><li aria-hidden><ChevronRight size={14} /></li>
              <li><Link href="/blog" className="hover:text-ink">Journal</Link></li><li aria-hidden><ChevronRight size={14} /></li>
              <li aria-current="page" className="line-clamp-1 font-medium text-ink">{blog.title}</li>
            </ol>
          </nav>
          <h1 className="t-h1 max-w-[880px] text-ink">{blog.title}</h1>
          {blog.snippet && <p className="t-body-xl max-w-[880px] text-ink-muted">{blog.snippet}</p>}
          <div className="flex max-w-[880px] flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 t-label text-gold-400">{initials}</span>
              <div><p className="t-label text-ink">{blog.author}</p><p className="t-body-s text-ink-muted">{blog.date} · {readingMinutes(blog.content)} min read</p></div>
            </div>
            <ShareButtons url={url} title={blog.title} />
          </div>
          {blog.image && <img src={blog.image} alt="" className="mt-3 h-60 w-full rounded-2xl object-cover md:h-[440px] md:rounded-3xl lg:h-[600px]" />}
        </div>
      </header>

      <div className="bg-white pb-16 md:pb-[88px] lg:pb-[112px]">
        <div className="container-page grid gap-10 pt-6 md:pt-10 lg:grid-cols-[minmax(0,760px)_1fr] lg:gap-20">
          <div className="flex min-w-0 flex-col gap-12">
            {toc.length >= 2 && (
              <details className="rounded-2xl border border-line px-5 py-4 lg:hidden">
                <summary className="cursor-pointer t-h6 text-ink">On this page</summary>
                <ol className="mt-3 flex flex-col gap-2">{toc.map((heading) => <li key={heading.id}><a href={`#${heading.id}`} className="t-body-s text-ink-muted hover:text-ink">{heading.text}</a></li>)}</ol>
              </details>
            )}
            {isHtml
              ? <div className="prose-site" dangerouslySetInnerHTML={{ __html: content }} />
              : <div className="prose-site">{blog.content.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}</div>}
            <div className="flex flex-col gap-4 rounded-[20px] bg-ivory-50 p-5 sm:flex-row sm:items-center md:p-7">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-900 t-label text-gold-400">{initials}</span>
              <div className="flex flex-col gap-1"><p className="t-h6 text-ink">Written by {blog.author}</p><p className="t-body-s text-ink-muted">Have a question about this article? Our advisors are happy to talk it through.</p></div>
            </div>
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-28 flex flex-col gap-6">
              {toc.length >= 2 && (
                <nav aria-label="On this page" className="flex flex-col gap-3 rounded-[20px] border border-line p-6">
                  <p className="t-overline text-ink-muted">On this page</p>
                  <ol className="flex flex-col gap-1">{toc.map((heading) => <li key={heading.id}><a href={`#${heading.id}`} className="block border-l-2 border-line py-1 pl-3 t-body-s text-ink-muted hover:border-gold-400 hover:text-ink">{heading.text}</a></li>)}</ol>
                </nav>
              )}
              <div className="on-dark flex flex-col gap-4 rounded-[20px] bg-navy-900 p-7">
                <Eyebrow dark>Talk to an advisor</Eyebrow>
                <p className="t-h5 text-white">Get a shortlist of verified projects within 24 hours.</p>
                <EnquireButton className={buttonClass("accent", "m", "w-full")}>Speak to an advisor</EnquireButton>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-ivory-50 section-y">
          <div className="container-page flex flex-col gap-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-4"><Eyebrow>Keep reading</Eyebrow><h2 className="t-h2 text-ink">Related articles</h2></div>
              <TextLink href="/blog">View all articles</TextLink>
            </div>
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ArticleCard key={item.slug} blog={item} />)}</div>
          </div>
        </section>
      )}
    </article>
  );
}
