import { isValidImageUrl, toVideoEmbedUrl } from "./pages";

export type PressMediaType = "print" | "video" | "online";

export interface PressClippingInput {
  media_type: PressMediaType;
  publication: string;
  headline: string;
  summary: string;
  published_on: string; // YYYY-MM-DD
  project: string;
  image_url: string;
  document_url: string;
  video_url: string;
  article_url: string;
  is_enabled: boolean;
}

export interface PressClipping extends PressClippingInput {
  id: number;
  created_at: string;
  updated_at: string;
}

export const pressMediaTypes: { value: PressMediaType; label: string; description: string }[] = [
  { value: "print", label: "Newspaper / magazine", description: "A scanned or photographed clipping (image or PDF)." },
  { value: "video", label: "TV / video", description: "A news segment or interview on YouTube or Vimeo." },
  { value: "online", label: "Online article", description: "A story on a news website." },
];

export const pressTypeLabel = (type: PressMediaType) => ({ print: "Print", video: "Video", online: "Online" })[type];

export const emptyPressClipping = (): PressClippingInput => ({
  media_type: "print", publication: "", headline: "", summary: "", published_on: new Date().toISOString().slice(0, 10),
  project: "", image_url: "", document_url: "", video_url: "", article_url: "", is_enabled: true,
});

/** Thumbnail to show for a clipping: its own image, else the YouTube poster frame. */
export function pressThumbnail(clipping: Pick<PressClipping, "image_url" | "video_url">) {
  if (clipping.image_url) return clipping.image_url;
  const embed = clipping.video_url ? toVideoEmbedUrl(clipping.video_url) : null;
  const youtube = embed?.match(/youtube\.com\/embed\/([A-Za-z0-9_-]+)/);
  return youtube ? `https://img.youtube.com/vi/${youtube[1]}/hqdefault.jpg` : "";
}

const isHttpUrl = (value: string) => { try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; } };

export function normalizePressClipping(value: unknown): { clipping: PressClippingInput } | { error: string } {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const str = (key: string) => String(raw[key] ?? "").trim();
  const clipping: PressClippingInput = {
    media_type: (["print", "video", "online"] as const).find((type) => type === raw.media_type) ?? "print",
    publication: str("publication"), headline: str("headline"), summary: str("summary"), published_on: str("published_on"),
    project: str("project"), image_url: str("image_url"), document_url: str("document_url"), video_url: str("video_url"),
    article_url: str("article_url"), is_enabled: raw.is_enabled !== false,
  };
  // Drop fields that don't apply to the chosen type (e.g. left over after switching type).
  if (clipping.media_type !== "video") clipping.video_url = "";
  if (clipping.media_type !== "print") clipping.document_url = "";
  if (!clipping.publication) return { error: "Enter the publication or channel name." };
  if (!clipping.headline) return { error: "Enter the headline." };
  if (clipping.publication.length > 120) return { error: "The publication name must be 120 characters or fewer." };
  if (clipping.headline.length > 250) return { error: "The headline must be 250 characters or fewer." };
  if (clipping.summary.length > 1000) return { error: "The summary must be 1000 characters or fewer." };
  if (clipping.project.length > 120) return { error: "The project name must be 120 characters or fewer." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clipping.published_on) || Number.isNaN(Date.parse(`${clipping.published_on}T00:00:00Z`))) return { error: "Enter the date it was published." };
  if (clipping.image_url && !isValidImageUrl(clipping.image_url)) return { error: "The clipping image must be an uploaded image or a full https:// URL." };
  if (clipping.document_url && !(clipping.document_url.startsWith("/api/media/") || isHttpUrl(clipping.document_url))) return { error: "The PDF must be uploaded or be a full https:// URL." };
  if (clipping.article_url && !isHttpUrl(clipping.article_url)) return { error: "The article link must be a full https:// web address." };
  if (clipping.video_url && !toVideoEmbedUrl(clipping.video_url)) return { error: "The video link must be a YouTube or Vimeo link." };
  if (clipping.media_type === "print" && !clipping.image_url && !clipping.document_url) return { error: "Upload the clipping as an image or a PDF." };
  if (clipping.media_type === "video" && !clipping.video_url) return { error: "Add the YouTube or Vimeo link for the video." };
  if (clipping.media_type === "online" && !clipping.article_url) return { error: "Add the link to the online article." };
  return { clipping };
}
