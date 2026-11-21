import type { Metadata } from "next";
import { listPressClippings, listPressProjects } from "../../../lib/server/press";
import { PressBrowser } from "../../../components/press/PressBrowser";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "In the News | HP Global Infrra",
  description: "Newspaper, TV and online coverage of HP Global Infrra and its projects.",
};

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
  const [{ clippings, projects }, params] = await Promise.all([load(), searchParams]);
  return (
    <div className="min-h-screen bg-brand-white pb-32 pt-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl">
          <span className="mb-8 block text-[10px] font-bold uppercase tracking-[0.3em] text-brand-champagne">Press &amp; Media</span>
          <div className="mb-10 h-[1px] w-12 bg-brand-charcoal" />
          <h1 className="mb-8 font-heading text-4xl font-light tracking-tight text-brand-charcoal lg:text-6xl">In the <span className="font-normal italic text-brand-champagne">News</span></h1>
          <p className="text-lg font-light leading-relaxed text-gray-500">Newspaper, television and online coverage of HP Global Infrra and our projects.</p>
        </div>
        {clippings.length ? <PressBrowser clippings={clippings} projects={projects} initialProject={typeof params.project === "string" ? params.project : ""} />
          : <p className="border-y border-gray-200 py-16 text-center font-light text-gray-500">Press coverage will appear here soon.</p>}
      </div>
    </div>
  );
}
