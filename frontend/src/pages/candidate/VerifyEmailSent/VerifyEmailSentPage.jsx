import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resendVerification } from '../../../api/authApi';
import Layout from '../../../components/common/Layout';
import { CLOUDINARY_ASSETS } from '../../../constants/assets';
import '../../../App.css';

function VerifyEmailSentPage() {
  const { state } = useLocation();
  const email = state?.email || '';
  const devVerificationUrl = state?.devVerificationUrl || '';

  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [devLink, setDevLink] = useState(devVerificationUrl);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setStatusMessage('');
    setStatusType('');
    try {
      const data = await resendVerification(email);
      setStatusType('success');
      setStatusMessage(data.message || 'A new verification link has been sent to your email.');
      if (data.devVerificationUrl) {
        setDevLink(data.devVerificationUrl);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to resend verification email.';
      setStatusType('error');
      setStatusMessage(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <Layout theme="dark">
      <main className="auth-split-layout">
        <section className="auth-form-side auth-form-side-centered">
          <div className="auth-wrapper">
            <Link to="/" className="auth-brand auth-mobile-brand" aria-label="IntelliHire Home">
              <img
                src={CLOUDINARY_ASSETS.logoPrimary}
                alt="IntelliHire Logo"
                className="auth-brand-logo"
              />
              <span className="auth-brand-text">IntelliHire</span>
            </Link>

            <section className="auth-card" aria-labelledby="verify-email-sent-card-title">
              <div className="auth-card-header">
                <div className="auth-card-icon-wrapper">
                  <svg className="auth-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h2 id="verify-email-sent-card-title" className="auth-title">Account Created Successfully</h2>
              </div>

              <p className="auth-switch" style={{ textAlign: 'center' }}>
                We've sent a verification link to{email ? <strong> {email}</strong> : ' your email address'}.
                Click the link to verify your account, then sign in.
              </p>

              {devLink && (
                <a
                  href={devLink}
                  className="auth-submit-btn"
                  style={{ textAlign: 'center', textDecoration: 'none' }}
                >
                  <span>Open Verification Link</span>
                </a>
              )}

              <button
                type="button"
                className="auth-submit-btn"
                onClick={handleResend}
                disabled={!email || resending}
                style={{ textAlign: 'center' }}
              >
                <span>{resending ? 'Sending...' : 'Resend verification email'}</span>
              </button>

              {statusMessage && (
                <p className={`form-status ${statusType}`} role="status" aria-live="polite">
                  {statusMessage}
                </p>
              )}

              <p className="auth-switch" style={{ marginTop: '16px' }}>
                Already verified? <Link to="/signin" className="auth-link">Sign in here</Link>
              </p>
            </section>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default VerifyEmailSentPage;
