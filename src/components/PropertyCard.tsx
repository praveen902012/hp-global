import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
}

export default function PropertyCard({ id, title, price, address, beds, baths, sqft, image }: PropertyCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-100 dynamic-hover flex flex-col group">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-900 rounded-full shadow-md z-10">
          Featured
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-2xl font-bold text-accent-600 mb-2">{price}</p>
        <h3 className="text-xl font-bold text-brand-900 mb-2 font-display truncate">{title}</h3>
        <div className="flex items-center text-brand-600 text-sm mb-6">
          <MapPin className="w-4 h-4 mr-1 shrink-0" />
          <span className="truncate">{address}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 border-t border-brand-100 pt-6 mt-auto mb-6 text-brand-700 text-sm">
          <div className="flex flex-col items-center justify-center">
            <Bed className="w-5 h-5 mb-1 opacity-70" />
            <span className="font-medium">{beds} Beds</span>
          </div>
          <div className="flex flex-col items-center justify-center border-x border-brand-100">
            <Bath className="w-5 h-5 mb-1 opacity-70" />
            <span className="font-medium">{baths} Baths</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Square className="w-5 h-5 mb-1 opacity-70" />
            <span className="font-medium">{sqft} sqft</span>
          </div>
        </div>

        <Link to={`/property/${id}`} className="block w-full text-center bg-brand-50 text-brand-900 font-medium py-3 rounded-xl border border-brand-200 hover:bg-brand-900 hover:text-white hover:border-brand-900 transition-all">
          View Details
        </Link>
      </div>
    </div>
  );
}
