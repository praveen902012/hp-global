import { AsyncLocalStorage } from "node:async_hooks";

export type McpScope = "read" | "write";

/** The access token behind the current MCP tool call. */
export interface McpPrincipal {
  tokenId: number;
  name: string;
  scope: McpScope;
}

/**
 * Set only while /api/mcp runs a tool. The admin route handlers the tools reuse
 * check it in requireAdminSession, so a tool gets exactly the admin panel's
 * validation without a browser session.
 */
export const mcpPrincipal = new AsyncLocalStorage<McpPrincipal>();
