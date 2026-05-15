import { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { ProjectEnquiryModal } from '../components/ProjectEnquiryModal';

export function FeaturedProject() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [enquiryProject, setEnquiryProject] = useState<any | null>(null);

  const galleryImages = [
    { src: '/assets/featured-project-details/projects-image/1.jpeg', alt: 'Project Image 1' },
    { src: '/assets/featured-project-details/projects-image/2.jpeg', alt: 'Project Image 2' },
    { src: '/assets/featured-project-details/projects-image/3.jpg', alt: 'Project Image 3' },
    { src: '/assets/featured-project-details/projects-image/slider-01.jpg', alt: 'Slider 1' },
    { src: '/assets/featured-project-details/projects-image/slider-03.jpg', alt: 'Slider 3' },
    { src: '/assets/featured-project-details/projects-image/slider-05.jpg', alt: 'Slider 5' },
    { src: '/assets/featured-project-details/projects-image/slider-06.jpg', alt: 'Slider 6' },
    { src: '/assets/featured-project-details/projects-image/overview-img1.jpg', alt: 'Overview 1' },
    { src: '/assets/featured-project-details/projects-image/overview-img2.jpg', alt: 'Overview 2' },
  ];

  const amenities = [
    { name: 'Children Park', icon: '/assets/featured-project-details/projects-image/children-park.png' },
    { name: 'Jogging Track', icon: '/assets/featured-project-details/projects-image/jogging.png' },
    { name: 'Multi-Purpose Hall', icon: '/assets/featured-project-details/projects-image/multi-purpose-hall.png' },
  ];

  return (
    <div className="bg-brand-white min-h-screen pt-20">
      {/* Hero Header */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end pb-20 bg-brand-charcoal overflow-hidden group">
        <img
          src="/assets/featured-project-details/projects-image/overview-img.jpg"
          alt="Featured Project Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-50 transform group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-[1.5px] bg-brand-champagne"></div>
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-brand-champagne">Premium Residences</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-heading font-light text-white mb-6 tracking-tight leading-tight">
            Amrit <span className="italic font-medium text-brand-champagne/80">Aarogyam</span>
          </h1>
          <div className="flex items-center text-slate-300 gap-2 mb-8">
            <MapPin size={18} className="text-brand-champagne" />
            <p className="font-light tracking-wide">Haridwar, Uttarakhand</p>
          </div>
        </div>
      </section>
      
      {/* Video Showcase Section */}
      <section className="bg-white pt-24 -mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full pt-[56.25%] rounded-2xl overflow-hidden shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] bg-brand-charcoal">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/DKi84RHGDog?autoplay=1&mute=1"
              title="hp global amrit arogyam"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-2/3">
              {/* Tabs Navigation */}
              <div className="flex space-x-8 border-b border-gray-200 mb-12 overflow-x-auto pb-1">
                {['gallery', 'amenities', 'layout'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap border-b-2 transition-all duration-300 ${
                      activeTab === tab
                        ? 'border-brand-charcoal text-brand-charcoal'
                        : 'border-transparent text-gray-400 hover:text-brand-charcoal'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[600px]">
                {activeTab === 'gallery' && (
                  <div className="animate-fade-in-up">
                    <h3 className="text-3xl font-heading text-brand-charcoal mb-8">Photo Gallery</h3>
                    <div className="columns-1 sm:columns-2 gap-6 space-y-6">
                      {galleryImages.map((img, index) => (
                        <div key={index} className="break-inside-avoid overflow-hidden group bg-gray-100 relative">
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-brand-charcoal/10 group-hover:bg-transparent transition-colors duration-500"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="animate-fade-in-up">
                    <h3 className="text-3xl font-heading text-brand-charcoal mb-8">World-Class Amenities</h3>
                    <p className="text-gray-500 font-light leading-relaxed mb-12 max-w-2xl">
                      Experience a lifestyle of unmatched luxury and comfort. Our carefully curated amenities are designed to cater to every aspect of modern living, ensuring you always have the best at your doorstep.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {amenities.map((amenity, index) => (
                        <div key={index} className="flex flex-col items-center bg-gray-50 p-10 border border-gray-100 hover:border-brand-champagne/50 hover:bg-white transition-all duration-500 group">
                          <div className="w-24 h-24 mb-6 opacity-80 group-hover:opacity-100 transform group-hover:-translate-y-2 transition-all duration-500">
                            <img src={amenity.icon} alt={amenity.name} className="w-full h-full object-contain" />
                          </div>
                          <h4 className="text-lg font-heading text-brand-charcoal">{amenity.name}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'layout' && (
                  <div className="animate-fade-in-up">
                    <h3 className="text-3xl font-heading text-brand-charcoal mb-8">Master Layout Plan</h3>
                    <div className="border border-gray-200 p-2 bg-white shadow-sm overflow-hidden group">
                      <img
                        src="/assets/featured-project-details/projects-image/layout-plan1.jpg"
                        alt="Layout Plan"
                        className="w-full h-auto group-hover:scale-105 transition-transform duration-1000"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="sticky top-32 bg-brand-charcoal p-10 shadow-2xl">
                <div className="mb-8">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-champagne mb-4 block">Project Status</span>
                  <h3 className="text-white text-3xl font-heading font-light">Now Booking</h3>
                  <div className="w-12 h-[1px] bg-brand-champagne/50 mt-6 mb-8"></div>
                </div>

                <ul className="space-y-6 mb-10">
                  <li className="flex items-start gap-4 text-slate-300">
                    <Check size={18} className="text-brand-champagne mt-1 shrink-0" />
                    <span className="font-light text-sm leading-relaxed">Premium Apartments & Luxury Penthouses</span>
                  </li>
                  <li className="flex items-start gap-4 text-slate-300">
                    <Check size={18} className="text-brand-champagne mt-1 shrink-0" />
                    <span className="font-light text-sm leading-relaxed">State-of-the-art security features</span>
                  </li>
                  <li className="flex items-start gap-4 text-slate-300">
                    <Check size={18} className="text-brand-champagne mt-1 shrink-0" />
                    <span className="font-light text-sm leading-relaxed">Strategic urban location with great connectivity</span>
                  </li>
                </ul>

                <button 
                  onClick={() => setEnquiryProject({ title: "Amrit Aarogyam", location: "Haridwar, Uttarakhand", category: "Premium Residences" })}
                  className="w-full justify-center bg-brand-champagne text-brand-charcoal hover:bg-white font-bold text-xs uppercase tracking-widest py-4 transition-colors duration-300"
                >
                  Register Interest
                </button>
                
                <p className="text-center text-xs text-white/40 mt-6 font-light">
                  Our team will contact you within 24 hours to discuss your requirements.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <ProjectEnquiryModal 
        isOpen={!!enquiryProject} 
        onClose={() => setEnquiryProject(null)} 
        project={enquiryProject} 
      />
    </div>
  );
}
