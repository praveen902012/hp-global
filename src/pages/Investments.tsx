import { Card } from "../components/ui/Card";

export function Investments() {
  const options = [
    {
      title: "High-End Projects",
      description: "Engage with our signature high-end projects that set new benchmarks in luxury and impact. From concept to completion, we pave the way for extraordinary real estate ventures.",
      imageSrc: "/hero_banner_real_estate_1774769760013.png",
    },
    {
      title: "Premium Strategic Plots with Property Management",
      description: "Explore our strategic plots, designed with a focus on long-term growth and sustainability. With our expert property management services, you can ensure your investment is both secure and future-ready.",
      imageSrc: "/residential_excellence_plot_1774769812737.png",
    },
    {
      title: "Residential Excellence",
      description: "Enter the world of residential perfection with our expertly crafted spaces that blend comfort, aesthetics, and functionality seamlessly. Dive into a realm of unmatched living experiences.",
      imageSrc: "/hero_banner_real_estate_1774769760013.png",
    },
    {
      title: "Commercial Brilliance",
      description: "Explore our commercial developments that cater to dynamic business needs, offering cutting-edge spaces designed for productivity, growth, and success. Redefine your business environment with us.",
      imageSrc: "/commercial_building_investment_1774769793820.png",
    }
  ];

  return (
    <div className="pt-40 pb-32 bg-brand-light-grey min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-24 flex flex-col items-center text-center animate-fade-in-up">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-champagne mb-6 block">Opportunities</span>
          <div className="w-12 h-[1px] bg-brand-charcoal mb-10"></div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-light text-brand-charcoal mb-8 tracking-tight">
            Strategic High-Yield <br/>
            Real Estate Ventures
          </h1>
          <p className="text-xl text-gray-500 font-light leading-relaxed max-w-2xl">
            Discover opportunities precisely designed for visionary investors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
          {options.map((opt, i) => (
             <Card 
               key={i}
               title={opt.title}
               description={opt.description}
               imageSrc={opt.imageSrc}
             />
          ))}
        </div>

      </div>
    </div>
  );
}
