import { ArrowRight, ChevronDown } from "lucide-react";
import { toVideoEmbedUrl, type PageSection, type SectionBackground } from "../../data/pages";
import { SectionLink } from "./SectionLink";
import { ContactFormBlock } from "./ContactFormBlock";

const backgrounds: Record<SectionBackground, string> = {
  white: "bg-brand-white",
  light: "bg-brand-light-grey",
  dark: "bg-brand-charcoal",
};

/** Typography for admin-written rich text (headings, lists, quotes, links). */
const richText = (dark: boolean) => [
  "text-lg font-light leading-relaxed",
  dark ? "text-slate-300" : "text-gray-500",
  "[&_p]:mb-6 [&_p:last-child]:mb-0 [&_div]:mb-6",
  "[&_h2]:font-heading [&_h2]:font-light [&_h2]:text-3xl [&_h2]:mt-12 [&_h2]:mb-6 [&_h3]:font-heading [&_h3]:text-2xl [&_h3]:mt-10 [&_h3]:mb-4",
  dark ? "[&_h2]:text-white [&_h3]:text-white [&_strong]:text-white" : "[&_h2]:text-brand-charcoal [&_h3]:text-brand-charcoal [&_strong]:text-brand-charcoal",
  "[&_strong]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_ul]:mb-6 [&_ol]:mb-6 [&_li]:mb-2 [&_li]:marker:text-brand-champagne",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-brand-champagne [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:my-8",
  "[&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-brand-champagne hover:[&_a]:text-brand-champagne",
  dark ? "[&_a]:text-white" : "[&_a]:text-brand-charcoal",
].join(" ");

function Eyebrow({ children }: { children: string }) {
  if (!children) return null;
  return <span className="mb-6 block text-[10px] font-bold uppercase tracking-[0.3em] text-brand-champagne">{children}</span>;
}

function Heading({ children, accent, dark, center, as: Tag = "h2" }: { children: string; accent?: string; dark: boolean; center?: boolean; as?: "h1" | "h2" }) {
  if (!children && !accent) return null;
  return (
    <Tag className={`mb-8 font-heading text-3xl font-light tracking-tight md:text-5xl ${accent ? "lg:leading-snug" : ""} ${dark ? "text-white" : "text-brand-charcoal"} ${center ? "text-center" : ""}`}>
      {children}
      {accent && <>{children && <br />}<span className="font-normal italic text-brand-champagne">{accent}</span></>}
    </Tag>
  );
}

function ButtonLink({ label, href, dark }: { label: string; href: string; dark: boolean }) {
  if (!label || !href) return null;
  return (
    <SectionLink href={href} className={`group inline-flex items-center justify-center px-10 py-4 text-sm uppercase tracking-widest transition-all duration-500 ${dark ? "bg-brand-champagne text-brand-charcoal hover:bg-white" : "bg-brand-charcoal text-white hover:bg-brand-champagne"}`}>
      {label}<ArrowRight size={16} className="ml-3 transition-transform duration-300 group-hover:translate-x-1" />
    </SectionLink>
  );
}

function Shell({ background, children, narrow }: { background: SectionBackground; children: React.ReactNode; narrow?: boolean }) {
  return <section className={`${backgrounds[background]} py-24 md:py-32`}><div className={`mx-auto px-4 sm:px-6 lg:px-8 ${narrow ? "max-w-4xl" : "max-w-7xl"}`}>{children}</div></section>;
}

function Section({ section, isFirst }: { section: PageSection; isFirst: boolean }) {
  const dark = section.background === "dark";
  switch (section.type) {
    case "hero":
      return (
        <section className={`relative flex items-center overflow-hidden bg-brand-charcoal ${section.height === "full" ? "min-h-screen" : "min-h-[70vh]"}`}>
          {section.image_url && <img src={section.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/80 via-brand-charcoal/55 to-brand-charcoal/85" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-40 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Eyebrow>{section.eyebrow}</Eyebrow>
              {section.eyebrow && <div className="mb-10 h-[1px] w-12 bg-brand-champagne" />}
              {isFirst ? (
                <h1 className="mb-8 font-heading text-5xl font-light leading-tight tracking-tight text-white md:text-7xl">{section.title}{section.accent_title && <><br /><span className="font-normal italic text-brand-champagne">{section.accent_title}</span></>}</h1>
              ) : (
                <h2 className="mb-8 font-heading text-5xl font-light leading-tight tracking-tight text-white md:text-7xl">{section.title}{section.accent_title && <><br /><span className="font-normal italic text-brand-champagne">{section.accent_title}</span></>}</h2>
              )}
              {section.subtitle && <p className="mb-12 max-w-2xl text-lg font-light leading-relaxed text-slate-300 md:text-xl">{section.subtitle}</p>}
              <ButtonLink label={section.button_label} href={section.button_href} dark />
            </div>
          </div>
        </section>
      );

    case "text":
      return (
        <Shell background={section.background} narrow>
          <div className={section.align === "center" ? "text-center" : ""}>
            <Eyebrow>{section.eyebrow}</Eyebrow>
            <Heading dark={dark} as={isFirst ? "h1" : "h2"}>{section.heading}</Heading>
            {section.body && <div className={`${richText(dark)} ${section.align === "center" ? "mx-auto max-w-3xl" : ""}`} dangerouslySetInnerHTML={{ __html: section.body }} />}
          </div>
        </Shell>
      );

    case "image_text":
      return (
        <Shell background={section.background}>
          <div className={`flex flex-col items-center gap-16 lg:gap-32 ${section.image_position === "left" ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
            <div className="lg:w-1/2">
              <Eyebrow>{section.eyebrow}</Eyebrow>
              {section.eyebrow && <div className={`mb-10 h-[1px] w-12 ${dark ? "bg-brand-champagne" : "bg-brand-charcoal"}`} />}
              <Heading dark={dark} accent={section.accent_heading} as={isFirst ? "h1" : "h2"}>{section.heading}</Heading>
              {section.body && <div className={`${richText(dark)} mb-10 max-w-xl`} dangerouslySetInnerHTML={{ __html: section.body }} />}
              {section.tagline && <p className={`mb-10 max-w-xl text-sm font-semibold uppercase tracking-widest ${dark ? "text-white" : "text-brand-charcoal"}`}>{section.tagline}</p>}
              <ButtonLink label={section.button_label} href={section.button_href} dark={dark} />
            </div>
            <div className={`relative h-[420px] w-full lg:h-[600px] lg:w-1/2 ${dark ? "bg-white/5" : "bg-brand-beige"}`}>
              <div className="absolute inset-4 overflow-hidden border border-brand-champagne/30">
                <img src={section.image_url} alt={section.image_alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105" />
              </div>
            </div>
          </div>
        </Shell>
      );

    case "gallery": {
      const columns = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[section.columns];
      if (!section.images.length && !section.heading) return null;
      return (
        <Shell background={section.background}>
          <Heading dark={dark} center as={isFirst ? "h1" : "h2"}>{section.heading}</Heading>
          <div className={`grid grid-cols-1 gap-4 ${columns}`}>
            {section.images.map((image, index) => (
              <a key={`${image.src}-${index}`} href={image.src} target="_blank" rel="noopener noreferrer" className="group block aspect-[4/3] overflow-hidden bg-brand-beige">
                <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </a>
            ))}
          </div>
        </Shell>
      );
    }

    case "cards":
      return (
        <Shell background={section.background}>
          {(section.heading || section.intro) && (
            <div className="mb-16 text-center">
              <Heading dark={dark} center as={isFirst ? "h1" : "h2"}>{section.heading}</Heading>
              {section.intro && <p className={`mx-auto max-w-2xl font-light ${dark ? "text-slate-300" : "text-gray-500"}`}>{section.intro}</p>}
            </div>
          )}
          <div className={`grid gap-10 ${section.cards.length === 1 ? "mx-auto max-w-md" : section.cards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {section.cards.map((card, index) => {
              const body = (
                <div className={`group flex h-full flex-col overflow-hidden border ${dark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"} transition-all duration-500 hover:-translate-y-1 hover:shadow-xl`}>
                  {card.image_url && <div className="h-64 overflow-hidden bg-brand-beige"><img src={card.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" /></div>}
                  <div className="flex flex-grow flex-col p-8">
                    <h3 className={`mb-4 font-heading text-2xl font-normal transition-colors duration-500 group-hover:text-brand-champagne ${dark ? "text-white" : "text-brand-charcoal"}`}>{card.title}</h3>
                    {card.description && <p className={`flex-grow text-sm font-light leading-relaxed ${dark ? "text-slate-300" : "text-gray-500"}`}>{card.description}</p>}
                    {card.link && <span className={`mt-8 inline-flex items-center text-xs font-semibold uppercase tracking-widest ${dark ? "text-white" : "text-brand-charcoal"}`}>Learn more<ArrowRight size={14} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" /></span>}
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
        <Shell background={section.background}>
          <Heading dark={dark} center as={isFirst ? "h1" : "h2"}>{section.heading}</Heading>
          <dl className={`grid grid-cols-2 gap-y-12 text-center ${section.items.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            {section.items.map((item, index) => (
              <div key={index} className="px-4">
                <dt className="sr-only">{item.label}</dt>
                <dd className="mb-3 font-heading text-4xl font-light text-brand-champagne md:text-6xl">{item.value}</dd>
                <dd className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-slate-300" : "text-gray-500"}`} aria-hidden="true">{item.label}</dd>
              </div>
            ))}
          </dl>
        </Shell>
      );

    case "video": {
      const embed = toVideoEmbedUrl(section.url);
      if (!embed) return null;
      return (
        <Shell background={section.background} narrow>
          <Heading dark={dark} center as={isFirst ? "h1" : "h2"}>{section.heading}</Heading>
          <div className="relative aspect-video overflow-hidden bg-black shadow-2xl">
            <iframe src={embed} title={section.heading || "Video"} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" loading="lazy" />
          </div>
          {section.caption && <p className={`mt-6 text-center text-sm font-light ${dark ? "text-slate-400" : "text-gray-500"}`}>{section.caption}</p>}
        </Shell>
      );
    }

    case "faq":
      return (
        <Shell background={section.background} narrow>
          <Heading dark={dark} center as={isFirst ? "h1" : "h2"}>{section.heading}</Heading>
          <div className={`divide-y border-y ${dark ? "divide-white/10 border-white/10" : "divide-gray-200 border-gray-200"}`}>
            {section.items.map((item, index) => (
              <details key={index} className="group py-6">
                <summary className={`flex cursor-pointer list-none items-center justify-between gap-6 font-heading text-xl [&::-webkit-details-marker]:hidden ${dark ? "text-white" : "text-brand-charcoal"}`}>
                  {item.question}
                  <ChevronDown size={20} className="shrink-0 text-brand-champagne transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className={`mt-4 whitespace-pre-line font-light leading-relaxed ${dark ? "text-slate-300" : "text-gray-500"}`}>{item.answer}</p>
              </details>
            ))}
          </div>
        </Shell>
      );

    case "cta":
      return (
        <section className={`${backgrounds[section.background]} py-24 md:py-28`}>
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Heading dark={dark} center as={isFirst ? "h1" : "h2"}>{section.heading}</Heading>
            {section.text && <p className={`mx-auto mb-12 max-w-2xl text-lg font-light ${dark ? "text-slate-300" : "text-gray-500"}`}>{section.text}</p>}
            <ButtonLink label={section.button_label} href={section.button_href} dark={dark} />
          </div>
        </section>
      );

    case "contact_form":
      return (
        <Shell background={section.background} narrow>
          <div className="mb-12 text-center">
            <Heading dark={dark} center as={isFirst ? "h1" : "h2"}>{section.heading}</Heading>
            {section.intro && <p className={`mx-auto max-w-2xl font-light ${dark ? "text-slate-300" : "text-gray-500"}`}>{section.intro}</p>}
          </div>
          <ContactFormBlock dark={dark} />
        </Shell>
      );
  }
}

export function PageSections({ sections }: { sections: PageSection[] }) {
  const startsWithHero = sections[0]?.type === "hero";
  return (
    <div className={startsWithHero ? "" : "pt-8"}>
      {sections.map((section, index) => <Section key={section.id} section={section} isFirst={index === 0} />)}
    </div>
  );
}
