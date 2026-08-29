import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { uploadPath } from "../../../../lib/server/uploads";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", pdf: "application/pdf" };

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const filePath = uploadPath(filename);
  if (!filePath) return new NextResponse(null, { status: 404 });
  try {
    const content = await fs.readFile(filePath);
    const extension = filename.split(".").pop() || "jpg";
    return new NextResponse(content, { headers: { "Content-Type": contentTypes[extension] || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
