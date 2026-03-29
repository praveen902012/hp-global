import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { MoveRight } from "lucide-react";
import { blogs } from "../data/blogData";
import { NavLink } from "react-router-dom";

export function Home() {
  return (
    <div className="bg-brand-white">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[800px] flex items-center pt-20 bg-brand-charcoal overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -m-32 w-[600px] h-[600px] bg-brand-champagne/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="flex flex-col items-start pr-8">
            <div className="mb-10 animate-fade-in-up">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-champagne mb-4 block">Est. 2025</span>
              <div className="w-12 h-[1px] bg-brand-champagne/50 mb-8"></div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-light text-white leading-[1.1] mb-10 tracking-tight">
              Shaping the <br/>
              <span className="font-normal italic text-gradient-gold">Future</span> of <br/>
              Real Estate
            </h1>
            
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
                Investment <br/>Management
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
                Property <br/>Strategy
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
    </div>
  );
}
