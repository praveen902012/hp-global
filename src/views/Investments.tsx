import { CalendarDays, FileText, Globe, KeyRound, Search } from "lucide-react";
import type { PublicProject } from "../data/projects";
import { ButtonLink, Eyebrow, IconCircle, SectionHeading, TextLink, buttonClass } from "../components/site/ui";
import { EnquireButton } from "../components/site/EnquiryProvider";
import { CtaBand } from "../components/site/CtaBand";
import { Faq } from "../components/site/Faq";

const categories = [
  { title: "High-end projects", text: "Engage with signature high-end projects that set new benchmarks in luxury and impact. From concept to completion, we pave the way for extraordinary real estate ventures.", image: "/hero_banner_real_estate_1774769760013.png", href: "/projects?type=residential", match: (project: PublicProject) => project.project_type === "residential" && /cr/i.test(project.price) },
  { title: "Premium strategic plots with property management", text: "Explore strategic plots designed with a focus on long-term growth and sustainability. With our expert property management services, your investment stays secure and future-ready.", image: "/residential_excellence_plot_1774769812737.png", href: "/contact", match: () => false },
  { title: "Residential excellence", text: "Expertly crafted spaces that blend comfort, aesthetics and functionality seamlessly — an unmatched living experience for families and investors.", image: "/assets/featured-project-details/projects-image/slider-05.jpg", href: "/projects?type=residential", match: (project: PublicProject) => project.project_type === "residential" },
  { title: "Commercial brilliance", text: "Commercial developments that cater to dynamic business needs, offering cutting-edge spaces designed for productivity, growth and success.", image: "/commercial_building_investment_1774769793820.png", href: "/projects?type=commercial", match: (project: PublicProject) => project.project_type === "commercial" },
];

const steps = [
  { icon: <Search size={22} />, title: "Consultation", text: "Tell us your goals, budget and timeline — in person, on a call or over WhatsApp." },
  { icon: <FileText size={22} />, title: "Curated shortlist", text: "Within 24 hours you receive a shortlist with brochures, price lists and our analysis." },
  { icon: <CalendarDays size={22} />, title: "Site visits", text: "Visit shortlisted projects with your advisor — or take a live video walkthrough." },
  { icon: <KeyRound size={22} />, title: "Booking & handover", text: "We coordinate documentation, registration and handover, and can manage the asset after." },
];

const faqs = [
  { question: "How do I get started?", answer: "Book a free consultation — tell us your budget, preferred location and goals, and we’ll share a curated shortlist within 24 hours." },
  { question: "Do you only offer HPG developments?", answer: "No. Alongside our own developments we recommend handpicked partner projects from leading developers across NCR." },
  { question: "Can I invest from outside India?", answer: "Yes. We can arrange video site visits and help with documentation remotely — speak to an advisor to plan your purchase." },
  { question: "Do you manage the property after purchase?", answer: "Yes — property management is one of our core services, covering maintenance, tenant relations and yield optimisation." },
];

export function Investments({ projects }: { projects: PublicProject[] }) {
  return (
    <>
      <section data-nav-overlay className="hero-overlay on-dark relative overflow-hidden bg-navy-950">
        <img src="/commercial_building_investment_1774769793820.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-navy-950/95 to-navy-950/80 lg:bg-gradient-to-r lg:from-navy-950 lg:via-navy-950/85 lg:to-navy-950/35" />
        <div className="container-page relative flex flex-col gap-6 py-16 md:gap-7 md:py-24 lg:py-[120px]">
          <Eyebrow dark>Investment opportunities</Eyebrow>
          <h1 className="t-display max-w-[760px] text-white">Strategic, <span className="accent">high-yield</span> real estate ventures</h1>
          <p className="t-body-xl max-w-[600px] text-slate-300">Opportunities precisely designed for visionary investors — from landmark residences to commercial assets and strategic plots.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <EnquireButton className={buttonClass("accent", "l", "w-full sm:w-auto")}>Speak to an advisor</EnquireButton>
            <ButtonLink href="/projects" variant="outline-inverse" icon={false} className="w-full sm:w-auto">Explore projects</ButtonLink>
          </div>
        </div>
      </section>

      <section className="bg-white section-y">
        <div className="container-page flex flex-col gap-14 md:gap-[72px] lg:gap-24">
          <SectionHeading eyebrow="Four ways to invest" title="Choose the opportunity that fits your goals" accent="fits" lead="Every category is backed by our research, transparent documentation and ongoing management." />
          {categories.map((category, index) => {
            const featured = projects.filter(category.match).slice(0, 3).map((project) => project.title);
            return (
              <article key={category.title} className="grid items-center gap-7 lg:grid-cols-2 lg:gap-20">
                <img src={category.image} alt="" loading="lazy" className={`h-60 w-full rounded-3xl object-cover md:h-[400px] lg:h-[440px] ${index % 2 ? "lg:order-2" : ""}`} />
                <div className="flex flex-col gap-4 md:gap-5">
                  <p className="font-heading text-[30px] leading-none text-gold-700 md:text-[40px]">{String(index + 1).padStart(2, "0")}</p>
                  <h2 className="t-h3 text-ink">{category.title}</h2>
                  <p className="t-body-l text-ink-muted">{category.text}</p>
                  {featured.length > 0 && <p className="t-body-s text-ink-muted">Featured: <span className="font-medium text-ink">{featured.join(" · ")}</span></p>}
                  <TextLink href={category.href}>{category.href === "/contact" ? "Ask about plots" : "View projects"}</TextLink>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="on-dark bg-navy-900 section-y">
        <div className="container-page flex flex-col gap-10 md:gap-12">
          <SectionHeading dark eyebrow="How it works" title="From first call to handover in four clear steps" accent="four clear steps" />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-4 rounded-[20px] bg-navy-800 p-6 md:p-7">
                <div className="flex items-center justify-between"><IconCircle tone="dark">{step.icon}</IconCircle><span className="font-heading text-[30px] leading-none text-gold-400">{String(index + 1).padStart(2, "0")}</span></div>
                <h3 className="t-h5 text-white">{step.title}</h3>
                <p className="t-body-s text-slate-300">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white pt-16 md:pt-[88px] lg:pt-[112px]">
        <div className="container-page">
          <div className="flex flex-col gap-6 rounded-3xl bg-ivory-100 p-6 md:p-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <div className="flex items-center gap-5">
              <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-gold-500 sm:flex"><Globe size={28} /></span>
              <div className="flex flex-col gap-2"><h2 className="t-h4 text-ink">Investing from outside India?</h2><p className="t-body text-ink-muted">We can arrange live video site visits and help with documentation remotely — talk to us about your plans.</p></div>
            </div>
            <EnquireButton className={buttonClass("primary", "l", "w-full lg:w-auto")}>Plan a remote purchase</EnquireButton>
          </div>
        </div>
      </section>

      <section className="bg-white section-y">
        <div className="container-page grid gap-8 lg:grid-cols-[400px_1fr] lg:gap-24">
          <SectionHeading eyebrow="FAQ" title="Questions investors ask us" accent="ask" lead="Can’t find your answer? Call or WhatsApp us — we usually reply within the hour." />
          <Faq items={faqs} />
        </div>
      </section>

      <CtaBand title="Ready to grow your portfolio?" accent="grow" text="Speak to an advisor today — we respond to every enquiry within 24 hours." />
    </>
  );
}
