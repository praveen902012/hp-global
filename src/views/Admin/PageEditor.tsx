"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Building2, ChartBar, ChevronDown, ChevronUp, CircleHelp, Columns2, Copy, ExternalLink, FileText, Globe, Image as ImageIcon,
  Images, LayoutGrid, LayoutTemplate, ListChecks, Loader2, Lock, Mail, Megaphone, Newspaper, Plus, RefreshCw, Save, Sparkles, Star, Trash2, Type, Upload, Video, X,
} from "lucide-react";
import { api, type AdminPage } from "../../lib/api";
import { Button, inputClass } from "../../components/admin/ui";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { sitePages } from "../../data/siteMenu";
import { defaultSiteDetails } from "../../data/siteDetails";
import { systemPagePath } from "../../data/systemPages";
import {
  createSection, ENQUIRE_LINK, iconOptions, newSectionId, normalizePageContent, PAGE_LIMITS, SEO_DESCRIPTION_TARGET, sectionCatalog, slugError, slugify, toVideoEmbedUrl,
  type CardProjects, type PageContent, type PageSection, type SectionBackground, type SectionType,
} from "../../data/pages";

const icons: Record<SectionType, React.ComponentType<{ size?: number; className?: string }>> = {
  hero: LayoutTemplate, text: Type, image_text: Columns2, gallery: Images, cards: LayoutGrid,
  stats: ChartBar, video: Video, faq: CircleHelp, cta: Megaphone, contact_form: Mail,
  icon_cards: Sparkles, service: ListChecks, legal_text: FileText,
  projects: Building2, featured_project: Star, press: Newspaper, articles: BookOpen,
  projects_list: Building2, press_list: Newspaper, articles_list: BookOpen, contact_details: Mail,
};
const catalogEntry = (type: SectionType) => sectionCatalog.find((entry) => entry.type === type);
const labelOf = (type: SectionType) => catalogEntry(type)?.label ?? type;
const isFixed = (type: SectionType) => catalogEntry(type)?.group === "fixed";
const isLive = (type: SectionType) => catalogEntry(type)?.group !== "content";
const toContent = (page: AdminPage): PageContent => ({ title: page.title, slug: page.slug, meta_description: page.meta_description, seo_title: page.seo_title, share_image: page.share_image, sections: page.sections });
const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

function summary(section: PageSection) {
  switch (section.type) {
    case "hero": return section.title;
    case "gallery": return `${section.heading || "Gallery"} · ${section.images.length} image${section.images.length === 1 ? "" : "s"}`;
    case "cards": return `${section.heading || "Cards"} · ${section.cards.length} card${section.cards.length === 1 ? "" : "s"}${section.layout === "rows" ? " · photo rows" : ""}`;
    case "icon_cards": return `${section.heading || "Icon cards"} · ${section.cards.length} ${section.style === "steps" ? "steps" : "cards"}`;
    case "stats": return section.items.map((item) => item.value).join(" · ");
    case "faq": return `${section.heading || "FAQ"} · ${section.items.length} question${section.items.length === 1 ? "" : "s"}`;
    case "video": return section.heading || section.url || "No video link yet";
    case "service": return [section.eyebrow, section.title].filter(Boolean).join(" · ");
    case "legal_text": return section.heading;
    case "projects": return `${section.heading || "Projects"} · up to ${section.limit}`;
    case "featured_project": return "Shows the project chosen in Featured project";
    case "press": case "articles": return `${section.heading} · latest ${section.limit}`;
    case "projects_list": return "Every published project, with filters";
    case "press_list": return "All press coverage, with a project filter";
    case "articles_list": return "Every published article, with search and topics";
    case "contact_details": return "Phone, WhatsApp, email, contact form and office";
    case "cta": return section.style === "band" ? `${section.heading} · photo banner` : section.heading;
    default: return "heading" in section ? section.heading : "";
  }
}

/** Where the information in a live or fixed section comes from. */
const liveNotes: Partial<Record<SectionType, React.ReactNode>> = {
  projects: <>The project cards come from <Link href="/admin/properties" className="underline">Projects</Link> and update by themselves. To change a card, edit the project.</>,
  featured_project: <>Photos, highlights and text come from <Link href="/admin/featured-project" className="underline">Featured project</Link>, and update by themselves.</>,
  press: <>Shows your newest coverage from <Link href="/admin/press" className="underline">Press</Link>. Hidden while there is none.</>,
  articles: <>Shows your newest published articles from <Link href="/admin/articles" className="underline">Articles</Link>.</>,
  projects_list: <>This section is always on the Projects page, so it can&apos;t be removed. Add, hide or reorder projects in <Link href="/admin/properties" className="underline">Projects</Link>.</>,
  press_list: <>This section is always on this page, so it can&apos;t be removed. Coverage is managed in <Link href="/admin/press" className="underline">Press</Link>.</>,
  articles_list: <>This section is always on the Journal, so it can&apos;t be removed. Articles are managed in <Link href="/admin/articles" className="underline">Articles</Link>.</>,
  contact_details: <>Always on the Contact page. The phone, WhatsApp, email, address and map link come from <Link href="/admin/site-details" className="underline">Site details</Link>.</>,
};

export function AdminPageEditor({ id }: { id: number }) {
  const [page, setPage] = useState<AdminPage | null>(null);
  const [content, setContent] = useState<PageContent | null>(null);
  const [siteName, setSiteName] = useState(defaultSiteDetails.site_name);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<null | "saving" | "publishing">(null);
  const [status, setStatus] = useState<{ error?: string; success?: string }>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pickerAt, setPickerAt] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    api.getPage(id).then((loaded) => { setPage(loaded); setContent(toContent(loaded)); setExpanded(loaded.sections[0]?.id ?? null); })
      .catch((error) => setStatus({ error: errorText(error, "Unable to load the page.") }));
    api.getSiteDetails().then((details) => setSiteName(details.site_name)).catch(() => undefined);
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
  const insertSection = (type: SectionType, at: number) => {
    const section = createSection(type);
    const next = [...content.sections]; next.splice(at, 0, section); setSections(next);
    setExpanded(section.id); setPickerAt(null);
  };
  /** Side panel: add below the open section, or at the end. */
  const insertAfterOpen = (type: SectionType) => {
    const open = content.sections.findIndex((section) => section.id === expanded);
    insertSection(type, open < 0 ? content.sections.length : open + 1);
  };

  async function save(): Promise<AdminPage | null> {
    const check = normalizePageContent(content, undefined, page?.system_key ? { fixedSlug: page.slug, systemKey: page.system_key } : {});
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
  const path = systemPagePath(page.system_key, page.slug);
  const slugChanged = content.slug !== page.slug;
  const googleTitle = content.seo_title || (page.system_key === "home" ? siteName : `${content.title || "Untitled page"} | ${siteName}`);
  const atLimit = content.sections.length >= PAGE_LIMITS.sections;

  return (
    <div className="pb-16">
      <datalist id="site-links">{sitePages.map((item) => <option key={item.href} value={item.href}>{item.label}</option>)}</datalist>

      {/* Toolbar */}
      <div className="sticky top-[60px] z-30 -mx-4 -mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:-mt-8 md:px-6 lg:top-16 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/pages" className="rounded p-2 text-ink-muted hover:bg-ivory-100" title="All pages" aria-label="All pages"><ArrowLeft size={18} /></Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2"><h1 className="truncate font-heading text-2xl text-ink">{content.title || "Untitled page"}</h1><span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${live ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{live ? "Published" : "Draft"}</span>{system && <span className="shrink-0 rounded-full bg-ivory-100 px-2.5 py-0.5 text-xs font-semibold text-ink-muted">Website page</span>}</div>
            <p className="truncate text-xs text-ink-subtle">hpglobalinfra.com{path}{dirty && <span className="ml-2 text-amber-600">· Unsaved changes</span>}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={path} target="_blank" title={dirty ? "Preview shows the last saved version" : undefined} className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-3 py-2 text-sm text-ink-muted hover:border-navy-900 hover:text-ink"><ExternalLink size={15} />{live ? "View" : "Preview"}</Link>
          <button type="button" onClick={() => void save()} disabled={!dirty || busy !== null} className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-3 py-2 text-sm text-ink hover:border-navy-900 disabled:cursor-not-allowed disabled:opacity-50">{busy === "saving" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}{live ? "Save & update live page" : "Save draft"}</button>
          {system ? null : live
            ? <button type="button" disabled={busy !== null} onClick={() => { if (window.confirm("Unpublish this page? Visitors will no longer see it, and menu links to it will be removed.")) void changePublished(false); }} className="rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">Unpublish</button>
            : <Button type="button" size="sm" disabled={busy !== null} onClick={() => setPublishing(true)} className="gap-2"><Globe size={15} />Publish</Button>}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0 space-y-4">
          {status.error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{status.error}</div>}
          {status.success && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status.success}</div>}
          {system && page.updated_at === page.created_at && !dirty && <p className="rounded-xl bg-ivory-50 px-4 py-3 text-sm text-ink-muted">This page starts with exactly what is on the website today. Nothing changes for visitors until you save.</p>}

          {/* Sections */}
          <div className="flex items-end justify-between"><h2 className="font-heading text-xl text-ink">Sections</h2><span className="text-xs text-ink-subtle">{content.sections.length} / {PAGE_LIMITS.sections} · top to bottom as they appear on the page</span></div>

          {content.sections.length === 0 && <p className="rounded-xl border border-dashed border-line-strong p-8 text-center text-sm text-ink-muted">This page has no sections yet. Add one below.</p>}

          {content.sections.map((section, index) => {
            const Icon = icons[section.type];
            const open = expanded === section.id;
            const fixed = isFixed(section.type);
            return (
              <div key={section.id}>
                <InsertButton onClick={() => setPickerAt(index)} disabled={atLimit} />
                <section className={`rounded-xl border bg-white ${open ? "border-gold-400" : "border-line"}`}>
                  <div className="flex items-center gap-2 px-4 py-3">
                    <button type="button" onClick={() => setExpanded(open ? null : section.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-200/60 text-ink">{fixed ? <Lock size={16} /> : <Icon size={18} />}</span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold text-ink">{index + 1}. {labelOf(section.type)}{isLive(section.type) && <LivePill>{fixed ? "Live · always on this page" : "Live"}</LivePill>}</span>
                        <span className="block truncate text-xs text-ink-muted">{summary(section) || "—"}</span>
                      </span>
                    </button>
                    {!fixed && section.type !== "cta" && <BackgroundPicker value={section.background} onChange={(background) => updateSection(index, { ...section, background })} />}
                    {section.type === "cta" && section.style !== "band" && <BackgroundPicker value={section.background} onChange={(background) => updateSection(index, { ...section, background })} />}
                    <ToolButton label="Move up" disabled={index === 0} onClick={() => moveSection(index, -1)}><ChevronUp size={16} /></ToolButton>
                    <ToolButton label="Move down" disabled={index === content.sections.length - 1} onClick={() => moveSection(index, 1)}><ChevronDown size={16} /></ToolButton>
                    {!fixed && <ToolButton label="Duplicate" disabled={atLimit} onClick={() => duplicateSection(index)}><Copy size={15} /></ToolButton>}
                    {!fixed && <ToolButton label="Remove section" danger onClick={() => removeSection(index)}><Trash2 size={15} /></ToolButton>}
                  </div>
                  {open && (
                    <div className="space-y-4 border-t border-line p-5">
                      {liveNotes[section.type] && <p className="flex items-start gap-2.5 rounded-xl bg-gold-200/40 px-3.5 py-3 text-[13px] leading-5 text-ink"><RefreshCw size={15} className="mt-0.5 shrink-0 text-gold-700" /><span><strong className="font-semibold">Live section:</strong> {liveNotes[section.type]}</span></p>}
                      <SectionFields section={section} onChange={(next) => updateSection(index, next)} onError={(error) => setStatus({ error })} />
                    </div>
                  )}
                </section>
              </div>
            );
          })}

          <button type="button" onClick={() => setPickerAt(content.sections.length)} disabled={atLimit} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong py-5 text-sm font-medium text-ink-muted transition hover:border-navy-900 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"><Plus size={18} />Add section</button>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <section className="space-y-4 rounded-[20px] border border-line bg-white p-5">
            <h2 className="text-[17px] font-semibold text-ink">Page settings</h2>
            <label className="block text-[14px] font-semibold text-ink">Page name<input className={inputClass} value={content.title} maxLength={PAGE_LIMITS.title} onChange={(event) => change({ ...content, title: event.target.value })} /><span className="mt-1 block text-xs font-normal text-ink-subtle">Shown in the admin and, unless you set one below, on Google.</span></label>
            <label className="block text-[14px] font-semibold text-ink">Address
              <div className={`mt-1.5 flex items-center rounded-xl border border-line-strong focus-within:border-navy-900 ${system ? "bg-ivory-50" : ""}`}><span className="pl-3 text-sm text-ink-subtle">/</span><input readOnly={system} className="w-full rounded-xl bg-transparent py-2 pl-0.5 pr-3 text-sm outline-none read-only:text-ink-muted" value={system ? path.slice(1) : content.slug} onChange={(event) => change({ ...content, slug: slugify(event.target.value) })} /></div>
              {system ? <span className="mt-1 block text-xs font-normal text-ink-subtle">Website pages keep their address.</span> : slugError(content.slug) ? <span className="mt-1 block text-xs font-normal text-red-600">{slugError(content.slug)}</span>
                : slugChanged && live ? <span className="mt-1 block text-xs font-normal text-amber-700">The old address /{page.slug} will stop working. Menu links will be updated automatically.</span> : null}
            </label>
          </section>

          <section className="space-y-4 rounded-[20px] border border-line bg-white p-5">
            <h2 className="text-[17px] font-semibold text-ink">Google &amp; sharing</h2>
            <div className="rounded-xl border border-line p-3.5" aria-label="Preview of the Google result">
              <p className="truncate text-xs text-[#4d5156]">hpglobalinfra.com{path === "/" ? "" : ` › ${path.slice(1)}`}</p>
              <p className="mt-1 line-clamp-2 text-[16px] leading-[21px] text-[#1a0dab]">{googleTitle}</p>
              <p className="mt-1 line-clamp-3 text-xs leading-[18px] text-[#4d5156]">{content.meta_description || "Add a description so Google shows your own words here."}</p>
            </div>
            <label className="block text-[14px] font-semibold text-ink">Title on Google<input className={inputClass} value={content.seo_title} maxLength={PAGE_LIMITS.seoTitle} placeholder={googleTitle} onChange={(event) => change({ ...content, seo_title: event.target.value })} /><span className="mt-1 block text-xs font-normal text-ink-subtle">Leave blank to use the page name.</span></label>
            <label className="block text-[14px] font-semibold text-ink">Description on Google
              <textarea rows={4} className={`${inputClass} resize-y`} value={content.meta_description} maxLength={PAGE_LIMITS.meta} onChange={(event) => change({ ...content, meta_description: event.target.value })} placeholder="One or two sentences that appear under the title in Google." />
              <span className={`mt-1 block text-xs font-normal ${content.meta_description.length > SEO_DESCRIPTION_TARGET ? "text-amber-700" : "text-ink-subtle"}`}>{content.meta_description.length} of {SEO_DESCRIPTION_TARGET} characters{content.meta_description.length > SEO_DESCRIPTION_TARGET ? " — Google may cut off the end" : ""}</span>
            </label>
            <ImageField label="Share image" value={content.share_image} onChange={(share_image) => change({ ...content, share_image })} onError={(error) => setStatus({ error })} hint="Shown when the link is sent on WhatsApp or social media. Leave empty to use the default from Site details." />
          </section>

          <section className="rounded-[20px] border border-line bg-white p-5">
            <h2 className="text-[17px] font-semibold text-ink">Add a section</h2>
            <p className="mt-1 text-[13px] text-ink-muted">{expanded ? "Adds below the open section." : "Adds at the end of the page."}</p>
            {(["content", "live"] as const).map((group) => (
              <Fragment key={group}>
                <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-gold-700">{group === "content" ? "Content" : "Live from your content"}</p>
                <div className="grid grid-cols-2 gap-2">
                  {sectionCatalog.filter((entry) => entry.group === group).map((entry) => {
                    const Icon = icons[entry.type];
                    return <button key={entry.type} type="button" disabled={atLimit} onClick={() => insertAfterOpen(entry.type)} title={entry.description} className="flex items-center gap-2 rounded-xl border border-line px-2.5 py-2 text-left text-[12px] font-medium text-ink transition hover:border-navy-900 disabled:opacity-50"><Icon size={15} className="shrink-0 text-gold-700" /><span className="truncate">{entry.label}</span>{entry.isNew && group === "content" && <span className="ml-auto text-[10px] font-semibold text-emerald-700">New</span>}</button>;
                  })}
                </div>
              </Fragment>
            ))}
          </section>
        </aside>
      </div>

      {pickerAt !== null && <SectionPicker onPick={(type) => insertSection(type, pickerAt)} onClose={() => setPickerAt(null)} />}
      {publishing && <PublishDialog page={page} title={content.title} busy={busy === "publishing" || busy === "saving"} dirty={dirty} onClose={() => setPublishing(false)} onPublish={(menus, label) => void changePublished(true, menus, label)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor chrome                                                       */
/* ------------------------------------------------------------------ */

function LivePill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-gold-200/70 px-2 py-0.5 text-[11px] font-semibold text-gold-700"><RefreshCw size={10} aria-hidden />{children}</span>;
}

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
        {(["content", "live"] as const).map((group) => (
          <div key={group} className="px-6 pb-2 pt-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-gold-700">{group === "content" ? "Content" : "Live from your content"}</p>
            {group === "live" && <p className="mt-1 text-[13px] text-ink-muted">These fill themselves from your projects, press and articles, so they stay up to date.</p>}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {sectionCatalog.filter((entry) => entry.group === group).map((entry) => {
                const Icon = icons[entry.type];
                return <button key={entry.type} type="button" onClick={() => onPick(entry.type)} className="flex items-start gap-3 rounded-2xl border border-line p-4 text-left transition hover:border-navy-900 hover:bg-gold-400/5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-200/60"><Icon size={20} /></span><span><span className="flex items-center gap-2 font-semibold text-ink">{entry.label}{entry.isNew && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">New</span>}</span><span className="mt-0.5 block text-xs text-ink-muted">{entry.description}</span></span></button>;
              })}
            </div>
          </div>
        ))}
        <div className="h-4" />
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

function ImageField({ label, value, onChange, onError, required, wide = true, hint }: { label: string; value: string; onChange: (value: string) => void; onError: (message: string) => void; required?: boolean; wide?: boolean; hint?: string }) {
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
      {hint && <span className="mt-1 block text-xs font-normal text-ink-subtle">{hint}</span>}
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
/* More field components                                               */
/* ------------------------------------------------------------------ */

function Select<T extends string>({ label, value, options, onChange, hint }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; hint?: string }) {
  return <label className="block text-[14px] font-semibold text-ink">{label}<select className={inputClass} value={value} onChange={(event) => onChange(event.target.value as T)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{hint && <span className="mt-1 block text-xs font-normal text-ink-subtle">{hint}</span>}</label>;
}

function NumberField({ label, value, min, max, onChange, hint }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; hint?: string }) {
  return <label className="block text-[14px] font-semibold text-ink">{label}<input type="number" min={min} max={max} className={inputClass} value={value} onChange={(event) => onChange(Math.min(max, Math.max(min, Number(event.target.value) || min)))} />{hint && <span className="mt-1 block text-xs font-normal text-ink-subtle">{hint}</span>}</label>;
}

function Check({ label, checked, onChange, hint, wide = true }: { label: string; checked: boolean; onChange: (value: boolean) => void; hint?: string; wide?: boolean }) {
  return <label className={`flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3 py-2.5 text-[14px] text-ink ${wide ? "md:col-span-2" : ""}`}><input type="checkbox" className="mt-0.5 h-4 w-4 accent-navy-900" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span><span className="font-semibold">{label}</span>{hint && <span className="block text-xs text-ink-subtle">{hint}</span>}</span></label>;
}

function IconSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <Select label="Icon" value={value} options={iconOptions} onChange={onChange} />;
}

/** A button's text and what it does: open the enquiry form, or go to a page or link. */
function ActionField({ label, buttonLabel, href, onLabel, onHref, wide = true }: { label: string; buttonLabel: string; href: string; onLabel: (value: string) => void; onHref: (value: string) => void; wide?: boolean }) {
  const enquire = href === ENQUIRE_LINK;
  return (
    <div className={`grid gap-3 rounded-xl border border-line bg-ivory-50/50 p-3 md:grid-cols-2 ${wide ? "md:col-span-2" : ""}`}>
      <Field label={`${label} text`} value={buttonLabel} max={60} onChange={onLabel} placeholder="Leave empty for no button" />
      <Select label="When clicked" value={enquire ? "enquire" : "link"} options={[{ value: "link", label: "Go to a page or link" }, { value: "enquire", label: "Open the enquiry form" }]} onChange={(mode) => onHref(mode === "enquire" ? ENQUIRE_LINK : "")} />
      {!enquire && <LinkField label="Link" value={href} onChange={onHref} wide />}
    </div>
  );
}

const headingHint = "Word(s) from the heading to show in gold italics, e.g. future.";

/* ------------------------------------------------------------------ */
/* Per-section forms                                                   */
/* ------------------------------------------------------------------ */

function SectionFields({ section, onChange, onError }: { section: PageSection; onChange: (section: PageSection) => void; onError: (message: string) => void }) {
  const grid = "grid gap-4 md:grid-cols-2";
  switch (section.type) {
    case "hero": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      const plain = section.style === "plain";
      return (
        <div className={grid}>
          <Choice label="Look" value={section.style ?? "image"} options={[{ value: "image", label: "Photo banner" }, { value: "plain", label: "Plain heading" }]} onChange={(style) => set({ style })} />
          <Choice label="Height" value={section.height} options={plain ? [{ value: "medium", label: "Standard" }, { value: "large", label: "Tall" }] : [{ value: "auto", label: "Fit" }, { value: "medium", label: "Medium" }, { value: "large", label: "Tall" }, { value: "full", label: "Full screen" }]} onChange={(height) => set({ height })} />
          <Field label="Title" value={section.title} onChange={(title) => set({ title })} />
          <Field label="Gold words" value={section.accent_title} onChange={(accent_title) => set({ accent_title })} placeholder="Optional" hint={headingHint} />
          <Field label="Small heading above title" value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="e.g. Premium Residences" wide />
          <Area label="Subtitle" value={section.subtitle} onChange={(subtitle) => set({ subtitle })} rows={2} />
          {!plain && <ImageField label="Background image" value={section.image_url} onChange={(image_url) => set({ image_url })} onError={onError} />}
          <ActionField label="Button" buttonLabel={section.button_label} href={section.button_href} onLabel={(button_label) => set({ button_label })} onHref={(button_href) => set({ button_href })} />
          <ActionField label="Second button" buttonLabel={section.button2_label ?? ""} href={section.button2_href ?? ""} onLabel={(button2_label) => set({ button2_label })} onHref={(button2_href) => set({ button2_href })} />
          {!plain && <Check label="Show the featured project card" hint="A small card in the corner linking to the project chosen in Featured project." checked={!!section.show_featured} onChange={(show_featured) => set({ show_featured })} />}
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
          <Field label="Closing line (optional)" value={section.tagline ?? ""} onChange={(tagline) => set({ tagline })} placeholder="e.g. Join us in shaping a new era…" wide />
          <Choice label="Image position" value={section.image_position} options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} onChange={(image_position) => set({ image_position })} />
          <ActionField label="Button" buttonLabel={section.button_label} href={section.button_href} onLabel={(button_label) => set({ button_label })} onHref={(button_href) => set({ button_href })} />
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
      const rows = section.layout === "rows";
      return (
        <div className={grid}>
          <Choice label="Layout" value={section.layout ?? "grid"} options={[{ value: "grid", label: "Cards side by side" }, { value: "rows", label: "Large photo rows" }]} onChange={(layout) => set({ layout })} />
          <Field label="Small heading above" value={section.eyebrow ?? ""} onChange={(eyebrow) => set({ eyebrow })} placeholder="Optional" />
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" />
          <Field label="Gold words" value={section.accent ?? ""} onChange={(accent) => set({ accent })} placeholder="Optional" hint={headingHint} />
          <Area label="Intro" value={section.intro} onChange={(intro) => set({ intro })} rows={2} />
          <ItemList label="Cards" items={section.cards} onChange={(cards) => set({ cards })} addLabel="Add card" create={() => ({ image_url: "", title: "", description: "", link: "", link_label: "", projects: "" as CardProjects })}
            render={(card, update) => <>
              <Field label="Title" value={card.title} onChange={(title) => update({ ...card, title })} />
              <LinkField label="Link (optional)" value={card.link} onChange={(link) => update({ ...card, link })} />
              <Area label="Text" value={card.description} onChange={(description) => update({ ...card, description })} rows={2} />
              <Field label="Link text" value={card.link_label ?? ""} max={60} onChange={(link_label) => update({ ...card, link_label })} placeholder="Learn more" />
              {rows && <Select<CardProjects> label="Name matching projects" value={card.projects ?? ""} options={[{ value: "", label: "Don't show projects" }, { value: "high_end", label: "High-end residential (priced in crores)" }, { value: "residential", label: "Residential projects" }, { value: "commercial", label: "Commercial projects" }]} onChange={(projects) => update({ ...card, projects })} hint="Adds “Featured: …” with up to three project names." />}
              <ImageField label={rows ? "Photo" : "Image (optional)"} value={card.image_url} onChange={(image_url) => update({ ...card, image_url })} onError={onError} />
            </>} />
        </div>
      );
    }
    case "icon_cards": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Choice label="Style" value={section.style} options={[{ value: "cards", label: "Cards" }, { value: "list", label: "List beside heading" }, { value: "steps", label: "Numbered steps" }]} onChange={(style) => set({ style })} />
          <Field label="Small heading above" value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="Optional" />
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} />
          <Field label="Gold words" value={section.accent} onChange={(accent) => set({ accent })} placeholder="Optional" hint={headingHint} />
          <Area label="Intro" value={section.intro} onChange={(intro) => set({ intro })} rows={2} />
          <ActionField label="Button under the heading" buttonLabel={section.button_label} href={section.button_href} onLabel={(button_label) => set({ button_label })} onHref={(button_href) => set({ button_href })} />
          <ItemList label={section.style === "steps" ? "Steps" : "Cards"} items={section.cards} onChange={(cards) => set({ cards })} addLabel={section.style === "steps" ? "Add step" : "Add card"} create={() => ({ icon: "circle-check", title: "", text: "", link: "" })}
            render={(card, update) => <><Field label="Title" value={card.title} onChange={(title) => update({ ...card, title })} /><IconSelect value={card.icon} onChange={(icon) => update({ ...card, icon })} /><Area label="Text" value={card.text} onChange={(text) => update({ ...card, text })} rows={2} /><LinkField label="Link (optional)" value={card.link} onChange={(link) => update({ ...card, link })} wide /></>} />
        </div>
      );
    }
    case "service": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Small heading above" value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="e.g. Service 01" />
          <Field label="Title" value={section.title} onChange={(title) => set({ title })} />
          <Area label="Description" value={section.text} onChange={(text) => set({ text })} rows={4} max={PAGE_LIMITS.long} />
          <ImageField label="Image" required value={section.image_url} onChange={(image_url) => set({ image_url })} onError={onError} />
          <ItemList label="What’s included" items={section.includes} onChange={(includes) => set({ includes })} addLabel="Add item" create={() => ""}
            render={(item, update, position) => <Field label={`Item ${position + 1}`} value={item} onChange={update} wide />} />
          <ActionField label="Button" buttonLabel={section.button_label} href={section.button_href} onLabel={(button_label) => set({ button_label })} onHref={(button_href) => set({ button_href })} />
          <Choice label="Image position" value={section.image_position} options={[{ value: "left", label: "Left of the text" }, { value: "right", label: "Right of the text" }]} onChange={(image_position) => set({ image_position })} />
          <Check label="Show a “Call us” link" hint="Uses the phone number from Site details." checked={section.show_call} onChange={(show_call) => set({ show_call })} wide={false} />
          <p className="md:col-span-2 text-xs text-ink-subtle">Services placed one after another share one block on the website, with their photos on alternating sides.</p>
        </div>
      );
    }
    case "stats": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Choice label="Layout" value={section.layout ?? "band"} options={[{ value: "band", label: "Band" }, { value: "strip", label: "Slim strip" }]} onChange={(layout) => set({ layout })} />
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" />
          <p className="md:col-span-2 rounded-xl bg-ivory-50 px-3 py-2 text-xs text-ink-muted">Type <code>{"{projects}"}</code>, <code>{"{hpg}"}</code> or <code>{"{partner}"}</code> as a number to show a live count from your projects. Figures that count to 0 are hidden.</p>
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
          <Choice label="Layout" value={section.layout ?? "stacked"} options={[{ value: "stacked", label: "Centred" }, { value: "side", label: "Beside the heading" }]} onChange={(layout) => set({ layout })} />
          <Field label="Small heading above" value={section.eyebrow ?? ""} onChange={(eyebrow) => set({ eyebrow })} placeholder="Optional" />
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} />
          <Field label="Gold words" value={section.accent ?? ""} onChange={(accent) => set({ accent })} placeholder="Optional" hint={headingHint} />
          <Area label="Intro" value={section.intro ?? ""} onChange={(intro) => set({ intro })} rows={2} />
          <ItemList label="Questions" items={section.items} onChange={(items) => set({ items })} addLabel="Add question" create={() => ({ question: "", answer: "" })}
            render={(item, update) => <><Field label="Question" wide value={item.question} max={PAGE_LIMITS.medium} onChange={(question) => update({ ...item, question })} /><Area label="Answer" value={item.answer} max={PAGE_LIMITS.long} onChange={(answer) => update({ ...item, answer })} /></>} />
        </div>
      );
    }
    case "cta": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      const style = section.style ?? "simple";
      return (
        <div className={grid}>
          <Choice label="Look" value={style} options={[{ value: "simple", label: "Simple" }, { value: "band", label: "Photo banner" }, { value: "strip", label: "Box with icon" }]} onChange={(next) => set({ style: next })} />
          {style === "strip" ? <IconSelect value={section.icon ?? "globe"} onChange={(icon) => set({ icon })} /> : style === "band" ? <Field label="Small heading above" value={section.eyebrow ?? ""} onChange={(eyebrow) => set({ eyebrow })} placeholder="Talk to an advisor" /> : <div />}
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} />
          <Field label="Gold words" value={section.accent ?? ""} onChange={(accent) => set({ accent })} placeholder="Optional" hint={headingHint} />
          <Area label="Text" value={section.text} onChange={(text) => set({ text })} rows={2} />
          {style === "band"
            ? <p className="md:col-span-2 rounded-xl bg-ivory-50 px-3 py-2 text-xs text-ink-muted">The banner always has two buttons: “Book a consultation” (opens the enquiry form) and “Chat on WhatsApp” (uses the WhatsApp number in <Link href="/admin/site-details" className="underline">Site details</Link>).</p>
            : <ActionField label="Button" buttonLabel={section.button_label} href={section.button_href} onLabel={(button_label) => set({ button_label })} onHref={(button_href) => set({ button_href })} />}
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
    case "legal_text": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} />
          <Field label="Last updated" value={section.updated} max={60} onChange={(updated) => set({ updated })} placeholder="Optional, e.g. 14 June 2026" hint="Shown under the heading." />
          <Field label="Small heading above" value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="Legal" />
          <div className="md:col-span-2 text-[14px] font-semibold text-ink">Text<RichTextEditor value={section.body} onChange={(body) => set({ body })} minHeight="min-h-72" /><span className="mt-1 block text-xs font-normal text-ink-subtle">Use the H2 button for headings: each one is listed in the contents beside the text. The first paragraph is shown slightly larger.</span></div>
        </div>
      );
    }
    case "projects": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Small heading above" value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="Optional" />
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} />
          <Field label="Gold words" value={section.accent} onChange={(accent) => set({ accent })} placeholder="Optional" hint={headingHint} />
          <Field label="Button text" value={section.button_label} max={60} onChange={(button_label) => set({ button_label })} placeholder="Leave empty for no button" hint="The button opens the Projects page." />
          <Area label="Intro" value={section.intro} onChange={(intro) => set({ intro })} rows={2} />
          <Select label="Which projects" value={section.filter} options={[{ value: "all", label: "All projects (HPG first)" }, { value: "hpg", label: "HPG developments only" }, { value: "partner", label: "Partner projects only" }, { value: "residential", label: "Residential only" }, { value: "commercial", label: "Commercial only" }]} onChange={(filter) => set({ filter })} />
          <NumberField label="How many to show" value={section.limit} min={1} max={12} onChange={(limit) => set({ limit })} />
        </div>
      );
    }
    case "featured_project": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Button text" value={section.button_label} max={60} onChange={(button_label) => set({ button_label })} placeholder="Explore project" />
          <Field label="Brochure button text" value={section.brochure_label} max={60} onChange={(brochure_label) => set({ brochure_label })} placeholder="Leave empty to hide" hint="Shown when the featured project has a document." />
        </div>
      );
    }
    case "press":
    case "articles": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch } as PageSection);
      return (
        <div className={grid}>
          <Field label="Small heading above" value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="Optional" />
          <Field label="Heading" value={section.heading} onChange={(heading) => set({ heading })} />
          <Field label="Gold words" value={section.accent} onChange={(accent) => set({ accent })} placeholder="Optional" hint={headingHint} />
          <Field label="Link text" value={section.link_label} max={60} onChange={(link_label) => set({ link_label })} placeholder="Leave empty to hide" hint={section.type === "press" ? "Opens the In the news page." : "Opens the Journal."} />
          <NumberField label="How many to show" value={section.limit} min={1} max={6} onChange={(limit) => set({ limit })} />
        </div>
      );
    }
    case "press_list": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Check label="Show the press enquiries box" checked={section.show_contact} onChange={(show_contact) => set({ show_contact })} />
          {section.show_contact && <>
            <Field label="Box heading" value={section.contact_heading} onChange={(contact_heading) => set({ contact_heading })} />
            <Field label="Box button" value={section.contact_button} max={60} onChange={(contact_button) => set({ contact_button })} hint="Opens an email to the address in Site details." />
            <Area label="Box text" value={section.contact_text} onChange={(contact_text) => set({ contact_text })} rows={2} />
            <p className="md:col-span-2 text-xs text-ink-subtle">Write <code>{"{email}"}</code> where the email address from Site details should appear.</p>
          </>}
        </div>
      );
    }
    case "contact_details": {
      const set = (patch: Partial<typeof section>) => onChange({ ...section, ...patch });
      return (
        <div className={grid}>
          <Field label="Office box heading" value={section.office_heading} onChange={(office_heading) => set({ office_heading })} />
          <Field label="Response time" value={section.response_text} onChange={(response_text) => set({ response_text })} placeholder="Leave empty to hide" />
          <Field label="Site visits" value={section.visits_text} onChange={(visits_text) => set({ visits_text })} placeholder="Leave empty to hide" wide />
        </div>
      );
    }
    case "projects_list":
    case "articles_list":
      return null;
  }
}
