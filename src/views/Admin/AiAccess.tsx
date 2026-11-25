"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Bot, Check, Copy, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { api } from "../../lib/api";
import type { McpActivity, McpToken } from "../../lib/server/mcp-tokens";
import { Button, Card, EmptyState, Field, Notice, PageHeader, StatusPill, fieldInput, friendlyDate, tableClass, tableWrap, tdClass, thClass, useToast } from "../../components/admin/ui";

const expiryOptions = [{ value: "30", label: "In 30 days" }, { value: "90", label: "In 90 days" }, { value: "365", label: "In 1 year" }, { value: "never", label: "Never" }];

function tokenState(token: McpToken) {
  if (token.revoked_at) return { label: "Revoked", tone: "neutral" as const };
  if (token.expires_at && new Date(token.expires_at) <= new Date()) return { label: "Expired", tone: "neutral" as const };
  return { label: "Active", tone: "active" as const };
}

function CopyBlock({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(value).catch(() => undefined); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2"><span className="text-[13px] font-semibold text-ink">{label}</span>
        <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-ink-muted hover:bg-ivory-100 hover:text-ink">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre className={`overflow-x-auto rounded-xl border border-line bg-ivory-50 px-3.5 py-2.5 font-mono text-[12.5px] leading-5 text-ink ${multiline ? "" : "whitespace-pre"}`}>{value}</pre>
    </div>
  );
}

export function AdminAiAccess() {
  const toast = useToast();
  const [tokens, setTokens] = useState<McpToken[] | null>(null);
  const [activity, setActivity] = useState<McpActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"read" | "write">("read");
  const [expiry, setExpiry] = useState("90");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ token: string; record: McpToken } | null>(null);
  const [origin, setOrigin] = useState("https://www.hpglobalinfra.com");

  const load = () => api.listMcpTokens().then((data) => { setTokens(data.tokens); setActivity(data.activity); }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load tokens."));
  useEffect(() => { setOrigin(window.location.origin); void load(); }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setError(null); setCreating(true);
    try {
      const result = await api.createMcpToken({ name: name.trim(), scope, expires_in_days: expiry === "never" ? null : Number(expiry) });
      setCreated(result); setName(""); void load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to create the token."); }
    finally { setCreating(false); }
  }

  async function revoke(token: McpToken) {
    if (!window.confirm(`Revoke "${token.name}"? Any AI tool using it stops working straight away. This can't be undone.`)) return;
    try { await api.revokeMcpToken(token.id); toast("Token revoked."); if (created?.record.id === token.id) setCreated(null); void load(); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to revoke the token.", "error"); }
  }

  const endpoint = `${origin}/api/mcp`;
  const tokenText = created?.token ?? "<your token>";
  const claudeCode = `claude mcp add --transport http hp-global ${endpoint} \\\n  --header "Authorization: Bearer ${tokenText}"`;
  const jsonConfig = JSON.stringify({ mcpServers: { "hp-global": { type: "http", url: endpoint, headers: { Authorization: `Bearer ${tokenText}` } } } }, null, 2);

  return (
    <div className="max-w-4xl">
      <PageHeader title="AI access" description={<>Let trusted people edit the website&apos;s content from AI assistants such as Claude, using a personal access token. <Link href="/admin/guide#ai-access" className="ml-1 whitespace-nowrap font-medium text-ink underline decoration-gold-400 underline-offset-4 hover:text-gold-700">How it works</Link></>} />
      {error && <Notice tone="error" onClose={() => setError(null)}>{error}</Notice>}

      <div className="space-y-6">
        {created && (
          <Card title="Copy the token now" description="For your security it won't be shown again. If it's lost, revoke it and create a new one.">
            <div className="space-y-5">
              <Notice tone="warning">Treat this like a password. Anyone with it can {created.record.scope === "write" ? "change" : "read"} the website&apos;s content until you revoke it. Share it only directly with the person who needs it.</Notice>
              <CopyBlock label={`Token for "${created.record.name}"`} value={created.token} />
              <CopyBlock label="Claude Code: run in a terminal" value={claudeCode} />
              <CopyBlock label="Other apps (Cursor, VS Code, …): add to the MCP settings file" value={jsonConfig} multiline />
              <div className="flex justify-end"><Button variant="outline" onClick={() => setCreated(null)}>I&apos;ve copied it</Button></div>
            </div>
          </Card>
        )}

        <Card title="Create an access token" description="Create one token per person or tool, so you can see who did what and revoke one without affecting the others.">
          <form onSubmit={create} className="space-y-5">
            <Field label="Name" help="Who or what will use it, e.g. &quot;Site editor – Claude Code&quot;.">
              <input className={`mt-1.5 ${fieldInput}`} value={name} maxLength={60} required onChange={(event) => setName(event.target.value)} placeholder="e.g. Marketing team – Claude" />
            </Field>
            <fieldset>
              <legend className="text-[14px] font-semibold text-ink">What can it do?</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {([["read", "Read only", "See pages, menus, articles, press and projects. Can't change anything."], ["write", "Read and edit", "Also change pages, menus, site details, articles, press and projects. Can't delete anything."]] as const).map(([value, label, help]) => (
                  <label key={value} className={`cursor-pointer rounded-2xl border p-4 transition ${scope === value ? "border-navy-900 bg-ivory-50 ring-1 ring-navy-900" : "border-line hover:border-line-strong"}`}>
                    <span className="flex items-center gap-2 text-[14px] font-semibold text-ink"><input type="radio" name="scope" value={value} checked={scope === value} onChange={() => setScope(value)} className="accent-navy-900" />{label}</span>
                    <span className="mt-1 block pl-6 text-[13px] leading-5 text-ink-muted">{help}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Expires">
              <select className={`mt-1.5 ${fieldInput} sm:max-w-xs`} value={expiry} onChange={(event) => setExpiry(event.target.value)}>
                {expiryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
              <p className="flex items-center gap-2 text-[13px] text-ink-muted"><ShieldCheck size={16} className="text-gold-700" />Enquiries and contact requests are never shared.</p>
              <Button type="submit" disabled={creating || !name.trim()}><KeyRound size={16} aria-hidden />{creating ? "Creating…" : "Create token"}</Button>
            </div>
          </form>
        </Card>

        <Card title="Tokens" bodyClassName="p-0">
          {tokens === null ? <p className="p-6 text-[14px] text-ink-muted">Loading…</p> : tokens.length === 0 ? (
            <EmptyState icon={<Bot size={24} />} title="No tokens yet" description="Create a token above to connect an AI assistant." />
          ) : (
            <div className={tableWrap}>
              <table className={tableClass}>
                <thead><tr><th className={thClass}>Name</th><th className={thClass}>Access</th><th className={thClass}>Last used</th><th className={thClass}>Expires</th><th className={thClass}>Status</th><th className={thClass}><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {tokens.map((token) => {
                    const state = tokenState(token);
                    return (
                      <tr key={token.id} className={state.tone === "active" ? "" : "text-ink-muted"}>
                        <td className={tdClass}><span className="font-medium">{token.name}</span><span className="block font-mono text-[12px] text-ink-subtle">…{token.token_hint}</span></td>
                        <td className={`${tdClass} whitespace-nowrap`}>{token.scope === "write" ? "Read and edit" : "Read only"}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{token.last_used_at ? friendlyDate(token.last_used_at) : "Never"}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{token.expires_at ? friendlyDate(token.expires_at, false) : "Never"}</td>
                        <td className={tdClass}><StatusPill status={state.tone === "active" ? "published" : "draft"} label={state.label} /></td>
                        <td className={`${tdClass} text-right`}>{state.tone === "active" && <Button variant="outline" size="sm" onClick={() => void revoke(token)}>Revoke</Button>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Recent activity" description="The last 50 actions taken with any token." bodyClassName="p-0">
          {activity.length === 0 ? <p className="px-6 pb-6 text-[14px] text-ink-muted">Nothing yet.</p> : (
            <div className={tableWrap}>
              <table className={tableClass}>
                <thead><tr><th className={thClass}>When</th><th className={thClass}>Token</th><th className={thClass}>Action</th><th className={thClass}>Result</th></tr></thead>
                <tbody>
                  {activity.map((entry) => (
                    <tr key={entry.id}>
                      <td className={`${tdClass} whitespace-nowrap text-ink-muted`}>{friendlyDate(entry.created_at)}</td>
                      <td className={tdClass}>{entry.token_name ?? "Deleted token"}</td>
                      <td className={tdClass}><code className="text-[13px]">{entry.tool}</code>{entry.detail && entry.ok && <span className="block max-w-md truncate text-[12px] text-ink-muted" title={entry.detail}>{entry.detail}</span>}</td>
                      <td className={tdClass}>{entry.ok ? <span className="text-success">Done</span> : <span className="text-danger" title={entry.detail}>Refused: {entry.detail}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
