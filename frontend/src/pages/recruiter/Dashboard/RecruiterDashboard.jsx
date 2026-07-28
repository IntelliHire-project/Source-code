import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Plus,
  Search,
  FileText,
  Activity,
  MoreVertical,
  Building,
  ChevronRight,
  Sparkles,
  Clock3,
  Bell,
  UserCheck,
  Smile,
  Percent,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  UserCheck2,
  CalendarDays,
  FileSpreadsheet,
  ArrowRight,
  Info
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './RecruiterDashboard.css';

// Mock Data Sets
const STATS = [
  { label: 'Active Job Postings', value: '12', icon: Briefcase, color: '#F0B90B', bg: 'rgba(240, 185, 11, 0.12)', change: '+2', up: true },
  { label: 'Total Applicants', value: '284', icon: Users, color: '#6B8CFF', bg: 'rgba(107, 140, 255, 0.12)', change: '+45', up: true },
  { label: 'AI Shortlisted', value: '95', icon: Sparkles, color: '#22C55E', bg: 'rgba(34, 197, 94, 0.12)', change: '84%', up: true },
  { label: 'Interviews Today', value: '8', icon: Calendar, color: '#a371f7', bg: 'rgba(163, 113, 247, 0.12)', change: '3 Onsite', up: null },
];

const PIPELINE_STEPS = [
  { label: 'Applications Received', count: 450, status: 'completed' },
  { label: 'AI Screening', count: 380, status: 'completed' },
  { label: 'Shortlisted', count: 120, status: 'completed' },
  { label: 'Scheduled', count: 45, status: 'active' },
  { label: 'Completed', count: 32, status: 'pending' },
  { label: 'Offers Sent', count: 14, status: 'pending' },
  { label: 'Hired', count: 8, status: 'pending' }
];
const RECENT_ACTIVITIES = [
  { id: 'ACT-001', type: 'success', text: 'New application received from <strong>Liam Carter</strong> for <strong>Senior Frontend Engineer</strong>.', time: '2 mins ago' },
  { id: 'ACT-002', type: 'highlight', text: 'Candidate <strong>Sarah Jenkins</strong> shortlisted by AI with a <strong>96% Match</strong>.', time: '20 mins ago' },
  { id: 'ACT-003', type: 'info', text: 'Interview scheduled with <strong>Marcus Aurelius</strong>.', time: '1 hour ago' },
  { id: 'ACT-004', type: 'neutral', text: 'Interview feedback submitted for <strong>Emma Watson</strong> by Julian Thorne.', time: '3 hours ago' },
  { id: 'ACT-005', type: 'success', text: 'Offer letter sent to <strong>David Beckham</strong> for Backend Engineer.', time: '5 hours ago' }
];
const CALENDAR_EVENTS = [
  { id: 'EVT-001', time: '10:00 AM - 11:00 AM', title: 'Recruiter Alignment Meeting', category: 'meeting' },
  { id: 'EVT-002', time: '2:00 PM - 3:00 PM', title: 'Interview: Sarah Jenkins', category: 'interview' },
  { id: 'EVT-003', time: '4:30 PM - 5:30 PM', title: 'Interview: Marcus Aurelius', category: 'interview' },
  { id: 'EVT-004', time: '11:59 PM', title: 'Expiry: HR Manager (JOB-208)', category: 'deadline' }
];
const DASHBOARD_BAR_CHART_DATA = [
  { label: 'Software Engineer', value: 218 },
  { label: 'Business Analyst', value: 192 },
  { label: 'UI/UX Designer', value: 156 },
  { label: 'Product Manager', value: 141 },
  { label: 'QA Engineer', value: 134 },
  { label: 'DevOps Engineer', value: 117 },
];

const DASHBOARD_ANALYTICS_TOTALS = {
  shortlisted: 354,
  rejected: 301,
  pending: 488,
};

function RecruiterDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeDate, setActiveDate] = useState('');
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Format date beautifully
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setActiveDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  return (
    <div className="create-vacancy vm-shell">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Dashboard"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Sarah Parker', role: 'Talent Acquisition Partner' }}
          notificationsCount={3}
          breadcrumbItems={[
            { label: 'Dashboard' },
          ]}
          searchPlaceholder="Search applicants, vacancies, interviews..."
          onSearch={(q) => console.log('Searching for:', q)}
          onNotificationClick={() => console.log('Notifications opened')}
          onLogout={() => console.log('Logging out')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="recruiter-dashboard-container">
          
          {/* ── 1. Welcome Section ── */}
          <section className="recruiter-welcome-banner">
            <div className="welcome-title-grp">
              <h1>Welcome back, Sarah 👋</h1>
              <p>Here is your intelligence overview for today. Let's find your next perfect hire.</p>
              <div className="welcome-actions-row">
                <button className="welcome-action-btn" onClick={() => navigate('/recruiter/create-vacancy')}>
                  <Plus size={14} /> Post New Job
                </button>
                <button className="welcome-action-btn" onClick={() => navigate('/recruiter/vacancies')}>
                  <Briefcase size={14} /> View Active Vacancies
                </button>
                <button className="welcome-action-btn" onClick={() => navigate('/recruiter/applicants/all')}>
                  <Users size={14} /> View Applicants
                </button>
                <button className="welcome-action-btn" onClick={() => navigate('/recruiter/applicants/ranked')}>
                  <Sparkles size={14} /> AI Match Candidates
                </button>
                <button className="welcome-action-btn" onClick={() => navigate('/recruiter/interviews')}>
                  <Calendar size={14} /> Schedule Interviews
                </button>
              </div>
            </div>
            <div className="welcome-date-badge">
              <span className="welcome-date-text">{activeDate}</span>
            </div>
          </section>

          {/* ── 2. Dashboard Summary Cards ── */}
          <section className="recruiter-kpi-grid">
            {STATS.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="recruiter-kpi-card">
                  <div className="kpi-card-left">
                    <span className="kpi-card-label">{kpi.label}</span>
                    <span className="kpi-card-value">{kpi.value}</span>
                    <span className={`kpi-card-change ${kpi.up === true ? 'up' : kpi.up === false ? 'down' : 'neutral'}`}>
                      {kpi.up === true && <TrendingUp size={12} />}
                      {kpi.up === false && <TrendingDown size={12} />}
                      {kpi.change} vs last period
                    </span>
                  </div>
                  <div className="kpi-card-icon" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                    <Icon size={18} />
                  </div>
                </div>
              );
            })}
          </section>

          {/* ── 4. Recruitment Pipeline ── */}
          <section className="recruiter-pipeline-section">
            <h2 className="recruiter-section-title">
              <Activity size={18} className="text-yellow" />
              Recruitment Pipeline Overview
            </h2>
            <div className="pipeline-wrapper">
              {PIPELINE_STEPS.map((step, idx) => (
                <div key={idx} className={`pipeline-step-node ${step.status}`}>
                  <div className="pipeline-step-circle">
                    {step.count}
                  </div>
                  <span className="pipeline-step-label">{step.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Today's Events & Recent Activity Row ── */}
          <div className="recruiter-dashboard-equal-row">
            {/* ── 11. Recruitment Calendar ── */}
            <div className="dashboard-panel-card events-panel-card">
              <div className="panel-header-row">
                <h2 className="recruiter-section-title">Today's Events</h2>
              </div>
              
              <div className="recruiter-calendar-widget">
                <div className="calendar-today-strip">
                  <span className="calendar-today-lbl">Schedule View</span>
                  <span className="calendar-event-time" style={{ fontSize: '0.75rem' }}>
                    <Clock3 size={12} /> {CALENDAR_EVENTS.length} events
                  </span>
                </div>

                <div className="calendar-event-row">
                  {CALENDAR_EVENTS.map((evt) => (
                    <div key={evt.id} className={`calendar-event-card ${evt.category}`}>
                      <div className="calendar-event-header">
                        <span className="calendar-event-time">
                          <Clock size={10} /> {evt.time}
                        </span>
                      </div>
                      <span className="calendar-event-title">{evt.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 9. Recent Activity ── */}
            <div className="dashboard-panel-card activity-panel-card">
              <div className="panel-header-row">
                <h2 className="recruiter-section-title">Recent Activity Log</h2>
              </div>

              <div className="timeline-activity-flow">
                {RECENT_ACTIVITIES.map((act) => (
                  <div key={act.id} className={`activity-flow-item ${act.type}`}>
                    <div className="activity-flow-indicator" />
                    <span className="activity-flow-desc" dangerouslySetInnerHTML={{ __html: act.text }} />
                    <span className="activity-flow-time">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 8. Recruitment Analytics ── */}
          <div className="dashboard-panel-card" style={{ marginTop: '24px' }}>
            <div className="panel-header-row">
              <h2 className="recruiter-section-title">Recruitment Analytics & Insights</h2>
              <button className="panel-view-all-btn" onClick={() => navigate('/recruiter/analytics')}>
                Advanced Analytics <ChevronRight size={14} />
              </button>
            </div>

            <div className="analytics-dashboard-grid">
              
              {/* Bar chart */}
              <div className="an-chart-card an-chart-card--bar">
                <div className="an-chart-header">
                  <span className="an-chart-gold-bar" />
                  <span className="an-chart-title">APPLICANTS BY JOB POSITION</span>
                </div>
                <HorizontalBarChart data={DASHBOARD_BAR_CHART_DATA} />
              </div>

              {/* Donut chart */}
              <div className="an-chart-card an-chart-card--donut">
                <div className="an-chart-header">
                  <span className="an-chart-gold-bar" />
                  <span className="an-chart-title">APPLICANT STATUS</span>
                </div>
                <DonutChart
                  shortlisted={DASHBOARD_ANALYTICS_TOTALS.shortlisted}
                  rejected={DASHBOARD_ANALYTICS_TOTALS.rejected}
                  pending={DASHBOARD_ANALYTICS_TOTALS.pending}
                />
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

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

export default RecruiterDashboard;
