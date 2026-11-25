"use client";

import { type FormEvent, Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, FilePlus2, Files, Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "../../lib/api";
import { Button, EmptyState, IconButton, Notice, PageHeader, StatusPill, inputClass, tdClass, thClass, useToast } from "../../components/admin/ui";
import { fixedSectionPage, slugError, slugify, type PageSummary } from "../../data/pages";
import { systemPagePath } from "../../data/systemPages";

const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

export function AdminPages() {
  const router = useRouter();
  const toast = useToast();
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

  async function duplicate(page: PageSummary) {
    try {
      const source = await api.getPage(page.id);
      const base = source.slug || "home";
      let slug = `${base}-copy`;
      for (let n = 2; pages?.some((item) => item.slug === slug); n += 1) slug = `${base}-copy-${n}`;
      const created = await api.createPage({ title: `${source.title} (copy)`, slug });
      await api.updatePage(created.id, { title: `${source.title} (copy)`, slug, meta_description: source.meta_description, seo_title: "", share_image: source.share_image, sections: source.sections.filter((section) => !fixedSectionPage[section.type]) });
      toast("Page duplicated as a draft.");
      router.push(`/admin/pages/${created.id}`);
    } catch (duplicateError) { toast(duplicateError instanceof Error ? duplicateError.message : "Unable to duplicate the page.", "error"); }
  }

  return (
    <div>
      <PageHeader title="Pages" description="Every page on your website. Edit the words and pictures of any page, or build a new one from ready-made sections."
        actions={<><Button variant="ghost" to="/admin/guide#pages">How it works</Button><Button onClick={() => setCreating(true)}><Plus size={16} aria-hidden />New page</Button></>} />
      {error && <Notice tone="error" onClose={() => setError(null)}>{error}</Notice>}
      {notice && <Notice tone="success" onClose={() => setNotice(null)}>{notice}</Notice>}

      <section className="rounded-[20px] border border-line bg-white">
        {pages === null ? <p className="p-6 text-[14px] text-ink-muted">{error ? "" : "Loading pages…"}</p> : pages.length === 0 ? (
          <EmptyState icon={<Files size={24} />} title="No pages yet" description="Build a page from sections such as a hero banner, text, image + text, gallery, FAQ and a contact form." action={<Button onClick={() => setCreating(true)}><Plus size={16} aria-hidden />Create your first page</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead><tr><th className={thClass}>Page</th><th className={thClass}>Status</th><th className={thClass}>Sections</th><th className={thClass}>Last edited</th><th className={thClass}><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {[
                  { label: "Website pages", hint: "Always on your website. Edit their words, pictures and sections; they can't be deleted.", rows: pages.filter((page) => page.system_key) },
                  { label: "Your pages", hint: "Pages you created. Publish them and add them to the menu when ready.", rows: pages.filter((page) => !page.system_key) },
                ].filter((group) => group.rows.length).map((group) => (
                  <Fragment key={group.label}>
                    <tr><td colSpan={5} className="border-b border-line bg-ivory-50 px-5 py-2.5"><span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-gold-700">{group.label} · {group.rows.length}</span><span className="ml-3 text-[13px] text-ink-muted">{group.hint}</span></td></tr>
                    {group.rows.map((page) => {
                      const path = systemPagePath(page.system_key, page.slug);
                      return (
                        <tr key={page.id} className="hover:bg-ivory-50">
                          <td className={tdClass}><Link href={`/admin/pages/${page.id}`} className="font-semibold text-ink hover:text-gold-700">{page.title}</Link>{page.system_key && <span className="ml-2 rounded-full bg-ivory-100 px-2 py-0.5 text-[11px] font-semibold text-gold-700">Website page</span>}<p className="text-[13px] text-ink-muted">{path}</p></td>
                          <td className={tdClass}><StatusPill status={page.status === "published" ? "published" : "draft"} /></td>
                          <td className={`${tdClass} text-ink-muted`}>{page.section_count}</td>
                          <td className={`${tdClass} whitespace-nowrap text-ink-muted`}>{page.system_key && page.updated_at === page.created_at ? "Not edited yet" : formatDate(page.updated_at)}</td>
                          <td className={tdClass}>
                            <div className="flex justify-end gap-1">
                              <IconButton label={page.status === "published" ? "View page" : "Preview draft"} href={path} target="_blank"><ExternalLink size={16} /></IconButton>
                              <Link href={`/admin/pages/${page.id}`} title="Edit" aria-label={`Edit ${page.title}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-ivory-100 hover:text-ink"><Pencil size={16} /></Link>
                              <IconButton label={`Duplicate ${page.title} as a new page`} onClick={() => void duplicate(page)}><Copy size={16} /></IconButton>
                              {page.system_key ? <span className="w-9" aria-hidden="true" /> : <IconButton label={`Delete ${page.title}`} tone="danger" onClick={() => void remove(page)}><Trash2 size={16} /></IconButton>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="mt-4 text-[13px] text-ink-muted">Website pages start with what is on the site today, so nothing changes until you edit and save. Tip: publish your own pages, then add them to the header or footer from the page builder or the Menu screen.</p>

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 p-4" role="dialog" aria-modal="true" aria-label="New page">
      <form onSubmit={submit} className="w-full max-w-lg animate-fade-in-up rounded-[20px] bg-white shadow-float">
        <div className="flex items-center justify-between border-b border-line px-6 py-4"><h2 className="font-heading text-[24px] leading-8 text-ink">New page</h2><IconButton label="Close" onClick={onClose}><X size={20} /></IconButton></div>
        <div className="space-y-5 p-6">
          <label className="block text-[14px] font-semibold text-ink">Page title
            <input autoFocus required value={title} maxLength={120} placeholder="e.g. NRI Investment Desk" className={inputClass} onChange={(event) => { setTitle(event.target.value); if (!slugEdited) setSlug(slugify(event.target.value)); }} />
          </label>
          <label className="block text-[14px] font-semibold text-ink">Page URL
            <div className="mt-1.5 flex items-center rounded-xl border border-line-strong bg-ivory-50 focus-within:border-navy-900 focus-within:ring-4 focus-within:ring-gold-200/70"><span className="pl-3 text-[14px] font-normal text-ink-muted">hpglobalinfra.com/</span><input required value={slug} className="w-full rounded-r-xl bg-white px-2 py-2.5 text-[15px] font-normal outline-none" onChange={(event) => { setSlugEdited(true); setSlug(slugify(event.target.value)); }} /></div>
            {problem && <span className="mt-1 block text-[13px] font-normal text-danger">{problem}</span>}
          </label>
          <p className="text-[13px] text-ink-muted">The page starts as a draft with a hero banner and a text section. You can change everything next.</p>
          {error && <Notice tone="error">{error}</Notice>}
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-6 py-4"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving || !title.trim() || !!problem}><FilePlus2 size={16} />{saving ? "Creating…" : "Create page"}</Button></div>
      </form>
    </div>
  );
}
