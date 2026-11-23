"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ExternalLink, GripVertical, Pencil, Plus, Star, Trash2, X, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { api, type PortfolioProject } from "../../lib/api";
import { Button, EmptyState, IconButton, Notice, PageHeader, SearchInput, SegTabs, StatusPill, SwitchControl, fieldInput, tdClass, thClass, useToast } from "../../components/admin/ui";
import { moveItem } from "../../components/admin/media";

type Category = "all" | "hpg" | "partner";
const PER_PAGE = 20;

/** How much of a project's own page has been filled in. */
export function pageProgress(project: Pick<PortfolioProject, "details" | "is_featured">) {
  const d = project.details;
  const checks = [
    { label: "Overview", done: !!d.overview },
    { label: "Highlights", done: d.highlights.length > 0 },
    { label: "Key facts", done: d.facts.length > 0 },
    { label: "Gallery", done: project.is_featured || d.gallery.length > 0 },
    { label: "Video", done: project.is_featured || !!d.video_url },
    { label: "Amenities & layout", done: project.is_featured || d.amenities.length > 0 || !!d.layout_image },
    { label: "Documents", done: project.is_featured || d.documents.length > 0 },
  ];
  return { checks, done: checks.filter((check) => check.done).length, total: checks.length };
}

export function AdminPortfolio() {
  const toast = useToast();
  const [items, setItems] = useState<PortfolioProject[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearchState] = useState("");
  const [category, setCategoryState] = useState<Category>("all");
  const [type, setTypeState] = useState<"all" | "residential" | "commercial">("all");
  const [page, setPage] = useState(1);
  const setSearch = (value: string) => { setSearchState(value); setPage(1); };
  const setCategory = (value: Category) => { setCategoryState(value); setPage(1); };
  const setType = (value: typeof type) => { setTypeState(value); setPage(1); };
  const [reordering, setReordering] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await api.listPortfolio({ page, limit: PER_PAGE, search, category: category === "all" ? undefined : category, type: type === "all" ? undefined : type });
      setItems(result.items); setTotal(result.pagination.total); setError(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load projects."); }
  }, [page, search, category, type]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), search ? 250 : 0); return () => window.clearTimeout(timer); }, [load, search]);

  async function toggleVisible(item: PortfolioProject) {
    const next = !item.is_enabled;
    setItems((rows) => rows?.map((row) => (row.id === item.id ? { ...row, is_enabled: next } : row)) ?? rows);
    try { await api.updatePortfolio(item.id, { ...item, is_enabled: next }); toast(next ? `${item.title} is now on the website.` : `${item.title} is hidden from the website.`); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to update.", "error"); void load(); }
  }
  async function remove(item: PortfolioProject) {
    if (!window.confirm(`Delete “${item.title}”? Its page /projects/${item.slug} will stop working. Uploaded images are kept.`)) return;
    try { await api.deletePortfolio(item.id); toast("Project deleted."); void load(); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to delete.", "error"); }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <PageHeader title="Projects" description="Every project gets its own page on the website. Hidden projects stay here but are not shown to visitors."
        actions={<><Button variant="outline" onClick={() => setReordering(true)}><ArrowUpDown size={16} aria-hidden />Reorder</Button><Button to="/admin/properties/new"><Plus size={16} aria-hidden />Add project</Button></>} />
      {error && <Notice tone="error">{error}</Notice>}

      <section className="rounded-[20px] border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between md:px-6">
          <SegTabs label="Developer" value={category} onChange={setCategory} options={[{ value: "all", label: "All" }, { value: "hpg", label: "By HPG" }, { value: "partner", label: "Partner" }]} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <select value={type} onChange={(event) => setType(event.target.value as typeof type)} aria-label="Project type" className={`${fieldInput} h-10 py-0 text-[14px] sm:w-44`}><option value="all">All types</option><option value="residential">Residential</option><option value="commercial">Commercial</option></select>
            <SearchInput value={search} onChange={setSearch} placeholder="Search name or location" className="sm:w-64" />
          </div>
        </div>

        {items === null ? <p className="p-6 text-[14px] text-ink-muted">Loading projects…</p> : items.length === 0 ? (
          <EmptyState icon={<Building2 size={24} />} title="No matching projects" description="Try another filter, or add a new project." action={<Button to="/admin/properties/new"><Plus size={16} aria-hidden />Add project</Button>} />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-[14px]">
                <thead><tr><th className={thClass}>Project</th><th className={thClass}>Price</th><th className={thClass}>Status</th><th className={thClass}>Page content</th><th className={thClass}>Visible</th><th className={thClass}><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {items.map((item) => {
                    const progress = pageProgress(item);
                    return (
                      <tr key={item.id} className={`hover:bg-ivory-50 ${item.is_enabled ? "" : "text-ink-muted"}`}>
                        <td className={tdClass}>
                          <Link href={`/admin/properties/${item.id}`} className="flex items-center gap-3">
                            <img src={item.image_url} alt="" className={`h-12 w-16 shrink-0 rounded-lg bg-ivory-100 object-cover ${item.is_enabled ? "" : "opacity-50"}`} />
                            <span className="min-w-0"><span className="flex items-center gap-1.5 font-semibold text-ink hover:text-gold-700">{item.title}{item.is_featured && <Star size={14} className="fill-gold-400 text-gold-500" aria-label="Featured" />}</span><span className="block truncate text-[13px] text-ink-muted">{item.location} · {item.portfolio_category === "hpg" ? "By HPG" : "Partner"} · <span className="capitalize">{item.project_type}</span></span></span>
                          </Link>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap`}>{item.price || "On request"}</td>
                        <td className={tdClass}>{!item.is_enabled ? <StatusPill status="hidden" /> : item.is_featured ? <StatusPill status="featured" /> : <StatusPill status="published" label={item.status || "Published"} />}</td>
                        <td className={tdClass}>
                          <span className="flex items-center gap-2" title={progress.checks.filter((check) => !check.done).map((check) => check.label).join(", ") || "Complete"}>
                            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-ivory-100"><span className="block h-full rounded-full bg-gold-500" style={{ width: `${(progress.done / progress.total) * 100}%` }} /></span>
                            <span className="text-[13px] text-ink-muted">{progress.done}/{progress.total}</span>
                          </span>
                        </td>
                        <td className={tdClass}><SwitchControl checked={item.is_enabled} onChange={() => void toggleVisible(item)} label={`Show ${item.title} on the website`} /></td>
                        <td className={tdClass}>
                          <div className="flex justify-end gap-1">
                            {item.slug && <IconButton label="View on website" href={`/projects/${item.slug}`} target="_blank"><ExternalLink size={16} /></IconButton>}
                            <Link href={`/admin/properties/${item.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-ivory-100 hover:text-ink" aria-label={`Edit ${item.title}`} title="Edit"><Pencil size={16} /></Link>
                            <IconButton label={`Delete ${item.title}`} tone="danger" onClick={() => void remove(item)}><Trash2 size={16} /></IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line lg:hidden">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 p-4">
                  <Link href={`/admin/properties/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <img src={item.image_url} alt="" className={`h-14 w-16 shrink-0 rounded-lg bg-ivory-100 object-cover ${item.is_enabled ? "" : "opacity-50"}`} />
                    <span className="min-w-0"><span className="flex items-center gap-1.5 font-semibold text-ink">{item.title}{item.is_featured && <Star size={14} className="fill-gold-400 text-gold-500" aria-label="Featured" />}</span><span className="block truncate text-[13px] text-ink-muted">{item.location}</span><span className="mt-1 block">{item.is_enabled ? <StatusPill status="published" label={item.status || "Published"} /> : <StatusPill status="hidden" />}</span></span>
                  </Link>
                  <SwitchControl checked={item.is_enabled} onChange={() => void toggleVisible(item)} label={`Show ${item.title} on the website`} />
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3 px-5 py-4 md:px-6">
              <p className="text-[14px] text-ink-muted">{total} {total === 1 ? "project" : "projects"}</p>
              {totalPages > 1 && <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button><Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</Button></div>}
            </div>
          </>
        )}
      </section>
      {reordering && <ReorderDialog onClose={() => setReordering(false)} onSaved={() => { setReordering(false); toast("New order saved. The website shows projects in this order."); void load(); }} />}
    </div>
  );
}

/** Drag projects into the order they appear on the website (per developer and type, as on the site). */
function ReorderDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [groups, setGroups] = useState<{ key: string; label: string; items: PortfolioProject[] }[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ group: number; index: number } | null>(null);

  useEffect(() => {
    (async () => {
      const all: PortfolioProject[] = [];
      for (let page = 1; page < 20; page += 1) {
        const result = await api.listPortfolio({ page, limit: 50 });
        all.push(...result.items);
        if (all.length >= result.pagination.total) break;
      }
      const labels: Record<string, string> = { "hpg-residential": "By HPG · Residential", "hpg-commercial": "By HPG · Commercial", "partner-residential": "Partner · Residential", "partner-commercial": "Partner · Commercial" };
      setGroups(Object.entries(labels).map(([key, label]) => ({ key, label, items: all.filter((item) => `${item.portfolio_category}-${item.project_type}` === key).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id) })).filter((group) => group.items.length));
    })().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load projects."));
  }, []);
  useEffect(() => { const esc = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", esc); return () => window.removeEventListener("keydown", esc); }, [onClose]);

  const setItems = (groupIndex: number, items: PortfolioProject[]) => setGroups((current) => current?.map((group, index) => (index === groupIndex ? { ...group, items } : group)) ?? current);

  async function save() {
    if (!groups) return;
    setSaving(true); setError(null);
    try { for (const group of groups) await api.reorderPortfolio(group.items.map((item) => item.id)); onSaved(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save the order."); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/40" role="dialog" aria-modal="true" aria-label="Reorder projects" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flex h-full w-full max-w-lg animate-fade-in flex-col bg-white shadow-float">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div><h2 className="font-heading text-[24px] leading-8 text-ink">Reorder projects</h2><p className="mt-1 text-[14px] text-ink-muted">Drag rows to change the order on the website. The featured project always shows first.</p></div>
          <IconButton label="Close" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {error && <Notice tone="error">{error}</Notice>}
          {!groups ? <p className="text-[14px] text-ink-muted">Loading…</p> : groups.map((group, groupIndex) => (
            <div key={group.key}>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{group.label}</p>
              <ul className="space-y-2">
                {group.items.map((item, index) => (
                  <li key={item.id} draggable onDragStart={() => setDrag({ group: groupIndex, index })} onDragEnd={() => setDrag(null)}
                    onDragOver={(event) => { event.preventDefault(); if (drag && drag.group === groupIndex && drag.index !== index) { const next = [...group.items]; const [moved] = next.splice(drag.index, 1); next.splice(index, 0, moved); setItems(groupIndex, next); setDrag({ group: groupIndex, index }); } }}
                    className={`flex items-center gap-3 rounded-2xl border bg-white p-2 pr-3 ${drag?.group === groupIndex && drag.index === index ? "border-gold-500 opacity-60" : "border-line"}`}>
                    <span className="flex h-9 w-7 cursor-grab items-center justify-center text-ink-subtle" title="Drag to reorder"><GripVertical size={18} aria-hidden /></span>
                    <img src={item.image_url} alt="" className="h-10 w-14 rounded-lg bg-ivory-100 object-cover" />
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">{item.title}{!item.is_enabled && <span className="ml-2 text-[12px] font-medium text-ink-muted">Hidden</span>}</span>
                    <button type="button" onClick={() => setItems(groupIndex, moveItem(group.items, index, -1))} disabled={index === 0} className="rounded-lg p-1.5 text-ink-muted hover:bg-ivory-100 disabled:opacity-30" aria-label={`Move ${item.title} up`}><ChevronUp size={16} /></button>
                    <button type="button" onClick={() => setItems(groupIndex, moveItem(group.items, index, 1))} disabled={index === group.items.length - 1} className="rounded-lg p-1.5 text-ink-muted hover:bg-ivory-100 disabled:opacity-30" aria-label={`Move ${item.title} down`}><ChevronDown size={16} /></button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-6 py-4"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={() => void save()} disabled={saving || !groups}>{saving ? "Saving…" : "Save order"}</Button></div>
      </div>
    </div>
  );
}
