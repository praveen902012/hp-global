import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { MoveRight } from "lucide-react";
import { blogs } from "../data/blogData";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { portfolioProjects } from "../data/portfolioData";
import { ProjectEnquiryModal } from "../components/ProjectEnquiryModal";

export function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [enquiryProject, setEnquiryProject] = useState<any | null>(null);

  const categories = ['All', 'High-End', 'Residential', 'Commercial', 'Strategic Plots'];
  const filteredProjects = activeCategory === 'All'
    ? portfolioProjects
    : portfolioProjects.filter(p => p.category === activeCategory);
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
                src="https://www.youtube.com/embed/DKi84RHGDog?autoplay=1&mute=1"
                title="hp global amrit arogyam"
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
              Ongoing <span className="italic font-medium text-brand-champagne/80">Projects</span>
            </h2>
            <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
              Explore our extensive range of premium offerings designed to elevate living standards and business environments.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-bold uppercase tracking-[0.2em] pb-2 border-b-2 transition-all duration-300 ${activeCategory === cat
                    ? 'border-brand-charcoal text-brand-charcoal'
                    : 'border-transparent text-gray-400 hover:text-brand-charcoal hover:border-gray-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProjects.map((project, idx) => (
              <div key={idx} className="group bg-white shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-500">
                <div className="relative h-64 overflow-hidden bg-zinc-50 flex items-center justify-center">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                  />
                  <div className="absolute top-4 left-4 bg-brand-charcoal text-brand-champagne text-[10px] font-bold uppercase tracking-wider px-3 py-1 z-10">
                    {project.category}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-heading text-brand-charcoal mb-2">{project.title}</h3>
                  <p className="text-brand-champagne text-xs font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-4">
                    {project.location}
                  </p>
                  <p className="text-gray-500 font-light text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  {project.details && project.details.length > 0 && (
                    <ul className="text-gray-500 font-light text-sm mb-6 flex-grow space-y-2 list-none pl-0">
                      {project.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-brand-champagne mt-1 text-[10px]">♦</span>
                          <span className="leading-snug">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <span className="text-brand-charcoal font-medium">{project.price}</span>
                    <button
                      onClick={() => setEnquiryProject(project)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-charcoal text-brand-champagne text-[10px] font-bold uppercase tracking-wider hover:bg-brand-champagne hover:text-brand-charcoal transition-colors duration-300"
                    >
                      Enquire <MoveRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
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
