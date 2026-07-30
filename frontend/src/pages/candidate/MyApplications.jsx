import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  Check,
  ChevronRight,
} from 'lucide-react';
import { CandidatePageContext } from './CandidateDashboard';
import './applications.css';

/* ── Mock Data ── */

const MOCK_APPLICATIONS = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Systems',
    location: 'Remote (NYC Based)',
    appliedDate: 'Oct 28, 2024',
    applicationId: 'APP-99281-X',
    status: 'Under Review',
    about:
      'Submitted application with CV and cover letter highlighting React and TypeScript expertise.',
    nextStep: 'Awaiting recruiter review. Expected response within 5–7 business days.',
    timeline: { submitted: 'Oct 28, 2024', reviewed: 'Oct 30, 2024' },
  },
  {
    id: 2,
    title: 'Product Designer',
    company: 'Nexus Creative',
    location: 'San Francisco, CA',
    appliedDate: 'Oct 20, 2024',
    applicationId: 'APP-88214-B',
    status: 'Interview Scheduled',
    about:
      'Portfolio and resume submitted. Shortlisted after initial screening round.',
    nextStep: 'Technical interview scheduled. Prepare design challenge.',
    timeline: { submitted: 'Oct 20, 2024', reviewed: 'Oct 24, 2024', interview: 'Oct 28, 2024' },
  },
  {
    id: 3,
    title: 'Full Stack Developer',
    company: 'Financier AI',
    location: 'London, UK',
    appliedDate: 'Oct 10, 2024',
    applicationId: 'APP-77102-C',
    status: 'Rejected',
    about:
      'Completed technical assessment but did not meet experience requirements for senior-level role.',
    nextStep: 'Consider reapplying for mid-level roles in the future.',
    timeline: { submitted: 'Oct 10, 2024', reviewed: 'Oct 16, 2024' },
  },
  {
    id: 4,
    title: 'Cloud Architect',
    company: 'SkyScale Solutions',
    location: 'Austin, TX',
    appliedDate: 'Oct 5, 2024',
    applicationId: 'APP-65390-D',
    status: 'Withdrawn',
    about:
      'Application withdrawn after accepting another position.',
    nextStep: '',
    timeline: { submitted: 'Oct 5, 2024' },
  },
];

const STATUS_STEPS = ['Applied', 'Under Review', 'Interview', 'Decision'];

const STATUS_STEP_INDEX = {
  'Under Review': 1,
  'Interview Scheduled': 2,
  'Rejected': 1,
  'Withdrawn': 0,
  'Offer Received': 3,
};

const SORT_OPTIONS = [
  { label: 'Most Recent', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Company A-Z', value: 'company' },
];

/* ── Sub-components ── */

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Under Review':
      return 'app-card__status-badge--under-review';
    case 'Interview Scheduled':
      return 'app-card__status-badge--interview';
    case 'Rejected':
      return 'app-card__status-badge--rejected';
    case 'Withdrawn':
      return 'app-card__status-badge--withdrawn';
    case 'Offer Received':
      return 'app-card__status-badge--offer';
    default:
      return '';
  }
}

function getCompanyInitial(company) {
  return company ? company.charAt(0).toUpperCase() : '?';
}

function getCurrentStep(status) {
  return STATUS_STEP_INDEX[status] ?? 0;
}

export function ApplicationCard({ application, onViewDetails, onWithdraw }) {
  const [expanded, setExpanded] = useState(false);
  const isMuted = application.status === 'Rejected' || application.status === 'Withdrawn';
  const currentStep = getCurrentStep(application.status);

  function handleViewDetails() {
    if (onViewDetails) {
      onViewDetails(application);
    } else {
      setExpanded((prev) => !prev);
    }
  }

  const canWithdraw =
    application.status !== 'Rejected' &&
    application.status !== 'Withdrawn' &&
    application.status !== 'Offer Received';

  return (
    <div className={`app-card ${isMuted ? 'app-card--muted' : ''}`}>
      <div className="app-card__body">
        <div className="app-card__logo">
          {getCompanyInitial(application.company)}
        </div>

        <div className="app-card__content">
          <div className="app-card__top-row">
            <div className="app-card__info">
              <h3 className="app-card__title">{application.title}</h3>
              <p className="app-card__company">
                {application.company}
                <span className="app-card__company-location">
                  <MapPin size={12} />
                  {application.location}
                </span>
              </p>
            </div>
            <span
              className={`app-card__status-badge ${getStatusBadgeClass(application.status)}`}
            >
              {application.status}
            </span>
          </div>

          <div className="app-card__meta">
            <span className="app-card__meta-item">
              <Calendar size={13} />
              Applied on {application.appliedDate}
            </span>
            <span className="app-card__meta-item">
              <Clock size={13} />
              {application.applicationId}
            </span>
          </div>

          <div className="app-card__progress">
            {STATUS_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                {i > 0 && (
                  <div
                    className={`app-card__step-line ${
                      i <= currentStep ? 'app-card__step-line--done' : ''
                    }`}
                  />
                )}
                <div className="app-card__step">
                  <div
                    className={`app-card__step-circle ${
                      i < currentStep
                        ? 'app-card__step-circle--done'
                        : i === currentStep
                        ? 'app-card__step-circle--current'
                        : ''
                    }`}
                  >
                    {i < currentStep ? (
                      <Check size={12} />
                    ) : i === currentStep ? (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
                    ) : null}
                  </div>
                  <span
                    className={`app-card__step-label ${
                      i === currentStep ? 'app-card__step-label--active' : ''
                    }`}
                  >
                    {step}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="app-card__summary">
          {application.about && (
            <div className="app-card__summary-section">
              <span className="app-card__summary-label">Application Summary</span>
              <p className="app-card__summary-text">{application.about}</p>
            </div>
          )}
          {application.nextStep && (
            <div className="app-card__summary-section">
              <span className="app-card__summary-label">Next Step</span>
              <p className="app-card__summary-text">{application.nextStep}</p>
            </div>
          )}
          {application.timeline && (
            <div className="app-card__summary-section">
              <span className="app-card__summary-label">Timeline</span>
              <div className="app-card__summary-dates">
                {Object.entries(application.timeline).map(([key, value]) => (
                  <div key={key} className="app-card__summary-date">
                    <span className="app-card__summary-date-label">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="app-card__summary-date-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="app-card__actions">
        <button className="app-card__btn app-card__btn--outline" onClick={handleViewDetails}>
          {expanded ? 'Hide Details' : 'View Details'}
          <ChevronRight
            size={14}
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
          />
        </button>
        {canWithdraw && (
          <button
            className="app-card__btn app-card__btn--withdraw"
            onClick={() => onWithdraw && onWithdraw(application)}
          >
            Withdraw Application
          </button>
        )}
      </div>
    </div>
  );
}

export function WithdrawConfirmModal({ application, onConfirm, onCancel }) {
  if (!application) return null;

  return (
    <div className="withdraw-overlay" onClick={onCancel}>
      <div className="withdraw-modal" onClick={(e) => e.stopPropagation()}>
        <div className="withdraw-modal__icon">
          <AlertTriangle />
        </div>

        <h2 className="withdraw-modal__title">Withdraw this application?</h2>
        <p className="withdraw-modal__text">
          This action cannot be undone. You'll need to reapply if you change your mind.
        </p>

        <div className="withdraw-modal__actions">
          <button className="withdraw-modal__btn withdraw-modal__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="withdraw-modal__btn withdraw-modal__btn--withdraw" onClick={onConfirm}>
            Yes, Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */

function MyApplications() {
  const navigate = useNavigate();
  const { setPageLabel } = useContext(CandidatePageContext);
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  useEffect(() => {
    setPageLabel('MY APPLICATIONS');
  }, [setPageLabel]);

  const tabs = useMemo(() => {
    const counts = { All: applications.length };
    applications.forEach((app) => {
      const key = app.status === 'Interview Scheduled' ? 'Interview' : app.status;
      counts[key] = (counts[key] || 0) + 1;
    });
    return ['All', 'Under Review', 'Interview', 'Rejected', 'Withdrawn'].map(
      (label) => ({
        label,
        count: counts[label] || 0,
      })
    );
  }, [applications]);

  const filtered = useMemo(() => {
    let result = [...applications];

    if (activeTab !== 'All') {
      if (activeTab === 'Interview') {
        result = result.filter((app) => app.status === 'Interview Scheduled');
      } else {
        result = result.filter((app) => app.status === activeTab);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.title.toLowerCase().includes(q) ||
          app.company.toLowerCase().includes(q) ||
          app.location.toLowerCase().includes(q) ||
          app.applicationId.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort(
          (a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) => new Date(a.appliedDate) - new Date(b.appliedDate)
        );
        break;
      case 'company':
        result.sort((a, b) => a.company.localeCompare(b.company));
        break;
      default:
        break;
    }

    return result;
  }, [applications, activeTab, searchQuery, sortBy]);

  function handleViewDetails(application) {
    console.log('View details:', application.id);
  }

  function handleWithdraw(application) {
    setWithdrawTarget(application);
  }

  function confirmWithdraw() {
    if (!withdrawTarget) return;
    setApplications((prev) =>
      prev.map((app) =>
        app.id === withdrawTarget.id ? { ...app, status: 'Withdrawn' } : app
      )
    );
    setWithdrawTarget(null);
  }

  function cancelWithdraw() {
    setWithdrawTarget(null);
  }

  return (
    <div className="my-applications">
      {/* Header */}
      <div className="my-applications__header">
        <div className="my-applications__count-badge">
          <strong>{applications.length}</strong> Applications
        </div>
      </div>

      {/* Tabs */}
      <div className="my-applications__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`my-applications__tab ${
              activeTab === tab.label ? 'my-applications__tab--active' : ''
            }`}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="my-applications__controls">
        <div className="my-applications__search-wrap">
          <Search size={18} className="my-applications__search-icon" />
          <input
            type="text"
            className="my-applications__search-input"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="my-applications__sort-wrap">
          <ArrowUpDown size={15} />
          <select
            className="my-applications__sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List or Empty */}
      {filtered.length > 0 ? (
        <div className="my-applications__list">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onViewDetails={handleViewDetails}
              onWithdraw={handleWithdraw}
            />
          ))}
        </div>
      ) : (
        <div className="my-applications__empty">
          <div className="my-applications__empty-icon">
            <Briefcase />
          </div>
          <h3 className="my-applications__empty-title">No applications found</h3>
          <p className="my-applications__empty-desc">
            {searchQuery || activeTab !== 'All'
              ? 'Try adjusting your search or filter to see more results.'
              : "You haven't applied to any jobs yet. Start exploring opportunities!"}
          </p>
          <button
            className="my-applications__empty-btn"
            onClick={() => navigate('/candidate/jobs')}
          >
            Browse Jobs
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawTarget && (
        <WithdrawConfirmModal
          application={withdrawTarget}
          onConfirm={confirmWithdraw}
          onCancel={cancelWithdraw}
        />
      )}
    </div>
  );
}

export default MyApplications;
