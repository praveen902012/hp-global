"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { Button, Card, Field, Notice, PageHeader, fieldInput, useToast } from "../../components/admin/ui";

export function AdminSettings() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { api.getSession().then(({ user }) => setEmail(user?.email ?? "")).catch(() => undefined); }, []);

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (next.length < 10) { setError("Use at least 10 characters for the new password."); return; }
    if (next !== confirm) { setError("The new passwords don't match."); return; }
    setSaving(true);
    try { await api.changeAdminPassword(current, next); setCurrent(""); setNext(""); setConfirm(""); toast("Password changed."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to change the password."); }
    finally { setSaving(false); }
  }

  const passwordInput = (id: string, label: string, value: string, set: (value: string) => void, autoComplete: string, help?: string) => (
    <Field label={label} help={help}>
      <input id={id} type={show ? "text" : "password"} required value={value} onChange={(event) => set(event.target.value)} autoComplete={autoComplete} className={`mt-1.5 ${fieldInput}`} />
    </Field>
  );

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Your admin account and password." />
      <div className="space-y-6">
        <Card title="Account">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-200 text-navy-900"><User size={20} aria-hidden /></span>
              <div><p className="text-[15px] font-semibold text-ink">Administrator</p><p className="text-[14px] text-ink-muted">{email || "Signed in"}</p></div>
            </div>
            <Button variant="outline" onClick={async () => { await api.logout().catch(() => undefined); router.push("/admin/login"); }}><LogOut size={16} aria-hidden />Sign out</Button>
          </div>
        </Card>

        <Card title="Change password" description="Use at least 10 characters. You'll stay signed in on this device.">
          <form onSubmit={changePassword} className="space-y-4">
            {error && <Notice tone="error">{error}</Notice>}
            {passwordInput("current-password", "Current password", current, setCurrent, "current-password")}
            <div className="grid gap-4 sm:grid-cols-2">
              {passwordInput("new-password", "New password", next, setNext, "new-password")}
              {passwordInput("confirm-password", "Repeat new password", confirm, setConfirm, "new-password")}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => setShow((value) => !value)} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted hover:text-ink">{show ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}{show ? "Hide passwords" : "Show passwords"}</button>
              <Button type="submit" disabled={saving}><KeyRound size={16} aria-hidden />{saving ? "Changing…" : "Change password"}</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
