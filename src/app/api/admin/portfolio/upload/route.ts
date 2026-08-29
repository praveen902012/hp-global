import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../lib/server/auth";
import { savePortfolioImage } from "../../../../../lib/server/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await requireAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  try {
    return NextResponse.json({ image_url: await savePortfolioImage(file) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload image." }, { status: 400 });
  }
}
