"use client";

import { useState } from "react";
import type { PublicProject } from "../../data/projects";
import { ProjectCard } from "./ProjectCard";
import { chipClass } from "../site/ui";

const filters = [
  { value: "all", label: "All projects", test: () => true },
  { value: "hpg", label: "HPG developments", test: (project: PublicProject) => project.portfolio_category === "hpg" },
  { value: "partner", label: "Partner projects", test: (project: PublicProject) => project.portfolio_category === "partner" },
  { value: "residential", label: "Residential", test: (project: PublicProject) => project.project_type === "residential" },
  { value: "commercial", label: "Commercial", test: (project: PublicProject) => project.project_type === "commercial" },
] as const;

/** Home page portfolio: filter chips over a grid of up to six project cards. */
export function HomePortfolio({ projects, limit = 6 }: { projects: PublicProject[]; limit?: number }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const options = filters.filter((option) => option.value === "all" || projects.some(option.test));
  const active = filters.find((option) => option.value === filter) ?? filters[0];
  const visible = projects.filter(active.test).slice(0, limit);
  return (
    <>
      {options.length > 2 && (
        <div role="group" aria-label="Filter projects" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
          {options.map((option) => <button key={option.value} type="button" aria-pressed={filter === option.value} onClick={() => setFilter(option.value)} className={chipClass(filter === option.value)}>{option.label}</button>)}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
    </>
  );
}
