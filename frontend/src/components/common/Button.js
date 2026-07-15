import React from 'react';
import '../../App.css';

/**
 * Custom application button with micro-interactions.
 */
function Button({ children, type = 'button', variant = 'primary', ...props }) {
  const className = variant === 'primary' ? 'primary-button' : 'social-button';
  return (
    <button className={className} type={type} {...props}>
      {children}
    </button>
  );
}

export default Button;
