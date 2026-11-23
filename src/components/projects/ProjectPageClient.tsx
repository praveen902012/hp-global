"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Phone, X } from "lucide-react";
import { buttonClass } from "../site/ui";
import { useEnquiry } from "../site/EnquiryProvider";
import { WhatsAppIcon } from "../site/brand-icons";
import { company } from "../../data/company";
import type { Project } from "../ProjectEnquiryModal";

/** Sticky in-page navigation that highlights the section in view. */
export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-140px 0px -55% 0px" });
    sections.forEach((section) => { const element = document.getElementById(section.id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, [sections]);
  if (sections.length < 2) return null;
  return (
    <nav aria-label="On this page" className="sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur lg:top-20">
      <div className="container-page">
        <ul className="no-scrollbar -mb-px flex gap-6 overflow-x-auto md:gap-8">
          {sections.map((section) => (
            <li key={section.id} className="shrink-0">
              <a href={`#${section.id}`} aria-current={active === section.id ? "true" : undefined} className={`block border-b-2 py-4 text-[15px] font-medium transition-colors ${active === section.id ? "border-gold-400 text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}>{section.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/** Photo grid with a keyboard-friendly lightbox. */
export function Gallery({ images, compact = false }: { images: { src: string; alt: string }[]; compact?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowRight") setOpen((index) => (index === null ? null : (index + 1) % images.length));
      if (event.key === "ArrowLeft") setOpen((index) => (index === null ? null : (index - 1 + images.length) % images.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, images.length]);

  const shown = compact ? images : images.slice(0, 9);
  return (
    <>
      <ul className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-3"}`}>
        {shown.map((image, index) => (
          <li key={`${image.src}-${index}`} className={!compact && index === 0 ? "col-span-2 row-span-2" : ""}>
            <button type="button" onClick={() => setOpen(index)} className="group relative block h-full w-full overflow-hidden rounded-2xl bg-ivory-100" aria-label={`Open image ${index + 1} of ${images.length}`}>
              <img src={image.src} alt={image.alt} loading="lazy" className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${!compact && index === 0 ? "aspect-square" : "aspect-[4/3]"}`} />
              {!compact && index === shown.length - 1 && images.length > shown.length && <span className="absolute inset-0 flex items-center justify-center bg-navy-950/60 t-h5 text-white">+{images.length - shown.length} photos</span>}
            </button>
          </li>
        ))}
      </ul>
      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-[110] flex flex-col bg-navy-950/95 animate-fade-in" onClick={() => setOpen(null)}>
          <div className="flex items-center justify-between p-4 text-white md:p-6">
            <p className="t-body-s text-slate-300">{open + 1} / {images.length}</p>
            <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-700"><X size={20} /></button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8 md:px-24" onClick={(event) => event.stopPropagation()}>
            <img src={images[open].src} alt={images[open].alt} className="max-h-full max-w-full rounded-xl object-contain" />
            {images.length > 1 && <>
              <button type="button" onClick={() => setOpen((open - 1 + images.length) % images.length)} aria-label="Previous photo" className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-navy-700 bg-navy-950/60 text-white md:left-6"><ChevronLeft size={22} /></button>
              <button type="button" onClick={() => setOpen((open + 1) % images.length)} aria-label="Next photo" className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-navy-700 bg-navy-950/60 text-white md:right-6"><ChevronRight size={22} /></button>
            </>}
          </div>
        </div>
      )}
    </>
  );
}

export function ConstructionVideo({ src, poster }: { src: string; poster: string }) {
  return <video controls preload="none" poster={poster || undefined} className="aspect-video w-full rounded-[20px] bg-navy-950 object-cover"><source src={src} />Your browser does not support video playback.</video>;
}

/** Phone-only bar with the main actions, fixed to the bottom of the screen. */
export function MobileActionBar({ project, whatsapp }: { project: Project; whatsapp: string }) {
  const enquire = useEnquiry();
  return (
    <div className="fixed inset-x-0 bottom-0 z-[45] flex items-center gap-3 border-t border-line bg-white/95 px-5 py-3 shadow-[var(--shadow-float)] backdrop-blur lg:hidden">
      <button type="button" onClick={() => enquire(project)} className={buttonClass("accent", "l", "flex-1")}>Enquire now</button>
      <a href={company.phoneHref} aria-label={`Call ${company.phoneDisplay}`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink"><Phone size={19} /></a>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-whatsapp text-navy-900"><WhatsAppIcon size={22} /></a>
    </div>
  );
}
