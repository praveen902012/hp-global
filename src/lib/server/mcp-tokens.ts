import crypto from "node:crypto";
import { query } from "./db";
import type { McpPrincipal, McpScope } from "./mcp-context";

export const MCP_TOKEN_PREFIX = "hpg_mcp_";
export const MCP_TOKEN_NAME_MAX = 60;
export const MCP_MAX_ACTIVE_TOKENS = 20;
export const MCP_EXPIRY_DAYS = [30, 90, 365] as const;

export interface McpToken {
  id: number;
  name: string;
  token_hint: string;
  scope: McpScope;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface McpActivity {
  id: number;
  token_name: string | null;
  tool: string;
  ok: boolean;
  detail: string;
  created_at: string;
}

const fields = "id::int AS id, name, token_hint, scope, created_at, expires_at, last_used_at, revoked_at";
const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export async function listMcpTokens() {
  const result = await query<McpToken>(`SELECT ${fields} FROM mcp_tokens ORDER BY (revoked_at IS NOT NULL), created_at DESC`);
  return result.rows;
}

export async function countActiveMcpTokens() {
  const result = await query<{ count: number }>("SELECT COUNT(*)::int AS count FROM mcp_tokens WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW())");
  return result.rows[0]?.count ?? 0;
}

/** Creates a token and returns it in full. It can't be shown again: only its hash is stored. */
export async function createMcpToken(name: string, scope: McpScope, expiresInDays: number | null) {
  const token = MCP_TOKEN_PREFIX + crypto.randomBytes(32).toString("base64url");
  const result = await query<McpToken>(
    `INSERT INTO mcp_tokens (name, token_hash, token_hint, scope, expires_at)
     VALUES ($1, $2, $3, $4, CASE WHEN $5::int IS NULL THEN NULL ELSE NOW() + make_interval(days => $5::int) END)
     RETURNING ${fields}`,
    [name, hashToken(token), token.slice(-4), scope, expiresInDays],
  );
  return { token, record: result.rows[0] };
}

export async function revokeMcpToken(id: number) {
  const result = await query<McpToken>(`UPDATE mcp_tokens SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL RETURNING ${fields}`, [id]);
  return result.rows[0] ?? null;
}

/** Returns who a bearer token belongs to, or null if it is unknown, revoked or expired. */
export async function verifyMcpToken(token: string): Promise<McpPrincipal | null> {
  if (!token.startsWith(MCP_TOKEN_PREFIX) || token.length > 200) return null;
  const result = await query<{ id: number; name: string; scope: McpScope }>(
    `UPDATE mcp_tokens SET last_used_at = NOW()
     WHERE token_hash = $1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW())
     RETURNING id::int AS id, name, scope`,
    [hashToken(token)],
  );
  const row = result.rows[0];
  return row ? { tokenId: row.id, name: row.name, scope: row.scope } : null;
}

export async function recordMcpCall(tokenId: number, tool: string, ok: boolean, detail: string) {
  await query("INSERT INTO mcp_audit (token_id, tool, ok, detail) VALUES ($1, $2, $3, $4)", [tokenId, tool.slice(0, 80), ok, detail.slice(0, 300)]);
}

export async function listMcpActivity(limit = 50) {
  const result = await query<McpActivity>(
    `SELECT a.id::int AS id, t.name AS token_name, a.tool, a.ok, a.detail, a.created_at
     FROM mcp_audit a LEFT JOIN mcp_tokens t ON t.id = a.token_id
     ORDER BY a.created_at DESC LIMIT $1`,
    [limit],
  );
  return result.rows;
}
