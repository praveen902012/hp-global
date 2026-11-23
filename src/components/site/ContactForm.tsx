"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { api } from "../../lib/api";
import { Button, Field, fieldControl } from "./ui";

const interests = ["Buying a home", "Investment advice", "Commercial property", "Property management", "Something else"];
const randomNumber = () => Math.floor(Math.random() * 10) + 1;

type Errors = Partial<Record<"name" | "email" | "message" | "captcha" | "form", string>>;

/**
 * Contact form used on the Contact page and in page-builder "contact form" sections.
 * Phone and interest are optional and are added to the message the team receives.
 */
export function ContactForm({ title = "Send us a message", compact = false }: { title?: string; compact?: boolean }) {
  const id = useId();
  const [form, setForm] = useState({ name: "", phone: "", email: "", interest: "", message: "", website: "" });
  const [numbers, setNumbers] = useState<[number, number]>([0, 0]);
  const [captcha, setCaptcha] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  useEffect(() => { setNumbers([randomNumber(), randomNumber()]); }, []);
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.website) return; // honeypot
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.message.trim()) next.message = "Tell us briefly how we can help.";
    if (Number.parseInt(captcha, 10) !== numbers[0] + numbers[1]) next.captcha = "That’s not quite right — please try again.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("sending");
    const extra = [form.phone.trim() && `Phone: ${form.phone.trim()}`, form.interest && `Interested in: ${form.interest}`].filter(Boolean).join("\n");
    try {
      await api.createContactRequest({ name: form.name.trim(), email: form.email.trim(), message: extra ? `${extra}\n\n${form.message.trim()}` : form.message.trim() });
      setState("sent");
      setForm({ name: "", phone: "", email: "", interest: "", message: "", website: "" });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Couldn’t send your message. Check your connection and try again." });
      setState("idle");
    } finally {
      setNumbers([randomNumber(), randomNumber()]); setCaptcha("");
    }
  }

  const card = "flex flex-col gap-5 rounded-3xl border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8 lg:p-10";
  if (state === "sent") {
    return (
      <div role="status" className={`${card} items-center py-12 text-center`}>
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gold-200 text-gold-500"><Check size={32} /></span>
        <h2 className="t-h3 text-ink">Message sent</h2>
        <p className="max-w-md t-body text-ink-muted">Thanks for reaching out. An advisor will reply within 24 hours.</p>
        <Button variant="outline" size="m" onClick={() => setState("idle")}>Send another message</Button>
      </div>
    );
  }
  const errorCount = ["name", "email", "message", "captcha"].filter((key) => errors[key as keyof Errors]).length;
  const describedBy = (key: keyof Errors) => (errors[key] ? `${id}-${key}-error` : undefined);

  return (
    <form onSubmit={submit} noValidate className={card}>
      <div className="flex flex-col gap-1.5">
        <h2 className="t-h4 text-ink">{title}</h2>
        <p className="t-body-s text-ink-muted">We reply to every message within 24 hours.</p>
      </div>
      {errorCount > 0 && <p role="alert" className="rounded-xl border border-danger bg-danger-bg px-4 py-3 t-label text-danger">Please fix {errorCount} {errorCount === 1 ? "field" : "fields"} below before sending.</p>}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={set("website")} />
      <div className={`grid gap-5 ${compact ? "" : "sm:grid-cols-2"}`}>
        <Field label="Full name" htmlFor={`${id}-name`} required error={errors.name}>
          <input id={`${id}-name`} value={form.name} onChange={set("name")} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={describedBy("name")} className={`${fieldControl(errors.name)} h-12`} />
        </Field>
        <Field label="Phone" htmlFor={`${id}-phone`}>
          <input id={`${id}-phone`} value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" className={`${fieldControl()} h-12`} />
        </Field>
      </div>
      <Field label="Email" htmlFor={`${id}-email`} required error={errors.email}>
        <input id={`${id}-email`} type="email" value={form.email} onChange={set("email")} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={describedBy("email")} className={`${fieldControl(errors.email)} h-12`} />
      </Field>
      {!compact && (
        <Field label="I’m interested in" htmlFor={`${id}-interest`}>
          <span className="relative block">
            <select id={`${id}-interest`} value={form.interest} onChange={set("interest")} className={`${fieldControl()} h-12 appearance-none pr-10`}>
              <option value="">Choose one (optional)</option>
              {interests.map((option) => <option key={option}>{option}</option>)}
            </select>
            <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          </span>
        </Field>
      )}
      <Field label="Message" htmlFor={`${id}-message`} required error={errors.message}>
        <textarea id={`${id}-message`} rows={4} value={form.message} onChange={set("message")} aria-invalid={!!errors.message} aria-describedby={describedBy("message")} className={`${fieldControl(errors.message)} resize-y py-3`} />
      </Field>
      <Field label={`Quick check: what is ${numbers[0]} + ${numbers[1]}?`} htmlFor={`${id}-captcha`} required error={errors.captcha} helper="Helps us keep spam out.">
        <input id={`${id}-captcha`} value={captcha} onChange={(event) => setCaptcha(event.target.value)} inputMode="numeric" aria-invalid={!!errors.captcha} aria-describedby={describedBy("captcha") ?? `${id}-captcha-help`} className={`${fieldControl(errors.captcha)} h-12`} />
      </Field>
      {errors.form && <p role="alert" className="rounded-xl border border-danger bg-danger-bg px-4 py-3 t-body-s text-danger">{errors.form}</p>}
      <Button type="submit" variant="primary" disabled={state === "sending"} icon={<ArrowRight size={18} aria-hidden />} className="w-full">{state === "sending" ? "Sending…" : "Send message"}</Button>
      <p className="t-body-s text-ink-muted">By submitting, you agree to our <a href="/privacy" className="underline decoration-gold-400 underline-offset-4">privacy policy</a>. We never share your details.</p>
    </form>
  );
}
