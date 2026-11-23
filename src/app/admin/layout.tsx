/** Keeps the admin panel's original typography (light paragraphs, medium headings). */
export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="legacy-ui flex min-h-screen flex-col">{children}</div>;
}
