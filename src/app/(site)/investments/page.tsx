import type { Metadata } from "next";
import { Investments } from "../../../views/Investments";
import { listPublicProjectsSafe } from "../../../lib/server/portfolio";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Investments | HP Global Infrra", description: "Strategic, high-yield real estate investments — high-end projects, strategic plots, residential and commercial." };

export default async function Page() {
  return <Investments projects={await listPublicProjectsSafe()} />;
}
