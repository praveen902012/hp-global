import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { type MenuItem } from "../../data/siteMenu";
import { company } from "../../data/company";
import { MenuLink } from "./MenuLink";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "../site/brand-icons";

export interface FooterProject { title: string; location: string; href: string }

const heading = "t-overline text-gold-400";
const link = "text-[15px] leading-6 text-slate-300 transition-colors hover:text-white";

export function Footer({ links, projects = [] }: { links: MenuItem[]; projects?: FooterProject[] }) {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="container-page grid gap-12 pb-10 pt-16 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1.1fr] lg:gap-10 lg:pt-20">
        <div className="flex max-w-sm flex-col gap-6">
          <Link href="/" className="flex items-center gap-3" aria-label="HP Global Infrra — home">
            <img src="/images/hpg-logo.png" alt="" className="h-10 w-auto" />
            <span className="flex flex-col leading-none"><span className="font-heading text-[20px]">HP Global</span><span className="mt-1 text-[10px] font-semibold tracking-[0.32em] text-gold-400">INFRRA</span></span>
          </Link>
          <p className="t-body text-slate-300">{company.tagline}</p>
          <div className="flex gap-3">
            <a href={company.social[0].href} target="_blank" rel="noopener noreferrer" aria-label="HP Global Infrra on Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-700 text-white transition-colors hover:border-gold-400 hover:text-gold-400"><InstagramIcon size={18} /></a>
            <a href={company.social[1].href} target="_blank" rel="noopener noreferrer" aria-label="HP Global Infrra on Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-700 text-white transition-colors hover:border-gold-400 hover:text-gold-400"><FacebookIcon size={18} /></a>
          </div>
        </div>

        {links.length > 0 && (
          <nav aria-label="Footer" className="flex flex-col gap-4">
            <p className={heading}>Explore</p>
            <ul className="flex flex-col gap-3">
              {links.map((item) => <li key={`${item.href}-${item.label}`}><MenuLink item={item} className={link}>{item.label}</MenuLink></li>)}
            </ul>
          </nav>
        )}

        {projects.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className={heading}>Projects</p>
            <ul className="flex flex-col gap-3">
              {projects.slice(0, 5).map((project) => <li key={project.href}><Link href={project.href} className={link}>{project.title}{project.location ? `, ${project.location.split(",")[0]}` : ""}</Link></li>)}
              <li><Link href="/projects" className={`${link} font-semibold text-white`}>View all projects</Link></li>
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <p className={heading}>Get in touch</p>
          <ul className="flex flex-col gap-4 text-[15px] leading-6 text-slate-300">
            <li><a href={company.mapsHref} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-white"><MapPin size={18} className="mt-0.5 shrink-0 text-gold-400" /><span>{company.addressLines.join(" ")}</span></a></li>
            <li><a href={company.phoneHref} className="flex gap-3 hover:text-white"><Phone size={18} className="mt-0.5 shrink-0 text-gold-400" />{company.phoneDisplay}</a></li>
            <li><a href={`mailto:${company.email}`} className="flex gap-3 hover:text-white"><Mail size={18} className="mt-0.5 shrink-0 text-gold-400" />{company.email}</a></li>
            <li><a href={company.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-white"><WhatsAppIcon size={18} className="mt-0.5 shrink-0 text-gold-400" />Chat on WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div className="container-page">
        <div className="flex flex-col gap-4 border-t border-navy-800 py-6 text-[13px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} HP Global Infrra. All rights reserved.</p>
          <div className="flex gap-6"><Link href="/privacy" className="hover:text-white">Privacy policy</Link><Link href="/contact" className="hover:text-white">Contact</Link></div>
        </div>
      </div>
    </footer>
  );
}
