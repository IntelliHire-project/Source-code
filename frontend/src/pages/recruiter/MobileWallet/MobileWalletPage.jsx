import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Apple,
  Wallet,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Lock,
  ShieldCheck,
  Clock,
  X,
  ScanFace,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './MobileWalletPage.css';

const TOTAL_PAYABLE = 'LKR 2,497.50';
const APPROVAL_SECONDS = 60;

const COST_ROWS = [
  { label: 'Premium Vacancy Listing', value: 'LKR 2,250.00' },
  { label: 'Processing Fee', value: 'LKR 0.00' },
  { label: 'VAT (11%)', value: 'LKR 247.50' },
];

const WALLETS = [
  { id: 'apple', icon: Apple, title: 'Apple Pay', desc: 'Pay with Face ID or Touch ID' },
  { id: 'google', icon: Wallet, title: 'Google Pay', desc: 'Pay with your saved Google account' },
  { id: 'samsung', icon: Smartphone, title: 'Samsung Pay', desc: 'Pay with your Samsung Wallet' },
];

function MobileWalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('apple');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [remaining, setRemaining] = useState(APPROVAL_SECONDS);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  const vacancy = location.state?.formState || location.state?.vacancy;
  const vacancyTitle = vacancy?.jobTitle || vacancy?.title || 'your vacancy listing';
  const wallet = WALLETS.find((w) => w.id === selectedWallet) || WALLETS[0];
  const WalletIcon = wallet.icon;
  const expired = remaining <= 0;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const openSheet = useCallback(() => {
    setRemaining(APPROVAL_SECONDS);
    setIsApproving(false);
    setIsSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    clearTimer();
    setIsSheetOpen(false);
    setIsApproving(false);
  }, [clearTimer]);

  useEffect(() => {
    if (!isSheetOpen || isApproving) return undefined;
    if (remaining <= 0) return undefined;
    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isSheetOpen, isApproving, remaining]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleApprove = useCallback(() => {
    if (expired || isApproving) return;
    clearTimer();
    setIsApproving(true);
    setTimeout(() => {
      navigate('/recruiter/payment-status', {
        state: {
          paymentStatus: 'success',
          paymentMethod: 'wallet',
          walletLabel: wallet.title,
          vacancyTitle: vacancy?.jobTitle || vacancy?.title,
        },
      });
    }, 1200);
  }, [expired, isApproving, clearTimer, navigate, wallet, vacancy]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  return (
    <div className="create-vacancy mw-shell">
      <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          breadcrumbItems={[
            { label: 'Recruitment', path: '/recruiter/dashboard' },
            { label: 'Select Payment Method', path: '/recruiter/select-payment' },
            { label: 'Mobile Wallet' },
          ]}
          searchPlaceholder="Search..."
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="mw-content">
          <button
            type="button"
            className="mw-back"
            onClick={() => navigate('/recruiter/select-payment', { state: location.state })}
          >
            <ArrowLeft size={16} />
            Back to payment methods
          </button>

          <header className="mw-header">
            <span className="mw-step">MOBILE WALLET</span>
            <h1>Pay with your mobile wallet</h1>
            <p>
              Complete payment for <strong>{vacancyTitle}</strong> using your preferred digital
              wallet. Your listing publishes instantly once the payment is authorised.
            </p>
          </header>

          <div className="mw-grid">
            <section className="mw-card">
              <h2><Smartphone size={19} /> Choose your wallet</h2>
              <div className="mw-options">
                {WALLETS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedWallet === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`mw-option ${isSelected ? 'mw-option--selected' : ''}`}
                      onClick={() => setSelectedWallet(opt.id)}
                      aria-checked={isSelected}
                      role="radio"
                    >
                      <div className={`mw-option__icon ${isSelected ? 'mw-option__icon--selected' : ''}`}>
                        <Icon size={18} />
                      </div>
                      <div className="mw-option__text">
                        <span className={`mw-option__title ${isSelected ? 'mw-option__title--selected' : ''}`}>
                          {opt.title}
                        </span>
                        <span className="mw-option__desc">{opt.desc}</span>
                      </div>
                      <div className="mw-option__trailing">
                        {isSelected ? (
                          <CheckCircle2 size={20} className="mw-option__check" />
                        ) : (
                          <ChevronRight size={18} className="mw-option__chevron" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mw-trust">
                <Lock size={14} />
                <span>Your wallet credentials are never shared with IntelliHire.</span>
              </div>
            </section>

            <section className="mw-card mw-summary">
              <h2><Wallet size={19} /> Order summary</h2>
              <div className="mw-cost-rows">
                {COST_ROWS.map((row, i) => (
                  <div
                    key={row.label}
                    className={`mw-cost-row ${i === COST_ROWS.length - 1 ? 'mw-cost-row--last' : ''}`}
                  >
                    <span className="mw-cost-row__label">{row.label}</span>
                    <span className="mw-cost-row__value">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="mw-total-row">
                <span className="mw-total-label">TOTAL PAYABLE</span>
                <span className="mw-total-value">{TOTAL_PAYABLE}</span>
              </div>

              <button type="button" className="btn btn-primary mw-pay" onClick={openSheet}>
                <Lock size={16} />
                Pay {TOTAL_PAYABLE}
              </button>

              <p className="mw-security">
                <ShieldCheck size={14} />
                Secured with tokenised, bank-grade encryption.
              </p>
            </section>
          </div>
        </main>
      </div>

      {isSheetOpen && (
        <div className="mw-overlay" role="dialog" aria-modal="true" aria-label={`${wallet.title} confirmation`}>
          <div className="mw-sheet">
            <button
              type="button"
              className="mw-sheet__close"
              onClick={closeSheet}
              disabled={isApproving}
              aria-label="Cancel payment"
            >
              <X size={18} />
            </button>

            <div className="mw-sheet__brand">
              <span className="mw-sheet__brand-icon">
                <WalletIcon size={22} />
              </span>
              <span className="mw-sheet__brand-name">{wallet.title}</span>
            </div>

            {isApproving ? (
              <div className="mw-sheet__processing">
                <Loader2 size={30} className="mw-spinner" />
                <span className="mw-sheet__processing-title">Processing payment…</span>
                <span className="mw-sheet__processing-desc">
                  Confirm the request in your wallet to complete the transaction.
                </span>
              </div>
            ) : expired ? (
              <div className="mw-sheet__processing">
                <Clock size={30} className="mw-sheet__expired-icon" />
                <span className="mw-sheet__processing-title">Request timed out</span>
                <span className="mw-sheet__processing-desc">
                  This payment request expired. Close this window and try again.
                </span>
              </div>
            ) : (
              <>
                <div className="mw-sheet__amount">
                  <span className="mw-sheet__amount-label">AMOUNT TO PAY</span>
                  <span className="mw-sheet__amount-value">{TOTAL_PAYABLE}</span>
                </div>

                <dl className="mw-sheet__details">
                  <div><dt>Merchant</dt><dd>IntelliHire Billing</dd></div>
                  <div><dt>Item</dt><dd>{vacancyTitle}</dd></div>
                  <div><dt>Wallet</dt><dd>{wallet.title}</dd></div>
                </dl>

                <div className="mw-sheet__scan">
                  <ScanFace size={20} />
                  <span>Confirm with Face ID, Touch ID, or your wallet passcode.</span>
                </div>

                <div className="mw-sheet__timer">
                  <Clock size={14} />
                  Expires in <strong>{mins}:{secs}</strong>
                </div>

                <div className="mw-sheet__actions">
                  <button
                    type="button"
                    className="btn btn-primary mw-sheet__approve"
                    onClick={handleApprove}
                  >
                    <CheckCircle2 size={16} />
                    Approve Payment
                  </button>
                  <button
                    type="button"
                    className="mw-sheet__cancel"
                    onClick={closeSheet}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileWalletPage;
