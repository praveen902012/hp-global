import Link from "next/link";
import { ArrowRight, Building2, Phone, TrendingUp } from "lucide-react";
import { ButtonLink, IconCircle, buttonClass } from "./ui";
import { EnquireButton } from "./EnquiryProvider";

const popular = [
  { href: "/projects", icon: <Building2 size={20} />, title: "Projects", text: "Browse all current developments" },
  { href: "/investments", icon: <TrendingUp size={20} />, title: "Investments", text: "Four ways to invest with us" },
  { href: "/contact", icon: <Phone size={20} />, title: "Contact", text: "Call, WhatsApp or visit our office" },
];

export function NotFoundContent() {
  return (
    <>
      <section className="bg-ivory-100">
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center md:gap-7 md:py-[120px]">
          <p className="font-heading text-[96px] italic leading-none text-gold-700 md:text-[160px]">404</p>
          <h1 className="t-h2 max-w-[720px] text-ink">This page has moved — or never existed</h1>
          <p className="t-body-l max-w-[560px] text-ink-muted">The link may be out of date. Head to one of the pages below, or ask us — we’re happy to help you find it.</p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="/" variant="primary">Go to homepage</ButtonLink>
            <EnquireButton className={buttonClass("outline", "l")}>Talk to an advisor</EnquireButton>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <ul className="container-page grid gap-3 py-12 md:grid-cols-3 md:gap-6 md:py-[72px]">
          {popular.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group flex items-center gap-4 rounded-2xl border border-line p-5 transition-colors hover:border-gold-400 md:p-6">
                <IconCircle size={44}>{item.icon}</IconCircle>
                <span className="flex min-w-0 flex-1 flex-col gap-1"><span className="t-h6 text-ink">{item.title}</span><span className="t-body-s text-ink-muted">{item.text}</span></span>
                <ArrowRight size={20} className="shrink-0 text-gold-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
