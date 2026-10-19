import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  FileCheck2,
  XCircle,
  RefreshCcw,
  Eye,
} from 'lucide-react';
import AdminSidebar from '../../../components/common/AdminSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import TransactionDetailsModal from './TransactionDetailsModal';
import PaymentReviewModal from './PaymentReviewModal';

import AdminToast from '../../../components/common/AdminToast';
import { appendAuditLog } from '../../../services/adminStorage';
import {
  getAdminPayments,
  getAdminPaymentStats,
  reviewPayment,
} from '../../../api/paymentApi';
import './Payments.css';

const PAGE_SIZE = 5;

const STATUS_FILTERS = ['All Status', 'successful', 'failed', 'pending'];

const DB_TO_DISPLAY_STATUS = {
  paid: 'successful',
  rejected: 'failed',
  pending: 'pending',
};

const DISPLAY_STATUS_LABELS = {
  successful: 'Successful',
  failed: 'Failed',
  pending: 'Pending',
};

const initials = (value = '') => {
  const trimmed = String(value).trim();
  if (!trimmed) return 'NA';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const formatMoney = (amount, currency = 'LKR') => {
  const value = Number(amount) || 0;
  return `${currency} ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapPayment = (payment) => ({
  rawId: payment.id,
  id: payment.payment_reference || `PAY-${payment.id}`,
  company: payment.company_name || payment.recruiter_name || 'Unknown recruiter',
  jobTitle: payment.vacancy_title || 'Untitled vacancy',
  date: formatDateTime(payment.created_at),
  amount: Number(payment.amount) || 0,
  currency: payment.currency || 'LKR',
  status: DB_TO_DISPLAY_STATUS[payment.status] || payment.status,
  dbStatus: payment.status,
  logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    initials(payment.company_name || payment.recruiter_name)
  )}`,
  recruiterName: payment.recruiter_name || '—',
  recruiterEmail: payment.recruiter_email || '',
  method: payment.payment_method === 'bank_transfer' ? 'Bank Transfer' : payment.payment_method,
  proofFilename: payment.proof_filename || '',
  rejectionReason: payment.rejection_reason || '',
  reviewedAt: payment.reviewed_at,
  vacancyStatus: payment.vacancy_status,
  raw: payment,
});

export default function Payments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef(null);

  const loadData = useCallback(async ({ showSpinner = false } = {}) => {
    if (showSpinner) setLoading(true);
    else setRefreshing(true);
    try {
      const [listResponse, statsResponse] = await Promise.all([
        getAdminPayments({ status: 'all', limit: 100 }),
        getAdminPaymentStats(),
      ]);
      setPayments((listResponse.payments || []).map(mapPayment));
      setStats(statsResponse.stats || null);
      setLoadError('');
    } catch (error) {
      setLoadError(
        error.response?.data?.message || 'Failed to load payment data. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData({ showSpinner: true });
  }, [loadData]);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const pendingPayments = useMemo(
    () => payments.filter((payment) => payment.dbStatus === 'pending'),
    [payments]
  );

  const kpiStats = useMemo(() => {
    const totalRevenue = Number(stats?.total_revenue) || 0;
    const totalCount = Number(stats?.total_count) || 0;
    const pendingCount = Number(stats?.pending_count) || 0;
    const rejectedCount = Number(stats?.rejected_count) || 0;
    return { totalRevenue, totalCount, pendingCount, rejectedCount };
  }, [stats]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return payments.filter((t) => {
      const matchesStatus = statusFilter === 'All Status' || t.status === statusFilter;
      const matchesQuery =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q) ||
        t.jobTitle.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [searchQuery, statusFilter, payments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleApprove = async (payment) => {
    setBusyId(payment.rawId);
    try {
      await reviewPayment(payment.rawId, { action: 'approve' });
      appendAuditLog({ actionType: 'PAYMENT_APPROVED', module: 'Payments' });
      setToast({
        type: 'success',
        message: `Payment ${payment.id} approved. The vacancy is now published.`,
      });
      setReviewTarget(null);
      await loadData();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to approve payment.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (payment, reason) => {
    setBusyId(payment.rawId);
    try {
      await reviewPayment(payment.rawId, { action: 'reject', reason });
      appendAuditLog({ actionType: 'PAYMENT_REJECTED', module: 'Payments' });
      setToast({ type: 'success', message: `Payment ${payment.id} rejected.` });
      setReviewTarget(null);
      await loadData();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to reject payment.',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Payments"
      />

      <div className="admin-dashboard__main payments-page">
        <TopBar
          user={{ name: 'John Doe', role: 'Administrator' }}
          notificationsCount={2}
          searchPlaceholder="Search transactions, recruiters..."
          onSearch={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <div className="payments-main">
          {/* Banner */}
          <div className="txn-banner">
            <h1 className="txn-banner-title">Transaction History</h1>
            <p className="txn-banner-desc">
              Verify recruiter bank-transfer slips, monitor revenue streams and manage
              payments with high-precision financial tracking tools.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="txn-kpis">
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">TOTAL REVENUE</span>
                <div className="txn-kpi-icon">
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="txn-kpi-val">{formatMoney(kpiStats.totalRevenue)}</div>
              <div className="txn-kpi-sub positive">Confirmed bank transfers</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">TOTAL TRANSACTIONS</span>
                <div className="txn-kpi-icon">
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="txn-kpi-val">{kpiStats.totalCount.toLocaleString()}</div>
              <div className="txn-kpi-sub">All submitted slips</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">PENDING VERIFICATIONS</span>
                <div className="txn-kpi-icon">
                  <FileCheck2 size={16} />
                </div>
              </div>
              <div className="txn-kpi-val">{kpiStats.pendingCount.toLocaleString()}</div>
              <div className="txn-kpi-sub negative">Awaiting admin review</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">REJECTED</span>
                <div className="txn-kpi-icon">
                  <XCircle size={16} />
                </div>
              </div>
              <div className="txn-kpi-val">{kpiStats.rejectedCount.toLocaleString()}</div>
              <div className="txn-kpi-sub">Slips that failed review</div>
            </div>
          </div>

          {/* ── Bank Transfer Verifications (pending slips) ── */}
          <div className="txn-table-section">
            <div className="txn-table-controls">
              <div className="txn-verify-heading">
                <span className="txn-verify-heading__title">BANK TRANSFER VERIFICATIONS</span>
                <span className="txn-verify-heading__count">
                  {pendingPayments.length} pending
                </span>
              </div>
              <button
                type="button"
                className="txn-btn-outline"
                onClick={() => loadData()}
                disabled={refreshing}
              >
                <RefreshCcw size={14} className={refreshing ? 'spin' : ''} /> REFRESH
              </button>
            </div>

            <div className="txn-table-wrapper">
              <table className="txn-table">
                <thead>
                  <tr>
                    <th>RECRUITER / COMPANY</th>
                    <th>JOB TITLE</th>
                    <th>REFERENCE</th>
                    <th>AMOUNT</th>
                    <th>UPLOADED</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={7} className="txn-empty">Loading payment slips…</td>
                    </tr>
                  )}
                  {!loading && pendingPayments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="txn-empty">
                        No pending bank-transfer slips awaiting verification.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    pendingPayments.map((payment) => (
                      <tr key={payment.rawId}>
                        <td>
                          <div className="txn-cell-company">
                            <img src={payment.logo} alt="" className="txn-company-logo" />
                            <span>{payment.company}</span>
                          </div>
                        </td>
                        <td>{payment.jobTitle}</td>
                        <td className="txn-cell-muted">{payment.id}</td>
                        <td className="txn-cell-strong">
                          {formatMoney(payment.amount, payment.currency)}
                        </td>
                        <td className="txn-cell-muted">{payment.date}</td>
                        <td>
                          <span className="txn-status pending">
                            <span className="txn-status-dot" /> Pending
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="txn-btn-review"
                            onClick={() => setReviewTarget(payment)}
                          >
                            <Eye size={14} /> Review
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Controls & Table */}
          <div className="txn-table-section">
            <div className="txn-table-controls">
              <div className="txn-search">
                <Search size={16} className="txn-search-icon" />
                <input
                  type="text"
                  placeholder="Search by Company Name or Transaction ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="txn-actions">
                <div className="txn-filter-wrap" ref={filterMenuRef}>
                  <button
                    className="txn-btn-outline"
                    type="button"
                    onClick={() => setShowFilterMenu((prev) => !prev)}
                    aria-haspopup="menu"
                    aria-expanded={showFilterMenu}
                  >
                    <Filter size={16} /> FILTER
                  </button>

                  {showFilterMenu && (
                    <div
                      className="txn-filter-menu"
                      role="menu"
                      aria-label="Transaction status filter"
                    >
                      <div className="txn-filter-menu__title">Status</div>
                      {STATUS_FILTERS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`txn-filter-menu__item ${
                            statusFilter === option ? 'active' : ''
                          }`}
                          onClick={() => {
                            setStatusFilter(option);
                            setCurrentPage(1);
                            setShowFilterMenu(false);
                          }}
                        >
                          {option === 'All Status'
                            ? 'All Status'
                            : DISPLAY_STATUS_LABELS[option] || option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="txn-table-wrapper">
              <table className="txn-table">
                <thead>
                  <tr>
                    <th>COMPANY</th>
                    <th>TRANSACTION ID</th>
                    <th>JOB TITLE</th>
                    <th>DATE</th>
                    <th>AMOUNT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="txn-empty">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                  {paginated.map((t) => (
                    <tr
                      key={t.rawId}
                      onClick={() => setSelectedTransaction(t)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="txn-cell-company">
                          <img src={t.logo} alt="" className="txn-company-logo" />
                          <span>{t.company}</span>
                        </div>
                      </td>
                      <td className="txn-cell-muted">{t.id}</td>
                      <td>{t.jobTitle}</td>
                      <td className="txn-cell-muted">{t.date}</td>
                      <td className="txn-cell-strong">
                        {formatMoney(t.amount, t.currency)}
                      </td>
                      <td>
                        <button
                          className="txn-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(t);
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="txn-pagination">
              <div className="txn-page-info">
                Showing <strong>{paginated.length}</strong> of {filtered.length} transactions
                {loadError ? ` — ${loadError}` : ''}
              </div>
              <div className="txn-page-controls">
                <button
                  className="txn-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                  )
                  .map((page, index, arr) => (
                    <React.Fragment key={page}>
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="txn-page-dots">...</span>
                      )}
                      <button
                        className={`txn-page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  className="txn-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* Payment Review Modal */}
      <PaymentReviewModal
        payment={reviewTarget}
        busy={busyId != null && reviewTarget != null && busyId === reviewTarget.rawId}
        onClose={() => setReviewTarget(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
