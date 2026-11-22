"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { defaultSiteMenu, isValidMenuHref, MAX_MENU_ITEMS, MAX_MENU_LABEL_LENGTH, sitePages, type MenuItem, type SiteMenu } from "../../data/siteMenu";

const input = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-champagne focus:ring-2 focus:ring-brand-champagne/20";
const sections = [
  { key: "header", title: "Header menu", help: "The links in the top navigation bar, on desktop and mobile." },
  { key: "footer", title: "Footer menu", help: "The links in the footer's Navigation column." },
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

  if (!menu) return <div className="p-10 text-slate-500">{status.error || "Loading menu…"}</div>;

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
    <div className="p-6 lg:p-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-brand-champagne">Content management</p>
          <h1 className="text-3xl font-heading text-brand-charcoal">Menu</h1>
          <p className="mt-2 text-sm text-slate-500">Rename, reorder, hide or add links in the site&apos;s header and footer navigation. <Link href="/admin/guide#menu" className="ml-1 whitespace-nowrap font-medium text-brand-charcoal underline decoration-brand-champagne underline-offset-4 hover:text-brand-champagne">How it works</Link></p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={reset} className="gap-2"><RotateCcw size={14} />Reset to default</Button>
      </div>

      {status.error && <div role="alert" className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{status.error}</div>}
      {status.success && <div role="status" className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status.success}</div>}

      <datalist id="site-pages">{sitePages.map((page) => <option key={page.href} value={page.href}>{page.label}</option>)}</datalist>

      <div className="space-y-6">
        {sections.map(({ key, title, help }) => (
          <section key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div><h2 className="text-xl font-heading text-brand-charcoal">{title}</h2><p className="mt-1 text-sm text-slate-500">{help}</p></div>
              <span className="text-xs text-slate-400">{menu[key].length} / {MAX_MENU_ITEMS} links</span>
            </div>

            {menu[key].length === 0 && <p className="mb-4 rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">No links. This menu will be empty on the site.</p>}

            <ol className="space-y-3">
              {menu[key].map((item, index) => {
                const hrefInvalid = item.href.trim() !== "" && !isValidMenuHref(item.href.trim());
                return (
                  <li key={index} className={`rounded-lg border p-3 ${item.enabled ? "border-slate-200" : "border-dashed border-slate-300 bg-slate-50"}`}>
                    <div className="grid gap-3 md:grid-cols-[2rem_1fr_1.4fr_auto] md:items-start">
                      <span className="hidden pt-2 text-sm font-semibold text-slate-400 md:block">{index + 1}.</span>
                      <label className="block text-xs font-medium text-slate-600">Label
                        <input className={`${input} mt-1`} value={item.label} maxLength={MAX_MENU_LABEL_LENGTH} placeholder="e.g. Our Story" onChange={(event) => patch(key, index, { label: event.target.value })} />
                      </label>
                      <label className="block text-xs font-medium text-slate-600">Link
                        <input className={`${input} mt-1 ${hrefInvalid ? "border-red-400" : ""}`} list="site-pages" value={item.href} placeholder="/about or https://…" onChange={(event) => patch(key, index, { href: event.target.value })} />
                        {hrefInvalid && <span className="mt-1 block text-xs font-normal text-red-600">Use a site path like /about, a full https:// URL, or a mailto:/tel: link.</span>}
                      </label>
                      <div className="flex items-center gap-1 md:pt-5">
                        <IconButton label={item.enabled ? "Hide from site" : "Show on site"} onClick={() => patch(key, index, { enabled: !item.enabled })}>{item.enabled ? <Eye size={16} /> : <EyeOff size={16} />}</IconButton>
                        <IconButton label={item.new_tab ? "Opens in a new tab (click to change)" : "Opens in the same tab (click to change)"} active={item.new_tab} onClick={() => patch(key, index, { new_tab: !item.new_tab })}><ExternalLink size={16} /></IconButton>
                        <IconButton label="Move up" disabled={index === 0} onClick={() => move(key, index, -1)}><ChevronUp size={16} /></IconButton>
                        <IconButton label="Move down" disabled={index === menu[key].length - 1} onClick={() => move(key, index, 1)}><ChevronDown size={16} /></IconButton>
                        <IconButton label="Remove link" danger onClick={() => remove(key, index)}><Trash2 size={16} /></IconButton>
                      </div>
                    </div>
                    {(!item.enabled || item.new_tab) && <p className="mt-2 text-xs text-slate-500 md:pl-8">{[!item.enabled && "Hidden on the site", item.new_tab && "Opens in a new tab"].filter(Boolean).join(" · ")}</p>}
                  </li>
                );
              })}
            </ol>

            <button type="button" onClick={() => add(key)} disabled={menu[key].length >= MAX_MENU_ITEMS} className="mt-4 inline-flex items-center gap-2 rounded-md border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:border-brand-champagne hover:text-brand-charcoal disabled:cursor-not-allowed disabled:opacity-50">
              <Plus size={16} />Add link
            </button>
          </section>
        ))}

        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <span className="text-sm text-slate-500">{dirty ? "You have unsaved changes" : "All changes saved"}</span>
          <Button type="button" onClick={() => void save()} disabled={saving || !dirty} className="gap-2"><Save size={16} />{saving ? "Saving…" : "Save menu"}</Button>
        </div>
      </div>
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, active, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}
      className={`rounded-md p-2 transition disabled:cursor-not-allowed disabled:opacity-30 ${danger ? "text-red-500 hover:bg-red-50" : active ? "bg-brand-champagne/15 text-brand-charcoal" : "text-slate-500 hover:bg-slate-100 hover:text-brand-charcoal"}`}>
      {children}
    </button>
  );
}
