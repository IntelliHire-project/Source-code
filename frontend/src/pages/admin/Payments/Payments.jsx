import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
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
import './Payments.css';

// ── Mock transaction data ─────────────────────────────────────────────
const ALL_TRANSACTIONS = [
  {
    id: 'TRX-9821-XP',
    company: 'TechFlow Systems',
    jobTitle: 'Senior Frontend Engineer',
    date: 'Oct 24, 2023',
    amount: 1250.0,
    status: 'successful',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TF',
  },
  {
    id: 'TRX-8742-LQ',
    company: 'Green Horizon Ltd',
    jobTitle: 'Sustainability Consultant',
    date: 'Oct 23, 2023',
    amount: 850.0,
    status: 'failed',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=GH',
  },
  {
    id: 'TRX-7651-KM',
    company: 'Nexus Creative',
    jobTitle: 'Creative Director',
    date: 'Oct 22, 2023',
    amount: 2100.0,
    status: 'successful',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=NC',
  },
  {
    id: 'TRX-6548-JT',
    company: 'DataPulse AI',
    jobTitle: 'ML Operations Specialist',
    date: 'Oct 22, 2023',
    amount: 1500.0,
    status: 'refunded',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=DP',
  },
  {
    id: 'TRX-5439-RS',
    company: 'Stellar Fintech',
    jobTitle: 'Product Manager',
    date: 'Oct 21, 2023',
    amount: 1800.0,
    status: 'pending',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=SF',
  },
];

const RECENT_REFUNDS = [
  { company: 'Vortex Labs', time: '2H AGO', amount: 350.0, status: 'Review Needed' },
  { company: 'Aura Design', time: '5H AGO', amount: 1200.0, status: 'Review Needed' },
  { company: 'CloudScale', time: '1D AGO', amount: 500.0, status: 'Review Needed' },
];

const fmt = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Payments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return ALL_TRANSACTIONS.filter((t) => {
      return (
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q) ||
        t.jobTitle.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

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
            <h1 className="txn-banner-title">PLATFORM TRANSACTIONS</h1>
            <p className="txn-banner-desc">
              Monitor global revenue streams, manage recruiter payouts, and
              handle refund requests with high-precision financial tracking tools.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="txn-kpis">
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">TOTAL REVENUE</span>
                <div className="txn-kpi-icon"><DollarSign size={16} /></div>
              </div>
              <div className="txn-kpi-val">$142,384.50</div>
              <div className="txn-kpi-sub positive">↗ +12.5% from last month</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">TOTAL TRANSACTIONS</span>
                <div className="txn-kpi-icon"><CreditCard size={16} /></div>
              </div>
              <div className="txn-kpi-val">1,284</div>
              <div className="txn-kpi-sub positive">↗ +8.2% from last month</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">FAILED PAYMENTS</span>
                <div className="txn-kpi-icon"><AlertCircle size={16} /></div>
              </div>
              <div className="txn-kpi-val">23</div>
              <div className="txn-kpi-sub negative">↘ -4.0% from last month</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">REFUNDS ISSUED</span>
                <div className="txn-kpi-icon"><RefreshCcw size={16} /></div>
              </div>
              <div className="txn-kpi-val">$4,120.00</div>
              <div className="txn-kpi-sub positive">↗ +2.4% from last month</div>
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
                <button className="txn-btn-outline">
                  <Filter size={16} /> FILTER
                </button>
                <button className="txn-btn-outline">
                  <Download size={16} /> EXPORT CSV
                </button>
                <button className="txn-btn-primary">
                  Manual Transaction
                </button>
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
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
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
                        <span className={`txn-status ${t.status}`}>
                          <span className="txn-status-dot" />
                          {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button className="txn-action-btn">
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

          {/* Bottom blocks */}
          <div className="txn-bottom-blocks">
            <div className="txn-policy-card">
              <div className="txn-policy-content">
                <h3>Refund Policy Enforcement</h3>
                <p>
                  All refunds are currently under manual review by the administrative team.
                  Payments over $5,000.00 require dual-factor authorization from a Senior Financial Officer.
                </p>
                <button className="txn-policy-link">Read the Full Compliance Guide →</button>
              </div>
              <div className="txn-policy-image">
                <div className="txn-policy-icon-placeholder">
                  <span style={{fontSize:'3rem'}}>✋</span>
                </div>
              </div>
            </div>

            <div className="txn-refunds-card">
              <div className="txn-refunds-header">
                <Clock size={16} /> RECENT REFUND REQUESTS
              </div>
              <div className="txn-refunds-list">
                {RECENT_REFUNDS.map((r, i) => (
                  <div className="txn-refund-item" key={i}>
                    <div className="txn-refund-left">
                      <div className="txn-refund-company">{r.company}</div>
                      <div className="txn-refund-time">{r.time}</div>
                    </div>
                    <div className="txn-refund-right">
                      <div className="txn-refund-amount">{fmt(r.amount)}</div>
                      <div className="txn-refund-status">{r.status}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="txn-refunds-viewall">View All Queue</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
