import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import Layout from '../../../components/common/Layout';
import '../../../App.css';

/**
 * Premium Recruiter Sign In Page component matching the exact visual standards
 * of the candidate authentication flow.
 */
function RecruiterSignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setFormData(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setStatusMessage('');
    setStatusType('');

    if (!formData.email.trim() || !formData.password) {
      setStatusType('error');
      setStatusMessage('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      setStatusType('success');
      setStatusMessage('Signed in successfully!');

      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to sign in.';
      setStatusType('error');
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout theme="dark">
      <main className="auth-split-layout">
        
        {/* Left Hero Side */}
        <section className="auth-hero-side">
          <Link to="/" className="auth-brand" aria-label="IntelliHire Home">
            {/* Shield Icon Logo */}
            <svg className="auth-brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 11 2 2 4-4" />
            </svg>
            <span className="auth-brand-text">IntelliHire</span>
          </Link>

          <div className="auth-hero-content">
            <h1 className="auth-hero-title">Hire the Best Talent <br /> with <span className="text-accent">Confidence</span></h1>
            <p className="auth-hero-subtitle">
              IntelliHire is a smart recruitment portal that helps employers post jobs, manage applicants, and find top talent with AI-powered hiring insights.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrapper">
                  <svg className="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text">Easy Job Posting</span>
                  <span className="auth-feature-desc">Create and publish job postings in minutes.</span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrapper">
                  <svg className="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <circle cx="12" cy="12" r="4"></circle>
                  </svg>
                </div>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text">AI Candidate Matching</span>
                  <span className="auth-feature-desc">Match positions automatically to the best candidates.</span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrapper">
                  <svg className="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text">Advanced Filtering</span>
                  <span className="auth-feature-desc">Filter applicants by skills, experience, and custom questions.</span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrapper">
                  <svg className="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text">Dynamic Tracking</span>
                  <span className="auth-feature-desc">Track candidate stages in a pipeline easily.</span>
                </div>
              </div>
            </div>

            <div className="auth-hero-footer-features">
              <div className="auth-footer-feature">
                <svg className="auth-footer-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text" style={{fontSize: '13px'}}>Secure Platform</span>
                  <span className="auth-feature-desc" style={{fontSize: '11px'}}>Your corporate data<br/>is fully encrypted.</span>
                </div>
              </div>
              <div className="auth-footer-feature">
                <svg className="auth-footer-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text" style={{fontSize: '13px'}}>AI Powered</span>
                  <span className="auth-feature-desc" style={{fontSize: '11px'}}>Smart algorithms to<br/>rank candidates.</span>
                </div>
              </div>
              <div className="auth-footer-feature">
                <svg className="auth-footer-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text" style={{fontSize: '13px'}}>Global Reach</span>
                  <span className="auth-feature-desc" style={{fontSize: '11px'}}>Connect with elite<br/>talent worldwide.</span>
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
            <section className="auth-card" aria-labelledby="login-card-title">
              <div className="auth-card-header">
                <div className="auth-card-icon-wrapper">
                  {/* Briefcase Icon */}
                  <svg className="auth-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h2 id="login-card-title" className="auth-title">Recruiter Login</h2>
                <p className="auth-subtitle">Welcome back! Please enter your details to access your dashboard.</p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {/* Email Address */}
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

                {/* Password */}
                <div className="auth-field">
                  <div className="auth-label-row">
                    <label className="auth-label" htmlFor="password">Password</label>
                    <Link to="/forgot-password" style={{ fontSize: '11px', color: 'var(--text-secondary-dark)', textDecoration: 'none' }}>
                      Forgot password?
                    </Link>
                  </div>
                  <div className="auth-input-container">
                    <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <svg className="auth-input-icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onClick={togglePasswordVisibility}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                </div>

                {/* Remember device Checkbox */}
                <div className="auth-checkbox-row" onClick={() => setFormData(c => ({ ...c, rememberDevice: !c.rememberDevice }))}>
                  <input
                    type="checkbox"
                    name="rememberDevice"
                    checked={formData.rememberDevice}
                    onChange={handleChange}
                    className="auth-checkbox-input"
                    onClick={e => e.stopPropagation()} // Prevent double toggle
                  />
                  <span className="auth-checkbox-label">
                    Remember this device for 30 days
                  </span>
                </div>

                {/* Status Message Display */}
                {statusMessage && (
                  <p className={`form-status ${statusType}`} role="status" aria-live="polite">
                    {statusMessage}
                  </p>
                )}

                {/* Submit Button */}
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log In'}
                </button>

                {/* Register Redirect */}
                <p className="auth-switch">
                  Don't have an account? <Link to="/recruiter/signup" className="auth-link">Register your company</Link>
                </p>
              </form>
            </section>
          </div>
        </section>

      </main>
    </Layout>
  );
}

export default RecruiterSignInPage;
