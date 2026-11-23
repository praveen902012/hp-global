"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChartBar, ChevronDown, ChevronUp, CircleHelp, Columns2, Copy, ExternalLink, Globe, Image as ImageIcon,
  Images, LayoutGrid, LayoutTemplate, Loader2, Mail, Megaphone, Plus, Save, Settings2, Trash2, Type, Upload, Video, X,
} from "lucide-react";
import { api, type AdminPage } from "../../lib/api";
import { Button, inputClass } from "../../components/admin/ui";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { sitePages } from "../../data/siteMenu";
import {
  createSection, newSectionId, normalizePageContent, PAGE_LIMITS, sectionCatalog, slugError, slugify, toVideoEmbedUrl,
  type PageContent, type PageSection, type SectionBackground, type SectionType,
} from "../../data/pages";

const icons: Record<SectionType, React.ComponentType<{ size?: number; className?: string }>> = {
  hero: LayoutTemplate, text: Type, image_text: Columns2, gallery: Images, cards: LayoutGrid,
  stats: ChartBar, video: Video, faq: CircleHelp, cta: Megaphone, contact_form: Mail,
};
const labelOf = (type: SectionType) => sectionCatalog.find((entry) => entry.type === type)?.label ?? type;
const toContent = (page: AdminPage): PageContent => ({ title: page.title, slug: page.slug, meta_description: page.meta_description, sections: page.sections });
const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

function summary(section: PageSection) {
  switch (section.type) {
    case "hero": return section.title;
    case "gallery": return `${section.heading || "Gallery"} · ${section.images.length} image${section.images.length === 1 ? "" : "s"}`;
    case "cards": return `${section.heading || "Cards"} · ${section.cards.length} card${section.cards.length === 1 ? "" : "s"}`;
    case "stats": return section.items.map((item) => item.value).join(" · ");
    case "faq": return `${section.heading || "FAQ"} · ${section.items.length} question${section.items.length === 1 ? "" : "s"}`;
    case "video": return section.heading || section.url || "No video link yet";
    default: return "heading" in section ? section.heading : "";
  }
}

export function AdminPageEditor({ id }: { id: number }) {
  const [page, setPage] = useState<AdminPage | null>(null);
  const [content, setContent] = useState<PageContent | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<null | "saving" | "publishing">(null);
  const [status, setStatus] = useState<{ error?: string; success?: string }>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pickerAt, setPickerAt] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    api.getPage(id).then((loaded) => { setPage(loaded); setContent(toContent(loaded)); setExpanded(loaded.sections[0]?.id ?? null); })
      .catch((error) => setStatus({ error: errorText(error, "Unable to load the page.") }));
  }, [id]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!page || !content) return <div className="text-[14px] text-ink-muted">{status.error || "Loading page…"}{status.error && <Link href="/admin/pages" className="ml-3 text-ink underline">Back to pages</Link>}</div>;

  const change = (next: PageContent) => { setContent(next); setDirty(true); setStatus({}); };
  const setSections = (sections: PageSection[]) => change({ ...content, sections });
  const updateSection = (index: number, section: PageSection) => setSections(content.sections.map((item, position) => position === index ? section : item));
  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= content.sections.length) return;
    const next = [...content.sections]; [next[index], next[target]] = [next[target], next[index]]; setSections(next);
  };
  const duplicateSection = (index: number) => {
    const copy = { ...structuredClone(content.sections[index]), id: newSectionId() };
    const next = [...content.sections]; next.splice(index + 1, 0, copy); setSections(next); setExpanded(copy.id);
  };
  const removeSection = (index: number) => {
    if (!window.confirm(`Remove the "${labelOf(content.sections[index].type)}" section?`)) return;
    setSections(content.sections.filter((_, position) => position !== index));
  };
  const insertSection = (type: SectionType) => {
    if (pickerAt === null) return;
    const section = createSection(type);
    const next = [...content.sections]; next.splice(pickerAt, 0, section); setSections(next);
    setExpanded(section.id); setPickerAt(null);
  };

  async function save(): Promise<AdminPage | null> {
    const check = normalizePageContent(content, undefined, page?.system_key ? { fixedSlug: page.slug } : {});
    if ("error" in check) { setStatus({ error: check.error }); return null; }
    setBusy("saving"); setStatus({});
    try {
      const saved = await api.updatePage(id, check.content);
      setPage(saved); setContent(toContent(saved)); setDirty(false);
      setStatus({ success: saved.status === "published" ? "Saved. The live page has been updated." : "Draft saved." });
      return saved;
    } catch (error) { setStatus({ error: errorText(error, "Unable to save the page.") }); return null; }
    finally { setBusy(null); }
  }

  async function changePublished(published: boolean, addToMenu: ("header" | "footer")[] = [], menuLabel = "") {
    if (dirty && !await save()) return;
    setBusy("publishing"); setStatus({});
    try {
      const result = await api.setPagePublished(id, { published, add_to_menu: addToMenu, menu_label: menuLabel });
      setPage(result); setPublishing(false);
      const notes = [published ? `Published — live at /${result.slug}.` : "Unpublished. The page is now a draft and hidden from visitors."];
      if (result.menu_full.length) notes.push(`The ${result.menu_full.join(" and ")} menu is full (12 links), so no link was added there.`);
      if (result.removed_menu_links) notes.push(`Removed ${result.removed_menu_links} menu link${result.removed_menu_links > 1 ? "s" : ""} to it.`);
      setStatus({ success: notes.join(" ") });
    } catch (error) { setStatus({ error: errorText(error, "Unable to change the page status.") }); }
    finally { setBusy(null); }
  }

  const live = page.status === "published";
  const system = page.system_key !== null;
  const slugChanged = content.slug !== page.slug;

  return (
    <div className="pb-16">
      <datalist id="site-links">{sitePages.map((item) => <option key={item.href} value={item.href}>{item.label}</option>)}</datalist>

      {/* Toolbar */}
      <div className="sticky top-[60px] z-30 -mx-4 -mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:-mt-8 md:px-6 lg:top-16 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/pages" className="rounded p-2 text-ink-muted hover:bg-ivory-100" title="All pages" aria-label="All pages"><ArrowLeft size={18} /></Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2"><h1 className="truncate font-heading text-2xl text-ink">{content.title || "Untitled page"}</h1><span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${live ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{live ? "Published" : "Draft"}</span>{system && <span className="shrink-0 rounded-full bg-ivory-100 px-2.5 py-0.5 text-xs font-semibold text-ink-muted">Site page</span>}</div>
            <p className="truncate text-xs text-ink-subtle">/{page.slug}{dirty && <span className="ml-2 text-amber-600">· Unsaved changes</span>}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/${page.slug}`} target="_blank" title={dirty ? "Preview shows the last saved version" : undefined} className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-3 py-2 text-sm text-ink-muted hover:border-navy-900 hover:text-ink"><ExternalLink size={15} />{live ? "View" : "Preview"}</Link>
          <button type="button" onClick={() => void save()} disabled={!dirty || busy !== null} className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-3 py-2 text-sm text-ink hover:border-navy-900 disabled:cursor-not-allowed disabled:opacity-50">{busy === "saving" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}{live ? "Save & update live page" : "Save draft"}</button>
          {system ? null : live
            ? <button type="button" disabled={busy !== null} onClick={() => { if (window.confirm("Unpublish this page? Visitors will no longer see it, and menu links to it will be removed.")) void changePublished(false); }} className="rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">Unpublish</button>
            : <Button type="button" size="sm" disabled={busy !== null} onClick={() => setPublishing(true)} className="gap-2"><Globe size={15} />Publish</Button>}
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-4 pt-6">
        {status.error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{status.error}</div>}
        {status.success && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status.success}</div>}

        {/* Page settings */}
        <section className="rounded-[20px] border border-line bg-white">
          <button type="button" onClick={() => setSettingsOpen(!settingsOpen)} className="flex w-full items-center justify-between px-5 py-4 text-left" aria-expanded={settingsOpen}>
            <span className="flex items-center gap-3"><Settings2 size={18} className="text-gold-700" /><span className="font-medium text-ink">Page settings</span><span className="text-xs text-ink-subtle">Title, URL and search description</span></span>
            {settingsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {settingsOpen && (
            <div className="grid gap-4 border-t border-line p-5 md:grid-cols-2">
              <label className="block text-[14px] font-semibold text-ink">Page title<input className={inputClass} value={content.title} maxLength={PAGE_LIMITS.title} onChange={(event) => change({ ...content, title: event.target.value })} /><span className="mt-1 block text-xs font-normal text-ink-subtle">Shown in the browser tab and search results.</span></label>
              <label className="block text-[14px] font-semibold text-ink">Page URL
                <div className={`mt-1.5 flex items-center rounded-xl border border-line-strong focus-within:border-navy-900 ${system ? "bg-ivory-50" : ""}`}><span className="pl-3 text-sm text-ink-subtle">/</span><input readOnly={system} className="w-full rounded-xl bg-transparent py-2 pl-0.5 pr-3 text-sm outline-none read-only:text-ink-muted" value={content.slug} onChange={(event) => change({ ...content, slug: slugify(event.target.value) })} /></div>
                {system ? <span className="mt-1 block text-xs font-normal text-ink-subtle">Built-in site page: its address can&apos;t be changed.</span> : slugError(content.slug) ? <span className="mt-1 block text-xs font-normal text-red-600">{slugError(content.slug)}</span>
                  : slugChanged && live ? <span className="mt-1 block text-xs font-normal text-amber-700">The old address /{page.slug} will stop working. Menu links will be updated automatically.</span> : null}
              </label>
              <label className="block text-[14px] font-semibold text-ink md:col-span-2">Search description <span className="font-normal text-ink-subtle">(optional)</span>
                <textarea rows={2} className={`${inputClass} resize-y`} value={content.meta_description} maxLength={PAGE_LIMITS.meta} onChange={(event) => change({ ...content, meta_description: event.target.value })} placeholder="One or two sentences that appear under the page title in Google." />
                <span className="mt-1 block text-right text-xs font-normal text-ink-subtle">{content.meta_description.length}/{PAGE_LIMITS.meta}</span>
              </label>
            </div>
          )}
        </section>

        {/* Sections */}
        <div className="flex items-end justify-between pt-4"><h2 className="font-heading text-xl text-ink">Sections</h2><span className="text-xs text-ink-subtle">{content.sections.length} / {PAGE_LIMITS.sections} · top to bottom as they appear on the page</span></div>

        {content.sections.length === 0 && <p className="rounded-xl border border-dashed border-line-strong p-8 text-center text-sm text-ink-muted">This page has no sections yet. Add one below.</p>}

        {content.sections.map((section, index) => {
          const Icon = icons[section.type];
          const open = expanded === section.id;
          return (
            <div key={section.id}>
              <InsertButton onClick={() => setPickerAt(index)} disabled={content.sections.length >= PAGE_LIMITS.sections} />
              <section className={`rounded-xl border bg-white  ${open ? "border-gold-400" : "border-line"}`}>
                <div className="flex items-center gap-2 px-4 py-3">
                  <button type="button" onClick={() => setExpanded(open ? null : section.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-200/60 text-ink"><Icon size={18} /></span>
                    <span className="min-w-0"><span className="block text-sm font-semibold text-ink">{index + 1}. {labelOf(section.type)}</span><span className="block truncate text-xs text-ink-muted">{summary(section) || "—"}</span></span>
                  </button>
                  <BackgroundPicker value={section.background} onChange={(background) => updateSection(index, { ...section, background })} />
                  <ToolButton label="Move up" disabled={index === 0} onClick={() => moveSection(index, -1)}><ChevronUp size={16} /></ToolButton>
                  <ToolButton label="Move down" disabled={index === content.sections.length - 1} onClick={() => moveSection(index, 1)}><ChevronDown size={16} /></ToolButton>
                  <ToolButton label="Duplicate" disabled={content.sections.length >= PAGE_LIMITS.sections} onClick={() => duplicateSection(index)}><Copy size={15} /></ToolButton>
                  <ToolButton label="Remove section" danger onClick={() => removeSection(index)}><Trash2 size={15} /></ToolButton>
                </div>
                {open && <div className="border-t border-line p-5"><SectionFields section={section} onChange={(next) => updateSection(index, next)} onError={(error) => setStatus({ error })} /></div>}
              </section>
            </div>
          );
        })}

        <button type="button" onClick={() => setPickerAt(content.sections.length)} disabled={content.sections.length >= PAGE_LIMITS.sections} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong py-5 text-sm font-medium text-ink-muted transition hover:border-navy-900 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"><Plus size={18} />Add section</button>
      </div>

      {pickerAt !== null && <SectionPicker onPick={insertSection} onClose={() => setPickerAt(null)} />}
      {publishing && <PublishDialog page={page} title={content.title} busy={busy === "publishing" || busy === "saving"} dirty={dirty} onClose={() => setPublishing(false)} onPublish={(menus, label) => void changePublished(true, menus, label)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor chrome                                                       */
/* ------------------------------------------------------------------ */

function ToolButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className={`rounded-xl p-2 transition disabled:cursor-not-allowed disabled:opacity-30 ${danger ? "text-red-500 hover:bg-red-50" : "text-ink-muted hover:bg-ivory-100 hover:text-ink"}`}>{children}</button>;
}

function InsertButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  if (disabled) return <div className="h-3" />;
  return <div className="group relative flex h-6 items-center justify-center"><div className="absolute inset-x-0 h-px bg-transparent transition group-hover:bg-gold-400/40" /><button type="button" onClick={onClick} className="relative z-10 flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-0.5 text-xs text-ink-subtle opacity-60 transition hover:border-navy-900 hover:text-ink hover:opacity-100 focus:opacity-100 group-hover:opacity-100"><Plus size={12} />Insert section here</button></div>;
}

function BackgroundPicker({ value, onChange }: { value: SectionBackground; onChange: (value: SectionBackground) => void }) {
  const options: { value: SectionBackground; label: string; swatch: string }[] = [
    { value: "white", label: "White background", swatch: "bg-white" },
    { value: "light", label: "Light grey background", swatch: "bg-brand-light-grey" },
    { value: "dark", label: "Dark background", swatch: "bg-navy-900" },
  ];
  return (
    <div className="mr-1 hidden items-center gap-1 sm:flex" role="radiogroup" aria-label="Section background">
      {options.map((option) => <button key={option.value} type="button" role="radio" aria-checked={value === option.value} title={option.label} aria-label={option.label} onClick={() => onChange(option.value)} className={`h-5 w-5 rounded-full border ${option.swatch} ${value === option.value ? "ring-2 ring-brand-champagne ring-offset-1" : "border-line-strong"}`} />)}
    </div>
  );
}

function SectionPicker({ onPick, onClose }: { onPick: (type: SectionType) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 p-4" role="dialog" aria-modal="true" aria-label="Add a section" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-float" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4"><h2 className="font-heading text-2xl text-ink">Add a section</h2><button type="button" onClick={onClose} aria-label="Close" className="rounded p-2 text-ink-muted hover:bg-ivory-100"><X size={20} /></button></div>
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          {sectionCatalog.map((entry) => {
            const Icon = icons[entry.type];
            return <button key={entry.type} type="button" onClick={() => onPick(entry.type)} className="flex items-start gap-3 rounded-2xl border border-line p-4 text-left transition hover:border-navy-900 hover:bg-gold-400/5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-200/60"><Icon size={20} /></span><span><span className="block font-semibold text-ink">{entry.label}</span><span className="mt-0.5 block text-xs text-ink-muted">{entry.description}</span></span></button>;
          })}
        </div>
      </div>
    </div>
  );
}

function PublishDialog({ page, title, busy, dirty, onClose, onPublish }: { page: AdminPage; title: string; busy: boolean; dirty: boolean; onClose: () => void; onPublish: (menus: ("header" | "footer")[], label: string) => void }) {
  const [menus, setMenus] = useState<("header" | "footer")[]>([]);
  const [label, setLabel] = useState(title.slice(0, 40));
  const toggle = (menu: "header" | "footer") => setMenus((current) => current.includes(menu) ? current.filter((item) => item !== menu) : [...current, menu]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 p-4" role="dialog" aria-modal="true" aria-label="Publish page">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-float">
        <div className="flex items-center justify-between border-b border-line px-6 py-4"><h2 className="font-heading text-2xl text-ink">Publish page</h2><button type="button" onClick={onClose} aria-label="Close" className="rounded p-2 text-ink-muted hover:bg-ivory-100"><X size={20} /></button></div>
        <div className="space-y-5 p-6">
          <p className="text-sm text-ink-muted">This page will be public at <strong className="text-ink">/{page.slug}</strong>.{dirty && " Your unsaved changes will be saved first."}</p>
          <fieldset>
            <legend className="mb-2 text-[14px] font-semibold text-ink">Add a link to it in the site menu <span className="font-normal text-ink-subtle">(optional)</span></legend>
            {(["header", "footer"] as const).map((menu) => {
              const already = page.menus.includes(menu);
              return <label key={menu} className={`mb-2 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${already ? "border-line bg-ivory-50 text-ink-subtle" : "border-line text-ink"}`}><input type="checkbox" className="h-4 w-4 accent-navy-900" disabled={already} checked={already || menus.includes(menu)} onChange={() => toggle(menu)} />{menu === "header" ? "Header menu (top navigation)" : "Footer menu"}{already && <span className="ml-auto text-xs">Already linked</span>}</label>;
            })}
          </fieldset>
          {menus.length > 0 && <label className="block text-[14px] font-semibold text-ink">Menu label<input className={inputClass} value={label} maxLength={40} onChange={(event) => setLabel(event.target.value)} /><span className="mt-1 block text-xs font-normal text-ink-subtle">You can rename or reorder it later on the Menu page.</span></label>}
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4"><button type="button" onClick={onClose} className="px-3 text-sm text-ink-muted hover:text-ink">Cancel</button><Button type="button" disabled={busy || (menus.length > 0 && !label.trim())} onClick={() => onPublish(menus, label.trim())} className="gap-2">{busy ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}{busy ? "Publishing…" : "Publish now"}</Button></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Field components                                                    */
/* ------------------------------------------------------------------ */

function Field({ label, value, onChange, placeholder, hint, max = PAGE_LIMITS.short, wide, list }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; hint?: string; max?: number; wide?: boolean; list?: string }) {
  return <label className={`block text-[14px] font-semibold text-ink ${wide ? "md:col-span-2" : ""}`}>{label}<input className={inputClass} value={value} maxLength={max} placeholder={placeholder} list={list} onChange={(event) => onChange(event.target.value)} />{hint && <span className="mt-1 block text-xs font-normal text-ink-subtle">{hint}</span>}</label>;
}

function Area({ label, value, onChange, placeholder, rows = 3, max = PAGE_LIMITS.medium, wide = true }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number; max?: number; wide?: boolean }) {
  return <label className={`block text-[14px] font-semibold text-ink ${wide ? "md:col-span-2" : ""}`}>{label}<textarea rows={rows} className={`${inputClass} resize-y`} value={value} maxLength={max} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Choice<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return (
    <div className="text-[14px] font-semibold text-ink">{label}
      <div className="mt-1.5 inline-flex w-full rounded-xl border border-line-strong p-0.5">
        {options.map((option) => <button key={String(option.value)} type="button" onClick={() => onChange(option.value)} className={`flex-1 rounded px-3 py-1.5 text-sm transition ${value === option.value ? "bg-navy-900 text-white" : "text-ink-muted hover:bg-ivory-100"}`}>{option.label}</button>)}
      </div>
    </div>
  );
}

function LinkField({ label, value, onChange, wide }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) {
  return <Field label={label} value={value} onChange={onChange} list="site-links" max={500} placeholder="/contact or https://…" hint="Pick a site page or paste a full web address." wide={wide} />;
}

function ImageField({ label, value, onChange, onError, required, wide = true }: { label: string; value: string; onChange: (value: string) => void; onError: (message: string) => void; required?: boolean; wide?: boolean }) {
  const [uploading, setUploading] = useState(false);
  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try { onChange((await api.uploadImage(file)).image_url); } catch (error) { onError(errorText(error, "Unable to upload the image.")); } finally { setUploading(false); }
  }
  return (
    <div className={`text-[14px] font-semibold text-ink ${wide ? "md:col-span-2" : ""}`}>{label}{required && <span className="text-red-500"> *</span>}
      <div className="mt-1.5 flex gap-3">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-ivory-50">{value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={22} className="text-ink-subtle" />}</div>
        <div className="flex-1 space-y-2">
          <input className={`${inputClass} mt-0`} value={value} placeholder="Upload an image or paste its URL" onChange={(event) => onChange(event.target.value)} />
          <div className="flex gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line-strong px-3 py-1.5 text-xs text-ink-muted hover:border-navy-900">{uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{uploading ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label>
            {value && <button type="button" onClick={() => onChange("")} className="text-xs text-ink-muted hover:text-red-600">Remove</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Generic editable list with add / move / remove. */
function ItemList<T>({ label, items, onChange, create, render, addLabel, max = PAGE_LIMITS.listItems }: { label: string; items: T[]; onChange: (items: T[]) => void; create: () => T; render: (item: T, update: (item: T) => void, index: number) => React.ReactNode; addLabel: string; max?: number }) {
  const move = (index: number, direction: -1 | 1) => { const target = index + direction; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; onChange(next); };
  return (
    <div className="md:col-span-2">
      <p className="mb-2 text-[14px] font-semibold text-ink">{label} <span className="font-normal text-ink-subtle">({items.length}/{max})</span></p>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl border border-line bg-ivory-50/50 p-3">
            <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-ink-muted">#{index + 1}</span><div className="flex"><ToolButton label="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ChevronUp size={14} /></ToolButton><ToolButton label="Move down" disabled={index === items.length - 1} onClick={() => move(index, 1)}><ChevronDown size={14} /></ToolButton><ToolButton label="Remove" danger onClick={() => onChange(items.filter((_, position) => position !== index))}><Trash2 size={14} /></ToolButton></div></div>
            <div className="grid gap-3 md:grid-cols-2">{render(item, (next) => onChange(items.map((current, position) => position === index ? next : current)), index)}</div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, create()])} disabled={items.length >= max} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-line-strong px-3 py-2 text-sm text-ink-muted hover:border-navy-900 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={15} />{addLabel}</button>
    </div>
  );
}

function GalleryUpload({ onAdd, onError, remaining }: { onAdd: (urls: string[]) => void; onError: (message: string) => void; remaining: number }) {
  const [uploading, setUploading] = useState(0);
  async function upload(files: FileList | null) {
    const chosen = Array.from(files ?? []).slice(0, remaining);
    if (!chosen.length) return;
    setUploading(chosen.length);
    const urls: string[] = [];
    for (const file of chosen) {
      try { urls.push((await api.uploadImage(file)).image_url); } catch (error) { onError(`${file.name}: ${errorText(error, "upload failed")}`); }
      setUploading((count) => count - 1);
    }
    if (urls.length) onAdd(urls);
  }
  return <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-navy-900 px-3 py-2 text-sm text-white hover:bg-gold-400 ${remaining <= 0 ? "pointer-events-none opacity-50" : ""}`}>{uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}{uploading ? `Uploading ${uploading}…` : "Upload images"}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading > 0 || remaining <= 0} onChange={(event) => { void upload(event.target.files); event.target.value = ""; }} /></label>;
}

/* ------------------------------------------------------------------ */
/* Per-section forms                                                   */
/* ------------------------------------------------------------------ */

function SectionFields({ section, onChange, onError }: { section: PageSection; onChange: (section: PageSection) => void; onError: (message: string) => void }) {
  const grid = "grid gap-4 md:grid-cols-2";
  switch (section.type) {
    case "hero": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Title" value={section.title} onChange={(title) => set({ title })} />
          <Field label="Second line (gold italic)" value={section.accent_title} onChange={(accent_title) => set({ accent_title })} placeholder="Optional" />
          <Field label="Small heading above title" value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="e.g. Premium Residences" />
          <Choice label="Height" value={section.height} options={[{ value: "medium", label: "Medium" }, { value: "full", label: "Full screen" }]} onChange={(height) => set({ height })} />
          <Area label="Subtitle" value={section.subtitle} onChange={(subtitle) => set({ subtitle })} rows={2} />
          <ImageField label="Background image" value={section.image_url} onChange={(image_url) => set({ image_url })} onError={onError} />
          <Field label="Button label" value={section.button_label} onChange={(button_label) => set({ button_label })} placeholder="Optional, e.g. Book a visit" max={60} />
          <LinkField label="Button link" value={section.button_href} onChange={(button_href) => set({ button_href })} />
        </div>
      );
    }
    case "text": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} />
          <Field label="Small heading above" value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="Optional" />
          <Choice label="Alignment" value={section.align} options={[{ value: "left", label: "Left" }, { value: "center", label: "Centred" }]} onChange={(align) => set({ align })} />
          <div className="md:col-span-2 text-[14px] font-semibold text-ink">Text<RichTextEditor value={section.body} onChange={(body) => set({ body })} minHeight="min-h-48" /></div>
        </div>
      );
    }
    case "image_text": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} />
          <Field label="Second line (gold italic)" value={section.accent_heading ?? ""} onChange={(accent_heading) => set({ accent_heading })} placeholder="Optional, e.g. Excellence" />
          <Field label="Small heading above" value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="Optional" />
          <div className="md:col-span-2 text-[14px] font-semibold text-ink">Text<RichTextEditor value={section.body} onChange={(body) => set({ body })} /></div>
          <ImageField label="Image" required value={section.image_url} onChange={(image_url) => set({ image_url })} onError={onError} />
          <Field label="Image description (for accessibility)" value={section.image_alt} onChange={(image_alt) => set({ image_alt })} placeholder="e.g. Tower A at sunset" />
          <Field label="Closing line (small capitals, optional)" value={section.tagline ?? ""} onChange={(tagline) => set({ tagline })} placeholder="e.g. Join us in shaping a new era…" wide />
          <Choice label="Image position" value={section.image_position} options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} onChange={(image_position) => set({ image_position })} />
          <Field label="Button label" value={section.button_label} onChange={(button_label) => set({ button_label })} placeholder="Optional" max={60} />
          <LinkField label="Button link" value={section.button_href} onChange={(button_href) => set({ button_href })} />
        </div>
      );
    }
    case "gallery": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" />
          <Choice label="Images per row" value={section.columns} options={[{ value: 2, label: "2" }, { value: 3, label: "3" }, { value: 4, label: "4" }]} onChange={(columns) => set({ columns })} />
          <div className="md:col-span-2"><GalleryUpload remaining={PAGE_LIMITS.listItems - section.images.length} onError={onError} onAdd={(urls) => set({ images: [...section.images, ...urls.map((src) => ({ src, alt: "" }))] })} /></div>
          <ItemList label="Images" items={section.images} onChange={(images) => set({ images })} addLabel="Add image by URL" create={() => ({ src: "", alt: "" })}
            render={(image, update) => <><ImageField label="Image" required value={image.src} onChange={(src) => update({ ...image, src })} onError={onError} /><Field label="Description" wide value={image.alt} onChange={(alt) => update({ ...image, alt })} placeholder="What the photo shows" /></>} />
        </div>
      );
    }
    case "cards": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" />
          <Area label="Intro" value={section.intro} onChange={(intro) => set({ intro })} rows={2} wide={false} />
          <ItemList label="Cards" items={section.cards} onChange={(cards) => set({ cards })} addLabel="Add card" create={() => ({ image_url: "", title: "", description: "", link: "" })}
            render={(card, update) => <><Field label="Title" value={card.title} onChange={(title) => update({ ...card, title })} /><LinkField label="Link (optional)" value={card.link} onChange={(link) => update({ ...card, link })} /><Area label="Text" value={card.description} onChange={(description) => update({ ...card, description })} rows={2} /><ImageField label="Image (optional)" value={card.image_url} onChange={(image_url) => update({ ...card, image_url })} onError={onError} /></>} />
        </div>
      );
    }
    case "stats": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" wide />
          <ItemList label="Figures" items={section.items} max={8} onChange={(items) => set({ items })} addLabel="Add figure" create={() => ({ value: "", label: "" })}
            render={(item, update) => <><Field label="Number" value={item.value} max={30} onChange={(value) => update({ ...item, value })} placeholder="e.g. 25+" /><Field label="Label" value={item.label} max={80} onChange={(label) => update({ ...item, label })} placeholder="e.g. Years of experience" /></>} />
        </div>
      );
    }
    case "video": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      const embed = section.url ? toVideoEmbedUrl(section.url) : null;
      return (
        <div className={grid}>
          <Field label="YouTube or Vimeo link" value={section.url} max={500} onChange={(url) => set({ url })} placeholder="https://www.youtube.com/watch?v=…" hint={section.url && !embed ? "This doesn't look like a YouTube or Vimeo link." : "Paste the normal video link — it is converted automatically."} wide />
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" />
          <Field label="Caption" value={section.caption} max={PAGE_LIMITS.medium} onChange={(caption) => set({ caption })} placeholder="Optional" />
          {embed && <div className="md:col-span-2 aspect-video max-w-md overflow-hidden rounded-xl bg-black"><iframe src={embed} title="Video preview" className="h-full w-full" allowFullScreen /></div>}
        </div>
      );
    }
    case "faq": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} wide />
          <ItemList label="Questions" items={section.items} onChange={(items) => set({ items })} addLabel="Add question" create={() => ({ question: "", answer: "" })}
            render={(item, update) => <><Field label="Question" wide value={item.question} max={PAGE_LIMITS.medium} onChange={(question) => update({ ...item, question })} /><Area label="Answer" value={item.answer} max={PAGE_LIMITS.long} onChange={(answer) => update({ ...item, answer })} /></>} />
        </div>
      );
    }
    case "cta": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} wide />
          <Area label="Text" value={section.text} onChange={(text) => set({ text })} rows={2} />
          <Field label="Button label" value={section.button_label} max={60} onChange={(button_label) => set({ button_label })} />
          <LinkField label="Button link" value={section.button_href} onChange={(button_href) => set({ button_href })} />
        </div>
      );
    }
    case "contact_form": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} />
          <Area label="Intro" value={section.intro} onChange={(intro) => set({ intro })} rows={2} wide={false} />
          <p className="md:col-span-2 rounded-xl bg-ivory-50 px-3 py-2 text-xs text-ink-muted">Visitors fill in name, email and message. Submissions appear under <Link href="/admin/contacts" className="underline">Contact Requests</Link>.</p>
        </div>
      );
    }
  }
}
