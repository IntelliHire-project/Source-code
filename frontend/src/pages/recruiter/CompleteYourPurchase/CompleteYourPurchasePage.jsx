import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Shield,
  FileText,
  Globe,
  Bell,
  Link2,
  Headphones,
  MapPin,
  Zap,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './CompleteYourPurchasePage.css';

const VACANCY_TITLE = 'Senior AI Product Designer';
const TOTAL_PAYABLE = 'LKR 2,500.00';

const COST_ROWS = [
  { label: 'Vacancy Listing Fee', value: 'LKR 2,200.00' },
  { label: 'Priority Support Add-on', value: 'LKR 50.00' },
  { label: 'Service Tax (VAT 11%)', value: 'LKR 250.00' },
];

const INCLUDED_ITEMS = [
  { icon: Globe, label: '30 Days Global Visibility' },
  { icon: Zap, label: 'Unlimited AI Matching Rounds' },
  { icon: Bell, label: 'Priority Email Notifications' },
  { icon: Link2, label: 'Public Shareable Link' },
];

const ORDER_ID = 'ORD-2026-7841';

function CompleteYourPurchasePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nameOnCard: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = useCallback((field) => (e) => {
    let value = e.target.value;

    if (field === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    }

    if (field === 'expMonth') {
      value = value.replace(/\D/g, '').slice(0, 2);
      if (value.length === 2) {
        const num = parseInt(value, 10);
        if (num > 12) value = '12';
        if (num < 1 && value.length === 2) value = '01';
      }
    }

    if (field === 'expYear') {
      value = value.replace(/\D/g, '').slice(0, 2);
    }

    if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const validate = useCallback(() => {
    const errs = {};

    if (!form.nameOnCard.trim()) {
      errs.nameOnCard = 'Name on card is required';
    }

    const cardDigits = form.cardNumber.replace(/\s/g, '');
    if (cardDigits.length < 13 || cardDigits.length > 16) {
      errs.cardNumber = 'Enter a valid card number';
    }

    const month = parseInt(form.expMonth, 10);
    const year = parseInt(form.expYear, 10);
    if (!form.expMonth || !form.expYear || isNaN(month) || isNaN(year)) {
      errs.expiry = 'Expiry date is required';
    } else if (month < 1 || month > 12) {
      errs.expiry = 'Invalid month';
    } else {
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errs.expiry = 'Card has expired';
      }
    }

    if (form.cvv.length < 3) {
      errs.cvv = 'Enter a valid CVV';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = useCallback(() => {
    if (validate()) {
      navigate('/recruiter/payments');
    }
  }, [validate, navigate]);

  const getCardType = () => {
    const num = form.cardNumber.replace(/\s/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    return null;
  };

  const cardType = getCardType();

  return (
    <div className="create-vacancy cyp-shell">
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
            { label: 'Complete Your Purchase' },
          ]}
          searchPlaceholder="Search..."
          onSearch={(q) => console.log('Search:', q)}
          onNotificationClick={() => console.log('Notifications clicked')}
          onLogout={() => console.log('Logout')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="cyp-content">
          {/* ── Back link ── */}
          <div className="cyp-back-row">
            <button
              type="button"
              className="cyp-back-link"
              onClick={() => navigate('/recruiter/vacancy-preview')}
            >
              <ArrowLeft size={16} />
              Back to Preview
            </button>
            <span className="cyp-back-label">Payment Details</span>
          </div>

          {/* ── Header ── */}
          <div className="cyp-header">
            <div className="cyp-header__text">
              <div className="cyp-header__title-row">
                <h1 className="cyp-title">Complete Your Purchase</h1>
                <span className="cyp-step-badge">
                  <Zap size={12} />
                  STEP 3 OF 3
                </span>
              </div>
              <p className="cyp-subtitle">
                Securely process your payment for the <strong>{VACANCY_TITLE}</strong> vacancy listing.
              </p>
            </div>
            <div className="cyp-header__ssl">
              <ShieldCheck size={13} />
              SSL SECURED · 256-BIT
            </div>
          </div>

          <div className="cyp-accent-bar" />

          {/* ── Two-column layout ── */}
          <div className="cyp-layout">
            {/* ── Main Column ── */}
            <div className="cyp-main-col">
              {/* Card Details Card */}
              <div className="cyp-card">
                {/* Section header */}
                <div className="cyp-section-header">
                  <div className="cyp-section-header__icon">
                    <CreditCard size={14} />
                  </div>
                  <span className="cyp-section-header__label">CREDIT / DEBIT CARD DETAILS</span>
                  <div className="cyp-network-chips">
                    <span className={`cyp-network-chip ${cardType === 'visa' ? 'cyp-network-chip--active' : ''}`}>
                      VISA
                    </span>
                    <span className={`cyp-network-chip ${cardType === 'mastercard' ? 'cyp-network-chip--active' : ''}`}>
                      MC
                    </span>
                    <span className={`cyp-network-chip ${cardType === 'amex' ? 'cyp-network-chip--active' : ''}`}>
                      AMEX
                    </span>
                  </div>
                  <div className="cyp-section-header__rule" />
                </div>

                {/* Form fields */}
                <div className="cyp-form">
                  {/* Name on Card */}
                  <div className="cyp-field">
                    <label className="cyp-field-label" htmlFor="cyp-name">
                      Name on Card
                    </label>
                    <input
                      id="cyp-name"
                      type="text"
                      className={`cyp-input ${errors.nameOnCard ? 'cyp-input--error' : ''}`}
                      placeholder="e.g. Alex Rivera"
                      value={form.nameOnCard}
                      onChange={handleChange('nameOnCard')}
                      autoComplete="cc-name"
                    />
                    {errors.nameOnCard && (
                      <span className="cyp-field-error">{errors.nameOnCard}</span>
                    )}
                  </div>

                  {/* Card Number */}
                  <div className="cyp-field">
                    <label className="cyp-field-label" htmlFor="cyp-card">
                      Card Number
                    </label>
                    <div className="cyp-input-icon-wrap">
                      <Lock size={14} className="cyp-input-icon" />
                      <input
                        id="cyp-card"
                        type="text"
                        className={`cyp-input cyp-input--icon-left ${errors.cardNumber ? 'cyp-input--error' : ''}`}
                        placeholder="0000 0000 0000 0000"
                        value={form.cardNumber}
                        onChange={handleChange('cardNumber')}
                        autoComplete="cc-number"
                        inputMode="numeric"
                      />
                    </div>
                    {errors.cardNumber && (
                      <span className="cyp-field-error">{errors.cardNumber}</span>
                    )}
                  </div>

                  {/* Expiry + CVV row */}
                  <div className="cyp-row-3">
                    <div className="cyp-field">
                      <label className="cyp-field-label">Expiration Date</label>
                      <div className="cyp-expiry-group">
                        <input
                          type="text"
                          className={`cyp-input cyp-input--short ${errors.expiry ? 'cyp-input--error' : ''}`}
                          placeholder="MM"
                          value={form.expMonth}
                          onChange={handleChange('expMonth')}
                          autoComplete="cc-exp-month"
                          inputMode="numeric"
                          maxLength={2}
                        />
                        <span className="cyp-expiry-sep">/</span>
                        <input
                          type="text"
                          className={`cyp-input cyp-input--short ${errors.expiry ? 'cyp-input--error' : ''}`}
                          placeholder="YY"
                          value={form.expYear}
                          onChange={handleChange('expYear')}
                          autoComplete="cc-exp-year"
                          inputMode="numeric"
                          maxLength={2}
                        />
                      </div>
                      {errors.expiry && (
                        <span className="cyp-field-error">{errors.expiry}</span>
                      )}
                    </div>

                    <div className="cyp-field">
                      <label className="cyp-field-label" htmlFor="cyp-cvv">
                        Security Code
                      </label>
                      <input
                        id="cyp-cvv"
                        type="text"
                        className={`cyp-input ${errors.cvv ? 'cyp-input--error' : ''}`}
                        placeholder="CVV"
                        value={form.cvv}
                        onChange={handleChange('cvv')}
                        autoComplete="cc-csc"
                        inputMode="numeric"
                        maxLength={4}
                      />
                      <div className="cyp-cvv-hint">
                        <HelpCircle size={12} />
                        <span>What is this?</span>
                      </div>
                      {errors.cvv && (
                        <span className="cyp-field-error">{errors.cvv}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trust row */}
                <div className="cyp-trust-row">
                  <div className="cyp-trust-icon">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="cyp-trust-content">
                    <span className="cyp-trust-label">
                      <CheckCircle2 size={13} />
                      Encrypted Connection
                    </span>
                    <span className="cyp-trust-desc">
                      Bank-level 256-bit SSL encryption. Your card details are never stored on our servers.
                    </span>
                  </div>
                </div>

                {/* Pay button */}
                <button
                  type="button"
                  className="btn btn-primary cyp-pay-btn"
                  onClick={handleSubmit}
                >
                  Pay {TOTAL_PAYABLE} Now
                  <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                </button>

                <p className="cyp-terms">
                  By confirming payment, you agree to our{' '}
                  <span className="cyp-link">Terms of Service</span>,{' '}
                  <span className="cyp-link">Refund Policy</span>, and{' '}
                  <span className="cyp-link">Privacy Policy</span>.
                </p>
              </div>

              {/* Billing Address */}
              <div className="cyp-billing-card">
                <div className="cyp-billing-left">
                  <div className="cyp-billing-icon">
                    <MapPin size={14} />
                  </div>
                  <div className="cyp-billing-text">
                    <span className="cyp-billing-label">BILLING ADDRESS</span>
                    <span className="cyp-billing-value">Same as account: 12 Tech Park, Colombo 07, Sri Lanka</span>
                  </div>
                </div>
                <button type="button" className="cyp-link-btn">
                  Edit Address
                </button>
              </div>
            </div>

            {/* ── Right Rail ── */}
            <aside className="cv-rail">
              {/* Order Summary */}
              <section className="cv-card cv-rail-card cyp-order-summary">
                <h3 className="cyp-rail-heading">Order Summary</h3>
                <span className="cyp-rail-ref">{ORDER_ID}</span>

                {/* Vacancy line item */}
                <div className="cyp-vacancy-item">
                  <div className="cyp-vacancy-dot" />
                  <div className="cyp-vacancy-info">
                    <span className="cyp-vacancy-title">{VACANCY_TITLE}</span>
                    <span className="cyp-vacancy-sub">Standard Professional Listing</span>
                  </div>
                </div>

                <div className="pv-rail-divider" />

                {/* Cost rows */}
                <div className="cyp-cost-rows">
                  {COST_ROWS.map((row, i) => (
                    <div
                      key={row.label}
                      className={`cyp-cost-row ${i === COST_ROWS.length - 1 ? 'cyp-cost-row--last' : ''}`}
                    >
                      <span className="cyp-cost-row__label">{row.label}</span>
                      <span className="cyp-cost-row__value">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pv-rail-divider" />

                {/* Total */}
                <div className="cyp-total-row">
                  <span className="cyp-total-label">Total Amount</span>
                  <span className="cyp-total-value">{TOTAL_PAYABLE}</span>
                </div>

                {/* Included list */}
                <div className="cyp-included">
                  <span className="cyp-included-heading">Included:</span>
                  <ul className="cyp-included-list">
                    {INCLUDED_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.label} className="cyp-included-item">
                          <CheckCircle2 size={13} className="cyp-included-check" />
                          <Icon size={13} className="cyp-included-icon" />
                          <span>{item.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Footer status */}
                <div className="cyp-panel-footer">
                  <span className="cyp-panel-footer__left">
                    <Shield size={12} />
                    Safe &amp; Secure Payment
                  </span>
                  <span className="cyp-panel-footer__right">
                    <span className="cyp-panel-footer__dot" />
                    Live Server Active
                  </span>
                </div>
              </section>

              {/* Need Assistance */}
              <section className="cv-card cv-rail-card cyp-assist-panel">
                <div className="cyp-assist-header">
                  <div className="cyp-assist-icon">
                    <Headphones size={16} />
                  </div>
                  <h3 className="cyp-assist-title">Need Assistance?</h3>
                </div>
                <p className="cyp-assist-text">
                  Having trouble completing your payment? Our billing support team is available to help.
                  Reach out at{' '}
                  <span className="cyp-link">billing@intellihire.io</span>
                </p>
                <button type="button" className="btn cyp-assist-btn">
                  Open Support Ticket
                </button>
              </section>

              {/* Compliance Note */}
              <div className="cyp-compliance">
                <Shield size={12} />
                <span>
                  IntelliHire is Level 1 PCI DSS compliant. All transaction data is anonymised and protected per international financial data standards.
                </span>
              </div>
            </aside>
          </div>

          {/* ── Footer ── */}
          <footer className="cyp-footer">
            <div className="cyp-footer__left">
              <div className="cyp-footer__logo">
                <span className="sidebar-logo__box">IH</span>
                <div className="cyp-footer__brand">
                  <span className="cyp-footer__brand-name">IntelliHire Finance Suite</span>
                  <span className="cyp-footer__version">Secure Checkout v3.1.0</span>
                </div>
              </div>
            </div>
            <div className="cyp-footer__center">
              <div className="cyp-footer__links">
                <a href="#gdpr" className="cyp-footer__link" onClick={(e) => e.preventDefault()}>GDPR Compliance</a>
                <a href="#privacy" className="cyp-footer__link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                <a href="#terms" className="cyp-footer__link" onClick={(e) => e.preventDefault()}>Payment Terms</a>
                <a href="#audit" className="cyp-footer__link" onClick={(e) => e.preventDefault()}>Audit History</a>
              </div>
            </div>
            <div className="cyp-footer__right">
              <span className="cyp-footer__copy">&copy; 2026 IntelliHire</span>
              <span className="cyp-footer__status">
                <span className="cyp-footer__status-dot" />
                System Operational
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default CompleteYourPurchasePage;
