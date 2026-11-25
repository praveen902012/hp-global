"use client";

import { useEffect, useState } from "react";
import { Check, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { api } from "../../lib/api";
import { Button, Card, Notice, PageHeader, inputClass, useToast } from "../../components/admin/ui";
import { SITE_DETAILS_LIMITS, normalizeSiteDetails, type SiteDetails } from "../../data/siteDetails";

const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

function Field({ label, value, onChange, hint, max = SITE_DETAILS_LIMITS.short, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; hint?: string; max?: number; placeholder?: string; type?: string }) {
  return <label className="block text-[14px] font-semibold text-ink">{label}<input type={type} className={inputClass} value={value} maxLength={max} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />{hint && <span className="mt-1 block text-[13px] font-normal text-ink-muted">{hint}</span>}</label>;
}

function Area({ label, value, onChange, hint, max, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; hint?: string; max: number; rows?: number }) {
  return <label className="block text-[14px] font-semibold text-ink">{label}<textarea rows={rows} className={`${inputClass} resize-y`} value={value} maxLength={max} onChange={(event) => onChange(event.target.value)} />{hint && <span className="mt-1 block text-[13px] font-normal text-ink-muted">{hint}</span>}</label>;
}

/** Admin → Site details: contact details and links used across the whole website. */
export function AdminSiteDetails() {
  const toast = useToast();
  const [details, setDetails] = useState<SiteDetails | null>(null);
  const [saved, setSaved] = useState<SiteDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.getSiteDetails().then((loaded) => { setDetails(loaded); setSaved(loaded); }).catch((reason) => setError(errorText(reason, "Unable to load the site details.")));
  }, []);

  const dirty = !!details && !!saved && JSON.stringify(details) !== JSON.stringify(saved);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!details) return <div className="text-[14px] text-ink-muted">{error || "Loading site details…"}</div>;
  const set = (patch: Partial<SiteDetails>) => { setDetails({ ...details, ...patch }); setError(null); };

  async function save() {
    if (!details) return;
    const check = normalizeSiteDetails(details);
    if ("error" in check) { setError(check.error); return; }
    setSaving(true); setError(null);
    try {
      const next = await api.saveSiteDetails(check.details);
      setDetails(next); setSaved(next);
      toast("Site details saved. The website now shows the new details.");
    } catch (reason) { setError(errorText(reason, "Unable to save the site details.")); }
    finally { setSaving(false); }
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try { set({ share_image: (await api.uploadImage(file)).image_url }); } catch (reason) { setError(errorText(reason, "Unable to upload the image.")); } finally { setUploading(false); }
  }

  return (
    <div className="pb-16">
      <PageHeader title="Site details" description="Contact details and links used across the whole website. Changes go live as soon as you save."
        actions={<Button onClick={() => void save()} disabled={saving || !dirty}>{saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}{saving ? "Saving…" : "Save changes"}</Button>} />
      {error && <Notice tone="error" onClose={() => setError(null)}>{error}</Notice>}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card title="Contact" description="Shown in the header, footer and on the Contact page.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phone number" value={details.phone} onChange={(phone) => set({ phone })} placeholder="+91 78279 55579" hint="Include the country code. Shown exactly as you type it." />
              <Field label="Email" type="email" value={details.email} onChange={(email) => set({ email })} />
              <div className="md:col-span-2"><Area label="Office address" value={details.address} max={SITE_DETAILS_LIMITS.address} onChange={(address) => set({ address })} hint="Each line shows on its own line in the footer." /></div>
              <div className="md:col-span-2"><Field label="Google Maps link" value={details.maps_url} max={SITE_DETAILS_LIMITS.url} onChange={(maps_url) => set({ maps_url })} placeholder="https://maps.google.com/…" hint="Opens when visitors click the address. In Google Maps, use Share → Copy link." /></div>
            </div>
          </Card>

          <Card title="WhatsApp" description="Used by the WhatsApp button on every page, in the footer and on the Contact page.">
            <div className="grid gap-4">
              <Field label="WhatsApp number" value={details.whatsapp_number} onChange={(whatsapp_number) => set({ whatsapp_number })} hint="Include the country code, e.g. +91 78279 55579." />
              <Area label="First message" value={details.whatsapp_message} max={SITE_DETAILS_LIMITS.message} rows={2} onChange={(whatsapp_message) => set({ whatsapp_message })} hint="Filled in for visitors when they open WhatsApp. Project pages and the enquiry form write their own message with the project name." />
            </div>
          </Card>

          <Card title="Social links" description="Leave a link empty to hide its icon.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Instagram" value={details.instagram} max={SITE_DETAILS_LIMITS.url} onChange={(instagram) => set({ instagram })} placeholder="https://www.instagram.com/…" />
              <Field label="Facebook" value={details.facebook} max={SITE_DETAILS_LIMITS.url} onChange={(facebook) => set({ facebook })} placeholder="https://www.facebook.com/…" />
              <Field label="LinkedIn" value={details.linkedin} max={SITE_DETAILS_LIMITS.url} onChange={(linkedin) => set({ linkedin })} placeholder="https://www.linkedin.com/company/…" />
              <Field label="YouTube" value={details.youtube} max={SITE_DETAILS_LIMITS.url} onChange={(youtube) => set({ youtube })} placeholder="https://www.youtube.com/@…" />
            </div>
          </Card>

          <Card title="Footer">
            <Area label="Tagline" value={details.tagline} max={SITE_DETAILS_LIMITS.tagline} onChange={(tagline) => set({ tagline })} hint="Shown under the logo in the footer." />
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <Card title="Where these appear">
            <dl className="space-y-3 text-[14px]">
              {[["Header", "Phone number"], ["Footer", "Address, phone, email, WhatsApp, social links and tagline"], ["Contact page", "Phone, WhatsApp, email, address and map"], ["Every page", "WhatsApp button and the WhatsApp button in banners"], ["Services page", "“Call” links next to each service"]].map(([where, what]) => (
                <div key={where}><dt className="font-semibold text-ink">{where}</dt><dd className="text-[13px] text-ink-muted">{what}</dd></div>
              ))}
            </dl>
          </Card>

          <Card title="Search & sharing defaults" description="Used by pages that don't set their own.">
            <div className="space-y-4">
              <Field label="Website name" value={details.site_name} onChange={(site_name) => set({ site_name })} hint="Added to the end of page titles on Google, e.g. “Projects | HP Global Infrra”." />
              <div className="text-[14px] font-semibold text-ink">Default share image
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-ivory-50">{details.share_image ? <img src={details.share_image} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={20} className="text-ink-subtle" />}</div>
                  <div className="flex flex-col items-start gap-1.5">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line-strong px-3 py-1.5 text-[13px] font-normal text-ink-muted hover:border-navy-900">{uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{uploading ? "Uploading…" : details.share_image ? "Replace" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label>
                    {details.share_image && <button type="button" onClick={() => set({ share_image: "" })} className="text-[13px] font-normal text-ink-muted hover:text-danger">Remove</button>}
                  </div>
                </div>
                <span className="mt-1 block text-[13px] font-normal text-ink-muted">Shown when a link is sent on WhatsApp or social media. 1200 × 630 works best.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
