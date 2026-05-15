import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Building } from 'lucide-react';

export function AdminDashboard() {
  const [blogCount, setBlogCount] = useState(0);
  const [propCount, setPropCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      const { count: bCount } = await supabase.from('blogs').select('*', { count: 'exact', head: true });
      const { count: pCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
      setBlogCount(bCount || 0);
      setPropCount(pCount || 0);
    }
    loadStats();
  }, []);

  return (
    <div className="p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-heading text-brand-charcoal mb-2">Welcome to your Dashboard</h1>
        <p className="text-slate-500 font-light">Here's an overview of your platform content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-slate-200 shadow-sm rounded-lg bg-white flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Articles</p>
            <h3 className="text-4xl font-heading text-brand-charcoal">{blogCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-champagne/10 text-brand-champagne flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="p-6 border border-slate-200 shadow-sm rounded-lg bg-white flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Properties</p>
            <h3 className="text-4xl font-heading text-brand-charcoal">{propCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-champagne/10 text-brand-champagne flex items-center justify-center">
            <Building size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
