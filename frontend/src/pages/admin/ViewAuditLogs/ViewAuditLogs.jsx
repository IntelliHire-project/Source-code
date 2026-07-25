import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Database,
  Shield,
  Search,
  User,
  Calendar,
  Zap,
  Globe,

  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import AdminSidebar from '../../../components/common/AdminSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../styles/admin.css';
import './ViewAuditLogs.css';

// ── Mock data ─────────────────────────────────────────────────────────
const MOCK_LOGS = [
  {
    id: 1,
    timestamp: '2024-05-24 14:32:01',
    user: { name: 'Alexander Pierce', email: 'a.pierce@aureum.com', color: '#6B8CFF' },
    actionType: 'Login Attempt',
    module: 'AUTH_SERVICE',
    ip: '192.168.1.104',
    status: 'success',
  },
  {
    id: 2,
    timestamp: '2024-05-24 14:30:45',
    user: { name: 'Sarah Jenkins', email: 's.jenkins@aureum.com', color: '#22C55E' },
    actionType: 'Database Query',
    module: 'DB_ADMIN',
    ip: '10.0.4.22',
    status: 'success',
  },
  {
    id: 3,
    timestamp: '2024-05-24 14:28:12',
    user: { name: 'Unknown User', email: 'N/A', color: '#E63946' },
    actionType: 'Unauthorized Access',
    module: 'ROOT_SYSTEM',
    ip: '172.16.254.1',
    status: 'failure',
  },
  {
    id: 4,
    timestamp: '2024-05-24 14:25:59',
    user: { name: 'Marcus Thorne', email: 'm.thorne@aureum.com', color: '#F0B90B' },
    actionType: 'Delete File',
    module: 'STORAGE_V4',
    ip: '192.168.1.88',
    status: 'pending',
  },
  {
    id: 5,
    timestamp: '2024-05-24 14:22:30',
    user: { name: 'Helena Vance', email: 'h.vance@aureum.com', color: '#A79E8C' },
    actionType: 'Update Policy',
    module: 'IAM_RULES',
    ip: '192.168.1.15',
    status: 'success',
  },
  {
    id: 6,
    timestamp: '2024-05-24 14:19:11',
    user: { name: 'David Kwan', email: 'd.kwan@aureum.com', color: '#6B8CFF' },
    actionType: 'Config Change',
    module: 'INFRA_CORE',
    ip: '192.168.0.5',
    status: 'success',
  },
  {
    id: 7,
    timestamp: '2024-05-24 14:15:03',
    user: { name: 'Priya Sharma', email: 'p.sharma@aureum.com', color: '#22C55E' },
    actionType: 'Privilege Escalation',
    module: 'AUTH_SERVICE',
    ip: '10.0.1.77',
    status: 'failure',
  },
  {
    id: 8,
    timestamp: '2024-05-24 14:10:44',
    user: { name: 'Tom Briggs', email: 't.briggs@aureum.com', color: '#F0B90B' },
    actionType: 'Export Report',
    module: 'REPORTS_SVC',
    ip: '192.168.1.22',
    status: 'success',
  },
];

const TOTAL_RESULTS = 24892;
const ITEMS_PER_PAGE = 5;

function getInitials(name) {
  if (!name || name === 'Unknown User') return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Live Clock ────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <div className="audit-current-time">
      <span className="audit-current-time__label">Current Time</span>
      <span className="audit-current-time__value">{dateStr} {timeStr}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
function ViewAuditLogs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('24h');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered + paginated logs
  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        log.user.name.toLowerCase().includes(q) ||
        log.user.email.toLowerCase().includes(q) ||
        log.ip.includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q);

      const matchesAction =
        actionFilter === 'all' ||
        log.actionType.toLowerCase().replace(/ /g, '-') === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [searchQuery, userFilter, dateFilter, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const pageLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExport = () => {
    const csv =
      'Timestamp,User,Email,Action Type,Module,IP,Status\n' +
      filteredLogs
        .map(
          (l) =>
            `${l.timestamp},"${l.user.name}",${l.user.email},${l.actionType},${l.module},${l.ip},${l.status}`
        )
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Audit Logs"
      />

      <div className="admin-dashboard__main audit-page">
        {/* Standard TopBar for hamburger + search */}
        <TopBar
          user={{ name: 'Master Admin', role: 'System Owner' }}
          notificationsCount={3}
          searchPlaceholder="Search audit logs..."
          onSearch={(q) => setSearchQuery(q)}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        {/* ── Page Title Bar ── */}
        <div className="admin-content__header">
          <div>
            <h1 className="admin-content__title">Audit Log</h1>
            <p className="admin-content__subtitle">
              Monitor and review all system activity and security events across the organization.
            </p>
          </div>
          <div className="audit-titlebar__right">
            <LiveClock />
          </div>
        </div>

        {/* ── Main scrollable content ── */}
        <main className="audit-content">
          {/* KPI Cards */}
          <section className="audit-kpi-row" aria-label="Security metrics">
            <div className="audit-kpi-card">
              <div className="audit-kpi-card__top">
                <span className="audit-kpi-card__label">Total Security Events</span>
                <div className="audit-kpi-card__icon"><Activity size={16} /></div>
              </div>
              <div className="audit-kpi-card__value">1,284,092</div>
              <span className="audit-kpi-card__sub positive">↗ +12% from previous week</span>
            </div>

            <div className="audit-kpi-card">
              <div className="audit-kpi-card__top">
                <span className="audit-kpi-card__label">Active Modules</span>
                <div className="audit-kpi-card__icon"><Database size={16} /></div>
              </div>
              <div className="audit-kpi-card__value">48</div>
              <span className="audit-kpi-card__sub">System integrity verified</span>
            </div>

            <div className="audit-kpi-card">
              <div className="audit-kpi-card__top">
                <span className="audit-kpi-card__label">Critical Failures</span>
                <div className="audit-kpi-card__icon"><Shield size={16} /></div>
              </div>
              <div className="audit-kpi-card__value">03</div>
              <span className="audit-kpi-card__sub negative">Action required for 1 incident</span>
            </div>
          </section>

          {/* Search & Filter Bar */}
          <div className="audit-filter-bar">
            <div className="audit-filter-group audit-filter-group--search">
              <span className="audit-filter-label">Search Logs</span>
              <div className="audit-search-wrapper">
                <Search size={15} className="audit-search-icon" />
                <input
                  className="audit-search-input"
                  type="text"
                  placeholder="Filter by keyword, IP, or user..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            <div className="audit-filter-group">
              <span className="audit-filter-label">User</span>
              <div className="audit-select-wrapper">
                <User size={14} className="audit-select-icon" />
                <select
                  className="audit-select"
                  value={userFilter}
                  onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">All Personnel</option>
                  <option value="admin">Admins Only</option>
                  <option value="system">System Accounts</option>
                </select>
              </div>
            </div>

            <div className="audit-filter-group">
              <span className="audit-filter-label">Date</span>
              <div className="audit-select-wrapper">
                <Calendar size={14} className="audit-select-icon" />
                <select
                  className="audit-select"
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            <div className="audit-filter-group">
              <span className="audit-filter-label">Action</span>
              <div className="audit-select-wrapper">
                <Zap size={14} className="audit-select-icon" />
                <select
                  className="audit-select"
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">Any Interaction</option>
                  <option value="login-attempt">Login Attempt</option>
                  <option value="database-query">Database Query</option>
                  <option value="unauthorized-access">Unauthorized Access</option>
                  <option value="delete-file">Delete File</option>
                  <option value="update-policy">Update Policy</option>
                </select>
              </div>
            </div>

            <button className="audit-btn-export" onClick={handleExport}>
              <Download size={15} />
              Export Logs
            </button>
          </div>

          {/* Transaction History Table */}
          <div className="audit-table-section">
            <div className="audit-table-section__header">
              <h2 className="audit-table-section__title">
                <Activity size={16} className="audit-table-live-icon" />
                Real-time Transaction History
              </h2>
              <div className="audit-live-badge">
                <span className="audit-live-dot" />
                Live Monitoring Active
              </div>
            </div>

            <div className="audit-table-wrapper">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Principal User</th>
                    <th>Action Type</th>
                    <th>Module Origin</th>
                    <th>Network IP</th>
                    <th>Integrity Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pageLogs.length > 0 ? (
                    pageLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="audit-ts">{log.timestamp}</td>
                        <td>
                          <div className="audit-user-cell">
                            <div
                              className="audit-user-avatar"
                              style={{ background: log.user.color + '22', color: log.user.color }}
                            >
                              {getInitials(log.user.name)}
                            </div>
                            <div className="audit-user-info">
                              <span className="audit-user-info__name">{log.user.name}</span>
                              <span className="audit-user-info__email">{log.user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="audit-action-type">{log.actionType}</td>
                        <td><span className="audit-module">{log.module}</span></td>
                        <td>
                          <div className="audit-ip-cell">
                            <Globe size={13} className="audit-ip-icon" />
                            {log.ip}
                          </div>
                        </td>
                        <td>
                          <span className={`audit-status-badge ${log.status}`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button className="audit-row-actions-btn" aria-label="Row actions">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No logs match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="audit-table-footer">
              <span className="audit-table-footer__info">
                Showing {Math.min(filteredLogs.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}–
                {Math.min(filteredLogs.length, currentPage * ITEMS_PER_PAGE)} of{' '}
                {filteredLogs.length < MOCK_LOGS.length
                  ? filteredLogs.length
                  : TOTAL_RESULTS.toLocaleString()}{' '}
                results
              </span>
              <div className="audit-pagination">
                <button
                  className="audit-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={`audit-page-btn ${currentPage === p ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <span className="audit-page-ellipsis">…</span>
                <button className="audit-page-btn" onClick={() => setCurrentPage(120)}>
                  120
                </button>
                <button
                  className="audit-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* ── Page Footer ── */}
        <footer className="audit-footer">
          <nav className="audit-footer__links" aria-label="Footer links">
            <a href="#docs" className="audit-footer__link">Documentation</a>
            <a href="#api" className="audit-footer__link">API Reference</a>
            <a href="#support" className="audit-footer__link">Support</a>
          </nav>
          <span className="audit-footer__copy">
            © 2024 IntelliHire Security Operations Center • ENCRYPTED V3.2.1
          </span>
        </footer>
      </div>
    </div>
  );
}

export default ViewAuditLogs;
