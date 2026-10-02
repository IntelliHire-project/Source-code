import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import Layout from '../../../components/common/Layout';
import { roleHomePath } from '../../../utils/roleRoutes';
import { resendVerification } from '../../../api/authApi';
import '../../../App.css';

/**
 * Re-designed Premium Unified Sign In Page component serving both
 * Candidates and Recruiters.
 */
function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false,
  });
  
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [devVerificationUrl, setDevVerificationUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('session_expired') === 'true') {
      setStatusType('error');
      setStatusMessage('Your session has expired. Please sign in again to continue.');
    } else if (location.state?.message) {
      setStatusType('success');
      setStatusMessage(location.state.message);
    }
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state, location.search]);

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setFormData(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setStatusMessage('');
    setStatusType('');
    setUnverifiedEmail('');
    setDevVerificationUrl('');

    try {
      const data = await login(formData.email, formData.password, formData.rememberDevice);
      setStatusType('success');
      setStatusMessage('Signed in successfully!');

      setTimeout(() => {
        navigate(roleHomePath(data.user?.role));
      }, 1200);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || 'Unable to sign in.';
      setStatusType('error');
      setStatusMessage(message);
      if (status === 403) {
        setUnverifiedEmail(formData.email);
      }
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail || resending) return;
    setResending(true);
    setStatusMessage('');
    setStatusType('');
    setDevVerificationUrl('');
    try {
      const data = await resendVerification(unverifiedEmail);
      setStatusType('success');
      setStatusMessage(data.message || 'A new verification link has been sent to your email.');
      if (data.devVerificationUrl) {
        setDevVerificationUrl(data.devVerificationUrl);
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
        
        {/* Left Hero Side */}
        <section className="auth-hero-side auth-hero-centered">
          <Link to="/" className="auth-brand" aria-label="IntelliHire Home">
            <svg className="auth-brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 11 2 2 4-4" />
            </svg>
            <span className="auth-brand-text">IntelliHire</span>
          </Link>

          <div className="auth-hero-content">
            <h1 className="auth-hero-title">Empowering Careers. <br /> Enabling <span className="text-accent">Smarter Hiring.</span></h1>
            <p className="auth-hero-subtitle">
              IntelliHire is an AI-powered recruitment platform connecting talented candidates with forward-thinking employers. From intelligent career guidance and resume analysis to AI-assisted hiring and applicant management, IntelliHire streamlines the recruitment journey for everyone.
            </p>

{/* Bottom Trust Indicators */}
            <div className="auth-hero-footer-features">
              <div className="auth-footer-feature">
                <svg className="auth-footer-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text" style={{fontSize: '13px'}}>Secure Platform</span>
                  <span className="auth-feature-desc" style={{fontSize: '11px'}}></span>
                </div>
              </div>
              <div className="auth-footer-feature">
                <svg className="auth-footer-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text" style={{fontSize: '13px'}}>AI Powered</span>
                  <span className="auth-feature-desc" style={{fontSize: '11px'}}></span>
                </div>
              </div>
              <div className="auth-footer-feature">
                <svg className="auth-footer-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text" style={{fontSize: '13px'}}>Trusted Recruitment</span>
                  <span className="auth-feature-desc" style={{fontSize: '11px'}}></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Form Side */}
        <section className="auth-form-side">
          <div className="auth-wrapper">
            
            {/* Mobile Logo Header */}
            <Link to="/" className="auth-brand auth-mobile-brand" aria-label="IntelliHire Home">
              <svg className="auth-brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 11 2 2 4-4" />
              </svg>
              <span className="auth-brand-text">IntelliHire</span>
            </Link>

            {/* Form Container */}
            <section className="auth-card" aria-labelledby="signin-card-title">
              <div className="auth-card-header">
                <div className="auth-card-icon-wrapper">
                  <svg className="auth-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h2 id="signin-card-title" className="auth-title">Sign In to Your Account</h2>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                
                {/* Email Field */}
                <div className="auth-field">
                  <div className="auth-label-row">
                    <label className="auth-label" htmlFor="email">Email Address</label>
                  </div>
                  <div className="auth-input-container">
                    <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                      id="email"
                      className="auth-input"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="auth-field">
                  <div className="auth-label-row">
                    <label className="auth-label" htmlFor="password">Password</label>
                  </div>
                  <div className="auth-input-container">
                    <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      id="password"
                      className="auth-input"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-input-icon-right"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="auth-row" style={{ justifyContent: 'space-between', alignItems: 'center', margin: '4px 0' }}>
                  <div className="auth-checkbox-row" onClick={() => setFormData(c => ({ ...c, rememberDevice: !c.rememberDevice }))}>
                    <input
                      type="checkbox"
                      name="rememberDevice"
                      checked={formData.rememberDevice}
                      onChange={handleChange}
                      className="auth-checkbox-input"
                      onClick={e => e.stopPropagation()} // Prevent double toggle
                    />
                    <span className="auth-checkbox-label" style={{ fontSize: '12px' }}>
                      Remember Me
                    </span>
                  </div>
                  <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--text-secondary-dark)', textDecoration: 'none' }}>
                    Forgot Password?
                  </Link>
                </div>

                {/* Status Message */}
                {statusMessage && (
                  <p className={`form-status ${statusType}`} role="status" aria-live="polite">
                    {statusMessage}
                  </p>
                )}

                {/* Resend verification link (shown when the account is not yet verified) */}
                {unverifiedEmail && (
                  <button
                    type="button"
                    className="auth-resend-btn"
                    onClick={handleResend}
                    disabled={resending}
                    style={{ marginBottom: '12px' }}
                  >
                    {resending ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}

                {/* Dev-only: direct verification link returned by the backend */}
                {devVerificationUrl && (
                  <a
                    href={devVerificationUrl}
                    className="auth-submit-btn"
                    style={{ textAlign: 'center', textDecoration: 'none', marginBottom: '12px' }}
                  >
                    <span>Open Verification Link</span>
                  </a>
                )}

                {/* Submit Button */}
                <button type="submit" className="auth-submit-btn">
                  <span>Sign In</span>
                  <svg className="auth-submit-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Social authentication divider */}
                <div className="auth-divider">
                  <span className="auth-divider-text">OR CONTINUE WITH</span>
                </div>

                {/* Social Login buttons */}
                <div className="auth-social-row">
                  <button type="button" className="auth-social-btn" aria-label="Continue with Google">
                    <span className="auth-social-icon">
                      <svg className="auth-social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                    </span>
                    <span>Continue with Google</span>
                  </button>

                  <button type="button" className="auth-social-btn" aria-label="Continue with LinkedIn">
                    <span className="auth-social-icon">
                      <svg className="auth-social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0077B5"/>
                      </svg>
                    </span>
                    <span>Continue with LinkedIn</span>
                  </button>
                </div>

                {/* Switch to Signup */}
                <div className="auth-signup-options" style={{ marginTop: '20px', textAlign: 'center' }}>
                  <p className="auth-switch" style={{ marginBottom: '8px' }}>Don't have an account?</p>
                  <div className="auth-signup-links">
                    <Link to="/signup" className="auth-signup-btn">Candidate Account</Link>
                    <Link to="/recruiter/signup" className="auth-signup-btn">Recruiter Account</Link>
                  </div>
                </div>

              </form>
            </section>

          </div>
        </section>
      </main>
    </Layout>
  );
}

export default SignInPage;
