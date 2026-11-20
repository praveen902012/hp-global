import Link from "next/link";
import { isInternalHref } from "../../data/siteMenu";

/** Internal paths use Next.js navigation; external links open in a new tab. */
export function SectionLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (isInternalHref(href)) return <Link href={href} className={className}>{children}</Link>;
  const external = /^https?:/i.test(href);
  return <a href={href} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
}
