import React, { useState, useEffect } from 'react';
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
  Printer,
  Calendar,
  Award,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import { getShortlistingAnalytics } from '../../../services/analyticsService';
import '../../../style.css';
import './ShortlistingAnalytics.css';

const SHORTLISTED_CANDIDATES = [
  { id: 'APP-001', rank: '#1', name: 'Alice Fernando', role: 'Senior Software Engineer', score: 88, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'APP-002', rank: '#2', name: 'Kamal Perera', role: 'Senior Software Engineer', score: 82, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'APP-003', rank: '#3', name: 'Nimal Silva', role: 'Senior Software Engineer', score: 79, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'APP-004', rank: '#4', name: 'Dinesh Mendis', role: 'Senior Software Engineer', score: 76, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '4/5 Criteria' },
  { id: 'APP-005', rank: '#5', name: 'Sanduni Wickramasinghe', role: 'Senior Software Engineer', score: 74, expMatch: 'Partial Match', status: 'SHORTLISTED', criteriaMet: '4/5 Criteria' },
  { id: 'APP-006', rank: '#6', name: 'Ishara Gunasekara', role: 'Senior Software Engineer', score: 72, expMatch: 'Partial Match', status: 'UNDER REVIEW', criteriaMet: '4/5 Criteria' },
  { id: 'APP-007', rank: '#7', name: 'Malith Senanayake', role: 'UI/UX Designer', score: 70, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '4/5 Criteria' },
  { id: 'APP-008', rank: '#8', name: 'Tharindu Rathnayake', role: 'QA Automation Engineer', score: 68, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '4/5 Criteria' },
  { id: 'APP-009', rank: '#9', name: 'Kasun Wijesinghe', role: 'Backend Engineer', score: 65, expMatch: 'Partial Match', status: 'UNDER REVIEW', criteriaMet: '3/5 Criteria' },
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
  const [candidatesList, setCandidatesList] = useState(SHORTLISTED_CANDIDATES);
  const pageSize = 5;

  useEffect(() => {
    let isMounted = true;
    getShortlistingAnalytics().then((res) => {
      if (isMounted && res && Array.isArray(res.candidates) && res.candidates.length > 0) {
        setCandidatesList(res.candidates);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCandidates = candidatesList.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    const matchRole = roleFilter === 'all' || c.role.toLowerCase() === roleFilter.toLowerCase() || c.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchSearch = !query || c.name.toLowerCase().includes(query) || c.role.toLowerCase().includes(query);
    return matchRole && matchStatus && matchSearch;
  });

  const totalInPipeline = filteredCandidates.length;
  const allocatedCount = filteredCandidates.filter((c) => c.status === 'ALLOCATED' || c.status === 'INTERVIEWED').length;
  const pendingAllocation = filteredCandidates.filter((c) => c.status === 'SHORTLISTED' || c.status === 'UNDER REVIEW').length;
  const rate = Math.round((totalInPipeline / 48) * 100);
  const shortlistStats = [
    { label: 'Total Shortlisted', value: totalInPipeline, icon: Star, color: '#D7B85B', bg: 'rgba(240,185,11,0.10)' },
    { label: 'Shortlist Rate', value: `${rate}%`, icon: Target, color: '#78B98B', bg: 'rgba(120,185,139,0.10)' },
    { label: 'Allocated to Slot', value: allocatedCount, icon: Clock, color: '#8FA7E8', bg: 'rgba(143,167,232,0.10)' },
    { label: 'Pending Slot Allocation', value: pendingAllocation, icon: AlertCircle, color: '#B7A46A', bg: 'rgba(183,164,106,0.10)' },
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
  const activeFilterCount = [roleFilter !== 'all', statusFilter !== 'all', Boolean(searchQuery.trim())].filter(Boolean).length;
  const filtersActive = activeFilterCount > 0;
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
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Shortlisting"
      />

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
            <div className="an-header-actions">
              <button className="an-print-btn" type="button" onClick={() => window.print()} title="Print or save PDF report">
                <Printer size={16} />
                Print / Save PDF
              </button>
              <button className="an-export-btn" type="button" onClick={exportReport} title="Export CSV report">
                <Download size={16} />
                Export CSV
              </button>
            </div>
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
                {[...new Set(SHORTLISTED_CANDIDATES.map((c) => c.role))].map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
            <div className="an-select-wrap">
              <select className="an-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Statuses</option><option value="SHORTLISTED">Shortlisted</option><option value="UNDER REVIEW">Under Review</option><option value="REJECTED">Rejected</option>
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
            {filtersActive && (
              <button type="button" className="an-clear-filter is-active" onClick={clearFilters}>
                <RotateCcw size={14} /> Clear Filters ({activeFilterCount})
              </button>
            )}
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
                    <th>ACTIONS</th>
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
                          <div className="an-score-cell">
                            <span className="an-score-badge" style={{ color: c.score >= 80 ? '#22C55E' : '#F0B90B' }}>
                              {c.score}%
                            </span>
                            {c.score >= 80 && (
                              <span className="an-top-match-badge" title="High AI Match Candidate (>80%)">
                                <Award size={11} /> Top Match
                              </span>
                            )}
                          </div>
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
                        <td>
                          {isShortlisted ? (
                            <button
                              className="an-action-btn-small"
                              type="button"
                              title={`Schedule interview for ${c.name}`}
                              onClick={() => navigate('/recruiter/interviews/allocation')}
                            >
                              <Calendar size={13} />
                              Schedule
                            </button>
                          ) : (
                            <span className="an-td-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedCandidates.length === 0 && (
                    <tr>
                      <td colSpan="8" className="an-td-empty">
                        <span>No candidates match your search and filters.</span><button type="button" onClick={clearFilters}>Clear Filters</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="an-mobile-cards">
              {paginatedCandidates.map((c) => (
                <article className="an-mobile-card" key={c.id}>
                  <div className="an-mobile-card__head">
                    <div>
                      <strong>{c.name}</strong>
                      <span>{c.role}</span>
                      {c.score >= 80 && (
                        <span className="an-top-match-badge" style={{ marginTop: 4 }}>
                          <Award size={11} /> Top Match
                        </span>
                      )}
                    </div>
                    <b>{c.score}%</b>
                  </div>
                  <div className="an-mobile-card__details">
                    <span>Rank #{c.rank}</span>
                    <span>{c.expMatch}</span>
                    <span>{c.criteriaMet}</span>
                    <span>{c.status}</span>
                  </div>
                </article>
              ))}
              {!paginatedCandidates.length && (
                <div className="an-mobile-empty">
                  <p>No candidates match your search and filters.</p>
                  <button type="button" onClick={clearFilters}>Clear Filters</button>
                </div>
              )}
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
