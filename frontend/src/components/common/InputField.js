import React from 'react';
import '../../App.css';

/**
 * Reusable input field component with premium styling.
 */
function InputField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  helperText,
  autoComplete,
  icon,
  required = false,
  ...props
}) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <div className="field-inputWrap">
        {icon && <span className="field-icon">{icon}</span>}
        <input
          className="field-input"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          style={{ paddingLeft: icon ? '30px' : '10px' }}
          {...props}
        />
      </div>
      {helperText && <p className="field-helper">{helperText}</p>}
    </div>
  );
}

export default InputField;
