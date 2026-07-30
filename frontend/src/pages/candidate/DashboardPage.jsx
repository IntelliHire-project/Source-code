import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Sparkles,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { CandidatePageContext } from './CandidateDashboard';
import './DashboardPage.css';

/* ── Mock Data ── */

const MOCK_STATS = [
  { label: 'Applications Submitted', value: '3', icon: FileText, variant: 'gold' },
  { label: 'Interviews Scheduled', value: '1', icon: Calendar, variant: 'blue' },
  { label: 'CV Score', value: '78%', icon: Sparkles, variant: 'gold' },
  { label: 'Job Matches', value: '12', icon: Briefcase, variant: 'green' },
];

const MOCK_ACTIVITIES = [
  {
    icon: FileText,
    title: 'Applied to Senior Frontend Engineer @ TechFlow Systems',
    time: '2 hours ago',
    variant: 'gold',
  },
  {
    icon: Sparkles,
    title: 'CV Analysis completed — score updated to 78%',
    time: '1 day ago',
    variant: 'blue',
  },
  {
    icon: Calendar,
    title: 'Interview Scheduled for Product Designer @ Nexus Creative',
    time: '2 days ago',
    variant: 'gold',
  },
  {
    icon: CheckCircle,
    title: 'Profile updated — completeness at 88%',
    time: '3 days ago',
    variant: 'green',
  },
];

const QUICK_ACTIONS = [
  { label: 'Browse Jobs', icon: Briefcase, path: '/candidate/jobs' },
  { label: 'My Applications', icon: FileText, path: '/candidate/applications' },
  { label: 'Improve CV Score', icon: Sparkles, path: '/candidate/cv-insights' },
];

/* ── Dashboard Page ── */

function DashboardPage() {
  const navigate = useNavigate();
  const { setPageLabel, user } = useContext(CandidatePageContext);

  useEffect(() => {
    setPageLabel('DASHBOARD');
  }, [setPageLabel]);

  return (
    <div className="cdp">
      {/* Welcome Banner */}
      <div className="cdp-welcome">
        <div>
          <h1 className="cdp-welcome__title">
            Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}
          </h1>
          <p className="cdp-welcome__sub">
            Here's a snapshot of your job search activity.
          </p>
        </div>
        <div className="cdp-welcome__badge">
          <span className="cdp-welcome__badge-dot" />
          Profile Active
        </div>
      </div>

      {/* KPI Grid */}
      <div className="cdp-kpi-grid">
        {MOCK_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="cdp-kpi-card">
              <div className={`cdp-kpi-icon cdp-kpi-icon--${stat.variant}`}>
                <Icon size={20} />
              </div>
              <div className="cdp-kpi-info">
                <span className="cdp-kpi-label">{stat.label}</span>
                <span className="cdp-kpi-value">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="cdp-bottom-grid">
        {/* Recent Activity */}
        <div className="cdp-card">
          <div className="cdp-card__header">
            <h3 className="cdp-card__title">Recent Activity</h3>
            <button className="cdp-card__link" onClick={() => navigate('/candidate/applications')}>
              View All
            </button>
          </div>
          <div className="cdp-activity-list">
            {MOCK_ACTIVITIES.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="cdp-activity-item">
                  <div className={`cdp-activity-icon cdp-activity-icon--${item.variant}`}>
                    <Icon size={16} />
                  </div>
                  <div className="cdp-activity-text">
                    <span className="cdp-activity-title">{item.title}</span>
                    <span className="cdp-activity-time">{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="cdp-card">
          <div className="cdp-card__header">
            <h3 className="cdp-card__title">Quick Actions</h3>
          </div>
          <div className="cdp-quick-list">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="cdp-quick-btn"
                  onClick={() => navigate(action.path)}
                >
                  <span className="cdp-quick-btn__left">
                    <Icon size={18} className="cdp-quick-btn__icon" />
                    {action.label}
                  </span>
                  <ArrowRight size={16} className="cdp-quick-btn__arrow" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
