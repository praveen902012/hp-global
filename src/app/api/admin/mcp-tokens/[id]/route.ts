import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/server/auth";
import { revokeMcpToken } from "../../../../../lib/server/mcp-tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/** Revokes a token. It stops working at once; the record stays for the activity log. */
export async function DELETE(_request: Request, { params }: Props) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  const token = /^\d+$/.test(id) ? await revokeMcpToken(Number(id)) : null;
  if (!token) return NextResponse.json({ error: "Token not found, or already revoked." }, { status: 404 });
  return NextResponse.json(token);
}
