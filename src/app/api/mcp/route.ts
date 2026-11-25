/**
 * Content MCP server (Model Context Protocol, Streamable HTTP, stateless JSON).
 *
 * Clients authenticate with a personal access token created in the admin panel
 * (AI access), sent as "Authorization: Bearer hpg_mcp_…". Read-only tokens only
 * see and run the read tools. Every tool call is recorded in mcp_audit.
 */
import { NextResponse } from "next/server";
import { mcpPrincipal, type McpPrincipal } from "../../../lib/server/mcp-context";
import { recordMcpCall, verifyMcpToken } from "../../../lib/server/mcp-tokens";
import { mcpTools, toolsForScope, ToolError } from "../../../lib/server/mcp-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVER_INFO = { name: "hp-global-content", title: "HP Global website content", version: "1.0.0" };
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const RATE_LIMIT = 120; // requests per token per minute
const rateWindows = new Map<number, { count: number; resetAt: number }>();

const INSTRUCTIONS = `You are editing the live website of HP Global Infrra (hpglobalinfra.com), a real-estate company.
- Pages are built from sections. Call list_section_types before adding or reshaping sections, and get_page before changing a page.
- Prefer small, targeted edits (update_section, update_article with only the changed fields) over replacing whole pages.
- Changes to website pages, the menus, site details, projects and published articles go live immediately. New pages and articles start as drafts.
- Confirm with the user before publishing, unpublishing, or making large or site-wide changes.
- Customer enquiries and contact requests are not available through this server, and nothing can be deleted with it.`;

type RpcId = string | number | null;
interface RpcMessage { jsonrpc?: string; id?: RpcId; method?: string; params?: Record<string, unknown> }

const rpcResult = (id: RpcId, result: unknown) => ({ jsonrpc: "2.0", id, result });
const rpcError = (id: RpcId, code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

function unauthorized(message: string) {
  return NextResponse.json(rpcError(null, -32001, message), {
    status: 401,
    headers: { "WWW-Authenticate": `Bearer realm="hp-global", error="invalid_token", error_description="${message}"` },
  });
}

function rateLimited(tokenId: number) {
  const now = Date.now();
  const window = rateWindows.get(tokenId);
  if (!window || window.resetAt <= now) { rateWindows.set(tokenId, { count: 1, resetAt: now + 60_000 }); return false; }
  window.count += 1;
  return window.count > RATE_LIMIT;
}

/** Browsers send Origin; only allow our own site, so a web page can't drive the endpoint (DNS rebinding). */
function originAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host || new URL(origin).host === request.headers.get("host"); }
  catch { return false; }
}

function summarise(args: Record<string, unknown>) {
  const short: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args)) short[key] = typeof value === "string" && value.length > 60 ? `${value.slice(0, 57)}…` : Array.isArray(value) ? `[${value.length} items]` : value && typeof value === "object" ? "{…}" : value;
  return JSON.stringify(short);
}

async function callTool(principal: McpPrincipal, params: Record<string, unknown>) {
  const name = String(params.name ?? "");
  const args = (params.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : {}) as Record<string, unknown>;
  const tool = mcpTools.find((entry) => entry.name === name);
  const fail = async (message: string) => {
    await recordMcpCall(principal.tokenId, name || "(none)", false, message).catch(() => undefined);
    return { content: [{ type: "text", text: message }], isError: true };
  };
  if (!tool) return fail(`Unknown tool "${name}".`);
  if (tool.scope === "write" && principal.scope !== "write") return fail("This access token is read-only, so it can't make changes. Ask an admin for a read-and-edit token.");
  try {
    const result = await mcpPrincipal.run(principal, () => tool.run(args));
    await recordMcpCall(principal.tokenId, name, true, tool.scope === "write" ? summarise(args) : "").catch(() => undefined);
    return { content: [{ type: "text", text: JSON.stringify(result ?? { ok: true }, null, 1) }] };
  } catch (error) {
    if (error instanceof ToolError) return fail(error.message);
    console.error(`MCP tool ${name} failed`, error);
    return fail("Something went wrong on the server while running this tool.");
  }
}

async function handle(principal: McpPrincipal, message: RpcMessage) {
  const isNotification = message.id === undefined;
  const id = message.id ?? null;
  if (message.jsonrpc !== "2.0" || typeof message.method !== "string") return isNotification ? null : rpcError(id, -32600, "Invalid request.");
  if (isNotification) return null; // notifications/initialized, notifications/cancelled …

  switch (message.method) {
    case "initialize": {
      const requested = String(message.params?.protocolVersion ?? "");
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: `${INSTRUCTIONS}\n- This token (${principal.name}) is ${principal.scope === "write" ? "read and edit" : "read-only"}.`,
      });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, {
        tools: toolsForScope(principal.scope).map((tool) => ({
          name: tool.name, title: tool.title, description: tool.description, inputSchema: tool.inputSchema,
          annotations: { title: tool.title, readOnlyHint: tool.scope === "read", destructiveHint: false, openWorldHint: false },
        })),
      });
    case "tools/call":
      return rpcResult(id, await callTool(principal, message.params ?? {}));
    case "resources/list":
      return rpcResult(id, { resources: [] });
    case "prompts/list":
      return rpcResult(id, { prompts: [] });
    default:
      return rpcError(id, -32601, `Method not found: ${message.method}`);
  }
}

export async function POST(request: Request) {
  if (!originAllowed(request)) return NextResponse.json(rpcError(null, -32000, "Origin not allowed."), { status: 403 });

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return unauthorized("Add an access token: Authorization: Bearer <token>. Create one in the admin panel under AI access.");
  const principal = await verifyMcpToken(token);
  if (!principal) return unauthorized("This access token is not valid. It may have been revoked or expired.");
  if (rateLimited(principal.tokenId)) return NextResponse.json(rpcError(null, -32000, "Too many requests. Wait a minute and try again."), { status: 429, headers: { "Retry-After": "60" } });

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return NextResponse.json(rpcError(null, -32600, "Request too large."), { status: 413 });
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return NextResponse.json(rpcError(null, -32600, "Request too large."), { status: 413 });
  let body: unknown;
  try { body = JSON.parse(text); } catch { return NextResponse.json(rpcError(null, -32700, "Parse error."), { status: 400 }); }

  const messages = (Array.isArray(body) ? body : [body]) as RpcMessage[];
  const replies = (await Promise.all(messages.map((message) => handle(principal, message && typeof message === "object" ? message : {})))).filter((reply) => reply !== null);
  if (replies.length === 0) return new Response(null, { status: 202 });
  return NextResponse.json(Array.isArray(body) ? replies : replies[0], { headers: { "Cache-Control": "no-store" } });
}

// Stateless server: no server-to-client stream and no sessions to close.
const notAllowed = () => new Response(null, { status: 405, headers: { Allow: "POST" } });
export const GET = notAllowed;
export const DELETE = notAllowed;
