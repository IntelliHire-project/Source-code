import React from 'react';
import { Zap } from 'lucide-react';

function InsightPanel({ eyebrow = 'INTELLI-AUDIT', children, className = '' }) {
  return (
    <div className={`insight-panel ${className}`}>
      <span className="insight-panel__eyebrow">
        <Zap size={12} />
        {eyebrow}
      </span>
      <div className="insight-panel__body">{children}</div>
    </div>
  );
}

export default InsightPanel;
