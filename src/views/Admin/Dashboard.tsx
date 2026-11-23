"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Building2, ChevronRight, ExternalLink, FilePen, Inbox, Info, Layers, MessageSquare, Newspaper, Phone, Plus, type LucideIcon } from "lucide-react";
import { api, type DashboardStats } from "../../lib/api";
import { WhatsAppIcon } from "../../components/site/brand-icons";
import { Button, adminButtonClass, Card, EmptyState, IconButton, Notice, PageHeader, StatusPill, friendlyDate, phoneLinks, tdClass, thClass } from "../../components/admin/ui";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hello, setHello] = useState("Welcome back");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the greeting depends on the visitor's clock, so it is set after hydration
    setHello(greeting());
    api.getDashboardStats().then(setStats).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load the dashboard."));
  }, []);

  const c = stats?.counts;
  const kpis: { label: string; value?: number; hint: string; icon: LucideIcon; href: string }[] = [
    { label: "New enquiries", value: c?.new_enquiries, hint: `${c?.enquiries_week ?? 0} this week`, icon: Inbox, href: "/admin/enquiries?status=new" },
    { label: "Unread messages", value: c?.unread_contacts, hint: `${c?.contacts_week ?? 0} this week`, icon: MessageSquare, href: "/admin/contacts" },
    { label: "Live projects", value: c?.live_projects, hint: c?.hidden_projects ? `${c.hidden_projects} hidden` : "All visible", icon: Building2, href: "/admin/properties" },
    { label: "Articles", value: c?.published_articles, hint: c?.draft_articles ? `${c.draft_articles} ${c.draft_articles === 1 ? "draft" : "drafts"}` : "No drafts", icon: FilePen, href: "/admin/articles" },
    { label: "Press coverage", value: c?.press_items, hint: "On the website", icon: Newspaper, href: "/admin/press" },
  ];

  return (
    <div>
      <PageHeader title={hello} description={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        actions={<><Button variant="outline" to="/" target="_blank">View site <ExternalLink size={15} aria-hidden /></Button><Button to="/admin/properties/new"><Plus size={16} aria-hidden />Add project</Button></>} />
      {error && <Notice tone="error">{error}</Notice>}

      <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
        {kpis.map(({ label, value, hint, icon: Icon, href }) => (
          <Link key={label} href={href} className="group rounded-[20px] border border-line bg-white p-4 transition hover:border-line-strong hover:shadow-card md:p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-medium leading-5 text-ink-muted md:text-[14px]">{label}</p>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-200 text-navy-900"><Icon size={18} aria-hidden /></span>
            </div>
            <p className="mt-2 font-heading text-[34px] leading-10 text-ink">{value ?? "–"}</p>
            <p className="mt-1 text-[13px] text-ink-muted">{hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Card title="Latest enquiries" description="Call or WhatsApp new leads within 24 hours." bodyClassName="" actions={<Link href="/admin/enquiries" className="inline-flex items-center gap-1 text-[14px] font-semibold text-gold-700 hover:text-ink">View all <ArrowRight size={15} aria-hidden /></Link>}>
            {!stats ? <p className="p-6 text-[14px] text-ink-muted">Loading…</p> : stats.latestEnquiries.length === 0 ? <EmptyState icon={<Inbox size={24} />} title="No enquiries yet" description="Enquiries from project pages and the enquiry pop-up appear here." /> : (
              <>
                <div className="hidden md:block">
                  <table className="w-full text-left text-[14px]">
                    <thead><tr><th className={thClass}>Name</th><th className={thClass}>Project</th><th className={thClass}>Received</th><th className={thClass}>Status</th><th className={thClass}><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {stats.latestEnquiries.map((enquiry) => {
                        const links = phoneLinks(enquiry.phone);
                        return (
                          <tr key={enquiry.id} className="hover:bg-ivory-50">
                            <td className={`${tdClass} whitespace-nowrap`}><Link href={`/admin/enquiries?id=${enquiry.id}`} className="font-semibold text-ink hover:text-gold-700">{enquiry.name}</Link><p className="text-[13px] text-ink-muted">{enquiry.phone}</p></td>
                            <td className={`${tdClass} max-w-[220px] truncate`}>{enquiry.project_title}</td>
                            <td className={`${tdClass} whitespace-nowrap text-ink-muted`}>{friendlyDate(enquiry.created_at)}</td>
                            <td className={tdClass}><StatusPill status={enquiry.status ?? "new"} /></td>
                            <td className={tdClass}><div className="flex justify-end gap-1.5"><IconButton tone="outline" label={`Call ${enquiry.name}`} href={links.tel}><Phone size={16} /></IconButton><IconButton tone="outline" label={`WhatsApp ${enquiry.name}`} href={links.whatsapp} target="_blank"><WhatsAppIcon size={16} /></IconButton></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <ul className="divide-y divide-line md:hidden">
                  {stats.latestEnquiries.map((enquiry) => {
                    const links = phoneLinks(enquiry.phone);
                    return (
                      <li key={enquiry.id} className="p-4">
                        <div className="flex items-center justify-between gap-3"><Link href={`/admin/enquiries?id=${enquiry.id}`} className="font-semibold text-ink">{enquiry.name}</Link><StatusPill status={enquiry.status ?? "new"} /></div>
                        <p className="mt-1 text-[14px] text-ink-muted">{enquiry.project_title} · {friendlyDate(enquiry.created_at)}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2"><a href={links.tel} className={adminButtonClass("primary", "sm")}><Phone size={15} aria-hidden />Call</a><a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-line-strong text-[13px] font-semibold text-ink">WhatsApp <WhatsAppIcon size={15} /></a></div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Card>

          <Card title="Recent contact requests" bodyClassName="" actions={<Link href="/admin/contacts" className="inline-flex items-center gap-1 text-[14px] font-semibold text-gold-700 hover:text-ink">Open inbox <ArrowRight size={15} aria-hidden /></Link>}>
            {!stats ? <p className="p-6 text-[14px] text-ink-muted">Loading…</p> : stats.latestContacts.length === 0 ? <p className="p-6 text-[14px] text-ink-muted">No messages yet.</p> : (
              <ul className="divide-y divide-line">
                {stats.latestContacts.map((message) => (
                  <li key={message.id}>
                    <Link href={`/admin/contacts?id=${message.id}`} className="flex items-start gap-3 px-5 py-4 hover:bg-ivory-50 md:px-6">
                      <span aria-hidden className={`mt-2 h-2 w-2 shrink-0 rounded-full ${message.read_at ? "bg-transparent" : "bg-gold-500"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3"><span className={`truncate text-[14px] ${message.read_at ? "font-medium" : "font-semibold"} text-ink`}>{message.name}</span><span className="shrink-0 text-[13px] text-ink-muted">{friendlyDate(message.created_at)}</span></span>
                        <span className="mt-0.5 line-clamp-1 text-[14px] text-ink-muted">{message.message}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Needs attention" bodyClassName="p-2">
            {!stats ? <p className="p-4 text-[14px] text-ink-muted">Checking…</p> : stats.attention.length === 0 ? <p className="p-4 text-[14px] text-ink-muted">Everything looks good. Nothing needs your attention.</p> : (
              <ul>
                {stats.attention.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="flex items-start gap-3 rounded-2xl px-3 py-3 hover:bg-ivory-50">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.tone === "warning" ? "bg-gold-200 text-navy-900" : "bg-slate-100 text-ink-muted"}`}>{item.tone === "warning" ? <AlertTriangle size={16} aria-hidden /> : <Info size={16} aria-hidden />}</span>
                      <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold leading-5 text-ink">{item.title}</span><span className="mt-0.5 block text-[13px] leading-5 text-ink-muted">{item.detail}</span></span>
                      <ChevronRight size={16} aria-hidden className="mt-2 shrink-0 text-ink-subtle" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Quick actions" bodyClassName="grid grid-cols-2 gap-2 p-4">
            {[
              { href: "/admin/properties/new", label: "Add project", icon: Building2 },
              { href: "/admin/articles/new", label: "Write article", icon: FilePen },
              { href: "/admin/press?new=1", label: "Add press", icon: Newspaper },
              { href: "/admin/pages", label: "New page", icon: Layers },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex flex-col gap-3 rounded-2xl border border-line p-4 text-[14px] font-semibold text-ink transition hover:border-navy-900">
                <Icon size={20} aria-hidden className="text-gold-700" />{label}
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
