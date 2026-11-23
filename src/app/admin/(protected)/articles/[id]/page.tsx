import { notFound } from "next/navigation";
import { AdminArticleEditor } from "../../../../../views/Admin/ArticleEditor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "new" && !/^\d+$/.test(id)) notFound();
  return <AdminArticleEditor key={id} id={id === "new" ? null : Number(id)} />;
}
