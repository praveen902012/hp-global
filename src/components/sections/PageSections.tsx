import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Clock, Download, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import {
  ENQUIRE_LINK, toVideoEmbedUrl, type CardsSection, type PageSection, type ProjectFilter, type SectionBackground, type ServiceSection,
} from "../../data/pages";
import type { BlogEntry } from "../../data/blogData";
import { blogs as builtInBlogs } from "../../data/blogData";
import { defaultFeaturedProject, type FeaturedProjectContent } from "../../data/featuredProject";
import type { PressClipping } from "../../data/press";
import type { PublicProject } from "../../data/projects";
import type { SiteLinks } from "../../data/siteDetails";
import { getAllBlogs } from "../../lib/server/blogs";
import { getFeaturedProject } from "../../lib/server/featured-project";
import { getFeaturedProjectSlug, listPublicProjectsSafe } from "../../lib/server/portfolio";
import { listPressClippings, listPressProjects } from "../../lib/server/press";
import { getSiteLinks } from "../../lib/server/site-details";
import { SectionLink } from "./SectionLink";
import { SectionIcon } from "./icons";
import { ContactForm } from "../site/ContactForm";
import { Faq } from "../site/Faq";
import { CtaBand } from "../site/CtaBand";
import { EnquireButton } from "../site/EnquiryProvider";
import { WhatsAppIcon } from "../site/brand-icons";
import { ArticleCard } from "../site/ArticleCard";
import { Accented, Badge, ButtonLink, Eyebrow, IconCircle, SectionHeading, TextLink, buttonClass, type ButtonStyle } from "../site/ui";
import { HomePortfolio } from "../projects/HomePortfolio";
import { ProjectsBrowser } from "../projects/ProjectsBrowser";
import { PressGrid } from "../press/PressGrid";
import { PressFeature } from "../press/PressFeature";
import { PressBrowser } from "../press/PressBrowser";
import { JournalBrowser } from "../blog/JournalBrowser";

const backgrounds: Record<SectionBackground, string> = {
  white: "bg-white",
  light: "bg-ivory-50",
  dark: "bg-navy-900 on-dark",
};

/* ------------------------------------------------------------------ */
/* Live content                                                        */
/* ------------------------------------------------------------------ */

interface LiveData {
  site: SiteLinks;
  projects: PublicProject[];
  featured: FeaturedProjectContent;
  featuredSlug: string | null;
  press: PressClipping[];
  pressProjects: string[];
  blogs: BlogEntry[];
  params: Record<string, string | undefined>;
}

/** A failing block shows nothing (or its built-in fallback) instead of taking the page down. */
async function safe<T>(label: string, load: () => Promise<T>, fallback: T) {
  try {
    return await load();
  } catch (error) {
    console.error(`Page sections: failed to load ${label}`, error);
    return fallback;
  }
}

async function loadLiveData(sections: PageSection[], params: Record<string, string | undefined>): Promise<LiveData> {
  const has = (...types: PageSection["type"][]) => sections.some((section) => types.includes(section.type));
  const needsProjects = has("projects", "projects_list", "featured_project") || sections.some((section) =>
    (section.type === "hero" && section.show_featured) ||
    (section.type === "stats" && section.items.some((item) => /\{\w+\}/.test(item.value))) ||
    (section.type === "cards" && section.cards.some((card) => card.projects)));
  const needsFeatured = has("featured_project") || sections.some((section) => section.type === "hero" && section.show_featured);
  const [site, projects, featured, featuredSlug, press, pressProjects, blogs] = await Promise.all([
    getSiteLinks(),
    needsProjects ? listPublicProjectsSafe() : Promise.resolve([]),
    has("featured_project") ? safe("featured project", getFeaturedProject, defaultFeaturedProject) : Promise.resolve(defaultFeaturedProject),
    needsFeatured ? safe("featured project address", getFeaturedProjectSlug, null) : Promise.resolve(null),
    has("press", "press_list") ? safe("press", () => listPressClippings({ enabledOnly: true }), []) : Promise.resolve([]),
    has("press_list") ? safe("press projects", () => listPressProjects(true), []) : Promise.resolve([]),
    has("articles", "articles_list") ? safe("articles", getAllBlogs, builtInBlogs) : Promise.resolve([]),
  ]);
  return { site, projects, featured, featuredSlug, press, pressProjects, blogs, params };
}

const projectFilters: Record<ProjectFilter, (project: PublicProject) => boolean> = {
  all: () => true,
  hpg: (project) => project.portfolio_category === "hpg",
  partner: (project) => project.portfolio_category === "partner",
  residential: (project) => project.project_type === "residential",
  commercial: (project) => project.project_type === "commercial",
};
const cardProjectMatch: Record<string, (project: PublicProject) => boolean> = {
  residential: (project) => project.project_type === "residential",
  commercial: (project) => project.project_type === "commercial",
  high_end: (project) => project.project_type === "residential" && /cr/i.test(project.price),
};

/** Replaces {projects}, {hpg} and {partner} in key figures with live counts. */
function liveFigure(value: string, label: string, projects: PublicProject[]) {
  const counts: Record<string, number> = {
    projects: projects.length,
    hpg: projects.filter((project) => project.portfolio_category === "hpg").length,
    partner: projects.filter((project) => project.portfolio_category === "partner").length,
  };
  let usedToken = false;
  const resolved = value.replace(/\{(\w+)\}/g, (match, key: string) => { if (!(key in counts)) return match; usedToken = true; return String(counts[key]); });
  if (!usedToken) return { value, label };
  if (resolved === "0") return null;
  return { value: resolved, label: resolved === "1" && /s$/.test(label) ? label.slice(0, -1) : label };
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Title({ text, accent, dark, as: Tag = "h2", size = "t-h2", center, className = "", style }: { text: string; accent?: string; dark: boolean; as?: "h1" | "h2"; size?: string; center?: boolean; className?: string; style?: React.CSSProperties }) {
  if (!text && !accent) return null;
  return <Tag style={style} className={`${size} ${dark ? "text-white" : "text-ink"} ${center ? "text-center" : ""} ${className}`}><Accented text={text} accent={accent} /></Tag>;
}

function Action({ label, href, dark, variant }: { label: string; href: string; dark: boolean; variant?: "accent" | "primary" }) {
  if (!label || !href) return null;
  if (href === ENQUIRE_LINK) return <EnquireButton className={buttonClass(variant ?? (dark ? "accent" : "primary"), "l", "self-start")}>{label}<ArrowRight size={18} aria-hidden /></EnquireButton>;
  return (
    <SectionLink href={href} className={buttonClass(variant ?? (dark ? "accent" : "primary"), "l", "self-start")}>
      {label}<ArrowRight size={18} aria-hidden />
    </SectionLink>
  );
}

/** A button that either links somewhere or opens the enquiry form. */
function SmartButton({ label, href, variant, arrow, className, project }: { label: string; href: string; variant: ButtonStyle; arrow: boolean; className: string; project?: { title: string; location: string } }) {
  if (href === ENQUIRE_LINK) return <EnquireButton project={project} className={buttonClass(variant, "l", className)}>{label}{arrow && <ArrowRight size={18} aria-hidden />}</EnquireButton>;
  return <ButtonLink href={href} variant={variant} icon={arrow ? undefined : false} className={className} {...(/^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</ButtonLink>;
}

function Shell({ background, children, narrow, center }: { background: SectionBackground; children: React.ReactNode; narrow?: boolean; center?: boolean }) {
  return (
    <section className={`${backgrounds[background]} section-y`}>
      <div className={`container-page ${narrow ? "flex flex-col items-center" : ""}`}>
        <div className={`flex flex-col gap-8 md:gap-10 ${narrow ? "w-full max-w-[760px]" : ""} ${center ? "items-center text-center" : ""}`}>{children}</div>
      </div>
    </section>
  );
}

const slugifyHeading = (value: string) => value.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** Gives every heading of a legal text an anchor, and returns the contents list. */
function withHeadingAnchors(html: string) {
  const toc: { id: string; label: string }[] = [];
  const used = new Set<string>();
  const body = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_match, inner: string) => {
    const label = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim().replace(/\?$/, "");
    let id = slugifyHeading(inner) || `section-${toc.length + 1}`;
    while (used.has(id)) id = `${id}-${toc.length + 1}`;
    used.add(id); toc.push({ id, label });
    return `<h2 id="${id}" class="scroll-mt-28">${inner}</h2>`;
  });
  return { body, toc };
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function ServiceGroup({ services, data, isFirst }: { services: ServiceSection[]; data: LiveData; isFirst: boolean }) {
  const dark = services[0].background === "dark";
  return (
    <section className={`${backgrounds[services[0].background]} section-y`}>
      <div className="container-page flex flex-col gap-16 md:gap-[88px] lg:gap-[120px]">
        {services.map((service, index) => {
          const Tag = isFirst && index === 0 ? "h1" : "h2";
          return (
            <article key={service.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
              <img src={service.image_url} alt="" loading="lazy" className={`h-64 w-full rounded-3xl object-cover md:h-[420px] lg:h-[560px] ${service.image_position === "right" ? "lg:order-2" : ""}`} />
              <div className="flex flex-col gap-5 md:gap-6">
                <Eyebrow dark={dark}>{service.eyebrow}</Eyebrow>
                <Tag className={`t-h2 ${dark ? "text-white" : "text-ink"}`}>{service.title}</Tag>
                {service.text && <p className={`t-body-l ${dark ? "text-slate-300" : "text-ink-muted"}`}>{service.text}</p>}
                {service.includes.length > 0 && (
                  <div className={`flex flex-col gap-3.5 rounded-2xl p-5 md:p-6 ${dark ? "bg-navy-800" : service.background === "light" ? "bg-white" : "bg-ivory-50"}`}>
                    <p className={`t-h6 ${dark ? "text-white" : "text-ink"}`}>What’s included</p>
                    <ul className="flex flex-col gap-3">
                      {service.includes.map((item) => <li key={item} className={`flex items-start gap-3 t-body ${dark ? "text-slate-200" : "text-ink"}`}><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-200 text-gold-700"><Check size={14} /></span>{item}</li>)}
                    </ul>
                  </div>
                )}
                {(service.button_label || service.show_call) && (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {service.button_label && <SmartButton label={service.button_label} href={service.button_href} variant={dark ? "accent" : "primary"} arrow className="w-full sm:w-auto" project={{ title: service.title, location: "" }} />}
                    {service.show_call && <a href={data.site.phoneHref} className={`inline-flex items-center gap-1.5 t-label ${dark ? "text-white hover:text-gold-300" : "text-ink hover:text-gold-700"}`}>Call {data.site.phoneDisplay}<ArrowRight size={16} className="text-gold-500" /></a>}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CardRows({ section, data, tag }: { section: CardsSection; data: LiveData; tag: "h1" | "h2" }) {
  const dark = section.background === "dark";
  return (
    <section className={`${backgrounds[section.background]} section-y`}>
      <div className="container-page flex flex-col gap-14 md:gap-[72px] lg:gap-24">
        {(section.heading || section.eyebrow) && <SectionHeading dark={dark} as={tag} eyebrow={section.eyebrow} title={section.heading} accent={section.accent} lead={section.intro || undefined} />}
        {section.cards.map((card, index) => {
          const match = card.projects ? cardProjectMatch[card.projects] : undefined;
          const featured = match ? data.projects.filter(match).slice(0, 3).map((project) => project.title) : [];
          return (
            <article key={index} className={`grid items-center gap-7 lg:gap-20 ${card.image_url ? "lg:grid-cols-2" : ""}`}>
              {card.image_url && <img src={card.image_url} alt="" loading="lazy" className={`h-60 w-full rounded-3xl object-cover md:h-[400px] lg:h-[440px] ${index % 2 ? "lg:order-2" : ""}`} />}
              <div className="flex flex-col gap-4 md:gap-5">
                <p className={`font-heading text-[30px] leading-none md:text-[40px] ${dark ? "text-gold-400" : "text-gold-700"}`}>{String(index + 1).padStart(2, "0")}</p>
                <h3 className={`t-h3 ${dark ? "text-white" : "text-ink"}`}>{card.title}</h3>
                {card.description && <p className={`t-body-l ${dark ? "text-slate-300" : "text-ink-muted"}`}>{card.description}</p>}
                {featured.length > 0 && <p className={`t-body-s ${dark ? "text-slate-300" : "text-ink-muted"}`}>Featured: <span className={`font-medium ${dark ? "text-white" : "text-ink"}`}>{featured.join(" · ")}</span></p>}
                {card.link && <TextLink href={card.link} dark={dark}>{card.link_label || "Learn more"}</TextLink>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Section({ section, data, index, sections }: { section: PageSection; data: LiveData; index: number; sections: PageSection[] }) {
  const dark = section.background === "dark";
  const isFirst = index === 0;
  const tag = isFirst ? "h1" : "h2";
  const prev = sections[index - 1];
  const next = sections[index + 1];
  switch (section.type) {
    case "hero": {
      const buttons = [
        { label: section.button_label, href: section.button_href },
        { label: section.button2_label ?? "", href: section.button2_href ?? "" },
      ].filter((button) => button.label && button.href);

      if (section.style === "plain") {
        const plainBackground = section.background === "dark" ? "bg-navy-900 on-dark" : section.background === "white" ? "bg-white" : "bg-ivory-100";
        const beforeList = next?.type === "projects_list";
        return (
          <section className={plainBackground}>
            <div className={`container-page flex flex-col ${beforeList ? "gap-5 md:gap-6" : `gap-6 ${section.tight ? "" : "md:gap-7"}`} ${beforeList ? "pb-20 pt-12 md:pb-24 md:pt-[72px]" : `py-12 md:py-[72px] ${section.height === "large" ? "lg:py-24" : ""}`}`}>
              <Eyebrow dark={dark}>{section.eyebrow}</Eyebrow>
              <Title text={section.title} accent={section.accent_title} dark={dark} as={tag} size="t-display" style={{ maxWidth: section.title_width ?? 900 }} />
              {section.subtitle && <p style={{ maxWidth: section.subtitle_width ?? 620 }} className={`t-body-xl ${dark ? "text-slate-300" : "text-ink-muted"}`}>{section.subtitle}</p>}
              {buttons.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {buttons.map((button, position) => <SmartButton key={position} label={button.label} href={button.href} variant={position === 0 ? (dark ? "accent" : "primary") : "outline"} arrow={position === 0 && button.href !== ENQUIRE_LINK} className="w-full sm:w-auto" />)}
                </div>
              )}
            </div>
          </section>
        );
      }

      const featuredProject = section.show_featured ? data.projects.find((project) => project.is_featured) : undefined;
      const featuredHref = data.featuredSlug ? `/projects/${data.featuredSlug}` : "/projects";
      const sizing = {
        full: "min-h-[calc(100vh-4rem)] justify-center py-16 lg:min-h-[calc(100vh-5rem)]",
        large: "min-h-[600px] justify-center py-16 md:min-h-[680px] lg:min-h-[760px]",
        medium: "min-h-[520px] justify-center py-16 md:min-h-[600px]",
        auto: "py-16 md:py-24 lg:py-[120px]",
      }[section.height];
      const overlay = {
        full: "bg-gradient-to-b from-navy-950/90 via-navy-950/75 to-navy-950/90 lg:bg-gradient-to-r lg:from-navy-950 lg:via-navy-950/80 lg:to-navy-950/30",
        large: "bg-gradient-to-b from-navy-950/90 via-navy-950/75 to-navy-950/90 lg:bg-gradient-to-r lg:from-navy-950 lg:via-navy-950/85 lg:to-navy-950/30",
        medium: "bg-gradient-to-b from-navy-950/90 via-navy-950/75 to-navy-950/90 lg:bg-gradient-to-r lg:from-navy-950 lg:via-navy-950/80 lg:to-navy-950/30",
        auto: "bg-gradient-to-b from-navy-950/95 to-navy-950/80 lg:bg-gradient-to-r lg:from-navy-950 lg:via-navy-950/85 lg:to-navy-950/35",
      }[section.height];
      const compact = section.height === "large" || section.height === "auto";
      return (
        <section {...(isFirst ? { "data-nav-overlay": "" } : {})} className={`on-dark relative overflow-hidden bg-navy-950 ${isFirst ? "hero-overlay" : ""}`}>
          {section.image_url && <img src={section.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div aria-hidden className={`absolute inset-0 ${overlay}`} />
          <div className={`container-page relative flex flex-col gap-6 md:gap-7 ${sizing}`}>
            <Eyebrow dark>{section.eyebrow}</Eyebrow>
            <Title text={section.title} accent={section.accent_title} dark as={tag} size={`t-display ${compact ? "max-w-[760px]" : "max-w-[860px]"}`} />
            {section.subtitle && <p className={`t-body-xl text-slate-300 ${compact ? "max-w-[600px]" : "max-w-[620px]"}`}>{section.subtitle}</p>}
            {buttons.length === 1 && <Action label={buttons[0].label} href={buttons[0].href} dark />}
            {buttons.length === 2 && (
              <div className="flex flex-col gap-3 sm:flex-row">
                {buttons.map((button, position) => <SmartButton key={position} label={button.label} href={button.href} variant={position === 0 ? "accent" : "outline-inverse"} arrow={position === 0 && button.href !== ENQUIRE_LINK} className="w-full sm:w-auto" />)}
              </div>
            )}
            {featuredProject && (
              <Link href={featuredHref} className="group mt-4 flex max-w-[380px] items-center gap-4 rounded-2xl border border-white/15 bg-navy-900/70 p-3 pr-5 backdrop-blur-md transition-colors hover:border-white/30 lg:absolute lg:bottom-16 lg:right-[120px] lg:mt-0">
                <img src={featuredProject.image_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                <span className="flex min-w-0 flex-col gap-1">
                  {featuredProject.status && <Badge tone="gold" className="self-start">{featuredProject.status}</Badge>}
                  <span className="t-h6 text-white">{featuredProject.title}</span>
                  <span className="inline-flex items-center gap-1 t-body-s text-slate-300">View project<ArrowRight size={14} className="text-gold-400 transition-transform group-hover:translate-x-0.5" /></span>
                </span>
              </Link>
            )}
          </div>
        </section>
      );
    }

    case "text":
      return (
        <Shell background={section.background} narrow center={section.align === "center"}>
          <div className={`flex flex-col gap-5 ${section.align === "center" ? "items-center" : ""}`}>
            <Eyebrow dark={dark}>{section.eyebrow}</Eyebrow>
            <Title text={section.heading} dark={dark} as={tag} />
          </div>
          {section.body && <div className={`prose-site ${dark ? "prose-dark" : ""} w-full ${section.align === "center" ? "text-center" : "text-left"}`} dangerouslySetInnerHTML={{ __html: section.body }} />}
        </Shell>
      );

    case "image_text":
      return (
        <section className={`${backgrounds[section.background]} section-y`}>
          <div className="container-page grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
            <img src={section.image_url} alt={section.image_alt} loading="lazy" className={`h-64 w-full rounded-3xl object-cover md:h-[420px] lg:h-[520px] ${section.image_position === "left" ? "" : "lg:order-2"}`} />
            <div className="flex flex-col gap-5 md:gap-6">
              <Eyebrow dark={dark}>{section.eyebrow}</Eyebrow>
              <Title text={section.heading} accent={section.accent_heading} dark={dark} as={tag} />
              {section.body && <div className={`prose-site ${dark ? "prose-dark" : ""}`} dangerouslySetInnerHTML={{ __html: section.body }} />}
              {section.tagline && <p className={`t-h6 ${dark ? "text-white" : "text-ink"}`}>{section.tagline}</p>}
              <Action label={section.button_label} href={section.button_href} dark={dark} />
            </div>
          </div>
        </section>
      );

    case "gallery": {
      const columns = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "grid-cols-2 lg:grid-cols-4" }[section.columns];
      if (!section.images.length && !section.heading) return null;
      return (
        <Shell background={section.background}>
          <Title text={section.heading} dark={dark} as={tag} />
          <ul className={`grid grid-cols-1 gap-3 md:gap-4 ${columns}`}>
            {section.images.map((image, position) => (
              <li key={`${image.src}-${position}`}>
                <a href={image.src} target="_blank" rel="noopener noreferrer" className="group block aspect-[4/3] overflow-hidden rounded-2xl bg-ivory-100">
                  <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                </a>
              </li>
            ))}
          </ul>
        </Shell>
      );
    }

    case "cards":
      if (section.layout === "rows") return <CardRows section={section} data={data} tag={tag} />;
      return (
        <Shell background={section.background}>
          {(section.heading || section.intro || section.eyebrow) && (
            <div className="flex max-w-[760px] flex-col gap-4">
              {section.eyebrow && <Eyebrow dark={dark}>{section.eyebrow}</Eyebrow>}
              <Title text={section.heading} accent={section.accent} dark={dark} as={tag} />
              {section.intro && <p className={`t-body-l ${dark ? "text-slate-300" : "text-ink-muted"}`}>{section.intro}</p>}
            </div>
          )}
          <div className={`grid gap-5 md:gap-6 ${section.cards.length === 1 ? "max-w-md" : section.cards.length === 2 ? "md:grid-cols-2" : section.cards.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {section.cards.map((card, position) => {
              const body = (
                <div className={`group flex h-full flex-col overflow-hidden rounded-[20px] border transition-shadow hover:shadow-[var(--shadow-card)] ${dark ? "border-navy-700 bg-navy-800/60" : "border-line bg-white"}`}>
                  {card.image_url && <div className="aspect-[16/10] overflow-hidden bg-ivory-100"><img src={card.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></div>}
                  <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
                    <h3 className={`t-h5 ${dark ? "text-white" : "text-ink"}`}>{card.title}</h3>
                    {card.description && <p className={`t-body-s ${dark ? "text-slate-300" : "text-ink-muted"}`}>{card.description}</p>}
                    {card.link && <span className={`mt-auto inline-flex items-center gap-1.5 pt-2 t-label ${dark ? "text-white" : "text-ink"}`}>{card.link_label || "Learn more"}<ArrowRight size={16} className={`transition-transform group-hover:translate-x-0.5 ${dark ? "text-gold-400" : "text-gold-500"}`} /></span>}
                  </div>
                </div>
              );
              return card.link ? <SectionLink key={position} href={card.link} className="block h-full">{body}</SectionLink> : <div key={position}>{body}</div>;
            })}
          </div>
        </Shell>
      );

    case "stats": {
      const items = section.items.map((item) => liveFigure(item.value, item.label, data.projects)).filter((item): item is { value: string; label: string } => item !== null);
      if (!items.length) return null;
      if (section.layout === "strip") {
        return (
          <section aria-label={section.heading || "At a glance"} className={`border-b ${dark ? "border-navy-700" : "border-line"} ${backgrounds[section.background]}`}>
            {section.heading && <div className="container-page pt-10 md:pt-12"><Title text={section.heading} dark={dark} as={tag} /></div>}
            <dl className="container-page grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-4 md:py-12">
              {items.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <dt className={`order-2 t-body-s ${dark ? "text-slate-300" : "text-ink-muted"}`}>{item.label}</dt>
                  <dd className={`order-1 font-heading text-[40px] leading-[48px] md:text-[52px] md:leading-[60px] ${dark ? "text-gold-400" : "text-gold-700"}`}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      }
      return (
        <section className={`${backgrounds[section.background]} py-12 md:py-[72px]`}>
          <div className="container-page flex flex-col gap-8">
            <Title text={section.heading} dark={dark} as={tag} />
            <dl className={`grid grid-cols-2 gap-x-6 gap-y-8 ${items.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
              {items.map((item, position) => (
                <div key={position} className="flex flex-col gap-1.5">
                  <dt className={`order-2 t-body-s ${dark ? "text-slate-300" : "text-ink-muted"}`}>{item.label}</dt>
                  <dd className={`order-1 font-heading text-[40px] leading-[48px] md:text-[52px] md:leading-[60px] ${dark ? "text-gold-400" : "text-gold-700"}`}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      );
    }

    case "video": {
      const embed = toVideoEmbedUrl(section.url);
      if (!embed) return null;
      return (
        <Shell background={section.background}>
          <Title text={section.heading} dark={dark} as={tag} />
          <div className="relative aspect-video overflow-hidden rounded-[20px] bg-navy-950 shadow-[var(--shadow-card)] md:rounded-3xl">
            <iframe src={embed} title={section.heading || "Video"} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" loading="lazy" />
          </div>
          {section.caption && <p className={`t-body-s ${dark ? "text-slate-400" : "text-ink-muted"}`}>{section.caption}</p>}
        </Shell>
      );
    }

    case "faq":
      if (section.layout === "side") {
        return (
          <section className={`${backgrounds[section.background]} section-y`}>
            <div className="container-page grid gap-8 lg:grid-cols-[400px_1fr] lg:gap-24">
              <SectionHeading dark={dark} as={tag} eyebrow={section.eyebrow} title={section.heading} accent={section.accent} lead={section.intro || undefined} />
              <Faq items={section.items} dark={dark} />
            </div>
          </section>
        );
      }
      return (
        <Shell background={section.background} narrow>
          {section.eyebrow && <Eyebrow dark={dark}>{section.eyebrow}</Eyebrow>}
          <Title text={section.heading} accent={section.accent} dark={dark} as={tag} />
          {section.intro && <p className={`t-body-l ${dark ? "text-slate-300" : "text-ink-muted"}`}>{section.intro}</p>}
          <div className="w-full"><Faq items={section.items} dark={dark} /></div>
        </Shell>
      );

    case "cta": {
      if (section.style === "band") {
        // The band has no background of its own; give it room when the section above is coloured.
        const needsTop = !prev || prev.background !== "white" || (prev.type === "hero" && prev.style !== "plain");
        return <CtaBand eyebrow={section.eyebrow || "Talk to an advisor"} title={section.heading} accent={section.accent} text={section.text} className={needsTop ? "pt-16 md:pt-[88px] lg:pt-[112px]" : ""} />;
      }
      if (section.style === "strip") {
        return (
          <section className={`${backgrounds[section.background]} pt-16 md:pt-[88px] lg:pt-[112px] ${next ? "" : "pb-16 md:pb-[88px] lg:pb-[112px]"}`}>
            <div className="container-page">
              <div className={`flex flex-col gap-6 rounded-3xl p-6 md:p-10 lg:flex-row lg:items-center lg:justify-between lg:px-12 ${dark ? "bg-navy-800" : section.background === "light" ? "bg-white" : "bg-ivory-100"}`}>
                <div className="flex items-center gap-5">
                  <span className={`hidden h-16 w-16 shrink-0 items-center justify-center rounded-full sm:flex ${dark ? "bg-navy-900 text-gold-400" : "bg-white text-gold-500"}`}><SectionIcon name={section.icon ?? "globe"} size={28} /></span>
                  <div className="flex flex-col gap-2"><Title text={section.heading} accent={section.accent} dark={dark} as={tag} size="t-h4" />{section.text && <p className={`t-body ${dark ? "text-slate-300" : "text-ink-muted"}`}>{section.text}</p>}</div>
                </div>
                {section.button_label && section.button_href && <SmartButton label={section.button_label} href={section.button_href} variant={dark ? "accent" : "primary"} arrow={false} className="w-full lg:w-auto" />}
              </div>
            </div>
          </section>
        );
      }
      return (
        <section className={`${backgrounds[section.background]} py-16 md:py-[88px]`}>
          <div className="container-page flex flex-col items-center gap-6 text-center">
            <Title text={section.heading} accent={section.accent} dark={dark} as={tag} center className="max-w-[760px]" />
            {section.text && <p className={`t-body-l max-w-[620px] ${dark ? "text-slate-300" : "text-ink-muted"}`}>{section.text}</p>}
            <div className="flex justify-center"><Action label={section.button_label} href={section.button_href} dark={dark} /></div>
          </div>
        </section>
      );
    }

    case "contact_form":
      return (
        <section className={`${backgrounds[section.background]} section-y`}>
          <div className="container-page grid gap-8 lg:grid-cols-[1fr_520px] lg:gap-20">
            <div className="flex flex-col gap-4">
              <Title text={section.heading} dark={dark} as={tag} />
              {section.intro && <p className={`t-body-l ${dark ? "text-slate-300" : "text-ink-muted"}`}>{section.intro}</p>}
            </div>
            <ContactForm title="Request a call back" compact />
          </div>
        </section>
      );

    case "icon_cards": {
      if (!section.cards.length && !section.heading) return null;
      const button = section.button_label && section.button_href
        ? <div className="pt-2"><SmartButton label={section.button_label} href={section.button_href} variant={dark ? "accent" : "primary"} arrow className="" /></div>
        : null;
      const heading = <SectionHeading dark={dark} as={tag} eyebrow={section.eyebrow} title={section.heading} accent={section.accent} lead={section.intro || undefined}>{button}</SectionHeading>;
      if (section.style === "list") {
        return (
          <section className={`${backgrounds[section.background]} section-y`}>
            <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              {heading}
              <ul className="grid gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12">
                {section.cards.map((card, position) => {
                  const inner = <><IconCircle size={44} tone={dark ? "navy" : "soft"}><SectionIcon name={card.icon} size={20} /></IconCircle><h3 className={`t-h6 ${dark ? "text-white" : "text-ink"}`}>{card.title}</h3>{card.text && <p className={`t-body-s ${dark ? "text-slate-300" : "text-ink-muted"}`}>{card.text}</p>}</>;
                  return <li key={position} className="flex flex-col gap-3">{card.link ? <SectionLink href={card.link} className="flex flex-col gap-3 hover:opacity-90">{inner}</SectionLink> : inner}</li>;
                })}
              </ul>
            </div>
          </section>
        );
      }
      const four = section.cards.length === 4 || section.cards.length === 8;
      if (section.style === "steps") {
        return (
          <section className={`${backgrounds[section.background]} section-y`}>
            <div className="container-page flex flex-col gap-10 md:gap-12">
              {heading}
              <ol className={`grid gap-5 sm:grid-cols-2 ${four ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                {section.cards.map((card, position) => (
                  <li key={position} className={`flex flex-col gap-4 rounded-[20px] p-6 md:p-7 ${dark ? "bg-navy-800" : section.background === "light" ? "bg-white" : "bg-ivory-50"}`}>
                    <div className="flex items-center justify-between"><IconCircle tone={dark ? "dark" : "soft"}><SectionIcon name={card.icon} /></IconCircle><span className={`font-heading text-[30px] leading-none ${dark ? "text-gold-400" : "text-gold-700"}`}>{String(position + 1).padStart(2, "0")}</span></div>
                    <h3 className={`t-h5 ${dark ? "text-white" : "text-ink"}`}>{card.title}</h3>
                    {card.text && <p className={`t-body-s ${dark ? "text-slate-300" : "text-ink-muted"}`}>{card.text}</p>}
                    {card.link && <TextLink href={card.link} dark={dark}>Learn more</TextLink>}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      }
      return (
        <section className={`${backgrounds[section.background]} section-y`}>
          <div className="container-page flex flex-col gap-10 md:gap-12">
            {heading}
            <div className={`grid gap-5 ${four ? "sm:grid-cols-2 lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {section.cards.map((card, position) => {
                const content = (
                  <>
                    <IconCircle tone={dark ? "dark" : "soft"}><SectionIcon name={card.icon} /></IconCircle>
                    <h3 className={`t-h4 ${dark ? "text-white" : "text-ink"}`}>{card.title}</h3>
                    {card.text && <p className={`t-body-s ${dark ? "text-slate-300" : "text-ink-muted"}`}>{card.text}</p>}
                    {card.link && <span className={`mt-auto inline-flex items-center gap-1.5 t-label ${dark ? "text-white" : "text-ink"}`}>Learn more<ArrowRight size={16} className={`transition-transform group-hover:translate-x-0.5 ${dark ? "text-gold-400" : "text-gold-500"}`} /></span>}
                  </>
                );
                const cls = dark
                  ? "group flex flex-col gap-5 rounded-[20px] border border-navy-700 bg-navy-800/60 p-7 transition-colors hover:border-gold-400/60 md:p-8"
                  : `group flex flex-col gap-4 rounded-[20px] border border-line p-7 transition-colors ${card.link ? "hover:border-gold-400" : ""} ${section.background === "white" ? "bg-ivory-50" : "bg-white"}`;
                return card.link ? <SectionLink key={position} href={card.link} className={cls}>{content}</SectionLink> : <div key={position} className={cls}>{content}</div>;
              })}
            </div>
          </div>
        </section>
      );
    }

    case "service":
      return null; // Rendered in groups by PageSections so consecutive services share one block.

    case "legal_text": {
      const { body, toc } = withHeadingAnchors(section.body);
      const Heading = tag;
      return (
        <>
          <section className="bg-ivory-100">
            <div className="container-page flex flex-col gap-4 py-12 md:py-[72px]">
              <Eyebrow>{section.eyebrow}</Eyebrow>
              <Heading className="t-h1 text-ink">{section.heading}</Heading>
              {section.updated && <p className="t-body-s text-ink-muted">Last updated: {section.updated}</p>}
            </div>
          </section>
          <section className="bg-white pb-16 pt-10 md:pb-[112px] md:pt-[72px]">
            <div className={`container-page grid gap-12 lg:gap-24 ${toc.length ? "lg:grid-cols-[280px_minmax(0,760px)]" : ""}`}>
              {toc.length > 0 && (
                <nav aria-label="Contents" className="hidden lg:block">
                  <div className="sticky top-28 flex flex-col gap-3">
                    <p className="t-overline text-ink-muted">Contents</p>
                    <ol className="flex flex-col gap-1">
                      {toc.map((item) => <li key={item.id}><a href={`#${item.id}`} className="block border-l-2 border-line py-1 pl-3 t-body-s text-ink-muted hover:border-gold-400 hover:text-ink">{item.label}</a></li>)}
                    </ol>
                  </div>
                </nav>
              )}
              <div className="prose-site max-w-[760px] [&>p:first-child]:t-body-xl [&>p:first-child]:text-ink [&_a]:border-b [&_a]:border-brand-champagne/30 [&_a]:text-brand-champagne [&_a]:transition-colors [&_a:hover]:border-brand-champagne" dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          </section>
        </>
      );
    }

    case "projects": {
      const projects = data.projects.filter(projectFilters[section.filter]);
      if (!projects.length) return null;
      return (
        <section className={`${backgrounds[section.background]} section-y`}>
          <div className="container-page flex flex-col gap-8 md:gap-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading dark={dark} as={tag} eyebrow={section.eyebrow} title={section.heading} accent={section.accent} lead={section.intro || undefined} />
              {section.button_label && <ButtonLink href="/projects" variant={dark ? "outline-inverse" : "outline"} size="m" className="self-start md:self-auto">{section.button_label}</ButtonLink>}
            </div>
            <HomePortfolio projects={projects} limit={section.limit} />
          </div>
        </section>
      );
    }

    case "featured_project": {
      const featured = data.featured;
      const featuredProject = data.projects.find((project) => project.is_featured);
      const featuredHref = data.featuredSlug ? `/projects/${data.featuredSlug}` : "/projects";
      const brochure = featured.documents[0];
      const background = section.background === "light" ? "bg-ivory-100" : backgrounds[section.background];
      return (
        <section className={`${background} section-y`}>
          <div className="container-page grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <div className="grid h-[320px] grid-cols-[1.6fr_1fr] gap-3 sm:h-[440px] md:gap-4 lg:h-[560px]">
              <img src={featured.home.cardImage} alt={featured.home.cardTitle} className="h-full w-full rounded-[20px] object-cover" />
              <div className="grid grid-rows-2 gap-3 md:gap-4">
                {[featured.home.galleryImages[0], featured.home.galleryImages[1]].map((src, position) => <img key={position} src={src || featured.home.cardImage} alt="" className="h-full w-full rounded-[20px] object-cover" />)}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-2">
                {featuredProject?.status && <Badge tone="navy">{featuredProject.status}</Badge>}
                {featured.home.tags.map((item) => <Badge key={item} tone="gold">{item}</Badge>)}
              </div>
              <Eyebrow dark={dark}>{featured.home.eyebrow || "Featured project"}</Eyebrow>
              <Heading2 as={tag} dark={dark}><Accented text={`${featured.hero.title} ${featured.hero.accentTitle}`.trim()} accent={featured.hero.accentTitle} />{featured.hero.location ? `, ${featured.hero.location.split(",")[0]}` : ""}</Heading2>
              <p className={`t-body-l ${dark ? "text-slate-300" : "text-ink-muted"}`}>{featured.home.cardDescription || featured.home.description}</p>
              {featured.sidebar.items.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {featured.sidebar.items.map((item) => <li key={item} className={`flex items-start gap-3 t-body ${dark ? "text-slate-200" : "text-ink"}`}><Check size={18} className="mt-1 shrink-0 text-gold-500" />{item}</li>)}
                </ul>
              )}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <ButtonLink href={featuredHref} variant={dark ? "accent" : "primary"}>{section.button_label || "Explore project"}</ButtonLink>
                {brochure && section.brochure_label && <ButtonLink href={brochure.url} target="_blank" rel="noopener noreferrer" variant={dark ? "outline-inverse" : "outline"} icon={<Download size={18} />}>{section.brochure_label}</ButtonLink>}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "press": {
      const clippings = data.press.slice(0, section.limit);
      if (!clippings.length) return null;
      return (
        <section className={`${backgrounds[section.background]} section-y`}>
          <div className="container-page flex flex-col gap-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading dark={dark} as={tag} eyebrow={section.eyebrow} title={section.heading} accent={section.accent} />
              {section.link_label && <TextLink href="/media" dark={dark}>{section.link_label}</TextLink>}
            </div>
            <PressGrid clippings={clippings} />
          </div>
        </section>
      );
    }

    case "articles": {
      const blogs = data.blogs.slice(0, section.limit);
      if (!blogs.length) return null;
      return (
        <section className={`${backgrounds[section.background]} section-y`}>
          <div className="container-page flex flex-col gap-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading dark={dark} as={tag} eyebrow={section.eyebrow} title={section.heading} accent={section.accent} />
              {section.link_label && <TextLink href="/blog" dark={dark}>{section.link_label}</TextLink>}
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => <ArticleCard key={blog.slug} blog={blog} />)}
            </div>
          </div>
        </section>
      );
    }

    case "projects_list": {
      const developer = data.params.developer === "hpg" || data.params.developer === "partner" ? data.params.developer : "all";
      const kind = data.params.type === "residential" || data.params.type === "commercial" ? data.params.type : "all";
      return (
        <section className="pb-16 md:pb-[88px] lg:pb-[112px]">
          <div className="container-page">
            <ProjectsBrowser projects={data.projects} initialDeveloper={developer} initialKind={kind} />
          </div>
        </section>
      );
    }

    case "press_list": {
      const initialProject = data.params.project ?? "";
      const featured = !initialProject ? data.press.find((item) => item.media_type === "video") : undefined;
      const email = data.site.email;
      return (
        <section className="bg-white pb-16 pt-10 md:pb-[88px] md:pt-14 lg:pb-[112px]">
          <div className="container-page flex flex-col gap-12 md:gap-16">
            {featured && <PressFeature clipping={featured} />}
            {data.press.length
              ? <div><PressBrowser clippings={data.press} projects={data.pressProjects} initialProject={initialProject} /></div>
              : <p className="rounded-[20px] border border-dashed border-line-strong py-16 text-center t-body text-ink-muted">Press coverage will appear here soon.</p>}
            {section.show_contact && (
              <div className="flex flex-col gap-6 rounded-3xl bg-ivory-50 p-6 md:p-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
                <div className="flex items-center gap-5">
                  <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-gold-500 sm:flex"><Mail size={26} /></span>
                  <div className="flex flex-col gap-2"><h2 className="t-h4 text-ink">{section.contact_heading}</h2>{section.contact_text && <p className="t-body text-ink-muted">{section.contact_text.replace(/\{email\}/g, email)}</p>}</div>
                </div>
                {section.contact_button && <a href={`mailto:${email}?subject=Press%20enquiry`} className={buttonClass("primary", "l", "w-full lg:w-auto")}>{section.contact_button}</a>}
              </div>
            )}
          </div>
        </section>
      );
    }

    case "articles_list":
      return (
        <section className="bg-white pb-16 pt-8 md:pb-[88px] md:pt-12 lg:pb-[112px]">
          <div className="container-page"><JournalBrowser blogs={data.blogs} /></div>
        </section>
      );

    case "contact_details": {
      const site = data.site;
      const channels = [
        { icon: <Phone size={22} />, label: "Call us", value: site.phoneDisplay, action: "Call now", href: site.phoneHref, external: false },
        { icon: <WhatsAppIcon size={22} />, label: "WhatsApp", value: site.whatsapp_number || site.phoneDisplay, action: "Start chat", href: site.whatsappHref, external: true },
        { icon: <Mail size={22} />, label: "Email", value: site.email, action: "Write to us", href: `mailto:${site.email}`, external: false },
      ];
      const rows = [
        { icon: <MapPin size={20} />, label: "Address", value: site.addressLines.join(" ") },
        ...(section.response_text ? [{ icon: <Clock size={20} />, label: "Response time", value: section.response_text }] : []),
        ...(section.visits_text ? [{ icon: <CalendarDays size={20} />, label: "Site visits", value: section.visits_text }] : []),
      ];
      return (
        <>
          <section className="bg-white pt-8 md:pt-14">
            <ul className="container-page grid gap-3 md:gap-6 lg:grid-cols-3">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a href={channel.href} {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex h-full flex-col gap-3 rounded-[20px] border border-line p-5 transition-colors hover:border-gold-400 md:p-7">
                    <span className="flex items-center gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-200 text-gold-700">{channel.icon}</span>
                      <span className="flex min-w-0 flex-col"><span className="text-[13px] text-ink-muted">{channel.label}</span><span className="break-words t-h6 text-ink">{channel.value}</span></span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 t-label text-ink group-hover:text-gold-700">{channel.action}<ArrowRight size={16} className="text-gold-500" /></span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section className="bg-white pb-16 pt-10 md:pb-[88px] md:pt-[72px] lg:pb-[112px]">
            <div className="container-page grid items-start gap-8 lg:grid-cols-[1fr_440px] lg:gap-12">
              <ContactForm />
              <div className="flex flex-col gap-6">
                {site.mapsHref && (
                  <a href={site.mapsHref} target="_blank" rel="noopener noreferrer" className="group relative block h-56 overflow-hidden rounded-[20px] bg-[#ede9e1] md:h-64" aria-label="Open our office location in Google Maps">
                    <svg aria-hidden viewBox="0 0 440 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full"><g stroke="#fff" strokeWidth="10" fill="none"><path d="M-20 60 L470 150" /><path d="M-20 200 L470 120" /><path d="M120 -20 L180 290" /><path d="M300 -20 L250 290" /><path d="M-20 250 L200 -20" opacity=".6" /></g></svg>
                    <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-navy-900 text-gold-400 shadow-[var(--shadow-card)]"><MapPin size={24} /></span>
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-ink shadow-[var(--shadow-soft)] group-hover:text-gold-700">Open in Google Maps<ExternalLink size={14} /></span>
                  </a>
                )}
                <div className="flex flex-col gap-5 rounded-[20px] bg-ivory-50 p-6 md:p-7">
                  <h2 className="t-h4 text-ink">{section.office_heading || "Head office"}</h2>
                  <dl className="flex flex-col gap-4">
                    {rows.map((row) => (
                      <div key={row.label} className="flex gap-3.5">
                        <span className="mt-0.5 shrink-0 text-gold-500">{row.icon}</span>
                        <div><dt className="text-[13px] text-ink-muted">{row.label}</dt><dd className="t-body text-ink">{row.value}</dd></div>
                      </div>
                    ))}
                  </dl>
                  {site.mapsHref && <a href={site.mapsHref} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "m", "self-start")}>Get directions<ArrowRight size={16} aria-hidden /></a>}
                </div>
              </div>
            </div>
          </section>
        </>
      );
    }
  }
}

function Heading2({ as: Tag, dark, children }: { as: "h1" | "h2"; dark: boolean; children: React.ReactNode }) {
  return <Tag className={`t-h2 ${dark ? "text-white" : "text-ink"}`}>{children}</Tag>;
}

/** Renders page-builder sections; live sections load their projects, press and articles here. */
export async function PageSections({ sections, searchParams = {} }: { sections: PageSection[]; searchParams?: Record<string, string | undefined> }) {
  const data = await loadLiveData(sections, searchParams);
  const blocks: React.ReactNode[] = [];
  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    if (section.type === "service") {
      // Consecutive services on the same background share one block, like the original Services page.
      const group: ServiceSection[] = [section];
      while (sections[index + 1]?.type === "service" && sections[index + 1].background === section.background) group.push(sections[++index] as ServiceSection);
      blocks.push(<ServiceGroup key={section.id} services={group} data={data} isFirst={index - group.length + 1 === 0} />);
      continue;
    }
    blocks.push(<Section key={section.id} section={section} data={data} index={index} sections={sections} />);
  }
  return <>{blocks}</>;
}
