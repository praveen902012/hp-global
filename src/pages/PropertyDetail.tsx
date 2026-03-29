import { useState } from 'react';
import BookingForm from '../components/BookingForm';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function PropertyDetail() {
  const [activeTab, setActiveTab] = useState('gallery');

  // Hardcoded coordinates for Central Park South
  const position: [number, number] = [40.7655, -73.9745];

  return (
    <div className="bg-brand-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <span className="inline-block bg-accent-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">Featured Partner Project</span>
            <h1 className="text-3xl md:text-5xl font-bold text-brand-900 font-display tracking-tight">High-End Residential Masterpiece</h1>
            <p className="text-brand-600 mt-2 text-lg">Amrapali Dream Valley, Greater Noida, UP, India</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-4xl font-bold text-accent-600">Contact for Pricing</p>
            <p className="text-brand-600 font-medium">Bespoke Options Available</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs Navigation */}
            <div className="flex space-x-2 sm:space-x-8 border-b border-brand-200 mb-6 overflow-x-auto">
              {['gallery', 'floorplan', 'amenities', 'location'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors duration-300 ${activeTab === tab ? 'border-brand-900 text-brand-900' : 'border-transparent text-brand-400 hover:text-brand-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-brand-100 min-h-[600px] flex flex-col">
              {activeTab === 'gallery' && (
                <div className="grid grid-cols-1 gap-4 flex-grow">
                  <div className="h-[400px] sm:h-[500px] overflow-hidden rounded-xl">
                     <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Penthouse living room" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 h-[150px]">
                    <img src="https://images.unsplash.com/photo-1502672260266-1c1de2d92015?ixlib=rb-4.0.3&auto=format&fit=crop&w=1973&q=80" className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity" />
                    <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80" className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity" />
                    <div className="relative cursor-pointer hover:opacity-80 transition-opacity rounded-xl overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-brand-900/60 flex items-center justify-center text-white font-bold text-xl">+12 Photos</div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'floorplan' && (
                <div className="flex flex-col items-center justify-center space-y-8 flex-grow">
                  <div className="w-full h-[400px] bg-brand-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-brand-200">
                    <svg className="w-20 h-20 text-brand-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <p className="text-brand-500 font-medium">Interactive floorplan viewer</p>
                  </div>
                  <button className="bg-brand-900 text-white px-8 py-3 rounded-full font-medium hover:bg-brand-800 transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Floor Plan PDF
                  </button>
                </div>
              )}
              
              {activeTab === 'amenities' && (
                <div className="flex-grow">
                  <h3 className="text-xl font-bold font-display text-brand-900 mb-6">Property Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-brand-900 mb-4 border-b border-brand-100 pb-2">Interior</h4>
                        <ul className="space-y-4 text-brand-700">
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span> Smart Home Technology</li>
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span> Private Elevator Access</li>
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span> Chef's Grade Kitchen with Sub-Zero</li>
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span> Custom Walk-in Closets</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-brand-900 mb-4 border-b border-brand-100 pb-2">Building</h4>
                        <ul className="space-y-4 text-brand-700">
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span> 24/7 Doorman and Concierge</li>
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span> 360-degree City Views</li>
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span> Private Wine Cellar</li>
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span> Fitness Center & Spa</li>
                        </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'location' && (
                <div className="flex-grow flex flex-col">
                  <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-inner border border-brand-100 mb-6 relative z-0">
                    <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={position}>
                        <Popup>
                          <strong>The Crown Penthouse</strong><br />
                          Central Park South
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                        <p className="font-bold text-brand-900 block mb-1">Nearby Transits</p>
                        <p className="text-sm text-brand-600">Columbus Circle (1, A, B, C, D) - 2 min walk</p>
                    </div>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`} target="_blank" rel="noreferrer" className="bg-brand-100 text-brand-900 font-medium px-6 py-2.5 rounded-lg hover:bg-brand-200 transition-colors">
                        Get Directions
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <BookingForm />
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-100 hidden lg:block">
              <h3 className="font-bold text-lg text-brand-900 mb-4 font-display">Listing Agent</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-brand-200 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" alt="Agent" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-brand-900">Michael Rossi</p>
                  <p className="text-sm text-brand-500">Senior Partner</p>
                </div>
              </div>
              <a href="mailto:mrossi@auraproperties.com" className="block text-center border-2 border-brand-900 text-brand-900 font-medium py-2 rounded-xl mb-3 hover:bg-brand-900 hover:text-white transition-colors">Email Agent</a>
              <a href="tel:+18005550199" className="block text-center bg-brand-50 text-brand-700 font-medium py-2 rounded-xl border border-brand-200 hover:bg-brand-200 transition-colors">Call Agent</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
