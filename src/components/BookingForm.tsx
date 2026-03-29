import { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail } from 'lucide-react';

export default function BookingForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate lead capture and confirmation email
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-brand-50 p-8 rounded-2xl text-center shadow-md border border-brand-200 animate-float" style={{ animationIterationCount: 1, animationDuration: '1s' }}>
        <div className="w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-2xl font-bold font-display text-brand-900 mb-2">Tour Confirmed</h3>
        <p className="text-brand-600">Thank you for scheduling a tour. A confirmation email with calendar invites and directions has been sent.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-brand-100 glass-panel">
      <h3 className="text-2xl font-bold font-display text-brand-900 mb-2">Schedule a Tour</h3>
      <p className="text-brand-600 mb-6 text-sm">Select a date and time to view the property in person or via video call.</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date
            </label>
            <input type="date" required className="w-full border border-brand-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent-500 outline-none text-brand-900 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Time (EST)
            </label>
            <select required className="w-full border border-brand-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent-500 outline-none text-brand-900 text-sm bg-white">
              <option value="">Select slot</option>
              <option>10:00 AM</option>
              <option>11:30 AM</option>
              <option>2:00 PM</option>
              <option>4:00 PM</option>
            </select>
          </div>
        </div>
        
        <hr className="border-brand-100 my-4" />
        
        <div>
          <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-1 flex items-center gap-1">
            <User className="w-3 h-3" /> Full Name
          </label>
          <input type="text" placeholder="Jane Doe" required className="w-full border border-brand-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent-500 outline-none text-brand-900 text-sm" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </label>
            <input type="email" placeholder="jane@example.com" required className="w-full border border-brand-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent-500 outline-none text-brand-900 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </label>
            <input type="tel" placeholder="(555) 000-0000" className="w-full border border-brand-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent-500 outline-none text-brand-900 text-sm" />
          </div>
        </div>

        <button type="submit" className="w-full bg-accent-600 text-white font-medium py-3 rounded-lg hover:bg-accent-500 transition-colors shadow-md mt-6">
          Request Showing
        </button>
      </form>
    </div>
  );
}
