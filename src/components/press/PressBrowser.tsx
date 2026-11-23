"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { pressMediaTypes, type PressClipping, type PressMediaType } from "../../data/press";
import { PressGrid } from "./PressGrid";
import { fieldControl } from "../site/ui";

const tabLabel: Record<PressMediaType, string> = { print: "Print", video: "Video", online: "Online" };

export function PressBrowser({ clippings, projects, initialProject }: { clippings: PressClipping[]; projects: string[]; initialProject: string }) {
  const [project, setProject] = useState(projects.find((name) => name.toLowerCase() === initialProject.toLowerCase()) ?? "");
  const [type, setType] = useState<PressMediaType | "">("");
  const visible = useMemo(() => clippings.filter((item) => (!project || item.project.toLowerCase() === project.toLowerCase()) && (!type || item.media_type === type)), [clippings, project, type]);
  const presentTypes = pressMediaTypes.filter((entry) => clippings.some((item) => item.media_type === entry.value));
  const tabs: { value: PressMediaType | ""; label: string }[] = [{ value: "", label: "All" }, ...presentTypes.map((entry) => ({ value: entry.value, label: tabLabel[entry.value] }))];

  return (
    <>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        {presentTypes.length > 1 ? (
          <div role="tablist" aria-label="Type of coverage" className="flex border-b border-line md:border-0">
            {tabs.map((tab) => (
              <button key={tab.value || "all"} role="tab" type="button" aria-selected={type === tab.value} onClick={() => setType(tab.value)} className={`flex-1 border-b-2 px-4 py-3 text-[15px] font-medium transition-colors md:flex-none ${type === tab.value ? "border-gold-400 text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}>{tab.label}</button>
            ))}
          </div>
        ) : <span />}
        {projects.length > 0 && (
          <label className="flex flex-col gap-2 md:w-80">
            <span className="t-label text-ink">Project</span>
            <span className="relative">
              <select value={project} onChange={(event) => setProject(event.target.value)} className={`${fieldControl()} h-12 appearance-none pr-10`}>
                <option value="">All projects</option>
                {projects.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            </span>
          </label>
        )}
      </div>
      <div className="mt-8 flex items-center justify-between"><p className="t-body-s text-ink-muted" aria-live="polite">{visible.length} {visible.length === 1 ? "item" : "items"}</p></div>
      <div className="mt-5">
        {visible.length ? <PressGrid clippings={visible} /> : <p className="rounded-[20px] border border-dashed border-line-strong py-16 text-center t-body text-ink-muted">No coverage matches these filters yet.</p>}
      </div>
    </>
  );
}
