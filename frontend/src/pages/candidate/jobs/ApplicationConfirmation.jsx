import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ShieldCheck,
  Briefcase,
  FileText,
  CalendarDays,
  Home,
} from 'lucide-react';
import './jobs.css';

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
          Thank you for applying. We have received your application successfully. Keep an eye on your applications and emails for updates from the hiring team.
        </p>
      </div>

      {/* Summary Card */}
      <div className="app-confirm__card app-confirm__card--single">
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
    </div>
  );
}

export default ApplicationConfirmation;
