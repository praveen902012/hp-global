import { MapPin, Phone, Mail } from "lucide-react";
import { Button } from "../components/ui/Button";

export function Contact() {
  return (
    <div className="pt-40 pb-32 bg-brand-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-2 gap-20">
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-champagne mb-8 block">Consultation</span>
            <div className="w-12 h-[1px] bg-brand-charcoal mb-10"></div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-light text-brand-charcoal mb-8 tracking-tight">
              Connect With Us
            </h1>
            <p className="text-lg text-gray-500 font-light mb-16 leading-relaxed max-w-md">
              Reach out to our experts to discuss your real estate ventures and high-yield property investments.
            </p>

            <div className="space-y-12 mb-16">
              
              <div className="flex items-start gap-6 group cursor-default">
                <MapPin className="text-brand-champagne mt-1" size={24} strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-semibold tracking-widest uppercase text-brand-charcoal mb-3">Corporate Office</h3>
                  <p className="text-gray-500 leading-loose font-light">
                    B-302, T-3, NX-One, Tech Zone - 4,<br/>
                    Amrapali Dream Valley, Greater Noida,<br/>
                    Uttar Pradesh, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group cursor-default">
                <Phone className="text-brand-champagne mt-1" size={24} strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-semibold tracking-widest uppercase text-brand-charcoal mb-3">Call Us</h3>
                  <p className="text-gray-500 leading-loose font-light">
                    <span className="text-brand-charcoal font-medium tracking-wider text-base">+91 7827955579</span><br/>
                    Mon-Sat: 9AM to 6PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group cursor-pointer">
                <Mail className="text-brand-champagne mt-1" size={24} strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-semibold tracking-widest uppercase text-brand-charcoal mb-3">Email Us</h3>
                  <p className="text-gray-500 leading-loose font-light">
                    <a href="mailto:info@hpglobalinfra.com" className="border-b border-gray-300 hover:border-brand-champagne hover:text-brand-champagne transition-colors duration-300">
                      info@hpglobalinfra.com
                    </a><br/>
                    For PR and General Enquiries.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-brand-light-grey subtle-border p-12 lg:p-16 h-full flex flex-col shadow-sm">
            <h2 className="text-2xl font-heading font-normal text-brand-charcoal mb-10 pb-6 border-b border-gray-200">
              Send a Request
            </h2>
            <form className="space-y-8 flex-grow flex flex-col" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-3">Full Name</label>
                <input type="text" id="name" className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-brand-charcoal outline-none transition-colors rounded-none placeholder-gray-400" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-3">Email Address</label>
                <input type="email" id="email" className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-brand-charcoal outline-none transition-colors rounded-none placeholder-gray-400" placeholder="john@example.com" />
              </div>
              <div className="flex-grow">
                <label htmlFor="message" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-3">Message</label>
                <textarea id="message" rows={4} className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-brand-charcoal outline-none transition-colors rounded-none placeholder-gray-400 resize-none h-full" placeholder="How can we assist your vision?"></textarea>
              </div>
              <div className="pt-6">
                <Button type="submit" variant="primary" className="w-full">
                  Transmit Request
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
