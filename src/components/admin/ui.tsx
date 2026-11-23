"use client";

/* Shared building blocks for the admin panel (Figma: Admin components). */

import Link from "next/link";
import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ArrowLeft, CheckCircle2, Search, X, AlertTriangle, Info } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Form controls                                                       */
/* ------------------------------------------------------------------ */

/** Text input / select / textarea look. `inputClass` keeps the top margin used under a label. */
export const fieldInput = "w-full rounded-xl font-normal border border-line-strong bg-white px-3.5 py-2.5 text-[15px] leading-6 text-ink placeholder:text-ink-subtle outline-none transition focus:border-navy-900 focus:ring-4 focus:ring-gold-200/70 disabled:bg-ivory-50 disabled:text-ink-muted";
export const inputClass = `mt-1.5 ${fieldInput}`;
export const labelClass = "block text-[14px] font-semibold leading-5 text-ink";
export const helpClass = "mt-1.5 block text-[13px] font-normal leading-5 text-ink-muted";

export function Field({ label, help, children, className = "" }: { label: ReactNode; help?: ReactNode; children: ReactNode; className?: string }) {
  return <label className={`${labelClass} ${className}`}>{label}{children}{help && <span className={helpClass}>{help}</span>}</label>;
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-800",
  accent: "bg-gold-400 text-navy-900 hover:bg-gold-300",
  secondary: "border border-line-strong bg-white text-ink hover:border-navy-900",
  outline: "border border-line-strong bg-white text-ink hover:border-navy-900",
  ghost: "text-ink hover:bg-ivory-100",
  danger: "border border-red-200 bg-white text-danger hover:bg-danger-bg",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  md: "h-10 px-[18px] text-[14px] gap-2",
  lg: "h-12 px-6 text-[15px] gap-2.5",
};

export function adminButtonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-semibold leading-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; to?: string; target?: string }

/** Pill button. Pass `to` to render a link. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "primary", size = "md", to, target, className = "", type = "button", children, ...rest }, ref) => {
  const cls = adminButtonClass(variant, size, className);
  if (to) return <Link href={to} target={target} rel={target ? "noopener noreferrer" : undefined} className={cls}>{children}</Link>;
  return <button ref={ref} type={type} className={cls} {...rest}>{children}</button>;
});
Button.displayName = "AdminButton";

/** Square icon-only button with an accessible label. */
export function IconButton({ label, children, onClick, href, target, tone = "ghost", disabled, className = "" }: { label: string; children: ReactNode; onClick?: () => void; href?: string; target?: string; tone?: "ghost" | "outline" | "danger"; disabled?: boolean; className?: string }) {
  const toneClass = tone === "outline" ? "border border-line bg-white text-ink hover:border-navy-900" : tone === "danger" ? "text-ink-muted hover:bg-danger-bg hover:text-danger" : "text-ink-muted hover:bg-ivory-100 hover:text-ink";
  const cls = `inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${toneClass} ${className}`;
  if (href) return <a href={href} target={target} rel={target ? "noopener noreferrer" : undefined} title={label} aria-label={label} className={cls}>{children}</a>;
  return <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className={cls}>{children}</button>;
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function PageHeader({ title, description, actions, back }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {back && <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted hover:text-ink"><ArrowLeft size={16} aria-hidden />{back.label}</Link>}
        <h1 className="font-heading text-[28px] leading-9 text-ink md:text-[32px] md:leading-10">{title}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-[15px] leading-6 text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

export function Card({ title, description, actions, children, className = "", bodyClassName = "p-5 md:p-6", id }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; id?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-[20px] border border-line bg-white ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
          <div className="min-w-0">
            {title && <h2 className="font-sans text-[17px] font-semibold leading-6 text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[14px] leading-5 text-ink-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Status, tabs, toggles                                               */
/* ------------------------------------------------------------------ */

export type StatusName = "new" | "contacted" | "closed" | "published" | "draft" | "hidden" | "featured" | "unread";
const statusStyles: Record<StatusName, { label: string; cls: string; dot: string }> = {
  new: { label: "New", cls: "bg-gold-200 text-navy-900", dot: "bg-gold-500" },
  unread: { label: "Unread", cls: "bg-gold-200 text-navy-900", dot: "bg-gold-500" },
  contacted: { label: "Contacted", cls: "bg-slate-100 text-navy-900", dot: "bg-navy-900" },
  closed: { label: "Closed", cls: "bg-slate-100 text-ink-muted", dot: "bg-ink-subtle" },
  published: { label: "Published", cls: "bg-success-bg text-success", dot: "bg-success" },
  draft: { label: "Draft", cls: "bg-ivory-100 text-gold-700", dot: "bg-gold-500" },
  hidden: { label: "Hidden", cls: "bg-slate-100 text-ink-muted", dot: "bg-ink-subtle" },
  featured: { label: "Featured", cls: "bg-navy-900 text-white", dot: "bg-gold-400" },
};
export function StatusPill({ status, label }: { status: StatusName; label?: string }) {
  const style = statusStyles[status];
  return <span className={`inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-semibold leading-none ${style.cls}`}><span aria-hidden className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />{label ?? style.label}</span>;
}

export function SegTabs<T extends string>({ value, onChange, options, label }: { value: T; onChange: (value: T) => void; options: { value: T; label: string; count?: number }[]; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full bg-ivory-100 p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button key={option.value} type="button" role="tab" aria-selected={selected} onClick={() => onChange(option.value)} className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${selected ? "bg-white text-ink shadow-soft" : "text-ink-muted hover:text-ink"}`}>
            {option.label}
            {option.count !== undefined && <span className={`rounded-full px-1.5 text-[11px] leading-[18px] ${selected ? "bg-gold-200 text-navy-900" : "bg-white/70 text-ink-muted"}`}>{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, className = "" }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{placeholder}</span>
      <Search size={17} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${fieldInput} h-10 py-0 pl-10 text-[14px]`} />
    </label>
  );
}

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (checked: boolean) => void; label: ReactNode; description?: ReactNode; disabled?: boolean }) {
  return (
    <label className={`flex items-start justify-between gap-4 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <span className="min-w-0"><span className="block text-[14px] font-semibold leading-5 text-ink">{label}</span>{description && <span className="mt-0.5 block text-[13px] leading-5 text-ink-muted">{description}</span>}</span>
      <SwitchControl checked={checked} onChange={onChange} disabled={disabled} />
    </label>
  );
}

/** The switch on its own (wrap it in a label, or pass `label` for screen readers). */
export function SwitchControl({ checked, onChange, disabled, label }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <span className="relative inline-flex shrink-0">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span aria-hidden className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-navy-900 peer-focus-visible:ring-4 peer-focus-visible:ring-gold-200" />
      <span aria-hidden className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform peer-checked:translate-x-5" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ivory-100 text-gold-700">{icon}</span>
      <p className="text-[17px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-md text-[14px] leading-[22px] text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children, onClose }: { tone?: "info" | "success" | "error" | "warning"; children: ReactNode; onClose?: () => void }) {
  const styles = { info: "border-line bg-ivory-50 text-ink", success: "border-green-200 bg-success-bg text-success", error: "border-red-200 bg-danger-bg text-danger", warning: "border-gold-300 bg-gold-200/50 text-navy-900" }[tone];
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" || tone === "warning" ? AlertTriangle : Info;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-[14px] leading-[22px] ${styles}`}>
      <Icon size={18} aria-hidden className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && <button type="button" onClick={onClose} aria-label="Dismiss" className="-m-1 rounded p-1 opacity-70 hover:opacity-100"><X size={16} /></button>}
    </div>
  );
}

/* Toasts: short confirmations shown at the bottom of the screen. */
const ToastContext = createContext<(message: string, tone?: "success" | "error") => void>(() => undefined);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; tone: "success" | "error" } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback((message: string, tone: "success" | "error" = "success") => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4">
        {toast && (
          <div key={toast.id} className="pointer-events-auto flex animate-fade-in-up items-center gap-3 rounded-full bg-navy-900 py-2.5 pl-4 pr-2.5 text-[14px] font-medium text-white shadow-float">
            {toast.tone === "success" ? <CheckCircle2 size={18} className="text-gold-400" aria-hidden /> : <AlertTriangle size={18} className="text-red-300" aria-hidden />}
            {toast.message}
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss" className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"><X size={15} /></button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

/** Tells the sidebar to refresh its New / Unread counts. */
export function refreshAdminCounts() {
  window.dispatchEvent(new Event("admin:counts"));
}

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

export const tableWrap = "overflow-x-auto";
export const tableClass = "w-full text-left text-[14px]";
export const thClass = "whitespace-nowrap border-b border-line bg-ivory-50 px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted first:pl-5 last:pr-5 md:first:pl-6 md:last:pr-6";
export const tdClass = "border-b border-line px-4 py-3.5 align-middle text-ink first:pl-5 last:pr-5 md:first:pl-6 md:last:pr-6";

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
/** "Today, 6:56 pm", "Yesterday, 9:10 am" or "20 Nov 2026". */
export function friendlyDate(value: string, withTime = true) {
  const date = new Date(value);
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  if (sameDay(date, now)) return withTime ? `Today, ${time}` : "Today";
  if (sameDay(date, yesterday)) return withTime ? `Yesterday, ${time}` : "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

/** Indian mobile numbers to a tel: and wa.me friendly form. */
export function phoneLinks(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  return { tel: `tel:+${full}`, whatsapp: `https://wa.me/${full}` };
}
