"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { type PortfolioProject } from "../lib/api";
import { ProjectEnquiryModal, type Project } from "./ProjectEnquiryModal";

const projectTypes = ["commercial", "residential"] as const;

export function PortfolioSection() {
  const [tab, setTab] = useState<"hpg" | "partner">("hpg");
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [enquiry, setEnquiry] = useState<Project | null>(null);

  useEffect(() => { fetch("/api/portfolio").then((r) => r.json()).then(setProjects).catch(() => setProjects([])); }, []);
  const visible = projects.filter((project) => project.portfolio_category === tab);

  return <section className="relative overflow-hidden bg-brand-light-grey py-32">
    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-brand-champagne">Our Portfolio</span>
        <h2 className="mb-8 text-4xl font-heading font-light leading-[1.1] tracking-tight text-brand-charcoal md:text-6xl">Our <span className="font-medium italic text-brand-champagne/80">Portfolio</span></h2>
        <p className="mx-auto max-w-3xl text-xl font-light leading-relaxed text-slate-500">Discover our carefully curated real estate portfolio, featuring landmark developments by HPG Inffra and exclusive projects represented through our strategic developer partnerships.</p>
      </div>
      <div className="mb-20 flex justify-center"><div className="inline-flex w-full max-w-2xl rounded-full border border-gray-100 bg-white/85 p-1.5 shadow-lg backdrop-blur-md">
        <button onClick={() => setTab("hpg")} className={`flex-1 rounded-full px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${tab === "hpg" ? "bg-brand-charcoal text-brand-champagne shadow-md" : "text-gray-400 hover:text-brand-charcoal"}`}>Developed by HPG Inffra</button>
        <button onClick={() => setTab("partner")} className={`flex-1 rounded-full px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${tab === "partner" ? "bg-brand-charcoal text-brand-champagne shadow-md" : "text-gray-400 hover:text-brand-charcoal"}`}>Partner Developments</button>
      </div></div>
      <div className="space-y-24 animate-fade-in-up">
        {projectTypes.map((type) => {
          const items = visible.filter((project) => project.project_type === type);
          if (!items.length) return null;
          const heading = type === "commercial" ? "Commercial Landmarks" : "Residential Havens";
          return <div key={type} className="space-y-12"><div className="flex items-center gap-3"><div className="h-[1.5px] w-12 bg-brand-champagne"/><span className="text-[11px] font-bold uppercase tracking-[0.4em] text-brand-champagne">{heading}</span></div><div className="space-y-12">{items.map((project, index) => <PortfolioProjectCard key={project.id} project={project} reversed={index % 2 === 1} onEnquire={() => setEnquiry({ title: project.title, location: project.location, category: type === "commercial" ? "Commercial" : "Residential" })}/>)}</div></div>;
        })}
      </div>
      {!visible.length && <p className="py-16 text-center text-slate-500">No projects are published in this category yet.</p>}
    </div>
    {enquiry && <ProjectEnquiryModal isOpen project={enquiry} onClose={() => setEnquiry(null)} />}
  </section>;
}

function PortfolioProjectCard({ project, reversed, onEnquire }: { project: PortfolioProject; reversed: boolean; onEnquire: () => void }) {
  return <article className="overflow-hidden rounded-3xl border border-gray-100/50 bg-white shadow-xl transition-shadow duration-500 hover:shadow-2xl"><div className="grid gap-0 lg:grid-cols-12">
    <div className={`group relative min-h-[350px] overflow-hidden lg:col-span-5 ${reversed ? "order-1 lg:order-2" : "order-1"}`}><img src={project.image_url} alt={project.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"/><span className="absolute left-6 top-6 rounded-full bg-brand-charcoal px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-champagne">{project.project_type === "commercial" ? "Commercial Landmark" : "Residential Haven"}</span></div>
    <div className={`flex flex-col justify-between p-8 lg:col-span-7 lg:p-12 ${reversed ? "order-2 lg:order-1" : "order-2"}`}><div><div className="mb-4 flex items-center gap-2 text-brand-champagne"><MapPin size={16} strokeWidth={1.5}/><span className="text-xs font-semibold uppercase tracking-widest text-gray-500">{project.location}</span></div><h3 className="mb-4 text-3xl font-heading text-brand-charcoal">{project.title}</h3><p className="mb-8 text-base font-light leading-relaxed text-gray-500">{project.description}</p><div className="mb-8 flex flex-wrap gap-3">{project.tags.map((tag) => <span key={tag} className="rounded-full border border-gray-100 bg-gray-50 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">{tag}</span>)}</div></div><div className="flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-6 sm:flex-row"><div className="w-full text-left sm:w-auto"><span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">{project.project_type === "commercial" ? "Investment" : "Pricing"}</span><span className="text-2xl font-heading text-brand-charcoal">{project.price || "On request"}</span></div><button onClick={onEnquire} className="w-full bg-brand-charcoal px-8 py-4 text-xs font-bold uppercase tracking-widest text-brand-champagne transition-colors duration-300 hover:bg-brand-champagne hover:text-brand-charcoal sm:w-auto">View Project & Enquire</button></div></div>
  </div></article>;
}
