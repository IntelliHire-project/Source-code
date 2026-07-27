import React from 'react';

function PillToggleGroup({ options = [], value, onChange, name }) {
  return (
    <div className="pill-toggle-group" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`pill-toggle ${isActive ? 'pill-toggle--active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default PillToggleGroup;
