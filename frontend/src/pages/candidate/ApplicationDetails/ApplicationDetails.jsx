import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Check,
  ClipboardCheck,
  FileText,
  Video,
  CalendarClock,
  ChevronRight,
} from 'lucide-react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import { WithdrawConfirmModal } from '../MyApplications/MyApplications';
import '../MyApplications/applications.css';
import './ApplicationDetails.css';

/* ── Mock Data ── */

const STATUS_STEPS = ['Applied', 'Under Review', 'Interview', 'Decision'];

const STATUS_STEP_INDEX = {
  'Under Review': 1,
  'Interview Scheduled': 2,
  'Rejected': 1,
  'Withdrawn': 0,
  'Offer Received': 3,
  'Accepted': 3,
};

const MOCK_DETAILS = {
  1: {
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Systems',
    location: 'Remote (NYC Based)',
    appliedDate: 'Oct 28, 2024',
    applicationId: 'APP-99281-X',
    status: 'Under Review',
    about:
      'Submitted application with CV and cover letter highlighting React and TypeScript expertise. Selected for assessment after recruiter screening.',
    nextStep: 'Awaiting recruiter review. Expected response within 5–7 business days.',
    timeline: { submitted: 'Oct 28, 2024', reviewed: 'Oct 30, 2024' },
    assessment: {
      name: 'Technical Skills Assessment',
      score: 78,
      maxScore: 100,
      passed: true,
      completedDate: 'Oct 29, 2024',
    },
    interviews: {
      total: 3,
      currentRound: 0,
      rounds: ['Technical Round', 'System Design', 'HR & Culture'],
    },
    upcomingInterviews: [],
  },
  2: {
    title: 'Product Designer',
    company: 'Nexus Creative',
    location: 'San Francisco, CA',
    appliedDate: 'Oct 20, 2024',
    applicationId: 'APP-88214-B',
    status: 'Interview Scheduled',
    about:
      'Portfolio and resume submitted. Shortlisted after initial screening round and technical assessment.',
    nextStep: 'Technical interview scheduled. Prepare design challenge.',
    timeline: { submitted: 'Oct 20, 2024', reviewed: 'Oct 24, 2024', interview: 'Oct 28, 2024' },
    assessment: {
      name: 'Design Skills Assessment',
      score: 92,
      maxScore: 100,
      passed: true,
      completedDate: 'Oct 25, 2024',
    },
    interviews: {
      total: 3,
      currentRound: 2,
      rounds: ['Portfolio Review', 'Design Challenge', 'Culture Fit'],
    },
    upcomingInterviews: [
      {
        round: 'Round 2 — Design Challenge',
        date: 'Nov 8, 2024',
        time: '10:00 AM',
        format: 'Video Call',
        interviewer: 'Sarah Kim',
        link: '#',
      },
      {
        round: 'Round 3 — Culture Fit',
        date: 'Nov 15, 2024',
        time: '2:30 PM',
        format: 'In-Person',
        interviewer: 'James O\'Brien',
        link: '#',
      },
    ],
  },
  3: {
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
    assessment: {
      name: 'Full Stack Technical Assessment',
      score: 54,
      maxScore: 100,
      passed: false,
      completedDate: 'Oct 14, 2024',
    },
    interviews: {
      total: 0,
      currentRound: 0,
      rounds: [],
    },
    upcomingInterviews: [],
  },
  4: {
    title: 'Cloud Architect',
    company: 'SkyScale Solutions',
    location: 'Austin, TX',
    appliedDate: 'Oct 5, 2024',
    applicationId: 'APP-65390-D',
    status: 'Withdrawn',
    about: 'Application withdrawn after accepting another position.',
    nextStep: '',
    timeline: { submitted: 'Oct 5, 2024' },
    assessment: null,
    interviews: {
      total: 0,
      currentRound: 0,
      rounds: [],
    },
    upcomingInterviews: [],
  },
};

/* ── Helpers ── */

function getCurrentStep(status) {
  return STATUS_STEP_INDEX[status] ?? 0;
}

/* ── Cards ── */

function AssessmentCard({ assessment }) {
  if (!assessment) {
    return (
      <section className="application-detail__card">
        <div className="application-detail__card-header">
          <h3 className="application-detail__card-title">
            <ClipboardCheck size={16} />
            Assessment
          </h3>
        </div>
        <p className="application-detail__muted">No assessment taken for this application.</p>
      </section>
    );
  }

  const pct = Math.round((assessment.score / assessment.maxScore) * 100);

  return (
    <section className="application-detail__card">
      <div className="application-detail__card-header">
        <h3 className="application-detail__card-title">
          <ClipboardCheck size={16} />
          Assessment
        </h3>
      </div>

      <div className="application-detail__assessment">
        <div className="application-detail__assessment-top">
          <div className="application-detail__assessment-score">
            <span className="application-detail__assessment-number">{assessment.score}</span>
            <span className="application-detail__assessment-max">/ {assessment.maxScore}</span>
          </div>
          <div className="application-detail__assessment-info">
            <span className="application-detail__assessment-name">{assessment.name}</span>
            <span className="application-detail__assessment-date">
              Completed {assessment.completedDate}
            </span>
          </div>
        </div>
        <div className="application-detail__assessment-bar">
          <div
            className={`application-detail__assessment-bar-fill ${
              assessment.passed ? 'application-detail__assessment-bar-fill--passed' : ''
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function InterviewPhaseCard({ interviews, upcoming }) {
  if (!interviews || interviews.total === 0) {
    return (
      <section className="application-detail__card">
        <div className="application-detail__card-header">
          <h3 className="application-detail__card-title">
            <Video size={16} />
            Interview Phase
          </h3>
        </div>
        <p className="application-detail__muted">No interviews scheduled for this application.</p>
      </section>
    );
  }

  const total = interviews.total;
  const taken = Math.min(interviews.currentRound, total);
  const left = Math.max(total - taken, 0);

  return (
    <section className="application-detail__card">
      <div className="application-detail__card-header">
        <h3 className="application-detail__card-title">
          <Video size={16} />
          Interview Phase
        </h3>
      </div>

      <div className="application-detail__phase-summary">
        <div className="application-detail__phase-stat">
          <strong>{total}</strong>
          <span>Total Interviews</span>
        </div>
        <div className="application-detail__phase-stat">
          <strong>{taken}</strong>
          <span>Taken</span>
        </div>
        <div className="application-detail__phase-stat">
          <strong>{left}</strong>
          <span>Left</span>
        </div>
      </div>

      <div className="application-detail__upcoming">
        <span className="application-detail__summary-label">Upcoming Interviews</span>
        {upcoming && upcoming.length > 0 ? (
          <div className="application-detail__interview-list">
            {upcoming.map((interview, i) => (
              <div key={i} className="application-detail__interview">
                <div className="application-detail__interview-icon">
                  <Video size={16} />
                </div>
                <div className="application-detail__interview-info">
                  <span className="application-detail__interview-round">{interview.round}</span>
                  <span className="application-detail__interview-meta">
                    <CalendarClock size={12} />
                    {interview.date} • {interview.time}
                  </span>
                  <span className="application-detail__interview-meta">
                    <Briefcase size={12} />
                    {interview.format} • Interviewer: {interview.interviewer}
                  </span>
                </div>
                <button type="button" className="application-detail__interview-join">
                  Join Link
                  <ChevronRight size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="application-detail__muted">No upcoming interviews scheduled.</p>
        )}
      </div>
    </section>
  );
}

function ApplicationSummaryCard({ detail }) {
  return (
    <section className="application-detail__card">
      <div className="application-detail__card-header">
        <h3 className="application-detail__card-title">
          <FileText size={16} />
          Application Summary
        </h3>
      </div>

      {detail.about && (
        <p className="application-detail__text">{detail.about}</p>
      )}

      {detail.nextStep && (
        <div className="application-detail__summary-block">
          <span className="application-detail__summary-label">Next Step</span>
          <p className="application-detail__text">{detail.nextStep}</p>
        </div>
      )}

      {detail.timeline && (
        <div className="application-detail__summary-block">
          <span className="application-detail__summary-label">Timeline</span>
          <div className="application-detail__timeline">
            {Object.entries(detail.timeline).map(([key, value]) => (
              <div key={key} className="application-detail__timeline-item">
                <span className="application-detail__timeline-key">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="application-detail__timeline-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ── Main Page ── */

function ApplicationDetails() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const { setPageLabel } = useContext(CandidatePageContext);
  const [detail, setDetail] = useState(
    () => MOCK_DETAILS[applicationId] || MOCK_DETAILS[1]
  );
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const currentStep = getCurrentStep(detail.status);
  const canWithdraw =
    detail.status !== 'Rejected' &&
    detail.status !== 'Withdrawn' &&
    detail.status !== 'Accepted' &&
    detail.status !== 'Offer Received';

  useEffect(() => {
    setPageLabel('APPLICATION DETAILS');
  }, [setPageLabel]);

  function confirmWithdraw() {
    setDetail((prev) => ({ ...prev, status: 'Withdrawn' }));
    setShowWithdrawModal(false);
  }

  return (
    <div className="application-detail">
      <button
        type="button"
        className="application-detail__back"
        onClick={() => navigate('/candidate/applications')}
      >
        <ArrowLeft size={16} />
        BACK TO MY APPLICATIONS
      </button>

      {/* Header */}
      <header className="application-detail__header">
        <div className="application-detail__header-info">
          <h1 className="application-detail__title">{detail.title}</h1>
          <p className="application-detail__company">
            {detail.company}
            <span className="application-detail__company-location">
              <MapPin size={12} />
              {detail.location}
            </span>
          </p>
          <div className="application-detail__meta">
            <span className="application-detail__meta-item">
              <Calendar size={13} />
              Applied on {detail.appliedDate}
            </span>
            <span className="application-detail__meta-item">
              <Clock size={13} />
              {detail.applicationId}
            </span>
          </div>
        </div>
      </header>

      {/* Status Progress */}
      <section className="application-detail__card application-detail__status-card">
        <div className="application-detail__card-header">
          <h3 className="application-detail__card-title">Application Status</h3>
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
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--primary)',
                      }}
                    />
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
      </section>

      {/* Body */}
      <div className="application-detail__grid">
        <div className="application-detail__column">
          <ApplicationSummaryCard detail={detail} />
        </div>
        <div className="application-detail__column">
          <AssessmentCard assessment={detail.assessment} />
        </div>
      </div>

      <InterviewPhaseCard
        interviews={detail.interviews}
        upcoming={detail.upcomingInterviews}
      />

      {canWithdraw && (
        <div className="application-detail__withdraw-row">
          <button
            type="button"
            className="application-detail__withdraw-btn"
            onClick={() => setShowWithdrawModal(true)}
          >
            Withdraw Application
          </button>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawConfirmModal
          application={detail}
          onConfirm={confirmWithdraw}
          onCancel={() => setShowWithdrawModal(false)}
        />
      )}
    </div>
  );
}

export default ApplicationDetails;
