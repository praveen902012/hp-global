"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Circle, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { emptyProjectDetails, type ProjectDetails } from "../../data/projects";
import { api, type PortfolioInput } from "../../lib/api";
import { ImageEditor } from "../../components/admin/ImageEditor";
import { DocumentList, MediaField, MediaList, TextList, type DocumentItem } from "../../components/admin/media";
import { Button, Card, Field, Notice, PageHeader, Toggle, fieldInput, inputClass, labelClass, useToast } from "../../components/admin/ui";
import { pageProgress } from "./Portfolio";

const blank: PortfolioInput = { portfolio_category: "hpg", project_type: "residential", title: "", location: "", description: "", price: "", image_url: "", tags: [], sort_order: 0, is_enabled: true, slug: "", status: "", is_featured: false, details: emptyProjectDetails };
const tabs = [
  { id: "details", label: "Details" },
  { id: "content", label: "Page content" },
  { id: "media", label: "Gallery & video" },
  { id: "amenities", label: "Amenities & layout" },
  { id: "documents", label: "Documents" },
] as const;
type Tab = (typeof tabs)[number]["id"];
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function AdminProjectEditor({ id }: { id: number | null }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<PortfolioInput | null>(id === null ? blank : null);
  const [saved, setSaved] = useState<string>(JSON.stringify(blank));
  const [tab, setTab] = useState<Tab>("details");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageEditor, setImageEditor] = useState<{ src: string; apply: (url: string) => void } | null>(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (tabs.some((item) => item.id === requested)) setTab(requested as Tab);
    if (id === null) return;
    api.getPortfolio(id).then((project) => {
      const { id: _ignored, ...rest } = project;
      void _ignored;
      const value = { ...rest, details: { ...emptyProjectDetails, ...project.details } };
      setForm(value); setSaved(JSON.stringify(value));
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load the project."));
  }, [id]);

  const dirty = !!form && JSON.stringify(form) !== saved;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!form) return error ? <Notice tone="error">{error}</Notice> : <p className="text-[14px] text-ink-muted">Loading project…</p>;

  const update = <K extends keyof PortfolioInput>(key: K, value: PortfolioInput[K]) => setForm((current) => (current ? { ...current, [key]: value } : current));
  const updateDetails = <K extends keyof ProjectDetails>(key: K, value: ProjectDetails[K]) => setForm((current) => (current ? { ...current, details: { ...current.details, [key]: value } } : current));
  async function uploadInto(file: File | undefined, apply: (url: string) => void) {
    if (!file) return;
    try { apply((await api.uploadImage(file)).image_url); } catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to upload image.", "error"); }
  }
  async function uploadDocumentInto(file: File | undefined, apply: (document: DocumentItem) => void) {
    if (!file) return;
    try { const document = await api.uploadDocument(file); apply({ name: document.name.replace(/\.pdf$/i, ""), url: document.document_url, size: document.size }); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to upload document.", "error"); }
  }
  const openImageEditor = (src: string, apply: (url: string) => void) => setImageEditor({ src, apply });

  async function save(event?: FormEvent) {
    event?.preventDefault();
    if (!form) return;
    const missing = [!form.title && "name", !form.location && "location", !form.description && "description", !form.image_url && "card image"].filter(Boolean);
    if (missing.length) { setTab("details"); setError(`Add the project's ${missing.join(", ")} first.`); return; }
    setSaving(true); setError(null);
    try {
      const project = id === null ? await api.createPortfolio(form) : await api.updatePortfolio(id, form);
      const { id: newId, ...rest } = project;
      const value = { ...rest, details: { ...emptyProjectDetails, ...project.details } };
      setForm(value); setSaved(JSON.stringify(value));
      toast(id === null ? "Project added." : "Changes saved.");
      if (id === null) router.replace(`/admin/properties/${newId}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save the project."); }
    finally { setSaving(false); }
  }
  async function remove() {
    if (id === null || !form || !window.confirm(`Delete “${form.title}”? Its page will stop working. Uploaded images are kept.`)) return;
    try { await api.deletePortfolio(id); toast("Project deleted."); router.push("/admin/properties"); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to delete.", "error"); }
  }

  const progress = pageProgress(form);
  const tabDone: Record<Tab, boolean> = {
    details: !!(form.title && form.location && form.description && form.image_url),
    content: !!(form.details.overview || form.details.highlights.length || form.details.facts.length),
    media: form.is_featured || form.details.gallery.length > 0 || !!form.details.video_url,
    amenities: form.is_featured || form.details.amenities.length > 0 || !!form.details.layout_image,
    documents: form.is_featured || form.details.documents.length > 0,
  };
  const featuredNote = <Notice tone="info">This is the featured project, so its gallery, video, amenities, layout, construction photos and documents are edited in <Link href="/admin/featured-project" className="font-semibold underline">Featured project</Link>.</Notice>;

  return (
    <form onSubmit={save} className="pb-24">
      <PageHeader back={{ href: "/admin/properties", label: "All projects" }} title={id === null ? "Add project" : form.title || "Untitled project"}
        description={id === null ? "Fill in the details, then save. You can add page content at any time." : undefined}
        actions={<>{id !== null && form.slug && <Button variant="outline" to={`/projects/${form.slug}`} target="_blank">View page <ExternalLink size={15} aria-hidden /></Button>}<Button type="submit" disabled={saving}><Save size={16} aria-hidden />{saving ? "Saving…" : id === null ? "Add project" : "Save changes"}</Button></>} />
      {error && <Notice tone="error" onClose={() => setError(null)}>{error}</Notice>}

      <div role="tablist" aria-label="Project sections" className="no-scrollbar -mx-4 mb-6 flex gap-7 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0">
        {tabs.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}
            className={`relative flex h-11 shrink-0 items-center gap-1.5 text-[14px] font-semibold transition-colors ${tab === item.id ? "text-ink" : "text-ink-muted hover:text-ink"}`}>
            {item.label}{tabDone[item.id] && <Check size={14} className="text-success" aria-label="has content" />}
            {tab === item.id && <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-navy-900" />}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {tab === "details" && <>
            <Card title="Basics">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Project name" className="md:col-span-2"><input required value={form.title} onChange={(event) => update("title", event.target.value)} className={inputClass} /></Field>
                <Field label="Developer"><select value={form.portfolio_category} onChange={(event) => update("portfolio_category", event.target.value as PortfolioInput["portfolio_category"])} className={inputClass}><option value="hpg">Developed by HPG Infrra</option><option value="partner">Partner development</option></select></Field>
                <Field label="Type"><select value={form.project_type} onChange={(event) => update("project_type", event.target.value as PortfolioInput["project_type"])} className={inputClass}><option value="residential">Residential</option><option value="commercial">Commercial</option></select></Field>
                <Field label="Location"><input required value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="e.g. Haridwar, Uttarakhand" className={inputClass} /></Field>
                <Field label="Price"><input value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="e.g. ₹21 Lakhs* or Price on request" className={inputClass} /></Field>
                <Field label="Short description" help="Shown on project cards and at the top of the project page." className="md:col-span-2"><textarea required rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} className={`${inputClass} resize-y`} /></Field>
                <Field label="Tags" help="Separate with commas, e.g. Wellness Living, Premium Residences" className="md:col-span-2"><input value={form.tags.join(", ")} onChange={(event) => update("tags", event.target.value.split(",").map((tag) => tag.trimStart()))} onBlur={() => update("tags", form.tags.map((tag) => tag.trim()).filter(Boolean))} className={inputClass} /></Field>
              </div>
            </Card>
            <Card title="Card image" description="Used on project cards and as the page banner when no hero image is set.">
              <MediaField className="" label="Image" src={form.image_url} onChange={(url) => update("image_url", url)} onUpload={uploadInto} onEdit={openImageEditor} />
            </Card>
          </>}

          {tab === "content" && (
            <Card title="Page content" description="Everything here is optional. Sections without content are hidden on the website.">
              <div className="space-y-6">
                <Field label="Overview" help="Leave blank to use the short description."><textarea rows={5} value={form.details.overview} onChange={(event) => updateDetails("overview", event.target.value)} className={`${inputClass} resize-y`} /></Field>
                <TextList label="Highlights" help="Shown as a checklist. The tags are used if this is empty." values={form.details.highlights} onChange={(values) => updateDetails("highlights", values)} addLabel="Add highlight" />
                <div>
                  <p className={labelClass}>Key facts</p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">For example Configuration · 3 & 4 BHK, Possession · Dec 2027, RERA · UPRERAPRJ…</p>
                  <div className="mt-2 space-y-2">
                    {form.details.facts.map((fact, index) => (
                      <div key={index} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                        <input value={fact.label} aria-label="Fact label" placeholder="Label" onChange={(event) => updateDetails("facts", form.details.facts.map((item, position) => (position === index ? { ...item, label: event.target.value } : item)))} className={fieldInput} />
                        <input value={fact.value} aria-label="Fact value" placeholder="Value" onChange={(event) => updateDetails("facts", form.details.facts.map((item, position) => (position === index ? { ...item, value: event.target.value } : item)))} className={fieldInput} />
                        <button type="button" onClick={() => updateDetails("facts", form.details.facts.filter((_, position) => position !== index))} className="flex w-10 items-center justify-center rounded-xl text-ink-muted hover:bg-danger-bg hover:text-danger" aria-label="Remove fact"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => updateDetails("facts", [...form.details.facts, { label: "", value: "" }])} className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-gold-700 hover:text-ink"><Plus size={14} aria-hidden />Add fact</button>
                </div>
              </div>
            </Card>
          )}

          {tab === "media" && (form.is_featured ? featuredNote : <>
            <Card title="Gallery" description="The first image is the cover. Drag images to reorder."><MediaList label="Images" items={form.details.gallery} onChange={(items) => updateDetails("gallery", items)} onUpload={uploadInto} onEdit={openImageEditor} hasAlt /></Card>
            <Card title="Banner and video">
              <div className="space-y-5">
                <MediaField className="" label="Hero image" help="Optional — the card image is used if empty." src={form.details.hero_image} onChange={(url) => updateDetails("hero_image", url)} onUpload={uploadInto} onEdit={openImageEditor} />
                <Field label="Video" help="A YouTube or Vimeo link."><input value={form.details.video_url} onChange={(event) => updateDetails("video_url", event.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={inputClass} /></Field>
              </div>
            </Card>
          </>)}

          {tab === "amenities" && (form.is_featured ? featuredNote : <>
            <Card title="Amenities" description="Add a name for each amenity. An icon image is optional.">
              <MediaList label="Amenities" altLabel="Amenity name" items={form.details.amenities.map((item) => ({ src: item.icon, alt: item.name }))} onChange={(items) => updateDetails("amenities", items.map((item) => ({ name: item.alt, icon: item.src })))} onUpload={uploadInto} onEdit={openImageEditor} hasAlt />
            </Card>
            <Card title="Layout and construction">
              <div className="space-y-6">
                <MediaField className="" label="Layout plan" src={form.details.layout_image} onChange={(url) => updateDetails("layout_image", url)} onUpload={uploadInto} onEdit={openImageEditor} />
                <MediaList label="Construction photos" items={form.details.construction_images.map((src) => ({ src, alt: "" }))} onChange={(items) => updateDetails("construction_images", items.map((item) => item.src))} onUpload={uploadInto} onEdit={openImageEditor} />
              </div>
            </Card>
          </>)}

          {tab === "documents" && (form.is_featured ? featuredNote : (
            <Card title="Documents" description="Brochures, price lists and floor plans. Visitors can download them from the project page.">
              <DocumentList items={form.details.documents} onChange={(items) => updateDetails("documents", items)} onUpload={uploadDocumentInto} />
            </Card>
          ))}
        </div>

        <aside className="space-y-6">
          <Card title="Visibility">
            <div className="space-y-5">
              <Toggle label="Show on website" description="Hidden projects stay here but visitors can't see them." checked={form.is_enabled} onChange={(value) => update("is_enabled", value)} />
              <Toggle label="Featured project" description="Shown first on the home and Projects pages. Only one project can be featured." checked={form.is_featured} onChange={(value) => update("is_featured", value)} />
              <Field label="Status label" help="Shown as a badge, e.g. Now booking.">
                <input value={form.status} onChange={(event) => update("status", event.target.value)} list="project-status-options" placeholder="None" className={inputClass} />
                <datalist id="project-status-options"><option value="Now booking" /><option value="New launch" /><option value="Under construction" /><option value="Ready to move" /><option value="Upcoming" /><option value="Sold out" /></datalist>
              </Field>
            </div>
          </Card>
          <Card title="Page address">
            <div className="flex items-center rounded-xl border border-line-strong bg-ivory-50 text-[14px] focus-within:border-navy-900">
              <span className="pl-3 text-ink-muted">/projects/</span>
              <input value={form.slug} onChange={(event) => update("slug", slugify(event.target.value))} placeholder={slugify(form.title) || "created-from-the-name"} aria-label="Page address" className="min-w-0 flex-1 rounded-r-xl bg-white px-2 py-2.5 outline-none" />
            </div>
            <p className="mt-2 text-[13px] text-ink-muted">Leave empty to create it from the project name. Changing it breaks old links.</p>
          </Card>
          <Card title="Page content" description={`${progress.done} of ${progress.total} sections filled in`}>
            <ul className="space-y-2.5">
              {progress.checks.map((check) => (
                <li key={check.label} className="flex items-center gap-2.5 text-[14px]">
                  {check.done ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success-bg text-success"><Check size={13} aria-hidden /></span> : <Circle size={20} className="text-line-strong" aria-hidden />}
                  <span className={check.done ? "text-ink" : "text-ink-muted"}>{check.label}</span>
                </li>
              ))}
            </ul>
          </Card>
          {id !== null && <button type="button" onClick={() => void remove()} className="inline-flex items-center gap-1.5 px-1 text-[14px] font-semibold text-danger hover:underline"><Trash2 size={15} aria-hidden />Delete project</button>}
        </aside>
      </div>

      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur transition-transform lg:left-[var(--admin-sidebar,264px)] ${dirty ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
          <span className="text-[14px] text-ink-muted">You have unsaved changes</span>
          <div className="flex gap-2"><Button variant="ghost" onClick={() => { setForm(JSON.parse(saved)); }}>Discard</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button></div>
        </div>
      </div>
      {imageEditor && <ImageEditor src={imageEditor.src} onClose={() => setImageEditor(null)} onSaved={(url) => imageEditor.apply(url)} />}
    </form>
  );
}
