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
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './ShortlistingAnalytics.css';

const SHORTLIST_STATS = [
  { label: 'Total Shortlisted', value: '418', icon: Star, color: '#F0B90B', bg: 'rgba(240,185,11,0.12)' },
  { label: 'Shortlist Rate', value: '32.6%', icon: Target, color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  { label: 'Avg Time to Shortlist', value: '3.2d', icon: Clock, color: '#6B8CFF', bg: 'rgba(107,140,255,0.12)' },
  { label: 'Pending Review', value: '142', icon: AlertCircle, color: '#F0B90B', bg: 'rgba(240,185,11,0.10)' },
];

const CRITERIA_METRICS = [
  { criteria: 'Technical Skills Match', shortlisted: 280, total: 418, pct: 67 },
  { criteria: 'Relevant Experience', shortlisted: 310, total: 418, pct: 74 },
  { criteria: 'Educational Qualification', shortlisted: 390, total: 418, pct: 93 },
  { criteria: 'Communication & Soft Skills', shortlisted: 265, total: 418, pct: 63 },
  { criteria: 'Portfolio & System Projects', shortlisted: 198, total: 418, pct: 47 },
];

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredCandidates = SHORTLISTED_CANDIDATES.filter((c) => {
    if (roleFilter === 'all') return true;
    return c.role.toLowerCase().includes(roleFilter.toLowerCase());
  });

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
          {/* Header */}
          <div className="an-page-header">
            <div>
              <h1 className="an-page-title">Shortlisting Analytics</h1>
              <p className="an-page-subtitle">Clean breakdown of shortlisted candidates and requirement matches.</p>
            </div>
            <button className="an-export-btn" type="button">
              <Download size={16} />
              Export Report
            </button>
          </div>

          {/* Sub Nav Tabs */}
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

          {/* KPI Stat Cards */}
          <div className="an-stats-grid">
            {SHORTLIST_STATS.map((stat, i) => {
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
          </div>

          {/* Clean Overview Card: Criteria Match Breakdown */}
          <div className="an-overview-card">
            <div className="an-overview-header">
              <span className="an-chart-gold-bar" />
              <span className="an-overview-title">SHORTLISTING METRICS BY CRITERIA</span>
            </div>
            <div className="an-dist-container">
              {CRITERIA_METRICS.map((item, i) => (
                <div key={i} className="an-dist-bar-item">
                  <div className="an-dist-bar-header">
                    <span className="an-dist-label">{item.criteria}</span>
                    <span className="an-dist-val">{item.shortlisted} / {item.total} ({item.pct}%)</span>
                  </div>
                  <div className="an-dist-track">
                    <div className="an-dist-fill" style={{ width: `${item.pct}%`, background: item.pct >= 70 ? '#22C55E' : '#F0B90B' }} />
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
                    const statusBg = isShortlisted ? 'rgba(34,197,94,0.15)' : isUnderReview ? 'rgba(240,185,11,0.15)' : 'rgba(230,57,70,0.15)';
                    const statusColor = isShortlisted ? '#22C55E' : isUnderReview ? '#F0B90B' : '#E63946';

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
                        No shortlisted candidates match your selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="an-pagination">
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
