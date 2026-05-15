import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, RefreshCw, MessageSquare } from 'lucide-react';

interface Enquiry {
  id: number;
  name: string;
  phone: string;
  whatsapp_consent: boolean;
  project_title: string;
  created_at: string;
}

export function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching enquiries:', error);
    } else {
      setEnquiries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const downloadCSV = () => {
    if (enquiries.length === 0) return;
    
    const headers = ['ID', 'Name', 'Phone', 'WhatsApp Consent', 'Project', 'Date'];
    const csvData = enquiries.map(eq => [
      eq.id,
      `"${eq.name.replace(/"/g, '""')}"`,
      `"${eq.phone}"`,
      eq.whatsapp_consent ? 'Yes' : 'No',
      `"${eq.project_title.replace(/"/g, '""')}"`,
      new Date(eq.created_at).toLocaleString().replace(/,/g, '')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `enquiries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-heading text-brand-charcoal flex items-center gap-3">
            <MessageSquare size={28} className="text-brand-champagne" />
            Project Enquiries
          </h1>
          <p className="text-gray-500 mt-1">Manage and export all project enquiries.</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={fetchEnquiries}
            className="flex items-center gap-2 px-4 py-2 border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={downloadCSV}
            disabled={enquiries.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-brand-charcoal text-brand-champagne hover:bg-brand-champagne hover:text-brand-charcoal transition-colors text-sm font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border text-sm border-gray-100 shadow-sm rounded-lg overflow-hidden relative z-10">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No enquiries found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-light-grey border-b border-gray-200">
                  <th className="p-4 font-semibold text-brand-charcoal">Name</th>
                  <th className="p-4 font-semibold text-brand-charcoal">Phone</th>
                  <th className="p-4 font-semibold text-brand-charcoal">Project</th>
                  <th className="p-4 font-semibold text-brand-charcoal text-center">WA Consent</th>
                  <th className="p-4 font-semibold text-brand-charcoal whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{enquiry.name}</td>
                    <td className="p-4">{enquiry.phone}</td>
                    <td className="p-4 text-brand-charcoal font-medium">{enquiry.project_title}</td>
                    <td className="p-4 text-center">
                      {enquiry.whatsapp_consent ? (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Yes</span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">No</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">
                      {new Date(enquiry.created_at).toLocaleDateString()} <br />
                      <span className="text-xs">{new Date(enquiry.created_at).toLocaleTimeString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
