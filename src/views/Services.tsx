import { ArrowRight, Check, Globe, Layers, UserRound } from "lucide-react";
import { getSiteLinks } from "../lib/server/site-details";
import { Eyebrow, IconCircle, SectionHeading, buttonClass } from "../components/site/ui";
import { EnquireButton } from "../components/site/EnquiryProvider";
import { CtaBand } from "../components/site/CtaBand";

const services = [
  {
    eyebrow: "Service 01",
    title: "Real estate investment management",
    text: "HP Global Infrra offers extensive advisory and management for real estate investments. We guide high-net-worth individuals and organisations toward investments that secure steady cash flows and high appreciation.",
    image: "/commercial_building_investment_1774769793820.png",
    includes: ["Market research & opportunity sourcing", "Due diligence on project, developer and documentation", "Price negotiation and booking support", "Portfolio reviews and exit planning"],
    cta: "Schedule a consultation",
  },
  {
    eyebrow: "Service 02",
    title: "Property management strategy",
    text: "Ensure your investment is secure and future-ready. From ongoing maintenance and tenant relations to strategic optimisation of yield, our property management takes the hassle out of owning property.",
    image: "/residential_excellence_plot_1774769812737.png",
    includes: ["Tenant sourcing, agreements & rent collection", "Maintenance and periodic inspections", "Society, tax and utility coordination", "Regular updates on asset performance"],
    cta: "Optimise your assets",
  },
];

const audiences = [
  { icon: <UserRound size={22} />, title: "First-time investors", text: "Clear guidance from shortlist to registration, with every document explained." },
  { icon: <Globe size={22} />, title: "Investors outside India", text: "Video site visits and documentation support, so distance is never a barrier." },
  { icon: <Layers size={22} />, title: "Portfolio investors", text: "Diversify across residential, commercial and plots with research-backed advice." },
];

export async function Services() {
  const company = await getSiteLinks();
  return (
    <>
      <section className="bg-ivory-100">
        <div className="container-page flex flex-col gap-6 py-12 md:gap-7 md:py-[72px] lg:py-24">
          <Eyebrow>Our services</Eyebrow>
          <h1 className="t-display max-w-[820px] text-ink">Expertise that protects and <span className="accent">grows</span> your investment</h1>
          <p className="t-body-xl max-w-[620px] text-ink-muted">Two focused services, one advisor. From finding the right asset to managing it for years after — we stay with you.</p>
        </div>
      </section>

      <section className="bg-white section-y">
        <div className="container-page flex flex-col gap-16 md:gap-[88px] lg:gap-[120px]">
          {services.map((service, index) => (
            <article key={service.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
              <img src={service.image} alt="" loading="lazy" className={`h-64 w-full rounded-3xl object-cover md:h-[420px] lg:h-[560px] ${index % 2 ? "lg:order-2" : ""}`} />
              <div className="flex flex-col gap-5 md:gap-6">
                <Eyebrow>{service.eyebrow}</Eyebrow>
                <h2 className="t-h2 text-ink">{service.title}</h2>
                <p className="t-body-l text-ink-muted">{service.text}</p>
                <div className="flex flex-col gap-3.5 rounded-2xl bg-ivory-50 p-5 md:p-6">
                  <p className="t-h6 text-ink">What’s included</p>
                  <ul className="flex flex-col gap-3">
                    {service.includes.map((item) => <li key={item} className="flex items-start gap-3 t-body text-ink"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-200 text-gold-700"><Check size={14} /></span>{item}</li>)}
                  </ul>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <EnquireButton project={{ title: service.title, location: "" }} className={buttonClass("primary", "l", "w-full sm:w-auto")}>{service.cta}<ArrowRight size={18} aria-hidden /></EnquireButton>
                  <a href={company.phoneHref} className="inline-flex items-center gap-1.5 t-label text-ink hover:text-gold-700">Call {company.phoneDisplay}<ArrowRight size={16} className="text-gold-500" /></a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ivory-50 section-y">
        <div className="container-page flex flex-col gap-10 md:gap-12">
          <SectionHeading eyebrow="Who we work with" title="Advice shaped around the way you invest" accent="you" lead="Whether it’s your first property or your fifteenth, the process is the same: honest advice, complete documentation, and someone to call." />
          <div className="grid gap-5 lg:grid-cols-3">
            {audiences.map((item) => (
              <div key={item.title} className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-7">
                <IconCircle>{item.icon}</IconCircle>
                <h3 className="t-h4 text-ink">{item.title}</h3>
                <p className="t-body-s text-ink-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand className="pt-16 md:pt-[88px] lg:pt-[112px]" title="Not sure which service you need?" accent="which" text="Tell us about your goals and we’ll recommend the right approach — no obligation." />
    </>
  );
}
