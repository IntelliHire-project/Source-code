import React from 'react';

function Badge({ variant = 'hero', children, className = '' }) {
  const variants = {
    hero: 'bg-accent/15 text-accent-dark',
    salary: 'bg-accent-light text-accent-dark',
    skill: 'bg-transparent border border-border text-text-secondary',
    dark: 'bg-primary-light text-text-on-dark',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
