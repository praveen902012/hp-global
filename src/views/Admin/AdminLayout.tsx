"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard as IconDashboard, FileText as IconArticles, Building as IconProps, Star, LogOut as IconLogout, MessageSquare as IconEnquiries, Mail as IconContacts, PanelLeftClose, PanelLeftOpen, Menu as IconMenu } from 'lucide-react';
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
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    api.getSession()
      .then(({ user }) => setSession(user))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  const toggleSidebar = () => setCollapsed((current) => !current);

  const handleLogout = async () => {
    await api.logout();
    router.push('/admin/login');
  };

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: IconDashboard, exact: true },
    { href: '/admin/articles', label: 'Articles', icon: IconArticles },
    { href: '/admin/properties', label: 'Portfolio', icon: IconProps },
    { href: '/admin/featured-project', label: 'Featured Project', icon: Star },
    { href: '/admin/menu', label: 'Menu', icon: IconMenu },
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
      <aside className={`${collapsed ? 'w-20' : 'w-64'} shrink-0 bg-brand-charcoal text-white flex flex-col transition-[width] duration-300`}>
        <div className={`${collapsed ? 'p-4' : 'p-6'} flex min-h-[90px] items-center justify-between border-b border-white/10`}>
          {!collapsed && <div><h2 className="text-xl font-heading font-bold text-brand-champagne">HP Global</h2><p className="mt-1 text-xs uppercase tracking-widest text-slate-400">Admin Panel</p></div>}
          <button type="button" onClick={toggleSidebar} className="rounded-md p-2 text-brand-champagne transition-colors hover:bg-white/10" aria-label={collapsed ? 'Expand admin menu' : 'Collapse admin menu'} title={collapsed ? 'Expand menu' : 'Collapse menu'}>
            {collapsed ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>} 
          </button>
        </div>

        <nav className={`${collapsed ? 'p-3' : 'p-4'} flex-1 space-y-2`} aria-label="Admin navigation">
          {adminLinks.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded-md transition-colors ${isActiveLink(href, exact) ? 'bg-brand-champagne text-brand-charcoal font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} />
              {!collapsed && label}
            </Link>
          ))}
        </nav>

        <div className={`${collapsed ? 'p-3' : 'p-4'} border-t border-white/10`}>
          <button onClick={handleLogout} className={`flex w-full items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 text-left rounded-md text-red-300 hover:bg-white/5 transition-colors`} title={collapsed ? 'Logout' : undefined}>
            <IconLogout size={18} />
            {!collapsed && 'Logout'}
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
