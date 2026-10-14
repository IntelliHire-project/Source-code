import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Smartphone,
  ChevronRight,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Shield,
  Info,
  MessageSquare,
  Zap,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './SelectPaymentMethodPage.css';

const PAYMENT_OPTIONS = [
  {
    id: 'card',
    icon: CreditCard,
    title: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, AMEX — instant processing',
  },
  {
    id: 'bank',
    icon: Building2,
    title: 'Bank Transfer',
    desc: 'Direct bank debit — settles within 24 hours',
  },
  {
    id: 'wallet',
    icon: Smartphone,
    title: 'Mobile Wallet',
    desc: 'Pay via Apple Pay, Google Pay, or Samsung Pay',
  },
];

const COST_ROWS = [
  { label: 'Premium Vacancy Listing', value: 'LKR 2,250.00' },
  { label: 'Processing Fee', value: 'LKR 0.00' },
  { label: 'VAT (11%)', value: 'LKR 247.50' },
];

const TOTAL_PAYABLE = 'LKR 2,497.50';

function SelectPaymentMethodPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const navigate = useNavigate();
  const location = useLocation();
  const vacancyTitle =
    location.state?.formState?.jobTitle
    || location.state?.vacancy?.jobTitle
    || 'Job vacancy';

  const continueToPayment = () => {
    if (selectedMethod === 'bank') {
      navigate('/recruiter/bank-transfer', { state: location.state });
      return;
    }
    navigate('/recruiter/complete-purchase', {
      state: { ...location.state, paymentMethod: selectedMethod },
    });
  };

  return (
    <div className="create-vacancy spm-shell">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          breadcrumbItems={[
            { label: 'Recruitment', path: '/recruiter/dashboard' },
            { label: 'Dashboard', path: '/recruiter/dashboard' },
            { label: 'Select Payment Method' },
          ]}
          searchPlaceholder="Search..."
          onSearch={(q) => console.log('Search:', q)}
          onNotificationClick={() => console.log('Notifications clicked')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="spm-content">
          {/* ── Back link ── */}
          <button
            type="button"
            className="spm-back-link"
            onClick={() => navigate('/recruiter/vacancy-preview', { state: location.state?.formState })}
          >
            <ArrowLeft size={16} />
            Return to Vacancy Preview
          </button>

          {/* ── Header ── */}
          <div className="spm-header">
            <div className="spm-header__text">
              <span className="spm-step-badge">
                <Zap size={12} />
                STEP 2 OF 3
              </span>
              <h1 className="spm-title">Select Payment Method</h1>
              <p className="spm-subtitle">
                Choose your preferred payment gateway to complete the vacancy listing.
                All methods are secured with bank-grade encryption.
              </p>
            </div>
          </div>

          <div className="spm-accent-bar" />

          {/* ── Two-column layout ── */}
          <div className="spm-layout">
            {/* ── Main Column ── */}
            <div className="spm-main-col">
              {/* Section label */}
              <div className="spm-section-header">
                <div className="spm-section-header__icon">
                  <Lock size={14} />
                </div>
                <span className="spm-section-header__label">SECURE PAYMENT OPTIONS</span>
                <div className="spm-section-header__rule" />
              </div>

              {/* Payment option list */}
              <div className="spm-options">
                {PAYMENT_OPTIONS.map((opt) => {
                  const isSelected = selectedMethod === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`spm-option ${isSelected ? 'spm-option--selected' : ''}`}
                      onClick={() => setSelectedMethod(opt.id)}
                      aria-checked={isSelected}
                      role="radio"
                    >
                      <div className={`spm-option__icon ${isSelected ? 'spm-option__icon--selected' : ''}`}>
                        <Icon size={18} />
                      </div>
                      <div className="spm-option__text">
                        <span className={`spm-option__title ${isSelected ? 'spm-option__title--selected' : ''}`}>
                          {opt.title}
                        </span>
                        <span className="spm-option__desc">{opt.desc}</span>
                      </div>
                      <div className="spm-option__trailing">
                        {isSelected ? (
                          <CheckCircle2 size={20} className="spm-option__check" />
                        ) : (
                          <ChevronRight size={18} className="spm-option__chevron" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Trust badges */}
              <div className="spm-trust-grid">
                <div className="spm-trust-chip">
                  <div className="spm-trust-chip__icon">
                    <Lock size={14} />
                  </div>
                  <div className="spm-trust-chip__text">
                    <span className="spm-trust-chip__label">Encrypted Transaction</span>
                    <span className="spm-trust-chip__desc">256-bit SSL encryption</span>
                  </div>
                </div>
                <div className="spm-trust-chip">
                  <div className="spm-trust-chip__icon">
                    <Shield size={14} />
                  </div>
                  <div className="spm-trust-chip__text">
                    <span className="spm-trust-chip__label">PCI Compliant</span>
                    <span className="spm-trust-chip__desc">Level 1 certified gateway</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Rail — Transaction Summary ── */}
            <aside className="cv-rail">
              <section className="cv-card cv-rail-card">
                <h3 className="cv-rail-heading">TRANSACTION SUMMARY</h3>

                {/* Cost rows — reuses prm-row pattern */}
                <div className="spm-cost-rows">
                  {COST_ROWS.map((row, i) => (
                    <div
                      key={row.label}
                      className={`spm-cost-row ${i === COST_ROWS.length - 1 ? 'spm-cost-row--last' : ''}`}
                    >
                      <div className="spm-cost-row__left">
                        <span className="spm-cost-row__label">{row.label}</span>
                        {row.label === 'Premium Vacancy Listing' && (
                          <span className="spm-cost-row__sub">{vacancyTitle}</span>
                        )}
                      </div>
                      <span className="spm-cost-row__value">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pv-rail-divider" />

                {/* Total — reuses prm-total-row treatment */}
                <div className="spm-total-row">
                  <div className="spm-total-left">
                    <span className="spm-total-label">TOTAL PAYABLE</span>
                    <span className="spm-total-value">{TOTAL_PAYABLE}</span>
                  </div>
                </div>

                {/* Publish note */}
                <div className="spm-note">
                  <Info size={14} className="spm-note__icon" />
                  <span className="spm-note__text">
                    Your listing will publish <strong>immediately</strong> once payment is verified and confirmed.
                  </span>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  className="btn btn-primary spm-cta"
                  onClick={continueToPayment}
                >
                  Continue to Payment
                  <ChevronRight size={16} />
                </button>
                <span className="spm-cta-caption">
                  No hidden charges. One-time payment only.
                </span>

                {/* Mobile confirmation note */}
                <div className="spm-note spm-note--muted">
                  <MessageSquare size={14} className="spm-note__icon" />
                  <div className="spm-note__body">
                    <span className="spm-note__heading">SMS Confirmation</span>
                    <span className="spm-note__text">
                      A payment receipt and confirmation SMS will be sent to your registered mobile number.
                    </span>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          {/* ── Footer ── */}
          <footer className="spm-footer">
            <div className="spm-footer__left">
              <div className="spm-footer__logo">
                <span className="sidebar-logo__box">IH</span>
                <div className="spm-footer__brand">
                  <span className="spm-footer__brand-name">IntelliHire Secure Checkout</span>
                  <span className="spm-footer__version">Payment Gateway v2.4.1</span>
                </div>
              </div>
            </div>
            <div className="spm-footer__center">
              <div className="spm-footer__links">
                <a href="#terms" className="spm-footer__link" onClick={(e) => e.preventDefault()}>Billing Terms</a>
                <a href="#refund" className="spm-footer__link" onClick={(e) => e.preventDefault()}>Refund Policy</a>
                <a href="#privacy" className="spm-footer__link" onClick={(e) => e.preventDefault()}>Privacy Assurance</a>
                <a href="#contact" className="spm-footer__link" onClick={(e) => e.preventDefault()}>Contact Billing</a>
              </div>
            </div>
            <div className="spm-footer__right">
              <span className="spm-footer__copy">&copy; 2026 IntelliHire</span>
              <span className="spm-footer__status">
                <span className="spm-footer__status-dot" />
                System Operational
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default SelectPaymentMethodPage;
