import PropertyCard from '../components/PropertyCard';

const MOCK_PROPERTIES = [
  {
    id: 'hp-1',
    title: 'High-End Projects',
    price: 'Contact for Pricing',
    address: 'Bespoke mixed-use developments',
    beds: 0,
    baths: 0,
    sqft: 10000,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80'
  },
  {
    id: 'hp-2',
    title: 'Premium Strategic Plots',
    price: 'Contact for Pricing',
    address: 'Highly strategic locations with connectivity',
    beds: 0,
    baths: 0,
    sqft: 5000,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'hp-3',
    title: 'Residential Excellence',
    price: 'Contact for Pricing',
    address: 'Comfort, aesthetics, and functionality',
    beds: 3,
    baths: 3,
    sqft: 2500,
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'hp-4',
    title: 'Commercial Brilliance',
    price: 'Contact for Pricing',
    address: 'Cutting-edge spaces for business growth',
    beds: 0,
    baths: 0,
    sqft: 15000,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80'
  }
];

export default function Listings() {
  return (
    <div className="bg-brand-50 min-h-screen pb-24">
      {/* Sticky Search Panel */}
      <div className="sticky top-20 z-40 bg-white shadow-sm border-b border-brand-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-brand-900 font-display">Property Search</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <input type="text" placeholder="City, Neighborhood, or Zip" className="border border-brand-200 rounded-lg px-4 py-2 focus:ring-accent-500 focus:border-accent-500 outline-none w-full md:w-64" />
            <select className="border border-brand-200 rounded-lg px-4 py-2 bg-white w-full md:w-auto">
              <option>Price (Any)</option>
              <option>$1M - $5M</option>
              <option>$5M - $10M</option>
              <option>$10M+</option>
            </select>
            <select className="border border-brand-200 rounded-lg px-4 py-2 bg-white w-full md:w-auto">
              <option>Property Type</option>
              <option>Penthouse</option>
              <option>Villa</option>
              <option>Townhouse</option>
              <option>Commercial</option>
            </select>
            <button className="bg-brand-900 text-white px-8 py-2 rounded-lg hover:bg-brand-800 transition-colors shadow-sm font-medium whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 hidden lg:block space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100">
            <h3 className="font-bold text-lg text-brand-900 mb-6 font-display border-b border-brand-100 pb-2">Filter Options</h3>
            
            <div className="space-y-6">
              <div>
                <label className="font-medium text-brand-700 block mb-2 text-sm uppercase tracking-wide">Bedrooms</label>
                <div className="flex gap-2">
                  {['Any', '1+', '2+', '3+', '4+'].map(num => (
                    <button key={num} className="flex-1 border border-brand-200 py-2 rounded-md hover:border-brand-900 hover:bg-brand-50 transition-colors text-sm font-medium text-brand-900">
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="font-medium text-brand-700 block mb-2 text-sm uppercase tracking-wide">Bathrooms</label>
                <div className="flex gap-2">
                  {['Any', '1+', '2+', '3+', '4+'].map(num => (
                    <button key={num} className="flex-1 border border-brand-200 py-2 rounded-md hover:border-brand-900 hover:bg-brand-50 transition-colors text-sm font-medium text-brand-900">
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-medium text-brand-700 block mb-3 text-sm uppercase tracking-wide">Must Have Amenities</label>
                <div className="space-y-3">
                  {['New Construction', 'Waterfront', 'City Views', 'Pool', 'Smart Home'].map(amenity => (
                    <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-accent-600 focus:ring-accent-500 rounded border-brand-300" />
                      <span className="text-brand-700 text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <button className="w-full mt-8 border-2 border-brand-900 text-brand-900 font-medium py-3 rounded-xl hover:bg-brand-900 hover:text-white transition-all text-sm uppercase tracking-wider">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-brand-600 font-medium">Showing {MOCK_PROPERTIES.length} exact matches</p>
            <select className="border-none bg-transparent text-brand-900 font-medium cursor-pointer outline-none">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_PROPERTIES.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
