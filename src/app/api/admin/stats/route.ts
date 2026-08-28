import { NextResponse } from "next/server";
import { query } from "../../../../lib/server/db";
import { requireAdminSession } from "../../../../lib/server/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const [blogs, properties] = await Promise.all([
    query<{ count: number }>("SELECT COUNT(*)::int AS count FROM blogs"),
    query<{ count: number }>("SELECT COUNT(*)::int AS count FROM properties"),
  ]);

  return NextResponse.json({
    blogs: blogs.rows[0]?.count || 0,
    properties: properties.rows[0]?.count || 0,
  });
}
