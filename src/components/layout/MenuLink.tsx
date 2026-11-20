import Link from "next/link";
import { isInternalHref, type MenuItem } from "../../data/siteMenu";

interface MenuLinkProps {
  item: MenuItem;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

/** Renders a Next.js Link for site paths and a plain anchor for external, mailto: and tel: links. */
export function MenuLink({ item, className, onClick, children }: MenuLinkProps) {
  const target = item.new_tab ? { target: "_blank", rel: "noopener noreferrer" } : {};
  if (isInternalHref(item.href)) {
    return <Link href={item.href} className={className} onClick={onClick} {...target}>{children}</Link>;
  }
  return <a href={item.href} className={className} onClick={onClick} {...target}>{children}</a>;
}
