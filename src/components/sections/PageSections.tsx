import { ArrowRight } from "lucide-react";
import { toVideoEmbedUrl, type PageSection, type SectionBackground } from "../../data/pages";
import { SectionLink } from "./SectionLink";
import { ContactForm } from "../site/ContactForm";
import { Faq } from "../site/Faq";
import { Eyebrow, buttonClass } from "../site/ui";

const backgrounds: Record<SectionBackground, string> = {
  white: "bg-white",
  light: "bg-ivory-50",
  dark: "bg-navy-900 on-dark",
};

function Title({ text, accent, dark, as: Tag = "h2", size = "t-h2", center, className = "" }: { text: string; accent?: string; dark: boolean; as?: "h1" | "h2"; size?: string; center?: boolean; className?: string }) {
  if (!text && !accent) return null;
  return (
    <Tag className={`${size} ${dark ? "text-white" : "text-ink"} ${center ? "text-center" : ""} ${className}`}>
      {text}{accent && <>{text ? " " : ""}<span className="accent">{accent}</span></>}
    </Tag>
  );
}

function Action({ label, href, dark, variant }: { label: string; href: string; dark: boolean; variant?: "accent" | "primary" }) {
  if (!label || !href) return null;
  return (
    <SectionLink href={href} className={buttonClass(variant ?? (dark ? "accent" : "primary"), "l", "self-start")}>
      {label}<ArrowRight size={18} aria-hidden />
    </SectionLink>
  );
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

function Section({ section, isFirst }: { section: PageSection; isFirst: boolean }) {
  const dark = section.background === "dark";
  const tag = isFirst ? "h1" : "h2";
  switch (section.type) {
    case "hero":
      return (
        <section {...(isFirst ? { "data-nav-overlay": "" } : {})} className={`on-dark relative overflow-hidden bg-navy-950 ${isFirst ? "hero-overlay" : ""}`}>
          {section.image_url && <img src={section.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-navy-950/90 via-navy-950/75 to-navy-950/90 lg:bg-gradient-to-r lg:from-navy-950 lg:via-navy-950/80 lg:to-navy-950/30" />
          <div className={`container-page relative flex flex-col justify-center gap-6 py-16 md:gap-7 ${section.height === "full" ? "min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]" : "min-h-[520px] md:min-h-[600px]"}`}>
            <Eyebrow dark>{section.eyebrow}</Eyebrow>
            <Title text={section.title} accent={section.accent_title} dark as={tag} size="t-display max-w-[860px]" />
            {section.subtitle && <p className="t-body-xl max-w-[620px] text-slate-300">{section.subtitle}</p>}
            <Action label={section.button_label} href={section.button_href} dark />
          </div>
        </section>
      );

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
            {section.images.map((image, index) => (
              <li key={`${image.src}-${index}`}>
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
      return (
        <Shell background={section.background}>
          {(section.heading || section.intro) && (
            <div className="flex max-w-[760px] flex-col gap-4">
              <Title text={section.heading} dark={dark} as={tag} />
              {section.intro && <p className={`t-body-l ${dark ? "text-slate-300" : "text-ink-muted"}`}>{section.intro}</p>}
            </div>
          )}
          <div className={`grid gap-5 md:gap-6 ${section.cards.length === 1 ? "max-w-md" : section.cards.length === 2 ? "md:grid-cols-2" : section.cards.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {section.cards.map((card, index) => {
              const body = (
                <div className={`group flex h-full flex-col overflow-hidden rounded-[20px] border transition-shadow hover:shadow-[var(--shadow-card)] ${dark ? "border-navy-700 bg-navy-800/60" : "border-line bg-white"}`}>
                  {card.image_url && <div className="aspect-[16/10] overflow-hidden bg-ivory-100"><img src={card.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></div>}
                  <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
                    <h3 className={`t-h5 ${dark ? "text-white" : "text-ink"}`}>{card.title}</h3>
                    {card.description && <p className={`t-body-s ${dark ? "text-slate-300" : "text-ink-muted"}`}>{card.description}</p>}
                    {card.link && <span className={`mt-auto inline-flex items-center gap-1.5 pt-2 t-label ${dark ? "text-white" : "text-ink"}`}>Learn more<ArrowRight size={16} className={`transition-transform group-hover:translate-x-0.5 ${dark ? "text-gold-400" : "text-gold-500"}`} /></span>}
                  </div>
                </div>
              );
              return card.link ? <SectionLink key={index} href={card.link} className="block h-full">{body}</SectionLink> : <div key={index}>{body}</div>;
            })}
          </div>
        </Shell>
      );

    case "stats":
      return (
        <section className={`${backgrounds[section.background]} py-12 md:py-[72px]`}>
          <div className="container-page flex flex-col gap-8">
            <Title text={section.heading} dark={dark} as={tag} />
            <dl className={`grid grid-cols-2 gap-x-6 gap-y-8 ${section.items.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
              {section.items.map((item, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <dt className={`order-2 t-body-s ${dark ? "text-slate-300" : "text-ink-muted"}`}>{item.label}</dt>
                  <dd className={`order-1 font-heading text-[40px] leading-[48px] md:text-[52px] md:leading-[60px] ${dark ? "text-gold-400" : "text-gold-700"}`}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      );

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
      return (
        <Shell background={section.background} narrow>
          <Title text={section.heading} dark={dark} as={tag} />
          <div className="w-full"><Faq items={section.items} dark={dark} /></div>
        </Shell>
      );

    case "cta":
      return (
        <section className={`${backgrounds[section.background]} py-16 md:py-[88px]`}>
          <div className="container-page flex flex-col items-center gap-6 text-center">
            <Title text={section.heading} dark={dark} as={tag} center className="max-w-[760px]" />
            {section.text && <p className={`t-body-l max-w-[620px] ${dark ? "text-slate-300" : "text-ink-muted"}`}>{section.text}</p>}
            <div className="flex justify-center"><Action label={section.button_label} href={section.button_href} dark={dark} /></div>
          </div>
        </section>
      );

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
  }
}

export function PageSections({ sections }: { sections: PageSection[] }) {
  return <>{sections.map((section, index) => <Section key={section.id} section={section} isFirst={index === 0} />)}</>;
}
