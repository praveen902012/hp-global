"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";

export function ContactFormBlock({ dark }: { dark: boolean }) {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const field = `w-full border-b bg-transparent px-0 py-3 text-base font-light outline-none transition-colors focus:border-brand-champagne ${dark ? "border-white/20 text-white placeholder:text-slate-500" : "border-gray-300 text-brand-charcoal placeholder:text-gray-400"}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.website) return; // hidden honeypot field filled in by bots
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) { setError("Please fill in all fields."); return; }
    setState("sending"); setError("");
    try {
      await api.createContactRequest({ name: form.name.trim(), email: form.email.trim(), message: form.message.trim() });
      setState("sent"); setForm({ name: "", email: "", message: "", website: "" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return <div role="status" className={`flex items-start gap-3 p-8 border ${dark ? "border-white/15 text-white" : "border-gray-200 bg-white text-brand-charcoal"}`}><CheckCircle2 className="mt-0.5 shrink-0 text-brand-champagne" size={22} /><div><p className="font-heading text-xl">Thank you — your message has been sent.</p><p className={`mt-2 text-sm font-light ${dark ? "text-slate-300" : "text-gray-500"}`}>Our team will get back to you shortly.</p><button type="button" onClick={() => setState("idle")} className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-champagne">Send another message</button></div></div>;
  }

  return (
    <form onSubmit={submit} className="space-y-8" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} />
      <div className="grid gap-8 md:grid-cols-2">
        <label className="block"><span className="sr-only">Name</span><input className={field} placeholder="Your name" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
        <label className="block"><span className="sr-only">Email</span><input className={field} placeholder="Email address" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
      </div>
      <label className="block"><span className="sr-only">Message</span><textarea className={`${field} resize-y`} rows={4} placeholder="How can we help?" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required /></label>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <button type="submit" disabled={state === "sending"} className={`inline-flex items-center justify-center px-10 py-4 text-sm uppercase tracking-widest transition-all duration-500 disabled:opacity-60 ${dark ? "bg-brand-champagne text-brand-charcoal hover:bg-white" : "bg-brand-charcoal text-white hover:bg-brand-champagne"}`}>
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
