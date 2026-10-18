import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  Download,
  Hash,
  Calendar,
  CreditCard,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  Printer
} from 'lucide-react';
import './TransactionDetailsModal.css';

export default function TransactionDetailsModal({ transaction, onClose }) {
  const navigate = useNavigate();

  if (!transaction) return null;

  return (
    <div className="txn-modal-overlay" onClick={onClose}>
      <div className="txn-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="txn-modal-header">
          <div className="txn-modal-title-group">
            <h2 className="txn-modal-title">TRANSACTION DETAILS</h2>
            <p className="txn-modal-subtitle">
              Detailed breakdown of the placement fee for <strong>{transaction.jobTitle}</strong>
            </p>
          </div>
          <div className="txn-modal-header-actions">
            <button 
              className="txn-modal-btn outline"
              onClick={() => navigate('/admin/job-moderation', { state: { searchJobTitle: transaction.jobTitle } })}
            >
              <ExternalLink size={14} /> View Job Post
            </button>
            <button className="txn-modal-btn primary">
              <Download size={14} /> Download Invoice
            </button>
            <button className="txn-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="txn-modal-body">
          {/* Left Column */}
          <div className="txn-modal-left">
            
            {/* General Information */}
            <div className="txn-info-card">
              <div className="txn-info-header">
                <h3>General Information</h3>
                <span className={`txn-status-badge ${transaction.status}`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </div>
              <div className="txn-info-grid">
                <div className="txn-info-item">
                  <div className="txn-info-icon"><Hash size={16} /></div>
                  <div className="txn-info-text">
                    <span className="label">TRANSACTION ID</span>
                    <span className="value">{transaction.id}</span>
                  </div>
                </div>
                <div className="txn-info-item">
                  <div className="txn-info-icon"><Calendar size={16} /></div>
                  <div className="txn-info-text">
                    <span className="label">PROCESSED DATE</span>
                    <span className="value">{transaction.date}</span>
                  </div>
                </div>
                <div className="txn-info-item">
                  <div className="txn-info-icon"><CreditCard size={16} /></div>
                  <div className="txn-info-text">
                    <span className="label">PAYMENT METHOD</span>
                    <span className="value">{transaction.method || 'Bank Transfer'}</span>
                  </div>
                </div>
                <div className="txn-info-item">
                  <div className="txn-info-icon"><Briefcase size={16} /></div>
                  <div className="txn-info-text">
                    <span className="label">JOB PLACEMENT</span>
                    <span className="value">{transaction.jobTitle}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="txn-fee-card">
              <div className="txn-fee-header">
                <FileText size={16} /> FEE BREAKDOWN
              </div>
              <div className="txn-fee-row">
                <span>BASE PLACEMENT FEE</span>
                <span>{transaction.currency || 'LKR'} {(transaction.amount * 0.9).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="txn-fee-row">
                <span>PLATFORM SERVICE TAX (10%)</span>
                <span>{transaction.currency || 'LKR'} {(transaction.amount * 0.1).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="txn-fee-divider"></div>
              <div className="txn-fee-total">
                <span>TOTAL AMOUNT PAID</span>
                <span className="total-val">{transaction.currency || 'LKR'} {transaction.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            {/* Compliance */}
            <div className="txn-compliance-card">
              <div className="txn-compliance-header">
                <ShieldCheck size={16} /> COMPLIANCE & VERIFICATION
              </div>
              <ul className="txn-compliance-list">
                {transaction.status === 'successful' ? (
                  <>
                    <li><CheckCircle size={14} className="success-icon" /> Bank transfer slip verified by admin</li>
                    <li><CheckCircle size={14} className="success-icon" /> Anti-Money Laundering (AML) check passed</li>
                  </>
                ) : transaction.status === 'failed' ? (
                  <>
                    <li><XCircle size={14} className="warning-icon" /> Payment slip rejected during review</li>
                    <li><AlertCircle size={14} className="warning-icon" /> {transaction.rejectionReason || 'No reason recorded'}</li>
                  </>
                ) : (
                  <>
                    <li><Clock size={14} className="warning-icon" /> Awaiting admin verification of the payment slip</li>
                    <li><Clock size={14} className="warning-icon" /> Vacancy remains unpublished until approved</li>
                  </>
                )}
              </ul>
            </div>

          </div>

          {/* Right Column */}
          <div className="txn-modal-right">
            
            {/* Visual Box */}
            <div className="txn-visual-box">
              <div className="txn-visual-inner">
                <div className="txn-visual-circle">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="7" x2="17" y2="17"></line>
                    <polyline points="17 7 17 17 7 17"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="txn-confirm-box">
              <div className="txn-confirm-icon">
                {transaction.status === 'successful' ? (
                  <CheckCircle size={20} />
                ) : transaction.status === 'failed' ? (
                  <XCircle size={20} />
                ) : (
                  <Clock size={20} />
                )}
              </div>
              <h3>
                {transaction.status === 'successful'
                  ? 'Payment Confirmed'
                  : transaction.status === 'failed'
                  ? 'Payment Rejected'
                  : 'Awaiting Verification'}
              </h3>
              <p>
                {transaction.status === 'successful'
                  ? "This bank transfer has been verified and recorded in the permanent ledger. The recruiter's vacancy has been published."
                  : transaction.status === 'failed'
                  ? `This payment slip was rejected.${transaction.rejectionReason ? ` Reason: ${transaction.rejectionReason}` : ''}`
                  : "This bank-transfer slip is pending admin verification. The recruiter's vacancy remains unpublished until it is approved."}
              </p>
              <button className="txn-print-btn">
                PRINT RECEIPT (PHYSICAL COPY)
              </button>
              <div className="txn-secure-text">
                <ShieldCheck size={12} /> SECURE 256-BIT ENCRYPTION ACTIVE
              </div>
            </div>

            {/* Recruiter Assigned */}
            <div className="txn-recruiter-box">
              <div className="txn-recruiter-info">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((transaction.recruiterName || 'NA').slice(0, 2))}`} alt="" className="txn-recruiter-avatar" />
                <div>
                  <span className="label">RECRUITER</span>
                  <span className="name">{transaction.recruiterName || '—'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
