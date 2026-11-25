import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { listPressClippings, listPressProjects } from "../../../lib/server/press";
import { PressBrowser } from "../../../components/press/PressBrowser";
import { PressFeature } from "../../../components/press/PressFeature";
import { Eyebrow, buttonClass } from "../../../components/site/ui";
import { getSiteLinks } from "../../../lib/server/site-details";
import { PageSections } from "../../../components/sections/PageSections";
import { loadSystemPage, systemPageMetadata } from "../../../lib/server/site-pages";

export const dynamic = "force-dynamic";
export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("media", { title: "In the News | HP Global Infrra", description: "Newspaper, TV and online coverage of HP Global Infrra and its projects." });
}

async function load() {
  try {
    const [clippings, projects] = await Promise.all([listPressClippings({ enabledOnly: true }), listPressProjects(true)]);
    return { clippings, projects };
  } catch (error) {
    console.error("Failed to load press clippings", error);
    return { clippings: [], projects: [] };
  }
}

export default async function Page({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const [page, params] = await Promise.all([loadSystemPage("media"), searchParams]);
  if (page) return <PageSections sections={page.sections} searchParams={{ project: typeof params.project === "string" ? params.project : undefined }} />;
  const [{ clippings, projects }, company] = await Promise.all([load(), getSiteLinks()]);
  const initialProject = typeof params.project === "string" ? params.project : "";
  const featured = !initialProject ? clippings.find((item) => item.media_type === "video") : undefined;
  return (
    <>
      <section className="bg-ivory-100">
        <div className="container-page flex flex-col gap-6 py-12 md:py-[72px]">
          <Eyebrow>In the news</Eyebrow>
          <h1 className="t-display max-w-[900px] text-ink">HP Global Infrra in the <span className="accent">press</span></h1>
          <p className="t-body-xl max-w-[600px] text-ink-muted">Newspaper, television and online coverage of HP Global Infrra and our projects.</p>
        </div>
      </section>
      <section className="bg-white pb-16 pt-10 md:pb-[88px] md:pt-14 lg:pb-[112px]">
        <div className="container-page flex flex-col gap-12 md:gap-16">
          {featured && <PressFeature clipping={featured} />}
          {clippings.length
            ? <div><PressBrowser clippings={clippings} projects={projects} initialProject={initialProject} /></div>
            : <p className="rounded-[20px] border border-dashed border-line-strong py-16 text-center t-body text-ink-muted">Press coverage will appear here soon.</p>}
          <div className="flex flex-col gap-6 rounded-3xl bg-ivory-50 p-6 md:p-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <div className="flex items-center gap-5">
              <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-gold-500 sm:flex"><Mail size={26} /></span>
              <div className="flex flex-col gap-2"><h2 className="t-h4 text-ink">Press &amp; media enquiries</h2><p className="t-body text-ink-muted">For interviews, project information or high-resolution images, write to {company.email}.</p></div>
            </div>
            <a href={`mailto:${company.email}?subject=Press%20enquiry`} className={buttonClass("primary", "l", "w-full lg:w-auto")}>Email the press desk</a>
          </div>
        </div>
      </section>
    </>
  );
}
