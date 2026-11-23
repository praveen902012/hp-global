import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import type { QueryResultRow } from "pg";

const { Pool } = pg;

// BIGSERIAL ids come back as strings by default; they are far below 2^53, so use numbers.
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

let pool: pg.Pool | null = null;
let schemaReady: Promise<void> | null = null;

function getPool() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL or POSTGRES_URL is required.");
  }

  pool ??= new Pool({
    connectionString: databaseUrl,
    ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  return pool;
}

export async function ensureSchema() {
  schemaReady ??= (async () => {
    const schema = fs.readFileSync(path.join(process.cwd(), "server", "schema.sql"), "utf8");
    await getPool().query(schema);
  })();

  return schemaReady;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  await ensureSchema();
  return getPool().query<T>(text, params);
}
