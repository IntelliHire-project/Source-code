import React, { useState } from 'react';
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
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './ApplicantAnalytics.css';

// ─── KPI Stats ─────────────────────────────────────────────────────────────
// ─── Clean Table Data ───────────────────────────────────────────────────────
const APPLICANT_TABLE_DATA = [
  { id: '1', position: 'Software Engineer', department: 'Engineering', total: 218, newApplicants: 44, shortlisted: 72, rejected: 58, pending: 88, avgScore: 84 },
  { id: '2', position: 'UI/UX Designer', department: 'Design', total: 156, newApplicants: 32, shortlisted: 48, rejected: 42, pending: 66, avgScore: 79 },
  { id: '3', position: 'QA Engineer', department: 'QA & Testing', total: 134, newApplicants: 28, shortlisted: 38, rejected: 36, pending: 60, avgScore: 76 },
  { id: '4', position: 'Business Analyst', department: 'Operations', total: 192, newApplicants: 39, shortlisted: 66, rejected: 51, pending: 75, avgScore: 81 },
  { id: '5', position: 'Product Manager', department: 'Product', total: 141, newApplicants: 27, shortlisted: 44, rejected: 39, pending: 58, avgScore: 88 },
  { id: '6', position: 'DevOps Engineer', department: 'Engineering', total: 117, newApplicants: 24, shortlisted: 36, rejected: 32, pending: 49, avgScore: 82 },
  { id: '7', position: 'Data Scientist', department: 'Engineering', total: 98, newApplicants: 22, shortlisted: 28, rejected: 24, pending: 46, avgScore: 85 },
  { id: '8', position: 'Cloud Architect', department: 'Engineering', total: 87, newApplicants: 20, shortlisted: 22, rejected: 19, pending: 46, avgScore: 90 },
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
  const pageSize = 5;

  const filteredData = APPLICANT_TABLE_DATA.filter((item) => {
    const matchPos = positionFilter === 'all' || item.position.toLowerCase().includes(positionFilter.toLowerCase());
    const matchDept = departmentFilter === 'all' || item.department.toLowerCase().includes(departmentFilter.toLowerCase());
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
  const filtersActive = positionFilter !== 'all' || departmentFilter !== 'all' || searchQuery.trim();

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
      <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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

          {/* Header */}
          <div className="an-page-header">
            <div>
              <h1 className="an-page-title">Applicant Analytics</h1>
              <p className="an-page-subtitle">Clean overview of candidate volumes and application statuses.</p>
            </div>
            <button className="an-export-btn" type="button" onClick={exportReport}>
              <Download size={16} />
              Export Report
            </button>
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
                <option value="Software Engineer">Software Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="Product Manager">Product Manager</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
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
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="QA & Testing">QA & Testing</option>
                <option value="Operations">Operations</option>
                <option value="Product">Product</option>
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
            {filtersActive && (
              <button type="button" className="an-clear-filter" onClick={clearFilters}>
                <RotateCcw size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* Clean Overview Card */}
          <div className="an-overview-card">
            <div className="an-overview-header">
              <span className="an-chart-gold-bar" />
              <span className="an-overview-title">APPLICATION STATUS SUMMARY</span>
            </div>
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
                        <button className="an-row-action" type="button" title={`View ${row.position} vacancy`} aria-label={`View ${row.position} vacancy`} onClick={() => navigate('/recruiter/vacancies')}>
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
        </main>
      </div>
    </div>
  );
}
