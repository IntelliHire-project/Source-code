import React from 'react';

function ProgressBar({ label, value = 0, showLabel = true }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="progress-bar">
      {showLabel && (
        <div className="progress-bar__header">
          <span className="progress-bar__label">{label}</span>
          <span className="progress-bar__value">{clamped}%</span>
        </div>
      )}
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
