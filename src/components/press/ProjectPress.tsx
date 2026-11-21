"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PressClipping } from "../../data/press";
import { PressGrid } from "./PressGrid";

/** "In the News" block for a project page; renders nothing until the project has visible clippings. */
export function ProjectPress({ project, limit = 6 }: { project: string; limit?: number }) {
  const [clippings, setClippings] = useState<PressClipping[]>([]);
  useEffect(() => {
    if (!project.trim()) return;
    const controller = new AbortController();
    fetch(`/api/press?project=${encodeURIComponent(project)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : []))
      .then((items: PressClipping[]) => setClippings(items))
      .catch(() => undefined);
    return () => controller.abort();
  }, [project]);

  if (!clippings.length) return null;
  return (
    <section className="bg-brand-light-grey py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-brand-champagne">Press coverage</span>
            <h2 className="font-heading text-3xl font-light tracking-tight text-brand-charcoal md:text-5xl">In the News</h2>
          </div>
          {clippings.length > limit && <Link href={`/media?project=${encodeURIComponent(project)}`} className="group inline-flex items-center text-xs font-semibold uppercase tracking-widest text-brand-charcoal hover:text-brand-champagne">All {clippings.length} stories<ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" /></Link>}
        </div>
        <PressGrid clippings={clippings.slice(0, limit)} />
      </div>
    </section>
  );
}
