"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PressClipping } from "../../data/press";
import { PressGrid } from "./PressGrid";
import { SectionHeading } from "../site/ui";

/** "In the news" block for a project page; renders nothing until the project has visible clippings. */
export function ProjectPress({ project, limit = 3 }: { project: string; limit?: number }) {
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
    <section className="border-t border-line bg-white section-y">
      <div className="container-page flex flex-col gap-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="In the news" title={`${project} in the press`} accent="press" />
          {clippings.length > limit && <Link href={`/media?project=${encodeURIComponent(project)}`} className="inline-flex items-center gap-1.5 t-label text-ink hover:text-gold-700">All {clippings.length} stories<ArrowRight size={16} className="text-gold-500" /></Link>}
        </div>
        <PressGrid clippings={clippings.slice(0, limit)} />
      </div>
    </section>
  );
}
