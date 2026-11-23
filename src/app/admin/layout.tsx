import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin · HP Global Infrra", robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex min-h-screen flex-col">{children}</div>;
}
