import type { PressClipping, PressClippingInput } from "../../data/press";
import { query } from "./db";

interface PressRow extends Omit<PressClipping, "id" | "published_on" | "created_at" | "updated_at"> {
  id: string | number; published_on: string; created_at: Date | string; updated_at: Date | string;
}

const columns = `id, media_type, publication, headline, summary, published_on::text AS published_on, project, image_url,
  document_url, video_url, article_url, is_enabled, created_at, updated_at`;
const map = (row: PressRow): PressClipping => ({ ...row, id: Number(row.id), created_at: new Date(row.created_at).toISOString(), updated_at: new Date(row.updated_at).toISOString() });
const values = (input: PressClippingInput) => [input.media_type, input.publication, input.headline, input.summary, input.published_on, input.project, input.image_url, input.document_url, input.video_url, input.article_url, input.is_enabled];

export async function listPressClippings(options: { enabledOnly?: boolean; project?: string } = {}) {
  const where: string[] = []; const params: unknown[] = [];
  if (options.enabledOnly) where.push("is_enabled = TRUE");
  if (options.project) { params.push(options.project.trim()); where.push(`lower(project) = lower($${params.length})`); }
  const result = await query<PressRow>(`SELECT ${columns} FROM press_clippings ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY published_on DESC, id DESC`, params);
  return result.rows.map(map);
}

export async function createPressClipping(input: PressClippingInput) {
  const result = await query<PressRow>(
    `INSERT INTO press_clippings (media_type, publication, headline, summary, published_on, project, image_url, document_url, video_url, article_url, is_enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING ${columns}`, values(input));
  return map(result.rows[0]);
}

export async function updatePressClipping(id: number, input: PressClippingInput) {
  const result = await query<PressRow>(
    `UPDATE press_clippings SET media_type = $1, publication = $2, headline = $3, summary = $4, published_on = $5, project = $6, image_url = $7,
     document_url = $8, video_url = $9, article_url = $10, is_enabled = $11, updated_at = NOW() WHERE id = $12 RETURNING ${columns}`, [...values(input), id]);
  return result.rows[0] ? map(result.rows[0]) : null;
}

export async function deletePressClipping(id: number) {
  const result = await query("DELETE FROM press_clippings WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

/** Distinct project names used so far (case-insensitive), for filters. */
export async function listPressProjects(enabledOnly = true) {
  const result = await query<{ project: string }>(`SELECT MIN(project) AS project FROM press_clippings WHERE project <> '' ${enabledOnly ? "AND is_enabled = TRUE" : ""} GROUP BY lower(project) ORDER BY 1`);
  return result.rows.map((row) => row.project);
}
