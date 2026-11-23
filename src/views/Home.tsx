import Link from "next/link";
import { ArrowRight, Check, Download, FileText, KeyRound, LandPlot, ShieldCheck, TrendingUp, UserRoundCheck } from "lucide-react";
import type { BlogEntry } from "../data/blogData";
import type { FeaturedProjectContent } from "../data/featuredProject";
import type { PressClipping } from "../data/press";
import type { PublicProject } from "../data/projects";
import { Accented, Badge, ButtonLink, Eyebrow, IconCircle, SectionHeading, TextLink, buttonClass } from "../components/site/ui";
import { EnquireButton } from "../components/site/EnquiryProvider";
import { CtaBand } from "../components/site/CtaBand";
import { PressGrid } from "../components/press/PressGrid";
import { ArticleCard } from "../components/site/ArticleCard";
import { HomePortfolio } from "../components/projects/HomePortfolio";

interface HomeProps {
  latestBlogs: BlogEntry[];
  projects: PublicProject[];
  featured: FeaturedProjectContent;
  featuredSlug: string | null;
  press: PressClipping[];
}

const services = [
  { icon: <TrendingUp size={22} />, title: "Investment management", text: "End-to-end advisory for individuals and organisations — sourcing, due diligence and acquisition of assets built for steady cash flow and appreciation.", href: "/services" },
  { icon: <KeyRound size={22} />, title: "Property management strategy", text: "Maintenance, tenant relations and yield optimisation, so your property stays secure, occupied and future-ready.", href: "/services" },
  { icon: <LandPlot size={22} />, title: "Strategic plots & land", text: "Plots chosen for long-term growth, backed by our property management services after purchase.", href: "/investments" },
];

const reasons = [
  { icon: <ShieldCheck size={20} />, title: "Curated, verified projects", text: "Our own developments and handpicked partner projects across NCR and Uttarakhand." },
  { icon: <TrendingUp size={20} />, title: "Investment-first advice", text: "Guidance on yield, appreciation and exit — not just the brochure." },
  { icon: <UserRoundCheck size={20} />, title: "One dedicated advisor", text: "A single point of contact from your first site visit to handover." },
  { icon: <FileText size={20} />, title: "Clear documentation", text: "Brochures, price lists and floor plans shared upfront, in writing." },
];

export function Home({ latestBlogs, projects, featured, featuredSlug, press }: HomeProps) {
  const featuredProject = projects.find((project) => project.is_featured);
  const featuredHref = featuredSlug ? `/projects/${featuredSlug}` : "/projects";
  const brochure = featured.documents[0];
  const hpg = projects.filter((project) => project.portfolio_category === "hpg").length;
  const partner = projects.length - hpg;
  const stats = [
    ...(projects.length ? [{ value: String(projects.length), label: "Projects in our portfolio" }] : []),
    ...(hpg ? [{ value: String(hpg), label: hpg === 1 ? "HPG development" : "HPG developments" }] : []),
    ...(partner ? [{ value: String(partner), label: "Partner projects" }] : []),
    { value: "24h", label: "Response to every enquiry" },
  ];

  return (
    <>
      {/* Hero */}
      <section data-nav-overlay className="hero-overlay on-dark relative overflow-hidden bg-navy-950">
        <img src="/hero_banner_real_estate_1774769760013.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-navy-950/90 via-navy-950/75 to-navy-950/90 lg:bg-gradient-to-r lg:from-navy-950 lg:via-navy-950/85 lg:to-navy-950/30" />
        <div className="container-page relative flex min-h-[600px] flex-col justify-center gap-6 py-16 md:min-h-[680px] md:gap-7 lg:min-h-[760px]">
          <Eyebrow dark>Premier real estate · NCR &amp; Uttarakhand</Eyebrow>
          <h1 className="t-display max-w-[760px] text-white">Shaping the <span className="accent">future</span> of real estate</h1>
          <p className="t-body-xl max-w-[600px] text-slate-300">Curated residential and commercial investments — with one trusted advisor from shortlist to handover. Partner in vision, invest in growth.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/projects" variant="accent" className="w-full sm:w-auto">Explore projects</ButtonLink>
            <EnquireButton className={buttonClass("outline-inverse", "l", "w-full sm:w-auto")}>Book a consultation</EnquireButton>
          </div>
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

      {/* Key figures from the portfolio */}
      <section aria-label="At a glance" className="border-b border-line bg-white">
        <dl className="container-page grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-4 md:py-12">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <dt className="order-2 t-body-s text-ink-muted">{stat.label}</dt>
              <dd className="order-1 font-heading text-[40px] leading-[48px] text-gold-700 md:text-[52px] md:leading-[60px]">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Featured project */}
      <section className="bg-ivory-100 section-y">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div className="grid h-[320px] grid-cols-[1.6fr_1fr] gap-3 sm:h-[440px] md:gap-4 lg:h-[560px]">
            <img src={featured.home.cardImage} alt={featured.home.cardTitle} className="h-full w-full rounded-[20px] object-cover" />
            <div className="grid grid-rows-2 gap-3 md:gap-4">
              {[featured.home.galleryImages[0], featured.home.galleryImages[1]].map((src, index) => <img key={index} src={src || featured.home.cardImage} alt="" className="h-full w-full rounded-[20px] object-cover" />)}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {featuredProject?.status && <Badge tone="navy">{featuredProject.status}</Badge>}
              {featured.home.tags.map((tag) => <Badge key={tag} tone="gold">{tag}</Badge>)}
            </div>
            <Eyebrow>{featured.home.eyebrow || "Featured project"}</Eyebrow>
            <h2 className="t-h2 text-ink"><Accented text={`${featured.hero.title} ${featured.hero.accentTitle}`.trim()} accent={featured.hero.accentTitle} />{featured.hero.location ? `, ${featured.hero.location.split(",")[0]}` : ""}</h2>
            <p className="t-body-l text-ink-muted">{featured.home.cardDescription || featured.home.description}</p>
            {featured.sidebar.items.length > 0 && (
              <ul className="flex flex-col gap-3">
                {featured.sidebar.items.map((item) => <li key={item} className="flex items-start gap-3 t-body text-ink"><Check size={18} className="mt-1 shrink-0 text-gold-500" />{item}</li>)}
              </ul>
            )}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <ButtonLink href={featuredHref} variant="primary">Explore project</ButtonLink>
              {brochure && <ButtonLink href={brochure.url} target="_blank" rel="noopener noreferrer" variant="outline" icon={<Download size={18} />}>Download brochure</ButtonLink>}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      {projects.length > 0 && (
        <section className="bg-white section-y">
          <div className="container-page flex flex-col gap-8 md:gap-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Our portfolio" title="Landmark projects across NCR & Uttarakhand" accent="Landmark" lead="HPG developments and handpicked partner projects — residential and commercial." />
              <ButtonLink href="/projects" variant="outline" size="m" className="self-start md:self-auto">View all projects</ButtonLink>
            </div>
            <HomePortfolio projects={projects} />
          </div>
        </section>
      )}

      {/* Services */}
      <section className="on-dark bg-navy-900 section-y">
        <div className="container-page flex flex-col gap-10 md:gap-12">
          <SectionHeading dark eyebrow="What we do" title="Bespoke solutions for every kind of investor" accent="every" lead="From first-time buyers to institutional investors, we unlock the potential of your property with dedicated strategy and management." />
          <div className="grid gap-5 lg:grid-cols-3">
            {services.map((service) => (
              <Link key={service.title} href={service.href} className="group flex flex-col gap-5 rounded-[20px] border border-navy-700 bg-navy-800/60 p-7 transition-colors hover:border-gold-400/60 md:p-8">
                <IconCircle tone="dark">{service.icon}</IconCircle>
                <h3 className="t-h4 text-white">{service.title}</h3>
                <p className="t-body-s text-slate-300">{service.text}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 t-label text-white">Learn more<ArrowRight size={16} className="text-gold-400 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-white section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading eyebrow="Why HP Global Infrra" title="Advice you can build a future on" accent="build" lead="We’re investors first — every recommendation is backed by research, transparency and long-term thinking.">
            <div className="pt-2"><EnquireButton className={buttonClass("primary", "l")}>Talk to an advisor<ArrowRight size={18} aria-hidden /></EnquireButton></div>
          </SectionHeading>
          <ul className="grid gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12">
            {reasons.map((reason) => (
              <li key={reason.title} className="flex flex-col gap-3">
                <IconCircle size={44}>{reason.icon}</IconCircle>
                <h3 className="t-h6 text-ink">{reason.title}</h3>
                <p className="t-body-s text-ink-muted">{reason.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Press */}
      {press.length > 0 && (
        <section className="bg-ivory-50 section-y">
          <div className="container-page flex flex-col gap-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="In the news" title="What the press is saying" accent="press" />
              <TextLink href="/media">All coverage</TextLink>
            </div>
            <PressGrid clippings={press} />
          </div>
        </section>
      )}

      {/* Journal */}
      {latestBlogs.length > 0 && (
        <section className="bg-white section-y">
          <div className="container-page flex flex-col gap-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="The Journal" title="Market insights & company news" accent="insights" />
              <TextLink href="/blog">Read the journal</TextLink>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestBlogs.slice(0, 3).map((blog) => <ArticleCard key={blog.slug} blog={blog} />)}
            </div>
          </div>
        </section>
      )}

      <CtaBand eyebrow="Book a consultation" title="Let’s find your next landmark investment" accent="landmark" text="Speak to an advisor today — we respond to every enquiry within 24 hours." />
    </>
  );
}
