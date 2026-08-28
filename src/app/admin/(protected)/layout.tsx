import { AdminLayout } from "../../../views/Admin/AdminLayout";

export default function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminLayout>{children}</AdminLayout>;
}
