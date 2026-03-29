import { Link } from 'react-router-dom';
import { Building2, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed w-full top-0 z-50 glass-panel border-b-0 border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-brand-900 text-white p-2 rounded-lg group-hover:bg-accent-600 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-brand-900">HP Global Infra</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-brand-700 hover:text-accent-600 font-medium transition-colors">Properties</Link>
            <Link to="/listings" className="text-brand-700 hover:text-accent-600 font-medium transition-colors">Search</Link>
            <Link to="/blog" className="text-brand-700 hover:text-accent-600 font-medium transition-colors">Insights & News</Link>
            <Link to="/contact" className="text-brand-700 hover:text-accent-600 font-medium transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:+18005550199" className="text-brand-600 font-medium hover:text-brand-900 transition-colors">1-800-555-0199</a>
            <Link to="/contact" className="bg-brand-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Book a Tour
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button className="text-brand-900 hover:text-brand-700">
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
