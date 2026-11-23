"use client";

import { useEffect, useState } from "react";
import { Check, Circle, ExternalLink, Save } from "lucide-react";
import { api, type FeaturedProjectContent } from "../../lib/api";
import { iframeUrl } from "../../data/featuredProject";
import { ImageEditor } from "../../components/admin/ImageEditor";
import { DocumentList, MediaField, MediaList, TextList, type DocumentItem } from "../../components/admin/media";
import { Button, Card, Notice, PageHeader, inputClass, labelClass, useToast } from "../../components/admin/ui";

const sections = [["hero", "Hero"], ["home", "Homepage showcase"], ["iframe", "Walkthrough video"], ["gallery", "Gallery"], ["amenities", "Amenities & layout"], ["construction", "Construction"], ["documents", "Documents"], ["sidebar", "Enquiry panel"]] as const;
type SectionId = (typeof sections)[number][0];

function filled(content: FeaturedProjectContent): Record<SectionId, boolean> {
  return {
    hero: !!(content.hero.title && content.hero.image_url),
    home: !!(content.home.heading && content.home.cardImage),
    iframe: !!content.iframe.src,
    gallery: content.gallery.length > 0,
    amenities: content.amenities.length > 0 || !!content.layout.image_url,
    construction: content.construction.images.length > 0 || !!content.construction.video_url,
    documents: content.documents.length > 0,
    sidebar: !!content.sidebar.button_label,
  };
}

function TextField({ label, value, onChange, textarea, wide }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; wide?: boolean }) {
  return (
    <label className={`${labelClass} ${wide ? "md:col-span-2" : ""}`}>{label}
      {textarea ? <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} resize-y`} /> : <input value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />}
    </label>
  );
}

export function AdminFeaturedProject() {
  const toast = useToast();
  const [content, setContent] = useState<FeaturedProjectContent | null>(null);
  const [active, setActive] = useState<SectionId>("hero");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ src: string; apply: (url: string) => void } | null>(null);

  useEffect(() => { api.getFeaturedProject().then(setContent).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load the project.")); }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!content) return error ? <Notice tone="error">{error}</Notice> : <p className="text-[14px] text-ink-muted">Loading featured project…</p>;

  const update = <K extends keyof FeaturedProjectContent>(key: K, value: FeaturedProjectContent[K]) => { setContent((current) => (current ? { ...current, [key]: value } : current)); setDirty(true); };
  const chooseEditor = (src: string, apply: (url: string) => void) => setEditor({ src, apply });
  async function upload(file: File | undefined, apply: (url: string) => void) {
    if (!file) return;
    try { apply((await api.uploadImage(file)).image_url); setDirty(true); } catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to upload image.", "error"); }
  }
  async function uploadDocument(file: File | undefined, apply: (document: DocumentItem) => void) {
    if (!file) return;
    try { const document = await api.uploadDocument(file); apply({ name: document.name.replace(/\.pdf$/i, ""), url: document.document_url, size: document.size }); setDirty(true); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to upload document.", "error"); }
  }
  async function save() {
    setSaving(true); setError(null);
    try { await api.updateFeaturedProject(content!); setDirty(false); toast("Featured project saved."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save changes."); }
    finally { setSaving(false); }
  }
  const done = filled(content);
  const go = (id: SectionId) => { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className="pb-24">
      <PageHeader title="Featured project" description="The project shown first on the home page, with its own full page. Choose which project is featured in Projects."
        actions={<><Button variant="outline" to="/featured-project" target="_blank">View page <ExternalLink size={15} aria-hidden /></Button><Button onClick={() => void save()} disabled={saving || !dirty}><Save size={16} aria-hidden />{saving ? "Saving…" : "Save changes"}</Button></>} />
      {error && <Notice tone="error" onClose={() => setError(null)}>{error}</Notice>}

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="self-start xl:sticky xl:top-24">
          <nav aria-label="Sections" className="no-scrollbar flex gap-1 overflow-x-auto rounded-[20px] border border-line bg-white p-2 xl:flex-col">
            {sections.map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition-colors ${active === id ? "bg-ivory-100 text-ink" : "text-ink-muted hover:bg-ivory-50 hover:text-ink"}`}>
                {done[id] ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success-bg text-success"><Check size={12} aria-label="has content" /></span> : <Circle size={20} className="text-line-strong" aria-hidden />}
                {label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 space-y-6">
          <Card id="hero" title="Hero" description="The large banner at the top of the project page.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Eyebrow" value={content.hero.eyebrow} onChange={(value) => update("hero", { ...content.hero, eyebrow: value })} />
              <TextField label="Location" value={content.hero.location} onChange={(value) => update("hero", { ...content.hero, location: value })} />
              <TextField label="Title" value={content.hero.title} onChange={(value) => update("hero", { ...content.hero, title: value })} />
              <TextField label="Accent title (shown in gold italics)" value={content.hero.accentTitle} onChange={(value) => update("hero", { ...content.hero, accentTitle: value })} />
              <MediaField label="Hero image" src={content.hero.image_url} onChange={(url) => update("hero", { ...content.hero, image_url: url })} onUpload={upload} onEdit={chooseEditor} />
            </div>
          </Card>
          <Card id="home" title="Homepage showcase" description="The featured block on the home page.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Eyebrow" value={content.home.eyebrow} onChange={(value) => update("home", { ...content.home, eyebrow: value })} />
              <TextField label="Card title" value={content.home.cardTitle} onChange={(value) => update("home", { ...content.home, cardTitle: value })} />
              <TextField label="Heading" value={content.home.heading} onChange={(value) => update("home", { ...content.home, heading: value })} />
              <TextField label="Accent heading" value={content.home.accentHeading} onChange={(value) => update("home", { ...content.home, accentHeading: value })} />
              <TextField label="Description" value={content.home.description} onChange={(value) => update("home", { ...content.home, description: value })} textarea wide />
              <TextField label="Card description" value={content.home.cardDescription} onChange={(value) => update("home", { ...content.home, cardDescription: value })} textarea wide />
              <MediaField label="Main card image" src={content.home.cardImage} onChange={(url) => update("home", { ...content.home, cardImage: url })} onUpload={upload} onEdit={chooseEditor} />
              <div className="md:col-span-2"><TextList label="Tags" values={content.home.tags} onChange={(tags) => update("home", { ...content.home, tags })} addLabel="Add tag" /></div>
            </div>
            <div className="mt-6"><MediaList label="Supporting images" items={content.home.galleryImages.map((src) => ({ src, alt: "" }))} onChange={(items) => update("home", { ...content.home, galleryImages: items.map((item) => item.src) })} onUpload={upload} onEdit={chooseEditor} /></div>
          </Card>
          <Card id="iframe" title="Walkthrough video">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                <TextField label="YouTube or Vimeo embed address" value={content.iframe.src} onChange={(value) => update("iframe", { ...content.iframe, src: value })} />
                <TextField label="Video title (for screen readers)" value={content.iframe.title} onChange={(value) => update("iframe", { ...content.iframe, title: value })} />
                <label className={labelClass}>Referrer policy<select value={content.iframe.referrer_policy} onChange={(event) => update("iframe", { ...content.iframe, referrer_policy: event.target.value })} className={inputClass}><option>strict-origin-when-cross-origin</option><option>no-referrer</option><option>origin</option></select></label>
                <div className="flex flex-wrap gap-2">
                  {(["autoplay", "mute", "loop", "controls", "allow_fullscreen"] as const).map((key) => (
                    <label key={key} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium capitalize ${content.iframe[key] ? "border-navy-900 bg-navy-900 text-white" : "border-line-strong text-ink"}`}>
                      <input type="checkbox" className="sr-only" checked={content.iframe[key]} onChange={(event) => update("iframe", { ...content.iframe, [key]: event.target.checked })} />{key.replace("_", " ")}
                    </label>
                  ))}
                </div>
              </div>
              <div className="aspect-video overflow-hidden rounded-2xl bg-navy-900">{content.iframe.src && <iframe src={iframeUrl(content.iframe)} title={content.iframe.title} className="h-full w-full" allowFullScreen={content.iframe.allow_fullscreen} />}</div>
            </div>
          </Card>
          <Card id="gallery" title="Gallery" description="The first image is the cover. Drag images to reorder."><MediaList label="Images" items={content.gallery} onChange={(gallery) => update("gallery", gallery)} onUpload={upload} onEdit={chooseEditor} hasAlt /></Card>
          <Card id="amenities" title="Amenities & layout">
            <div className="space-y-6">
              <MediaList label="Amenities" altLabel="Amenity name" items={content.amenities.map((item) => ({ src: item.icon, alt: item.name }))} onChange={(items) => update("amenities", items.map((item) => ({ name: item.alt, icon: item.src })))} onUpload={upload} onEdit={chooseEditor} hasAlt />
              <div className="grid gap-4 md:grid-cols-2">
                <MediaField label="Layout plan" src={content.layout.image_url} onChange={(url) => update("layout", { ...content.layout, image_url: url })} onUpload={upload} onEdit={chooseEditor} />
                <TextField label="Layout description (alt text)" value={content.layout.alt} onChange={(value) => update("layout", { ...content.layout, alt: value })} wide />
              </div>
            </div>
          </Card>
          <Card id="construction" title="Construction updates">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Video address" value={content.construction.video_url} onChange={(value) => update("construction", { ...content.construction, video_url: value })} wide />
                <MediaField label="Video poster image" src={content.construction.poster_url} onChange={(url) => update("construction", { ...content.construction, poster_url: url })} onUpload={upload} onEdit={chooseEditor} />
              </div>
              <MediaList label="Construction photos" items={content.construction.images.map((src) => ({ src, alt: "" }))} onChange={(items) => update("construction", { ...content.construction, images: items.map((item) => item.src) })} onUpload={upload} onEdit={chooseEditor} />
            </div>
          </Card>
          <Card id="documents" title="Documents" description="Brochures, price lists and floor plans (PDF up to 25 MB)."><DocumentList items={content.documents} onChange={(documents) => update("documents", documents)} onUpload={uploadDocument} /></Card>
          <Card id="sidebar" title="Enquiry panel" description="The box beside the project page with the enquiry button.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Status" value={content.sidebar.status} onChange={(value) => update("sidebar", { ...content.sidebar, status: value })} />
              <TextField label="Button label" value={content.sidebar.button_label} onChange={(value) => update("sidebar", { ...content.sidebar, button_label: value })} />
              <TextField label="Note under the button" value={content.sidebar.note} onChange={(value) => update("sidebar", { ...content.sidebar, note: value })} textarea wide />
              <div className="md:col-span-2"><TextList label="Highlights" values={content.sidebar.items} onChange={(items) => update("sidebar", { ...content.sidebar, items })} addLabel="Add highlight" /></div>
            </div>
          </Card>
        </div>
      </div>

      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur transition-transform lg:left-[var(--admin-sidebar,264px)] ${dirty ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
          <span className="text-[14px] text-ink-muted">You have unsaved changes</span>
          <Button onClick={() => void save()} disabled={saving}><Save size={16} aria-hidden />{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </div>
      {editor && <ImageEditor src={editor.src} onClose={() => setEditor(null)} onSaved={(url) => { editor.apply(url); setDirty(true); }} />}
    </div>
  );
}
