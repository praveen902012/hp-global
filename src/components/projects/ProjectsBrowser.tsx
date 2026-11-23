"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { PublicProject } from "../../data/projects";
import { ProjectCard } from "./ProjectCard";
import { buttonClass, chipClass } from "../site/ui";

type Developer = "all" | PublicProject["portfolio_category"];
type Kind = "all" | PublicProject["project_type"];

const developerOptions: { value: Developer; label: string }[] = [{ value: "all", label: "All" }, { value: "hpg", label: "HPG developments" }, { value: "partner", label: "Partner projects" }];
const kindOptions: { value: Kind; label: string }[] = [{ value: "all", label: "All types" }, { value: "residential", label: "Residential" }, { value: "commercial", label: "Commercial" }];

export function ProjectsBrowser({ projects, initialDeveloper = "all", initialKind = "all" }: { projects: PublicProject[]; initialDeveloper?: Developer; initialKind?: Kind }) {
  const [developer, setDeveloper] = useState<Developer>(initialDeveloper);
  const [kind, setKind] = useState<Kind>(initialKind);
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState(false);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((project) =>
      (developer === "all" || project.portfolio_category === developer)
      && (kind === "all" || project.project_type === kind)
      && (!term || `${project.title} ${project.location}`.toLowerCase().includes(term)));
  }, [projects, developer, kind, search]);
  const activeCount = (developer !== "all" ? 1 : 0) + (kind !== "all" ? 1 : 0);
  const reset = () => { setDeveloper("all"); setKind("all"); setSearch(""); };

  const chips = (onPick?: () => void) => (
    <>
      <div className="flex flex-col gap-2.5">
        <p className="t-label text-ink md:sr-only">Developer</p>
        <div role="group" aria-label="Developer" className="flex flex-wrap gap-2">
          {developerOptions.map((option) => <button key={option.value} type="button" aria-pressed={developer === option.value} onClick={() => { setDeveloper(option.value); onPick?.(); }} className={chipClass(developer === option.value)}>{option.label}</button>)}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <p className="t-label text-ink md:sr-only">Property type</p>
        <div role="group" aria-label="Property type" className="flex flex-wrap gap-2">
          {kindOptions.map((option) => <button key={option.value} type="button" aria-pressed={kind === option.value} onClick={() => { setKind(option.value); onPick?.(); }} className={chipClass(kind === option.value)}>{option.label}</button>)}
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="relative z-10 -mt-10 rounded-[20px] border border-line bg-white p-4 shadow-[var(--shadow-card)] md:-mt-12 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="hidden flex-wrap items-center gap-x-6 gap-y-3 md:flex">{chips()}</div>
          <div className="flex items-center gap-3">
            <label className="relative flex-1 lg:w-72 lg:flex-none">
              <span className="sr-only">Search projects</span>
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" className="h-11 w-full rounded-full border border-line-strong bg-white pl-11 pr-4 text-[15px] outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-200" />
            </label>
            <button type="button" onClick={() => setSheet(true)} className={buttonClass("outline", "m", "md:hidden")} aria-haspopup="dialog">
              <SlidersHorizontal size={16} />Filters{activeCount ? ` (${activeCount})` : ""}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 md:mt-10">
        <p className="t-body-s text-ink-muted" aria-live="polite">Showing {visible.length} {visible.length === 1 ? "project" : "projects"}</p>
        {(activeCount > 0 || search) && <button type="button" onClick={reset} className="t-label text-gold-700 hover:underline">Clear filters</button>}
      </div>

      {visible.length ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {visible.map((project, index) => <ProjectCard key={project.id} project={project} priority={index < 3} />)}
        </div>
      ) : (
        <div className="mt-5 rounded-[20px] border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="t-h4 text-ink">No projects match these filters</p>
          <p className="mt-2 t-body text-ink-muted">Try another type or developer, or talk to an advisor about what you’re looking for.</p>
          <button type="button" onClick={reset} className={buttonClass("outline", "m", "mt-6")}>Clear filters</button>
        </div>
      )}

      {sheet && (
        <div className="fixed inset-0 z-[95] flex items-end bg-navy-950/70 animate-fade-in md:hidden" onClick={() => setSheet(false)}>
          <div role="dialog" aria-modal="true" aria-label="Filters" onClick={(event) => event.stopPropagation()} className="flex max-h-[85vh] w-full flex-col gap-6 overflow-y-auto rounded-t-[24px] bg-white px-5 pb-6 pt-3 animate-sheet-up">
            <span aria-hidden className="mx-auto h-1 w-10 rounded-full bg-line" />
            <div className="flex items-center justify-between"><p className="t-h4 text-ink">Filters</p><button type="button" onClick={() => setSheet(false)} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory-50"><X size={18} /></button></div>
            {chips()}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={reset} className={buttonClass("outline", "l", "flex-1")}>Clear</button>
              <button type="button" onClick={() => setSheet(false)} className={buttonClass("primary", "l", "flex-1")}>Show {visible.length} {visible.length === 1 ? "project" : "projects"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
