import { Accented, ButtonLink, Eyebrow, buttonClass } from "./ui";
import { EnquireButton } from "./EnquiryProvider";
import { WhatsAppIcon } from "./brand-icons";
import { company } from "../../data/company";
import { ArrowRight } from "lucide-react";

/** Dark call-to-action card used near the end of most pages. */
export function CtaBand({ title, accent, text, eyebrow = "Talk to an advisor", className = "" }: { title: string; accent?: string; text: string; eyebrow?: string; className?: string }) {
  return (
    <section className={`pb-16 md:pb-[88px] lg:pb-[112px] ${className}`}>
      <div className="container-page">
        <div className="on-dark relative overflow-hidden rounded-[20px] bg-navy-950 md:rounded-[28px]">
          <img src="/hero_banner_real_estate_1774769760013.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/90 to-navy-900/60" />
          <div className="relative flex flex-col gap-8 p-7 md:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-[72px]">
            <div className="flex max-w-[620px] flex-col gap-4">
              <Eyebrow dark>{eyebrow}</Eyebrow>
              <h2 className="t-h2 text-white"><Accented text={title} accent={accent} /></h2>
              <p className="t-body-l text-slate-300">{text}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <EnquireButton className={buttonClass("accent", "l", "w-full sm:w-auto")}>Book a consultation<ArrowRight size={18} aria-hidden /></EnquireButton>
              <ButtonLink href={company.whatsappHref} target="_blank" rel="noopener noreferrer" variant="outline-inverse" icon={<WhatsAppIcon size={18} />} className="w-full sm:w-auto">Chat on WhatsApp</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
