import React from 'react';

function Card({ children, hover = true, className = '', ...props }) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-5 transition-all duration-200 ${
        hover ? 'hover:border-accent hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
