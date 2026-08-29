"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard as IconDashboard, FileText as IconArticles, Building as IconProps, LogOut as IconLogout, MessageSquare as IconEnquiries, Mail as IconContacts } from 'lucide-react';
import { api } from '../../lib/api';

interface AdminSession {
  email: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    api.getSession()
      .then(({ user }) => setSession(user))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await api.logout();
    router.push('/admin/login');
  };

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: IconDashboard, exact: true },
    { href: '/admin/articles', label: 'Articles', icon: IconArticles },
    { href: '/admin/properties', label: 'Portfolio', icon: IconProps },
    { href: '/admin/enquiries', label: 'Enquiries', icon: IconEnquiries },
    { href: '/admin/contacts', label: 'Contact Requests', icon: IconContacts },
  ];

  const isActiveLink = (href: string, exact?: boolean) => exact ? pathname === href : (pathname || "").startsWith(href);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-light-grey text-brand-charcoal">Loading Admin...</div>;
  }

  if (!session) {
    router.replace('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-light-grey flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-charcoal text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-heading font-bold text-brand-champagne">HP Global</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {adminLinks.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActiveLink(href, exact) ? 'bg-brand-champagne text-brand-charcoal font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-md text-red-300 hover:bg-white/5 transition-colors">
            <IconLogout size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white m-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
