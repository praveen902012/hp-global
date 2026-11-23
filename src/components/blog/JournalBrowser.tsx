"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { BlogEntry } from "../../data/blogData";
import { ArticleCard, readingMinutes } from "../site/ArticleCard";
import { Badge, buttonClass } from "../site/ui";

const PAGE = 9;

export function JournalBrowser({ blogs }: { blogs: BlogEntry[] }) {
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState(PAGE);
  const term = search.trim().toLowerCase();
  const matches = useMemo(() => blogs.filter((blog) => !term || `${blog.title} ${blog.snippet} ${blog.author}`.toLowerCase().includes(term)), [blogs, term]);
  const [lead, ...rest] = term ? [undefined, ...matches] : matches;

  return (
    <>
      <div className="flex justify-end">
        <label className="relative w-full md:w-80">
          <span className="sr-only">Search articles</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setShown(PAGE); }} placeholder="Search articles" className="h-12 w-full rounded-full border border-line-strong bg-white pl-11 pr-4 text-[15px] outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-200" />
        </label>
      </div>

      {lead && (
        <Link href={`/blog/${lead.slug}`} className="group mt-8 grid overflow-hidden rounded-3xl bg-navy-900 md:mt-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="aspect-[16/10] overflow-hidden bg-navy-800 lg:aspect-auto lg:min-h-[440px]">{lead.image && <img src={lead.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}</div>
          <div className="on-dark flex flex-col justify-center gap-4 p-6 md:gap-5 md:p-10 lg:p-14">
            <Badge tone="gold" className="self-start">Latest article</Badge>
            <h2 className="t-h2 text-white">{lead.title}</h2>
            {lead.snippet && <p className="line-clamp-3 t-body-l text-slate-300">{lead.snippet}</p>}
            <p className="t-body-s text-slate-400">{lead.author} · {lead.date} · {readingMinutes(lead.content)} min read</p>
            <span className="inline-flex items-center gap-1.5 t-label text-white">Read article<ArrowRight size={16} className="text-gold-400 transition-transform group-hover:translate-x-0.5" /></span>
          </div>
        </Link>
      )}

      {rest.length > 0 ? (
        <div className="mt-10 grid gap-x-8 gap-y-12 md:mt-14 md:grid-cols-2 lg:grid-cols-3">
          {rest.slice(0, shown).map((blog) => blog && <ArticleCard key={blog.slug} blog={blog} />)}
        </div>
      ) : !lead && (
        <p className="mt-10 rounded-[20px] border border-dashed border-line-strong py-16 text-center t-body text-ink-muted">No articles match “{search}”.</p>
      )}

      {rest.length > shown && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <button type="button" onClick={() => setShown((value) => value + PAGE)} className={buttonClass("outline", "l")}>Load more articles</button>
          <p className="t-body-s text-ink-muted">Showing {Math.min(shown, rest.length) + (lead ? 1 : 0)} of {matches.length} articles</p>
        </div>
      )}
    </>
  );
}
