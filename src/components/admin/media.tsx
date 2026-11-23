"use client";

/* Image, list and document editors shared by the project editor and Featured project. */

import { useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Crop, ExternalLink, FileText, GripVertical, ImagePlus, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { fieldInput, labelClass } from "./ui";

export type UploadImage = (file: File | undefined, apply: (url: string) => void) => void | Promise<void>;
export type EditImage = (src: string, apply: (url: string) => void) => void;
export type DocumentItem = { name: string; url: string; size: string };
export type UploadDocument = (file: File | undefined, apply: (document: DocumentItem) => void) => void | Promise<void>;
export const moveItem = <T,>(items: T[], index: number, direction: -1 | 1) => { const next = [...items]; const target = index + direction; if (target < 0 || target >= next.length) return items; [next[index], next[target]] = [next[target], next[index]]; return next; };
const moveTo = <T,>(items: T[], from: number, to: number) => { const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; };

const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

/** Dashed drop zone. Calls onFiles with every image dropped or chosen. */
export function Dropzone({ onFiles, multiple = false, accept = IMAGE_TYPES, title, hint, compact = false }: { onFiles: (files: File[]) => void | Promise<void>; multiple?: boolean; accept?: string; title?: string; hint?: string; compact?: boolean }) {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const isPdf = accept.includes("pdf");
  async function handle(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    setBusy(true);
    try { await onFiles(multiple ? files : files.slice(0, 1)); } finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  return (
    <label
      onDragOver={(event) => { event.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => { event.preventDefault(); setOver(false); void handle(event.dataTransfer.files); }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition-colors ${compact ? "px-4 py-5" : "px-6 py-8"} ${over ? "border-gold-500 bg-gold-200/40" : "border-line-strong bg-ivory-50 hover:border-gold-500"}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gold-700 shadow-soft">{busy ? <Loader2 size={18} className="animate-spin" /> : isPdf ? <FileText size={18} /> : <ImagePlus size={18} />}</span>
      <span className="text-[14px] font-semibold text-ink">{busy ? "Uploading…" : title ?? (multiple ? "Drop images here or browse" : "Drop an image here or browse")}</span>
      <span className="text-[12px] text-ink-muted">{hint ?? (isPdf ? "PDF · up to 25 MB" : "JPG, PNG, WebP or GIF · up to 10 MB each")}</span>
      <input ref={input} type="file" accept={accept} multiple={multiple} disabled={busy} className="sr-only" onChange={(event) => void handle(event.target.files)} />
    </label>
  );
}

/** One image: preview, upload/replace, crop and an optional URL field. */
export function MediaField({ label, help, src, onChange, onUpload, onEdit, className = "md:col-span-2", stacked = false }: { label: string; help?: ReactNode; src: string; onChange: (url: string) => void; onUpload: UploadImage; onEdit: EditImage; className?: string; stacked?: boolean }) {
  const [showUrl, setShowUrl] = useState(false);
  return (
    <div className={className}>
      <p className={labelClass}>{label}</p>
      {help && <p className="mt-0.5 text-[13px] text-ink-muted">{help}</p>}
      <div className="mt-2">
        {src ? (
          <div className={`flex flex-col gap-3 ${stacked ? "" : "sm:flex-row sm:items-center"}`}>
            <img src={src} alt="" className={`w-full rounded-xl border border-line bg-ivory-100 object-cover ${stacked ? "aspect-[16/10]" : "h-28 sm:w-48"}`} />
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-[13px] font-semibold text-ink hover:border-navy-900"><Upload size={14} aria-hidden />Replace<input type="file" accept={IMAGE_TYPES} className="sr-only" onChange={(event) => { void onUpload(event.target.files?.[0], onChange); event.target.value = ""; }} /></label>
              <button type="button" onClick={() => onEdit(src, onChange)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-[13px] font-semibold text-ink hover:border-navy-900"><Crop size={14} aria-hidden />Crop</button>
              <button type="button" onClick={() => onChange("")} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-danger hover:bg-danger-bg"><Trash2 size={14} aria-hidden />Remove</button>
            </div>
          </div>
        ) : <Dropzone compact onFiles={([file]) => onUpload(file, onChange)} />}
        <button type="button" onClick={() => setShowUrl((value) => !value)} className="mt-2 text-[13px] font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline">{showUrl ? "Hide image address" : "Use an image address instead"}</button>
        {showUrl && <input value={src} onChange={(event) => onChange(event.target.value)} placeholder="https://… or /images/…" className={`mt-2 ${fieldInput}`} aria-label={`${label} address`} />}
      </div>
    </div>
  );
}

/** A grid of images that can be reordered by dragging, with optional captions. */
export function MediaList({ label, help, items, onChange, onUpload, onEdit, hasAlt, altLabel = "Caption (also used as alt text)" }: { label: string; help?: ReactNode; items: { src: string; alt: string }[]; onChange: (items: { src: string; alt: string }[]) => void; onUpload: UploadImage; onEdit: EditImage; move?: unknown; hasAlt?: boolean; altLabel?: string }) {
  const [dragging, setDragging] = useState<number | null>(null);
  const patch = (index: number, value: Partial<{ src: string; alt: string }>) => onChange(items.map((item, position) => (position === index ? { ...item, ...value } : item)));
  async function addFiles(files: File[]) {
    const added: { src: string; alt: string }[] = [];
    for (const file of files) await onUpload(file, (url) => { added.push({ src: url, alt: "" }); });
    if (added.length) onChange([...items, ...added]);
  }
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div><p className={labelClass}>{label} <span className="font-normal text-ink-muted">· {items.length}</span></p>{help && <p className="mt-0.5 text-[13px] text-ink-muted">{help}</p>}</div>
        <button type="button" onClick={() => onChange([...items, { src: "", alt: "" }])} className="inline-flex items-center gap-1 text-[13px] font-semibold text-gold-700 hover:text-ink"><Plus size={14} aria-hidden />Add by address</button>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => (
          <li key={index} draggable onDragStart={() => setDragging(index)} onDragEnd={() => setDragging(null)}
            onDragOver={(event) => { event.preventDefault(); if (dragging !== null && dragging !== index) { onChange(moveTo(items, dragging, index)); setDragging(index); } }}
            className={`group overflow-hidden rounded-2xl border bg-white ${dragging === index ? "border-gold-500 opacity-60" : "border-line"}`}>
            <div className="relative aspect-[4/3] bg-ivory-100">
              {item.src ? <img src={item.src} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-ink-subtle"><ImagePlus size={22} aria-hidden /></span>}
              <span className="absolute left-2 top-2 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-white/90 text-ink-muted shadow-soft" title="Drag to reorder"><GripVertical size={15} aria-hidden /></span>
              {index === 0 && <span className="absolute bottom-2 left-2 rounded-full bg-navy-900/80 px-2 py-0.5 text-[11px] font-semibold text-white">Cover</span>}
              <div className="absolute right-2 top-2 flex gap-1">
                <button type="button" onClick={() => onEdit(item.src, (url) => patch(index, { src: url }))} disabled={!item.src} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-ink shadow-soft disabled:hidden" aria-label="Crop image" title="Crop"><Crop size={14} /></button>
                <button type="button" onClick={() => onChange(items.filter((_, position) => position !== index))} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-danger shadow-soft" aria-label="Remove image" title="Remove"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-1.5 p-2">
              {!item.src && <input value={item.src} onChange={(event) => patch(index, { src: event.target.value })} placeholder="Image address" aria-label="Image address" className="w-full rounded-lg border border-line px-2 py-1.5 text-[13px] outline-none focus:border-navy-900" />}
              {hasAlt && <input value={item.alt} onChange={(event) => patch(index, { alt: event.target.value })} placeholder={altLabel} aria-label={altLabel} className="w-full rounded-lg border border-line px-2 py-1.5 text-[13px] outline-none focus:border-navy-900" />}
              <div className="flex justify-between sm:hidden">
                <button type="button" onClick={() => onChange(moveItem(items, index, -1))} disabled={index === 0} className="rounded p-1 text-ink-muted disabled:opacity-30" aria-label="Move earlier"><ChevronLeft size={16} /></button>
                <button type="button" onClick={() => onChange(moveItem(items, index, 1))} disabled={index === items.length - 1} className="rounded p-1 text-ink-muted disabled:opacity-30" aria-label="Move later"><ChevronRight size={16} /></button>
              </div>
            </div>
          </li>
        ))}
        <li className="col-span-2 sm:col-span-1"><Dropzone multiple compact onFiles={addFiles} title="Add images" hint="Drop or browse" /></li>
      </ul>
    </div>
  );
}

export function TextList({ label, help, values, onChange, placeholder, addLabel = "Add item" }: { label: string; help?: ReactNode; values: string[]; onChange: (values: string[]) => void; placeholder?: string; addLabel?: string }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      {help && <p className="mt-0.5 text-[13px] text-ink-muted">{help}</p>}
      <div className="mt-2 space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input value={value} placeholder={placeholder} aria-label={`${label} ${index + 1}`} onChange={(event) => onChange(values.map((item, position) => (position === index ? event.target.value : item)))} className={fieldInput} />
            <button type="button" onClick={() => onChange(values.filter((_, position) => position !== index))} className="flex w-10 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-danger-bg hover:text-danger" aria-label="Remove"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...values, ""])} className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-gold-700 hover:text-ink"><Plus size={14} aria-hidden />{addLabel}</button>
    </div>
  );
}

export function DocumentList({ items, onChange, onUpload }: { items: DocumentItem[]; onChange: (items: DocumentItem[]) => void; move?: unknown; onUpload: UploadDocument }) {
  const patch = (index: number, value: Partial<DocumentItem>) => onChange(items.map((item, position) => (position === index ? { ...item, ...value } : item)));
  async function addFiles(files: File[]) {
    const added: DocumentItem[] = [];
    for (const file of files) await onUpload(file, (document) => { added.push(document); });
    if (added.length) onChange([...items, ...added]);
  }
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-2xl border border-line p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ivory-100 text-gold-700"><FileText size={18} aria-hidden /></span>
            <input value={item.name} onChange={(event) => patch(index, { name: event.target.value })} placeholder="Name shown on the website, e.g. Brochure" aria-label="Document name" className={`${fieldInput} min-w-0 flex-1`} />
            <div className="flex shrink-0 gap-1">
              {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-ivory-100" aria-label="Open document" title="Open"><ExternalLink size={15} /></a>}
              <button type="button" onClick={() => onChange(moveItem(items, index, -1))} disabled={index === 0} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-ivory-100 disabled:opacity-30" aria-label="Move up"><ChevronLeft size={15} className="rotate-90" /></button>
              <button type="button" onClick={() => onChange(items.filter((_, position) => position !== index))} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-danger-bg hover:text-danger" aria-label="Remove document"><Trash2 size={15} /></button>
            </div>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_110px]">
            <input value={item.url} onChange={(event) => patch(index, { url: event.target.value })} placeholder="Document address" aria-label="Document address" className={`${fieldInput} text-[13px]`} />
            <input value={item.size} onChange={(event) => patch(index, { size: event.target.value })} placeholder="Size, e.g. 2 MB" aria-label="Size" className={`${fieldInput} text-[13px]`} />
          </div>
        </div>
      ))}
      <Dropzone multiple compact accept="application/pdf,.pdf" onFiles={addFiles} title="Upload PDF documents" />
      <button type="button" onClick={() => onChange([...items, { name: "", url: "", size: "" }])} className="inline-flex items-center gap-1 text-[13px] font-semibold text-gold-700 hover:text-ink"><Plus size={14} aria-hidden />Add a document by address</button>
    </div>
  );
}
