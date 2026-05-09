import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-xl";
  
  const variants = {
    primary: "bg-primary text-textPrimary hover:bg-opacity-90",
    secondary: "bg-card text-textPrimary border border-borderDark hover:bg-opacity-80",
    danger: "bg-danger text-textPrimary hover:bg-opacity-90",
    ghost: "bg-transparent hover:bg-card text-textPrimary",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg w-full",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner className="w-5 h-5 mr-2" /> : null}
      {children}
    </button>
  );
});

export const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="flex flex-col w-full space-y-1">
      {label && <label className="text-sm font-medium text-textMuted">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-xl border border-borderDark bg-[#12121A] px-4 py-2 text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-primary transition-colors",
          error && "border-danger focus:border-danger",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});

export const Card = ({ className, children, ...props }) => (
  <div className={cn("rounded-2xl border border-borderDark bg-card p-4", className)} {...props}>
    {children}
  </div>
);

export const Spinner = ({ className }) => (
  <svg className={cn("animate-spin text-primary", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const Select = React.forwardRef(({ className, label, options = [], ...props }, ref) => {
  return (
    <div className="flex flex-col w-full space-y-1">
      {label && <label className="text-sm font-medium text-textMuted">{label}</label>}
      <select
        ref={ref}
        className={cn(
          "h-12 w-full rounded-xl border border-borderDark bg-[#12121A] px-4 py-2 text-textPrimary focus:outline-none focus:border-primary transition-colors appearance-none",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
});
