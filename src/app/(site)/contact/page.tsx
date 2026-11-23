import type { Metadata } from "next";
import { Contact } from "../../../views/Contact";

export const metadata: Metadata = { title: "Contact | HP Global Infrra", description: "Call, WhatsApp or write to HP Global Infrra, or visit our office in Sector 63, Noida." };

export default function Page() {
  return <Contact />;
}
