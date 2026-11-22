"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Eye, EyeOff, FileText, Image as ImageIcon, Loader2, Newspaper, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { toVideoEmbedUrl } from "../../data/pages";
import { emptyPressClipping, normalizePressClipping, pressMediaTypes, pressThumbnail, pressTypeLabel, type PressClipping, type PressClippingInput } from "../../data/press";

const inputClass = "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-champagne focus:ring-2 focus:ring-brand-champagne/20";
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export function AdminPress() {
  const [items, setItems] = useState<PressClipping[] | null>(null);
  const [projects, setProjects] = useState<string[]>([]);
  const [featuredProject, setFeaturedProject] = useState("");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [editing, setEditing] = useState<{ id: number | null; form: PressClippingInput } | null>(null);
  const [status, setStatus] = useState<{ error?: string; success?: string }>({});

  const load = () => api.listPress().then((result) => { setItems(result.items); setProjects(result.projects); setFeaturedProject(result.featured_project); })
    .catch((error) => setStatus({ error: errorText(error, "Unable to load press clippings.") }));
  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => (items ?? []).filter((item) => {
    const term = search.trim().toLowerCase();
    return (!projectFilter || item.project === projectFilter) && (!term || `${item.headline} ${item.publication} ${item.project}`.toLowerCase().includes(term));
  }), [items, search, projectFilter]);

  async function toggle(item: PressClipping) {
    try { await api.updatePress(item.id, { ...item, is_enabled: !item.is_enabled }); await load(); }
    catch (error) { setStatus({ error: errorText(error, "Unable to update the clipping.") }); }
  }
  async function remove(item: PressClipping) {
    if (!window.confirm(`Delete "${item.headline}"? This cannot be undone.`)) return;
    try { await api.deletePress(item.id); setStatus({ success: "Clipping deleted." }); await load(); }
    catch (error) { setStatus({ error: errorText(error, "Unable to delete the clipping.") }); }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-brand-champagne">Content management</p>
          <h1 className="text-3xl font-heading text-brand-charcoal">Press clippings</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Newspaper cuttings, TV/video coverage and online articles. They appear on the <Link href="/media" target="_blank" className="underline">In the News</Link> page, and on the Featured Project page when tagged with {featuredProject ? <strong>{featuredProject}</strong> : "the featured project"}. <Link href="/admin/guide#press" className="ml-1 whitespace-nowrap font-medium text-brand-charcoal underline decoration-brand-champagne underline-offset-4 hover:text-brand-champagne">How it works</Link></p>
        </div>
        <Button type="button" onClick={() => { setStatus({}); setEditing({ id: null, form: { ...emptyPressClipping(), project: featuredProject } }); }} className="gap-2"><Plus size={16} />Add clipping</Button>
      </div>

      {status.error && <div role="alert" className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{status.error}</div>}
      {status.success && <div role="status" className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status.success}</div>}

      {items && items.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1"><span className="sr-only">Search</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search headline or publication" className={`${inputClass} mt-0 pl-9`} /></label>
          <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className={`${inputClass} mt-0 sm:w-64`} aria-label="Filter by project"><option value="">All projects</option>{[...new Set(items.map((item) => item.project).filter(Boolean))].map((name) => <option key={name}>{name}</option>)}</select>
        </div>
      )}

      {items === null ? <p className="text-slate-500">{status.error ? "" : "Loading…"}</p> : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Newspaper className="mx-auto mb-4 text-slate-300" size={40} />
          <p className="font-heading text-xl text-brand-charcoal">No press clippings yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Add a newspaper cutting, a TV or YouTube segment, or a link to an online story.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {visible.map((item) => {
            const thumb = pressThumbnail(item);
            return (
              <li key={item.id} className={`flex items-center gap-4 p-4 ${item.is_enabled ? "" : "bg-slate-50 opacity-70"}`}>
                <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">{thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : item.document_url ? <FileText className="text-slate-400" /> : <Newspaper className="text-slate-400" />}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-brand-charcoal">{item.headline}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{pressTypeLabel(item.media_type)} · {item.publication} · {formatDate(item.published_on)}{item.project && <> · <span className="text-brand-charcoal">{item.project}</span></>}{!item.is_enabled && <span className="ml-2 font-semibold text-amber-700">Hidden</span>}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => void toggle(item)} title={item.is_enabled ? "Hide from website" : "Show on website"} className="rounded p-2 text-slate-500 hover:bg-slate-100">{item.is_enabled ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                  <button type="button" onClick={() => { setStatus({}); setEditing({ id: item.id, form: { ...item } }); }} title="Edit" className="rounded p-2 text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button>
                  <button type="button" onClick={() => void remove(item)} title="Delete" className="rounded p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </li>
            );
          })}
          {visible.length === 0 && <li className="p-8 text-center text-sm text-slate-500">No clippings match your search.</li>}
        </ul>
      )}

      <datalist id="press-projects">{projects.map((name) => <option key={name} value={name} />)}</datalist>
      {editing && <ClippingForm id={editing.id} initial={editing.form} featuredProject={featuredProject} onClose={() => setEditing(null)} onSaved={async (message) => { setEditing(null); setStatus({ success: message }); await load(); }} />}
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
      onSaved(id === null ? (check.clipping.is_enabled ? "Clipping added and now on the website." : "Clipping added (hidden).") : "Clipping updated.");
    } catch (saveError) { setError(errorText(saveError, "Unable to save the clipping.")); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-brand-charcoal/35" role="dialog" aria-modal="true" aria-label={id === null ? "Add clipping" : "Edit clipping"}>
      <form onSubmit={submit} className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-champagne">Press clipping</p><h2 className="mt-1 text-2xl font-heading text-brand-charcoal">{id === null ? "Add clipping" : "Edit clipping"}</h2></div><button type="button" onClick={onClose} aria-label="Close" className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Type of coverage</legend>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
              {pressMediaTypes.map((type) => <label key={type.value} className={`cursor-pointer rounded-md border p-3 text-sm ${form.media_type === type.value ? "border-brand-charcoal bg-brand-charcoal/5" : "border-slate-200 hover:border-slate-300"}`}><input type="radio" name="media_type" className="sr-only" checked={form.media_type === type.value} onChange={() => set({ media_type: type.value })} /><span className="block font-semibold text-brand-charcoal">{type.label}</span><span className="mt-0.5 block text-xs text-slate-500">{type.description}</span></label>)}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">{form.media_type === "video" ? "Channel / publication" : "Publication"}<input required value={form.publication} maxLength={120} onChange={(event) => set({ publication: event.target.value })} placeholder={form.media_type === "video" ? "e.g. ABP News" : "e.g. Dainik Jagran"} className={inputClass} /></label>
            <label className="block text-sm font-medium text-slate-700">Date published<input required type="date" value={form.published_on} onChange={(event) => set({ published_on: event.target.value })} className={inputClass} /></label>
          </div>
          <label className="block text-sm font-medium text-slate-700">Headline<input required value={form.headline} maxLength={250} onChange={(event) => set({ headline: event.target.value })} className={inputClass} /></label>
          <label className="block text-sm font-medium text-slate-700">Short summary <span className="font-normal text-slate-400">(optional)</span><textarea rows={3} value={form.summary} maxLength={1000} onChange={(event) => set({ summary: event.target.value })} className={`${inputClass} resize-y`} /></label>
          <label className="block text-sm font-medium text-slate-700">Project <span className="font-normal text-slate-400">(optional)</span>
            <input list="press-projects" value={form.project} maxLength={120} onChange={(event) => set({ project: event.target.value })} placeholder="Leave empty for company-wide coverage" className={inputClass} />
            <span className="mt-1 block text-xs font-normal text-slate-400">{featuredProject && form.project.trim().toLowerCase() === featuredProject.toLowerCase() ? "Will also show in “In the News” on the Featured Project page." : "Pick a project from the list so it groups correctly on the In the News page."}</span>
          </label>

          {form.media_type === "video" && (
            <label className="block text-sm font-medium text-slate-700">YouTube or Vimeo link<input value={form.video_url} onChange={(event) => set({ video_url: event.target.value })} placeholder="https://www.youtube.com/watch?v=…" className={inputClass} />{!videoOk && <span className="mt-1 block text-xs font-normal text-red-600">This doesn&apos;t look like a YouTube or Vimeo link.</span>}</label>
          )}

          <div className="text-sm font-medium text-slate-700">{form.media_type === "print" ? "Clipping image" : "Thumbnail image"} <span className="font-normal text-slate-400">{form.media_type === "print" ? "(scan or photo, or upload a PDF below)" : form.media_type === "video" ? "(optional — YouTube's own thumbnail is used otherwise)" : "(optional)"}</span>
            <div className="mt-1.5 flex gap-3">
              <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">{thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="text-slate-300" />}</div>
              <div className="flex-1 space-y-2">
                <input value={form.image_url} onChange={(event) => set({ image_url: event.target.value })} placeholder="Upload an image or paste its URL" className={`${inputClass} mt-0`} />
                <div className="flex gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:border-brand-champagne">{uploading === "image" ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{uploading === "image" ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading !== null} onChange={(event) => { void uploadImage(event.target.files?.[0]); event.target.value = ""; }} /></label>
                  {form.image_url && <button type="button" onClick={() => set({ image_url: "" })} className="text-xs text-slate-500 hover:text-red-600">Remove</button>}
                </div>
              </div>
            </div>
          </div>

          {form.media_type === "print" && (
            <div className="text-sm font-medium text-slate-700">Clipping PDF <span className="font-normal text-slate-400">(optional, up to 25 MB)</span>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:border-brand-champagne">{uploading === "pdf" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}{uploading === "pdf" ? "Uploading…" : form.document_url ? "Replace PDF" : "Upload PDF"}<input type="file" accept="application/pdf" className="sr-only" disabled={uploading !== null} onChange={(event) => { void uploadPdf(event.target.files?.[0]); event.target.value = ""; }} /></label>
                {form.document_url && <><a href={form.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-charcoal underline"><ExternalLink size={12} />View PDF</a><button type="button" onClick={() => set({ document_url: "" })} className="text-xs text-slate-500 hover:text-red-600">Remove</button></>}
              </div>
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700">{form.media_type === "online" ? "Article link" : "Link to the original story"} {form.media_type !== "online" && <span className="font-normal text-slate-400">(optional)</span>}<input type="url" value={form.article_url} onChange={(event) => set({ article_url: event.target.value })} placeholder="https://…" className={inputClass} /></label>

          <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" checked={form.is_enabled} onChange={(event) => set({ is_enabled: event.target.checked })} className="h-4 w-4 accent-brand-charcoal" />Show on the website</label>
          {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-6 py-4"><Button type="submit" disabled={saving || uploading !== null} className="gap-2">{saving ? "Saving…" : id === null ? "Add clipping" : "Save changes"}</Button><button type="button" onClick={onClose} className="px-3 text-sm text-slate-500 hover:text-brand-charcoal">Cancel</button></div>
      </form>
    </div>
  );
}
