import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/server/auth";
import { countActiveMcpTokens, createMcpToken, listMcpActivity, listMcpTokens, MCP_EXPIRY_DAYS, MCP_MAX_ACTIVE_TOKENS, MCP_TOKEN_NAME_MAX } from "../../../../lib/server/mcp-tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Deliberately a browser session only: an AI access token must never be able to create or see tokens.
const unauthorized = () => NextResponse.json({ error: "Please sign in again." }, { status: 401 });

export async function GET() {
  if (!await getAdminSession()) return unauthorized();
  const [tokens, activity] = await Promise.all([listMcpTokens(), listMcpActivity()]);
  return NextResponse.json({ tokens, activity }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!await getAdminSession()) return unauthorized();
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const scope = body.scope === "write" ? "write" : body.scope === "read" ? "read" : null;
  const days = body.expires_in_days === null ? null : Number(body.expires_in_days);
  if (!name) return NextResponse.json({ error: "Give the token a name, e.g. the person or tool using it." }, { status: 400 });
  if (name.length > MCP_TOKEN_NAME_MAX) return NextResponse.json({ error: `The name must be ${MCP_TOKEN_NAME_MAX} characters or fewer.` }, { status: 400 });
  if (!scope) return NextResponse.json({ error: "Choose what the token can do." }, { status: 400 });
  if (days !== null && !(MCP_EXPIRY_DAYS as readonly number[]).includes(days)) return NextResponse.json({ error: "Choose when the token expires." }, { status: 400 });
  if (await countActiveMcpTokens() >= MCP_MAX_ACTIVE_TOKENS) return NextResponse.json({ error: `You can have up to ${MCP_MAX_ACTIVE_TOKENS} active tokens. Revoke one you no longer use first.` }, { status: 400 });
  return NextResponse.json(await createMcpToken(name, scope, days), { status: 201, headers: { "Cache-Control": "no-store" } });
}
