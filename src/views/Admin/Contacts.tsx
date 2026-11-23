"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Download, Mail, MailOpen, MessageSquare, Phone, Trash2 } from "lucide-react";
import { api, type ContactRequest } from "../../lib/api";
import { Button, EmptyState, Notice, PageHeader, SearchInput, SegTabs, adminButtonClass, friendlyDate, phoneLinks, refreshAdminCounts, useToast } from "../../components/admin/ui";

type Filter = "all" | "unread";

/** The contact form puts "Phone: …" and "Interested in: …" lines before the message. */
function parseMessage(message: string) {
  const lines = message.split("\n");
  let phone = ""; let interest = ""; let index = 0;
  for (; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("Phone: ")) phone = line.slice(7).trim();
    else if (line.startsWith("Interested in: ")) interest = line.slice(15).trim();
    else break;
  }
  return { phone, interest, body: lines.slice(index).join("\n").trim() };
}

function downloadCsv(rows: ContactRequest[]) {
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [["ID", "Name", "Email", "Message", "Read", "Received"].join(","), ...rows.map((row) => [row.id, cell(row.name), cell(row.email), cell(row.message), row.read_at ? "Yes" : "No", cell(new Date(row.created_at).toLocaleString("en-IN"))].join(","))];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url; link.download = `contact_requests_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

export function AdminContacts() {
  const toast = useToast();
  const [messages, setMessages] = useState<ContactRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const params = useSearchParams();
  const [selectedId, setSelectedId] = useState<number | null>(() => Number(params?.get("id")) || null);

  const load = useCallback(async () => {
    try { setMessages(await api.listContactRequests()); setError(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load messages."); }
  }, []);
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const unread = (messages ?? []).filter((message) => !message.read_at).length;
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (messages ?? []).filter((message) => (filter === "all" || !message.read_at) && (!term || `${message.name} ${message.email} ${message.message}`.toLowerCase().includes(term)));
  }, [messages, filter, search]);
  const selected = messages?.find((message) => message.id === selectedId) ?? null;

  const setRead = useCallback(async (message: ContactRequest, read: boolean, quiet = false) => {
    try {
      const updated = await api.markContactRequest(message.id, read);
      setMessages((rows) => rows?.map((row) => (row.id === updated.id ? updated : row)) ?? rows);
      refreshAdminCounts();
      if (!quiet) toast(read ? "Marked as read." : "Marked as unread.");
    } catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to update.", "error"); }
  }, [toast]);

  // Opening a message marks it as read.
  function open(message: ContactRequest) {
    setSelectedId(message.id);
    if (!message.read_at) void setRead(message, true, true);
  }
  // A message opened from a link (?id=) is marked as read once the list has loaded.
  const linkedId = Number(params?.get("id")) || null;
  const linkedUnread = !!messages?.some((row) => row.id === linkedId && !row.read_at);
  useEffect(() => {
    const message = linkedUnread ? messages?.find((row) => row.id === linkedId) : undefined;
    if (message) void setRead(message, true, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when that message first appears unread
  }, [linkedUnread]);

  async function remove(message: ContactRequest) {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
    try { await api.deleteContactRequest(message.id); setMessages((rows) => rows?.filter((row) => row.id !== message.id) ?? rows); setSelectedId(null); refreshAdminCounts(); toast("Message deleted."); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to delete.", "error"); }
  }

  return (
    <div>
      <PageHeader title="Contact requests" description="Messages sent from the Contact page."
        actions={<Button variant="outline" onClick={() => downloadCsv(visible)} disabled={!visible.length}><Download size={16} aria-hidden />Export CSV</Button>} />
      {error && <Notice tone="error">{error}</Notice>}

      <section className="grid overflow-hidden rounded-[20px] border border-line bg-white lg:min-h-[560px] lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className={`flex min-w-0 flex-col border-line lg:border-r ${selected ? "hidden lg:flex" : ""}`}>
          <div className="space-y-3 border-b border-line p-4">
            <SegTabs label="Filter messages" value={filter} onChange={setFilter} options={[{ value: "all", label: "All", count: messages?.length ?? 0 }, { value: "unread", label: "Unread", count: unread }]} />
            <SearchInput value={search} onChange={setSearch} placeholder="Search messages" />
          </div>
          {messages === null ? <p className="p-5 text-[14px] text-ink-muted">Loading…</p> : visible.length === 0 ? <EmptyState icon={<MessageSquare size={24} />} title={messages.length ? "No matching messages" : "No messages yet"} /> : (
            <ul className="divide-y divide-line overflow-y-auto lg:max-h-[640px]">
              {visible.map((message) => {
                const parsed = parseMessage(message.message);
                const active = message.id === selectedId;
                return (
                  <li key={message.id}>
                    <button type="button" onClick={() => open(message)} aria-current={active} className={`flex w-full items-start gap-3 px-4 py-3.5 text-left ${active ? "bg-ivory-100" : "hover:bg-ivory-50"}`}>
                      <span aria-label={message.read_at ? undefined : "Unread"} className={`mt-2 h-2 w-2 shrink-0 rounded-full ${message.read_at ? "" : "bg-gold-500"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2"><span className={`truncate text-[14px] text-ink ${message.read_at ? "font-medium" : "font-semibold"}`}>{message.name}</span><span className="shrink-0 text-[12px] text-ink-muted">{friendlyDate(message.created_at, false)}</span></span>
                        <span className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-ink-muted">{parsed.body || message.message}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={`min-w-0 ${selected ? "" : "hidden lg:block"}`}>
          {!selected ? <EmptyState icon={<Mail size={24} />} title="Select a message" description="Pick a message on the left to read it." /> : (() => {
            const parsed = parseMessage(selected.message);
            const links = parsed.phone ? phoneLinks(parsed.phone) : null;
            return (
              <article className="p-5 md:p-8">
                <button type="button" onClick={() => setSelectedId(null)} className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted lg:hidden"><ArrowLeft size={16} aria-hidden />All messages</button>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-heading text-[26px] leading-8 text-ink">{selected.name}</h2>
                    <p className="mt-1 break-all text-[14px] text-ink-muted"><a href={`mailto:${selected.email}`} className="hover:text-ink hover:underline">{selected.email}</a> · {new Date(selected.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => void setRead(selected, !selected.read_at)}>{selected.read_at ? <><Mail size={15} aria-hidden />Mark unread</> : <><MailOpen size={15} aria-hidden />Mark read</>}</Button>
                    <Button variant="danger" size="sm" onClick={() => void remove(selected)} aria-label="Delete message"><Trash2 size={15} aria-hidden /></Button>
                  </div>
                </div>
                {(parsed.phone || parsed.interest) && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {parsed.phone && <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory-100 px-3 py-1.5 text-[13px] font-medium text-ink"><Phone size={14} aria-hidden />{parsed.phone}</span>}
                    {parsed.interest && <span className="inline-flex items-center rounded-full bg-gold-200 px-3 py-1.5 text-[13px] font-medium text-navy-900">Interested in: {parsed.interest}</span>}
                  </div>
                )}
                <p className="mt-6 whitespace-pre-wrap text-[16px] leading-[26px] text-ink">{parsed.body || selected.message}</p>
                <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
                  <a href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: your message to HP Global Infrra")}`} className={adminButtonClass("primary", "md")}><Mail size={16} aria-hidden />Reply by email</a>
                  {links && <a href={links.tel} className={adminButtonClass("outline", "md")}><Phone size={16} aria-hidden />Call</a>}
                </div>
              </article>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
