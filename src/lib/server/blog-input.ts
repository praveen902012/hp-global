import { sanitizeArticleHtml } from "./article-content";

export const blogFields = `id, title, slug, author, snippet, content, image_url,
  published_at::text, is_draft, updated_at, created_at`;

function isImageUrl(value: string) {
  if (value.startsWith("/api/media/") || value.startsWith("/assets/") || value.startsWith("/images/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Validates article input. Drafts only need a title and address; published articles need every field. */
export function blogInput(body: Record<string, unknown>) {
  const input = {
    title: String(body.title || "").trim(),
    slug: String(body.slug || "").trim().toLowerCase(),
    author: String(body.author || "").trim() || "HP Global Infrra",
    snippet: String(body.snippet || "").trim(),
    content: sanitizeArticleHtml(String(body.content || "")),
    image_url: String(body.image_url || "").trim(),
    published_at: String(body.published_at || "").trim() || new Date().toISOString().slice(0, 10),
    is_draft: body.is_draft === true,
  };
  let error: string | null = null;
  if (!input.title || !input.slug) error = "Add a title and page address.";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) error = "The page address may only contain lowercase letters, numbers, and hyphens.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(input.published_at)) error = "Publish date is invalid.";
  else if (input.image_url && !isImageUrl(input.image_url)) error = "Cover image must be an uploaded image or a web address.";
  else if (!input.is_draft && (!input.snippet || !input.content.replace(/<[^>]*>/g, "").trim() || !input.image_url)) error = "To publish, add a summary, the article text and a cover image — or save it as a draft.";
  return { input, error };
}
