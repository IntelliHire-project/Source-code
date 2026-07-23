import React from 'react';
import { Link } from 'react-router-dom';
import './PendingApprovalPage.css';

/**
 * Recruiter Account Pending Approval UI page matching the exact design.
 */
function RecruiterPendingApprovalPage() {
  return (
    <div className="recruiter-pending-shell">
      {/* Top Header Bar */}
      <header className="recruiter-topbar">
        <Link to="/" className="recruiter-brand" aria-label="Recruiter Connect Home">
          {/* Briefcase Icon Logo */}
          <svg className="recruiter-brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span className="recruiter-brand-text">Recruiter Connect</span>
        </Link>
      </header>

      {/* Main Content Card Area */}
      <main className="recruiter-main">
        <div className="recruiter-wrapper">
          <section className="recruiter-card" aria-labelledby="pending-card-title">
            <div className="recruiter-card-header">
              <div className="recruiter-icon-circle">
                {/* Center Card Briefcase Icon */}
                <svg className="recruiter-card-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h1 id="pending-card-title" className="recruiter-title">Account Pending Approval</h1>
            </div>

            {/* Glowing Clock Illustration */}
            <div className="recruiter-clock-container">
              <div className="recruiter-clock-circle">
                <svg className="recruiter-clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>

            {/* Account Pending Text Block */}
            <h2 className="recruiter-review-header">Your company registration is under review.</h2>
            <p className="recruiter-review-text">
              Our administrative team is currently verifying your details. You'll receive a confirmation email at your registered address once approved.
            </p>

            {/* Status Steps Details Box */}
            <div className="recruiter-status-box">
              {/* Row 1: Verification in progress */}
              <div className="recruiter-status-row">
                <div className="recruiter-status-icon-wrapper">
                  {/* Shield Check Icon */}
                  <svg className="recruiter-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 11 2 2 4-4" />
                  </svg>
                </div>
                <div className="recruiter-status-content">
                  <span className="recruiter-status-title">Verification in progress</span>
                  <span className="recruiter-status-desc">Standard reviews typically take 24-48 business hours.</span>
                </div>
              </div>

              {/* Row 2: Check your inbox */}
              <div className="recruiter-status-row">
                <div className="recruiter-status-icon-wrapper">
                  {/* Envelope/Inbox Icon */}
                  <svg className="recruiter-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div className="recruiter-status-content">
                  <span className="recruiter-status-title">Check your inbox</span>
                  <span className="recruiter-status-desc">We'll notify you the moment your account is active.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <Link to="/recruiter/signin" className="recruiter-outline-btn">
              Back to Login
            </Link>

            {/* Immediate Help Text */}
            <p className="recruiter-support-prompt">
              Need immediate assistance?
              <Link to="/support" className="recruiter-support-link">
                Contact Support
              </Link>
            </p>
          </section>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="recruiter-footer">
        <div className="recruiter-footer-links">
          <Link to="/privacy" className="recruiter-footer-link">Privacy Policy</Link>
          <Link to="/terms" className="recruiter-footer-link">Terms of Service</Link>
          <Link to="/support" className="recruiter-footer-link">Support</Link>
        </div>
        <p className="recruiter-copyright">
          © 2026 Recruiter Connect. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default RecruiterPendingApprovalPage;
