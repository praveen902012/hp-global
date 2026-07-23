import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { MoveRight, MapPin, Play, Camera, FileText, X, Check, Calendar, Eye } from "lucide-react";
import { blogs } from "../data/blogData";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { ProjectEnquiryModal } from "../components/ProjectEnquiryModal";

export function Home() {
  const [portfolioTab, setPortfolioTab] = useState<'hpg' | 'partner'>('hpg');
  const [enquiryProject, setEnquiryProject] = useState<any | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);

  const commercialProjects = [
    {
      title: "Trehan IRIS Broadway",
      location: "Greater Noida (West)",
      image: "/images/iris_broadway.png",
      description: "A magnificent 1 Million Sq. Ft. retail-led landmark featuring an upcoming multiplex, gourmet food court, corporate offices, and high-street retail.",
      price: "₹14 Lakhs*",
      tags: ["Anchor Stores", "Food Court & Multiplex", "130M Road Frontage"]
    },
    {
      title: "Apex Park Square",
      location: "Greater Noida (West)",
      image: "/images/apex_park_square.png",
      description: "90% Pre-leased to Top Brands. G+14 Floors of Retail, Entertainment & Lifestyle with double-height shops and double basement parking.",
      price: "₹21 Lakhs*",
      tags: ["90% Pre-Leased", "Double Height Shops", "600+ Cars Parking"]
    }
  ];

  const residentialProjects = [
    {
      title: "Forest Walk",
      location: "NH 24, Ghaziabad",
      image: "/images/forestwalk.jpeg",
      description: "Where nature meets next-level luxury. Fully-furnished boutique villas nestled in rich green environments, offering a private oasis.",
      price: "₹16,633/Sq.ft*",
      tags: ["Furnished Villas", "Lush Greenery", "Possession 15 Mos"]
    },
    {
      title: "Sobha Noida",
      location: "Noida",
      image: "/images/sobha.jpg",
      description: "Grandiose Living, Crafted with 30 Years of Passion...Coming Soon. German engineering blended with world-class aesthetics and seamless experience.",
      price: "Upcoming",
      tags: ["German Engineering", "Upcoming Launch", "1456 Quality Checks"]
    },
    {
      title: "TRUMP TOWER",
      location: "Sector 94, Noida",
      image: "/images/trump_tower.png",
      description: "Making your home a statement of success. Ultra-luxury 4-5 BHK homes with global brand prestige, private elevator lobbies, and skyline views.",
      price: "₹18–20 Cr",
      tags: ["Trump Brand Prestige", "Private Elevators", "Skyline Views"]
    },
    {
      title: "Jacob & Co.",
      location: "Sector 97, Noida",
      image: "/images/jacob_co.png",
      description: "The Crown Jewel of Noida. Step into a world where heritage meets innovation and design becomes a symbol of legacy with 4 iconic skyscrapers.",
      price: "₹8.40 Cr*",
      tags: ["G+39 Skyscrapers", "Clubhouse Inspired", "Ultra-Luxury Living"]
    },
    {
      title: "CRC JOYOUS",
      location: "Techzone 4, Greater Noida (West)",
      image: "/images/crc_joyous.png",
      description: "Affordable Luxury with Full-Spectrum Configurations. Spacious 2, 3 & 4 BHK apartments and duplex penthouses located next to proposed metro.",
      price: "₹2.26 Cr",
      tags: ["2, 3 & 4 BHK", "Proposed Metro 100m", "RERA Compliant"]
    }
  ];
  return (
    <div className="bg-brand-white">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[800px] flex items-center pt-20 bg-brand-charcoal overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -m-32 w-[600px] h-[600px] bg-brand-champagne/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid lg:grid-cols-2 gap-16 items-center">

          <div className="flex flex-col items-start pr-8">
            <div className="mb-6 animate-fade-in-up">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-champagne block ml-1">Premier Real Estate</span>
            </div>

            <h1 className="text-7xl md:text-[6rem] lg:text-[8rem] font-heading font-normal text-white leading-[0.95] mb-8 tracking-tighter">
              HP Global<br />
              <span className="font-light italic text-gradient-gold">Infrra</span>
            </h1>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-light text-slate-300 leading-snug mb-10 tracking-tight max-w-lg">
              Shaping the <span className="italic text-white">Future</span> of Real Estate
            </h2>

            <p className="text-lg md:text-xl text-slate-400 mb-14 max-w-lg leading-relaxed font-light">
              Discover unparalleled tier-one real estate services. Partner in vision, invest in growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <Button to="/services" variant="primary" className="bg-brand-champagne text-brand-charcoal border-brand-champagne hover:bg-white hover:text-brand-charcoal hover:border-white">
                Explore Services
              </Button>
              <Button to="/investments" variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:border-white">
                View Portfolio
              </Button>
            </div>
          </div>

          <div className="hidden lg:block relative h-[75vh] w-full group">
            <div className="absolute inset-0 border border-brand-champagne/30 transform translate-x-6 -translate-y-6"></div>
            <img
              src="/hero_banner_real_estate_1774769760013.png"
              alt="High-end luxury residential building"
              className="absolute inset-0 w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 shadow-2xl"
            />
            <div className="absolute inset-0 bg-brand-charcoal/10 group-hover:bg-transparent transition-colors duration-1000"></div>
          </div>
        </div>
      </section>

      {/* Featured Project Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 border border-brand-charcoal rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] border border-brand-charcoal rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[1.5px] bg-brand-champagne"></div>
                <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-brand-champagne">Exclusive Showcase</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-heading font-light text-brand-charcoal mb-6 tracking-tight leading-[1.1]">
                Featured <span className="italic font-medium text-brand-champagne/80">Project</span>
              </h2>
              <p className="text-xl text-slate-500 font-light max-w-xl leading-relaxed">
                Discover our latest masterpiece. A perfect blend of luxury, comfort, and modern architecture designed for the future.
              </p>
            </div>
            <div className="hidden md:block pb-2">
              <NavLink to="/featured-project" className="px-8 py-4 border border-slate-200 text-xs font-bold uppercase tracking-[0.3em] text-brand-charcoal hover:bg-brand-charcoal hover:text-white hover:border-brand-charcoal transition-all duration-700 group flex items-center gap-4">
                View Details <MoveRight size={18} className="text-brand-champagne group-hover:translate-x-2 transition-transform duration-500" />
              </NavLink>
            </div>
          </div>

          {/* Main Video Highlight */}
          <div className="mb-20 animate-fade-in-up">
            <div className="relative w-full pt-[56.25%] rounded-2xl overflow-hidden shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] bg-brand-charcoal group">
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

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[600px] w-full group overflow-hidden">
              <img
                src="/assets/featured-project-details/projects-image/slider-05.jpg"
                alt="Featured Project Overview"
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-transparent opacity-80"></div>
              <div className="absolute bottom-10 left-10 right-10">
                <h3 className="text-3xl font-heading text-white mb-3">Amrit Aarogyam</h3>
                <p className="text-slate-300 font-light mb-6">Premium apartments in Haridwar, Uttarakhand offering unparalleled living with state-of-the-art amenities.</p>
                <div className="flex gap-4">
                  <span className="px-4 py-2 border border-white/20 text-xs text-white uppercase tracking-widest backdrop-blur-sm">Apartments</span>
                  <span className="px-4 py-2 border border-white/20 text-xs text-white uppercase tracking-widest backdrop-blur-sm">Penthouses</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 h-[600px]">
              <div className="relative h-full overflow-hidden group">
                <img src="/assets/featured-project-details/projects-image/slider-06.jpg" alt="Interior" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" />
              </div>
              <div className="grid grid-rows-2 gap-6 h-full">
                <div className="relative overflow-hidden group">
                  <img src="/assets/featured-project-details/projects-image/slider-03.jpg" alt="Amenities" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" />
                </div>
                <div className="relative overflow-hidden group bg-brand-champagne flex flex-col items-center justify-center p-8 text-center hover:bg-white transition-colors duration-500">
                  <h4 className="text-2xl font-heading text-brand-charcoal mb-4">Discover More</h4>
                  <NavLink to="/featured-project" className="inline-flex items-center text-xs uppercase tracking-[0.3em] font-bold text-brand-charcoal border-b border-brand-charcoal pb-2 hover:opacity-70 transition-opacity">
                    Explore Gallery <MoveRight size={14} className="ml-2" />
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden mt-10">
            <Button to="/featured-project" variant="outline" className="w-full justify-center border-slate-200 text-brand-charcoal hover:bg-brand-charcoal hover:text-white hover:border-brand-charcoal">
              View Project Details
            </Button>
          </div>
        </div>
      </section>

      {/* Our Projects Portfolio Section */}
      <section className="py-32 bg-brand-light-grey relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center mb-16">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-champagne mb-4 block">Our Portfolio</span>
            <h2 className="text-4xl md:text-6xl font-heading font-light text-brand-charcoal mb-8 tracking-tight leading-[1.1]">
              Our <span className="italic font-medium text-brand-champagne/80">Portfolio</span>
            </h2>
            <p className="text-xl text-slate-500 font-light max-w-3xl mx-auto leading-relaxed">
              Discover our carefully curated real estate portfolio, featuring landmark developments by HPG Inffra and exclusive projects represented through our strategic developer partnerships.
            </p>
          </div>

          {/* Segmented Tabs */}
          <div className="flex justify-center mb-20">
            <div className="inline-flex p-1.5 bg-white/85 backdrop-blur-md border border-gray-100 rounded-full shadow-lg max-w-2xl w-full">
              <button
                onClick={() => setPortfolioTab('hpg')}
                className={`flex-1 py-4 px-6 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  portfolioTab === 'hpg'
                    ? 'bg-brand-charcoal text-brand-champagne shadow-md'
                    : 'text-gray-400 hover:text-brand-charcoal'
                }`}
              >
                Developed by HPG Inffra
              </button>
              <button
                onClick={() => setPortfolioTab('partner')}
                className={`flex-1 py-4 px-6 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  portfolioTab === 'partner'
                    ? 'bg-brand-charcoal text-brand-champagne shadow-md'
                    : 'text-gray-400 hover:text-brand-charcoal'
                }`}
              >
                Partner Developments
              </button>
            </div>
          </div>

          {/* Tab Content with transitions */}
          <div className="transition-opacity duration-300">
            {portfolioTab === 'hpg' ? (
              <div className="space-y-16 animate-fade-in-up">
                {/* Featured Showcase: Amrit Aarogyam */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100/50">
                  <div className="grid lg:grid-cols-12 gap-0">
                    <div className="lg:col-span-5 relative h-[300px] lg:h-auto min-h-[350px] overflow-hidden group">
                      <img
                        src="/assets/featured-project-details/projects-image/slider-05.jpg"
                        alt="Amrit Aarogyam Showcase"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-6 left-6 bg-brand-charcoal text-brand-champagne text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full z-10">
                        Wellness-Centric Living
                      </div>
                    </div>

                    <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-brand-champagne mb-4">
                          <MapPin size={16} strokeWidth={1.5} />
                          <span className="text-xs uppercase tracking-widest font-semibold text-gray-500">Haridwar, Uttarakhand</span>
                        </div>
                        
                        <h3 className="text-3xl lg:text-4xl font-heading text-brand-charcoal mb-4">Amrit Aarogyam</h3>
                        <p className="text-gray-500 font-light text-base leading-relaxed mb-6 italic">
                          Where health meets luxury, and design elevates living.
                        </p>
                        
                        <p className="text-gray-500 font-light text-base leading-relaxed mb-8">
                          Amrit Aarogyam is a sanctuary of serenity. Meticulously designed around wellness principles, it integrates lush oxygen parks, meditation lawns, and therapeutic landscaping with ultra-luxury 2 & 3 BHK apartments and sky penthouses.
                        </p>

                        <div className="space-y-4 mb-10">
                          {[
                            "Premium Apartments & Sky Penthouses with high-end specifications",
                            "Vibrant Yoga Decks, Oxygen Parks & Therapeutic reflexology paths",
                            "World-class security features and tier-one construction standards",
                            "Strategic connectivity, just minutes from the holy Ganges and major travel routes"
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-brand-champagne/10 text-brand-champagne shrink-0">
                                <Check size={12} strokeWidth={2.5} />
                              </div>
                              <span className="text-gray-600 font-light text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                        <button
                          onClick={() => setEnquiryProject({ title: "Amrit Aarogyam", location: "Haridwar, Uttarakhand", category: "HPG Developed" })}
                          className="flex-1 py-4 bg-brand-charcoal text-brand-champagne font-bold text-xs uppercase tracking-widest hover:bg-brand-champagne hover:text-brand-charcoal transition-colors duration-300"
                        >
                          Register Interest
                        </button>
                        <NavLink
                          to="/featured-project"
                          className="flex-1 py-4 border border-gray-200 text-center font-bold text-xs uppercase tracking-widest text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all duration-300"
                        >
                          View Full Details
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Card 1: Brochure & Documents */}
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mb-6">
                        <FileText size={24} />
                      </div>
                      <h4 className="text-xl font-heading text-brand-charcoal mb-3">Project Documents</h4>
                      <p className="text-gray-500 font-light text-sm leading-relaxed mb-6">
                        Examine pricing structures, layouts, and configurations.
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        {[
                          { name: "Apartments Brochure", file: "apartments Latest.pdf" },
                          { name: "Penthouses Layout", file: "Penthouses_All _FP_latest.pdf" },
                          { name: "HPG Price List", file: "Amrit-Aarogyam  Hp-Global-Infrra_Price List 13.6.26.pdf" },
                          { name: "Penthouses Price List", file: "Penthouses Price List July 26.pdf" }
                        ].map((doc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePdfUrl(`/assets/featured-project-details/new-files/${doc.file}`)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-brand-champagne/10 border border-gray-100 rounded-xl group transition-all duration-300 text-left cursor-pointer"
                          >
                            <span className="text-[11px] font-semibold text-brand-charcoal truncate pr-2">{doc.name}</span>
                            <Eye size={12} className="text-gray-400 group-hover:text-brand-charcoal shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setEnquiryProject({ title: "Amrit Aarogyam (All Documents Request)", location: "Haridwar, Uttarakhand", category: "HPG Developed" })}
                      className="w-full text-center py-3 bg-brand-charcoal text-brand-champagne font-bold text-[10px] uppercase tracking-wider hover:bg-brand-champagne hover:text-brand-charcoal transition-colors duration-300"
                    >
                      Book Now
                    </button>
                  </div>

                  {/* Card 2: Construction Status */}
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6">
                        <Play size={24} />
                      </div>
                      <h4 className="text-xl font-heading text-brand-charcoal mb-3">Construction Status</h4>
                      <p className="text-gray-500 font-light text-sm leading-relaxed mb-6">
                        Watch our latest live site walkthrough video showing the actual construction progress of Amrit Aarogyam.
                      </p>
                    </div>
                    <div className="relative aspect-video w-full overflow-hidden bg-brand-charcoal rounded-lg group">
                      {showVideo ? (
                        <video
                          className="absolute inset-0 w-full h-full object-cover"
                          src="/assets/featured-project-details/new-files/Amrit Construction Video.mp4"
                          autoPlay
                          controls
                        />
                      ) : (
                        <>
                          <img
                            src="/assets/featured-project-details/projects-image/slider-05.jpg"
                            alt="Walkthrough Preview"
                            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                          />
                          <button
                            onClick={() => setShowVideo(true)}
                            className="absolute inset-0 m-auto w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-brand-charcoal hover:bg-brand-champagne hover:scale-110 transition-all duration-300 shadow-md z-10"
                          >
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Construction Updates */}
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-6">
                        <Camera size={24} />
                      </div>
                      <h4 className="text-xl font-heading text-brand-charcoal mb-3">Construction Updates</h4>
                      <p className="text-gray-500 font-light text-sm leading-relaxed mb-4">
                        Follow the physical realization of our designs with real-time site progression captures.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {[
                        '/assets/featured-project-details/new-files/Amrit construction.jpeg',
                        '/assets/featured-project-details/new-files/Amrit Construction 2.jpeg',
                        '/assets/featured-project-details/new-files/Amrit Construction 3.jpeg',
                        '/assets/featured-project-details/new-files/Amrit Construction 4.jpeg'
                      ].map((img, i) => (
                        <div key={i} className="relative aspect-video overflow-hidden rounded cursor-pointer group bg-gray-100" onClick={() => setLightboxImage(img)}>
                          <img
                            src={img}
                            alt={`Update ${i+1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-1">
                      <Calendar size={12} /> Last updated: July 2026
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-24 animate-fade-in-up">
                {/* Commercial Sector */}
                <div className="space-y-12">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-[1.5px] bg-brand-champagne"></div>
                    <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-brand-champagne">Commercial Landmarks</span>
                  </div>

                  <div className="space-y-12">
                    {commercialProjects.map((project, idx) => {
                      const isEven = idx % 2 === 0;
                      return (
                        <div key={idx} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100/50 hover:shadow-2xl transition-shadow duration-500">
                          <div className="grid lg:grid-cols-12 gap-0">
                            {/* Image Column */}
                            <div className={`lg:col-span-5 relative h-[300px] lg:h-auto min-h-[350px] overflow-hidden group ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}>
                              <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                              <div className="absolute top-6 left-6 bg-brand-charcoal text-brand-champagne text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full z-10">
                                Commercial Landmark
                              </div>
                            </div>

                            {/* Text Column */}
                            <div className={`lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}>
                              <div>
                                <div className="flex items-center gap-2 text-brand-champagne mb-4">
                                  <MapPin size={16} strokeWidth={1.5} />
                                  <span className="text-xs uppercase tracking-widest font-semibold text-gray-500">{project.location}</span>
                                </div>
                                
                                <h3 className="text-3xl font-heading text-brand-charcoal mb-4">{project.title}</h3>
                                
                                <p className="text-gray-500 font-light text-base leading-relaxed mb-8">
                                  {project.description}
                                </p>

                                <div className="flex flex-wrap gap-3 mb-8">
                                  {project.tags.map((tag, idx) => (
                                    <span key={idx} className="px-3.5 py-1.5 bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider rounded-full border border-gray-100">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-gray-100">
                                <div className="text-left w-full sm:w-auto">
                                  <span className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">Investment</span>
                                  <span className="text-2xl font-heading text-brand-charcoal">{project.price}</span>
                                </div>
                                <button
                                  onClick={() => setEnquiryProject({ title: project.title, location: project.location, category: "Commercial" })}
                                  className="w-full sm:w-auto px-8 py-4 bg-brand-charcoal text-brand-champagne font-bold text-xs uppercase tracking-widest hover:bg-brand-champagne hover:text-brand-charcoal transition-colors duration-300"
                                >
                                  View Project & Enquire
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Residential Sector */}
                <div className="space-y-12">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-[1.5px] bg-brand-champagne"></div>
                    <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-brand-champagne">Residential Havens</span>
                  </div>

                  <div className="space-y-12">
                    {residentialProjects.map((project, idx) => {
                      const isEven = idx % 2 === 0;
                      return (
                        <div key={idx} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100/50 hover:shadow-2xl transition-shadow duration-500">
                          <div className="grid lg:grid-cols-12 gap-0">
                            {/* Image Column */}
                            <div className={`lg:col-span-5 relative h-[300px] lg:h-auto min-h-[350px] overflow-hidden group ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}>
                              <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                              <div className="absolute top-6 left-6 bg-brand-charcoal text-brand-champagne text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full z-10">
                                Residential Haven
                              </div>
                            </div>

                            {/* Text Column */}
                            <div className={`lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}>
                              <div>
                                <div className="flex items-center gap-2 text-brand-champagne mb-4">
                                  <MapPin size={16} strokeWidth={1.5} />
                                  <span className="text-xs uppercase tracking-widest font-semibold text-gray-500">{project.location}</span>
                                </div>
                                
                                <h3 className="text-3xl font-heading text-brand-charcoal mb-4">{project.title}</h3>
                                
                                <p className="text-gray-500 font-light text-base leading-relaxed mb-8">
                                  {project.description}
                                </p>

                                <div className="flex flex-wrap gap-3 mb-8">
                                  {project.tags.map((tag, idx) => (
                                    <span key={idx} className="px-3.5 py-1.5 bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider rounded-full border border-gray-100">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-gray-100">
                                <div className="text-left w-full sm:w-auto">
                                  <span className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">Pricing</span>
                                  <span className="text-2xl font-heading text-brand-charcoal">{project.price}</span>
                                </div>
                                <button
                                  onClick={() => setEnquiryProject({ title: project.title, location: project.location, category: "Residential" })}
                                  className="w-full sm:w-auto px-8 py-4 bg-brand-charcoal text-brand-champagne font-bold text-xs uppercase tracking-widest hover:bg-brand-champagne hover:text-brand-charcoal transition-colors duration-300"
                                >
                                  View Project & Enquire
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

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
      </section>

      {/* Services Overview Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 border border-brand-charcoal rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] border border-brand-charcoal rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[1.5px] bg-brand-champagne"></div>
                <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-brand-champagne">Excellence in Strategy</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-heading font-light text-brand-charcoal mb-8 tracking-tight leading-[1.1]">
                Bespoke <span className="italic font-medium text-brand-champagne/80">Solutions</span>
              </h2>
              <p className="text-xl text-slate-500 font-light max-w-xl leading-relaxed">
                Unlock the potential of your projects with our dedicated strategies and institutional-grade management.
              </p>
            </div>
            <div className="hidden md:block pb-2">
              <NavLink to="/services" className="px-8 py-4 border border-slate-200 text-xs font-bold uppercase tracking-[0.3em] text-brand-charcoal hover:bg-brand-charcoal hover:text-white hover:border-brand-charcoal transition-all duration-700 group flex items-center gap-4">
                All Services <MoveRight size={18} className="text-brand-champagne group-hover:translate-x-2 transition-transform duration-500" />
              </NavLink>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Service Card 1 */}
            <div className="group relative bg-brand-charcoal p-14 lg:p-20 shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-center">
              {/* Subtle background texture/pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full -mr-20 -mt-20"></div>

              <div className="absolute top-12 right-12">
                <span className="text-8xl font-heading font-thin text-white/5 tracking-tighter">01</span>
              </div>

              <div className="w-12 h-[2px] bg-brand-champagne mb-12"></div>

              <h3 className="text-4xl font-heading font-normal text-white mb-8 leading-tight">
                Investment <br />Management
              </h3>

              <p className="text-slate-400 mb-14 leading-relaxed font-light text-lg max-w-sm">
                Maximize the value of your portfolio. We provide end-to-end investment strategy services designed for high-yield returns and sustainable growth.
              </p>

              <NavLink to="/services" className="inline-flex items-center text-[10px] uppercase tracking-[0.4em] font-bold text-brand-champagne border-b border-brand-champagne/30 pb-3 hover:border-brand-champagne transition-all duration-500 self-start">
                Discover Strategy
              </NavLink>
            </div>

            {/* Service Card 2 */}
            <div className="group relative bg-brand-light-grey p-14 lg:p-20 shadow-xl overflow-hidden min-h-[500px] flex flex-col justify-center hover:bg-white transition-colors duration-700">
              <div className="absolute top-12 right-12">
                <span className="text-8xl font-heading font-thin text-brand-charcoal/5 tracking-tighter">02</span>
              </div>

              <div className="w-12 h-[2px] bg-brand-champagne mb-12"></div>

              <h3 className="text-4xl font-heading font-normal text-brand-charcoal mb-8 leading-tight">
                Property <br />Strategy
              </h3>

              <p className="text-slate-500 mb-14 leading-relaxed font-light text-lg max-w-sm">
                Ensure your investment is secure and future-ready. Our expert management services optimize asset performance and streamline operations.
              </p>

              <NavLink to="/services" className="inline-flex items-center text-[10px] uppercase tracking-[0.4em] font-bold text-brand-charcoal border-b border-brand-champagne/30 pb-3 hover:text-brand-champagne hover:border-brand-champagne transition-all duration-500 self-start">
                Explore Advisory
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Journal Preview */}
      <section className="py-32 bg-brand-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-light text-brand-charcoal mb-6 tracking-tight">
              The Journal
            </h2>
            <p className="text-gray-500 font-light max-w-lg mx-auto">
              Stay informed with elite market intelligence and company updates.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 lg:gap-14 mb-16">
            {blogs.slice(0, 3).map((blog) => (
              <Card
                key={blog.slug}
                imageSrc={blog.image}
                title={blog.title}
                description={blog.snippet}
                author={blog.author}
                linkTo={`/blog/${blog.slug}`}
              />
            ))}
          </div>

          <div className="text-center">
            <Button to="/blog" variant="outline">
              Read More Entries
            </Button>
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
