"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Download, ExternalLink, FileText, Newspaper, Play, X } from "lucide-react";
import { pressThumbnail, type PressClipping, type PressMediaType } from "../../data/press";
import { toVideoEmbedUrl } from "../../data/pages";
import { Badge } from "../site/ui";

export const formatPressDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
const typeName: Record<PressMediaType, string> = { print: "Newspaper", video: "TV · Video", online: "Online" };

/** Grid of press clippings; videos, scans and PDFs open in a viewer, online articles open the source site. */
export function PressGrid({ clippings, columns = 3 }: { clippings: PressClipping[]; columns?: 2 | 3 }) {
  const [open, setOpen] = useState<number | null>(null);
  const viewable = clippings.filter((clipping) => !opensSite(clipping));

  return (
    <>
      <ul className={`grid gap-6 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
        {clippings.map((clipping) => {
          const thumb = pressThumbnail(clipping);
          const external = opensSite(clipping);
          const card = (
            <>
              <div className="relative aspect-[16/10] overflow-hidden bg-ivory-100">
                {thumb ? <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  : <div className="flex h-full items-center justify-center text-gold-500">{clipping.document_url ? <FileText size={44} strokeWidth={1.25} /> : <Newspaper size={44} strokeWidth={1.25} />}</div>}
                {clipping.media_type === "video" && <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-navy-900 shadow-[var(--shadow-card)] transition-transform group-hover:scale-105"><Play size={22} className="ml-0.5" fill="currentColor" /></span></span>}
                <Badge tone="navy" className="absolute left-4 top-4">{typeName[clipping.media_type]}</Badge>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="text-[13px] font-medium text-gold-700">{clipping.publication} · {formatPressDate(clipping.published_on)}</p>
                <h3 className="t-h6 text-ink">{clipping.headline}</h3>
                {clipping.summary && <p className="line-clamp-2 t-body-s text-ink-muted">{clipping.summary}</p>}
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 t-label text-ink group-hover:text-gold-700">
                  {clipping.media_type === "video" ? "Watch interview" : external ? "Read article" : "View clipping"}
                  {external ? <ArrowUpRight size={16} className="text-gold-500" /> : <ArrowRight size={16} className="text-gold-500" />}
                </span>
              </div>
            </>
          );
          const cls = "group flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-line bg-white text-left shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]";
          return (
            <li key={clipping.id}>
              {external
                ? <a href={clipping.article_url || "#"} target="_blank" rel="noopener noreferrer" className={cls}>{card}</a>
                : <button type="button" onClick={() => setOpen(viewable.indexOf(clipping))} className={cls}>{card}</button>}
            </li>
          );
        })}
      </ul>
      {open !== null && viewable[open] && <PressViewer items={viewable} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}

function opensSite(clipping: PressClipping) {
  return clipping.media_type === "online" || (!clipping.video_url && !clipping.image_url && !clipping.document_url);
}

function PressViewer({ items, index, onChange, onClose }: { items: PressClipping[]; index: number; onChange: (index: number) => void; onClose: () => void }) {
  const clipping = items[index];
  const embed = clipping.video_url ? toVideoEmbedUrl(clipping.video_url) : null;
  const showImage = !embed && clipping.image_url;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && items.length > 1) onChange((index + 1) % items.length);
      if (event.key === "ArrowLeft" && items.length > 1) onChange((index - 1 + items.length) % items.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [index, items.length, onChange, onClose]);
  const round = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-navy-700 text-white transition-colors hover:border-white";

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-navy-950/95 animate-fade-in" role="dialog" aria-modal="true" aria-label={clipping.headline} onClick={onClose}>
      <div className="container-page flex items-start justify-between gap-4 py-5" onClick={(event) => event.stopPropagation()}>
        <div className="flex min-w-0 flex-col gap-2">
          <Badge tone="glass" className="self-start">{typeName[clipping.media_type]}</Badge>
          <p className="t-h6 text-white">{clipping.headline}</p>
          <p className="t-body-s text-slate-400">{clipping.publication} · {formatPressDate(clipping.published_on)}{clipping.project ? ` · ${clipping.project}` : ""}</p>
        </div>
        <div className="flex gap-2">
          {clipping.document_url && <a href={clipping.document_url} target="_blank" rel="noopener noreferrer" aria-label="Open PDF" className={round}><Download size={18} /></a>}
          {clipping.article_url && <a href={clipping.article_url} target="_blank" rel="noopener noreferrer" aria-label={`Read on ${clipping.publication}`} className={round}><ExternalLink size={18} /></a>}
          <button type="button" onClick={onClose} aria-label="Close" className={round}><X size={20} /></button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-24" onClick={(event) => event.stopPropagation()}>
        {embed && <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl bg-black"><iframe src={`${embed}${embed.includes("?") ? "&" : "?"}autoplay=1`} title={clipping.headline} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen /></div>}
        {showImage && <img src={clipping.image_url} alt={`${clipping.publication}: ${clipping.headline}`} className="max-h-full max-w-full rounded-md border-[6px] border-white bg-white object-contain" />}
        {!embed && !showImage && clipping.document_url && <iframe src={clipping.document_url} title={clipping.headline} className="h-full w-full max-w-5xl rounded-xl bg-white" />}
        {items.length > 1 && <>
          <button type="button" onClick={() => onChange((index - 1 + items.length) % items.length)} aria-label="Previous item" className={`${round} absolute left-3 top-1/2 h-12 w-12 -translate-y-1/2 bg-navy-950/60 md:left-8`}><ArrowRight size={20} className="rotate-180" /></button>
          <button type="button" onClick={() => onChange((index + 1) % items.length)} aria-label="Next item" className={`${round} absolute right-3 top-1/2 h-12 w-12 -translate-y-1/2 bg-navy-950/60 md:right-8`}><ArrowRight size={20} /></button>
        </>}
      </div>
      {items.length > 1 && <p className="pb-5 text-center t-body-s text-slate-400">{index + 1} / {items.length} · Use ← → to browse, Esc to close</p>}
    </div>
  );
}
