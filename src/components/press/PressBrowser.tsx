"use client";

import { useMemo, useState } from "react";
import { pressMediaTypes, type PressClipping, type PressMediaType } from "../../data/press";
import { PressGrid } from "./PressGrid";

export function PressBrowser({ clippings, projects, initialProject }: { clippings: PressClipping[]; projects: string[]; initialProject: string }) {
  const [project, setProject] = useState(projects.find((name) => name.toLowerCase() === initialProject.toLowerCase()) ?? "");
  const [type, setType] = useState<PressMediaType | "">("");
  const visible = useMemo(() => clippings.filter((item) => (!project || item.project.toLowerCase() === project.toLowerCase()) && (!type || item.media_type === type)), [clippings, project, type]);
  const chip = (active: boolean) => `whitespace-nowrap border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${active ? "border-brand-charcoal bg-brand-charcoal text-white" : "border-gray-300 text-gray-500 hover:border-brand-champagne hover:text-brand-charcoal"}`;
  const presentTypes = pressMediaTypes.filter((entry) => clippings.some((item) => item.media_type === entry.value));

  return (
    <>
      <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {projects.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by project">
            <button type="button" className={chip(!project)} onClick={() => setProject("")}>All projects</button>
            {projects.map((name) => <button key={name} type="button" className={chip(project === name)} onClick={() => setProject(name)}>{name}</button>)}
          </div>
        )}
        {presentTypes.length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
            <button type="button" className={chip(!type)} onClick={() => setType("")}>All</button>
            {presentTypes.map((entry) => <button key={entry.value} type="button" className={chip(type === entry.value)} onClick={() => setType(entry.value)}>{entry.value === "print" ? "Print" : entry.value === "video" ? "Video" : "Online"}</button>)}
          </div>
        )}
      </div>
      {visible.length ? <PressGrid clippings={visible} /> : <p className="py-16 text-center font-light text-gray-500">No coverage matches these filters yet.</p>}
    </>
  );
}
