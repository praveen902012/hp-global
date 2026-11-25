"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { isInternalHref, type MenuItem } from "../../data/siteMenu";
import { useSiteLinks } from "../site/SiteDetailsProvider";
import { MenuLink } from "./MenuLink";
import { buttonClass } from "../site/ui";
import { useEnquiry } from "../site/EnquiryProvider";
import { SocialIcon } from "../site/brand-icons";

/**
 * Site header. It sits transparently over a dark hero when the page marks one with
 * `data-nav-overlay`, and turns solid once the visitor scrolls.
 */
export function Navbar({ links }: { links: MenuItem[] }) {
  const pathname = usePathname() || "/";
  const site = useSiteLinks();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const enquire = useEnquiry();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Page content can stream in after the header, so watch for the hero to appear.
    const check = () => setOverlay(!!document.querySelector("[data-nav-overlay]"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => {
    if (!isInternalHref(href)) return false;
    const path = href.split(/[?#]/)[0];
    return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
  };
  const transparent = overlay && !scrolled;
  const navLinks = links.filter((link) => link.href !== "/");

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ${transparent ? "border-b border-white/10 bg-transparent" : "border-b border-line bg-white/95 shadow-[var(--shadow-soft)] backdrop-blur"}`}>
        <div className="container-page flex h-16 items-center justify-between gap-6 lg:h-20">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="HP Global Infrra — home">
            <img src="/images/hpg-logo.png" alt="" className="h-9 w-auto lg:h-10" />
            <span className={`hidden flex-col leading-none sm:flex ${transparent ? "text-white" : "text-ink"}`}>
              <span className="font-heading text-[19px]">HP Global</span>
              <span className={`mt-1 text-[10px] font-semibold tracking-[0.32em] ${transparent ? "text-gold-400" : "text-gold-700"}`}>INFRRA</span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-0.5 min-[1360px]:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <MenuLink key={`${link.href}-${link.label}`} item={link} className={`relative whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-medium transition-colors ${transparent ? (active ? "text-white" : "text-slate-300 hover:text-white") : (active ? "text-ink" : "text-ink-muted hover:text-ink")}`}>
                  <span aria-current={active ? "page" : undefined}>{link.label}</span>
                  {active && <span aria-hidden className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-400" />}
                </MenuLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href={site.phoneHref} className={`hidden items-center gap-2 whitespace-nowrap text-[15px] font-semibold md:max-[1359px]:inline-flex 2xl:inline-flex ${transparent ? "text-white" : "text-ink"}`}>
              <Phone size={17} className={transparent ? "text-gold-400" : "text-gold-500"} />{site.phoneDisplay}
            </a>
            <a href={site.phoneHref} aria-label={`Call ${site.phoneDisplay}`} className={`flex h-10 w-10 items-center justify-center rounded-full border sm:hidden ${transparent ? "border-white/30 text-white" : "border-line-strong text-ink"}`}><Phone size={17} /></a>
            <span className="hidden sm:block"><button type="button" onClick={() => enquire()} className={buttonClass("accent", "m")}>Enquire now</button></span>
            <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" className={`flex h-10 w-10 items-center justify-center rounded-full border min-[1360px]:hidden ${transparent ? "border-white/30 text-white" : "border-line-strong text-ink"}`}>
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[90] flex flex-col overflow-y-auto bg-navy-950 px-5 pb-8 pt-3 animate-fade-in sm:px-10">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 text-white" aria-label="HP Global Infrra — home">
              <img src="/images/hpg-logo.png" alt="" className="h-9 w-auto" />
              <span className="flex flex-col leading-none"><span className="font-heading text-[19px]">HP Global</span><span className="mt-1 text-[10px] font-semibold tracking-[0.32em] text-gold-400">INFRRA</span></span>
            </Link>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-700 text-white"><X size={20} /></button>
          </div>
          <nav aria-label="Mobile" className="mt-6 flex flex-col">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <MenuLink key={`${link.href}-${link.label}`} item={link} onClick={() => setOpen(false)} className={`flex items-center justify-between border-b border-navy-700 py-4 font-heading text-[24px] leading-8 ${active ? "text-gold-400" : "text-white"}`}>
                  {link.label}<ChevronRight size={20} className={active ? "text-gold-400" : "text-slate-400"} />
                </MenuLink>
              );
            })}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <button type="button" onClick={() => { setOpen(false); enquire(); }} className={buttonClass("accent", "l", "w-full")}>Enquire now</button>
            <a href={site.phoneHref} className={buttonClass("outline-inverse", "l", "w-full")}><Phone size={17} />Call {site.phoneDisplay}</a>
          </div>
          <div className="mt-8 flex gap-3">
            {site.social.map((item) => <a key={item.key} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label} className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-700 text-white"><SocialIcon network={item.key} size={18} /></a>)}
          </div>
        </div>
      )}
    </>
  );
}
