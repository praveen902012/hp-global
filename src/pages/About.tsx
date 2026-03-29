export function About() {
  return (
    <div className="pt-40 pb-32 bg-brand-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          
          <div className="lg:w-1/2">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-champagne mb-8 block">Our Origin</span>
            <div className="w-12 h-[1px] bg-brand-charcoal mb-10"></div>
            
            <h1 className="text-4xl lg:text-5xl lg:leading-snug font-heading font-light text-brand-charcoal mb-12 tracking-tight">
              A Commitment to<br/>
              <span className="font-normal italic text-brand-champagne">Excellence</span>
            </h1>
            
            <div className="space-y-8 text-lg text-gray-500 font-light leading-relaxed max-w-xl">
              <p>
                At HP Global Infra, we are committed to excellence in every facet of real estate. Our services range from investment advisory to property management, focusing on high-end projects that make a difference. 
              </p>
              <p>
                Our specialized approach includes mixed-use developments, smart solutions, and residential excellence, all backed by profound market insights. 
              </p>
              <p className="text-sm font-semibold tracking-widest uppercase text-brand-charcoal pt-6">
                Join us in shaping a new era of real estate advancement.
              </p>
            </div>
            
          </div>

          <div className="lg:w-1/2 relative w-full h-[600px] bg-brand-beige">
            <div className="absolute inset-4 overflow-hidden border border-brand-champagne/30">
              <img 
                src="/hero_banner_real_estate_1774769760013.png" 
                alt="HP Global Infra Building" 
                className="object-cover h-full w-full grayscale-[15%] hover:grayscale-0 transition-all duration-1000 transform hover:scale-105"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
