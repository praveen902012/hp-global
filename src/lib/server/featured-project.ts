import { defaultFeaturedProject, type FeaturedProjectContent } from "../../data/featuredProject";
import { query } from "./db";

export async function getFeaturedProject() {
  const result = await query<{ content: FeaturedProjectContent }>("SELECT content FROM featured_project_settings WHERE id = 1");
  if (result.rows[0]) return result.rows[0].content;
  await query("INSERT INTO featured_project_settings (id, content) VALUES (1, $1) ON CONFLICT (id) DO NOTHING", [JSON.stringify(defaultFeaturedProject)]);
  return defaultFeaturedProject;
}

export async function saveFeaturedProject(content: FeaturedProjectContent) {
  await query("INSERT INTO featured_project_settings (id, content, updated_at) VALUES (1, $1, NOW()) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()", [JSON.stringify(content)]);
  return content;
}
