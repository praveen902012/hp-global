import { useState, useEffect } from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard as IconDashboard, FileText as IconArticles, Building as IconProps, LogOut as IconLogout, MessageSquare as IconEnquiries, Mail as IconContacts } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-light-grey text-brand-charcoal">Loading Admin...</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
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
          <NavLink to="/admin" end className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-brand-champagne text-brand-charcoal font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <IconDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/articles" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-brand-champagne text-brand-charcoal font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <IconArticles size={18} />
            Articles
          </NavLink>
          <NavLink to="/admin/properties" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-brand-champagne text-brand-charcoal font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <IconProps size={18} />
            Properties
          </NavLink>
          <NavLink to="/admin/enquiries" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-brand-champagne text-brand-charcoal font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <IconEnquiries size={18} />
            Enquiries
          </NavLink>
          <NavLink to="/admin/contacts" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-brand-champagne text-brand-charcoal font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <IconContacts size={18} />
            Contact Requests
          </NavLink>
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
          <Outlet />
        </div>
      </main>
    </div>
  );
}
