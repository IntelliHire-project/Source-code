import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Calendar,
  DollarSign,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Download,
  MoreVertical,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Tag,
  Sparkles,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './PaymentBillingPage.css';

const STAT_CARDS = [
  { icon: Tag, label: 'CURRENT PLAN', value: 'Professional', sub: 'Monthly billing', variant: 'gold' },
  { icon: Calendar, label: 'NEXT BILLING DATE', value: '15 Aug 2026', sub: 'Automatic renewal', variant: 'info' },
  { icon: DollarSign, label: 'AMOUNT DUE', value: 'LKR 5,000', sub: 'Includes taxes', variant: 'success' },
  { icon: ShieldCheck, label: 'PAYMENT STATUS', value: 'Active', sub: 'Standing: Good', variant: 'muted' },
];

const PLAN_FEATURES = [
  { label: 'Monthly Active Jobs', value: 'Up to 25' },
  { label: 'Applicant Limit', value: 'Unlimited' },
  { label: 'AI Matching Speed', value: '2x Priority' },
  { label: 'Team Members', value: 'Up to 5' },
  { label: 'Analytics Dashboard', value: 'Advanced' },
  { label: 'Support Level', value: 'Priority 24/7' },
];

const TRANSACTIONS = [
  { id: 'INV-2026-001', date: '15 Jul 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'paid' },
  { id: 'INV-2026-002', date: '15 Jun 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'paid' },
  { id: 'INV-2026-003', date: '15 May 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'paid' },
  { id: 'INV-2026-004', date: '15 Apr 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'failed' },
  { id: 'INV-2026-005', date: '15 Mar 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'refunded' },
  { id: 'INV-2026-006', date: '15 Feb 2026', plan: 'Starter', amount: 'LKR 2,500', status: 'paid' },
  { id: 'INV-2026-007', date: '15 Jan 2026', plan: 'Starter', amount: 'LKR 2,500', status: 'paid' },
  { id: 'INV-2026-008', date: '15 Dec 2025', plan: 'Starter', amount: 'LKR 2,500', status: 'paid' },
  { id: 'INV-2026-009', date: '15 Nov 2025', plan: 'Starter', amount: 'LKR 2,500', status: 'paid' },
  { id: 'INV-2026-010', date: '15 Oct 2025', plan: 'Starter', amount: 'LKR 2,500', status: 'paid' },
  { id: 'INV-2026-011', date: '15 Sep 2025', plan: 'Starter', amount: 'LKR 2,500', status: 'paid' },
  { id: 'INV-2026-012', date: '15 Aug 2025', plan: 'Starter', amount: 'LKR 2,500', status: 'paid' },
];

const PAGE_SIZE = 6;

function StatCard({ icon: Icon, label, value, sub, variant }) {
  return (
    <div className="pb-stat-card">
      <div className={`pb-stat-card__icon pb-stat-card__icon--${variant}`}>
        <Icon size={18} />
      </div>
      <span className="pb-stat-card__label">{label}</span>
      <span className="pb-stat-card__value">{value}</span>
      {sub && <span className="pb-stat-card__sub">{sub}</span>}
    </div>
  );
}

function TxStatusBadge({ status }) {
  const map = {
    paid: { className: 'pb-badge pb-badge--paid', label: 'Paid', icon: CheckCircle2 },
    failed: { className: 'pb-badge pb-badge--failed', label: 'Failed', icon: XCircle },
    refunded: { className: 'pb-badge pb-badge--refunded', label: 'Refunded', icon: RotateCcw },
  };
  const { className, label, icon: Icon } = map[status] || map.paid;
  return (
    <span className={className}>
      <Icon size={12} />
      {label}
    </span>
  );
}

function PaymentBillingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const filtered = useMemo(() => {
    let result = TRANSACTIONS;
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.id.toLowerCase().includes(q));
    }
    return result;
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="create-vacancy pb-shell">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Payment History"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          breadcrumbItems={[
            { label: 'Recruitment', path: '/recruiter/dashboard' },
            { label: 'Payment & Billing' },
          ]}
          searchPlaceholder="Search invoices..."
          onSearch={(q) => console.log('Search:', q)}
          onNotificationClick={() => console.log('Notifications clicked')}
          onLogout={() => console.log('Logout')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="pb-content">
          {/* ── Alert Banner ── */}
          <div className="pb-alert-banner">
            <div className="pb-alert-banner__left">
              <div className="pb-alert-banner__icon">
                <AlertTriangle size={18} />
              </div>
              <div className="pb-alert-banner__text">
                <h3 className="pb-alert-banner__heading">Next Payment Due</h3>
                <p className="pb-alert-banner__desc">
                  Your next subscription payment of <strong>LKR 5,000</strong> is due on <strong>15 Aug 2026</strong>.
                  Ensure your payment method is up to date.
                </p>
              </div>
            </div>
            <button type="button" className="btn btn-primary pb-alert-banner__btn">
              <CreditCard size={16} />
              Pay Now
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className="pb-stats-row">
            {STAT_CARDS.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {/* ── Two-Column Row ── */}
          <div className="pb-two-col">
            {/* Subscription Plan */}
            <div className="pb-card pb-plan-card">
              <div className="pb-card__header">
                <div className="pb-card__header-text">
                  <h2 className="pb-card__title">Subscription Plan</h2>
                  <p className="pb-card__subtitle">Manage your current plan and billing details</p>
                </div>
                <span className="pb-badge pb-badge--active">
                  <CheckCircle2 size={12} />
                  Current Active
                </span>
              </div>

              <div className="pb-plan-features">
                {PLAN_FEATURES.map((feat) => (
                  <div key={feat.label} className="pb-feature-row">
                    <span className="pb-feature-row__label">{feat.label}</span>
                    <span className="pb-feature-row__value">{feat.value}</span>
                  </div>
                ))}
              </div>

              <div className="pb-plan-cost">
                <span className="pb-plan-cost__label">Total Cost</span>
                <span className="pb-plan-cost__value">LKR 5,000<span className="pb-plan-cost__period">/mo</span></span>
              </div>

              <div className="pb-plan-actions">
                <button type="button" className="btn btn-primary">
                  <Sparkles size={16} />
                  Upgrade Plan
                </button>
                <button
                  type="button"
                  className="pb-link-btn--danger"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Subscription
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="pb-card pb-payment-card">
              <div className="pb-card__header">
                <div className="pb-card__header-text">
                  <h2 className="pb-card__title">Payment Method</h2>
                  <p className="pb-card__subtitle">Your default billing card</p>
                </div>
              </div>

              <div className="pb-cc-visual">
                <div className="pb-cc-visual__top">
                  <div className="pb-cc-visual__chip">
                    <div className="pb-cc-visual__chip-lines" />
                  </div>
                  <span className="pb-badge pb-badge--default">Default</span>
                </div>
                <span className="pb-cc-visual__number">**** **** **** 4829</span>
                <div className="pb-cc-visual__bottom">
                  <div className="pb-cc-visual__field">
                    <span className="pb-cc-visual__field-label">Card Holder</span>
                    <span className="pb-cc-visual__field-value">R. Perera</span>
                  </div>
                  <div className="pb-cc-visual__field">
                    <span className="pb-cc-visual__field-label">Expires</span>
                    <span className="pb-cc-visual__field-value">09/28</span>
                  </div>
                  <div className="pb-cc-visual__network">VISA</div>
                </div>
              </div>

              <button type="button" className="btn btn-outline pb-change-card-btn">
                <CreditCard size={16} />
                Change Payment Method
              </button>
            </div>
          </div>

          {/* ── Transaction History ── */}
          <div className="pb-table-card">
            <div className="pb-table-card__header">
              <div className="pb-table-card__header-text">
                <h2 className="pb-card__title">Transaction History</h2>
                <p className="pb-card__subtitle">View and download your past invoices</p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="pb-toolbar">
              <div className="pb-toolbar__search">
                <Search size={16} className="pb-toolbar__search-icon" />
                <input
                  className="pb-toolbar__search-input"
                  type="text"
                  placeholder="Search Invoice No..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="pb-toolbar__right">
                <div className="pb-toolbar__filter">
                  <select
                    className="pb-toolbar__select"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="pb-table-wrap">
              <table className="pb-table">
                <thead>
                  <tr>
                    <th>INVOICE NO</th>
                    <th>DATE</th>
                    <th>PLAN NAME</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx) => (
                    <tr key={tx.id} className="pb-table__row">
                      <td>
                        <span className="pb-table__invoice">{tx.id}</span>
                      </td>
                      <td>
                        <span className="pb-table__date">{tx.date}</span>
                      </td>
                      <td>
                        <span className="pb-table__plan">{tx.plan}</span>
                      </td>
                      <td>
                        <span className="pb-table__amount">{tx.amount}</span>
                      </td>
                      <td>
                        <TxStatusBadge status={tx.status} />
                      </td>
                      <td>
                        <div className="pb-table__actions">
                          <button
                            type="button"
                            className="pb-table__action-btn"
                            aria-label={`Download invoice ${tx.id}`}
                          >
                            <Download size={16} />
                          </button>
                          <button
                            type="button"
                            className="pb-table__action-btn"
                            aria-label={`More options for ${tx.id}`}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="pb-table__empty">
                        No transactions match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="pb-pagination">
              <span className="pb-pagination__info">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
                {filtered.length} transactions
              </span>
              <div className="pb-pagination__controls">
                <button
                  type="button"
                  className="pb-pagination__btn"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="pb-pagination__pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`pb-pagination__page ${p === safePage ? 'pb-pagination__page--active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="pb-pagination__btn"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="pb-pagination__per-page">
                <span className="pb-pagination__per-page-label">Items per page</span>
                <select className="pb-pagination__per-page-select" defaultValue="6">
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="pb-footer">
            <div className="pb-footer__logo">
              <span className="sidebar-logo__box">IH</span>
              <span className="sidebar-logo__wordmark">IntelliHire</span>
            </div>
            <div className="pb-footer__links">
              <a href="#privacy" className="pb-footer__link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <a href="#cookies" className="pb-footer__link" onClick={(e) => e.preventDefault()}>Cookie Policy</a>
              <a href="#support" className="pb-footer__link" onClick={(e) => e.preventDefault()}>Support</a>
              <a href="#employer" className="pb-footer__link" onClick={(e) => e.preventDefault()}>Employer Login</a>
            </div>
            <p className="pb-footer__copy">&copy; 2026 IntelliHire. All rights reserved.</p>
          </footer>
        </main>
      </div>

      {/* ── Cancel Subscription Modal ── */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Cancel Subscription</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowCancelModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to cancel your <strong>Professional</strong> subscription?
                You will lose access to premium features including AI Matching, advanced analytics,
                and priority support at the end of your current billing period.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Subscription
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: 'var(--crisis)', color: '#FFFFFF' }}
                onClick={() => setShowCancelModal(false)}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentBillingPage;
