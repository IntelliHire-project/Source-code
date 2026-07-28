import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart,
  Activity,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Target,
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './ApplicantAnalytics.css';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const JOB_POSITIONS = [
  { id: 'all', label: 'All Positions' },
  { id: 'swe', label: 'Software Engineer' },
  { id: 'ux', label: 'UI/UX Designer' },
  { id: 'qa', label: 'QA Engineer' },
  { id: 'ba', label: 'Business Analyst' },
  { id: 'pm', label: 'Product Manager' },
  { id: 'devops', label: 'DevOps Engineer' },
];

const DEPARTMENTS = [
  { id: 'all', label: 'All Departments' },
  { id: 'eng', label: 'Engineering' },
  { id: 'design', label: 'Design' },
  { id: 'qa', label: 'QA & Testing' },
  { id: 'product', label: 'Product' },
  { id: 'ops', label: 'Operations' },
];

// Feature 1: Applicant Stats
const APPLICANT_STATS = [
  { label: 'Total Applicants', value: '1,284', icon: Users, color: '#F0B90B', bg: 'rgba(240,185,11,0.12)', change: '+12%', up: true },
  { label: 'New Applicants', value: '236', icon: UserCheck, color: '#22C55E', bg: 'rgba(34,197,94,0.12)', change: '+8%', up: true },
  { label: 'Shortlisted', value: '418', icon: Star, color: '#6B8CFF', bg: 'rgba(107,140,255,0.12)', change: '+5%', up: true },
  { label: 'Rejected', value: '312', icon: UserX, color: '#E63946', bg: 'rgba(230,57,70,0.12)', change: '-3%', up: false },
];

const APPLICANT_TABLE_DATA = [
  { position: 'Software Engineer', total: 218, shortlisted: 72, rejected: 58, pending: 88 },
  { position: 'UI/UX Designer', total: 156, shortlisted: 48, rejected: 42, pending: 66 },
  { position: 'QA Engineer', total: 134, shortlisted: 38, rejected: 36, pending: 60 },
  { position: 'Business Analyst', total: 192, shortlisted: 66, rejected: 51, pending: 75 },
  { position: 'Product Manager', total: 141, shortlisted: 44, rejected: 39, pending: 58 },
  { position: 'DevOps Engineer', total: 117, shortlisted: 36, rejected: 32, pending: 49 },
  { position: 'Data Scientist', total: 98, shortlisted: 28, rejected: 24, pending: 46 },
  { position: 'Cloud Architect', total: 87, shortlisted: 22, rejected: 19, pending: 46 },
];

const WEEKLY_TREND = [
  { week: 'Week 1', applications: 42 },
  { week: 'Week 2', applications: 78 },
  { week: 'Week 3', applications: 55 },
  { week: 'Week 4', applications: 110 },
  { week: 'Week 5', applications: 88 },
  { week: 'Week 6', applications: 135 },
];

const BAR_CHART_DATA = [
  { label: 'Software Engineer', value: 218 },
  { label: 'Business Analyst', value: 192 },
  { label: 'UI/UX Designer', value: 156 },
  { label: 'Product Manager', value: 141 },
  { label: 'QA Engineer', value: 134 },
  { label: 'DevOps Engineer', value: 117 },
];

// Feature 2: Shortlisting Stats
const SHORTLIST_STATS = [
  { label: 'Total Shortlisted', value: '418', icon: Star, color: '#F0B90B', bg: 'rgba(240,185,11,0.12)', change: '+5%', up: true },
  { label: 'Shortlist Rate', value: '32.6%', icon: Target, color: '#22C55E', bg: 'rgba(34,197,94,0.12)', change: '+2.1%', up: true },
  { label: 'Avg. Time to Shortlist', value: '3.2d', icon: Clock, color: '#6B8CFF', bg: 'rgba(107,140,255,0.12)', change: '-0.5d', up: true },
  { label: 'Pending Review', value: '142', icon: AlertCircle, color: '#F0B90B', bg: 'rgba(240,185,11,0.10)', change: '+10', up: false },
];

const SHORTLIST_BY_CRITERIA = [
  { criteria: 'Technical Skills', shortlisted: 280, total: 418 },
  { criteria: 'Experience', shortlisted: 310, total: 418 },
  { criteria: 'Education', shortlisted: 390, total: 418 },
  { criteria: 'Communication', shortlisted: 265, total: 418 },
  { criteria: 'Portfolio', shortlisted: 198, total: 418 },
];

const SHORTLIST_FUNNEL = [
  { stage: 'Applied', count: 1284, color: '#6B8CFF' },
  { stage: 'Screened', count: 875, color: '#F0B90B' },
  { stage: 'Shortlisted', count: 418, color: '#22C55E' },
  { stage: 'Interviewed', count: 156, color: '#F0B90B' },
  { stage: 'Offered', count: 48, color: '#22C55E' },
];

// Feature 3: Assessment Stats
const ASSESSMENT_STATS = [
  { label: 'Assessments Sent', value: '856', icon: ClipboardList, color: '#F0B90B', bg: 'rgba(240,185,11,0.12)', change: '+18%', up: true },
  { label: 'Completion Rate', value: '78.4%', icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.12)', change: '+4%', up: true },
  { label: 'Avg. Score', value: '71.2', icon: Award, color: '#6B8CFF', bg: 'rgba(107,140,255,0.12)', change: '+3.1', up: true },
  { label: 'Failed Threshold', value: '124', icon: XCircle, color: '#E63946', bg: 'rgba(230,57,70,0.12)', change: '-8', up: true },
];

const ASSESSMENT_SCORES = [
  { range: '0–20', count: 12, color: '#E63946' },
  { range: '21–40', count: 38, color: '#E63946' },
  { range: '41–60', count: 145, color: '#F0B90B' },
  { range: '61–80', count: 298, color: '#22C55E' },
  { range: '81–100', count: 178, color: '#22C55E' },
];

const ASSESSMENT_BY_ROLE = [
  { role: 'Software Engineer', sent: 218, completed: 172, avgScore: 74.2 },
  { role: 'UI/UX Designer', sent: 156, completed: 121, avgScore: 68.5 },
  { role: 'QA Engineer', sent: 134, completed: 108, avgScore: 72.1 },
  { role: 'Business Analyst', sent: 192, completed: 148, avgScore: 70.8 },
  { role: 'Product Manager', sent: 141, completed: 113, avgScore: 66.9 },
  { role: 'DevOps Engineer', sent: 117, completed: 89, avgScore: 76.4 },
];

// Feature 4: Recruitment Progress Stats
const PROGRESS_STATS = [
  { label: 'Interview Progress', value: '68%', icon: Activity, color: '#F0B90B', bg: 'rgba(240,185,11,0.12)', change: '+12%', up: true },
  { label: 'Hired This Month', value: '48', icon: UserCheck, color: '#22C55E', bg: 'rgba(34,197,94,0.12)', change: '+6', up: true },
  { label: 'Avg. Time to Hire', value: '18d', icon: Calendar, color: '#6B8CFF', bg: 'rgba(107,140,255,0.12)', change: '-2d', up: true },
  { label: 'Offer Accept Rate', value: '82%', icon: Award, color: '#F0B90B', bg: 'rgba(240,185,11,0.10)', change: '+5%', up: true },
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

const MONTHLY_HIRES = [
  { month: 'Jan', hired: 8 },
  { month: 'Feb', hired: 12 },
  { month: 'Mar', hired: 15 },
  { month: 'Apr', hired: 10 },
  { month: 'May', hired: 18 },
  { month: 'Jun', hired: 22 },
  { month: 'Jul', hired: 14 },
];

const TABS = [
  { id: 'applicants', label: 'Applicant Analytics' },
  { id: 'shortlisting', label: 'Shortlisting Analytics' },
  { id: 'assessment', label: 'Assessment Performance' },
  { id: 'progress', label: 'Recruitment Progress' },
];

// ─── SVG Chart Components ────────────────────────────────────────────────────

function DonutChart({ shortlisted, rejected, pending }) {
  const total = shortlisted + rejected + pending;
  const segments = [
    { value: shortlisted, color: '#F0B90B', label: 'Shortlisted' },
    { value: rejected, color: '#E63946', label: 'Rejected' },
    { value: pending, color: '#6B8CFF', label: 'Pending' },
  ];
  let cumulativePct = 0;
  const radius = 60, cx = 75, cy = 75;
  const circum = 2 * Math.PI * radius;

  return (
    <div className="an-donut-wrap">
      <svg viewBox="0 0 150 150" width="150" height="150">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#2A2C38" strokeWidth="22" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const offset = circum * (1 - pct);
          const rotation = cumulativePct * 360 - 90;
          cumulativePct += pct;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="22"
              strokeDasharray={`${circum * pct} ${circum * (1 - pct)}`}
              strokeDashoffset={circum * 0}
              transform={`rotate(${rotation} ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">{total.toLocaleString()}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#9599A6" fontSize="8">Total</text>
      </svg>
      <div className="an-donut-legend">
        {segments.map((s, i) => (
          <div key={i} className="an-legend-item">
            <span className="an-legend-dot" style={{ background: s.color }} />
            <span className="an-legend-label">{s.label}</span>
            <span className="an-legend-val">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.applications));
  const w = 320, h = 140, padX = 10, padY = 20;
  const pts = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (w - padX * 2);
    const y = padY + (1 - d.applications / maxVal) * (h - padY * 2);
    return `${x},${y}`;
  });
  const pointsStr = pts.join(' ');
  const areaStr = `M${pts[0]} L${pts.join(' L')} L${w - padX},${h - padY} L${padX},${h - padY} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0B90B" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F0B90B" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const y = padY + frac * (h - padY * 2);
        return <line key={i} x1={padX} y1={y} x2={w - padX} y2={y} stroke="#2A2C38" strokeWidth="1" strokeDasharray="4,4" />;
      })}
      {/* Area fill */}
      <path d={areaStr} fill="url(#lineGrad)" />
      {/* Line */}
      <polyline points={pointsStr} fill="none" stroke="#F0B90B" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots & labels */}
      {pts.map((pt, i) => {
        const [x, y] = pt.split(',').map(Number);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill="#F0B90B" stroke="#0D0E13" strokeWidth="2" />
            <text x={x} y={h - 4} textAnchor="middle" fill="#9599A6" fontSize="8">{data[i].week}</text>
          </g>
        );
      })}
    </svg>
  );
}

function HorizontalBarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.value));
  return (
    <div className="an-hbar-chart">
      {data.map((item, i) => {
        const pct = (item.value / maxVal) * 100;
        const shortLabel = item.label.replace('Engineer', 'Eng.').replace('Designer', 'Des.').replace('Analyst', 'Anal.');
        return (
          <div key={i} className="an-hbar-row">
            <span className="an-hbar-label">{shortLabel}</span>
            <div className="an-hbar-track">
              <div className="an-hbar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="an-hbar-val">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function VerticalBarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.count));
  const h = 120;
  return (
    <div className="an-vbar-wrap">
      {data.map((item, i) => {
        const barH = (item.count / maxVal) * h;
        return (
          <div key={i} className="an-vbar-col">
            <span className="an-vbar-val">{item.count}</span>
            <div className="an-vbar-track" style={{ height: h }}>
              <div className="an-vbar-fill" style={{ height: barH, background: item.color || '#F0B90B' }} />
            </div>
            <span className="an-vbar-label">{item.month || item.range}</span>
          </div>
        );
      })}
    </div>
  );
}

function FunnelChart({ data }) {
  return (
    <div className="an-funnel">
      {data.map((stage, i) => {
        const pct = stage.pct;
        return (
          <div key={i} className="an-funnel-stage">
            <div className="an-funnel-bar-wrap">
              <div className="an-funnel-bar" style={{ width: `${Math.max(pct, 10)}%`, background: stage.color }}>
                <span className="an-funnel-count">{stage.count.toLocaleString()}</span>
              </div>
            </div>
            <div className="an-funnel-meta">
              <span className="an-funnel-stage-label">{stage.stage}</span>
              <span className="an-funnel-pct">{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScoreDistChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.count));
  return (
    <div className="an-score-dist">
      {data.map((item, i) => {
        const pct = (item.count / maxVal) * 100;
        return (
          <div key={i} className="an-score-col">
            <span className="an-score-count">{item.count}</span>
            <div className="an-score-track">
              <div className="an-score-fill" style={{ height: `${pct}%`, background: item.color }} />
            </div>
            <span className="an-score-label">{item.range}</span>
          </div>
        );
      })}
    </div>
  );
}

function CriteriaBarChart({ data }) {
  return (
    <div className="an-criteria-chart">
      {data.map((item, i) => {
        const pct = Math.round((item.shortlisted / item.total) * 100);
        return (
          <div key={i} className="an-criteria-row">
            <span className="an-criteria-label">{item.criteria}</span>
            <div className="an-criteria-track">
              <div className="an-criteria-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="an-criteria-pct">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <div className="an-stat-card">
      <div className="an-stat-left">
        <span className="an-stat-label">{stat.label}</span>
        <span className="an-stat-value">{stat.value}</span>
        <span className={`an-stat-change ${stat.up ? 'up' : 'down'}`}>
          {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {stat.change} vs last period
        </span>
      </div>
      <div className="an-stat-icon" style={{ background: stat.bg, color: stat.color }}>
        <Icon size={22} />
      </div>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ position, setPosition, department, setDepartment }) {
  return (
    <div className="an-filter-bar">
      <span className="an-filter-label"><Filter size={14} /> FILTERS:</span>
      <div className="an-select-wrap">
        <select className="an-select" value={position} onChange={e => setPosition(e.target.value)}>
          {JOB_POSITIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <ChevronDown size={14} className="an-select-caret" />
      </div>
      <div className="an-select-wrap">
        <select className="an-select" value={department} onChange={e => setDepartment(e.target.value)}>
          {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <ChevronDown size={14} className="an-select-caret" />
      </div>
      <div className="an-date-range">
        <Calendar size={14} />
        <span>Oct 1, 2026 – Oct 31, 2026</span>
      </div>
    </div>
  );
}

// ─── Feature 1: Applicant Analytics ─────────────────────────────────────────
function ApplicantFeature() {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const totalPages = Math.ceil(APPLICANT_TABLE_DATA.length / rowsPerPage);
  const pageData = APPLICANT_TABLE_DATA.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const totals = useMemo(() => ({
    shortlisted: APPLICANT_TABLE_DATA.reduce((s, r) => s + r.shortlisted, 0),
    rejected: APPLICANT_TABLE_DATA.reduce((s, r) => s + r.rejected, 0),
    pending: APPLICANT_TABLE_DATA.reduce((s, r) => s + r.pending, 0),
  }), []);

  return (
    <div className="an-feature-content">
      {/* Charts row */}
      <div className="an-charts-row">
        {/* Bar chart */}
        <div className="an-chart-card an-chart-card--bar">
          <div className="an-chart-header">
            <span className="an-chart-gold-bar" />
            <span className="an-chart-title">APPLICANTS BY JOB POSITION</span>
          </div>
          <HorizontalBarChart data={BAR_CHART_DATA} />
        </div>

        {/* Line chart */}
        <div className="an-chart-card an-chart-card--line">
          <div className="an-chart-header">
            <span className="an-chart-gold-bar" />
            <span className="an-chart-title">APPLICATION TREND</span>
          </div>
          <LineChart data={WEEKLY_TREND} />
        </div>

        {/* Donut chart */}
        <div className="an-chart-card an-chart-card--donut">
          <div className="an-chart-header">
            <span className="an-chart-gold-bar" />
            <span className="an-chart-title">APPLICANT STATUS</span>
          </div>
          <DonutChart
            shortlisted={totals.shortlisted}
            rejected={totals.rejected}
            pending={totals.pending}
          />
        </div>
      </div>

      {/* Summary Table */}
      <div className="an-table-section">
        <div className="an-section-header">
          <span className="an-chart-gold-bar" />
          <span className="an-section-title">APPLICANTS SUMMARY</span>
        </div>
        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th>JOB POSITION</th>
                <th>TOTAL</th>
                <th>SHORTLISTED</th>
                <th>REJECTED</th>
                <th>PENDING</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, i) => (
                <tr key={i}>
                  <td className="an-td-pos">{row.position}</td>
                  <td>{row.total}</td>
                  <td className="an-td-shortlisted">{row.shortlisted}</td>
                  <td className="an-td-muted">{row.rejected}</td>
                  <td className="an-td-pending">{row.pending}</td>
                  <td><button className="an-row-action"><MoreVertical size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="an-pagination">
          <span className="an-pagination-info">
            Showing <strong>{(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, APPLICANT_TABLE_DATA.length)}</strong> of <strong>{APPLICANT_TABLE_DATA.length}</strong> records
          </span>
          <div className="an-pagination-controls">
            <button className="an-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft size={14} /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`an-page-btn an-page-num ${currentPage === i + 1 ? 'is-active' : ''}`} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="an-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature 2: Shortlisting Analytics ───────────────────────────────────────
function ShortlistingFeature() {
  return (
    <div className="an-feature-content">
      <div className="an-charts-row">
        {/* Funnel */}
        <div className="an-chart-card an-chart-card--wide">
          <div className="an-chart-header">
            <span className="an-chart-gold-bar" />
            <span className="an-chart-title">SHORTLISTING FUNNEL</span>
          </div>
          <FunnelChart data={SHORTLIST_FUNNEL} />
        </div>

        {/* Criteria */}
        <div className="an-chart-card an-chart-card--bar">
          <div className="an-chart-header">
            <span className="an-chart-gold-bar" />
            <span className="an-chart-title">SHORTLISTING BY CRITERIA</span>
          </div>
          <CriteriaBarChart data={SHORTLIST_BY_CRITERIA} />
        </div>
      </div>

      {/* Shortlist table */}
      <div className="an-table-section">
        <div className="an-section-header">
          <span className="an-chart-gold-bar" />
          <span className="an-section-title">SHORTLISTING BREAKDOWN</span>
        </div>
        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th>JOB POSITION</th>
                <th>TOTAL</th>
                <th>SHORTLISTED</th>
                <th>SHORTLIST RATE</th>
                <th>REJECTED</th>
                <th>PENDING</th>
              </tr>
            </thead>
            <tbody>
              {APPLICANT_TABLE_DATA.map((row, i) => {
                const rate = ((row.shortlisted / row.total) * 100).toFixed(1);
                return (
                  <tr key={i}>
                    <td className="an-td-pos">{row.position}</td>
                    <td>{row.total}</td>
                    <td className="an-td-shortlisted">{row.shortlisted}</td>
                    <td>
                      <div className="an-rate-bar-wrap">
                        <div className="an-rate-bar" style={{ width: `${rate}%` }} />
                        <span className="an-rate-label">{rate}%</span>
                      </div>
                    </td>
                    <td className="an-td-muted">{row.rejected}</td>
                    <td className="an-td-pending">{row.pending}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Feature 3: Assessment Performance ───────────────────────────────────────
function AssessmentFeature() {
  return (
    <div className="an-feature-content">
      <div className="an-charts-row">
        {/* Score distribution */}
        <div className="an-chart-card an-chart-card--bar">
          <div className="an-chart-header">
            <span className="an-chart-gold-bar" />
            <span className="an-chart-title">SCORE DISTRIBUTION</span>
          </div>
          <ScoreDistChart data={ASSESSMENT_SCORES} />
        </div>

        {/* Completion rate */}
        <div className="an-chart-card an-chart-card--donut">
          <div className="an-chart-header">
            <span className="an-chart-gold-bar" />
            <span className="an-chart-title">COMPLETION STATUS</span>
          </div>
          <DonutChart shortlisted={671} rejected={124} pending={61} />
        </div>

        {/* Monthly trend */}
        <div className="an-chart-card an-chart-card--line">
          <div className="an-chart-header">
            <span className="an-chart-gold-bar" />
            <span className="an-chart-title">ASSESSMENT SUBMISSIONS</span>
          </div>
          <LineChart data={WEEKLY_TREND.map(d => ({ ...d, applications: Math.round(d.applications * 0.78) }))} />
        </div>
      </div>

      {/* Assessment by role table */}
      <div className="an-table-section">
        <div className="an-section-header">
          <span className="an-chart-gold-bar" />
          <span className="an-section-title">ASSESSMENT PERFORMANCE BY ROLE</span>
        </div>
        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th>JOB POSITION</th>
                <th>ASSESSMENTS SENT</th>
                <th>COMPLETED</th>
                <th>COMPLETION RATE</th>
                <th>AVG. SCORE</th>
                <th>PASS RATE</th>
              </tr>
            </thead>
            <tbody>
              {ASSESSMENT_BY_ROLE.map((row, i) => {
                const compRate = ((row.completed / row.sent) * 100).toFixed(1);
                const passRate = (Math.min(row.avgScore / 100 * 1.4, 0.95) * 100).toFixed(1);
                const scoreColor = row.avgScore >= 75 ? '#22C55E' : row.avgScore >= 60 ? '#F0B90B' : '#E63946';
                return (
                  <tr key={i}>
                    <td className="an-td-pos">{row.role}</td>
                    <td>{row.sent}</td>
                    <td>{row.completed}</td>
                    <td>
                      <div className="an-rate-bar-wrap">
                        <div className="an-rate-bar" style={{ width: `${compRate}%` }} />
                        <span className="an-rate-label">{compRate}%</span>
                      </div>
                    </td>
                    <td style={{ color: scoreColor, fontWeight: 600 }}>{row.avgScore}</td>
                    <td className="an-td-shortlisted">{passRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Feature 4: Recruitment Progress ─────────────────────────────────────────
function ProgressFeature() {
  return (
    <div className="an-feature-content">
      <div className="an-charts-row">
        {/* Hiring funnel */}
        <div className="an-chart-card an-chart-card--wide">
          <div className="an-chart-header">
            <span className="an-chart-gold-bar" />
            <span className="an-chart-title">RECRUITMENT FUNNEL</span>
          </div>
          <FunnelChart data={FUNNEL_STAGES} />
        </div>

        {/* Monthly hires bar */}
        <div className="an-chart-card an-chart-card--bar">
          <div className="an-chart-header">
            <span className="an-chart-gold-bar" />
            <span className="an-chart-title">MONTHLY HIRES</span>
          </div>
          <VerticalBarChart data={MONTHLY_HIRES} />
        </div>
      </div>

      {/* Stage transition table */}
      <div className="an-table-section">
        <div className="an-section-header">
          <span className="an-chart-gold-bar" />
          <span className="an-section-title">FUNNEL STAGE DETAILS</span>
        </div>
        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th>STAGE</th>
                <th>CANDIDATES</th>
                <th>CONVERSION RATE</th>
                <th>PASS RATE</th>
                <th>AVG. TIME (DAYS)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {FUNNEL_STAGES.map((stage, i) => {
                const next = FUNNEL_STAGES[i + 1];
                const convRate = next ? ((next.count / stage.count) * 100).toFixed(1) : '—';
                const avgDays = [2, 4, 3, 5, 7, 6, 1][i];
                const statusColor = stage.color;
                const statusLabel = i === FUNNEL_STAGES.length - 1 ? 'Final' : 'Active';
                return (
                  <tr key={i}>
                    <td className="an-td-pos">{stage.stage}</td>
                    <td>{stage.count.toLocaleString()}</td>
                    <td>
                      {next ? (
                        <div className="an-rate-bar-wrap">
                          <div className="an-rate-bar" style={{ width: `${convRate}%`, background: stage.color }} />
                          <span className="an-rate-label">{convRate}%</span>
                        </div>
                      ) : <span className="an-td-muted">—</span>}
                    </td>
                    <td style={{ color: stage.color, fontWeight: 600 }}>{stage.pct}%</td>
                    <td className="an-td-muted">{avgDays}d</td>
                    <td>
                      <span className="an-status-pill" style={{ background: `${statusColor}20`, color: statusColor }}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function ApplicantAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('applicants');
  const [position, setPosition] = useState('all');
  const [department, setDepartment] = useState('all');

  const statsMap = {
    applicants: APPLICANT_STATS,
    shortlisting: SHORTLIST_STATS,
    assessment: ASSESSMENT_STATS,
    progress: PROGRESS_STATS,
  };

  const currentStats = statsMap[activeTab];

  return (
    <div className="create-vacancy">
      <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          searchPlaceholder="Search analytics, role…"
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="an-page-wrapper">
          {/* ── Page Header ─────────────────────────────────────────── */}
          <div className="an-page-header">
            <div>
              <h1 className="an-page-title">Recruiter Analytics Dashboard</h1>
              <p className="an-page-subtitle">Monitor applicant statistics across all recruitment campaigns.</p>
            </div>
            <button className="an-export-btn">
              <Download size={16} />
              Export Report
            </button>
          </div>

          {/* ── Tabs ────────────────────────────────────────────────── */}
          <div className="an-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`an-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Stat Cards ──────────────────────────────────────────── */}
          <div className="an-stats-grid">
            {currentStats.map((stat, i) => <StatCard key={i} stat={stat} />)}
          </div>

          {/* ── Filter Bar ──────────────────────────────────────────── */}
          <FilterBar
            position={position} setPosition={setPosition}
            department={department} setDepartment={setDepartment}
          />

          {/* ── Feature Content ─────────────────────────────────────── */}
          {activeTab === 'applicants' && <ApplicantFeature />}
          {activeTab === 'shortlisting' && <ShortlistingFeature />}
          {activeTab === 'assessment' && <AssessmentFeature />}
          {activeTab === 'progress' && <ProgressFeature />}
        </main>
      </div>
    </div>
  );
}

// Alias for missing icon
function ClipboardList(props) { return <BarChart2 {...props} />; }

export default ApplicantAnalytics;
