"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { api } from "../lib/api";
import { whatsappFor } from "../data/company";
import { Badge, Button, ButtonLink, Eyebrow, Field, fieldControl } from "./site/ui";
import { WhatsAppIcon } from "./site/brand-icons";

export interface Project {
  title: string;
  location: string;
  category?: string;
  image?: string;
  status?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const randomNumber = () => Math.floor(Math.random() * 10) + 1;

/** Enquiry form: a centred dialog on larger screens and a bottom sheet on phones. */
export function ProjectEnquiryModal({ isOpen, onClose, project }: ModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [numbers, setNumbers] = useState<[number, number]>([0, 0]);
  const [captcha, setCaptcha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; captcha?: string; form?: string }>({});

  useEffect(() => {
    if (!isOpen) return;
    setNumbers([randomNumber(), randomNumber()]);
    setName(""); setPhone(""); setConsent(true); setCaptcha(""); setSuccess(false); setErrors({});
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, select, textarea");
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("input")?.focus(), 50);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); previous?.focus?.(); };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;
  const title = project.title || "General enquiry";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""))) next.phone = "Enter a valid 10-digit mobile number.";
    if (Number.parseInt(captcha, 10) !== numbers[0] + numbers[1]) next.captcha = "That’s not quite right — please try again.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      await api.createEnquiry({ name, phone, whatsapp_consent: consent, project_title: title });
      setSuccess(true);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-navy-950/70 backdrop-blur-[2px] animate-fade-in sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-[24px] bg-white px-5 pb-7 pt-3 shadow-[var(--shadow-float)] animate-sheet-up sm:max-w-[520px] sm:rounded-[24px] sm:p-9 sm:animate-fade-in-up"
      >
        <span aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-200 text-gold-500 sm:h-[72px] sm:w-[72px]"><Check size={32} /></span>
            <h2 id={`${id}-title`} className="t-h3 text-ink">Thank you{name ? `, ${name.split(" ")[0]}` : ""}</h2>
            <p className="t-body text-ink-muted">Your enquiry for {title} has reached our team. An advisor will call you within 24 hours.</p>
            <div className="mt-2 flex w-full flex-col gap-3">
              <ButtonLink href={whatsappFor(`Hello, I just enquired about ${title}.`)} target="_blank" rel="noopener noreferrer" variant="primary" icon={<WhatsAppIcon size={18} />} className="w-full">Chat on WhatsApp now</ButtonLink>
              <Button variant="ghost" onClick={onClose} className="w-full">Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Eyebrow>Enquire now</Eyebrow>
                <h2 id={`${id}-title`} className="t-h4 text-ink">{project.location ? `${title}, ${project.location.split(",")[0]}` : title}</h2>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory-50 text-ink hover:bg-ivory-100"><X size={18} /></button>
            </div>
            {(project.image || project.category || project.status) && (
              <div className="flex items-center gap-3.5 rounded-[14px] bg-ivory-50 p-3">
                {project.image && <img src={project.image} alt="" className="h-16 w-16 shrink-0 rounded-[10px] object-cover" />}
                <div className="flex min-w-0 flex-col items-start gap-1.5">
                  {project.category && <p className="t-label text-ink">{project.category}</p>}
                  {project.status && <Badge tone="success">{project.status}</Badge>}
                </div>
              </div>
            )}
            <Field label="Full name" htmlFor={`${id}-name`}>
              <input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={`${fieldControl()} h-12`} placeholder="Your name" />
            </Field>
            <Field label="Phone" htmlFor={`${id}-phone`} required error={errors.phone}>
              <input id={`${id}-phone`} value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${id}-phone-error` : undefined} className={`${fieldControl(errors.phone)} h-12`} placeholder="10-digit mobile number" />
            </Field>
            <Field label={`Quick check: what is ${numbers[0]} + ${numbers[1]}?`} htmlFor={`${id}-captcha`} required error={errors.captcha}>
              <input id={`${id}-captcha`} value={captcha} onChange={(event) => setCaptcha(event.target.value)} inputMode="numeric" required aria-invalid={!!errors.captcha} aria-describedby={errors.captcha ? `${id}-captcha-error` : undefined} className={`${fieldControl(errors.captcha)} h-12`} />
            </Field>
            <label className="flex cursor-pointer items-center gap-3 t-body-s text-ink">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="h-5 w-5 rounded accent-navy-900" />
              Yes, contact me on WhatsApp
            </label>
            {errors.form && <p role="alert" className="rounded-xl border border-danger bg-danger-bg px-4 py-3 t-body-s text-danger">{errors.form}</p>}
            <Button type="submit" variant="accent" disabled={submitting} className="w-full">{submitting ? "Sending…" : "Request a call back"}</Button>
            <p className="flex items-center gap-2 t-body-s text-ink-muted"><ShieldCheck size={16} className="shrink-0 text-gold-500" />An advisor responds within 24 hours. We never share your details.</p>
          </form>
        )}
      </div>
    </div>
  );
}
