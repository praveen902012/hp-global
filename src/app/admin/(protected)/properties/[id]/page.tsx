import { notFound } from "next/navigation";
import { AdminProjectEditor } from "../../../../../views/Admin/ProjectEditor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "new" && !/^\d+$/.test(id)) notFound();
  return <AdminProjectEditor key={id} id={id === "new" ? null : Number(id)} />;
}
