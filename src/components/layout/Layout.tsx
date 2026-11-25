import { Navbar } from "./Navbar";
import { Footer, type FooterProject } from "./Footer";
import { WhatsAppFab } from "./WhatsAppFab";
import { EnquiryProvider } from "../site/EnquiryProvider";
import { defaultSiteMenu, type SiteMenu } from "../../data/siteMenu";
import { defaultSiteDetails, siteLinks, type SiteDetails } from "../../data/siteDetails";
import { SiteDetailsProvider } from "../site/SiteDetailsProvider";

interface LayoutProps {
  children: React.ReactNode;
  menu?: SiteMenu;
  projects?: FooterProject[];
  site?: SiteDetails;
}

export function Layout({ children, menu = defaultSiteMenu, projects, site = defaultSiteDetails }: LayoutProps) {
  const links = siteLinks(site);
  return (
    <SiteDetailsProvider details={site}>
    <EnquiryProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow">Skip to content</a>
      <div className="flex min-h-screen flex-col">
        <Navbar links={menu.header.filter((item) => item.enabled)} />
        <main id="main" className="flex-grow pt-16 lg:pt-20">{children}</main>
        <Footer links={menu.footer.filter((item) => item.enabled)} projects={projects} site={links} />
      </div>
      <WhatsAppFab site={links} />
    </EnquiryProvider>
    </SiteDetailsProvider>
  );
}
