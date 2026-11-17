import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Star,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
  Eye,
  Printer,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import { getApplicantAnalytics } from '../../../services/analyticsService';
import '../../../style.css';
import './ApplicantAnalytics.css';

// ─── KPI Stats ─────────────────────────────────────────────────────────────
// ─── Clean Table Data ───────────────────────────────────────────────────────
const APPLICANT_TABLE_DATA = [
  { id: '1', position: 'Senior Software Engineer', department: 'Engineering', total: 48, newApplicants: 12, shortlisted: 9, rejected: 15, pending: 24, avgScore: 84 },
  { id: '2', position: 'UI/UX Designer', department: 'Design', total: 35, newApplicants: 8, shortlisted: 6, rejected: 12, pending: 17, avgScore: 79 },
  { id: '3', position: 'Product Manager', department: 'Product', total: 28, newApplicants: 6, shortlisted: 5, rejected: 9, pending: 14, avgScore: 82 },
  { id: '4', position: 'Backend Engineer', department: 'Engineering', total: 24, newApplicants: 5, shortlisted: 4, rejected: 8, pending: 12, avgScore: 81 },
  { id: '5', position: 'QA Automation Engineer', department: 'QA & Testing', total: 18, newApplicants: 4, shortlisted: 3, rejected: 6, pending: 9, avgScore: 76 },
  { id: '6', position: 'DevOps Engineer', department: 'Engineering', total: 14, newApplicants: 3, shortlisted: 2, rejected: 5, pending: 7, avgScore: 85 },
];

const TABS = [
  { id: 'applicants', label: 'Applicant Analytics', path: '/recruiter/analytics/applicants' },
  { id: 'shortlisting', label: 'Shortlisting Analytics', path: '/recruiter/analytics/shortlisting' },
  { id: 'assessment', label: 'Assessment Performance', path: '/recruiter/analytics/assessment' },
  { id: 'progress', label: 'Recruitment Progress', path: '/recruiter/analytics/progress' },
];

export default function ApplicantAnalytics() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [positionFilter, setPositionFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState(APPLICANT_TABLE_DATA);
  const pageSize = 5;

  useEffect(() => {
    let isMounted = true;
    getApplicantAnalytics().then((res) => {
      if (isMounted && res && Array.isArray(res.tableData) && res.tableData.length > 0) {
        setTableData(res.tableData);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = tableData.filter((item) => {
    const matchPos = positionFilter === 'all' || item.position.toLowerCase() === positionFilter.toLowerCase() || item.position.toLowerCase().includes(positionFilter.toLowerCase());
    const matchDept = departmentFilter === 'all' || item.department.toLowerCase() === departmentFilter.toLowerCase() || item.department.toLowerCase().includes(departmentFilter.toLowerCase());
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || item.position.toLowerCase().includes(query) || item.department.toLowerCase().includes(query);
    return matchPos && matchDept && matchSearch;
  });

  const totals = filteredData.reduce((result, item) => ({
    total: result.total + item.total,
    newApplicants: result.newApplicants + item.newApplicants,
    shortlisted: result.shortlisted + item.shortlisted,
    rejected: result.rejected + item.rejected,
    pending: result.pending + item.pending,
  }), { total: 0, newApplicants: 0, shortlisted: 0, rejected: 0, pending: 0 });

  const applicantStats = [
    { label: 'Total Applicants', value: totals.total, icon: Users, color: '#F0B90B', bg: 'rgba(240,185,11,0.12)' },
    { label: 'New Applicants', value: totals.newApplicants, icon: UserCheck, color: '#78B98B', bg: 'rgba(120,185,139,0.10)' },
    { label: 'Shortlisted', value: totals.shortlisted, icon: Star, color: '#8FA7E8', bg: 'rgba(143,167,232,0.10)' },
    { label: 'Rejected', value: totals.rejected, icon: UserX, color: '#C77980', bg: 'rgba(199,121,128,0.10)' },
  ];

  const percentage = (value) => totals.total ? ((value / totals.total) * 100).toFixed(1) : '0.0';
  const activeFilterCount = [
    positionFilter !== 'all',
    departmentFilter !== 'all',
    Boolean(searchQuery.trim()),
  ].filter(Boolean).length;
  const filtersActive = activeFilterCount > 0;

  const clearFilters = () => {
    setPositionFilter('all');
    setDepartmentFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const exportReport = () => {
    const headers = ['Job Position', 'Department', 'Total Applicants', 'New Applicants', 'Shortlisted', 'Rejected', 'Pending', 'Average Match Score'];
    const rows = filteredData.map((row) => [row.position, row.department, row.total, row.newApplicants, row.shortlisted, row.rejected, row.pending, `${row.avgScore}%`]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'applicant-analytics-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="create-vacancy app-analytics-shell">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Applicant Stats"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          breadcrumbItems={[
            { label: 'Recruiter', path: '/recruiter/dashboard' },
            { label: 'Analytics', path: '/recruiter/analytics/applicants' },
            { label: 'Applicant Statistics' },
          ]}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="an-page-wrapper">
          {/* Analytics Feature Navigation */}
          <div className="an-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`an-tab ${tab.id === 'applicants' ? 'is-active' : ''}`}
                onClick={() => navigate(tab.path)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Printable Dossier Header (Only renders on @media print) */}
          <div className="an-print-header">
            <div className="an-print-header__top">
              <div>
                <h2 className="an-print-header__title">IntelliHire — Executive Analytics Dossier</h2>
                <span className="an-print-header__subtitle">Recruitment Pipeline, Applicant Volume &amp; Evaluation Audit Report</span>
              </div>
              <div className="an-print-header__meta">
                <div>Report: <strong>Applicant Analytics</strong></div>
                <div>Generated: <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                <div>Total Applicants: <strong>{totals.total}</strong> | Shortlisted: <strong>{totals.shortlisted}</strong></div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="an-page-header">
            <div>
              <h1 className="an-page-title">Applicant Analytics</h1>
              <p className="an-page-subtitle">Clean overview of candidate volumes and application statuses.</p>
            </div>
            <div className="an-header-actions">
              <button className="an-print-btn" type="button" onClick={() => window.print()} title="Print or save PDF dossier">
                <Printer size={14} />
                Print / Save PDF
              </button>
              <button className="an-export-btn" type="button" onClick={exportReport} title="Export CSV report">
                <Download size={14} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Clean KPI Stat Cards */}
          <div className="an-stats-grid">
            {applicantStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="an-stat-card">
                  <div className="an-stat-info">
                    <span className="an-stat-label">{stat.label}</span>
                    <span className="an-stat-value">{stat.value.toLocaleString()}</span>
                  </div>
                  <div className="an-stat-icon" style={{ background: stat.bg, color: stat.color }}>
                    <Icon size={22} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Minimal Filter Bar */}
          <div className="an-filter-bar">
            <span className="an-filter-label">
              <Filter size={14} /> FILTERS:
            </span>
            <label className="an-local-search">
              <Search size={15} />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search vacancies..."
              />
            </label>
            <div className="an-select-wrap">
              <select
                className="an-select"
                value={positionFilter}
                onChange={(e) => { setPositionFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Positions</option>
                {[...new Set(APPLICANT_TABLE_DATA.map((item) => item.position))].map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>

            <div className="an-select-wrap">
              <select
                className="an-select"
                value={departmentFilter}
                onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Departments</option>
                {[...new Set(APPLICANT_TABLE_DATA.map((item) => item.department))].map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
            {filtersActive && (
              <button type="button" className="an-clear-filter is-active" onClick={clearFilters}>
                <RotateCcw size={14} /> Clear Filters ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Clean Overview Card with SVG Donut Chart & Distribution Bars */}
          <div className="an-overview-card">
            <div className="an-overview-header">
              <span className="an-chart-gold-bar" />
              <span className="an-overview-title">APPLICATION STATUS SUMMARY &amp; VISUAL DISTRIBUTION</span>
            </div>
            <div className="an-overview-grid">
              {/* Circular SVG Donut Visualization */}
              <div className="an-donut-chart-wrap">
                {(() => {
                  const circumference = 301.59; // 2 * Math.PI * 48
                  const total = totals.total || 1;
                  const pShort = (totals.shortlisted / total);
                  const pPend = (totals.pending / total);
                  const pRej = (totals.rejected / total);
                  const shortStroke = pShort * circumference;
                  const pendStroke = pPend * circumference;
                  const rejStroke = pRej * circumference;
                  const shortOffset = 0;
                  const pendOffset = -shortStroke;
                  const rejOffset = -(shortStroke + pendStroke);

                  return (
                    <svg className="an-donut-svg" viewBox="0 0 130 130">
                      <circle cx="65" cy="65" r="48" fill="none" stroke="#2A2C38" strokeWidth="12" />
                      {/* Shortlisted segment */}
                      <circle
                        cx="65"
                        cy="65"
                        r="48"
                        fill="none"
                        stroke="#F0B90B"
                        strokeWidth="12"
                        strokeDasharray={`${shortStroke} ${circumference}`}
                        strokeDashoffset={shortOffset}
                        transform="rotate(-90 65 65)"
                        strokeLinecap="round"
                      />
                      {/* Pending segment */}
                      <circle
                        cx="65"
                        cy="65"
                        r="48"
                        fill="none"
                        stroke="#6B8CFF"
                        strokeWidth="12"
                        strokeDasharray={`${pendStroke} ${circumference}`}
                        strokeDashoffset={pendOffset}
                        transform="rotate(-90 65 65)"
                      />
                      {/* Rejected segment */}
                      <circle
                        cx="65"
                        cy="65"
                        r="48"
                        fill="none"
                        stroke="#E63946"
                        strokeWidth="12"
                        strokeDasharray={`${rejStroke} ${circumference}`}
                        strokeDashoffset={rejOffset}
                        transform="rotate(-90 65 65)"
                      />
                      <text x="65" y="61" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="800">
                        {totals.total.toLocaleString()}
                      </text>
                      <text x="65" y="76" textAnchor="middle" fill="#9599A6" fontSize="9" fontWeight="700" letterSpacing="0.8">
                        TOTAL APPS
                      </text>
                    </svg>
                  );
                })()}
                <div className="an-donut-legend">
                  <span className="an-donut-badge"><b style={{ background: '#F0B90B' }} /> Shortlisted ({percentage(totals.shortlisted)}%)</span>
                  <span className="an-donut-badge"><b style={{ background: '#6B8CFF' }} /> Pending ({percentage(totals.pending)}%)</span>
                  <span className="an-donut-badge"><b style={{ background: '#E63946' }} /> Rejected ({percentage(totals.rejected)}%)</span>
                </div>
              </div>

              {/* Progress Distribution Bars */}
              <div className="an-dist-container">
                <div className="an-dist-bar-item">
                  <div className="an-dist-bar-header">
                    <span className="an-dist-dot" style={{ background: '#F0B90B' }} />
                    <span className="an-dist-label">Shortlisted Candidates</span>
                    <span className="an-dist-val">{totals.shortlisted.toLocaleString()} ({percentage(totals.shortlisted)}%)</span>
                  </div>
                  <div className="an-dist-track">
                    <div className="an-dist-fill" style={{ width: `${percentage(totals.shortlisted)}%`, background: '#F0B90B' }} />
                  </div>
                </div>

                <div className="an-dist-bar-item">
                  <div className="an-dist-bar-header">
                    <span className="an-dist-dot" style={{ background: '#6B8CFF' }} />
                    <span className="an-dist-label">Pending Review</span>
                    <span className="an-dist-val">{totals.pending.toLocaleString()} ({percentage(totals.pending)}%)</span>
                  </div>
                  <div className="an-dist-track">
                    <div className="an-dist-fill" style={{ width: `${percentage(totals.pending)}%`, background: '#7F8FB8' }} />
                  </div>
                </div>

                <div className="an-dist-bar-item">
                  <div className="an-dist-bar-header">
                    <span className="an-dist-dot" style={{ background: '#E63946' }} />
                    <span className="an-dist-label">Rejected Applications</span>
                    <span className="an-dist-val">{totals.rejected.toLocaleString()} ({percentage(totals.rejected)}%)</span>
                  </div>
                  <div className="an-dist-track">
                    <div className="an-dist-fill" style={{ width: `${percentage(totals.rejected)}%`, background: '#A96369' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applicant Breakdown Table */}
          <div className="an-table-section">
            <div className="an-section-header">
              <span className="an-chart-gold-bar" />
              <span className="an-section-title">APPLICANT BREAKDOWN BY VACANCY</span>
            </div>

            <div className="an-table-wrap">
              <table className="an-table">
                <thead>
                  <tr>
                    <th>JOB POSITION</th>
                    <th>DEPARTMENT</th>
                    <th>TOTAL APPLICANTS</th>
                    <th>SHORTLISTED</th>
                    <th>REJECTED</th>
                    <th>PENDING</th>
                    <th>AVG MATCH SCORE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row) => (
                    <tr key={row.id}>
                      <td className="an-td-pos">{row.position}</td>
                      <td className="an-td-muted">{row.department}</td>
                      <td className="an-td-bold">{row.total}</td>
                      <td className="an-td-shortlisted">{row.shortlisted}</td>
                      <td className="an-td-crisis">{row.rejected}</td>
                      <td className="an-td-pending">{row.pending}</td>
                      <td>
                        <span className="an-score-badge" style={{ color: row.avgScore >= 80 ? '#22C55E' : '#F0B90B' }}>
                          {row.avgScore}%
                        </span>
                      </td>
                      <td>
                        <button className="an-row-action" type="button" title={`View active vacancies`} aria-label={`View active vacancies`} onClick={() => navigate('/recruiter/vacancies')}>
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan="8" className="an-td-empty">
                        <span>No vacancies match your current search and filters.</span>
                        <button type="button" onClick={clearFilters}>Clear Filters</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="an-mobile-cards">
              {paginatedData.map((row) => (
                <article className="an-mobile-card" key={row.id}>
                  <div className="an-mobile-card__header">
                    <div><strong>{row.position}</strong><span>{row.department}</span></div>
                    <button type="button" title={`View ${row.position} vacancy`} aria-label={`View ${row.position} vacancy`} onClick={() => navigate('/recruiter/vacancies')}><Eye size={17} /></button>
                  </div>
                  <div className="an-mobile-card__grid">
                    <span><small>Total</small><b>{row.total}</b></span>
                    <span><small>Shortlisted</small><b>{row.shortlisted}</b></span>
                    <span><small>Rejected</small><b>{row.rejected}</b></span>
                    <span><small>Pending</small><b>{row.pending}</b></span>
                  </div>
                  <div className="an-mobile-card__score">Average match score <strong>{row.avgScore}%</strong></div>
                </article>
              ))}
              {!paginatedData.length && (
                <div className="an-mobile-empty">
                  <p>No vacancies match your current search and filters.</p>
                  <button type="button" onClick={clearFilters}>Clear Filters</button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredData.length > pageSize && <div className="an-pagination">
              <span className="an-pagination-info">
                Showing <strong>{filteredData.length > 0 ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> vacancies
              </span>

              <div className="an-pagination-controls">
                <button
                  type="button"
                  className="an-page-btn"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`an-page-btn an-page-num ${safePage === num ? 'is-active' : ''}`}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  className="an-page-btn"
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>}
          </div>

          {/* Printable Dossier Footer */}
          <div className="an-print-footer">
            <span>IntelliHire Recruitment Platform • Confidential Candidate Analytics</span>
            <span>Generated for Hiring Manager • Page 1 of 1</span>
          </div>
        </main>
      </div>
    </div>
  );
}
