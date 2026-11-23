"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ExternalLink, Eye, EyeOff, FileText, Globe, Image as ImageIcon, Loader2, Newspaper, Pencil, PlayCircle, Plus, Trash2, Upload, X } from "lucide-react";
import { api } from "../../lib/api";
import { Button, EmptyState, IconButton, Notice, PageHeader, SearchInput, SegTabs, StatusPill, Toggle, fieldInput, inputClass, labelClass, useToast } from "../../components/admin/ui";
import { toVideoEmbedUrl } from "../../data/pages";
import { emptyPressClipping, normalizePressClipping, pressMediaTypes, pressThumbnail, pressTypeLabel, type PressClipping, type PressClippingInput } from "../../data/press";

const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export function AdminPress() {
  const toast = useToast();
  const [items, setItems] = useState<PressClipping[] | null>(null);
  const [projects, setProjects] = useState<string[]>([]);
  const [featuredProject, setFeaturedProject] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | PressClipping["media_type"]>("all");
  const [projectFilter, setProjectFilter] = useState("");
  const [editing, setEditing] = useState<{ id: number | null; form: PressClippingInput } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => api.listPress().then((result) => { setItems(result.items); setProjects(result.projects); setFeaturedProject(result.featured_project); return result; })
    .catch((reason) => { setError(errorText(reason, "Unable to load press coverage.")); return null; });
  useEffect(() => {
    void load().then((result) => {
      const params = new URLSearchParams(window.location.search);
      const editId = Number(params.get("edit"));
      const item = editId ? result?.items.find((row) => row.id === editId) : undefined;
      if (item) setEditing({ id: item.id, form: { ...item } });
      else if (params.get("new")) setEditing({ id: null, form: { ...emptyPressClipping(), project: result?.featured_project ?? "" } });
    });
  }, []);

  const counts = useMemo(() => ({ all: items?.length ?? 0, print: items?.filter((item) => item.media_type === "print").length ?? 0, video: items?.filter((item) => item.media_type === "video").length ?? 0, online: items?.filter((item) => item.media_type === "online").length ?? 0 }), [items]);
  const visible = useMemo(() => (items ?? []).filter((item) => {
    const term = search.trim().toLowerCase();
    return (typeFilter === "all" || item.media_type === typeFilter) && (!projectFilter || item.project === projectFilter) && (!term || `${item.headline} ${item.publication} ${item.project}`.toLowerCase().includes(term));
  }), [items, search, typeFilter, projectFilter]);

  async function toggle(item: PressClipping) {
    try { await api.updatePress(item.id, { ...item, is_enabled: !item.is_enabled }); toast(item.is_enabled ? "Hidden from the website." : "Now shown on the website."); await load(); }
    catch (reason) { toast(errorText(reason, "Unable to update."), "error"); }
  }
  async function remove(item: PressClipping) {
    if (!window.confirm(`Delete "${item.headline}"? This cannot be undone.`)) return;
    try { await api.deletePress(item.id); toast("Coverage deleted."); await load(); }
    catch (reason) { toast(errorText(reason, "Unable to delete."), "error"); }
  }
  const TypeIcon = ({ type }: { type: PressClipping["media_type"] }) => type === "video" ? <PlayCircle size={15} aria-hidden /> : type === "online" ? <Globe size={15} aria-hidden /> : <Newspaper size={15} aria-hidden />;

  return (
    <div>
      <PageHeader title="Press coverage" description={<>Newspaper cuttings, TV interviews and online articles. They appear on the <a href="/media" target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline decoration-gold-400 underline-offset-4">In the News</a> page, and on a project&apos;s page when tagged with that project.</>}
        actions={<><Button variant="ghost" to="/admin/guide#press">How it works</Button><Button onClick={() => setEditing({ id: null, form: { ...emptyPressClipping(), project: featuredProject } })}><Plus size={16} aria-hidden />Add coverage</Button></>} />
      {error && <Notice tone="error" onClose={() => setError(null)}>{error}</Notice>}

      <section className="rounded-[20px] border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between md:px-6">
          <SegTabs label="Type of coverage" value={typeFilter} onChange={setTypeFilter} options={[{ value: "all", label: "All", count: counts.all }, { value: "print", label: "Newspaper", count: counts.print }, { value: "video", label: "TV", count: counts.video }, { value: "online", label: "Online", count: counts.online }]} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} aria-label="Filter by project" className={`${fieldInput} h-10 py-0 text-[14px] sm:w-52`}><option value="">All projects</option>{[...new Set((items ?? []).map((item) => item.project).filter(Boolean))].map((name) => <option key={name}>{name}</option>)}</select>
            <SearchInput value={search} onChange={setSearch} placeholder="Search headline or publication" className="sm:w-64" />
          </div>
        </div>
        {items === null ? <p className="p-6 text-[14px] text-ink-muted">{error ? "" : "Loading…"}</p> : visible.length === 0 ? (
          <EmptyState icon={<Newspaper size={24} />} title={items.length ? "No matching coverage" : "No press coverage yet"} description={items.length ? "Try another filter or search." : "Add a newspaper cutting, a TV or YouTube segment, or a link to an online story."} />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((item) => {
              const thumb = pressThumbnail(item);
              return (
                <li key={item.id} className={`flex items-center gap-4 px-4 py-3 md:px-6 ${item.is_enabled ? "" : "bg-ivory-50"}`}>
                  <button type="button" onClick={() => setEditing({ id: item.id, form: { ...item } })} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                    <span className={`flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ivory-100 ${item.is_enabled ? "" : "opacity-50"}`}>{thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : item.document_url ? <FileText className="text-ink-subtle" aria-hidden /> : <Newspaper className="text-ink-subtle" aria-hidden />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-[14px] font-semibold text-ink hover:text-gold-700">{item.headline}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-muted"><span className="inline-flex items-center gap-1"><TypeIcon type={item.media_type} />{pressTypeLabel(item.media_type)}</span>· {item.publication} · {formatDate(item.published_on)}{item.project && <span className="text-ink">· {item.project}</span>}</span>
                    </span>
                  </button>
                  {!item.is_enabled && <StatusPill status="hidden" />}
                  <div className="flex shrink-0 gap-1">
                    <IconButton label={item.is_enabled ? "Hide from website" : "Show on website"} onClick={() => void toggle(item)}>{item.is_enabled ? <Eye size={16} /> : <EyeOff size={16} />}</IconButton>
                    <IconButton label="Edit" onClick={() => setEditing({ id: item.id, form: { ...item } })}><Pencil size={16} /></IconButton>
                    <IconButton label="Delete" tone="danger" onClick={() => void remove(item)}><Trash2 size={16} /></IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <datalist id="press-projects">{projects.map((name) => <option key={name} value={name} />)}</datalist>
      {editing && <ClippingForm id={editing.id} initial={editing.form} featuredProject={featuredProject} onClose={() => setEditing(null)} onSaved={async (message) => { setEditing(null); toast(message); await load(); }} />}
    </div>
  );
}

function ClippingForm({ id, initial, featuredProject, onClose, onSaved }: { id: number | null; initial: PressClippingInput; featuredProject: string; onClose: () => void; onSaved: (message: string) => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<null | "image" | "pdf">(null);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<PressClippingInput>) => setForm((current) => ({ ...current, ...patch }));
  const videoOk = !form.video_url || !!toVideoEmbedUrl(form.video_url);
  const thumb = pressThumbnail(form);

  async function uploadImage(file: File | undefined) {
    if (!file) return; setUploading("image"); setError(null);
    try { set({ image_url: (await api.uploadImage(file)).image_url }); } catch (uploadError) { setError(errorText(uploadError, "Unable to upload the image.")); } finally { setUploading(null); }
  }
  async function uploadPdf(file: File | undefined) {
    if (!file) return; setUploading("pdf"); setError(null);
    try { set({ document_url: (await api.uploadDocument(file)).document_url }); } catch (uploadError) { setError(errorText(uploadError, "Unable to upload the PDF.")); } finally { setUploading(null); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const check = normalizePressClipping(form);
    if ("error" in check) { setError(check.error); return; }
    setSaving(true); setError(null);
    try {
      if (id === null) await api.createPress(check.clipping); else await api.updatePress(id, check.clipping);
      onSaved(id === null ? (check.clipping.is_enabled ? "Coverage added and now on the website." : "Coverage added (hidden).") : "Changes saved.");
    } catch (saveError) { setError(errorText(saveError, "Unable to save the clipping.")); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/40" role="dialog" aria-modal="true" aria-label={id === null ? "Add coverage" : "Edit coverage"}>
      <form onSubmit={submit} className="flex h-full w-full max-w-xl animate-fade-in flex-col bg-white shadow-float">
        <div className="flex items-center justify-between border-b border-line px-6 py-5"><h2 className="font-heading text-[24px] leading-8 text-ink">{id === null ? "Add coverage" : "Edit coverage"}</h2><IconButton label="Close" onClick={onClose}><X size={20} /></IconButton></div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <fieldset>
            <legend className={labelClass}>Type of coverage</legend>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
              {pressMediaTypes.map((type) => <label key={type.value} className={`cursor-pointer rounded-2xl border p-3 text-[13px] transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-gold-200 ${form.media_type === type.value ? "border-gold-500 bg-gold-200/40" : "border-line hover:border-line-strong"}`}><input type="radio" name="media_type" className="sr-only" checked={form.media_type === type.value} onChange={() => set({ media_type: type.value })} /><span className="flex items-center gap-1.5 font-semibold text-ink">{type.value === "video" ? <PlayCircle size={16} aria-hidden /> : type.value === "online" ? <Globe size={16} aria-hidden /> : <Newspaper size={16} aria-hidden />}{type.label}</span><span className="mt-1 block leading-[18px] text-ink-muted">{type.description}</span></label>)}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-[14px] font-semibold text-ink">{form.media_type === "video" ? "Channel / publication" : "Publication"}<input required value={form.publication} maxLength={120} onChange={(event) => set({ publication: event.target.value })} placeholder={form.media_type === "video" ? "e.g. ABP News" : "e.g. Dainik Jagran"} className={inputClass} /></label>
            <label className="block text-[14px] font-semibold text-ink">Date published<input required type="date" value={form.published_on} onChange={(event) => set({ published_on: event.target.value })} className={inputClass} /></label>
          </div>
          <label className="block text-[14px] font-semibold text-ink">Headline<input required value={form.headline} maxLength={250} onChange={(event) => set({ headline: event.target.value })} className={inputClass} /></label>
          <label className="block text-[14px] font-semibold text-ink">Short summary <span className="font-normal text-ink-muted">(optional)</span><textarea rows={3} value={form.summary} maxLength={1000} onChange={(event) => set({ summary: event.target.value })} className={`${inputClass} resize-y`} /></label>
          <label className="block text-[14px] font-semibold text-ink">Project <span className="font-normal text-ink-muted">(optional)</span>
            <input list="press-projects" value={form.project} maxLength={120} onChange={(event) => set({ project: event.target.value })} placeholder="Leave empty for company-wide coverage" className={inputClass} />
            <span className="mt-1 block text-xs font-normal text-ink-muted">{featuredProject && form.project.trim().toLowerCase() === featuredProject.toLowerCase() ? "Will also show in “In the News” on the Featured Project page." : "Pick a project from the list so it groups correctly on the In the News page."}</span>
          </label>

          {form.media_type === "video" && (
            <label className="block text-[14px] font-semibold text-ink">YouTube or Vimeo link<input value={form.video_url} onChange={(event) => set({ video_url: event.target.value })} placeholder="https://www.youtube.com/watch?v=…" className={inputClass} />{!videoOk && <span className="mt-1 block text-xs font-normal text-danger">This doesn&apos;t look like a YouTube or Vimeo link.</span>}</label>
          )}

          <div className="text-[14px] font-semibold text-ink">{form.media_type === "print" ? "Clipping image" : "Thumbnail image"} <span className="font-normal text-ink-muted">{form.media_type === "print" ? "(scan or photo, or upload a PDF below)" : form.media_type === "video" ? "(optional — YouTube's own thumbnail is used otherwise)" : "(optional)"}</span>
            <div className="mt-1.5 flex gap-3">
              <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-ivory-50">{thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="text-ink-subtle" />}</div>
              <div className="flex-1 space-y-2">
                <input value={form.image_url} onChange={(event) => set({ image_url: event.target.value })} placeholder="Upload an image or paste its URL" className={`${inputClass} mt-0`} />
                <div className="flex gap-3">
                  <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-[13px] font-semibold text-ink hover:border-navy-900">{uploading === "image" ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{uploading === "image" ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading !== null} onChange={(event) => { void uploadImage(event.target.files?.[0]); event.target.value = ""; }} /></label>
                  {form.image_url && <button type="button" onClick={() => set({ image_url: "" })} className="text-[13px] font-medium text-ink-muted hover:text-danger">Remove</button>}
                </div>
              </div>
            </div>
          </div>

          {form.media_type === "print" && (
            <div className="text-[14px] font-semibold text-ink">Clipping PDF <span className="font-normal text-ink-muted">(optional, up to 25 MB)</span>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-[13px] font-semibold text-ink hover:border-navy-900">{uploading === "pdf" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}{uploading === "pdf" ? "Uploading…" : form.document_url ? "Replace PDF" : "Upload PDF"}<input type="file" accept="application/pdf" className="sr-only" disabled={uploading !== null} onChange={(event) => { void uploadPdf(event.target.files?.[0]); event.target.value = ""; }} /></label>
                {form.document_url && <><a href={form.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] font-medium text-ink underline"><ExternalLink size={12} />View PDF</a><button type="button" onClick={() => set({ document_url: "" })} className="text-[13px] font-medium text-ink-muted hover:text-danger">Remove</button></>}
              </div>
            </div>
          )}

          <label className="block text-[14px] font-semibold text-ink">{form.media_type === "online" ? "Article link" : "Link to the original story"} {form.media_type !== "online" && <span className="font-normal text-ink-muted">(optional)</span>}<input type="url" value={form.article_url} onChange={(event) => set({ article_url: event.target.value })} placeholder="https://…" className={inputClass} /></label>

          <div className="rounded-2xl border border-line p-4"><Toggle label="Show on the website" checked={form.is_enabled} onChange={(value) => set({ is_enabled: value })} /></div>
          {error && <Notice tone="error">{error}</Notice>}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-6 py-4"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving || uploading !== null}>{saving ? "Saving…" : id === null ? "Add coverage" : "Save changes"}</Button></div>
      </form>
    </div>
  );
}
