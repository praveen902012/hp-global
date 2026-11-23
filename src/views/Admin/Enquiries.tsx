"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Inbox, Phone, Trash2, X } from "lucide-react";
import { api, type Enquiry, type EnquiryStatus } from "../../lib/api";
import { WhatsAppIcon } from "../../components/site/brand-icons";
import {
  Button, EmptyState, IconButton, Notice, PageHeader, SearchInput, SegTabs, StatusPill, adminButtonClass, fieldInput, friendlyDate,
  labelClass, phoneLinks, refreshAdminCounts, tdClass, thClass, useToast,
} from "../../components/admin/ui";

type Filter = "all" | EnquiryStatus;
const PER_PAGE = 12;
const statusOf = (enquiry: Enquiry): EnquiryStatus => enquiry.status ?? "new";

function downloadCsv(rows: Enquiry[]) {
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [
    ["ID", "Name", "Phone", "WhatsApp updates", "Project", "Page", "Status", "Notes", "Received"].join(","),
    ...rows.map((row) => [row.id, cell(row.name), cell(row.phone), row.whatsapp_consent ? "Yes" : "No", cell(row.project_title), cell(row.source ?? ""), statusOf(row), cell(row.notes ?? ""), cell(new Date(row.created_at).toLocaleString("en-IN"))].join(",")),
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url; link.download = `enquiries_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

export function AdminEnquiries() {
  const toast = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();
  const [filter, setFilterState] = useState<Filter>(() => { const status = params?.get("status"); return status === "new" || status === "contacted" || status === "closed" ? status : "all"; });
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(() => Number(params?.get("id")) || null);
  const setFilter = (value: Filter) => { setFilterState(value); setPage(1); };
  const setSearch = (value: string) => { setSearchState(value); setPage(1); };

  const load = useCallback(async () => {
    try { setEnquiries(await api.listEnquiries()); setError(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load enquiries."); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the server
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const counts = useMemo(() => {
    const all = enquiries ?? [];
    return { all: all.length, new: all.filter((e) => statusOf(e) === "new").length, contacted: all.filter((e) => statusOf(e) === "contacted").length, closed: all.filter((e) => statusOf(e) === "closed").length };
  }, [enquiries]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const digits = term.replace(/\D/g, "");
    return (enquiries ?? []).filter((enquiry) => (filter === "all" || statusOf(enquiry) === filter) && (!term
      || `${enquiry.name} ${enquiry.project_title}`.toLowerCase().includes(term)
      || (digits.length >= 3 && enquiry.phone.replace(/\D/g, "").includes(digits))));
  }, [enquiries, filter, search]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageRows = visible.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const selected = enquiries?.find((enquiry) => enquiry.id === selectedId) ?? null;

  function replace(updated: Enquiry) { setEnquiries((rows) => rows?.map((row) => (row.id === updated.id ? updated : row)) ?? rows); }

  async function update(enquiry: Enquiry, patch: { status?: EnquiryStatus; notes?: string }, message: string) {
    try { replace(await api.updateEnquiry(enquiry.id, patch)); refreshAdminCounts(); toast(message); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to save.", "error"); }
  }
  async function remove(enquiry: Enquiry) {
    if (!window.confirm(`Delete the enquiry from ${enquiry.name}? This cannot be undone.`)) return;
    try { await api.deleteEnquiry(enquiry.id); setEnquiries((rows) => rows?.filter((row) => row.id !== enquiry.id) ?? rows); setSelectedId(null); refreshAdminCounts(); toast("Enquiry deleted."); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to delete.", "error"); }
  }

  return (
    <div>
      <PageHeader title="Enquiries" description="Leads from enquiry forms on project pages, the header and the pop-up. Call or WhatsApp new leads within 24 hours."
        actions={<Button variant="outline" onClick={() => downloadCsv(visible)} disabled={!visible.length}><Download size={16} aria-hidden />Export CSV</Button>} />
      {error && <Notice tone="error">{error}</Notice>}

      <div className={`grid gap-6 ${selected ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
        <section className="min-w-0 rounded-[20px] border border-line bg-white">
          <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between md:px-6">
            <SegTabs label="Filter enquiries" value={filter} onChange={setFilter} options={[{ value: "all", label: "All", count: counts.all }, { value: "new", label: "New", count: counts.new }, { value: "contacted", label: "Contacted", count: counts.contacted }, { value: "closed", label: "Closed", count: counts.closed }]} />
            <SearchInput value={search} onChange={setSearch} placeholder="Search name, phone or project" className="md:w-72" />
          </div>

          {enquiries === null ? <p className="p-6 text-[14px] text-ink-muted">Loading enquiries…</p> : pageRows.length === 0 ? (
            <EmptyState icon={<Inbox size={24} />} title={enquiries.length ? "No matching enquiries" : "No enquiries yet"} description={enquiries.length ? "Try another filter or search." : "Enquiries from project pages and the enquiry pop-up appear here."} />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-[14px]">
                  <thead><tr><th className={thClass}>Name</th><th className={thClass}>Project</th><th className={thClass}>Received</th><th className={thClass}>Status</th><th className={thClass}><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {pageRows.map((enquiry) => {
                      const links = phoneLinks(enquiry.phone);
                      const active = enquiry.id === selectedId;
                      return (
                        <tr key={enquiry.id} onClick={() => setSelectedId(enquiry.id)} className={`cursor-pointer ${active ? "bg-ivory-100" : "hover:bg-ivory-50"}`}>
                          <td className={tdClass}><button type="button" onClick={() => setSelectedId(enquiry.id)} className={`text-left text-ink ${statusOf(enquiry) === "new" ? "font-semibold" : "font-medium"}`}>{enquiry.name}</button><p className="text-[13px] text-ink-muted">{enquiry.phone}</p></td>
                          <td className={`${tdClass} max-w-[240px] truncate`}>{enquiry.project_title}</td>
                          <td className={`${tdClass} whitespace-nowrap text-ink-muted`}>{friendlyDate(enquiry.created_at)}</td>
                          <td className={tdClass}><StatusPill status={statusOf(enquiry)} /></td>
                          <td className={tdClass} onClick={(event) => event.stopPropagation()}><div className="flex justify-end gap-1.5"><IconButton tone="outline" label={`Call ${enquiry.name}`} href={links.tel}><Phone size={16} /></IconButton><IconButton tone="outline" label={`WhatsApp ${enquiry.name}`} href={links.whatsapp} target="_blank"><WhatsAppIcon size={16} /></IconButton></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-line md:hidden">
                {pageRows.map((enquiry) => {
                  const links = phoneLinks(enquiry.phone);
                  return (
                    <li key={enquiry.id} className="p-4">
                      <button type="button" onClick={() => setSelectedId(enquiry.id)} className="block w-full text-left">
                        <span className="flex items-center justify-between gap-3"><span className="font-semibold text-ink">{enquiry.name}</span><StatusPill status={statusOf(enquiry)} /></span>
                        <span className="mt-1 block text-[14px] text-ink-muted">{enquiry.project_title} · {friendlyDate(enquiry.created_at)}</span>
                      </button>
                      <div className="mt-3 grid grid-cols-2 gap-2"><a href={links.tel} className={adminButtonClass("primary", "sm")}><Phone size={15} aria-hidden />Call</a><a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className={adminButtonClass("outline", "sm")}>WhatsApp <WhatsAppIcon size={15} /></a></div>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center justify-between gap-3 px-5 py-4 md:px-6">
                <p className="text-[14px] text-ink-muted">Showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, visible.length)} of {visible.length}</p>
                {totalPages > 1 && <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setPage(current - 1)} disabled={current === 1}>Previous</Button><Button variant="outline" size="sm" onClick={() => setPage(current + 1)} disabled={current === totalPages}>Next</Button></div>}
              </div>
            </>
          )}
        </section>

        {selected && <EnquiryDetail key={selected.id} enquiry={selected} onClose={() => setSelectedId(null)} onUpdate={update} onDelete={remove} />}
      </div>
    </div>
  );
}

function EnquiryDetail({ enquiry, onClose, onUpdate, onDelete }: { enquiry: Enquiry; onClose: () => void; onUpdate: (enquiry: Enquiry, patch: { status?: EnquiryStatus; notes?: string }, message: string) => Promise<void>; onDelete: (enquiry: Enquiry) => void }) {
  const [notes, setNotes] = useState(enquiry.notes ?? "");
  const [saving, setSaving] = useState(false);
  const links = phoneLinks(enquiry.phone);
  const dirty = notes !== (enquiry.notes ?? "");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const rows: [string, string][] = [["Phone", enquiry.phone], ["WhatsApp updates", enquiry.whatsapp_consent ? "Yes" : "No"], ["Project", enquiry.project_title]];
  if (enquiry.source) rows.push(["Sent from", enquiry.source]);
  rows.push(["Received", new Date(enquiry.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })]);

  return (
    <>
      <button type="button" aria-label="Close details" onClick={onClose} className="fixed inset-0 z-40 bg-navy-950/40 xl:hidden" />
      <aside aria-label={`Enquiry from ${enquiry.name}`} className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] animate-sheet-up overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-float sm:inset-x-auto sm:right-4 sm:top-20 sm:bottom-4 sm:w-[400px] sm:rounded-[20px] xl:sticky xl:top-24 xl:z-auto xl:h-fit xl:max-h-[calc(100vh-7rem)] xl:w-auto xl:animate-none xl:border xl:border-line xl:p-6 xl:shadow-none">
        <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><StatusPill status={statusOf(enquiry)} /><span className="text-[13px] text-ink-muted">{friendlyDate(enquiry.created_at)}</span></span><IconButton label="Close" onClick={onClose}><X size={18} /></IconButton></div>
        <h2 className="mt-3 font-heading text-[26px] leading-8 text-ink">{enquiry.name}</h2>
        <p className="mt-1 text-[14px] text-ink-muted">Enquired about {enquiry.project_title}</p>
        <div className="mt-4 grid grid-cols-2 gap-2"><a href={links.tel} className={adminButtonClass("primary", "md")}><Phone size={16} aria-hidden />Call</a><a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className={adminButtonClass("outline", "md")}>WhatsApp <WhatsAppIcon size={16} /></a></div>
        <dl className="mt-5 space-y-2.5 rounded-2xl border border-line p-4 text-[14px]">
          {rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-ink-muted">{label}</dt><dd className="break-all text-right font-medium text-ink">{value}</dd></div>)}
        </dl>
        <label className={`${labelClass} mt-5`}>Status
          <select value={statusOf(enquiry)} onChange={(event) => void onUpdate(enquiry, { status: event.target.value as EnquiryStatus }, "Status updated.")} className={`mt-1.5 ${fieldInput}`}>
            <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
          </select>
        </label>
        <label className={`${labelClass} mt-4`}>Notes <span className="font-normal text-ink-muted">(only visible to admins)</span>
          <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="e.g. Called at 7 pm — wants a site visit on Saturday." className={`mt-1.5 ${fieldInput} resize-y`} />
        </label>
        <div className="mt-3 flex items-center justify-between gap-3">
          <Button size="sm" disabled={!dirty || saving} onClick={async () => { setSaving(true); await onUpdate(enquiry, { notes }, "Notes saved."); setSaving(false); }}>{saving ? "Saving…" : "Save notes"}</Button>
          <button type="button" onClick={() => onDelete(enquiry)} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-danger hover:underline"><Trash2 size={15} aria-hidden />Delete enquiry</button>
        </div>
      </aside>
    </>
  );
}
