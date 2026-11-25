import { isValidImageUrl } from "./pages";

/** Contact details and links shown across the website, edited in Admin → Site details. */
export interface SiteDetails {
  phone: string;
  email: string;
  /** One line per row, as shown in the footer. */
  address: string;
  maps_url: string;
  whatsapp_number: string;
  whatsapp_message: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  tagline: string;
  /** Added to the end of page titles on Google. */
  site_name: string;
  /** Picture shown when a page without its own share image is sent on WhatsApp or social media. */
  share_image: string;
}

/** What the website showed before Site details existed, so nothing changes until an editor saves. */
export const defaultSiteDetails: SiteDetails = {
  phone: "+91 78279 55579",
  email: "info@hpglobalinfra.com",
  address: "D-184, D Block, Sector-63,\nNoida 201309, Uttar Pradesh",
  maps_url: "https://www.google.com/maps/search/?api=1&query=D-184%2C%20D%20Block%2C%20Sector%2063%2C%20Noida%20201309",
  whatsapp_number: "+91 78279 55579",
  whatsapp_message: "Hello HP Global Infrra, I'd like to know more.",
  instagram: "https://www.instagram.com/hpglobalinfra/",
  facebook: "https://www.facebook.com/hpglobalinfra/",
  linkedin: "",
  youtube: "",
  tagline: "Shaping the future of real estate across NCR and Uttarakhand. Partner in vision, invest in growth.",
  site_name: "HP Global Infrra",
  share_image: "",
};

export const SITE_DETAILS_LIMITS = { short: 120, url: 500, message: 300, address: 300, tagline: 300 };

const digits = (value: string) => value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");

/** Ready-to-use links and values derived from the saved details. */
export function siteLinks(details: SiteDetails) {
  const phoneDigits = digits(details.phone);
  const whatsappDigits = digits(details.whatsapp_number || details.phone).replace(/^\+/, "");
  const whatsappFor = (message: string) => `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`;
  const social = [
    { key: "instagram", label: "Instagram", href: details.instagram },
    { key: "facebook", label: "Facebook", href: details.facebook },
    { key: "linkedin", label: "LinkedIn", href: details.linkedin },
    { key: "youtube", label: "YouTube", href: details.youtube },
  ].filter((item) => item.href) as { key: "instagram" | "facebook" | "linkedin" | "youtube"; label: string; href: string }[];
  return {
    ...details,
    phoneDisplay: details.phone,
    phoneHref: `tel:${phoneDigits}`,
    whatsappHref: whatsappFor(details.whatsapp_message),
    whatsappFor,
    mapsHref: details.maps_url,
    addressLines: details.address.split("\n").map((line) => line.trim()).filter(Boolean),
    social,
  };
}
export type SiteLinks = ReturnType<typeof siteLinks>;

const isWebUrl = (value: string) => { try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; } };

/** Cleans and checks details sent from the admin. */
export function normalizeSiteDetails(value: unknown): { details: SiteDetails } | { error: string } {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const text = (key: keyof SiteDetails, max: number) => String(raw[key] ?? "").replace(/\r\n/g, "\n").trim().slice(0, max + 1);
  const details: SiteDetails = {
    phone: text("phone", SITE_DETAILS_LIMITS.short), email: text("email", SITE_DETAILS_LIMITS.short), address: text("address", SITE_DETAILS_LIMITS.address),
    maps_url: text("maps_url", SITE_DETAILS_LIMITS.url), whatsapp_number: text("whatsapp_number", SITE_DETAILS_LIMITS.short), whatsapp_message: text("whatsapp_message", SITE_DETAILS_LIMITS.message),
    instagram: text("instagram", SITE_DETAILS_LIMITS.url), facebook: text("facebook", SITE_DETAILS_LIMITS.url), linkedin: text("linkedin", SITE_DETAILS_LIMITS.url), youtube: text("youtube", SITE_DETAILS_LIMITS.url),
    tagline: text("tagline", SITE_DETAILS_LIMITS.tagline), site_name: text("site_name", SITE_DETAILS_LIMITS.short), share_image: text("share_image", SITE_DETAILS_LIMITS.url),
  };
  const limits: [keyof SiteDetails, number, string][] = [
    ["phone", SITE_DETAILS_LIMITS.short, "Phone number"], ["email", SITE_DETAILS_LIMITS.short, "Email"], ["address", SITE_DETAILS_LIMITS.address, "Office address"],
    ["whatsapp_message", SITE_DETAILS_LIMITS.message, "First message"], ["tagline", SITE_DETAILS_LIMITS.tagline, "Tagline"], ["site_name", SITE_DETAILS_LIMITS.short, "Website name"],
  ];
  for (const [key, max, label] of limits) if (details[key].length > max) return { error: `${label} must be ${max} characters or fewer.` };
  if (digits(details.phone).replace(/^\+/, "").length < 8) return { error: "Enter a phone number with at least 8 digits, including the country code." };
  if (digits(details.whatsapp_number).replace(/^\+/, "").length < 8) return { error: "Enter a WhatsApp number with at least 8 digits, including the country code (e.g. +91)." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) return { error: "Enter a valid email address." };
  if (!details.address) return { error: "Enter the office address." };
  if (!details.site_name) return { error: "Enter the website name." };
  const urls: [keyof SiteDetails, string][] = [["maps_url", "Google Maps link"], ["instagram", "Instagram link"], ["facebook", "Facebook link"], ["linkedin", "LinkedIn link"], ["youtube", "YouTube link"]];
  for (const [key, label] of urls) if (details[key] && !isWebUrl(details[key])) return { error: `${label} must be a full web address starting with https://` };
  if (details.share_image && !isValidImageUrl(details.share_image)) return { error: "The share image must be an uploaded image or a full https:// image URL." };
  return { details };
}
