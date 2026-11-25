import type { Metadata, Viewport } from "next";
import "../index.css";

export const metadata: Metadata = {
  // Lets share images saved as site paths (e.g. /api/media/…) become full links. Set SITE_URL if the domain changes.
  metadataBase: new URL(process.env.SITE_URL || "https://hpglobalinfra.com"),
  title: "HP Global Infrra",
  description: "Premier real estate services and investment advisory across NCR and Uttarakhand.",
};

export const viewport: Viewport = { themeColor: "#0f172a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
