"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, FilePen, Pencil, Plus, Trash2 } from "lucide-react";
import { api, type ManagedBlog } from "../../lib/api";
import { Button, EmptyState, IconButton, Notice, PageHeader, SearchInput, SegTabs, StatusPill, tdClass, thClass, useToast } from "../../components/admin/ui";

type Filter = "all" | "published" | "draft";
const PER_PAGE = 15;
const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function AdminArticles() {
  const toast = useToast();
  const [articles, setArticles] = useState<ManagedBlog[] | null>(null);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ published: 0, draft: 0 });
  const params = useSearchParams();
  const [filter, setFilterState] = useState<Filter>(() => { const status = params?.get("status"); return status === "draft" || status === "published" ? status : "all"; });
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await api.listBlogs({ page, limit: PER_PAGE, search, status: filter === "all" ? undefined : filter });
      setArticles(result.items); setTotal(result.pagination.total); setCounts(result.counts); setError(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load articles."); }
  }, [page, search, filter]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), search ? 250 : 0); return () => window.clearTimeout(timer); }, [load, search]);
  const setFilter = (value: Filter) => { setFilterState(value); setPage(1); };
  const setSearch = (value: string) => { setSearchState(value); setPage(1); };

  async function remove(article: ManagedBlog) {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    try { await api.deleteBlog(article.id); toast("Article deleted."); void load(); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to delete.", "error"); }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  return (
    <div>
      <PageHeader title="Articles" description="Stories in the Journal. Drafts are saved but not shown on the website." actions={<Button to="/admin/articles/new"><Plus size={16} aria-hidden />Write article</Button>} />
      {error && <Notice tone="error">{error}</Notice>}
      <section className="rounded-[20px] border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between md:px-6">
          <SegTabs label="Filter articles" value={filter} onChange={setFilter} options={[{ value: "all", label: "All", count: counts.published + counts.draft }, { value: "published", label: "Published", count: counts.published }, { value: "draft", label: "Drafts", count: counts.draft }]} />
          <SearchInput value={search} onChange={setSearch} placeholder="Search title or address" className="md:w-72" />
        </div>
        {articles === null ? <p className="p-6 text-[14px] text-ink-muted">Loading articles…</p> : articles.length === 0 ? (
          <EmptyState icon={<FilePen size={24} />} title={search || filter !== "all" ? "No matching articles" : "No articles yet"} action={<Button to="/admin/articles/new"><Plus size={16} aria-hidden />Write article</Button>} />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[14px]">
                <thead><tr><th className={thClass}>Article</th><th className={thClass}>Author</th><th className={thClass}>Date</th><th className={thClass}>Status</th><th className={thClass}><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-ivory-50">
                      <td className={tdClass}>
                        <Link href={`/admin/articles/${article.id}`} className="flex items-center gap-3">
                          {article.image_url ? <img src={article.image_url} alt="" className="h-12 w-16 shrink-0 rounded-lg bg-ivory-100 object-cover" /> : <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-ivory-100 text-ink-subtle"><FilePen size={18} aria-hidden /></span>}
                          <span className="min-w-0"><span className="line-clamp-1 font-semibold text-ink hover:text-gold-700">{article.title}</span><span className="block truncate text-[13px] text-ink-muted">/blog/{article.slug}</span></span>
                        </Link>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap`}>{article.author}</td>
                      <td className={`${tdClass} whitespace-nowrap text-ink-muted`}>{formatDate(article.published_at)}</td>
                      <td className={tdClass}><StatusPill status={article.is_draft ? "draft" : "published"} /></td>
                      <td className={tdClass}>
                        <div className="flex justify-end gap-1">
                          {!article.is_draft && <IconButton label="View on website" href={`/blog/${article.slug}`} target="_blank"><ExternalLink size={16} /></IconButton>}
                          <Link href={`/admin/articles/${article.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-ivory-100 hover:text-ink" aria-label={`Edit ${article.title}`} title="Edit"><Pencil size={16} /></Link>
                          <IconButton label={`Delete ${article.title}`} tone="danger" onClick={() => void remove(article)}><Trash2 size={16} /></IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line md:hidden">
              {articles.map((article) => (
                <li key={article.id}><Link href={`/admin/articles/${article.id}`} className="flex items-center gap-3 p-4">
                  {article.image_url ? <img src={article.image_url} alt="" className="h-14 w-16 shrink-0 rounded-lg bg-ivory-100 object-cover" /> : <span className="h-14 w-16 shrink-0 rounded-lg bg-ivory-100" />}
                  <span className="min-w-0 flex-1"><span className="line-clamp-2 font-semibold text-ink">{article.title}</span><span className="mt-1 flex items-center gap-2 text-[13px] text-ink-muted"><StatusPill status={article.is_draft ? "draft" : "published"} />{formatDate(article.published_at)}</span></span>
                </Link></li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3 px-5 py-4 md:px-6">
              <p className="text-[14px] text-ink-muted">{total} {total === 1 ? "article" : "articles"}</p>
              {totalPages > 1 && <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button><Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</Button></div>}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
