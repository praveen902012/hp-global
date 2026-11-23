import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { isInternalHref } from "../../data/siteMenu";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export type ButtonStyle = "primary" | "accent" | "outline" | "outline-inverse" | "ghost" | "ghost-inverse";
export type ButtonSize = "l" | "m";

const buttonStyles: Record<ButtonStyle, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-800",
  accent: "bg-gold-400 text-navy-900 hover:bg-gold-300",
  outline: "border border-line-strong bg-white text-ink hover:border-navy-900",
  "outline-inverse": "border border-white/40 text-white hover:border-white hover:bg-white/10",
  ghost: "text-ink hover:bg-ivory-100",
  "ghost-inverse": "text-white hover:bg-white/10",
};
const buttonSizes: Record<ButtonSize, string> = {
  l: "h-12 px-6 text-[15px] gap-2.5",
  m: "h-10 px-[18px] text-[14px] gap-2",
};

export function buttonClass(style: ButtonStyle = "primary", size: ButtonSize = "l", extra = "") {
  return `inline-flex shrink-0 items-center justify-center rounded-full font-semibold leading-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[style]} ${buttonSizes[size]} ${extra}`;
}

interface CommonButtonProps { variant?: ButtonStyle; size?: ButtonSize; icon?: ReactNode | false; className?: string; children: ReactNode }

/** Link styled as a button. Internal paths use next/link; everything else is a plain anchor. */
export function ButtonLink({ href, variant, size, icon, className = "", children, ...rest }: CommonButtonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className">) {
  const content = <>{children}{icon === false ? null : icon ?? <ArrowRight size={size === "m" ? 16 : 18} aria-hidden />}</>;
  const cls = buttonClass(variant, size, className);
  if (isInternalHref(href) && !rest.target && !rest.download) return <Link href={href} className={cls} {...rest}>{content}</Link>;
  return <a href={href} className={cls} {...rest}>{content}</a>;
}

export function Button({ variant, size, icon, className = "", children, type = "button", ...rest }: CommonButtonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest}>{children}{icon || null}</button>;
}

/** Text link with arrow ("View projects →"). */
export function TextLink({ href, children, dark = false, className = "" }: { href: string; children: ReactNode; dark?: boolean; className?: string }) {
  const cls = `group inline-flex items-center gap-2 t-label ${dark ? "text-white hover:text-gold-300" : "text-ink hover:text-gold-700"} ${className}`;
  const inner = <>{children}<ArrowRight size={16} aria-hidden className={`transition-transform group-hover:translate-x-0.5 ${dark ? "text-gold-400" : "text-gold-500"}`} /></>;
  return isInternalHref(href) ? <Link href={href} className={cls}>{inner}</Link> : <a href={href} className={cls}>{inner}</a>;
}

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

export function Eyebrow({ children, dark = false, className = "" }: { children: ReactNode; dark?: boolean; className?: string }) {
  if (!children) return null;
  return (
    <p className={`flex items-center gap-3 t-overline ${dark ? "text-gold-400" : "text-gold-700"} ${className}`}>
      <span aria-hidden className={`h-px w-6 ${dark ? "bg-gold-400" : "bg-gold-500"}`} />{children}
    </p>
  );
}

export type BadgeTone = "gold" | "navy" | "neutral" | "success" | "glass";
const badgeTones: Record<BadgeTone, string> = {
  gold: "bg-gold-200 text-navy-900",
  navy: "bg-navy-900 text-white",
  neutral: "bg-white text-ink border border-line",
  success: "bg-success-bg text-success",
  glass: "bg-navy-900/60 text-white backdrop-blur border border-white/20",
};
export function Badge({ tone = "gold", children, className = "" }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium leading-4 ${badgeTones[tone]} ${className}`}>{children}</span>;
}

export function chipClass(selected: boolean) {
  return `inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[14px] font-medium transition-colors ${selected ? "bg-navy-900 text-white" : "border border-line-strong bg-white text-ink hover:border-navy-900"}`;
}

/* ------------------------------------------------------------------ */
/* Headings                                                            */
/* ------------------------------------------------------------------ */

/** Renders `text`, setting the first occurrence of `accent` (or an `accent` suffix) in gold italics. */
export function Accented({ text, accent }: { text: string; accent?: string }) {
  if (!accent) return <>{text}</>;
  const index = text.indexOf(accent);
  if (index < 0) return <>{text}{text ? " " : ""}<span className="accent">{accent}</span></>;
  return <>{text.slice(0, index)}<span className="accent">{accent}</span>{text.slice(index + accent.length)}</>;
}

export function SectionHeading({ eyebrow, title, accent, lead, dark = false, center = false, as: Tag = "h2", size = "h2", className = "", children }: {
  eyebrow?: string; title: string; accent?: string; lead?: ReactNode; dark?: boolean; center?: boolean; as?: "h1" | "h2"; size?: "display" | "h1" | "h2"; className?: string; children?: ReactNode;
}) {
  return (
    <div className={`${center ? "mx-auto text-center items-center" : ""} flex max-w-[760px] flex-col gap-4 md:gap-5 ${dark ? "on-dark" : ""} ${className}`}>
      {eyebrow && <Eyebrow dark={dark} className={center ? "justify-center" : ""}>{eyebrow}</Eyebrow>}
      <Tag className={`t-${size} ${dark ? "text-white" : "text-ink"}`}><Accented text={title} accent={accent} /></Tag>
      {lead && <div className={`t-body-l max-w-[640px] ${dark ? "text-slate-300" : "text-ink-muted"}`}>{lead}</div>}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Containers                                                          */
/* ------------------------------------------------------------------ */

const sectionBg = { white: "bg-white", subtle: "bg-ivory-50", warm: "bg-ivory-100", dark: "bg-navy-900 on-dark", deep: "bg-navy-950 on-dark" } as const;
export type SectionTone = keyof typeof sectionBg;

export function Section({ tone = "white", className = "", inner = "", id, children, label }: { tone?: SectionTone; className?: string; inner?: string; id?: string; children: ReactNode; label?: string }) {
  return (
    <section id={id} aria-label={label} className={`${sectionBg[tone]} section-y ${className}`}>
      <div className={`container-page ${inner}`}>{children}</div>
    </section>
  );
}

export function IconCircle({ children, size = 48, tone = "soft" }: { children: ReactNode; size?: number; tone?: "soft" | "white" | "dark" | "navy" }) {
  const tones = { soft: "bg-gold-200 text-gold-500", white: "bg-white text-gold-500", dark: "bg-navy-900 text-gold-400", navy: "bg-navy-800 text-gold-400" };
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full ${tones[tone]}`} style={{ width: size, height: size }}>{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

export const fieldControl = (error?: string) =>
  `w-full rounded-lg border bg-white px-4 text-[16px] text-ink placeholder:text-ink-subtle outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-200 ${error ? "border-danger" : "border-line-strong"}`;

export function Field({ label, htmlFor, helper, error, required, children, className = "" }: { label: string; htmlFor: string; helper?: string; error?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={htmlFor} className="t-label text-ink">{label}{required && <span className="text-danger" aria-hidden> *</span>}</label>
      {children}
      {error ? <p id={`${htmlFor}-error`} className="t-body-s text-danger">{error}</p> : helper ? <p id={`${htmlFor}-help`} className="t-body-s text-ink-muted">{helper}</p> : null}
    </div>
  );
}
