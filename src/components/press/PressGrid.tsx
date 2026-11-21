"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileText, Newspaper, Play, X } from "lucide-react";
import { pressThumbnail, pressTypeLabel, type PressClipping } from "../../data/press";
import { toVideoEmbedUrl } from "../../data/pages";

const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));

/** Grid of press clippings; videos, scans and PDFs open in a viewer, online articles open the source site. */
export function PressGrid({ clippings, dark = false }: { clippings: PressClipping[]; dark?: boolean }) {
  const [open, setOpen] = useState<PressClipping | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {clippings.map((clipping) => {
          const thumb = pressThumbnail(clipping);
          const opensSite = clipping.media_type === "online" || (!clipping.video_url && !clipping.image_url && !clipping.document_url);
          const card = (
            <>
              <div className={`relative aspect-[4/3] overflow-hidden ${dark ? "bg-white/5" : "bg-brand-beige"}`}>
                {thumb ? <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  : <div className="flex h-full items-center justify-center text-brand-champagne/60">{clipping.document_url ? <FileText size={48} strokeWidth={1} /> : <Newspaper size={48} strokeWidth={1} />}</div>}
                {clipping.media_type === "video" && <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-brand-charcoal shadow-xl transition-transform duration-500 group-hover:scale-110"><Play size={24} className="ml-1" fill="currentColor" /></span></span>}
                <span className="absolute left-4 top-4 bg-brand-charcoal/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-champagne">{pressTypeLabel(clipping.media_type)}</span>
              </div>
              <div className="flex flex-grow flex-col p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-champagne"><span>{clipping.publication}</span><span className={`h-1 w-1 rounded-full ${dark ? "bg-white/20" : "bg-gray-300"}`} /><span className={dark ? "text-slate-400" : "text-gray-400"}>{formatDate(clipping.published_on)}</span></div>
                <h3 className={`mb-3 font-heading text-xl leading-snug transition-colors duration-500 group-hover:text-brand-champagne ${dark ? "text-white" : "text-brand-charcoal"}`}>{clipping.headline}</h3>
                {clipping.summary && <p className={`line-clamp-3 text-sm font-light leading-relaxed ${dark ? "text-slate-300" : "text-gray-500"}`}>{clipping.summary}</p>}
                <span className={`mt-auto inline-flex items-center gap-2 pt-5 text-xs font-semibold uppercase tracking-widest ${dark ? "text-white" : "text-brand-charcoal"}`}>{clipping.media_type === "video" ? "Watch" : opensSite ? "Read article" : "View clipping"}{opensSite && <ExternalLink size={13} />}</span>
              </div>
            </>
          );
          const cardClass = `group flex h-full flex-col overflow-hidden border text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${dark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`;
          return opensSite
            ? <a key={clipping.id} href={clipping.article_url || "#"} target="_blank" rel="noopener noreferrer" className={cardClass}>{card}</a>
            : <button key={clipping.id} type="button" onClick={() => setOpen(clipping)} className={cardClass}>{card}</button>;
        })}
      </div>

      {open && <PressViewer clipping={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function PressViewer({ clipping, onClose }: { clipping: PressClipping; onClose: () => void }) {
  const embed = clipping.video_url ? toVideoEmbedUrl(clipping.video_url) : null;
  const showImage = !embed && clipping.image_url;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label={clipping.headline} onClick={onClose}>
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-4 text-white">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-champagne">{clipping.publication} · {formatDate(clipping.published_on)}</p><p className="mt-1 font-heading text-lg leading-snug md:text-xl">{clipping.headline}</p></div>
          <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 text-white transition-colors hover:text-brand-champagne"><X size={30} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {embed && <div className="relative aspect-video w-full bg-black"><iframe src={`${embed}?autoplay=1`} title={clipping.headline} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>}
          {showImage && <img src={clipping.image_url} alt={`${clipping.publication}: ${clipping.headline}`} className="mx-auto max-h-[78vh] w-auto bg-white object-contain" />}
          {!embed && !showImage && clipping.document_url && <iframe src={clipping.document_url} title={clipping.headline} className="h-[78vh] w-full bg-white" />}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-widest">
          {clipping.document_url && <a href={clipping.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white hover:text-brand-champagne"><FileText size={14} />Open PDF</a>}
          {clipping.article_url && <a href={clipping.article_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white hover:text-brand-champagne"><ExternalLink size={14} />Read on {clipping.publication}</a>}
        </div>
      </div>
    </div>
  );
}
