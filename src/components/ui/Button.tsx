import { forwardRef, type ButtonHTMLAttributes } from "react";
import { NavLink } from "react-router-dom";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', to, children, ...props }, ref) => {
    
    // Minimalist sharp corners, premium interactions
    const baseStyles = "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-500 focus:outline-none focus:ring-1 focus:ring-brand-champagne focus:ring-offset-1 rounded-none shadow-sm shadow-black/5 hover:shadow-md hover:shadow-brand-champagne/20 hover:-translate-y-0.5";
    
    const variants = {
      primary: "bg-brand-charcoal text-white border border-brand-charcoal hover:bg-brand-champagne hover:border-brand-champagne",
      secondary: "bg-brand-beige text-brand-charcoal hover:bg-brand-champagne hover:text-white",
      outline: "bg-transparent text-brand-charcoal border border-slate-300 hover:border-brand-champagne hover:text-brand-champagne",
      ghost: "text-slate-500 hover:text-brand-champagne hover:bg-brand-champagne/5 shadow-none hover:shadow-none hover:translate-y-0",
    };

    const sizes = {
      sm: "px-6 py-2.5 text-xs uppercase tracking-widest",
      md: "px-8 py-3.5 text-sm uppercase tracking-widest",
      lg: "px-10 py-5 text-sm uppercase tracking-widest",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    if (to) {
      return (
        <NavLink to={to} className={classes}>
          {children}
        </NavLink>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
