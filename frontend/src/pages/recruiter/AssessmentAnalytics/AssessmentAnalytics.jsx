import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  CheckCircle,
  Award,
  XCircle,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './AssessmentAnalytics.css';

const ASSESSMENT_STATS = [
  { label: 'Assessments Sent', value: '856', icon: BarChart2, color: '#F0B90B', bg: 'rgba(240,185,11,0.12)' },
  { label: 'Completion Rate', value: '78.4%', icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  { label: 'Avg Assessment Score', value: '71.2', icon: Award, color: '#6B8CFF', bg: 'rgba(107,140,255,0.12)' },
  { label: 'Failed Threshold', value: '124', icon: XCircle, color: '#E63946', bg: 'rgba(230,57,70,0.12)' },
];

const SCORE_DISTRIBUTION = [
  { range: '81–100 Score', label: 'High Distinction', count: 178, pct: 26.5, color: '#22C55E' },
  { range: '61–80 Score', label: 'Good Performance', count: 298, pct: 44.4, color: '#22C55E' },
  { range: '41–60 Score', label: 'Average Score', count: 145, pct: 21.6, color: '#F0B90B' },
  { range: '21–40 Score', label: 'Needs Improvement', count: 38, pct: 5.7, color: '#E63946' },
  { range: '0–20 Score', label: 'Below Threshold', count: 12, pct: 1.8, color: '#E63946' },
];

const PANEL_EVALUATIONS = [
  { id: 'E-1', candidate: 'Alice Fernando', role: 'Senior Fullstack Engineer', round: 'Technical', comm: 4, tech: 5, problem: 4, teamwork: 4, overall: '4.5 / 5', recommendation: 'Hire' },
  { id: 'E-2', candidate: 'Kamal Perera', role: 'UI/UX Designer', round: 'HR Portfolio Review', comm: 4, tech: 3, problem: 4, teamwork: 5, overall: '4.0 / 5', recommendation: 'Hold' },
  { id: 'E-3', candidate: 'Nimal Silva', role: 'QA Automation Engineer', round: 'Final Cultural Fit', comm: 3, tech: 4, problem: 3, teamwork: 4, overall: '3.5 / 5', recommendation: 'Reject' },
  { id: 'E-4', candidate: 'Sara Jayawardena', role: 'Business Analyst', round: 'Technical Case Study', comm: 5, tech: 4, problem: 5, teamwork: 5, overall: '4.8 / 5', recommendation: 'Hire' },
  { id: 'E-5', candidate: 'Ruwan Bandara', role: 'Product Manager', round: 'HR Screening', comm: 4, tech: 3, problem: 4, teamwork: 4, overall: '3.8 / 5', recommendation: 'Hold' },
  { id: 'E-6', candidate: 'Dilhani Wickramasinghe', role: 'DevOps Lead', round: 'Architecture Final', comm: 4, tech: 5, problem: 5, teamwork: 3, overall: '4.3 / 5', recommendation: 'Hire' },
];

const TABS = [
  { id: 'applicants', label: 'Applicant Analytics', path: '/recruiter/analytics/applicants' },
  { id: 'shortlisting', label: 'Shortlisting Analytics', path: '/recruiter/analytics/shortlisting' },
  { id: 'assessment', label: 'Assessment Performance', path: '/recruiter/analytics/assessment' },
  { id: 'progress', label: 'Recruitment Progress', path: '/recruiter/analytics/progress' },
];

export default function AssessmentAnalytics() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredEvals = PANEL_EVALUATIONS.filter((e) => {
    if (roleFilter === 'all') return true;
    return e.role.toLowerCase().includes(roleFilter.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvals.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEvals = filteredEvals.slice((safePage - 1) * pageSize, safePage * pageSize);

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
            { label: 'Assessment Performance' },
          ]}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="an-page-wrapper">
          {/* Header */}
          <div className="an-page-header">
            <div>
              <h1 className="an-page-title">Assessment Performance Analytics</h1>
              <p className="an-page-subtitle">Clean breakdown of assessment performance, score ranges &amp; panel feedback.</p>
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
                className={`an-tab ${tab.id === 'assessment' ? 'is-active' : ''}`}
                onClick={() => navigate(tab.path)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* KPI Stat Cards */}
          <div className="an-stats-grid">
            {ASSESSMENT_STATS.map((stat, i) => {
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
                <option value="QA Automation Engineer">QA Automation Engineer</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="Product Manager">Product Manager</option>
                <option value="DevOps Lead">DevOps Lead</option>
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
          </div>

          {/* Clean Overview Card: Score Distribution Bars */}
          <div className="an-overview-card">
            <div className="an-overview-header">
              <span className="an-chart-gold-bar" />
              <span className="an-overview-title">ASSESSMENT SCORE DISTRIBUTION</span>
            </div>
            <div className="an-dist-container">
              {SCORE_DISTRIBUTION.map((item, i) => (
                <div key={i} className="an-dist-bar-item">
                  <div className="an-dist-bar-header">
                    <span className="an-score-tag">{item.range}</span>
                    <span className="an-dist-label">{item.label}</span>
                    <span className="an-dist-val">{item.count} candidates ({item.pct}%)</span>
                  </div>
                  <div className="an-dist-track">
                    <div className="an-dist-fill" style={{ width: `${item.pct * 2}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel Evaluations Table */}
          <div className="an-table-section">
            <div className="an-section-header">
              <span className="an-chart-gold-bar" />
              <span className="an-section-title">PANEL EVALUATION PERFORMANCE SUMMARY</span>
            </div>

            <div className="an-table-wrap">
              <table className="an-table">
                <thead>
                  <tr>
                    <th>CANDIDATE</th>
                    <th>ROLE</th>
                    <th>ROUND</th>
                    <th>COMM SKILLS</th>
                    <th>TECH SKILLS</th>
                    <th>PROBLEM SOLVING</th>
                    <th>TEAMWORK</th>
                    <th>OVERALL</th>
                    <th>RECOMMENDATION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvals.map((e) => {
                    const recColor = e.recommendation === 'Hire' ? '#22C55E' : e.recommendation === 'Hold' ? '#F0B90B' : '#E63946';
                    return (
                      <tr key={e.id}>
                        <td className="an-td-pos">{e.candidate}</td>
                        <td className="an-td-muted">{e.role}</td>
                        <td className="an-td-muted">{e.round}</td>
                        <td><span className="an-star-rating">{'★'.repeat(e.comm)}{'☆'.repeat(5 - e.comm)}</span></td>
                        <td><span className="an-star-rating">{'★'.repeat(e.tech)}{'☆'.repeat(5 - e.tech)}</span></td>
                        <td><span className="an-star-rating">{'★'.repeat(e.problem)}{'☆'.repeat(5 - e.problem)}</span></td>
                        <td><span className="an-star-rating">{'★'.repeat(e.teamwork)}{'☆'.repeat(5 - e.teamwork)}</span></td>
                        <td><span className="an-score-badge" style={{ color: '#F0B90B' }}>{e.overall}</span></td>
                        <td>
                          <span className="an-status-pill" style={{ background: `${recColor}20`, color: recColor }}>
                            {e.recommendation}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedEvals.length === 0 && (
                    <tr>
                      <td colSpan="9" className="an-td-empty">
                        No evaluation records match your selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="an-pagination">
              <span className="an-pagination-info">
                Showing <strong>{filteredEvals.length > 0 ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filteredEvals.length)}</strong> of <strong>{filteredEvals.length}</strong> evaluations
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
