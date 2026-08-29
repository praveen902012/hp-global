"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Bold, CalendarDays, CheckCircle2, ExternalLink, FilePlus2, FileText, Italic, List, ListOrdered, Pencil, Plus, RefreshCw, Search, Trash2, Underline, User, X } from "lucide-react";
import Link from "next/link";
import { api, type BlogInput, type ManagedBlog } from "../../lib/api";
import { Button } from "../../components/ui/Button";

const freshForm = (): BlogInput => ({ title: "", slug: "", author: "HP Global Infrra", snippet: "", content: "", image_url: "", published_at: new Date().toISOString().slice(0, 10) });
const inputClass = "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-champagne focus:ring-2 focus:ring-brand-champagne/20";

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => { if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value; }, [value]);
  function format(command: string, formatValue?: string) { editor.current?.focus(); document.execCommand(command, false, formatValue); onChange(editor.current?.innerHTML ?? ""); }
  const toolClass = "flex h-8 w-8 items-center justify-center rounded text-slate-600 transition hover:bg-white hover:text-brand-charcoal";
  return <div className="mt-1.5 overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-brand-champagne focus-within:ring-2 focus-within:ring-brand-champagne/20"><div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2"><button type="button" onClick={() => format("bold")} title="Bold" className={toolClass}><Bold size={16}/></button><button type="button" onClick={() => format("italic")} title="Italic" className={toolClass}><Italic size={16}/></button><button type="button" onClick={() => format("underline")} title="Underline" className={toolClass}><Underline size={16}/></button><button type="button" onClick={() => format("formatBlock", "h2")} title="Heading" className={`${toolClass} text-xs font-bold`}>H2</button><button type="button" onClick={() => format("insertUnorderedList")} title="Bullet list" className={toolClass}><List size={16}/></button><button type="button" onClick={() => format("insertOrderedList")} title="Numbered list" className={toolClass}><ListOrdered size={16}/></button></div><div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" onInput={(event) => onChange(event.currentTarget.innerHTML)} className="min-h-72 px-3 py-3 text-sm leading-relaxed text-slate-900 outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]" data-placeholder="Write your article here..."/></div>;
}

export function AdminArticles() {
  const [articles, setArticles] = useState<ManagedBlog[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<BlogInput>(freshForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 9;

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try { const result = await api.listBlogs({ page, limit: perPage, search }); setArticles(result.items); setTotal(result.pagination.total); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load articles."); }
    finally { setLoading(false); }
  }, [page, search]);
  useEffect(() => { void loadArticles(); }, [loadArticles]);
  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);
  function updateField<K extends keyof BlogInput>(key: K, value: BlogInput[K]) { setForm((current) => ({ ...current, [key]: value, ...(key === "title" && !slugEdited ? { slug: slugify(String(value)) } : {}) })); }
  function closeEditor() { setOpen(false); setEditingId(null); setForm(freshForm()); setSlugEdited(false); setError(null); }
  function startNewArticle() { setEditingId(null); setForm(freshForm()); setSlugEdited(false); setError(null); setSuccess(null); setOpen(true); }
  function editArticle(article: ManagedBlog) { setEditingId(article.id); setForm({ title: article.title, slug: article.slug, author: article.author, snippet: article.snippet, content: article.content, image_url: article.image_url, published_at: article.published_at }); setSlugEdited(true); setError(null); setSuccess(null); setOpen(true); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null); setSuccess(null);
    try { if (editingId === null) await api.createBlog(form); else await api.updateBlog(editingId, form); await loadArticles(); setSuccess(editingId === null ? "Article published successfully." : "Article updated successfully."); closeEditor(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save article."); }
    finally { setSaving(false); }
  }
  async function handleDelete(article: ManagedBlog) {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    setError(null); setSuccess(null);
    try { await api.deleteBlog(article.id); if (articles.length === 1 && page > 1) setPage((value) => value - 1); else await loadArticles(); setSuccess("Article deleted."); if (editingId === article.id) closeEditor(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to delete article."); }
  }

  return <div className="p-6 lg:p-10">
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-champagne">Content management</p><h1 className="text-3xl font-heading text-brand-charcoal">Journal articles</h1><p className="mt-2 text-sm text-slate-500">Create and manage articles published in the Journal.</p></div><Button type="button" onClick={startNewArticle} className="gap-2 self-start sm:self-auto"><Plus size={17}/> Add article</Button></div>
    {(error || success) && <div role="status" className={`mb-6 flex items-center gap-2 rounded-md border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{success && <CheckCircle2 size={17}/>} {error || success}</div>}
    <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles or URL slugs" className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-champagne focus:ring-2 focus:ring-brand-champagne/20"/></div><button type="button" onClick={() => void loadArticles()} title="Refresh articles" className="flex h-10 w-10 items-center justify-center self-end rounded-md border border-slate-300 text-slate-500 hover:text-brand-charcoal sm:self-auto"><RefreshCw size={18} className={loading ? "animate-spin" : ""}/></button></div></section>
    <div className="mb-4 flex items-center justify-between"><h2 className="font-heading text-lg text-brand-charcoal">Published articles</h2><span className="rounded-full bg-brand-champagne/15 px-3 py-1 text-xs font-semibold text-brand-charcoal">{total} {total === 1 ? "article" : "articles"}</span></div>
    {loading ? <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading articles…</div> : articles.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><FileText className="mx-auto mb-3 text-slate-300" size={32}/><h3 className="font-heading text-lg text-brand-charcoal">No matching articles</h3><p className="mt-1 text-sm text-slate-500">Try another search or create a new article.</p></div> : <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">{articles.map((article) => <article key={article.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"><div className="relative h-48 bg-slate-100"><img src={article.image_url} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/><span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Journal</span></div><div className="p-6"><div className="mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><span className="flex items-center gap-1"><CalendarDays size={13}/>{new Date(`${article.published_at}T00:00:00`).toLocaleDateString()}</span><span className="flex items-center gap-1"><User size={13}/>{article.author}</span></div><h3 className="line-clamp-2 text-2xl font-heading leading-tight text-brand-charcoal">{article.title}</h3><p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-slate-500">{article.snippet}</p><p className="mt-4 truncate text-xs text-slate-400">/{article.slug}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><button type="button" onClick={() => editArticle(article)} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-charcoal hover:text-brand-champagne"><Pencil size={15}/> Edit</button><div className="flex gap-1"><Link href={`/blog/${article.slug}`} target="_blank" title="View article" className="rounded p-2 text-slate-500 hover:bg-brand-champagne/10 hover:text-brand-charcoal"><ExternalLink size={16}/></Link><button type="button" onClick={() => void handleDelete(article)} title="Delete article" className="rounded p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button></div></div></div></article>)}</div>}
    {!loading && total > 0 && <nav aria-label="Article pagination" className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row"><p className="text-sm text-slate-500">Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, total)} of {total} articles</p><div className="flex items-center gap-2"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="px-2 text-sm font-medium text-brand-charcoal">Page {currentPage} of {totalPages}</span><button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="rounded border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></nav>}
    {open && <div className="fixed inset-0 z-50 flex justify-end bg-brand-charcoal/35" role="dialog" aria-modal="true" aria-label={editingId === null ? "Add article" : "Edit article"}><form onSubmit={handleSubmit} className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-champagne">Journal article</p><h2 className="mt-1 text-2xl font-heading text-brand-charcoal">{editingId === null ? "Add article" : "Edit article"}</h2></div><div className="flex items-center gap-2">{editingId !== null && <Link href={`/blog/${form.slug}`} target="_blank" title="View published article" className="rounded p-2 text-slate-500 hover:bg-slate-100"><ExternalLink size={19}/></Link>}<button type="button" onClick={closeEditor} className="rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="Close editor"><X size={20}/></button></div></div><div className="space-y-5 p-6"><label className="block text-sm font-medium text-slate-700">Title<input required value={form.title} onChange={(event) => updateField("title", event.target.value)} className={inputClass}/></label><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">URL slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => { setSlugEdited(true); updateField("slug", slugify(event.target.value)); }} className={inputClass}/></label><label className="text-sm font-medium text-slate-700">Publish date<input required type="date" value={form.published_at} onChange={(event) => updateField("published_at", event.target.value)} className={inputClass}/></label></div><label className="block text-sm font-medium text-slate-700">Author<input required value={form.author} onChange={(event) => updateField("author", event.target.value)} className={inputClass}/></label><label className="block text-sm font-medium text-slate-700">Cover image URL<input required type="url" value={form.image_url} onChange={(event) => updateField("image_url", event.target.value)} placeholder="https://…" className={inputClass}/></label>{form.image_url && <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-100"><img src={form.image_url} alt="Cover preview" className="h-48 w-full object-cover"/></div>}<label className="block text-sm font-medium text-slate-700">Excerpt<textarea required rows={3} value={form.snippet} onChange={(event) => updateField("snippet", event.target.value)} className={`${inputClass} resize-y`}/></label><label className="block text-sm font-medium text-slate-700">Article body<RichTextEditor value={form.content} onChange={(value) => updateField("content", value)}/></label></div><div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white px-6 py-4"><Button type="submit" disabled={saving || !form.slug} className="gap-2">{saving ? "Saving…" : <><FilePlus2 size={16}/>{editingId === null ? "Publish article" : "Save changes"}</>}</Button><button type="button" onClick={closeEditor} className="px-3 text-sm text-slate-500 hover:text-brand-charcoal">Cancel</button></div></form></div>}
  </div>;
}
