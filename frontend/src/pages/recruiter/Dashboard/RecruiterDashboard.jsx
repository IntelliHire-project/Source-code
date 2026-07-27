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
  { label: 'Active Job Postings', value: '12', icon: Briefcase, colorClass: 'gold', trend: '+2', trendType: 'positive' },
  { label: 'Total Applicants', value: '284', icon: Users, colorClass: 'blue', trend: '+45', trendType: 'positive' },
  { label: 'AI Shortlisted', value: '95', icon: Sparkles, colorClass: 'green', trend: '84%', trendType: 'positive' },
  { label: 'Interviews Today', value: '8', icon: Calendar, colorClass: 'purple', trend: '3 Onsite', trendType: 'neutral' },
  { label: 'Pending Reviews', value: '18', icon: AlertCircle, colorClass: 'red', trend: 'Urgent', trendType: 'negative' },
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

const AI_RECOMMENDED_CANDIDATES = [
  {
    id: 'CAND-001',
    name: 'Sarah Jenkins',
    position: 'Senior Frontend Engineer',
    matchScore: 96,
    skills: ['React', 'TypeScript', 'CSS Grid', 'Webpack'],
    experience: '5 years',
    resumeScore: 92,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 'CAND-002',
    name: 'Michael Chen',
    position: 'Lead React Developer',
    matchScore: 94,
    skills: ['React', 'Next.js', 'Redux', 'Node.js'],
    experience: '7 years',
    resumeScore: 89,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 'CAND-003',
    name: 'Priya Nair',
    position: 'Frontend Engineer',
    matchScore: 91,
    skills: ['JavaScript', 'React', 'Tailwind', 'Git'],
    experience: '3 years',
    resumeScore: 85,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 'CAND-004',
    name: 'David Miller',
    position: 'UI Engineer',
    matchScore: 88,
    skills: ['Figma', 'HTML/CSS', 'React', 'Framer Motion'],
    experience: '4 years',
    resumeScore: 82,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
  }
];

const UPCOMING_INTERVIEWS = [
  {
    id: 'INT-501',
    candidate: 'Sarah Jenkins',
    position: 'Senior Frontend Engineer',
    date: 'Today',
    time: '2:00 PM - 3:00 PM',
    panel: 'Julian Thorne (Lead), Alice Fernando',
    type: 'online'
  },
  {
    id: 'INT-502',
    candidate: 'Marcus Aurelius',
    position: 'DevOps Specialist',
    date: 'Today',
    time: '4:30 PM - 5:30 PM',
    panel: 'Rupert Vance (SRE), Julian Thorne',
    type: 'onsite'
  },
  {
    id: 'INT-503',
    candidate: 'Priya Nair',
    position: 'Frontend Engineer',
    date: 'Tomorrow',
    time: '10:00 AM - 11:00 AM',
    panel: 'Alice Fernando, Julian Thorne',
    type: 'online'
  }
];

const RECENT_ACTIVITIES = [
  { id: 'ACT-001', type: 'success', text: 'New application received from <strong>Liam Carter</strong> for <strong>Senior Frontend Engineer</strong>.', time: '2 mins ago' },
  { id: 'ACT-002', type: 'highlight', text: 'Candidate <strong>Sarah Jenkins</strong> shortlisted by AI with a <strong>96% Match</strong>.', time: '20 mins ago' },
  { id: 'ACT-003', type: 'info', text: 'Interview scheduled with <strong>Marcus Aurelius</strong>.', time: '1 hour ago' },
  { id: 'ACT-004', type: 'neutral', text: 'Interview feedback submitted for <strong>Emma Watson</strong> by Julian Thorne.', time: '3 hours ago' },
  { id: 'ACT-005', type: 'success', text: 'Offer letter sent to <strong>David Beckham</strong> for Backend Engineer.', time: '5 hours ago' }
];

const PENDING_TASKS = [
  { id: 'TSK-001', title: 'Review 8 new candidate portfolios', meta: 'Product Designer · Due EOD', actionLabel: 'Review' },
  { id: 'TSK-002', title: 'Submit evaluation for Emma Watson', meta: 'Interviewed 2h ago', actionLabel: 'Submit' },
  { id: 'TSK-003', title: 'Assign panel for DevOps Specialist', meta: 'Needs 2 senior members', actionLabel: 'Assign' },
  { id: 'TSK-004', title: 'Review vacancy deadline extensions', meta: 'HR Manager closing soon', actionLabel: 'Review' },
  { id: 'TSK-005', title: 'Follow up on offer letter response', meta: 'David Beckham · Sent 3 days ago', actionLabel: 'Remind' }
];

const CALENDAR_EVENTS = [
  { id: 'EVT-001', time: '10:00 AM - 11:00 AM', title: 'Recruiter Alignment Meeting', category: 'meeting' },
  { id: 'EVT-002', time: '2:00 PM - 3:00 PM', title: 'Interview: Sarah Jenkins', category: 'interview' },
  { id: 'EVT-003', time: '4:30 PM - 5:30 PM', title: 'Interview: Marcus Aurelius', category: 'interview' },
  { id: 'EVT-004', time: '11:59 PM', title: 'Expiry: HR Manager (JOB-208)', category: 'deadline' }
];

const PERFORMANCE_INSIGHTS = [
  { label: 'Avg Time to Hire', value: '18 Days', trend: '-2.4 days', trendType: 'positive' },
  { label: 'Shortlisting Rate', value: '33.4%', trend: '+4.1%', trendType: 'positive' },
  { label: 'Interview Success Rate', value: '64%', trend: '+1.5%', trendType: 'positive' },
  { label: 'Offer Acceptance Rate', value: '88%', trend: '+3%', trendType: 'positive' },
  { label: 'Hired This Month', value: '8 Candidates', trend: 'Target met', trendType: 'neutral' }
];

// SVG Chart data points
const AREA_CHART_DATA = [
  { day: 'Mon', applicants: 25 },
  { day: 'Tue', applicants: 45 },
  { day: 'Wed', applicants: 30 },
  { day: 'Thu', applicants: 65 },
  { day: 'Fri', applicants: 50 },
  { day: 'Sat', applicants: 85 },
  { day: 'Sun', applicants: 95 }
];

const MATCH_DISTRIBUTION_DATA = [
  { bucket: '< 70%', count: 45 },
  { bucket: '70-80%', count: 98 },
  { bucket: '80-90%', count: 115 },
  { bucket: '> 90%', count: 26 }
];

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
            </div>
            <div className="welcome-date-badge">
              <span className="welcome-date-text">{activeDate}</span>
              <div className="welcome-system-chip">
                <span className="pulse-dot"></span>
                AI screening engines running smoothly
              </div>
            </div>
          </section>

          {/* ── 2. Dashboard Summary Cards ── */}
          <section className="recruiter-kpi-grid">
            {STATS.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="recruiter-kpi-card">
                  <div className={`kpi-card-header ${kpi.colorClass}`}>
                    <div className="kpi-icon-container">
                      <Icon size={18} />
                    </div>
                    <span className={`kpi-trend-tag ${kpi.trendType}`}>
                      {kpi.trend}
                    </span>
                  </div>
                  <div className="kpi-value-grp">
                    <h3>{kpi.value}</h3>
                    <span>{kpi.label}</span>
                  </div>
                </div>
              );
            })}
          </section>

          {/* ── 3. Quick Actions ── */}
          <section className="recruiter-quick-actions">
            <h2 className="recruiter-section-title">Quick Actions</h2>
            <div className="action-btn-row">
              <button className="action-btn-card" onClick={() => navigate('/recruiter/create-vacancy')}>
                <div className="action-icon-box">
                  <Plus size={18} />
                </div>
                <div className="action-btn-info">
                  <span className="action-btn-title">Post New Job</span>
                  <span className="action-btn-desc">Create and publish a vacancy</span>
                </div>
              </button>

              <button className="action-btn-card" onClick={() => navigate('/recruiter/applicants/all')}>
                <div className="action-icon-box">
                  <Users size={18} />
                </div>
                <div className="action-btn-info">
                  <span className="action-btn-title">View Applicants</span>
                  <span className="action-btn-desc">Browse candidate applications</span>
                </div>
              </button>

              <button className="action-btn-card" onClick={() => navigate('/recruiter/applicants/ranked')}>
                <div className="action-icon-box">
                  <Sparkles size={18} />
                </div>
                <div className="action-btn-info">
                  <span className="action-btn-title">AI Match Candidates</span>
                  <span className="action-btn-desc">Trigger rank and scoring models</span>
                </div>
              </button>

              <button className="action-btn-card" onClick={() => navigate('/recruiter/interviews')}>
                <div className="action-icon-box">
                  <Calendar size={18} />
                </div>
                <div className="action-btn-info">
                  <span className="action-btn-title">Schedule Interviews</span>
                  <span className="action-btn-desc">Arrange team evaluation slots</span>
                </div>
              </button>
            </div>
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

          {/* ── BOTTOM COLUMN GRID ── */}
          <div className="recruiter-dashboard-bottom-layout">
            
            {/* ── Left Column (Main Widgets) ── */}
            <div className="main-column">
              
              {/* ── 5. AI Recommended Candidates ── */}
              <div className="dashboard-panel-card">
                <div className="panel-header-row">
                  <h2 className="recruiter-section-title">
                    <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                    AI Recommended Candidates
                  </h2>
                  <button className="panel-view-all-btn" onClick={() => navigate('/recruiter/applicants/ranked')}>
                    Analyze All Matches <ArrowUpRight size={14} />
                  </button>
                </div>
                
                <div className="candidates-horizontal-scroll">
                  {AI_RECOMMENDED_CANDIDATES.map((cand) => (
                    <div key={cand.id} className="candidate-rec-card">
                      <div className="candidate-card-header">
                        <div className="candidate-photo-wrapper">
                          <img src={cand.avatar} alt={cand.name} className="candidate-profile-pic" />
                          <span className="match-score-badge">{cand.matchScore}% Match</span>
                        </div>
                        <div className="candidate-name-title">
                          <h4>{cand.name}</h4>
                          <span>{cand.position}</span>
                        </div>
                      </div>

                      <div className="candidate-meta-row">
                        <span className="candidate-exp">Experience: <strong>{cand.experience}</strong></span>
                        <span className="candidate-resume-score">Resume Score: {cand.resumeScore}/100</span>
                      </div>

                      <div className="candidate-skills-wrap">
                        {cand.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="candidate-skill-tag">{skill}</span>
                        ))}
                      </div>

                      <button className="view-profile-action-btn" onClick={() => navigate('/recruiter/applicants/ranked')}>
                        View Match Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* ── 7. Upcoming Interviews ── */}
              <div className="dashboard-panel-card">
                <div className="panel-header-row">
                  <h2 className="recruiter-section-title">Upcoming Scheduled Interviews</h2>
                  <button className="panel-view-all-btn" onClick={() => navigate('/recruiter/interviews')}>
                    View Calendar <ChevronRight size={14} />
                  </button>
                </div>

                <div className="upcoming-interviews-list">
                  {UPCOMING_INTERVIEWS.map((interview) => (
                    <div key={interview.id} className="interview-strip-card">
                      <div className="interview-date-block">
                        <div className="date-block-icon">
                          <CalendarDays size={16} />
                        </div>
                        <div className="date-block-text">
                          <span className="date">{interview.date}</span>
                          <span className="time">{interview.time}</span>
                        </div>
                      </div>
                      
                      <div className="interview-candidate-info">
                        <strong>{interview.candidate}</strong>
                        <span>{interview.position}</span>
                      </div>

                      <div className="interview-panel-grp">
                        <span className="panel-label-small">Evaluation Panel</span>
                        <span className="panel-names-list">{interview.panel}</span>
                      </div>

                      <span className={`interview-type-tag ${interview.type}`}>
                        {interview.type.toUpperCase()}
                      </span>

                      <button className="view-profile-action-btn" style={{ width: 'auto', padding: '6px 12px' }} onClick={() => navigate('/recruiter/interviews/evaluation')}>
                        Start Evaluation
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 8. Recruitment Analytics ── */}
              <div className="dashboard-panel-card">
                <div className="panel-header-row">
                  <h2 className="recruiter-section-title">Recruitment Analytics & Insights</h2>
                  <button className="panel-view-all-btn" onClick={() => navigate('/recruiter/analytics')}>
                    Advanced Analytics <ChevronRight size={14} />
                  </button>
                </div>

                <div className="analytics-dashboard-grid">
                  
                  {/* Chart 1: Applications received over time */}
                  <div className="chart-card-wrapper">
                    <div className="chart-card-header">
                      <h5>Applications Received (Daily)</h5>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>This Week</span>
                    </div>
                    <div className="analytics-chart-container">
                      <svg viewBox="0 0 450 150" width="100%" height="100%">
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(240, 185, 11, 0.25)" />
                            <stop offset="100%" stopColor="rgba(240, 185, 11, 0.0)" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="30" y1="20" x2="420" y2="20" stroke="#2A2C38" strokeDasharray="3" />
                        <line x1="30" y1="70" x2="420" y2="70" stroke="#2A2C38" strokeDasharray="3" />
                        <line x1="30" y1="120" x2="420" y2="120" stroke="#2A2C38" strokeDasharray="3" />

                        {/* Chart Line Path */}
                        <path
                          d="M 30,125 L 95,103 Q 160,119 225,79 T 355,57 T 420,46"
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 30,125 L 95,103 Q 160,119 225,79 T 355,57 T 420,46 L 420,125 L 30,125 Z"
                          fill="url(#areaGradient)"
                        />

                        {/* Hotspot Circles */}
                        {AREA_CHART_DATA.map((pt, i) => {
                          const x = 30 + i * 65;
                          // simple coordinate formula mirroring the path coordinates approximately
                          const coordinatesY = [125, 103, 115, 79, 65, 57, 46];
                          const y = coordinatesY[i];
                          return (
                            <g key={i}>
                              <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill="var(--accent)"
                                stroke="#16171F"
                                strokeWidth="2"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredChartPoint({ idx: i, val: pt.applicants, x, y })}
                                onMouseLeave={() => setHoveredChartPoint(null)}
                              />
                            </g>
                          );
                        })}

                        {/* Hover Tooltip inside SVG */}
                        {hoveredChartPoint && (
                          <g>
                            <rect
                              x={hoveredChartPoint.x - 30}
                              y={hoveredChartPoint.y - 30}
                              width="60"
                              height="22"
                              rx="4"
                              fill="#16171F"
                              stroke="var(--accent)"
                              strokeWidth="1"
                            />
                            <text
                              x={hoveredChartPoint.x}
                              y={hoveredChartPoint.y - 15}
                              className="chart-svg-tooltip"
                            >
                              {hoveredChartPoint.val} apps
                            </text>
                          </g>
                        )}

                        {/* X-axis labels */}
                        {AREA_CHART_DATA.map((pt, i) => (
                          <text
                            key={i}
                            x={30 + i * 65}
                            y="142"
                            fill="var(--text-muted)"
                            fontSize="9"
                            textAnchor="middle"
                          >
                            {pt.day}
                          </text>
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Chart 2: Candidate Status Distribution */}
                  <div className="chart-card-wrapper">
                    <div className="chart-card-header">
                      <h5>Candidate Distribution</h5>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-info)' }}>Total: 284</span>
                    </div>
                    <div className="analytics-chart-container">
                      <div className="donut-svg-container">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          {/* Circle radii are 45, circumference is 283 */}
                          {/* Shortlisted: 42% -> 119 stroke */}
                          <circle cx="60" cy="60" r="45" fill="transparent" stroke="var(--accent)" strokeWidth="12" strokeDasharray="119 283" strokeDashoffset="0" />
                          {/* Screening: 28% -> 79 stroke */}
                          <circle cx="60" cy="60" r="45" fill="transparent" stroke="var(--accent-info)" strokeWidth="12" strokeDasharray="79 283" strokeDashoffset="-119" />
                          {/* Interviewed: 15% -> 42 stroke */}
                          <circle cx="60" cy="60" r="45" fill="transparent" stroke="var(--accent-success)" strokeWidth="12" strokeDasharray="42 283" strokeDashoffset="-198" />
                          {/* Hired: 15% -> 42 stroke */}
                          <circle cx="60" cy="60" r="45" fill="transparent" stroke="#a371f7" strokeWidth="12" strokeDasharray="42 283" strokeDashoffset="-240" />
                          
                          {/* Inner hole */}
                          <circle cx="60" cy="60" r="39" fill="var(--primary-dark)" />
                          <text x="60" y="58" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">284</text>
                          <text x="60" y="73" textAnchor="middle" fill="var(--text-muted)" fontSize="8">Candidates</text>
                        </svg>

                        <div className="donut-legend">
                          <div className="legend-item">
                            <div className="legend-left">
                              <span className="legend-color-dot" style={{ backgroundColor: 'var(--accent)' }}></span>
                              <span>Shortlisted</span>
                            </div>
                            <span className="value">42%</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-left">
                              <span className="legend-color-dot" style={{ backgroundColor: 'var(--accent-info)' }}></span>
                              <span>Screening</span>
                            </div>
                            <span className="value">28%</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-left">
                              <span className="legend-color-dot" style={{ backgroundColor: 'var(--accent-success)' }}></span>
                              <span>Interviewed</span>
                            </div>
                            <span className="value">15%</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-left">
                              <span className="legend-color-dot" style={{ backgroundColor: '#a371f7' }}></span>
                              <span>Hired</span>
                            </div>
                            <span className="value">15%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart 3: Hiring Progress by Job Posting */}
                  <div className="chart-card-wrapper">
                    <div className="chart-card-header">
                      <h5>Hiring Progress by Posting</h5>
                    </div>
                    <div className="analytics-chart-container" style={{ height: 'auto', alignSelf: 'stretch' }}>
                      <div className="horizontal-progress-list">
                        <div className="progress-bar-row">
                          <div className="progress-row-info">
                            <span className="title">Senior Frontend Engineer</span>
                            <span className="val">87% Filled</span>
                          </div>
                          <div className="progress-track-bg">
                            <div className="progress-fill-active" style={{ width: '87%' }}></div>
                          </div>
                        </div>
                        <div className="progress-bar-row">
                          <div className="progress-row-info">
                            <span className="title">Product Designer</span>
                            <span className="val">60% Filled</span>
                          </div>
                          <div className="progress-track-bg">
                            <div className="progress-fill-active" style={{ width: '60%', background: 'linear-gradient(90deg, var(--accent-info) 0%, var(--accent-success) 100%)' }}></div>
                          </div>
                        </div>
                        <div className="progress-bar-row">
                          <div className="progress-row-info">
                            <span className="title">DevOps Specialist</span>
                            <span className="val">25% Filled</span>
                          </div>
                          <div className="progress-track-bg">
                            <div className="progress-fill-active" style={{ width: '25%', background: 'linear-gradient(90deg, #a371f7 0%, var(--accent-info) 100%)' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart 4: AI Match Score Distribution */}
                  <div className="chart-card-wrapper">
                    <div className="chart-card-header">
                      <h5>AI Match Score Distribution</h5>
                    </div>
                    <div className="analytics-chart-container">
                      <svg viewBox="0 0 300 150" width="100%" height="100%">
                        {/* Y axis lines */}
                        <line x1="30" y1="20" x2="280" y2="20" stroke="#2A2C38" strokeWidth="1" />
                        <line x1="30" y1="70" x2="280" y2="70" stroke="#2A2C38" strokeWidth="1" />
                        <line x1="30" y1="120" x2="280" y2="120" stroke="#2A2C38" strokeWidth="1" />
                        
                        {MATCH_DISTRIBUTION_DATA.map((item, idx) => {
                          const x = 50 + idx * 60;
                          const height = (item.count / 150) * 100;
                          const y = 120 - height;
                          return (
                            <g key={idx}>
                              <rect
                                x={x}
                                y={y}
                                width="30"
                                height={height}
                                rx="4"
                                fill={hoveredBar === idx ? 'var(--accent)' : 'var(--accent-info)'}
                                style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredBar(idx)}
                                onMouseLeave={() => setHoveredBar(null)}
                              />
                              <text
                                x={x + 15}
                                y="136"
                                fill="var(--text-muted)"
                                fontSize="9"
                                textAnchor="middle"
                              >
                                {item.bucket}
                              </text>
                              <text
                                x={x + 15}
                                y={y - 6}
                                fill="#fff"
                                fontSize="8"
                                fontWeight="700"
                                textAnchor="middle"
                              >
                                {item.count}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* ── Right Column (Side Panels) ── */}
            <div className="side-column">
              
              {/* ── 9. Recent Activity ── */}
              <div className="dashboard-panel-card">
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

              {/* ── 10. Pending Tasks ── */}
              <div className="dashboard-panel-card">
                <div className="panel-header-row">
                  <h2 className="recruiter-section-title">Pending Action Items</h2>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(230,57,70,0.15)', color: 'var(--crisis)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {PENDING_TASKS.length} Alerts
                  </span>
                </div>

                <div className="pending-tasks-list">
                  {PENDING_TASKS.map((task) => (
                    <div key={task.id} className="pending-task-item">
                      <div className="pending-task-left">
                        <div className="pending-task-icon-box">
                          <AlertCircle size={14} />
                        </div>
                        <div className="pending-task-info">
                          <span className="pending-task-title">{task.title}</span>
                          <span className="pending-task-meta">{task.meta}</span>
                        </div>
                      </div>
                      <button className="pending-task-action-btn" onClick={() => console.log('Pending task action clicked')}>
                        {task.actionLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 11. Recruitment Calendar ── */}
              <div className="dashboard-panel-card">
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

              {/* ── 12. Performance Insights ── */}
              <div className="dashboard-panel-card">
                <div className="panel-header-row">
                  <h2 className="recruiter-section-title">Performance Insights</h2>
                </div>

                <div className="performance-insights-grid">
                  {PERFORMANCE_INSIGHTS.map((insight, idx) => (
                    <div key={idx} className="insight-metric-mini">
                      <span className="insight-metric-label">{insight.label}</span>
                      <span className="insight-metric-value">{insight.value}</span>
                      <span className={`insight-metric-footer ${insight.trendType === 'negative' ? 'warning' : ''}`}>
                        <TrendingUp size={10} /> {insight.trend}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
