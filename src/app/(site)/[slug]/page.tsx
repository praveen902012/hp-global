import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Eye } from "lucide-react";
import { getPageBySlug } from "../../../lib/server/pages";
import { getAdminSession } from "../../../lib/server/auth";
import { PageSections } from "../../../components/sections/PageSections";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const loadPage = cache(async (slug: string) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  try {
    return await getPageBySlug(slug);
  } catch (error) {
    console.error(`Failed to load page "${slug}"`, error);
    return null;
  }
});

/** Published pages are public; drafts are visible only to a signed-in admin (as a preview). */
async function loadVisiblePage(slug: string) {
  const page = await loadPage(slug);
  if (!page) return null;
  if (page.status === "published") return { page, preview: false };
  return await getAdminSession() ? { page, preview: true } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await loadVisiblePage((await params).slug);
  if (!result) return {};
  return {
    title: `${result.page.title} | HP Global Infrra`,
    description: result.page.meta_description || undefined,
    ...(result.preview ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function Page({ params }: Props) {
  const result = await loadVisiblePage((await params).slug);
  if (!result) notFound();
  const { page, preview } = result;
  return (
    <>
      <PageSections sections={page.sections} />
      {preview && (
        <div role="status" className="fixed inset-x-0 bottom-0 z-[60] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-brand-champagne px-4 py-3 text-sm text-brand-charcoal shadow-2xl">
          <span className="inline-flex items-center gap-2 font-semibold"><Eye size={16} />Draft preview</span>
          <span>Only signed-in admins can see this page until it is published.</span>
          <Link href={`/admin/pages/${page.id}`} className="font-semibold underline underline-offset-4">Back to editor</Link>
        </div>
      )}
    </>
  );
}
