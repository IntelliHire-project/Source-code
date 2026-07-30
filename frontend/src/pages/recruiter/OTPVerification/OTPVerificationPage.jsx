import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './OTPVerificationPage.css';

const OTP_LENGTH = 6;
const EXPIRY_SECONDS = 5 * 60;

const VACANCY_TITLE = 'Senior AI Product Designer';
const TOTAL_PAYABLE = 'LKR 2,500.00';
const MASKED_CARD = '•••• •••• •••• 4289';
const CARD_NETWORK = 'Visa';

/* ─────────────────────────────────────────────
   OTP Input Group — segmented single-char inputs
   ───────────────────────────────────────────── */
function OTPInputGroup({ length = OTP_LENGTH, value, onChange, disabled, error }) {
  const inputRefs = useRef([]);

  const focusInput = useCallback((index) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    }
  }, [length]);

  const handleChange = useCallback((index, e) => {
    const inputVal = e.target.value.replace(/\D/g, '');

    if (inputVal.length > 1) {
      const digits = inputVal.slice(0, length).split('');
      const newValue = value.split('');
      digits.forEach((d, i) => {
        if (index + i < length) newValue[index + i] = d;
      });
      const joined = newValue.join('').slice(0, length);
      onChange(joined);
      const nextIndex = Math.min(index + digits.length, length - 1);
      setTimeout(() => focusInput(nextIndex), 0);
      return;
    }

    const newValue = value.split('');
    newValue[index] = inputVal;
    onChange(newValue.join(''));

    if (inputVal && index < length - 1) {
      setTimeout(() => focusInput(index + 1), 0);
    }
  }, [value, onChange, length, focusInput]);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValue = value.split('');
      if (newValue[index]) {
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        setTimeout(() => focusInput(index - 1), 0);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  }, [value, onChange, length, focusInput]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      setTimeout(() => focusInput(nextIndex), 0);
    }
  }, [onChange, length, focusInput]);

  return (
    <div className="otp-group" onPaste={handlePaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={length}
          className={`otp-box ${error ? 'otp-box--error' : ''} ${value[i] ? 'otp-box--filled' : ''}`}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1} of ${length}`}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Countdown Timer — inline mm:ss
   ───────────────────────────────────────────── */
function CountdownTimer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining, onExpire]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  return (
    <span className={`otp-countdown ${remaining <= 0 ? 'otp-countdown--expired' : ''}`}>
      {remaining > 0 ? `${mins}:${secs}` : 'Expired'}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────── */
function OTPVerificationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const cooldownRef = useRef(null);

  const codeComplete = otp.length === OTP_LENGTH;

  const handleVerify = useCallback(() => {
    if (!codeComplete || expired) return;
    setError('');
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      navigate('/recruiter/payment-status', { state: { paymentStatus: 'success' } });
    }, 1200);
  }, [codeComplete, expired, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/recruiter/complete-purchase');
  }, [navigate]);

  const handleResend = useCallback(() => {
    if (resendCooldown > 0) return;
    setError('');
    setOtp('');
    setExpired(false);
    setResendCooldown(30);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resendCooldown]);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const handleOtpChange = useCallback((val) => {
    setOtp(val);
    if (error) setError('');
  }, [error]);

  return (
    <div className="create-vacancy otp-shell">
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
            { label: 'OTP Verification' },
          ]}
          searchPlaceholder="Search..."
          onSearch={(q) => console.log('Search:', q)}
          onNotificationClick={() => console.log('Notifications clicked')}
          onLogout={() => console.log('Logout')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="otp-content">
          {/* ── Breadcrumb trail ── */}
          <div className="otp-breadcrumb">
            <span className="otp-breadcrumb__item">RECRUITMENT</span>
            <span className="otp-breadcrumb__sep">·</span>
            <span className="otp-breadcrumb__item">PAYMENT GATE</span>
            <span className="otp-breadcrumb__sep">·</span>
            <span className="otp-breadcrumb__item otp-breadcrumb__item--active">VERIFICATION</span>
          </div>

          {/* ── Centered Card ── */}
          <div className="otp-card-wrap">
            <div className="otp-card">
              {/* Accent bar */}
              <div className="otp-card__accent" />

              {/* Icon block */}
              <div className="otp-card__icon">
                <ShieldCheck size={24} />
              </div>

              {/* Badge */}
              <span className="otp-badge">
                <Lock size={11} />
                VERIFICATION REQUIRED
              </span>

              {/* Title */}
              <h1 className="otp-title">Verify Your Payment</h1>

              {/* Subtitle */}
              <p className="otp-subtitle">
                A one-time verification code has been sent to your cardholder&apos;s
                registered mobile number ending in <strong>••••82</strong>.
                Enter the code below to authorise payment of{' '}
                <strong>{TOTAL_PAYABLE}</strong> for the{' '}
                <strong>{VACANCY_TITLE}</strong> vacancy listing.
              </p>

              <div className="otp-divider" />

              {/* OTP Input */}
              <div className="otp-input-section">
                <OTPInputGroup
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={verifying}
                  error={error}
                />

                {error && (
                  <span className="otp-field-error">
                    <AlertCircle size={13} />
                    {error}
                  </span>
                )}

                {/* Countdown / Resend row */}
                <div className="otp-resend-row">
                  <span className="otp-resend-text">
                    Code expires in{' '}
                    <CountdownTimer
                      seconds={EXPIRY_SECONDS}
                      onExpire={() => setExpired(true)}
                    />
                  </span>
                  <button
                    type="button"
                    className="otp-resend-link"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                  >
                    <RefreshCw size={12} />
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Code'}
                  </button>
                </div>
              </div>

              <div className="otp-divider" />

              {/* Transaction Reference */}
              <div className="otp-txn">
                <span className="otp-txn__header">TRANSACTION DETAILS</span>
                <div className="otp-txn__rows">
                  <div className="otp-txn__row">
                    <span className="otp-txn__label">Amount to Authorize</span>
                    <span className="otp-txn__value otp-txn__value--accent">{TOTAL_PAYABLE}</span>
                  </div>
                  <div className="otp-txn__row">
                    <span className="otp-txn__label">Card</span>
                    <span className="otp-txn__value">
                      <CreditCard size={13} className="otp-txn__card-icon" />
                      {MASKED_CARD} {CARD_NETWORK}
                    </span>
                  </div>
                  <div className="otp-txn__row">
                    <span className="otp-txn__label">Merchant</span>
                    <span className="otp-txn__value">IntelliHire Billing</span>
                  </div>
                </div>
              </div>

              <div className="otp-divider" />

              {/* Actions */}
              <div className="otp-actions">
                <button
                  type="button"
                  className="btn btn-primary otp-btn"
                  onClick={handleVerify}
                  disabled={!codeComplete || expired || verifying}
                >
                  {verifying ? 'Verifying...' : 'Verify & Pay'}
                  {!verifying && <ChevronRight size={16} />}
                </button>
                <button
                  type="button"
                  className="otp-btn otp-btn--outline"
                  onClick={handleCancel}
                  disabled={verifying}
                >
                  Cancel Transaction
                </button>
              </div>

              {/* Security note */}
              <div className="otp-security">
                <Lock size={13} />
                <span>
                  This is a secure verification page. The code is single-use and expires
                  shortly. Your connection is encrypted with 256-bit SSL — no sensitive
                  data is stored on our servers.
                </span>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="otp-footer">
            <div className="otp-footer__left">
              <div className="otp-footer__logo">
                <span className="sidebar-logo__box">IH</span>
                <div className="otp-footer__brand">
                  <span className="otp-footer__brand-name">IntelliHire Finance Suite</span>
                  <span className="otp-footer__version">Secure Checkout v3.1.0</span>
                </div>
              </div>
            </div>
            <div className="otp-footer__center">
              <div className="otp-footer__links">
                <a href="#gdpr" className="otp-footer__link" onClick={(e) => e.preventDefault()}>GDPR Compliance</a>
                <a href="#privacy" className="otp-footer__link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                <a href="#terms" className="otp-footer__link" onClick={(e) => e.preventDefault()}>Payment Terms</a>
                <a href="#audit" className="otp-footer__link" onClick={(e) => e.preventDefault()}>Audit History</a>
              </div>
            </div>
            <div className="otp-footer__right">
              <span className="otp-footer__copy">&copy; 2026 IntelliHire</span>
              <span className="otp-footer__status">
                <span className="otp-footer__status-dot" />
                System Operational
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default OTPVerificationPage;
