import { NextResponse } from "next/server";
import { type FeaturedProjectContent } from "../../../../data/featuredProject";
import { requireAdminSession } from "../../../../lib/server/auth";
import { getFeaturedProject, saveFeaturedProject } from "../../../../lib/server/featured-project";

function isUrl(value: unknown) { if (typeof value !== "string" || !value.trim()) return false; try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return value.startsWith("/"); } }
function valid(content: unknown): content is FeaturedProjectContent {
  if (!content || typeof content !== "object") return false;
  const value = content as FeaturedProjectContent;
  return Boolean(value.hero?.title && value.hero?.image_url && value.home?.heading && value.home?.cardImage && value.iframe?.title && isUrl(value.iframe?.src) && Array.isArray(value.gallery) && value.gallery.every((image) => image.alt && isUrl(image.src)) && Array.isArray(value.amenities) && value.amenities.every((amenity) => amenity.name && isUrl(amenity.icon)) && isUrl(value.layout?.image_url) && isUrl(value.construction?.video_url) && isUrl(value.construction?.poster_url) && Array.isArray(value.construction?.images) && value.construction.images.every(isUrl) && Array.isArray(value.documents) && value.documents.every((document) => document.name && document.size && isUrl(document.url)) && Array.isArray(value.home?.galleryImages) && value.home.galleryImages.every(isUrl) && Array.isArray(value.home?.tags) && Array.isArray(value.sidebar?.items));
}

export async function GET() {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  return NextResponse.json(await getFeaturedProject());
}

export async function PUT(request: Request) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const content = await request.json().catch(() => null);
  if (!valid(content)) return NextResponse.json({ error: "Complete all required featured-project fields and provide valid media URLs." }, { status: 400 });
  try { const iframe = new URL(content.iframe.src); if (!['www.youtube.com', 'youtube.com', 'player.vimeo.com'].includes(iframe.hostname)) return NextResponse.json({ error: "The iframe source must be a YouTube or Vimeo embed URL." }, { status: 400 }); } catch { return NextResponse.json({ error: "The iframe source must be a valid URL." }, { status: 400 }); }
  return NextResponse.json(await saveFeaturedProject(content));
}
