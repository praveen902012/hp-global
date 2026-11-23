import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { categoryLabel, type PublicProject } from "../../data/projects";
import { Badge } from "../site/ui";

/** Portfolio card linking to the project's own page. */
export function ProjectCard({ project, priority = false }: { project: PublicProject; priority?: boolean }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-white shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)] focus-visible:shadow-[var(--shadow-card)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-ivory-100">
        <img src={project.image_url} alt="" loading={priority ? "eager" : "lazy"} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <Badge tone="glass">{categoryLabel(project.portfolio_category)}</Badge>
          {project.status && <Badge tone="gold">{project.status}</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <p className="flex items-center gap-1.5 t-body-s text-ink-muted"><MapPin size={15} className="shrink-0 text-gold-500" />{project.location}</p>
        <h3 className="t-h4 text-ink">{project.title}</h3>
        <p className="line-clamp-2 t-body-s text-ink-muted">{project.description}</p>
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="text-[12px] leading-4 text-ink-muted">{project.project_type === "commercial" ? "Investment from" : "Starting from"}</p>
            <p className="mt-1 t-h6 text-ink">{project.price || "Price on request"}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 t-label text-ink">View details<ArrowRight size={16} className="text-gold-500 transition-transform group-hover:translate-x-0.5" /></span>
        </div>
      </div>
    </Link>
  );
}
