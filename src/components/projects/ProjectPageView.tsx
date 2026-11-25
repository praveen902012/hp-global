import Link from "next/link";
import { Building2, CalendarDays, Check, ChevronRight, Download, FileText, KeyRound, MapPin, Play } from "lucide-react";
import { categoryLabel, typeLabel, type ProjectPage, type PublicProject } from "../../data/projects";
import { Accented, Badge, SectionHeading, buttonClass } from "../site/ui";
import { EnquireButton } from "../site/EnquiryProvider";
import { WhatsAppIcon } from "../site/brand-icons";
import { getSiteLinks } from "../../lib/server/site-details";
import { ProjectCard } from "./ProjectCard";
import { Gallery, SectionNav, MobileActionBar, ConstructionVideo } from "./ProjectPageClient";
import { ProjectPress } from "../press/ProjectPress";

export async function ProjectPageView({ project, related }: { project: ProjectPage; related: PublicProject[] }) {
  const company = await getSiteLinks();
  const { whatsappFor } = company;
  const enquiryProject = { title: project.title, location: project.location, category: `${typeLabel(project.project_type)} · ${categoryLabel(project.portfolio_category)}`, image: project.image_url, status: project.status };
  const brochure = project.documents[0];
  const sections = [
    { id: "overview", label: "Overview", show: true },
    { id: "gallery", label: "Gallery", show: project.gallery.length > 0 },
    { id: "walkthrough", label: "Walkthrough", show: !!project.video },
    { id: "amenities", label: "Amenities", show: project.amenities.length > 0 },
    { id: "layout", label: "Layout plan", show: !!project.layout_image },
    { id: "construction", label: "Construction", show: project.construction.images.length > 0 || !!project.construction.video_url },
    { id: "documents", label: "Documents", show: project.documents.length > 0 },
  ].filter((section) => section.show);
  const facts = [
    { icon: <MapPin size={18} />, label: "Location", value: project.location },
    { icon: <Building2 size={18} />, label: "Type", value: typeLabel(project.project_type) },
    ...(project.price ? [{ icon: <KeyRound size={18} />, label: project.project_type === "commercial" ? "Investment from" : "Starting from", value: project.price }] : []),
    ...(project.status ? [{ icon: <CalendarDays size={18} />, label: "Status", value: project.status }] : []),
    ...project.facts.map((fact) => ({ icon: <Check size={18} />, label: fact.label, value: fact.value })),
  ];

  return (
    <>
      {/* Hero */}
      <section data-nav-overlay className="hero-overlay on-dark relative overflow-hidden bg-navy-950">
        <img src={project.hero_image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/30" />
        <div className="container-page relative flex min-h-[560px] flex-col justify-end gap-5 pb-12 pt-24 md:min-h-[600px] md:pb-16 lg:min-h-[640px]">
          <nav aria-label="Breadcrumb" className="t-body-s text-slate-300">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-white">Home</Link></li><li aria-hidden><ChevronRight size={14} /></li>
              <li><Link href="/projects" className="hover:text-white">Projects</Link></li><li aria-hidden><ChevronRight size={14} /></li>
              <li aria-current="page" className="text-white">{project.title}</li>
            </ol>
          </nav>
          <div className="flex flex-wrap gap-2">
            {project.status && <Badge tone="success">{project.status}</Badge>}
            <Badge tone="glass">{categoryLabel(project.portfolio_category)}</Badge>
          </div>
          <h1 className="t-display max-w-[900px] text-white"><Accented text={project.display_title} accent={project.accent_title} /></h1>
          <p className="flex items-center gap-2 t-body-l text-slate-200"><MapPin size={18} className="text-gold-400" />{project.location}</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <EnquireButton project={enquiryProject} className={buttonClass("accent", "l")}>Enquire now</EnquireButton>
            {brochure && <a href={brochure.url} target="_blank" rel="noopener noreferrer" className={buttonClass("outline-inverse", "l")}><Download size={18} />Brochure</a>}
            {project.video && <a href="#walkthrough" className={buttonClass("outline-inverse", "l")}><Play size={18} />Walkthrough</a>}
          </div>
        </div>
      </section>

      <SectionNav sections={sections.map(({ id, label }) => ({ id, label }))} />

      <div className="container-page grid gap-12 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 lg:py-20">
        <div className="flex min-w-0 flex-col gap-16 md:gap-20">
          {/* Overview */}
          <section id="overview" className="scroll-mt-36 flex flex-col gap-8">
            <SectionHeading eyebrow="Overview" title={`About ${project.title}`} accent={project.title} lead={<p className="whitespace-pre-line">{project.overview}</p>} />
            <dl className="grid gap-3 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-center gap-3 rounded-2xl border border-line p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory-100 text-gold-500">{fact.icon}</span>
                  <div className="min-w-0"><dt className="text-[12px] leading-4 text-ink-muted">{fact.label}</dt><dd className="mt-1 t-label text-ink">{fact.value}</dd></div>
                </div>
              ))}
            </dl>
            {project.highlights.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {project.highlights.map((item) => <li key={item} className="flex items-start gap-3 t-body text-ink"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-200 text-gold-700"><Check size={14} /></span>{item}</li>)}
              </ul>
            )}
          </section>

          {project.gallery.length > 0 && (
            <section id="gallery" className="scroll-mt-36 flex flex-col gap-8">
              <SectionHeading eyebrow="Gallery" title={`Life at ${project.title}`} accent="Life" />
              <Gallery images={project.gallery} />
            </section>
          )}

          {project.video && (
            <section id="walkthrough" className="scroll-mt-36 flex flex-col gap-8">
              <SectionHeading eyebrow="Walkthrough" title="Explore the complete project" accent="complete" />
              <div className="relative aspect-video overflow-hidden rounded-[20px] bg-navy-950 shadow-[var(--shadow-card)]">
                <iframe src={project.video.src} title={project.video.title} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            </section>
          )}

          {project.amenities.length > 0 && (
            <section id="amenities" className="scroll-mt-36 flex flex-col gap-8">
              <SectionHeading eyebrow="Amenities" title="Thoughtfully planned for every age" accent="every age" />
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.amenities.map((amenity) => (
                  <li key={amenity.name} className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-ivory-50 p-4 md:p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white">{amenity.icon ? <img src={amenity.icon} alt="" className="h-7 w-7 object-contain" /> : <Check size={20} className="text-gold-500" />}</span>
                    <span className="t-label text-ink">{amenity.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.layout_image && (
            <section id="layout" className="scroll-mt-36 flex flex-col gap-8">
              <SectionHeading eyebrow="Layout plan" title="Site layout" accent="layout" />
              <a href={project.layout_image} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-[20px] border border-line bg-white p-3 md:p-5">
                <img src={project.layout_image} alt={`${project.title} layout plan`} loading="lazy" className="w-full rounded-xl object-contain" />
                <span className="mt-3 inline-flex items-center gap-1.5 t-label text-ink group-hover:text-gold-700">View full screen<ChevronRight size={16} className="text-gold-500" /></span>
              </a>
            </section>
          )}

          {(project.construction.images.length > 0 || project.construction.video_url) && (
            <section id="construction" className="scroll-mt-36 flex flex-col gap-8">
              <SectionHeading eyebrow="Construction updates" title="Progress you can see" accent="see" lead="Latest site video and photos, updated as construction progresses." />
              {project.construction.video_url && <ConstructionVideo src={project.construction.video_url} poster={project.construction.poster_url} />}
              {project.construction.images.length > 0 && <Gallery images={project.construction.images.map((src, index) => ({ src, alt: `Construction photo ${index + 1}` }))} compact />}
            </section>
          )}

          {project.documents.length > 0 && (
            <section id="documents" className="scroll-mt-36 flex flex-col gap-8">
              <SectionHeading eyebrow="Documents" title="Brochures, floor plans & price lists" accent="price lists" lead="Download the latest documents — or ask us to send them to you on WhatsApp." />
              <ul className="grid gap-3 md:grid-cols-2">
                {project.documents.map((document) => (
                  <li key={document.url}>
                    <a href={document.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-gold-400">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-200 text-gold-700"><FileText size={20} /></span>
                      <span className="min-w-0 flex-1"><span className="block t-label text-ink">{document.name}</span><span className="block text-[13px] text-ink-muted">PDF{document.size ? ` · ${document.size}` : ""}</span></span>
                      <span className="inline-flex items-center gap-1.5 t-label text-ink group-hover:text-gold-700"><span className="hidden sm:inline">Download</span><Download size={18} className="text-gold-500" /></span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Enquiry card */}
        <aside className="hidden lg:block">
          <div className="on-dark sticky top-36 flex flex-col gap-5 rounded-[20px] bg-navy-900 p-7 shadow-[var(--shadow-float)]">
            {project.enquiry.status && <p className="flex items-center gap-2 t-label text-gold-400"><span className="h-2 w-2 rounded-full bg-whatsapp" />{project.enquiry.status}</p>}
            <p className="t-h4 text-white">Interested in {project.title}?</p>
            {project.enquiry.items.length > 0 && <ul className="flex flex-col gap-2.5">{project.enquiry.items.map((item) => <li key={item} className="flex gap-2.5 t-body-s text-slate-300"><Check size={16} className="mt-0.5 shrink-0 text-gold-400" />{item}</li>)}</ul>}
            <EnquireButton project={enquiryProject} className={buttonClass("accent", "l", "w-full")}>{project.enquiry.button_label || "Enquire now"}</EnquireButton>
            <div className="grid grid-cols-2 gap-3">
              <a href={company.phoneHref} className={buttonClass("outline-inverse", "m", "w-full")}>Call</a>
              <a href={whatsappFor(`Hello, I'm interested in ${project.title}.`)} target="_blank" rel="noopener noreferrer" className={buttonClass("outline-inverse", "m", "w-full")}><WhatsAppIcon size={16} />WhatsApp</a>
            </div>
            {project.enquiry.note && <p className="t-body-s text-slate-400">{project.enquiry.note}</p>}
          </div>
        </aside>
      </div>

      <ProjectPress project={project.title} />

      {related.length > 0 && (
        <section className="bg-ivory-50 section-y">
          <div className="container-page flex flex-col gap-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="Explore more" title="You may also like" accent="also" />
              <Link href="/projects" className="inline-flex items-center gap-1.5 t-label text-ink hover:text-gold-700">All projects<ChevronRight size={16} className="text-gold-500" /></Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ProjectCard key={item.id} project={item} />)}</div>
          </div>
        </section>
      )}

      <MobileActionBar project={enquiryProject} whatsapp={whatsappFor(`Hello, I'm interested in ${project.title}.`)} />
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  );
}
