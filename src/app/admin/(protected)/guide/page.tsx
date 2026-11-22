import type { Metadata } from "next";
import { AdminGuide } from "../../../../views/Admin/Guide";

export const metadata: Metadata = { title: "Admin user guide | HP Global", robots: { index: false, follow: false } };

export default function Page() { return <AdminGuide />; }
