import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ShieldCheck,
  Briefcase,
  FileText,
  CalendarDays,
  Home,
  Download,
  Share2,
  Mail,
  Clock,
  ArrowRight,
  ChevronRight,
  Zap,
} from 'lucide-react';
import './jobs.css';

/* ── Step Tracker (reusable) ── */

const STEPS = ['Profile', 'Assessment', 'Review', 'Submitted'];

function StepTracker({ currentStep = 4 }) {
  return (
    <div className="step-tracker">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <React.Fragment key={label}>
            <div className="step-tracker__step">
              <div className={`step-tracker__circle ${isCompleted ? 'step-tracker__circle--done' : ''} ${isCurrent ? 'step-tracker__circle--active' : ''}`}>
                {isCompleted ? <Check size={14} /> : <span>{stepNum}</span>}
              </div>
              <span className={`step-tracker__label ${isCurrent ? 'step-tracker__label--active' : ''}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="step-tracker__line" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Main Page ── */

function ApplicationConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="app-confirm">
      {/* Success Header */}
      <div className="app-confirm__hero">
        <div className="app-confirm__glow">
          <ShieldCheck size={28} />
        </div>
        <span className="app-confirm__badge">
          <Check size={12} />
          SUBMISSION SUCCESSFUL
        </span>
        <h1 className="app-confirm__title">Application Received!</h1>
        <p className="app-confirm__subtitle">
          Great job! Your application for the Senior Frontend Engineer position has been successfully delivered to the hiring team.
        </p>
      </div>

      {/* Step Tracker */}
      <StepTracker currentStep={4} />

      {/* Cards Row */}
      <div className="app-confirm__cards">
        {/* Application Summary */}
        <div className="app-confirm__card">
          <div className="app-confirm__card-header">
            <h3 className="app-confirm__card-title">Application Summary</h3>
            <span className="app-confirm__status-badge">RECEIVED</span>
          </div>

          <div className="app-confirm__info-rows">
            <div className="app-confirm__info-row">
              <div className="app-confirm__info-icon"><Briefcase size={15} /></div>
              <div className="app-confirm__info-text">
                <span className="app-confirm__info-label">Position</span>
                <span className="app-confirm__info-value">Senior Frontend Engineer</span>
              </div>
            </div>
            <div className="app-confirm__info-row">
              <div className="app-confirm__info-icon"><FileText size={15} /></div>
              <div className="app-confirm__info-text">
                <span className="app-confirm__info-label">Application ID</span>
                <span className="app-confirm__info-value">APP-99281-X</span>
              </div>
            </div>
            <div className="app-confirm__info-row">
              <div className="app-confirm__info-icon"><CalendarDays size={15} /></div>
              <div className="app-confirm__info-text">
                <span className="app-confirm__info-label">Submitted On</span>
                <span className="app-confirm__info-value">October 28, 2024 • 14:42 PM</span>
              </div>
            </div>
            <div className="app-confirm__info-row app-confirm__info-row--last">
              <div className="app-confirm__info-icon"><Home size={15} /></div>
              <div className="app-confirm__info-text">
                <span className="app-confirm__info-label">Hiring Company</span>
                <span className="app-confirm__info-value">IntelliHire Tech Solutions</span>
              </div>
            </div>
          </div>

          <div className="app-confirm__card-footer">
            <button className="app-confirm__btn app-confirm__btn--outline">
              <Download size={15} />
              Download Copy
            </button>
            <button className="app-confirm__btn app-confirm__btn--outline">
              <Share2 size={15} />
              Share
            </button>
          </div>
        </div>

        {/* What's Next */}
        <div className="app-confirm__card">
          <div className="app-confirm__card-header">
            <h3 className="app-confirm__card-title">
              <Zap size={16} />
              What's Next?
            </h3>
          </div>

          <div className="app-confirm__next-inbox">
            <div className="app-confirm__next-inbox-icon"><Mail size={16} /></div>
            <div className="app-confirm__next-inbox-text">
              <strong>Check your inbox</strong>
              <span>We've sent a confirmation email to candidate@example.com with your application reference.</span>
            </div>
          </div>

          <div className="app-confirm__divider" />

          <div className="app-confirm__detail-row">
            <span className="app-confirm__detail-label">
              <Clock size={14} />
              Estimated Review Time
            </span>
            <span className="app-confirm__detail-value">3-5 Business Days</span>
          </div>
          <div className="app-confirm__detail-row">
            <span className="app-confirm__detail-label">
              <ArrowRight size={14} />
              Next Stage
            </span>
            <span className="app-confirm__detail-value">Initial Screening</span>
          </div>

          <div className="app-confirm__divider" />

          <span className="app-confirm__resources-label">HELPFUL RESOURCES</span>
          <div className="app-confirm__resources">
            <button className="app-confirm__resource-item">
              <FileText size={15} />
              <span>Interview Preparation Guide</span>
              <ChevronRight size={14} />
            </button>
            <button className="app-confirm__resource-item">
              <Briefcase size={15} />
              <span>Browse Similar Roles</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="app-confirm__actions">
        <button className="app-confirm__btn app-confirm__btn--gold" onClick={() => navigate('/candidate/applications')}>
          Go to My Applications
        </button>
        <button className="app-confirm__btn app-confirm__btn--outline" onClick={() => navigate('/candidate/jobs')}>
          Back to Job Search
        </button>
      </div>

      <p className="app-confirm__footer-note">
        <ShieldCheck size={13} />
        VERIFIED BY INTELLIHIRE TALENT SYSTEM
      </p>
    </div>
  );
}

export default ApplicationConfirmation;
