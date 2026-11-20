import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { defaultSiteMenu, type SiteMenu } from "../../data/siteMenu";

interface LayoutProps {
  children: React.ReactNode;
  menu?: SiteMenu;
}

export function Layout({ children, menu = defaultSiteMenu }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar links={menu.header.filter((item) => item.enabled)} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer links={menu.footer.filter((item) => item.enabled)} />
    </div>
  );
}
