import { WhatsAppIcon } from "../site/brand-icons";
import type { SiteLinks } from "../../data/siteDetails";

/** Floating WhatsApp shortcut, shown on every public page. */
export function WhatsAppFab({ site }: { site: SiteLinks }) {
  return (
    <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"
      className="fixed bottom-4 right-4 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-whatsapp px-4 text-[15px] font-semibold text-navy-900 shadow-[var(--shadow-float)] transition-transform hover:-translate-y-0.5 md:bottom-8 md:right-8 md:px-5 print:hidden">
      <WhatsAppIcon size={24} /><span className="hidden md:inline">Chat with us</span>
    </a>
  );
}
