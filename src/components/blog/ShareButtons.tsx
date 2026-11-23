"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { FacebookIcon, WhatsAppIcon } from "../site/brand-icons";

const button = "flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-gold-400 hover:text-gold-700";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const open = (build: (pageUrl: string) => string) => (event: React.MouseEvent) => {
    event.preventDefault();
    window.open(build(window.location.href), "_blank", "noopener,noreferrer");
  };
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-[13px] text-ink-muted">Share</span>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} onClick={open((pageUrl) => `https://wa.me/?text=${encodeURIComponent(`${title} ${pageUrl}`)}`)} aria-label="Share on WhatsApp" className={button}><WhatsAppIcon size={18} /></a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} onClick={open((pageUrl) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`)} aria-label="Share on Facebook" className={button}><FacebookIcon size={18} /></a>
      <button type="button" aria-label={copied ? "Link copied" : "Copy link"} className={button} onClick={() => { void navigator.clipboard?.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}>
        {copied ? <Check size={18} className="text-success" /> : <Link2 size={18} />}
      </button>
    </div>
  );
}
