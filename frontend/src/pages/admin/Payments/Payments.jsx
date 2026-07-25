import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Filter,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Briefcase,
  RefreshCcw,
  ArrowLeft,
} from 'lucide-react';
import AdminSidebar from '../../../components/common/AdminSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import './Payments.css';

// ── Mock transaction data ─────────────────────────────────────────────
const ALL_TRANSACTIONS = [
  {
    id: 'TXN-8821-09',
    jobTitle: 'Senior Frontend Engineer - React',
    jobSub: 'Standard Placement Fee',
    date: 'Oct 24, 2023, 14:30',
    amount: 450.0,
    status: 'paid',
  },
  {
    id: 'TXN-8712-15',
    jobTitle: 'Fullstack Developer (Nodejs/AWS)',
    jobSub: 'Standard Placement Fee',
    date: 'Oct 22, 2023, 09:15',
    amount: 980.0,
    status: 'refunded',
  },
  {
    id: 'TXN-8605-22',
    jobTitle: 'Product Designer - Fintech',
    jobSub: 'Standard Placement Fee',
    date: 'Oct 20, 2023, 11:45',
    amount: 750.0,
    status: 'paid',
  },
  {
    id: 'TXN-8591-11',
    jobTitle: 'DevOps Engineer - Kubernetes',
    jobSub: 'Standard Placement Fee',
    date: 'Oct 18, 2023, 16:20',
    amount: 550.0,
    status: 'pending',
  },
  {
    id: 'TXN-8423-04',
    jobTitle: 'Mobile App Lead (Swift/Kotlin)',
    jobSub: 'Standard Placement Fee',
    date: 'Oct 15, 2023, 10:05',
    amount: 200.0,
    status: 'paid',
  },
  {
    id: 'TXN-8310-18',
    jobTitle: 'Data Scientist - ML Platform',
    jobSub: 'Standard Placement Fee',
    date: 'Oct 12, 2023, 13:00',
    amount: 900.0,
    status: 'paid',
  },
  {
    id: 'TXN-8205-07',
    jobTitle: 'Cloud Architect - GCP',
    jobSub: 'Standard Placement Fee',
    date: 'Oct 09, 2023, 08:45',
    amount: 1200.0,
    status: 'failed',
  },
  {
    id: 'TXN-8100-33',
    jobTitle: 'Product Manager - SaaS',
    jobSub: 'Standard Placement Fee',
    date: 'Oct 06, 2023, 17:30',
    amount: 650.0,
    status: 'paid',
  },
  {
    id: 'TXN-7988-21',
    jobTitle: 'Security Engineer - Zero Trust',
    jobSub: 'Standard Placement Fee',
    date: 'Oct 03, 2023, 11:10',
    amount: 800.0,
    status: 'refunded',
  },
];

const ITEMS_PER_PAGE = 5;
const STATUS_TABS = ['All', 'Paid', 'Failed', 'Refunded'];

const fmt = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Main Component ────────────────────────────────────────────────────
function Payments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [dateRange, setDateRange] = useState('30d');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter transactions
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return ALL_TRANSACTIONS.filter((t) => {
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.jobTitle.toLowerCase().includes(q);
      const matchStatus =
        activeStatus === 'All' ||
        t.status === activeStatus.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [searchQuery, activeStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatusChange = (tab) => {
    setActiveStatus(tab);
    setCurrentPage(1);
  };

  const handleDownload = (txn) => {
    alert(`Downloading receipt for ${txn.id}`);
  };

  const handleExport = () => {
    const csv =
      'Transaction ID,Job Title,Date,Amount,Status\n' +
      filtered
        .map((t) => `${t.id},"${t.jobTitle}",${t.date},${fmt(t.amount)},${t.status}`)
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // KPI computations
  const totalSpent = ALL_TRANSACTIONS.filter((t) => t.status === 'paid').reduce(
    (s, t) => s + t.amount,
    0
  );
  const activePlacements = ALL_TRANSACTIONS.filter((t) => t.status === 'paid').length;
  const pendingRefunds = ALL_TRANSACTIONS.filter((t) => t.status === 'refunded').reduce(
    (s, t) => s + t.amount,
    0
  );

  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Payments"
      />

      <div className="admin-dashboard__main payments-page">
        {/* Standard TopBar */}
        <TopBar
          user={{ name: 'John Doe', role: 'Administrator' }}
          notificationsCount={2}
          searchPlaceholder="Search transactions, recruiters..."
          onSearch={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        {/* Scrollable content */}
        <div className="payments-main">
          {/* ── Page Header ── */}
          <div className="payments-header">
            <div className="payments-header__left">
              <Link to="/admin/dashboard" className="payments-back-link">
                <ArrowLeft size={12} />
                Back to Dashboard
              </Link>
              <h1 className="payments-title">Transaction History</h1>
            </div>
          </div>

          {/* ── Filter Bar ── */}
          <div className="payments-filter-bar">
            {/* Search */}
            <div className="payments-filter-group">
              <span className="payments-filter-label">Search Transactions</span>
              <div className="payments-search-wrapper">
                <Search size={15} className="payments-search-icon" />
                <input
                  className="payments-search-input"
                  type="text"
                  placeholder="Transaction ID, Job Title..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="payments-filter-group">
              <span className="payments-filter-label">Status Filter</span>
              <div className="payments-status-tabs">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`payments-status-tab ${activeStatus === tab ? 'active' : ''}`}
                    onClick={() => handleStatusChange(tab)}
                    type="button"
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="payments-filter-group">
              <span className="payments-filter-label">Date Range</span>
              <div className="payments-date-wrapper">
                <div className="payments-date-select-wrap">
                  <Calendar size={14} className="payments-date-icon" />
                  <select
                    className="payments-date-select"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                <button className="payments-filter-btn" onClick={handleExport} aria-label="Export transactions">
                  <Filter size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Transaction Table ── */}
          <div className="payments-table-card">
            <div className="payments-table-wrapper">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Job Title / Placement</th>
                    <th>Date &amp; Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((txn) => (
                      <tr key={txn.id}>
                        {/* Transaction ID */}
                        <td>
                          <div className="txn-id-cell">
                            <span className={`txn-dot ${txn.status}`} />
                            <span className="txn-id-text">{txn.id}</span>
                          </div>
                        </td>

                        {/* Job Title */}
                        <td>
                          <span className="txn-job-title">{txn.jobTitle}</span>
                          <span className="txn-job-sub">{txn.jobSub}</span>
                        </td>

                        {/* Date */}
                        <td className="txn-date">{txn.date}</td>

                        {/* Amount */}
                        <td className="txn-amount">{fmt(txn.amount)}</td>

                        {/* Status */}
                        <td>
                          {txn.status !== 'pending' ? (
                            <span className={`txn-status-badge ${txn.status}`}>
                              <span className="txn-status-dot" />
                              {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                            </span>
                          ) : (
                            <span className="txn-status-badge pending">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="txn-actions-cell">
                            <button
                              className="txn-action-btn"
                              onClick={() => handleDownload(txn)}
                              aria-label={`Download receipt for ${txn.id}`}
                              title="Download receipt"
                            >
                              <Download size={15} />
                            </button>
                            <button
                              className="txn-action-btn"
                              aria-label="More actions"
                            >
                              <MoreVertical size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}
                      >
                        No transactions match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="payments-table-footer">
              <span className="payments-table-info">
                Showing {Math.min(filtered.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}–
                {Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)} of {filtered.length} transactions
              </span>
              <div className="payments-pagination">
                <button
                  className="pay-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pay-page-btn ${currentPage === p ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                {totalPages > 3 && (
                  <>
                    <span className="pay-page-ellipsis">…</span>
                    <button className="pay-page-btn" onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  className="pay-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Bottom KPI Cards ── */}
          <div className="payments-kpi-row">
            <div className="payments-kpi-card">
              <div className="payments-kpi-card__top">
                <span className="payments-kpi-label">Total Spent</span>
                <div className="payments-kpi-icon"><CreditCard size={16} /></div>
              </div>
              <div className="payments-kpi-value">{fmt(totalSpent)}</div>
              <span className="payments-kpi-sub positive">↗ 7.2% increase from last month</span>
            </div>

            <div className="payments-kpi-card">
              <div className="payments-kpi-card__top">
                <span className="payments-kpi-label">Active Placements</span>
                <div className="payments-kpi-icon"><Briefcase size={16} /></div>
              </div>
              <div className="payments-kpi-value">{activePlacements}</div>
              <span className="payments-kpi-sub">Processing 4 new invoices</span>
            </div>

            <div className="payments-kpi-card">
              <div className="payments-kpi-card__top">
                <span className="payments-kpi-label">Pending Refunds</span>
                <div className="payments-kpi-icon"><RefreshCcw size={16} /></div>
              </div>
              <div className="payments-kpi-value">{fmt(pendingRefunds)}</div>
              <span className="payments-kpi-sub">Awaiting confirmation</span>
            </div>
          </div>
        </div>

        {/* ── Page Footer ── */}
        <footer className="payments-footer">
          <span className="payments-footer__left">
            © 2024 IntelliHire Financial Corp
          </span>
          <nav className="payments-footer__links">
            <a href="#privacy" className="payments-footer__link">Privacy Policy</a>
            <a href="#terms" className="payments-footer__link">Terms of Service</a>
          </nav>
          <div className="payments-footer__right">
            <span className="payments-status-dot-live" />
            Systems Operational — v2.4.5-STABLE
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Payments;


