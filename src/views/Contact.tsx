import { ArrowRight, CalendarDays, Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { getSiteLinks } from "../lib/server/site-details";
import type { SiteLinks } from "../data/siteDetails";
import { ContactForm } from "../components/site/ContactForm";
import { Eyebrow, buttonClass } from "../components/site/ui";
import { WhatsAppIcon } from "../components/site/brand-icons";

const channelsFor = (company: SiteLinks) => [
  { icon: <Phone size={22} />, label: "Call us", value: company.phoneDisplay, action: "Call now", href: company.phoneHref, external: false },
  { icon: <WhatsAppIcon size={22} />, label: "WhatsApp", value: company.phoneDisplay, action: "Start chat", href: company.whatsappHref, external: true },
  { icon: <Mail size={22} />, label: "Email", value: company.email, action: "Write to us", href: `mailto:${company.email}`, external: false },
];

export async function Contact() {
  const company = await getSiteLinks();
  const channels = channelsFor(company);
  return (
    <>
      <section className="bg-ivory-100">
        <div className="container-page flex flex-col gap-6 py-12 md:gap-7 md:py-[72px]">
          <Eyebrow>Contact us</Eyebrow>
          <h1 className="t-display max-w-[860px] text-ink">Let’s talk about your <span className="accent">next</span> investment</h1>
          <p className="t-body-xl max-w-[620px] text-ink-muted">Call, WhatsApp or write to us — or visit our office in Noida. An advisor will get back to you within 24 hours.</p>
        </div>
      </section>

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
            <a href={company.mapsHref} target="_blank" rel="noopener noreferrer" className="group relative block h-56 overflow-hidden rounded-[20px] bg-[#ede9e1] md:h-64" aria-label="Open our office location in Google Maps">
              <svg aria-hidden viewBox="0 0 440 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full"><g stroke="#fff" strokeWidth="10" fill="none"><path d="M-20 60 L470 150" /><path d="M-20 200 L470 120" /><path d="M120 -20 L180 290" /><path d="M300 -20 L250 290" /><path d="M-20 250 L200 -20" opacity=".6" /></g></svg>
              <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-navy-900 text-gold-400 shadow-[var(--shadow-card)]"><MapPin size={24} /></span>
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-ink shadow-[var(--shadow-soft)] group-hover:text-gold-700">Open in Google Maps<ExternalLink size={14} /></span>
            </a>
            <div className="flex flex-col gap-5 rounded-[20px] bg-ivory-50 p-6 md:p-7">
              <h2 className="t-h4 text-ink">Head office</h2>
              <dl className="flex flex-col gap-4">
                {[
                  { icon: <MapPin size={20} />, label: "Address", value: company.addressLines.join(" ") },
                  { icon: <Clock size={20} />, label: "Response time", value: "We reply to every enquiry within 24 hours" },
                  { icon: <CalendarDays size={20} />, label: "Site visits", value: "By appointment — in person or on a video call" },
                ].map((row) => (
                  <div key={row.label} className="flex gap-3.5">
                    <span className="mt-0.5 shrink-0 text-gold-500">{row.icon}</span>
                    <div><dt className="text-[13px] text-ink-muted">{row.label}</dt><dd className="t-body text-ink">{row.value}</dd></div>
                  </div>
                ))}
              </dl>
              <a href={company.mapsHref} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "m", "self-start")}>Get directions<ArrowRight size={16} aria-hidden /></a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
