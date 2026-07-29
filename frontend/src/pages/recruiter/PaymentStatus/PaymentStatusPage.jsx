import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Lock,
  CreditCard,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Printer,
  Download,
  AlertTriangle,
  Headphones,
  Clock,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import PillToggleGroup from '../../../components/common/PillToggleGroup';
import '../../../style.css';
import './PaymentStatusPage.css';

const VACANCY_TITLE = 'Senior AI Product Designer';
const TOTAL_PAYABLE = 'LKR 2,500.00';
const MASKED_CARD = '•••• •••• •••• 4289';
const CARD_NETWORK = 'Visa';

const PREVIEW_OPTIONS = [
  { value: 'success', label: 'Success' },
  { value: 'failure', label: 'Failure' },
];

const SUCCESS_TXN = {
  id: 'TXN-2026-0091',
  amount: TOTAL_PAYABLE,
  datetime: '28 Jul 2026, 02:34 AM',
  method: `${MASKED_CARD} ${CARD_NETWORK}`,
};

const FAILURE_TXN = {
  id: 'TXN-2026-0091',
  amount: TOTAL_PAYABLE,
  datetime: '28 Jul 2026, 02:34 AM',
  method: `${MASKED_CARD} ${CARD_NETWORK}`,
};

function PaymentStatusPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const initialStatus = location.state?.paymentStatus || 'success';
  const [previewStatus, setPreviewStatus] = useState(initialStatus);

  const isSuccess = previewStatus === 'success';
  const txn = isSuccess ? SUCCESS_TXN : FAILURE_TXN;

  return (
    <div className="create-vacancy ps-shell">
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
            { label: 'Payment Status' },
          ]}
          searchPlaceholder="Search..."
          onSearch={(q) => console.log('Search:', q)}
          onNotificationClick={() => console.log('Notifications clicked')}
          onLogout={() => console.log('Logout')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="ps-content">
          {/* ── Top row: breadcrumb + QA toggle ── */}
          <div className="ps-top-row">
            <div className="ps-breadcrumb">
              <span className="ps-breadcrumb__item">RECRUITMENT</span>
              <span className="ps-breadcrumb__sep">·</span>
              <span className="ps-breadcrumb__item">PAYMENT GATE</span>
              <span className="ps-breadcrumb__sep">·</span>
              <span className="ps-breadcrumb__item ps-breadcrumb__item--active">STATUS</span>
            </div>

            <div className="ps-qa-toggle">
              <span className="ps-qa-label">QA Preview</span>
              <PillToggleGroup
                options={PREVIEW_OPTIONS}
                value={previewStatus}
                onChange={setPreviewStatus}
                name="payment-status-preview"
              />
            </div>
          </div>

          {/* ── Centered Card ── */}
          <div className="ps-card-wrap">
            <div className="ps-card">
              {/* Accent bar — color varies by state */}
              <div className={`ps-card__accent ${isSuccess ? 'ps-card__accent--success' : 'ps-card__accent--failure'}`} />

              {/* Icon block */}
              <div className={`ps-card__icon ${isSuccess ? 'ps-card__icon--success' : 'ps-card__icon--failure'}`}>
                {isSuccess ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
              </div>

              {/* Status badge */}
              <span className={`ps-badge ${isSuccess ? 'ps-badge--success' : 'ps-badge--failure'}`}>
                {isSuccess ? (
                  <><CheckCircle2 size={11} /> TRANSACTION COMPLETE</>
                ) : (
                  <><XCircle size={11} /> TRANSACTION FAILED</>
                )}
              </span>

              {/* Title */}
              <h1 className="ps-title">
                {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
              </h1>

              {/* Subtitle */}
              <p className="ps-subtitle">
                {isSuccess ? (
                  <>
                    Your payment for the <strong>{VACANCY_TITLE}</strong> vacancy listing
                    has been processed successfully. The listing is now live on the public job board.
                  </>
                ) : (
                  <>
                    We were unable to process your payment of <strong>{TOTAL_PAYABLE}</strong> for
                    the <strong>{VACANCY_TITLE}</strong> vacancy listing. No charge was made.
                    Please try again or contact support.
                  </>
                )}
              </p>

              <div className="ps-divider" />

              {/* Transaction Detail Panel */}
              <div className="ps-txn">
                <span className="ps-txn__header">
                  {isSuccess ? 'TRANSACTION DETAILS' : 'ATTEMPTED TRANSACTION'}
                </span>
                <div className="ps-txn__rows">
                  <div className="ps-txn__row">
                    <span className="ps-txn__label">Transaction ID</span>
                    <span className="ps-txn__value">{txn.id}</span>
                  </div>
                  <div className="ps-txn__row">
                    <span className="ps-txn__label">{isSuccess ? 'Amount Paid' : 'Amount Attempted'}</span>
                    <span className={`ps-txn__value ${isSuccess ? 'ps-txn__value--accent' : ''}`}>
                      {txn.amount}
                    </span>
                  </div>
                  <div className="ps-txn__row">
                    <span className="ps-txn__label">Date &amp; Time</span>
                    <span className="ps-txn__value">
                      <Clock size={13} className="ps-txn__icon" />
                      {txn.datetime}
                    </span>
                  </div>
                  <div className="ps-txn__row">
                    <span className="ps-txn__label">Payment Method</span>
                    <span className="ps-txn__value">
                      <CreditCard size={13} className="ps-txn__icon" />
                      {txn.method}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ps-divider" />

              {/* Actions */}
              <div className="ps-actions">
                {isSuccess ? (
                  <>
                    <div className="ps-actions__row">
                      <button
                        type="button"
                        className="btn btn-primary ps-btn"
                        onClick={() => navigate('/recruiter/vacancies')}
                      >
                        <LayoutDashboard size={16} />
                        Go to Dashboard
                      </button>
                      <button
                        type="button"
                        className="ps-btn ps-btn--outline"
                        onClick={() => console.log('View Invoice')}
                      >
                        <FileText size={16} />
                        View Invoice
                      </button>
                    </div>
                    <div className="ps-text-links">
                      <button
                        type="button"
                        className="ps-text-link"
                        onClick={() => console.log('Print Receipt')}
                      >
                        <Printer size={13} />
                        Print Receipt
                      </button>
                      <button
                        type="button"
                        className="ps-text-link"
                        onClick={() => console.log('Download PDF')}
                      >
                        <Download size={13} />
                        Download PDF
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ps-actions__row">
                      <button
                        type="button"
                        className="btn btn-primary ps-btn"
                        onClick={() => navigate('/recruiter/complete-purchase')}
                      >
                        <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                        Retry Payment
                      </button>
                      <button
                        type="button"
                        className="ps-btn ps-btn--outline"
                        onClick={() => console.log('Contact Support')}
                      >
                        <Headphones size={16} />
                        Contact Support
                      </button>
                    </div>
                    <div className="ps-text-links">
                      <button
                        type="button"
                        className="ps-text-link"
                        onClick={() => console.log('View Error Details')}
                      >
                        <AlertTriangle size={13} />
                        View Error Details
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Security / Compliance Note */}
              <div className="ps-security">
                <Lock size={13} />
                <span>
                  {isSuccess ? (
                    'This is a secure confirmation page. Your financial data was encrypted during the transaction and is not stored on our servers. A receipt has been sent to your registered email.'
                  ) : (
                    'No payment was processed and no financial data was stored. Your connection was encrypted with 256-bit SSL throughout the session. You may safely retry the payment.'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="ps-footer">
            <div className="ps-footer__left">
              <div className="ps-footer__logo">
                <span className="sidebar-logo__box">IH</span>
                <div className="ps-footer__brand">
                  <span className="ps-footer__brand-name">IntelliHire Finance Suite</span>
                  <span className="ps-footer__version">Secure Checkout v3.1.0</span>
                </div>
              </div>
            </div>
            <div className="ps-footer__center">
              <div className="ps-footer__links">
                <a href="#gdpr" className="ps-footer__link" onClick={(e) => e.preventDefault()}>GDPR Compliance</a>
                <a href="#privacy" className="ps-footer__link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                <a href="#terms" className="ps-footer__link" onClick={(e) => e.preventDefault()}>Payment Terms</a>
                <a href="#audit" className="ps-footer__link" onClick={(e) => e.preventDefault()}>Audit History</a>
              </div>
            </div>
            <div className="ps-footer__right">
              <span className="ps-footer__copy">&copy; 2026 IntelliHire</span>
              <span className="ps-footer__status">
                <span className="ps-footer__status-dot" />
                System Operational
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default PaymentStatusPage;
