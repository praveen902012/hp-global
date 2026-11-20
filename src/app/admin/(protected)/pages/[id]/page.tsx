import { notFound } from "next/navigation";
import { AdminPageEditor } from "../../../../../views/Admin/PageEditor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  return <AdminPageEditor id={Number(id)} />;
}
