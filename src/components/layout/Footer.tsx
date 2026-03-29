import { NavLink } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-light-grey border-t border-gray-200 text-brand-charcoal pt-32 pb-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          
          {/* Brand & Intro */}
          <div className="md:col-span-5 pr-8">
            <h3 className="text-2xl font-heading font-normal mb-8 uppercase tracking-widest text-brand-charcoal">
              <span className="text-brand-champagne">HP</span> Global Infra
            </h3>
            <p className="text-gray-500 max-w-sm mb-10 leading-loose font-light">
              Shaping the Future of Real Estate.<br/>
              Partner in Vision. Invest in Growth.
            </p>
            <a href="mailto:info@hpglobalinfra.com" className="inline-block text-sm uppercase tracking-widest font-semibold border-b border-brand-charcoal pb-1 hover:text-brand-champagne hover:border-brand-champagne transition-colors duration-500">
              info@hpglobalinfra.com
            </a>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold mb-8 text-brand-charcoal tracking-[0.2em] uppercase">Navigation</h4>
            <ul className="space-y-6">
              {['Services', 'Investments', 'About', 'Journal'].map((item) => (
                <li key={item}>
                  <NavLink 
                    to={item === 'Journal' ? '/blog' : `/${item.toLowerCase()}`} 
                    className="group inline-flex items-center text-gray-500 hover:text-brand-charcoal transition-colors duration-500"
                  >
                    <span className="text-sm font-light tracking-wide">{item}</span>
                    <ArrowUpRight size={14} className="ml-2 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 text-brand-champagne" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold mb-8 text-brand-charcoal tracking-[0.2em] uppercase">Headquarters</h4>
            <ul className="space-y-8">
              <li className="text-gray-500 font-light leading-relaxed">
                B-302, T-3, NX-One,<br/>
                Tech Zone - 4, Amrapali Dream Valley,<br/>
                Greater Noida, UP, India
              </li>
              <li className="text-gray-500 font-light">
                <span className="block text-xs uppercase tracking-widest font-semibold text-brand-charcoal mb-2">Direct Line</span>
                +91 7827955579
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-[0.2em] uppercase text-gray-400 font-semibold gap-6">
          <p>© 2025 HP Global Infra. All Rights Reserved.</p>
          <div className="flex space-x-10">
            <a href="#" className="hover:text-brand-charcoal transition-colors duration-500">Instagram</a>
            <a href="#" className="hover:text-brand-charcoal transition-colors duration-500">LinkedIn</a>
            <NavLink to="/privacy" className="hover:text-brand-charcoal transition-colors duration-500">Privacy</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
