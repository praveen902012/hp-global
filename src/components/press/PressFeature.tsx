"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { pressThumbnail, type PressClipping } from "../../data/press";
import { toVideoEmbedUrl } from "../../data/pages";
import { Badge, buttonClass } from "../site/ui";
import { formatPressDate } from "./PressGrid";

/** Large card for the most recent video coverage; plays inline. */
export function PressFeature({ clipping }: { clipping: PressClipping }) {
  const [playing, setPlaying] = useState(false);
  const embed = clipping.video_url ? toVideoEmbedUrl(clipping.video_url) : null;
  const thumb = pressThumbnail(clipping);
  if (!embed) return null;
  return (
    <div className="grid overflow-hidden rounded-3xl bg-navy-900 lg:grid-cols-[1.5fr_1fr]">
      <div className="relative aspect-video bg-navy-950">
        {playing
          ? <iframe src={`${embed}${embed.includes("?") ? "&" : "?"}autoplay=1`} title={clipping.headline} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
          : <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`Play: ${clipping.headline}`}>
              {thumb && <img src={thumb} alt="" className="h-full w-full object-cover opacity-80" />}
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold-400 text-navy-900 shadow-[var(--shadow-float)] transition-transform group-hover:scale-105 md:h-[88px] md:w-[88px]"><Play size={30} className="ml-1" fill="currentColor" /></span>
            </button>}
      </div>
      <div className="on-dark flex flex-col justify-center gap-4 p-6 md:p-10">
        <Badge tone="glass" className="self-start">Video · Featured</Badge>
        <h2 className="t-h3 text-white">{clipping.headline}</h2>
        <p className="t-body-s text-slate-400">{clipping.publication} · {formatPressDate(clipping.published_on)}</p>
        {!playing && <button type="button" onClick={() => setPlaying(true)} className={buttonClass("accent", "l", "mt-2 self-start")}><Play size={18} />Watch coverage</button>}
      </div>
    </div>
  );
}
