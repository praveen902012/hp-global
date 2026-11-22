import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/server/auth";

export const runtime = "nodejs";

/** Serves user-guide screenshots to signed-in admins only (they are not in /public). */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { file } = await params;
  if (!/^[a-z0-9-]+\.png$/.test(file)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    const image = await fs.readFile(path.join(process.cwd(), "server", "admin-guide", file));
    return new NextResponse(new Uint8Array(image), {
      headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=3600", "X-Robots-Tag": "noindex" },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
