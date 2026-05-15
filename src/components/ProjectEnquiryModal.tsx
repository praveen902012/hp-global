import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Project {
  title: string;
  location: string;
  category?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function ProjectEnquiryModal({ isOpen, onClose, project }: ModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(true);
  
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNum1(Math.floor(Math.random() * 10) + 1);
      setNum2(Math.floor(Math.random() * 10) + 1);
      setName('');
      setPhone('');
      setConsent(true);
      setCaptchaAnswer('');
      setIsSuccess(false);
      setError('');
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Phone number is required');
      return;
    }
    
    // Indian phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (parseInt(captchaAnswer) !== num1 + num2) {
      setError('Incorrect CAPTCHA answer');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const { error: dbError } = await supabase.from('enquiries').insert([{
        name,
        phone,
        whatsapp_consent: consent,
        project_title: project.title
      }]);

      if (dbError) throw dbError;

      setIsSuccess(true);
      // Let the user see success message before closing automatically
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting enquiry:', err);
      // Show the exact database error to help the user know if the table is missing or RLS is failing
      setError(err?.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-brand-charcoal/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-zinc-50">
          <div>
            <h3 className="text-xl font-heading text-brand-charcoal">Enquire Now</h3>
            <p className="text-xs text-brand-champagne font-bold uppercase tracking-wider mt-1">
              {project.title}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-brand-charcoal transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in-up">
              <CheckCircle2 size={64} className="text-green-500 mb-4" />
              <h4 className="text-2xl font-heading text-brand-charcoal mb-2">Thank You!</h4>
              <p className="text-gray-500 font-light text-sm">
                Your enquiry for {project.title} has been received. Our team will contact you shortly on WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-champagne transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="bg-gray-50 border border-gray-200 border-r-0 p-3 text-sm text-gray-500 font-light flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-champagne transition-colors"
                    placeholder="98765 43210"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 mt-1 bg-zinc-50 p-4 border border-zinc-100">
                <input 
                  type="checkbox"
                  id="whatsapp-consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-brand-champagne cursor-pointer"
                />
                <label htmlFor="whatsapp-consent" className="text-xs text-gray-500 font-light leading-relaxed cursor-pointer">
                  I consent to receive details, updates, and communication regarding this inquiry on WhatsApp.
                </label>
              </div>

              {/* CAPTCHA Section */}
              <div className="mt-2 border border-gray-200 p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-3">
                  Verification
                </label>
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-100 text-brand-charcoal font-medium px-4 py-2 font-mono tracking-widest select-none">
                    {num1} + {num2} =
                  </div>
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-full border border-gray-200 p-2 text-sm focus:outline-none focus:border-brand-champagne"
                    placeholder="Result"
                    required
                    min="0"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-xs font-medium py-1">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (!consent && phone !== '')}
                className={`w-full mt-4 bg-brand-charcoal text-white font-bold text-xs uppercase tracking-[0.2em] py-4 transition-all duration-300
                  ${(isSubmitting) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-champagne'}
                `}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
