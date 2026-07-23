import React from 'react';

function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap';

  const variants = {
    primary: 'bg-accent text-primary hover:bg-accent-dark hover:shadow-[0_6px_20px_rgba(240,185,11,0.3)]',
    secondary: 'bg-transparent text-text-on-dark border border-border-dark hover:border-accent hover:bg-accent/10',
    ghost: 'bg-transparent text-text-secondary border border-border hover:border-accent hover:bg-accent-light hover:text-text-primary',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
