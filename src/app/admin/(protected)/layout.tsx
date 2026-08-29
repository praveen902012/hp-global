import { AdminLayout } from "../../../views/Admin/AdminLayout";
import { redirect } from "next/navigation";
import { getAdminSession } from "../../../lib/server/auth";

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!await getAdminSession()) redirect("/admin/login");
  return <AdminLayout>{children}</AdminLayout>;
}
