import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../../../api/authApi';
import Layout from '../../../components/common/Layout';
import { CLOUDINARY_ASSETS } from '../../../constants/assets';
import '../../../App.css';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification link is missing a token. Please use the link from your email.');
      return;
    }

    const run = async () => {
      try {
        const data = await verifyEmail(token);
        setStatus('success');
        setMessage(data.message || 'Email verified successfully. You can now sign in.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
      }
    };

    run();
  }, [token]);

  const handleContinue = () => navigate('/signin');

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

            <section className="auth-card" aria-labelledby="verify-email-card-title">
              <div className="auth-card-header">
                <div className="auth-card-icon-wrapper">
                  <svg className="auth-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12 12 6 2 12l10 6 10-6z" />
                    <path d="M6 12v5c0 1.1 4 3 6 3s6-1.9 6-3v-5" />
                  </svg>
                </div>
                <h2 id="verify-email-card-title" className="auth-title">
                  {status === 'loading' && 'Verifying your email...'}
                  {status === 'success' && 'Email Verified'}
                  {status === 'error' && 'Verification Failed'}
                </h2>
              </div>

              {status === 'loading' ? (
                <p className="auth-switch" style={{ textAlign: 'center' }}>
                  Please wait while we confirm your email address.
                </p>
              ) : (
                <>
                  <p className={`form-status ${status === 'success' ? 'success' : 'error'}`} role="status" aria-live="polite">
                    {message}
                  </p>

                  <button type="button" className="auth-submit-btn" onClick={handleContinue}>
                    <span>Continue to Sign In</span>
                  </button>
                </>
              )}
            </section>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default VerifyEmailPage;
