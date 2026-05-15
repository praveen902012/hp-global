import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, RefreshCw, Mail } from 'lucide-react';

interface ContactRequest {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export function AdminContacts() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching contacts:', error);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const downloadCSV = () => {
    if (contacts.length === 0) return;
    
    const headers = ['ID', 'Name', 'Email', 'Message', 'Date'];
    const csvData = contacts.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.message.replace(/"/g, '""')}"`,
      new Date(c.created_at).toLocaleString().replace(/,/g, '')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contact_requests_${new Date().toISOString().split('T')[0]}.csv`);
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
            <Mail size={28} className="text-brand-champagne" />
            Contact Requests
          </h1>
          <p className="text-gray-500 mt-1">Manage and export messages from the Contact Us page.</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={fetchContacts}
            className="flex items-center gap-2 px-4 py-2 border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={downloadCSV}
            disabled={contacts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-brand-charcoal text-brand-champagne hover:bg-brand-champagne hover:text-brand-charcoal transition-colors text-sm font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border text-sm border-gray-100 shadow-sm rounded-lg overflow-hidden relative z-10">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading requests...</div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No contact requests found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-light-grey border-b border-gray-200">
                  <th className="p-4 font-semibold text-brand-charcoal w-1/4">Name</th>
                  <th className="p-4 font-semibold text-brand-charcoal w-1/4">Email</th>
                  <th className="p-4 font-semibold text-brand-charcoal w-1/3">Message</th>
                  <th className="p-4 font-semibold text-brand-charcoal whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium align-top">{contact.name}</td>
                    <td className="p-4 align-top">
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    </td>
                    <td className="p-4 text-brand-charcoal align-top">
                      <div className="max-h-24 overflow-y-auto pr-2">
                        {contact.message}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap align-top">
                      {new Date(contact.created_at).toLocaleDateString()} <br />
                      <span className="text-xs">{new Date(contact.created_at).toLocaleTimeString()}</span>
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
