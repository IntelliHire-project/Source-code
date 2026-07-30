import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  UserCheck,
  Calendar,
  Award,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Search,
  RotateCcw,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './RecruitmentProgress.css';

const PROGRESS_STATS = [
  { label: 'Interview Progress', value: '68%', icon: Activity, color: '#F0B90B', bg: 'rgba(240,185,11,0.12)', change: '+12% completion' },
  { label: 'Hired This Month', value: '48', icon: UserCheck, color: '#22C55E', bg: 'rgba(34,197,94,0.12)', change: '+6 candidates' },
  { label: 'Avg Time to Hire', value: '18d', icon: Calendar, color: '#6B8CFF', bg: 'rgba(107,140,255,0.12)', change: '-2 days faster' },
  { label: 'Offer Accept Rate', value: '82%', icon: Award, color: '#F0B90B', bg: 'rgba(240,185,11,0.10)', change: 'Strong alignment' },
];

const FUNNEL_STAGES = [
  { stage: 'Applied', count: 1284, pct: 100, color: '#6B8CFF' },
  { stage: 'CV Screened', count: 875, pct: 68, color: '#F0B90B' },
  { stage: 'Shortlisted', count: 418, pct: 33, color: '#F0B90B' },
  { stage: 'Assessment', count: 312, pct: 24, color: '#22C55E' },
  { stage: 'Interview', count: 156, pct: 12, color: '#22C55E' },
  { stage: 'Final Round', count: 72, pct: 6, color: '#22C55E' },
  { stage: 'Hired', count: 48, pct: 4, color: '#22C55E' },
];

const STAGE_PROGRESS_RECORDS = [
  { id: 'P-1', candidate: 'Alice Fernando', role: 'Senior Fullstack Engineer', slotId: 'SLOT-101', date: '03 Aug 2026', time: '09:00 AM', type: 'Online', stage: 'Technical Round', status: 'ALLOCATED' },
  { id: 'P-2', candidate: 'Kamal Perera', role: 'UI/UX Designer', slotId: 'SLOT-103', date: '04 Aug 2026', time: '11:00 AM', type: 'Physical', stage: 'HR Portfolio', status: 'ALLOCATED' },
  { id: 'P-3', candidate: 'Nimal Silva', role: 'QA Automation Engineer', slotId: 'SLOT-104', date: '05 Aug 2026', time: '02:00 PM', type: 'Online', stage: 'Cultural Fit', status: 'COMPLETED' },
  { id: 'P-4', candidate: 'Sara Jayawardena', role: 'Business Analyst', slotId: 'SLOT-105', date: '06 Aug 2026', time: '10:00 AM', type: 'Physical', stage: 'Case Study', status: 'ALLOCATED' },
  { id: 'P-5', candidate: 'Ruwan Bandara', role: 'Product Manager', slotId: 'SLOT-106', date: '07 Aug 2026', time: '09:00 AM', type: 'Online', stage: 'HR Screening', status: 'PENDING' },
  { id: 'P-6', candidate: 'Dilhani Wickramasinghe', role: 'DevOps Lead', slotId: 'SLOT-107', date: '10 Aug 2026', time: '03:00 PM', type: 'Physical', stage: 'Architecture Final', status: 'COMPLETED' },
];

const TABS = [
  { id: 'applicants', label: 'Applicant Analytics', path: '/recruiter/analytics/applicants' },
  { id: 'shortlisting', label: 'Shortlisting Analytics', path: '/recruiter/analytics/shortlisting' },
  { id: 'assessment', label: 'Assessment Performance', path: '/recruiter/analytics/assessment' },
  { id: 'progress', label: 'Recruitment Progress', path: '/recruiter/analytics/progress' },
];

export default function RecruitmentProgress() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredRecords = STAGE_PROGRESS_RECORDS.filter((r) => {
    const query = searchQuery.trim().toLowerCase();
    return (stageFilter === 'all' || r.stage === stageFilter)
      && (roleFilter === 'all' || r.role === roleFilter)
      && (statusFilter === 'all' || r.status === statusFilter)
      && (!query || r.candidate.toLowerCase().includes(query) || r.role.toLowerCase().includes(query));
  });

  const completed = filteredRecords.filter((record) => record.status === 'COMPLETED').length;
  const scheduled = filteredRecords.filter((record) => record.status === 'ALLOCATED').length;
  const pending = filteredRecords.filter((record) => record.status === 'PENDING').length;
  const completionRate = filteredRecords.length ? Math.round((completed / filteredRecords.length) * 100) : 0;
  const progressStats = [
    { ...PROGRESS_STATS[0], value: `${completionRate}%`, change: `${completed} completed` },
    { ...PROGRESS_STATS[1], label: 'Completed Interviews', value: completed, change: `${filteredRecords.length} total records` },
    { ...PROGRESS_STATS[2], label: 'Scheduled Interviews', value: scheduled, change: 'Interview scheduled' },
    { ...PROGRESS_STATS[3], label: 'Pending Scheduling', value: pending, change: 'Requires attention' },
  ];
  const scale = filteredRecords.length / STAGE_PROGRESS_RECORDS.length;
  const funnelStages = FUNNEL_STAGES.map((stage, index) => {
    const count = Math.round(stage.count * scale);
    const previous = index ? Math.round(FUNNEL_STAGES[index - 1].count * scale) : count;
    return { ...stage, count, conversion: index ? (previous ? Math.round((count / previous) * 100) : 0) : 100, dropOff: index ? Math.max(previous - count, 0) : 0 };
  });
  const filtersActive = stageFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim();
  const clearFilters = () => { setStageFilter('all'); setRoleFilter('all'); setStatusFilter('all'); setSearchQuery(''); setCurrentPage(1); };
  const exportReport = () => {
    const rows = [['Candidate', 'Role', 'Interview Stage', 'Slot ID', 'Date', 'Time', 'Type', 'Status'], ...filteredRecords.map((r) => [r.candidate, r.role, r.stage, r.slotId, r.date, r.time, r.type, r.status === 'ALLOCATED' ? 'INTERVIEW SCHEDULED' : r.status])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = 'recruitment-progress-report.csv'; link.click(); URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRecords = filteredRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

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
            { label: 'Recruitment Progress' },
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
                className={`an-tab ${tab.id === 'progress' ? 'is-active' : ''}`}
                onClick={() => navigate(tab.path)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="an-page-header">
            <div>
              <h1 className="an-page-title">Recruitment Progress &amp; Hiring Funnel</h1>
              <p className="an-page-subtitle">Monitor pipeline stage conversion, interview allocations, and hiring completion metrics.</p>
            </div>
            <button className="an-export-btn" type="button" onClick={exportReport}>
              <Download size={16} />
              Export Report
            </button>
          </div>

          {/* KPI Stat Cards */}
          <div className="an-stats-grid">
            {progressStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="an-stat-card">
                  <div className="an-stat-info">
                    <span className="an-stat-label">{stat.label}</span>
                    <span className="an-stat-value">{stat.value}</span>
                    <span className="an-stat-subtext"><TrendingUp size={12} /> {stat.change}</span>
                  </div>
                  <div className="an-stat-icon" style={{ background: stat.bg, color: stat.color }}>
                    <Icon size={22} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter Bar */}
          <div className="an-filter-bar">
            <span className="an-filter-label">
              <Filter size={14} /> FILTERS:
            </span>
            <label className="an-local-search"><Search size={15} /><input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search candidates..." /></label>
            <div className="an-select-wrap">
              <select
                className="an-select"
                value={stageFilter}
                onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Stages</option>
                <option value="Technical Round">Technical Round</option>
                <option value="HR Portfolio">HR Portfolio</option>
                <option value="Cultural Fit">Cultural Fit</option>
                <option value="Case Study">Case Study</option>
                <option value="HR Screening">HR Screening</option>
                <option value="Architecture Final">Architecture Final</option>
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
            <div className="an-select-wrap"><select className="an-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}><option value="all">All Roles</option>{[...new Set(STAGE_PROGRESS_RECORDS.map((r) => r.role))].map((role) => <option key={role}>{role}</option>)}</select><ChevronDown size={14} className="an-select-caret" /></div>
            <div className="an-select-wrap"><select className="an-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}><option value="all">All Statuses</option><option value="ALLOCATED">Interview Scheduled</option><option value="COMPLETED">Completed</option><option value="PENDING">Pending</option></select><ChevronDown size={14} className="an-select-caret" /></div>
            {filtersActive && <button type="button" className="an-clear-filter" onClick={clearFilters}><RotateCcw size={14} /> Clear Filters</button>}
          </div>

          {/* Clean Hiring Funnel Card */}
          <div className="an-overview-card">
            <div className="an-overview-header">
              <span className="an-chart-gold-bar" />
              <span className="an-overview-title">HIRING PIPELINE &amp; FUNNEL STAGES</span>
            </div>
            <div className="an-funnel">
              {funnelStages.map((stage, i) => (
                <div key={i} className="an-funnel-stage">
                  <div className="an-funnel-label-row">
                    <span className="an-funnel-stage-name">{stage.stage}</span>
                    <span className="an-funnel-pct">{stage.pct}%</span>
                    <span className="an-funnel-count-text">{stage.count.toLocaleString()} candidates</span>
                    {i > 0 && <span className="an-funnel-conversion">{stage.conversion}% conversion · {stage.dropOff.toLocaleString()} drop-off</span>}
                  </div>
                  <div className="an-dist-track">
                    <div
                      className="an-dist-fill"
                      style={{ width: `${stage.pct}%`, background: stage.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allocation Progress Table */}
          <div className="an-table-section">
            <div className="an-section-header">
              <span className="an-chart-gold-bar" />
              <span className="an-section-title">INTERVIEW STAGE &amp; ALLOCATION TRACKING</span>
            </div>

            <div className="an-table-wrap">
              <table className="an-table">
                <thead>
                  <tr>
                    <th>CANDIDATE NAME</th>
                    <th>ROLE</th>
                    <th>INTERVIEW STAGE</th>
                    <th>SLOT ID</th>
                    <th>DATE &amp; TIME</th>
                    <th>TYPE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((r) => {
                    const isCompleted = r.status === 'COMPLETED';
                    const isAllocated = r.status === 'ALLOCATED';
                    const stBg = isCompleted ? 'rgba(120,185,139,0.10)' : isAllocated ? 'rgba(183,164,106,0.10)' : 'rgba(143,167,232,0.10)';
                    const stColor = isCompleted ? '#78B98B' : isAllocated ? '#B7A46A' : '#8FA7E8';

                    return (
                      <tr key={r.id}>
                        <td className="an-td-pos">{r.candidate}</td>
                        <td className="an-td-muted">{r.role}</td>
                        <td>
                          <span className="an-status-pill" style={{ background: 'rgba(107,140,255,0.12)', color: '#6B8CFF' }}>
                            {r.stage}
                          </span>
                        </td>
                        <td className="an-td-muted">{r.slotId}</td>
                        <td className="an-td-muted">{r.date} ({r.time})</td>
                        <td className="an-td-muted">{r.type}</td>
                        <td>
                          <span className="an-status-pill" style={{ background: stBg, color: stColor }}>
                            {isCompleted && <CheckCircle2 size={12} style={{ marginRight: 4 }} />}
                            {isAllocated ? 'INTERVIEW SCHEDULED' : r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedRecords.length === 0 && (
                    <tr>
                      <td colSpan="7" className="an-td-empty">
                        <span>No progress records match your search and filters.</span><button type="button" onClick={clearFilters}>Clear Filters</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="an-mobile-cards">{paginatedRecords.map((r) => <article className="an-mobile-card" key={r.id}><div className="an-mobile-card__head"><div><strong>{r.candidate}</strong><span>{r.role}</span></div><b>{r.status === 'ALLOCATED' ? 'Scheduled' : r.status}</b></div><p>{r.stage}</p><div className="an-mobile-meta"><span>{r.date} · {r.time}</span><span>{r.type} · {r.slotId}</span></div></article>)}{!paginatedRecords.length && <div className="an-mobile-empty"><p>No records match your search and filters.</p><button type="button" onClick={clearFilters}>Clear Filters</button></div>}</div>

            {/* Pagination Controls */}
            {filteredRecords.length > pageSize && <div className="an-pagination">
              <span className="an-pagination-info">
                Showing <strong>{filteredRecords.length > 0 ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filteredRecords.length)}</strong> of <strong>{filteredRecords.length}</strong> records
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
