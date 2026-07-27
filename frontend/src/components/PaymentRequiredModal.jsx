import React, { useEffect, useCallback } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  Sparkles,
  Bot,
  TrendingUp,
} from 'lucide-react';
import './PaymentRequiredModal.css';

const COST_ITEMS = [
  { label: 'Standard Listing Fee', value: 'LKR 2,250.00' },
  { label: 'Service Tax (VAT 11%)', value: 'LKR 250.00' },
];

const TOTAL = 'LKR 2,500.00';

const BENEFITS = [
  {
    icon: Eye,
    label: '30 Days Visibility',
    desc: 'Reach top-tier talent for a full month',
  },
  {
    icon: Bot,
    label: 'AI Matchmaking',
    desc: 'Automated candidate-role fit scoring',
  },
  {
    icon: TrendingUp,
    label: 'Priority Ranking',
    desc: 'Featured placement in search results',
  },
  {
    icon: Sparkles,
    label: 'Intelli-Audit Insights',
    desc: 'Real-time listing performance analytics',
  },
];

function PaymentRequiredModal({ isOpen, onClose, onProceed, onSaveDraft, jobTitle }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="prm-overlay" onClick={onClose}>
      <div
        className="prm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prm-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="prm-header">
          <div className="prm-header__left">
            <div className="prm-header__icon">
              <CreditCard size={18} />
            </div>
            <span className="prm-badge">
              <ShieldCheck size={12} />
              ACTION REQUIRED
            </span>
          </div>
          <button
            type="button"
            className="prm-close"
            onClick={onClose}
            aria-label="Close payment modal"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="prm-title" id="prm-title">Payment Required</h2>
        <p className="prm-subtitle">
          A one-time processing fee is required to finalize and publish
          the <strong>{jobTitle || 'Senior Frontend Engineer'}</strong> vacancy
          to the public job board.
        </p>

        <div className="prm-divider" />

        {/* ── Cost Breakdown ── */}
        <section className="prm-section">
          <h3 className="prm-section-header">
            <CreditCard size={14} />
            COST BREAKDOWN
          </h3>
          <div className="prm-card">
            {COST_ITEMS.map((item, i) => (
              <div
                key={item.label}
                className={`prm-row ${i === COST_ITEMS.length - 1 ? 'prm-row--last' : ''}`}
              >
                <span className="prm-row-label">{item.label}</span>
                <span className="prm-row-value">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="prm-total-row">
            <div className="prm-total-left">
              <span className="prm-total-label">TOTAL AMOUNT</span>
              <span className="prm-total-value">{TOTAL}</span>
            </div>
            <div className="prm-total-right">
              <Lock size={13} />
              <span className="prm-secure-text">Secure Checkout</span>
            </div>
          </div>
        </section>

        {/* ── Included Benefits ── */}
        <section className="prm-section">
          <h3 className="prm-section-header">
            <Sparkles size={14} />
            INCLUDED BENEFITS
          </h3>
          <div className="prm-benefits-grid">
            {BENEFITS.map((b) => (
              <div key={b.label} className="prm-benefit-chip">
                <div className="prm-benefit-icon">
                  <CheckCircle2 size={14} />
                </div>
                <div className="prm-benefit-text">
                  <span className="prm-benefit-label">{b.label}</span>
                  <span className="prm-benefit-desc">{b.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Security Note ── */}
        <div className="prm-security">
          <Lock size={13} />
          <span>
            Payments are processed securely via SSL encryption. Card details are never stored on our servers.
          </span>
        </div>

        <div className="prm-divider" />

        {/* ── Actions ── */}
        <div className="prm-actions">
          <button
            type="button"
            className="prm-btn prm-btn--primary"
            onClick={onProceed}
          >
            Proceed to Payment
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className="prm-btn prm-btn--outline"
            onClick={onSaveDraft}
          >
            Cancel &amp; Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentRequiredModal;
