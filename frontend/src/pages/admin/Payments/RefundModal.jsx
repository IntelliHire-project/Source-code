import React from 'react';
import { AlertCircle, X, Info } from 'lucide-react';
import './RefundModal.css';

export default function RefundModal({ refund, onClose }) {
  if (!refund) return null;

  return (
    <div className="refund-modal-overlay" onClick={onClose}>
      <div className="refund-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="refund-modal-header">
          <div className="refund-modal-header-left">
            <AlertCircle size={16} className="warning-icon" />
            <span>FINANCIAL ACTION REQUIRED</span>
          </div>
          <button className="refund-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="refund-modal-body">
          {/* Left Panel */}
          <div className="refund-modal-left">
            <div className="refund-image-box">
              {/* Using a placeholder circle since we don't have the 3D hand image */}
              <div className="refund-image-placeholder">
                <span style={{fontSize:'3rem'}}>🪙</span>
              </div>
            </div>
            <div className="refund-ref-section">
              <span className="refund-ref-label">TRANSACTION REF</span>
              <div className="refund-ref-box">{refund.id || 'TRX-99281-XC'}</div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="refund-modal-right">
            <h2 className="refund-modal-title">PROCESS REFUND</h2>
            <p className="refund-modal-desc">
              Refund <strong>LKR {refund.amount ? refund.amount.toLocaleString('en-US', {minimumFractionDigits: 2}) : '45,000.00'}</strong> to 
              <em> {refund.company || 'Nexus Global Talent'}</em> for Transaction <u>{refund.id || 'TRX-99281-XC'}</u>?
            </p>

            <div className="refund-reason-group">
              <label>REASON FOR REFUND</label>
              <select className="refund-reason-select">
                <option value="">Select a reason...</option>
                <option value="duplicate">Duplicate Charge</option>
                <option value="fraud">Fraudulent Activity</option>
                <option value="user_requested">User Requested</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="refund-info-box">
              <Info size={16} className="info-icon" />
              <p>THE AMOUNT WILL BE CREDITED BACK TO THE ORIGINAL PAYMENT SOURCE WITHIN 5-7 BUSINESS DAYS.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="refund-modal-footer">
          <button className="refund-btn-cancel" onClick={onClose}>CANCEL</button>
          <button className="refund-btn-confirm">
            CONFIRM REFUND &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
