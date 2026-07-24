import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreVertical,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Tag,
  ArrowUpRight,
  Receipt,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './PaymentBillingPage.css';

const STAT_CARDS = [
  { icon: Tag, label: 'CURRENT PLAN', value: 'Professional', sub: 'Monthly billing', variant: 'gold' },
  { icon: Calendar, label: 'NEXT BILLING DATE', value: '24 Aug 2026', sub: 'Automatic renewal', variant: 'info' },
  { icon: DollarSign, label: 'AMOUNT DUE', value: 'LKR 5,000', sub: 'Includes taxes', variant: 'success' },
  { icon: Shield, label: 'PAYMENT STATUS', value: 'Active', sub: 'Standing: Good', variant: 'success' },
];

const PLAN_FEATURES = [
  { label: 'Monthly Active Jobs', value: 'Up to 25' },
  { label: 'Applicant Limit', value: 'Unlimited' },
  { label: 'AI Matching Speed', value: '2x Priority' },
  { label: 'Analytics Dashboard', value: 'Advanced' },
  { label: 'Support Level', value: 'Priority 24/7' },
];

const TRANSACTIONS = [
  { id: 'INV-2026-024', date: '24 Jul 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'paid' },
  { id: 'INV-2026-023', date: '24 Jun 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'paid' },
  { id: 'INV-2026-022', date: '24 May 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'paid' },
  { id: 'INV-2026-021', date: '24 Apr 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'paid' },
  { id: 'INV-2026-020', date: '24 Mar 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'failed' },
  { id: 'INV-2026-019', date: '24 Feb 2026', plan: 'Professional', amount: 'LKR 5,000', status: 'refunded' },
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
      {sub && <span className={`pb-stat-card__sub ${sub === 'Standing: Good' ? 'pb-stat-card__sub--success' : ''}`}>{sub}</span>}
    </div>
  );
}

function TxStatusBadge({ status }) {
  const map = {
    paid: { className: 'pb-badge pb-badge--paid', label: 'Paid', icon: CheckCircle },
    failed: { className: 'pb-badge pb-badge--failed', label: 'Failed', icon: XCircle },
    refunded: { className: 'pb-badge pb-badge--refunded', label: 'Refunded', icon: RotateCcw },
  };
  const { className, label, icon: StatusIcon } = map[status] || map.paid;
  return (
    <span className={className}>
      <StatusIcon size={12} />
      {label}
    </span>
  );
}

function PaymentBillingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let list = TRANSACTIONS;
    if (statusFilter !== 'All Status') {
      list = list.filter((t) => t.status === statusFilter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.id.toLowerCase().includes(q));
    }
    return list;
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
          searchPlaceholder="Search payments…"
          onSearch={(q) => console.log('Search:', q)}
          onNotificationClick={() => console.log('Notifications clicked')}
          onLogout={() => console.log('Logout')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="pb-content">
          {/* ── Section A: Alert Banner ── */}
          <div className="pb-alert-banner">
            <div className="pb-alert-banner__icon">
              <Clock size={20} />
            </div>
            <div className="pb-alert-banner__body">
              <h3 className="pb-alert-banner__title">Next Payment Due</h3>
              <p className="pb-alert-banner__text">
                Your next billing of <strong>LKR 5,000</strong> is scheduled for <strong>24 Aug 2026</strong>.
                Ensure your payment method has sufficient funds.
              </p>
            </div>
            <button type="button" className="btn btn-primary">
              Pay Now
            </button>
          </div>

          {/* ── Section B: Stat Cards ── */}
          <div className="pb-stats-row">
            {STAT_CARDS.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {/* ── Section C: Two-Column Row ── */}
          <div className="pb-two-col">
            {/* Subscription Plan */}
            <div className="pb-card pb-plan-card">
              <div className="pb-card__header">
                <div>
                  <h2 className="pb-card__title">Subscription Plan</h2>
                  <p className="pb-card__subtitle">Your current plan and included features</p>
                </div>
                <span className="pb-badge pb-badge--active">Current Active</span>
              </div>

              <div className="pb-feature-list">
                {PLAN_FEATURES.map((f) => (
                  <div className="pb-feature-row" key={f.label}>
                    <span className="pb-feature-row__label">{f.label}</span>
                    <span className="pb-feature-row__value">{f.value}</span>
                  </div>
                ))}
              </div>

              <div className="pb-cost-panel">
                <span className="pb-cost-panel__label">Total Cost</span>
                <span className="pb-cost-panel__value">LKR 5,000<span className="pb-cost-panel__unit">/mo</span></span>
              </div>

              <div className="pb-card__actions">
                <button type="button" className="btn btn-primary">
                  Upgrade Plan
                </button>
                <button
                  type="button"
                  className="btn btn-ghost pb-btn-danger"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Subscription
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="pb-card pb-method-card">
              <div className="pb-card__header">
                <div>
                  <h2 className="pb-card__title">Payment Method</h2>
                  <p className="pb-card__subtitle">Manage your default payment method</p>
                </div>
              </div>

              <div className="pb-payment-visual">
                <div className="pb-payment-visual__top">
                  <CreditCard size={22} />
                  <span className="pb-badge pb-badge--default">Default</span>
                </div>
                <div className="pb-payment-visual__number">
                  **** **** **** 4829
                </div>
                <div className="pb-payment-visual__bottom">
                  <div>
                    <span className="pb-payment-visual__label">Card Holder</span>
                    <span className="pb-payment-visual__val">K. Perera</span>
                  </div>
                  <div>
                    <span className="pb-payment-visual__label">Expires</span>
                    <span className="pb-payment-visual__val">09/28</span>
                  </div>
                  <div className="pb-payment-visual__network">
                    VISA
                  </div>
                </div>
              </div>

              <button type="button" className="btn btn-outline pb-btn-full">
                <ArrowUpRight size={16} />
                Change Payment Method
              </button>
            </div>
          </div>

          {/* ── Section D: Transaction History ── */}
          <div className="pb-table-card">
            <div className="pb-card__header">
              <div>
                <h2 className="pb-card__title">Transaction History</h2>
                <p className="pb-card__subtitle">View and download your past invoices and payments</p>
              </div>
            </div>

            <div className="pb-toolbar">
              <div className="pb-toolbar__search">
                <Search size={16} className="pb-toolbar__search-icon" />
                <input
                  className="pb-toolbar__search-input"
                  type="text"
                  placeholder="Search Invoice No..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <div className="pb-toolbar__right">
                <div className="pb-toolbar__filter">
                  <select
                    className="pb-toolbar__select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  >
                    <option>All Status</option>
                    <option>Paid</option>
                    <option>Failed</option>
                    <option>Refunded</option>
                  </select>
                </div>
              </div>
            </div>

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
                  {paginated.map((t) => (
                    <tr key={t.id} className="pb-table__row">
                      <td>
                        <div className="pb-table__invoice-cell">
                          <Receipt size={14} />
                          <span className="pb-table__invoice-id">{t.id}</span>
                        </div>
                      </td>
                      <td><span className="pb-table__date">{t.date}</span></td>
                      <td><span className="pb-table__plan">{t.plan}</span></td>
                      <td><span className="pb-table__amount">{t.amount}</span></td>
                      <td><TxStatusBadge status={t.status} /></td>
                      <td>
                        <div className="pb-table__actions">
                          <button type="button" className="pb-table__action-btn" aria-label={`Download ${t.id}`}>
                            <Download size={15} />
                          </button>
                          <button type="button" className="pb-table__action-btn" aria-label={`More options for ${t.id}`}>
                            <MoreVertical size={15} />
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
            </div>
          </div>
        </main>
      </div>

      {/* ── Cancel Subscription Modal ── */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--comm-surface, #1A1B27)' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--comm-text-primary, #FFFFFF)' }}>Cancel Subscription</h3>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ color: 'var(--comm-text-secondary, #9599A6)' }}>
              <div className="pb-cancel-warning">
                <AlertTriangle size={20} />
                <span>Are you sure you want to cancel your Professional plan?</span>
              </div>
              <p style={{ marginTop: 12 }}>
                You will lose access to premium features including AI Matching, Advanced Analytics,
                and Priority Support at the end of your current billing period.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowCancelModal(false)}>
                Keep Subscription
              </button>
              <button type="button" className="btn pb-btn-confirm-cancel">
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentBillingPage;
