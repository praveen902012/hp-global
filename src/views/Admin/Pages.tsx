"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, FilePlus2, Files, Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { slugError, slugify, type PageSummary } from "../../data/pages";

const inputClass = "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-champagne focus:ring-2 focus:ring-brand-champagne/20";
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

export function AdminPages() {
  const router = useRouter();
  const [pages, setPages] = useState<PageSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => api.listPages().then(setPages).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load pages."));
  useEffect(() => { void load(); }, []);

  async function remove(page: PageSummary) {
    if (!window.confirm(`Delete "${page.title}"? Its URL /${page.slug} will stop working and any menu links to it will be removed. This cannot be undone.`)) return;
    setError(null); setNotice(null);
    try {
      const result = await api.deletePage(page.id);
      setNotice(`Deleted "${page.title}".${result.removed_menu_links ? ` Removed ${result.removed_menu_links} menu link${result.removed_menu_links > 1 ? "s" : ""} to it.` : ""}`);
      await load();
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "Unable to delete the page."); }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-brand-champagne">Content management</p>
          <h1 className="text-3xl font-heading text-brand-charcoal">Pages</h1>
          <p className="mt-2 text-sm text-slate-500">Create new pages from ready-made sections, or edit built-in site pages like Our Story. New pages start as drafts. <Link href="/admin/guide#pages" className="ml-1 whitespace-nowrap font-medium text-brand-charcoal underline decoration-brand-champagne underline-offset-4 hover:text-brand-champagne">How it works</Link></p>
        </div>
        <Button type="button" onClick={() => setCreating(true)} className="gap-2"><Plus size={16} />New page</Button>
      </div>

      {error && <div role="alert" className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      {pages === null ? <p className="text-slate-500">{error ? "" : "Loading pages…"}</p> : pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Files className="mx-auto mb-4 text-slate-300" size={40} />
          <p className="font-heading text-xl text-brand-charcoal">No pages yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Build a page from sections such as a hero banner, text, image + text, gallery, FAQ and a contact form.</p>
          <Button type="button" onClick={() => setCreating(true)} className="mt-6 gap-2"><Plus size={16} />Create your first page</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="px-4 py-3 font-semibold">Page</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Sections</th><th className="px-4 py-3 font-semibold">Last edited</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3"><Link href={`/admin/pages/${page.id}`} className="font-medium text-brand-charcoal hover:text-brand-champagne">{page.title}</Link>{page.system_key && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Site page</span>}<p className="text-xs text-slate-400">/{page.slug}</p></td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${page.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{page.status === "published" ? "Published" : "Draft"}</span></td>
                  <td className="px-4 py-3 text-slate-500">{page.section_count}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(page.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/${page.slug}`} target="_blank" title={page.status === "published" ? "View page" : "Preview draft"} className="rounded p-2 text-slate-500 hover:bg-slate-100"><ExternalLink size={16} /></Link>
                      <Link href={`/admin/pages/${page.id}`} title="Edit" className="rounded p-2 text-slate-500 hover:bg-slate-100"><Pencil size={16} /></Link>
                      {page.system_key ? <span className="w-8" aria-hidden="true" /> : <button type="button" onClick={() => void remove(page)} title="Delete" className="rounded p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <NewPageDialog onClose={() => setCreating(false)} onCreated={(id) => router.push(`/admin/pages/${id}`)} />}
    </div>
  );
}

function NewPageDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: number) => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const problem = slug ? slugError(slug) : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const finalProblem = slugError(slug);
    if (!title.trim() || finalProblem) { setError(title.trim() ? finalProblem : "Enter a page title."); return; }
    setSaving(true); setError(null);
    try { onCreated((await api.createPage({ title: title.trim(), slug })).id); }
    catch (createError) { setError(createError instanceof Error ? createError.message : "Unable to create the page."); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/40 p-4" role="dialog" aria-modal="true" aria-label="New page">
      <form onSubmit={submit} className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><h2 className="font-heading text-2xl text-brand-charcoal">New page</h2><button type="button" onClick={onClose} aria-label="Close" className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>
        <div className="space-y-5 p-6">
          <label className="block text-sm font-medium text-slate-700">Page title
            <input autoFocus required value={title} maxLength={120} placeholder="e.g. NRI Investment Desk" className={inputClass} onChange={(event) => { setTitle(event.target.value); if (!slugEdited) setSlug(slugify(event.target.value)); }} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Page URL
            <div className="mt-1.5 flex items-center rounded-md border border-slate-300 focus-within:border-brand-champagne focus-within:ring-2 focus-within:ring-brand-champagne/20"><span className="pl-3 text-sm text-slate-400">hpglobalinfra.com/</span><input required value={slug} className="w-full rounded-md bg-white py-2.5 pr-3 text-sm outline-none" onChange={(event) => { setSlugEdited(true); setSlug(slugify(event.target.value)); }} /></div>
            {problem && <span className="mt-1 block text-xs font-normal text-red-600">{problem}</span>}
          </label>
          <p className="text-xs text-slate-500">The page starts as a draft with a hero banner and a text section. You can change everything next.</p>
          {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4"><button type="button" onClick={onClose} className="px-3 text-sm text-slate-500 hover:text-brand-charcoal">Cancel</button><Button type="submit" disabled={saving || !title.trim() || !!problem} className="gap-2"><FilePlus2 size={16} />{saving ? "Creating…" : "Create page"}</Button></div>
      </form>
    </div>
  );
}
