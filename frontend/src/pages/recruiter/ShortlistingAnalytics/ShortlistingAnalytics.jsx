import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Target,
  Clock,
  AlertCircle,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Search,
  RotateCcw,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './ShortlistingAnalytics.css';

const SHORTLISTED_CANDIDATES = [
  { id: 'C-101', rank: '#1', name: 'Alex Sterling', role: 'Software Engineer', score: 94, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'C-102', rank: '#2', name: 'Sarah Jenkins', role: 'Software Engineer', score: 94, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'C-103', rank: '#3', name: 'Diana Prince', role: 'Product Manager', score: 96, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'C-104', rank: '#4', name: 'Ada Lovelace', role: 'UI/UX Designer', score: 98, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'C-105', rank: '#5', name: 'Elena Rodriguez', role: 'Software Engineer', score: 65, expMatch: 'Partial Match', status: 'SHORTLISTED', criteriaMet: '4/5 Criteria' },
  { id: 'C-106', rank: '#6', name: 'Clark Kent', role: 'Product Manager', score: 85, expMatch: 'Matched', status: 'UNDER REVIEW', criteriaMet: '4/5 Criteria' },
  { id: 'C-107', rank: '#7', name: 'Alan Turing', role: 'UI/UX Designer', score: 91, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'C-108', rank: '#8', name: 'Michael Chen', role: 'Software Engineer', score: 72, expMatch: 'Underqualified', status: 'REJECTED', criteriaMet: '2/5 Criteria' },
];

const TABS = [
  { id: 'applicants', label: 'Applicant Analytics', path: '/recruiter/analytics/applicants' },
  { id: 'shortlisting', label: 'Shortlisting Analytics', path: '/recruiter/analytics/shortlisting' },
  { id: 'assessment', label: 'Assessment Performance', path: '/recruiter/analytics/assessment' },
  { id: 'progress', label: 'Recruitment Progress', path: '/recruiter/analytics/progress' },
];

export default function ShortlistingAnalytics() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredCandidates = SHORTLISTED_CANDIDATES.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    return (roleFilter === 'all' || c.role === roleFilter)
      && (statusFilter === 'all' || c.status === statusFilter)
      && (!query || c.name.toLowerCase().includes(query) || c.role.toLowerCase().includes(query));
  });

  const shortlistedCount = filteredCandidates.filter((c) => c.status === 'SHORTLISTED').length;
  const reviewCount = filteredCandidates.filter((c) => c.status === 'UNDER REVIEW').length;
  const rate = filteredCandidates.length ? Math.round((shortlistedCount / filteredCandidates.length) * 100) : 0;
  const shortlistStats = [
    { label: 'Total Shortlisted', value: shortlistedCount, icon: Star, color: '#D7B85B', bg: 'rgba(240,185,11,0.10)' },
    { label: 'Shortlist Rate', value: `${rate}%`, icon: Target, color: '#78B98B', bg: 'rgba(120,185,139,0.10)' },
    { label: 'Avg Time to Shortlist', value: '3.2d', icon: Clock, color: '#8FA7E8', bg: 'rgba(143,167,232,0.10)' },
    { label: 'Pending Review', value: reviewCount, icon: AlertCircle, color: '#B7A46A', bg: 'rgba(183,164,106,0.10)' },
  ];
  const criteriaDefinitions = [
    ['Technical Skills Match', (c) => c.score >= 80],
    ['Relevant Experience', (c) => c.expMatch === 'Matched'],
    ['Educational Qualification', (c) => c.score >= 70],
    ['Communication & Soft Skills', (c) => Number(c.criteriaMet[0]) >= 4],
    ['Portfolio & System Projects', (c) => c.score >= 90],
  ];
  const criteriaMetrics = criteriaDefinitions.map(([criteria, test]) => {
    const met = filteredCandidates.filter(test).length;
    return { criteria, shortlisted: met, total: filteredCandidates.length, pct: filteredCandidates.length ? Math.round((met / filteredCandidates.length) * 100) : 0 };
  });
  const filtersActive = roleFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim();
  const clearFilters = () => { setRoleFilter('all'); setStatusFilter('all'); setSearchQuery(''); setCurrentPage(1); };
  const exportReport = () => {
    const rows = [['Rank', 'Candidate', 'Role', 'AI Match Score', 'Experience Match', 'Criteria Met', 'Status'], ...filteredCandidates.map((c) => [c.rank, c.name, c.role, `${c.score}%`, c.expMatch, c.criteriaMet, c.status])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'shortlisting-analytics-report.csv'; link.click(); URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCandidates = filteredCandidates.slice((safePage - 1) * pageSize, safePage * pageSize);

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
            { label: 'Shortlisting Statistics' },
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
                className={`an-tab ${tab.id === 'shortlisting' ? 'is-active' : ''}`}
                onClick={() => navigate(tab.path)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="an-page-header">
            <div>
              <h1 className="an-page-title">Shortlisting Analytics</h1>
              <p className="an-page-subtitle">Clean breakdown of shortlisted candidates and requirement matches.</p>
            </div>
            <button className="an-export-btn" type="button" onClick={exportReport}>
              <Download size={16} />
              Export Report
            </button>
          </div>

          {/* KPI Stat Cards */}
          <div className="an-stats-grid">
            {shortlistStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="an-stat-card">
                  <div className="an-stat-info">
                    <span className="an-stat-label">{stat.label}</span>
                    <span className="an-stat-value">{stat.value}</span>
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
            <label className="an-local-search"><Search size={15} /><input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search candidates..." /></label>
            <div className="an-select-wrap">
              <select
                className="an-select"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Roles</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Product Manager">Product Manager</option>
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
            <div className="an-select-wrap">
              <select className="an-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Statuses</option><option value="SHORTLISTED">Shortlisted</option><option value="UNDER REVIEW">Under Review</option><option value="REJECTED">Rejected</option>
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
            {filtersActive && <button type="button" className="an-clear-filter" onClick={clearFilters}><RotateCcw size={14} /> Clear Filters</button>}
          </div>

          {/* Clean Overview Card: Criteria Match Breakdown */}
          <div className="an-overview-card">
            <div className="an-overview-header">
              <span className="an-chart-gold-bar" />
              <span className="an-overview-title">SHORTLISTING METRICS BY CRITERIA</span>
            </div>
            <div className="an-dist-container">
              {criteriaMetrics.map((item, i) => (
                <div key={i} className="an-dist-bar-item">
                  <div className="an-dist-bar-header">
                    <span className="an-dist-label">{item.criteria}</span>
                    <span className="an-dist-val">{item.shortlisted} / {item.total} ({item.pct}%)</span>
                  </div>
                  <div className="an-dist-track">
                    <div className="an-dist-fill" style={{ width: `${item.pct}%`, background: item.pct >= 70 ? '#789982' : '#B79A45' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shortlist Table */}
          <div className="an-table-section">
            <div className="an-section-header">
              <span className="an-chart-gold-bar" />
              <span className="an-section-title">CANDIDATE SHORTLISTING EVALUATION</span>
            </div>

            <div className="an-table-wrap">
              <table className="an-table">
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>CANDIDATE NAME</th>
                    <th>ROLE</th>
                    <th>AI MATCH SCORE</th>
                    <th>EXPERIENCE MATCH</th>
                    <th>CRITERIA MET</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCandidates.map((c) => {
                    const isShortlisted = c.status === 'SHORTLISTED';
                    const isUnderReview = c.status === 'UNDER REVIEW';
                    const statusBg = isShortlisted ? 'rgba(120,185,139,0.10)' : isUnderReview ? 'rgba(183,164,106,0.10)' : 'rgba(199,121,128,0.10)';
                    const statusColor = isShortlisted ? '#78B98B' : isUnderReview ? '#B7A46A' : '#C77980';

                    return (
                      <tr key={c.id}>
                        <td className="an-td-muted">{c.rank}</td>
                        <td className="an-td-pos">{c.name}</td>
                        <td className="an-td-muted">{c.role}</td>
                        <td>
                          <span className="an-score-badge" style={{ color: c.score >= 80 ? '#22C55E' : '#F0B90B' }}>
                            {c.score}%
                          </span>
                        </td>
                        <td>
                          <span className="an-status-pill" style={{ background: 'rgba(107,140,255,0.12)', color: '#6B8CFF' }}>
                            {c.expMatch}
                          </span>
                        </td>
                        <td className="an-td-muted">{c.criteriaMet}</td>
                        <td>
                          <span className="an-status-pill" style={{ background: statusBg, color: statusColor }}>
                            {isShortlisted && <CheckCircle2 size={12} style={{ marginRight: 4 }} />}
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedCandidates.length === 0 && (
                    <tr>
                      <td colSpan="7" className="an-td-empty">
                        <span>No candidates match your search and filters.</span><button type="button" onClick={clearFilters}>Clear Filters</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="an-mobile-cards">
              {paginatedCandidates.map((c) => <article className="an-mobile-card" key={c.id}><div className="an-mobile-card__head"><div><strong>{c.name}</strong><span>{c.role}</span></div><b>{c.score}%</b></div><div className="an-mobile-card__details"><span>{c.rank}</span><span>{c.expMatch}</span><span>{c.criteriaMet}</span><span>{c.status}</span></div></article>)}
              {!paginatedCandidates.length && <div className="an-mobile-empty"><p>No candidates match your search and filters.</p><button type="button" onClick={clearFilters}>Clear Filters</button></div>}
            </div>

            {/* Pagination Controls */}
            {filteredCandidates.length > pageSize && <div className="an-pagination">
              <span className="an-pagination-info">
                Showing <strong>{filteredCandidates.length > 0 ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filteredCandidates.length)}</strong> of <strong>{filteredCandidates.length}</strong> candidates
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
