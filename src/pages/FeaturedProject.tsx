import { useState } from 'react';
import { MapPin, Check, FileText, Play, Camera, X, Eye } from 'lucide-react';
import { ProjectEnquiryModal } from '../components/ProjectEnquiryModal';

export function FeaturedProject() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [enquiryProject, setEnquiryProject] = useState<any | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);

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

  const constructionImages = [
    '/assets/featured-project-details/new-files/Amrit construction.jpeg',
    '/assets/featured-project-details/new-files/Amrit Construction 2.jpeg',
    '/assets/featured-project-details/new-files/Amrit Construction 3.jpeg',
    '/assets/featured-project-details/new-files/Amrit Construction 4.jpeg',
    '/assets/featured-project-details/new-files/Amrit Construction 5.jpeg',
    '/assets/featured-project-details/new-files/Amrit Construction 6.jpeg'
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
              src="https://www.youtube.com/embed/z4nivwEVlgM?autoplay=1&mute=1"
              title="Explore Amrit Aarogyam | Complete Project Walkthrough by HP Global Infrra"
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
                {[
                  { id: 'gallery', label: 'Gallery' },
                  { id: 'amenities', label: 'Amenities' },
                  { id: 'layout', label: 'Layout Plan' },
                  { id: 'updates', label: 'Construction Updates' },
                  { id: 'downloads', label: 'Documents' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap border-b-2 transition-all duration-300 ${activeTab === tab.id
                      ? 'border-brand-charcoal text-brand-charcoal'
                      : 'border-transparent text-gray-400 hover:text-brand-charcoal'
                      }`}
                  >
                    {tab.label}
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

                {activeTab === 'updates' && (
                  <div className="animate-fade-in-up space-y-12">
                    <h3 className="text-3xl font-heading text-brand-charcoal">Construction Updates</h3>
                    
                    {/* Native construction video */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <h4 className="text-lg font-semibold text-brand-charcoal mb-4 flex items-center gap-2">
                        <Play size={18} className="text-brand-champagne" /> Live Site Update Video
                      </h4>
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-brand-charcoal shadow-inner">
                        <video
                          src="/assets/featured-project-details/new-files/Amrit Construction Video.mp4"
                          controls
                          className="w-full h-full object-cover"
                          poster="/assets/featured-project-details/new-files/Amrit construction.jpeg"
                        />
                      </div>
                    </div>

                    {/* Construction image updates */}
                    <div>
                      <h4 className="text-lg font-semibold text-brand-charcoal mb-6 flex items-center gap-2">
                        <Camera size={18} className="text-brand-champagne" /> Construction Site Gallery
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {constructionImages.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => setLightboxImage(img)}
                            className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group bg-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
                          >
                            <img
                              src={img}
                              alt={`Construction Update ${i+1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'downloads' && (
                  <div className="animate-fade-in-up space-y-8">
                    <div>
                      <h3 className="text-3xl font-heading text-brand-charcoal mb-3">Project Documents</h3>
                      <p className="text-gray-500 font-light text-sm max-w-xl">
                        View brochures, payment schedules, layouts, and latest configurations lists for Amrit Aarogyam.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      {[
                        { name: "Apartments Brochure (Latest)", file: "apartments Latest.pdf", size: "26.6 MB" },
                        { name: "Penthouses Layout & FP (Latest)", file: "Penthouses_All _FP_latest.pdf", size: "24.5 MB" },
                        { name: "HPG Price List (June 2026)", file: "Amrit-Aarogyam  Hp-Global-Infrra_Price List 13.6.26.pdf", size: "5.4 MB" },
                        { name: "Penthouses Price List (July 2026)", file: "Penthouses Price List July 26.pdf", size: "9.0 MB" }
                      ].map((pdf, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-champagne/45 hover:bg-white transition-all duration-300">
                          <div className="flex gap-4 items-start mb-6">
                            <div className="p-3 bg-red-50 text-red-500 rounded-xl shrink-0">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-brand-charcoal mb-1">{pdf.name}</h4>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{pdf.size} • PDF Document</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setActivePdfUrl(`/assets/featured-project-details/new-files/${pdf.file}`)}
                            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-brand-charcoal text-brand-champagne font-bold text-xs uppercase tracking-widest hover:bg-brand-champagne hover:text-brand-charcoal transition-all duration-300 cursor-pointer"
                          >
                            <Eye size={14} /> View Document
                          </button>
                        </div>
                      ))}
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

      {/* Lightbox for construction gallery */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-brand-champagne transition-colors" onClick={() => setLightboxImage(null)}>
            <X size={32} />
          </button>
          <img src={lightboxImage} alt="Construction Update Detail" className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded" />
        </div>
      )}

      {/* Modal for PDF viewing */}
      {activePdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setActivePdfUrl(null)}>
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-brand-charcoal text-white">
              <span className="text-sm font-semibold tracking-wider uppercase">Document Viewer</span>
              <button className="text-white hover:text-brand-champagne transition-colors cursor-pointer" onClick={() => setActivePdfUrl(null)}>
                <X size={24} />
              </button>
            </div>
            <iframe
              src={`${activePdfUrl}#toolbar=0`}
              className="w-full flex-grow border-0"
              title="PDF Document Viewer"
            />
          </div>
        </div>
      )}

      <ProjectEnquiryModal
        isOpen={!!enquiryProject}
        onClose={() => setEnquiryProject(null)}
        project={enquiryProject}
      />
    </div>
  );
}
