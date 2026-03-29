import { Button } from "../components/ui/Button";

export function Services() {
  return (
    <div className="pt-32 pb-24 bg-brand-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="py-20 border-b border-gray-100 mb-20 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-champagne mb-6 block">Expertise</span>
            <h1 className="text-5xl md:text-7xl font-heading font-light text-brand-charcoal tracking-tight">
              Our Services
            </h1>
          </div>
          <p className="text-lg text-gray-500 font-light leading-relaxed max-w-md">
            Discover unparalleled real estate services that redefine global standards. Explore bespoke solutions unlocking the sheer potential of your assets.
          </p>
        </div>

        <div className="space-y-40">
          {/* Service 1 */}
          <div className="flex flex-col lg:flex-row items-stretch gap-16 group">
            <div className="w-full lg:w-1/2 overflow-hidden bg-brand-beige">
              <img 
                src="/commercial_building_investment_1774769793820.png" 
                alt="Real Estate Investment Management" 
                className="w-full h-[500px] object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-1000 transform hover:scale-105"
              />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-10">
              <span className="text-brand-champagne text-sm font-semibold tracking-widest mb-6 block">01</span>
              <h2 className="text-4xl font-heading font-normal text-brand-charcoal mb-8 leading-tight">
                Real Estate Investment Management
              </h2>
              <p className="text-gray-500 mb-12 leading-loose font-light text-lg">
                HP Global Infra offers extensive advisory and management for real estate investments. We guide high net worth individuals and organizations toward investments that secure steady cash flows and high appreciation value. Whether you are expanding a portfolio or entering new markets, we bring deep insights to ensure success.
              </p>
              <div>
                <Button to="/contact" variant="outline" size="lg">
                  Schedule a Consultation
                </Button>
              </div>
            </div>
          </div>

          {/* Service 2 */}
          <div className="flex flex-col lg:flex-row-reverse items-stretch gap-16 group">
            <div className="w-full lg:w-1/2 overflow-hidden bg-brand-beige">
              <img 
                src="/residential_excellence_plot_1774769812737.png" 
                alt="Property Management Strategy" 
                className="w-full h-[500px] object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-1000 transform hover:scale-105"
              />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-10">
              <span className="text-brand-champagne text-sm font-semibold tracking-widest mb-6 block">02</span>
              <h2 className="text-4xl font-heading font-normal text-brand-charcoal mb-8 leading-tight">
                Property Management Strategy
              </h2>
              <p className="text-gray-500 mb-12 leading-loose font-light text-lg">
                Ensure your investment is secure and future-ready. From ongoing maintenance, tenant relations, to strategic optimization of property yield, our property management strategy takes the hassle out of owning real estate. We manage commercial and residential spaces with excellence.
              </p>
              <div>
                <Button to="/contact" variant="outline" size="lg">
                  Optimize Your Assets
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
