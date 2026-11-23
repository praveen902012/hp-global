import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getProjectPageBySlug, listPublicProjectsSafe } from "../../../../lib/server/portfolio";
import { PROJECT_SLUG_PATTERN } from "../../../../data/projects";
import { ProjectPageView } from "../../../../components/projects/ProjectPageView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const load = cache(async (slug: string) => {
  if (!PROJECT_SLUG_PATTERN.test(slug)) return null;
  try {
    return await getProjectPageBySlug(slug);
  } catch (error) {
    console.error(`Failed to load project "${slug}"`, error);
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await load((await params).slug);
  if (!project) return {};
  return { title: `${project.title} — ${project.location} | HP Global Infrra`, description: project.description, openGraph: { images: [project.hero_image] } };
}

export default async function Page({ params }: Props) {
  const project = await load((await params).slug);
  if (!project) notFound();
  const others = (await listPublicProjectsSafe()).filter((item) => item.id !== project.id);
  const related = [...others.filter((item) => item.project_type === project.project_type), ...others.filter((item) => item.project_type !== project.project_type)].slice(0, 3);
  return <ProjectPageView project={project} related={related} />;
}
