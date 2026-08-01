import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, X, Info } from 'lucide-react';
import './RefundModal.css';

const REFUND_REASONS = [
  { value: 'duplicate', label: 'Duplicate Charge' },
  { value: 'fraud', label: 'Fraudulent Activity' },
  { value: 'user_requested', label: 'User Requested' },
  { value: 'service_issue', label: 'Service Issue' },
  { value: 'other', label: 'Other' },
];

export default function RefundModal({ refund, onClose }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const reasonMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (reasonMenuRef.current && !reasonMenuRef.current.contains(event.target)) {
        setIsReasonOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (refund) {
      setSelectedReason('');
      setIsReasonOpen(false);
    }
  }, [refund]);

  if (!refund) return null;

  const selectedReasonLabel =
    REFUND_REASONS.find((reason) => reason.value === selectedReason)?.label || 'Select a reason...';

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

            <div className="refund-reason-group" ref={reasonMenuRef}>
              <label>REASON FOR REFUND</label>
              <button
                type="button"
                className="refund-reason-select"
                onClick={() => setIsReasonOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isReasonOpen}
              >
                <span className={`refund-reason-value ${selectedReason ? 'has-value' : ''}`}>
                  {selectedReasonLabel}
                </span>
                <span className={`refund-reason-caret ${isReasonOpen ? 'open' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              {isReasonOpen && (
                <div className="refund-reason-menu" role="listbox" aria-label="Refund reason options">
                  {REFUND_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      className={`refund-reason-option ${selectedReason === reason.value ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedReason(reason.value);
                        setIsReasonOpen(false);
                      }}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              )}
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
