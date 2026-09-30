import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  AlertCircle,
  RefreshCcw,
  Clock
} from 'lucide-react';
import AdminSidebar from '../../../components/common/AdminSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import TransactionDetailsModal from './TransactionDetailsModal';

import AdminToast from '../../../components/common/AdminToast';
import { getTransactions, saveTransactions } from '../../../services/adminStorage';
import './Payments.css';

// ── Mock transaction data ─────────────────────────────────────────────
const ALL_TRANSACTIONS = [
  {
    id: 'TRX-9821-XP',
    company: 'TechFlow Systems',
    jobTitle: 'Senior Frontend Engineer (Contract)',
    date: 'Oct 24, 2023 - 14:32 PM',
    amount: 13695.0,
    status: 'successful',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TF',
  },
  {
    id: 'TRX-8742-LQ',
    company: 'Green Horizon Ltd',
    jobTitle: 'Sustainability Consultant',
    date: 'Oct 23, 2023 - 09:15 AM',
    amount: 850.0,
    status: 'failed',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=GH',
  },
  {
    id: 'TRX-7651-KM',
    company: 'Nexus Creative',
    jobTitle: 'Creative Director',
    date: 'Oct 22, 2023 - 11:45 AM',
    amount: 2100.0,
    status: 'successful',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=NC',
  },
  {
    id: 'TRX-5439-RS',
    company: 'Stellar Fintech',
    jobTitle: 'Product Manager',
    date: 'Oct 21, 2023 - 10:05 AM',
    amount: 1800.0,
    status: 'pending',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=SF',
  },
];


const STATUS_FILTERS = ['All Status', 'successful', 'failed', 'pending'];

const fmt = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Payments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Initialize from localStorage; seeds with ALL_TRANSACTIONS on first visit
  const [transactions, setTransactions] = useState(() => getTransactions(ALL_TRANSACTIONS));
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef(null);

  // ── Live KPI stats computed from current transaction data ──
  const kpiStats = useMemo(() => {
    const successful = transactions.filter(t => t.status === 'successful');
    const failed     = transactions.filter(t => t.status === 'failed');
    const totalRevenue  = successful.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    return {
      totalRevenue: totalRevenue || 142384.5,
      totalCount:   transactions.length || 1284,
      failedCount:  failed.length,
    };
  }, [transactions]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);


  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return transactions.filter((t) => {
      const matchesStatus = statusFilter === 'All Status' || t.status === statusFilter;
      const matchesQuery =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q) ||
        t.jobTitle.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [searchQuery, statusFilter, transactions]);

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
          onSearch={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <div className="payments-main">
          
          {/* Banner */}
          <div className="txn-banner">
            <h1 className="txn-banner-title">Transaction History</h1>
            <p className="txn-banner-desc">
              Monitor global revenue streams and manage recruiter payouts with high-precision financial tracking tools.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="txn-kpis">
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">TOTAL REVENUE</span>
                <div className="txn-kpi-icon"><DollarSign size={16} /></div>
              </div>
              <div className="txn-kpi-val">{fmt(kpiStats.totalRevenue)}</div>
              <div className="txn-kpi-sub positive">↗ +12.5% from last month</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">TOTAL TRANSACTIONS</span>
                <div className="txn-kpi-icon"><CreditCard size={16} /></div>
              </div>
              <div className="txn-kpi-val">{kpiStats.totalCount.toLocaleString()}</div>
              <div className="txn-kpi-sub positive">↗ +8.2% from last month</div>
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
                    <div className="txn-filter-menu" role="menu" aria-label="Transaction status filter">
                      <div className="txn-filter-menu__title">Status</div>
                      {STATUS_FILTERS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`txn-filter-menu__item ${statusFilter === option ? 'active' : ''}`}
                          onClick={() => {
                            setStatusFilter(option);
                            setCurrentPage(1);
                            setShowFilterMenu(false);
                          }}
                        >
                          {option === 'All Status' ? 'All Status' : option.charAt(0).toUpperCase() + option.slice(1)}
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
                  {filtered.map(t => (
                    <tr key={t.id} onClick={() => setSelectedTransaction(t)} style={{cursor: 'pointer'}}>
                      <td>
                        <div className="txn-cell-company">
                          <img src={t.logo} alt="" className="txn-company-logo" />
                          <span>{t.company}</span>
                        </div>
                      </td>
                      <td className="txn-cell-muted">{t.id}</td>
                      <td>{t.jobTitle}</td>
                      <td className="txn-cell-muted">{t.date}</td>
                      <td className="txn-cell-strong">{fmt(t.amount)}</td>

                      <td>
                        <button className="txn-action-btn" onClick={(e) => { e.stopPropagation(); setSelectedTransaction(t); }}>
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="txn-pagination">
              <div className="txn-page-info">Showing <strong>1-5</strong> of 1284 transactions</div>
              <div className="txn-page-controls">
                <button className="txn-page-btn"><ChevronLeft size={14} /></button>
                <button className="txn-page-btn active">1</button>
                <button className="txn-page-btn">2</button>
                <button className="txn-page-btn">3</button>
                <span className="txn-page-dots">...</span>
                <button className="txn-page-btn">42</button>
                <button className="txn-page-btn"><ChevronRight size={14} /></button>
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



    </div>
  );
}
