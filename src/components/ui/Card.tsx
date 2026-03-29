import { NavLink } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CardProps {
  imageSrc: string;
  title: string;
  description: string;
  linkTo?: string;
  date?: string;
  author?: string;
  className?: string;
}

export function Card({ imageSrc, title, description, linkTo, date, author, className = "" }: CardProps) {
  const content = (
    <div className={`group flex flex-col h-full bg-white subtle-border hover-lift rounded-sm overflow-hidden ${className}`}>
      
      <div className="relative h-72 overflow-hidden bg-brand-beige">
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-in-out"
          loading="lazy"
        />
        <div className="image-overlay"></div>
      </div>

      <div className="p-8 flex flex-col flex-grow bg-white z-10">
        {(date || author) && (
          <div className="flex items-center text-xs font-semibold text-brand-champagne mb-4 uppercase tracking-[0.2em] gap-3">
            {date && <span>{date}</span>}
            {date && author && <span className="w-1 h-1 rounded-full bg-gray-200"></span>}
            {author && <span>{author}</span>}
          </div>
        )}
        
        <h3 className="text-2xl font-heading font-normal text-brand-charcoal mb-4 group-hover:text-brand-champagne transition-colors duration-500 line-clamp-2 leading-snug">
          {title}
        </h3>
        
        <p className="text-gray-500 mb-8 flex-grow leading-relaxed line-clamp-3 font-light text-sm">
          {description}
        </p>
        
        {linkTo && (
          <div className="mt-auto group/btn inline-flex items-center text-brand-charcoal uppercase tracking-widest text-xs font-semibold transition-colors hover:text-brand-champagne">
            Read Story 
            <ArrowRight size={14} className="ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
          </div>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return <NavLink to={linkTo} className="block h-full group-wrapper">{content}</NavLink>;
  }

  return content;
}
