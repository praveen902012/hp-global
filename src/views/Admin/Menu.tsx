"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, ChevronRight, ChevronUp, ExternalLink, Eye, EyeOff, Menu as MenuIcon, Monitor, Plus, RotateCcw, Save, Smartphone, Trash2 } from "lucide-react";
import Link from "next/link";
import { api } from "../../lib/api";
import { Button, PageHeader, fieldInput } from "../../components/admin/ui";
import { defaultSiteMenu, isValidMenuHref, MAX_MENU_ITEMS, MAX_MENU_LABEL_LENGTH, sitePages, type MenuItem, type SiteMenu } from "../../data/siteMenu";
import { buttonClass } from "../../components/site/ui";

const input = `${fieldInput} py-2 text-[14px]`;

const sections = [
  { key: "header", title: "Header menu", help: "The links in the top navigation bar, on desktop and mobile." },
  { key: "footer", title: "Footer menu", help: "The links in the footer's Explore column." },
] as const;

export function AdminMenu() {
  const [menu, setMenu] = useState<SiteMenu | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ error?: string; success?: string }>({});

  useEffect(() => {
    api.getMenu().then(setMenu).catch((error) => setStatus({ error: error instanceof Error ? error.message : "Unable to load the menu." }));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!menu) return <div className="text-[14px] text-ink-muted">{status.error || "Loading menu…"}</div>;

  const setList = (key: keyof SiteMenu, items: MenuItem[]) => { setMenu({ ...menu, [key]: items }); setDirty(true); setStatus({}); };
  const patch = (key: keyof SiteMenu, index: number, value: Partial<MenuItem>) => setList(key, menu[key].map((item, position) => position === index ? { ...item, ...value } : item));
  const move = (key: keyof SiteMenu, index: number, direction: -1 | 1) => {
    const items = [...menu[key]]; const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    setList(key, items);
  };
  const add = (key: keyof SiteMenu) => setList(key, [...menu[key], { label: "", href: "/", enabled: true, new_tab: false }]);
  const remove = (key: keyof SiteMenu, index: number) => setList(key, menu[key].filter((_, position) => position !== index));
  const reset = () => { if (window.confirm("Replace both menus with the original default links? This only takes effect once you save.")) { setMenu(structuredClone(defaultSiteMenu)); setDirty(true); setStatus({}); } };

  async function save() {
    setSaving(true); setStatus({});
    try { setMenu(await api.updateMenu(menu!)); setDirty(false); setStatus({ success: "Menu saved. The live site now shows these links." }); }
    catch (error) { setStatus({ error: error instanceof Error ? error.message : "Unable to save the menu." }); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader title="Menu" description={<>Rename, reorder, hide or add links in the site&apos;s header and footer navigation. <Link href="/admin/guide#menu" className="ml-1 whitespace-nowrap font-medium text-ink underline decoration-gold-400 underline-offset-4 hover:text-gold-700">How it works</Link></>} actions={<Button type="button" variant="outline" size="sm" onClick={reset} className="gap-2"><RotateCcw size={14} />Reset to default</Button>} />

      {status.error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{status.error}</div>}
      {status.success && <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status.success}</div>}

      <datalist id="site-pages">{sitePages.map((page) => <option key={page.href} value={page.href}>{page.label}</option>)}</datalist>

      <div className="space-y-6">
        {sections.map(({ key, title, help }) => (
          <section key={key} className="rounded-[20px] border border-line bg-white p-5 md:p-6">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div><h2 className="text-xl font-heading text-ink">{title}</h2><p className="mt-1 text-sm text-ink-muted">{help}</p></div>
              <span className="text-xs text-ink-subtle">{menu[key].length} / {MAX_MENU_ITEMS} links</span>
            </div>

            {key === "header" ? <HeaderPreview items={menu.header} /> : <FooterPreview items={menu.footer} />}

            {menu[key].length === 0 && <p className="mb-4 rounded-xl border border-dashed border-line-strong p-4 text-center text-sm text-ink-muted">No links. This menu will be empty on the site.</p>}

            <ol className="space-y-3">
              {menu[key].map((item, index) => {
                const href = item.href.trim();
                const hrefInvalid = href !== "" && !isValidMenuHref(href);
                return (
                  <li key={index} className={`rounded-2xl border p-3 ${item.enabled ? "border-line" : "border-dashed border-line-strong bg-ivory-50"}`}>
                    <div className="grid gap-3 md:grid-cols-[2rem_1fr_1.4fr_auto] md:items-start">
                      <span className="hidden pt-2 text-sm font-semibold text-ink-subtle md:block">{index + 1}.</span>
                      <label className="block text-[13px] font-semibold text-ink">Label
                        <input className={`${input} mt-1`} value={item.label} maxLength={MAX_MENU_LABEL_LENGTH} placeholder="e.g. Our Story" onChange={(event) => patch(key, index, { label: event.target.value })} />
                      </label>
                      <div>
                        <label className="block text-[13px] font-semibold text-ink">Link
                          <input className={`${input} mt-1 ${hrefInvalid ? "border-red-400" : ""}`} list="site-pages" value={item.href} placeholder="/about or https://…" onChange={(event) => patch(key, index, { href: event.target.value })} />
                        </label>
                        {hrefInvalid && <span className="mt-1 block text-xs text-red-600">Use a site path like /about, a full https:// URL, or a mailto:/tel: link.</span>}
                        <NewTabSwitch checked={item.new_tab} onChange={(new_tab) => patch(key, index, { new_tab })} />
                      </div>
                      <div className="flex items-center gap-1 md:pt-5">
                        <IconButton label={item.enabled ? "Shown on the site (click to hide)" : "Hidden on the site (click to show)"} active={!item.enabled} onClick={() => patch(key, index, { enabled: !item.enabled })}>{item.enabled ? <Eye size={16} /> : <EyeOff size={16} />}</IconButton>
                        {href && !hrefInvalid && !href.startsWith("mailto:") && !href.startsWith("tel:")
                          ? <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Visit this link (opens in a new browser tab)" title="Visit this link (opens in a new browser tab)" className={iconButtonClass()}><ExternalLink size={16} /></a>
                          : <span aria-hidden className={`${iconButtonClass()} pointer-events-none opacity-30`}><ExternalLink size={16} /></span>}
                        <IconButton label="Move up" disabled={index === 0} onClick={() => move(key, index, -1)}><ChevronUp size={16} /></IconButton>
                        <IconButton label="Move down" disabled={index === menu[key].length - 1} onClick={() => move(key, index, 1)}><ChevronDown size={16} /></IconButton>
                        <IconButton label="Remove link" danger onClick={() => remove(key, index)}><Trash2 size={16} /></IconButton>
                      </div>
                    </div>
                    {!item.enabled && <p className="mt-2 text-xs text-ink-muted md:pl-8">Hidden on the site</p>}
                  </li>
                );
              })}
            </ol>

            <button type="button" onClick={() => add(key)} disabled={menu[key].length >= MAX_MENU_ITEMS} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-2 text-sm text-ink-muted transition hover:border-navy-900 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50">
              <Plus size={16} />Add link
            </button>
          </section>
        ))}

        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-line bg-white/95 p-4 shadow-lg backdrop-blur">
          <span className="text-sm text-ink-muted">{dirty ? "You have unsaved changes" : "All changes saved"}</span>
          <Button type="button" onClick={() => void save()} disabled={saving || !dirty} className="gap-2"><Save size={16} />{saving ? "Saving…" : "Save menu"}</Button>
        </div>
      </div>
    </div>
  );
}

/** A labelled on/off switch, so the link's target can't be mistaken for a "visit" button. */
function NewTabSwitch({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="group mt-2 inline-flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink">
      <span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-navy-900" : "bg-line-strong"}`}>
        <span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </span>
      Open in a new tab
    </button>
  );
}

/* ---------- Previews ---------- */

const visible = (items: MenuItem[]) => items.filter((item) => item.enabled && item.label.trim());

function PreviewLabel({ item }: { item: MenuItem }) {
  return <>{item.label.trim()}{item.new_tab && <ArrowUpRight size={12} aria-label="opens in a new tab" className="ml-0.5 inline-block align-[-1px] opacity-60" />}</>;
}

function PreviewFrame({ caption, tabs, children }: { caption: string; tabs?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-ivory-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">Preview</span>
        {tabs}
      </div>
      <div className="p-4">{children}</div>
      <p className="border-t border-line px-4 py-2 text-xs text-ink-muted">{caption}</p>
    </div>
  );
}

function Brand({ dark }: { dark?: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-2.5">
      <img src="/images/hpg-logo.png" alt="" className="h-8 w-auto" />
      <span className={`flex flex-col leading-none ${dark ? "text-white" : "text-ink"}`}>
        <span className="font-heading text-[17px]">HP Global</span>
        <span className={`mt-1 text-[9px] font-semibold tracking-[0.32em] ${dark ? "text-gold-400" : "text-gold-700"}`}>INFRRA</span>
      </span>
    </span>
  );
}

function HeaderPreview({ items }: { items: MenuItem[] }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const links = visible(items);
  const desktopLinks = links.filter((item) => item.href.trim() !== "/");
  const tab = (value: typeof device, label: string, Icon: typeof Monitor) => (
    <button type="button" onClick={() => setDevice(value)} aria-pressed={device === value} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${device === value ? "bg-white text-ink shadow-sm ring-1 ring-line" : "text-ink-muted hover:text-ink"}`}><Icon size={13} />{label}</button>
  );

  return (
    <PreviewFrame
      tabs={<div className="flex gap-1">{tab("desktop", "Desktop", Monitor)}{tab("mobile", "Mobile", Smartphone)}</div>}
      caption={device === "desktop"
        ? "Updates as you edit. Hidden links are left out, and a Home link (/) only appears in the mobile menu, as on the live site. ↗ marks links that open in a new tab."
        : "Updates as you edit. This is the menu that opens from the menu button on phones and tablets. ↗ marks links that open in a new tab."}>
      {device === "desktop" ? (
        <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-[var(--shadow-soft)]">
          <div className="flex h-16 min-w-max items-center justify-between gap-6 px-5">
            <Brand />
            <nav className="flex items-center gap-0.5">
              {desktopLinks.length === 0 && <span className="text-sm italic text-ink-subtle">No links</span>}
              {desktopLinks.map((item, index) => <span key={index} className="whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-medium text-ink-muted"><PreviewLabel item={item} /></span>)}
            </nav>
            <span className={`${buttonClass("accent", "m")} pointer-events-none shrink-0`}>Enquire now</span>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[28px] border-[6px] border-navy-900 bg-navy-950 px-5 pb-6 pt-3 shadow-[var(--shadow-soft)]">
          <div className="flex h-12 items-center justify-between">
            <Brand dark />
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-700 text-white"><MenuIcon size={16} /></span>
          </div>
          <nav className="mt-3 flex flex-col">
            {links.length === 0 && <span className="py-4 text-sm italic text-slate-400">No links</span>}
            {links.map((item, index) => (
              <span key={index} className="flex items-center justify-between border-b border-navy-700 py-3 font-heading text-[20px] leading-7 text-white">
                <span><PreviewLabel item={item} /></span><ChevronRight size={18} className="text-slate-400" />
              </span>
            ))}
          </nav>
          <span className={`${buttonClass("accent", "m", "mt-5 w-full")} pointer-events-none`}>Enquire now</span>
        </div>
      )}
    </PreviewFrame>
  );
}

function FooterPreview({ items }: { items: MenuItem[] }) {
  const links = visible(items);
  return (
    <PreviewFrame caption={links.length ? "Updates as you edit. Hidden links are left out. ↗ marks links that open in a new tab." : "With no visible links, the Explore column is removed from the footer."}>
      <div className="rounded-xl bg-navy-950 px-6 py-6 text-white">
        <div className="grid gap-8 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div className="flex flex-col gap-3"><Brand dark /><span className="h-2 w-40 rounded-full bg-navy-800" /><span className="h-2 w-28 rounded-full bg-navy-800" /></div>
          <div className={`flex flex-col gap-3 ${links.length ? "" : "opacity-40"}`}>
            <p className="t-overline text-gold-400">Explore</p>
            <ul className="flex flex-col gap-2.5">
              {links.length === 0 && <li className="text-sm italic text-slate-400">No links</li>}
              {links.map((item, index) => <li key={index} className="text-[15px] leading-6 text-slate-300"><PreviewLabel item={item} /></li>)}
            </ul>
          </div>
          <div className="hidden flex-col gap-3 sm:flex"><p className="t-overline text-gold-400">Get in touch</p><span className="h-2 w-36 rounded-full bg-navy-800" /><span className="h-2 w-28 rounded-full bg-navy-800" /><span className="h-2 w-32 rounded-full bg-navy-800" /></div>
        </div>
      </div>
    </PreviewFrame>
  );
}

function iconButtonClass(danger?: boolean, active?: boolean) {
  return `inline-flex rounded-xl p-2 transition disabled:cursor-not-allowed disabled:opacity-30 ${danger ? "text-red-500 hover:bg-red-50" : active ? "bg-gold-200/60 text-ink" : "text-ink-muted hover:bg-ivory-100 hover:text-ink"}`;
}

function IconButton({ label, onClick, disabled, danger, active, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className={iconButtonClass(danger, active)}>
      {children}
    </button>
  );
}
