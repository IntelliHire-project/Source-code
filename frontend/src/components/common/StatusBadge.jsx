import React from 'react';
import { statusToken } from '../../utils/statusColors';
import './StatusBadge.css';

/**
 * StatusBadge — shared status/decision pill.
 *
 * Color comes exclusively from the shared status → token map
 * (utils/statusColors.js) which points at existing CSS variables
 * in tokens.css. The text label always accompanies the color so
 * color is never the only signal.
 *
 * @param {string} status - key into STATUS_COLORS (e.g. "published", "rejected")
 * @param {string} label  - optional override; defaults to the status key
 * @param {string} [className] - extra classes
 */
function StatusBadge({ status, label, className = '' }) {
  return (
    <span
      className={`status-badge ${className}`}
      style={{ ['--status-color']: `var(${statusToken(status)})` }}
    >
      {label ?? status}
    </span>
  );
}

export default StatusBadge;
