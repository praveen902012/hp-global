"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { isInternalHref, type MenuItem } from "../../data/siteMenu";
import { MenuLink } from "./MenuLink";

export function Navbar({ links }: { links: MenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const isActiveLink = (href: string) => {
    if (!isInternalHref(href)) return false;
    const path = href.split(/[?#]/)[0];
    return path === "/" ? pathname === "/" : (pathname || "").startsWith(path);
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-brand-charcoal/95 backdrop-blur-md shadow-lg border-b border-brand-champagne/10 py-3' : 'bg-brand-charcoal shadow-2xl py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group">
              <img
                src="/images/hpg-logo.png"
                alt="HP Global Infrra"
                className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            {links.map((link) => (
              <MenuLink
                key={`${link.href}-${link.label}`}
                item={link}
                className={`text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-500 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-brand-champagne after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-500 ${isActiveLink(link.href)
                    ? "text-brand-champagne after:scale-x-100"
                    : "text-slate-300 hover:text-white"
                  }`}
              >
                {link.label}
              </MenuLink>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none transition-transform duration-300 hover:text-brand-champagne"
            >
              {isOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-brand-charcoal border-b border-white/10 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[80vh] overflow-y-auto opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-8 space-y-6">
          {links.map((link) => (
            <MenuLink
              key={`${link.href}-${link.label}`}
              item={link}
              onClick={() => setIsOpen(false)}
              className={`block text-sm font-medium uppercase tracking-[0.2em] transition-colors ${isActiveLink(link.href) ? "text-brand-champagne" : "text-slate-400 hover:text-white"
                }`}
            >
              {link.label}
            </MenuLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
