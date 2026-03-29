import { Building2, Mail, Phone, MapPin, Globe, Share2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 inline-flex">
              <div className="bg-white text-brand-900 p-1.5 rounded-md">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-wide text-white">HP Global Infra</span>
            </Link>
            <p className="text-brand-300 text-sm leading-relaxed mb-6">
              Curating distinctive residential and commercial properties for the modern visionary. Experience real estate with unmatched elegance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-brand-300 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="text-brand-300 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></a>
              <a href="#" className="text-brand-300 hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-medium text-lg mb-6 tracking-wide">Properties</h3>
            <ul className="space-y-3 text-sm text-brand-300">
              <li><Link to="/listings" className="hover:text-accent-500 transition-colors">Luxury Villas</Link></li>
              <li><Link to="/listings" className="hover:text-accent-500 transition-colors">Urban Penthouses</Link></li>
              <li><Link to="/listings" className="hover:text-accent-500 transition-colors">Commercial Towers</Link></li>
              <li><Link to="/listings" className="hover:text-accent-500 transition-colors">New Developments</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium text-lg mb-6 tracking-wide">Company</h3>
            <ul className="space-y-3 text-sm text-brand-300">
              <li><Link to="/about" className="hover:text-accent-500 transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-accent-500 transition-colors">Market Insights (Blog)</Link></li>
              <li><Link to="/contact" className="hover:text-accent-500 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-accent-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium text-lg mb-6 tracking-wide">Contact Us</h3>
            <ul className="space-y-4 text-sm text-brand-300">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent-500 shrink-0" />
                <span>B-302, T-3, NX-One, Tech Zone - 4<br/>Amrapali Dream Valley, Greater Noida, UP, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent-500 shrink-0" />
                <a href="tel:+917827955579" className="hover:text-white transition-colors">+91 7827955579</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent-500 shrink-0" />
                <a href="mailto:info@hpglobalinfra.com" className="hover:text-white transition-colors">info@hpglobalinfra.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-brand-800 flex flex-col md:flex-row justify-between items-center text-sm text-brand-400">
          <p>&copy; {new Date().getFullYear()} HP Global Infra. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
