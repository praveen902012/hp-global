import type { Metadata } from "next";
import { listPublicProjectsSafe } from "../../../lib/server/portfolio";
import { ProjectsBrowser } from "../../../components/projects/ProjectsBrowser";
import { Eyebrow } from "../../../components/site/ui";
import { CtaBand } from "../../../components/site/CtaBand";
import { PageSections } from "../../../components/sections/PageSections";
import { loadSystemPage, systemPageMetadata } from "../../../lib/server/site-pages";

export const dynamic = "force-dynamic";
export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("projects", {
    title: "Projects | HP Global Infrra",
    description: "Residential and commercial projects across NCR and Uttarakhand — HPG developments and handpicked partner projects.",
  });
}

type Props = { searchParams: Promise<{ developer?: string; type?: string }> };

export default async function Page({ searchParams }: Props) {
  const [page, params] = await Promise.all([loadSystemPage("projects"), searchParams]);
  if (page) return <PageSections sections={page.sections} searchParams={{ developer: params.developer, type: params.type }} />;
  const projects = await listPublicProjectsSafe();
  const developer = params.developer === "hpg" || params.developer === "partner" ? params.developer : "all";
  const kind = params.type === "residential" || params.type === "commercial" ? params.type : "all";
  return (
    <>
      <section className="bg-ivory-100">
        <div className="container-page flex flex-col gap-5 pb-20 pt-12 md:gap-6 md:pb-24 md:pt-[72px]">
          <Eyebrow>Our portfolio</Eyebrow>
          <h1 className="t-display max-w-[1100px] text-ink">Projects worth <span className="accent">investing</span> in</h1>
          <p className="t-body-xl max-w-[640px] text-ink-muted">Landmark HPG developments and handpicked partner projects across NCR and Uttarakhand — each one researched by our advisory team.</p>
        </div>
      </section>
      <section className="pb-16 md:pb-[88px] lg:pb-[112px]">
        <div className="container-page">
          <ProjectsBrowser projects={projects} initialDeveloper={developer} initialKind={kind} />
        </div>
      </section>
      <CtaBand title="Can’t find what you’re looking for?" accent="looking for" text="Tell us your budget and preferred location — we’ll share a curated shortlist within 24 hours." />
    </>
  );
}
