import React from 'react';
import { X, Shield, FileText, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import './ComplianceGuideModal.css';

export default function ComplianceGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="compliance-modal-overlay" onClick={onClose}>
      <div className="compliance-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="compliance-modal-header">
          <div className="compliance-modal-header-left">
            <div className="compliance-icon-wrapper">
              <ShieldCheck size={24} className="compliance-icon" />
            </div>
            <div>
              <h2 className="compliance-modal-title">Financial Compliance Guide</h2>
              <p className="compliance-modal-subtitle">Internal policies and procedures for platform administration</p>
            </div>
          </div>
          <button className="compliance-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="compliance-modal-body">
          <div className="compliance-sidebar">
            <nav className="compliance-nav">
              <a href="#refunds" className="compliance-nav-item active">Refund Policy</a>
              <a href="#aml" className="compliance-nav-item">AML Procedures</a>
              <a href="#auth" className="compliance-nav-item">Authorization Limits</a>
              <a href="#ledger" className="compliance-nav-item">Ledger & Audits</a>
            </nav>
          </div>

          <div className="compliance-content">
            <section id="refunds" className="compliance-section">
              <div className="section-header">
                <FileText size={18} />
                <h3>Refund Policy Enforcement</h3>
              </div>
              <p>
                All refund requests are strictly regulated to prevent fraudulent activities.
                Refunds are not automated and must undergo a mandatory review process before being processed.
              </p>
              <ul className="compliance-list">
                <li><CheckCircle size={14} className="check-icon" /> Verify the original transaction details against the recruiter's dispute claim.</li>
                <li><CheckCircle size={14} className="check-icon" /> Ensure the request was made within the 30-day compliance window.</li>
                <li><CheckCircle size={14} className="check-icon" /> Once approved, funds are credited back exclusively to the original payment source.</li>
              </ul>
            </section>

            <section id="auth" className="compliance-section">
              <div className="section-header">
                <Shield size={18} />
                <h3>Authorization Limits</h3>
              </div>
              <div className="auth-limit-card">
                <div className="auth-limit-amount">Over $5,000.00</div>
                <div className="auth-limit-desc">
                  Any financial action exceeding this threshold requires mandatory dual-factor authorization.
                  Approval must be signed off by a <strong>Senior Financial Officer</strong>.
                </div>
              </div>
            </section>

            <section id="aml" className="compliance-section">
              <div className="section-header">
                <AlertTriangle size={18} className="warn-icon" />
                <h3>AML Procedures</h3>
              </div>
              <p>
                Anti-Money Laundering (AML) checks are automatically run against all placements and payouts. 
                If a transaction is flagged:
              </p>
              <div className="compliance-warn-box">
                The transaction is frozen immediately. The assigned recruiter must provide supplementary documentation (KYC) before the freeze is lifted.
              </div>
            </section>

            <section id="ledger" className="compliance-section">
              <div className="section-header">
                <FileText size={18} />
                <h3>Ledger & Audits</h3>
              </div>
              <p>
                All processed transactions and refunds are recorded in the permanent, immutable ledger. 
                Regular system audits occur every quarter. The next audit cycle is scheduled for <strong>January 2024</strong>.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="compliance-modal-footer">
          <button className="compliance-btn-primary" onClick={onClose}>Acknowledge & Close</button>
        </div>
      </div>
    </div>
  );
}
