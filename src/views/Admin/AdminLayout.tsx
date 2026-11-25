"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, BookOpen, Globe, Building2, ExternalLink, FilePen, Inbox, Layers, LayoutDashboard, List, LogOut, Menu as MenuIcon,
  MessageSquare, Newspaper, PanelLeftClose, PanelLeftOpen, Search, Settings, Star, X, type LucideIcon,
} from "lucide-react";
import { api, type SearchResult } from "../../lib/api";
import { ToastProvider } from "../../components/admin/ui";

interface NavItem { href: string; label: string; icon: LucideIcon; exact?: boolean; count?: "enquiries" | "contacts" }
const navGroups: { label?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  { label: "Leads", items: [
    { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, count: "enquiries" },
    { href: "/admin/contacts", label: "Contact requests", icon: MessageSquare, count: "contacts" },
  ] },
  { label: "Content", items: [
    { href: "/admin/properties", label: "Projects", icon: Building2 },
    { href: "/admin/featured-project", label: "Featured project", icon: Star },
    { href: "/admin/articles", label: "Articles", icon: FilePen },
    { href: "/admin/press", label: "Press", icon: Newspaper },
    { href: "/admin/pages", label: "Pages", icon: Layers },
    { href: "/admin/menu", label: "Menu", icon: List },
    { href: "/admin/site-details", label: "Site details", icon: Globe },
  ] },
  { label: "Help", items: [
    { href: "/admin/guide", label: "User guide", icon: BookOpen },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ] },
];
const allItems = navGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })));

function activeItem(pathname: string) {
  return [...allItems].sort((a, b) => b.href.length - a.href.length).find((item) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)));
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/admin";
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [counts, setCounts] = useState({ enquiries: 0, contacts: 0 });

  // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a browser-only preference after hydration
  useEffect(() => { try { setCollapsed(window.localStorage.getItem("admin-sidebar") === "collapsed"); } catch { /* storage unavailable */ } }, []);
  const toggleCollapsed = () => setCollapsed((value) => { try { window.localStorage.setItem("admin-sidebar", value ? "open" : "collapsed"); } catch { /* ignore */ } return !value; });

  const loadCounts = useCallback(() => { api.getAdminCounts().then(setCounts).catch(() => undefined); }, []);
  useEffect(() => {
    loadCounts();
    const timer = window.setInterval(loadCounts, 30000);
    window.addEventListener("admin:counts", loadCounts);
    window.addEventListener("focus", loadCounts);
    return () => { window.clearInterval(timer); window.removeEventListener("admin:counts", loadCounts); window.removeEventListener("focus", loadCounts); };
  }, [loadCounts]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the mobile menu after navigating
  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function logout() { await api.logout().catch(() => undefined); router.push("/admin/login"); }

  const current = activeItem(pathname);
  const crumbs = [current?.group, current?.label].filter(Boolean) as string[];
  const totalNew = counts.enquiries + counts.contacts;

  return (
    <ToastProvider>
      <div className="admin-ui flex min-h-screen bg-ivory-50 text-ink" style={{ "--admin-sidebar": collapsed ? "76px" : "264px" } as React.CSSProperties}>
        <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>

        {/* Desktop sidebar */}
        <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-navy-950 text-white transition-[width] duration-200 lg:flex ${collapsed ? "w-[76px]" : "w-[264px]"}`}>
          <Sidebar collapsed={collapsed} pathname={pathname} counts={counts} onLogout={logout} headerAction={
            <button type="button" onClick={toggleCollapsed} className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label={collapsed ? "Expand menu" : "Collapse menu"} title={collapsed ? "Expand menu" : "Collapse menu"}>
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>} />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button type="button" className="absolute inset-0 animate-fade-in bg-navy-950/60" aria-label="Close menu" onClick={() => setDrawerOpen(false)} />
            <aside className="relative flex h-full w-[min(320px,86vw)] flex-col bg-navy-950 text-white shadow-float">
              <Sidebar collapsed={false} pathname={pathname} counts={counts} onLogout={logout} headerAction={
                <button type="button" onClick={() => setDrawerOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white" aria-label="Close menu"><X size={20} /></button>} />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 flex h-[60px] items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur md:px-6 lg:h-16 lg:px-8">
            <button type="button" onClick={() => setDrawerOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line lg:hidden" aria-label="Open menu"><MenuIcon size={20} /></button>
            <nav aria-label="Breadcrumb" className="min-w-0 flex-1 truncate text-[14px]">
              {crumbs.length > 1 && <span className="hidden text-ink-muted sm:inline">{crumbs[0]} <span aria-hidden className="mx-1.5 text-ink-subtle">/</span></span>}
              <span className="font-semibold text-ink">{crumbs[crumbs.length - 1] ?? "Admin"}</span>
            </nav>
            <button type="button" onClick={() => setSearchOpen(true)} className="hidden h-10 w-[280px] items-center gap-2.5 rounded-full border border-line bg-ivory-50 px-3.5 text-[14px] text-ink-subtle hover:border-line-strong md:flex xl:w-[340px]">
              <Search size={17} aria-hidden /> <span className="flex-1 text-left">Search everything…</span>
              <kbd className="rounded-md border border-line bg-white px-1.5 font-sans text-[11px] font-semibold text-ink-muted">⌘K</kbd>
            </button>
            <button type="button" onClick={() => setSearchOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full text-ink md:hidden" aria-label="Search"><Search size={20} /></button>
            <BellMenu counts={counts} total={totalNew} />
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-[14px] font-semibold text-ink hover:border-navy-900 sm:inline-flex">View site <ExternalLink size={15} aria-hidden /></a>
          </header>

          <main id="admin-main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8">
            {children}
          </main>
        </div>
        {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} onNavigate={(href) => { setSearchOpen(false); router.push(href); }} />}
      </div>
    </ToastProvider>
  );
}

function Sidebar({ collapsed, pathname, counts, onLogout, headerAction }: { collapsed: boolean; pathname: string; counts: { enquiries: number; contacts: number }; onLogout: () => void; headerAction: React.ReactNode }) {
  const current = activeItem(pathname);
  return (
    <>
      <div className={`flex h-[76px] shrink-0 items-center border-b border-white/10 ${collapsed ? "flex-col justify-center gap-1 px-2" : "justify-between px-5"}`}>
        {!collapsed && (
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <img src="/images/hpg-logo.png" alt="" className="h-9 w-auto" />
            <span className="min-w-0"><span className="block font-heading text-[18px] leading-6">HP Global</span><span className="block text-[12px] text-white/50">Admin panel</span></span>
          </Link>
        )}
        {headerAction}
      </div>
      <nav aria-label="Admin" className={`no-scrollbar flex-1 overflow-y-auto py-4 ${collapsed ? "px-3" : "px-4"}`}>
        {navGroups.map((group, index) => (
          <div key={group.label ?? index} className={index ? "mt-5" : ""}>
            {group.label && !collapsed && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">{group.label}</p>}
            {group.label && collapsed && <div aria-hidden className="mx-2 mb-3 border-t border-white/10" />}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = current?.href === item.href;
                const count = item.count ? counts[item.count] : 0;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined}
                      className={`relative flex h-10 items-center rounded-[10px] text-[14px] font-medium transition-colors ${collapsed ? "justify-center" : "gap-3 px-3"} ${active ? "bg-white/[0.08] text-white" : "text-white/70 hover:bg-white/[0.05] hover:text-white"}`}>
                      {active && <span aria-hidden className="absolute -left-4 top-2 h-6 w-[3px] rounded-r-full bg-gold-400" />}
                      <Icon size={18} aria-hidden className={active ? "text-gold-400" : ""} />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {count > 0 && (collapsed
                        ? <span aria-label={`${count} new`} className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-400" />
                        : <span className="rounded-full bg-gold-400 px-2 text-[12px] font-semibold leading-5 text-navy-950" aria-label={`${count} new`}>{count}</span>)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className={`flex shrink-0 items-center border-t border-white/10 py-4 ${collapsed ? "justify-center px-2" : "gap-3 px-5"}`}>
        {!collapsed && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400 text-[14px] font-semibold text-navy-950">A</span>}
        {!collapsed && <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">Administrator</span><span className="block text-[12px] text-white/50">Signed in</span></span>}
        <button type="button" onClick={onLogout} className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out"><LogOut size={18} /></button>
      </div>
    </>
  );
}

function BellMenu({ counts, total }: { counts: { enquiries: number; contacts: number }; total: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const esc = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={total ? `${total} new leads` : "Notifications"} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink hover:border-line-strong">
        <Bell size={18} aria-hidden />
        {total > 0 && <span aria-hidden className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold-500 ring-2 ring-white" />}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-72 animate-fade-in rounded-2xl border border-line bg-white p-2 shadow-float">
          {total === 0 ? <p className="px-3 py-4 text-center text-[14px] text-ink-muted">You&apos;re all caught up.</p> : (
            <ul>
              {counts.enquiries > 0 && <li><Link href="/admin/enquiries?status=new" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-ivory-50"><Inbox size={18} className="text-gold-700" aria-hidden /><span className="text-[14px]"><strong>{counts.enquiries}</strong> new {counts.enquiries === 1 ? "enquiry" : "enquiries"}</span></Link></li>}
              {counts.contacts > 0 && <li><Link href="/admin/contacts" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-ivory-50"><MessageSquare size={18} className="text-gold-700" aria-hidden /><span className="text-[14px]"><strong>{counts.contacts}</strong> unread {counts.contacts === 1 ? "message" : "messages"}</span></Link></li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SearchDialog({ onClose, onNavigate }: { onClose: () => void; onNavigate: (href: string) => void }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { input.current?.focus(); const esc = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", esc); return () => window.removeEventListener("keydown", esc); }, [onClose]);
  useEffect(() => {
    const q = term.trim();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clear results when the query is too short
    if (q.length < 2) { setResults(null); return; }
    let live = true;
    const timer = window.setTimeout(() => { api.searchAdmin(q).then(({ results: found }) => { if (live) { setResults(found); setActive(0); } }).catch(() => live && setResults([])); }, 200);
    return () => { live = false; window.clearTimeout(timer); };
  }, [term]);

  const pages = allItems.filter((item) => term.trim().length > 0 && item.label.toLowerCase().includes(term.trim().toLowerCase()));
  const options = [...pages.map((item) => ({ type: "Go to", title: item.label, detail: item.group ?? "", href: item.href })), ...(results ?? [])];

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-navy-950/50 p-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-xl animate-fade-in-up overflow-hidden rounded-[20px] bg-white shadow-float">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={19} className="text-ink-subtle" aria-hidden />
          <input ref={input} value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search projects, articles, pages, press and leads"
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(options.length - 1, value + 1)); }
              if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(0, value - 1)); }
              if (event.key === "Enter" && options[active]) onNavigate(options[active].href);
            }}
            className="h-14 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink-subtle" aria-label="Search" />
          <button type="button" onClick={onClose} className="rounded-md border border-line px-1.5 text-[12px] font-semibold text-ink-muted">Esc</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {term.trim().length < 2 && pages.length === 0 && <p className="px-3 py-6 text-center text-[14px] text-ink-muted">Type at least two letters. Try a project name, a phone number or a headline.</p>}
          {term.trim().length >= 2 && results !== null && options.length === 0 && <p className="px-3 py-6 text-center text-[14px] text-ink-muted">Nothing found for “{term.trim()}”.</p>}
          <ul>
            {options.map((option, index) => (
              <li key={`${option.type}-${option.href}-${index}`}>
                <button type="button" onMouseEnter={() => setActive(index)} onClick={() => onNavigate(option.href)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${index === active ? "bg-ivory-100" : ""}`}>
                  <span className="w-[104px] shrink-0 text-[12px] font-semibold uppercase tracking-[0.08em] text-gold-700">{option.type}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold text-ink">{option.title}</span>{option.detail && <span className="block truncate text-[13px] text-ink-muted">{option.detail}</span>}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
