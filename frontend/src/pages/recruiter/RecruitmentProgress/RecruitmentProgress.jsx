import React, { useState, useEffect } from 'react';
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
  Printer,
  Clock,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import { getInterviewSlots } from '../../../services/interviewService';
import '../../../style.css';
import './RecruitmentProgress.css';

const PROGRESS_STATS = [
  { label: 'Interview Progress', value: '68%', icon: Activity, color: '#F0B90B', bg: 'rgba(240,185,11,0.12)', change: '+12% completion' },
  { label: 'Hired This Month', value: '48', icon: UserCheck, color: '#22C55E', bg: 'rgba(34,197,94,0.12)', change: '+6 candidates' },
  { label: 'Avg Time to Hire', value: '18d', icon: Calendar, color: '#6B8CFF', bg: 'rgba(107,140,255,0.12)', change: '-2 days faster' },
  { label: 'Offer Accept Rate', value: '82%', icon: Award, color: '#F0B90B', bg: 'rgba(240,185,11,0.10)', change: 'Strong alignment' },
];

const FUNNEL_STAGES = [
  { stage: 'Applied', count: 48, pct: 100, color: '#6B8CFF' },
  { stage: 'CV Screened', count: 32, pct: 67, color: '#F0B90B' },
  { stage: 'Shortlisted', count: 9, pct: 19, color: '#F0B90B' },
  { stage: 'Assessment', count: 9, pct: 19, color: '#22C55E' },
  { stage: 'Interview Allocated', count: 3, pct: 6, color: '#22C55E' },
  { stage: 'Interview Completed', count: 1, pct: 2, color: '#22C55E' },
  { stage: 'Hired', count: 1, pct: 2, color: '#22C55E' },
];

const STAGE_PROGRESS_RECORDS = [
  { id: 'P-1', candidate: 'Alice Fernando', role: 'Senior Software Engineer', date: '22 Oct 2026', time: '09:30 AM – 10:30 AM', type: 'Online', stage: 'Technical Interview', status: 'COMPLETED' },
  { id: 'P-2', candidate: 'Kamal Perera', role: 'Senior Software Engineer', date: '02 Nov 2026', time: '02:00 PM – 03:00 PM', type: 'Physical', stage: 'HR Portfolio Review', status: 'RESCHEDULE_REQUESTED' },
  { id: 'P-3', candidate: 'Nimal Silva', role: 'Senior Software Engineer', date: '04 Nov 2026', time: '11:00 AM – 12:00 PM', type: 'Online', stage: 'System Architecture', status: 'ALLOCATED' },
  { id: 'P-4', candidate: 'Dinesh Mendis', role: 'Senior Software Engineer', date: '05 Nov 2026', time: '10:00 AM – 11:00 AM', type: 'Online', stage: 'Technical Interview', status: 'PENDING' },
  { id: 'P-5', candidate: 'Sanduni Wickramasinghe', role: 'Senior Software Engineer', date: '06 Nov 2026', time: '01:30 PM – 02:30 PM', type: 'Physical', stage: 'HR Screening', status: 'PENDING' },
  { id: 'P-6', candidate: 'Malith Senanayake', role: 'UI/UX Designer', date: '10 Nov 2026', time: '03:00 PM – 04:00 PM', type: 'Online', stage: 'Design Portfolio Review', status: 'PENDING' },
];

const TABS = [
  { id: 'applicants', label: 'Applicant Analytics', path: '/recruiter/analytics/applicants' },
  { id: 'shortlisting', label: 'Shortlisting Analytics', path: '/recruiter/analytics/shortlisting' },
  { id: 'assessment', label: 'Assessment Performance', path: '/recruiter/analytics/assessment' },
  { id: 'progress', label: 'Recruitment Progress', path: '/recruiter/analytics/progress' },
];

const formatCleanTime = (startStr, endStr) => {
  if (!startStr) return '09:30 AM – 10:30 AM';
  const clean = String(startStr).trim();
  if (clean.includes('–') || clean.includes(' - ')) {
    const parts = clean.split(/[–-]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]} – ${parts[1]}`;
    }
    return parts[0];
  }
  if (endStr && endStr !== clean) {
    return `${clean} – ${String(endStr).trim()}`;
  }
  return clean;
};

const loadProgressRecords = () => {
  try {
    const slots = getInterviewSlots();
    if (Array.isArray(slots) && slots.length > 0) {
      const liveRecords = slots
        .filter((s) => s.candidate && s.candidate.name)
        .map((s) => {
          const isCompleted = s.status === 'COMPLETED';
          const isRescheduled = s.status === 'RESCHEDULE_REQUESTED';
          return {
            id: `SLOT-${s.id}`,
            candidate: s.candidate.name,
            role: s.jobPosition || 'Senior Software Engineer',
            date: s.displayDate || s.interviewDate || '02 Nov 2026',
            time: formatCleanTime(s.startTime, s.endTime),
            type: s.interviewType || 'Online',
            stage: s.round || 'Technical Interview',
            status: isCompleted ? 'COMPLETED' : isRescheduled ? 'RESCHEDULE_REQUESTED' : 'ALLOCATED',
          };
        });

      const existingNames = new Set(liveRecords.map((r) => r.candidate.toLowerCase()));
      const remainingBaseline = STAGE_PROGRESS_RECORDS.filter(
        (b) => !existingNames.has(b.candidate.toLowerCase())
      );
      return [...liveRecords, ...remainingBaseline];
    }
  } catch (err) {
    console.error('Failed to load slots in RecruitmentProgress:', err);
  }
  return STAGE_PROGRESS_RECORDS;
};

export default function RecruitmentProgress() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allRecords, setAllRecords] = useState(loadProgressRecords);
  const [stageFilter, setStageFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const handleSync = () => {
      setAllRecords(loadProgressRecords());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const filteredRecords = allRecords.filter((r) => {
    const query = searchQuery.trim().toLowerCase();
    const matchStage = stageFilter === 'all' || r.stage.toLowerCase() === stageFilter.toLowerCase() || r.stage.toLowerCase().includes(stageFilter.toLowerCase());
    const matchRole = roleFilter === 'all' || r.role.toLowerCase() === roleFilter.toLowerCase() || r.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchSearch = !query || r.candidate.toLowerCase().includes(query) || r.role.toLowerCase().includes(query) || r.date.toLowerCase().includes(query);
    return matchStage && matchRole && matchStatus && matchSearch;
  });

  const completed = filteredRecords.filter((record) => record.status === 'COMPLETED').length;
  const scheduled = filteredRecords.filter((record) => record.status === 'ALLOCATED').length;
  const reschedules = filteredRecords.filter((record) => record.status === 'RESCHEDULE_REQUESTED').length;
  const totalAllocated = completed + scheduled + reschedules;
  const completionRate = totalAllocated ? Math.round((completed / totalAllocated) * 100) : 0;
  const progressStats = [
    { ...PROGRESS_STATS[0], value: `${completionRate}%`, change: `${completed} of ${totalAllocated} completed` },
    { ...PROGRESS_STATS[1], label: 'Completed Interviews', value: completed, change: `${totalAllocated} allocated candidates` },
    { ...PROGRESS_STATS[2], label: 'Scheduled Interviews', value: scheduled, change: 'Upcoming sessions' },
    { ...PROGRESS_STATS[3], label: 'Pending Reschedule', value: reschedules, change: reschedules > 0 ? 'Requires attention' : 'All confirmed' },
  ];
  const funnelStages = [
    { stage: 'Applied', count: 48, conversion: 100, dropOff: 0, color: '#6B8CFF' },
    { stage: 'CV Screened', count: 32, conversion: 67, dropOff: 16, color: '#F0B90B' },
    { stage: 'Shortlisted', count: 9, conversion: 28, dropOff: 23, color: '#F0B90B' },
    { stage: 'Assessment', count: 9, conversion: 100, dropOff: 0, color: '#22C55E' },
    { stage: 'Interview Allocated', count: totalAllocated, conversion: Math.round((totalAllocated / 9) * 100), dropOff: 9 - totalAllocated, color: '#22C55E' },
    { stage: 'Interview Completed', count: completed, conversion: totalAllocated ? Math.round((completed / totalAllocated) * 100) : 0, dropOff: totalAllocated - completed, color: '#22C55E' },
    { stage: 'Hired', count: completed, conversion: completed ? 100 : 0, dropOff: 0, color: '#22C55E' },
  ];
  const activeFilterCount = [stageFilter !== 'all', roleFilter !== 'all', statusFilter !== 'all', Boolean(searchQuery.trim())].filter(Boolean).length;
  const filtersActive = activeFilterCount > 0;
  const clearFilters = () => { setStageFilter('all'); setRoleFilter('all'); setStatusFilter('all'); setSearchQuery(''); setCurrentPage(1); };
  const exportReport = () => {
    const rows = [['Candidate', 'Role', 'Interview Stage', 'Date', 'Time', 'Type', 'Status'], ...filteredRecords.map((r) => [r.candidate, r.role, r.stage, r.date, r.time, r.type, r.status === 'ALLOCATED' ? 'INTERVIEW SCHEDULED' : r.status])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = 'recruitment-progress-report.csv'; link.click(); URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRecords = filteredRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="create-vacancy app-analytics-shell">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Hiring Progress"
      />

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
                {[...new Set(allRecords.map((r) => r.stage))].map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
            <div className="an-select-wrap">
              <select className="an-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Roles</option>
                {[...new Set(allRecords.map((r) => r.role))].map((role) => <option key={role}>{role}</option>)}
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
            <div className="an-select-wrap">
              <select className="an-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Statuses</option>
                <option value="ALLOCATED">Interview Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="RESCHEDULE_REQUESTED">Reschedule Requested</option>
              </select>
              <ChevronDown size={14} className="an-select-caret" />
            </div>
            {filtersActive && (
              <button type="button" className="an-clear-filter is-active" onClick={clearFilters}>
                <RotateCcw size={14} /> Clear Filters ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Clean Hiring Funnel Card */}
          <div className="an-overview-card">
            <div className="an-overview-header">
              <span className="an-chart-gold-bar" />
              <span className="an-overview-title">HIRING PIPELINE &amp; FUNNEL STAGES</span>
            </div>

            {/* Interactive Milestone Step Pipeline */}
            <div className="an-pipeline-flow">
              {funnelStages.map((stage, i) => (
                <div key={stage.stage} className="an-pipeline-step-wrap">
                  <div className="an-pipeline-step">
                    <span className="an-pipeline-step-dot" style={{ background: stage.color }} />
                    <div className="an-pipeline-step-info">
                      <span className="an-pipeline-step-name">{stage.stage}</span>
                      <strong className="an-pipeline-step-count">{stage.count.toLocaleString()}</strong>
                    </div>
                  </div>
                  {i < funnelStages.length - 1 && (
                    <span className="an-pipeline-arrow">➔</span>
                  )}
                </div>
              ))}
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
                    <th>DATE &amp; TIME</th>
                    <th>TYPE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((r) => {
                    const isCompleted = r.status === 'COMPLETED';
                    const isAllocated = r.status === 'ALLOCATED';
                    const isResched = r.status === 'RESCHEDULE_REQUESTED';
                    const stBg = isCompleted ? 'rgba(120,185,139,0.10)' : isAllocated ? 'rgba(183,164,106,0.10)' : isResched ? 'rgba(230,57,70,0.12)' : 'rgba(143,167,232,0.10)';
                    const stColor = isCompleted ? '#78B98B' : isAllocated ? '#B7A46A' : isResched ? '#E63946' : '#8FA7E8';

                    return (
                      <tr key={r.id}>
                        <td className="an-td-pos">{r.candidate}</td>
                        <td className="an-td-muted">{r.role}</td>
                        <td>
                          <span className="an-status-pill" style={{ background: 'rgba(107,140,255,0.12)', color: '#6B8CFF' }}>
                            {r.stage}
                          </span>
                        </td>
                        <td>
                          <div className="an-td-datetime">
                            <div className="an-date-pill">
                              <Calendar size={13} className="an-date-icon" />
                              <span className="an-date-text">{r.date}</span>
                            </div>
                            <div className="an-time-pill">
                              <Clock size={12} className="an-time-icon" />
                              <span className="an-time-text">{r.time}</span>
                            </div>
                          </div>
                        </td>
                        <td className="an-td-muted">{r.type}</td>
                        <td>
                          <span className="an-status-pill" style={{ background: stBg, color: stColor }}>
                            {isCompleted && <CheckCircle2 size={12} style={{ marginRight: 4 }} />}
                            {isAllocated ? 'INTERVIEW SCHEDULED' : isResched ? 'RESCHEDULE REQ' : r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedRecords.length === 0 && (
                    <tr>
                      <td colSpan="6" className="an-td-empty">
                        <span>No progress records match your search and filters.</span><button type="button" onClick={clearFilters}>Clear Filters</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="an-mobile-cards">{paginatedRecords.map((r) => <article className="an-mobile-card" key={r.id}><div className="an-mobile-card__head"><div><strong>{r.candidate}</strong><span>{r.role}</span></div><b>{r.status === 'ALLOCATED' ? 'Scheduled' : r.status}</b></div><p>{r.stage}</p><div className="an-mobile-meta"><span>{r.date} · {r.time}</span><span>{r.type}</span></div></article>)}{!paginatedRecords.length && <div className="an-mobile-empty"><p>No records match your search and filters.</p><button type="button" onClick={clearFilters}>Clear Filters</button></div>}</div>

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
