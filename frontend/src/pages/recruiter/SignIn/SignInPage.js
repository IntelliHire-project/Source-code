import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import './SignInPage.css';

/**
 * Premium Recruiter Sign In Page component matching the exact wireframe design
 * and visual standards.
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
    <div className="recruiter-signin-shell">
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

      {/* Main Content Area */}
      <main className="recruiter-main">
        <div className="recruiter-wrapper">
          <section className="recruiter-card" aria-labelledby="login-card-title">
            <div className="recruiter-card-header">
              <div className="recruiter-icon-circle">
                {/* Center Card Briefcase Icon */}
                <svg className="recruiter-card-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h1 id="login-card-title" className="recruiter-title">Recruiter Login</h1>
            </div>

            <form className="recruiter-form" onSubmit={handleSubmit}>
              {/* Email Address */}
              <div className="recruiter-field">
                <div className="recruiter-label-row">
                  <label className="recruiter-label" htmlFor="email">
                    Email Address
                  </label>
                </div>
                <div className="recruiter-input-container">
                  {/* Mail Icon */}
                  <svg className="recruiter-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    id="email"
                    className="recruiter-input"
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
              <div className="recruiter-field">
                <div className="recruiter-label-row">
                  <label className="recruiter-label" htmlFor="password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="recruiter-forgot-link">
                    Forgot password?
                  </Link>
                </div>
                <div className="recruiter-input-container">
                  {/* Lock Icon */}
                  <svg className="recruiter-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="password"
                    className="recruiter-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  {/* Toggle password eye icon button */}
                  <button
                    type="button"
                    className="recruiter-input-eye"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      /* Eye Off Icon */
                      <svg className="recruiter-input-eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      /* Eye Icon */
                      <svg className="recruiter-input-eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember device Checkbox */}
              <div className="recruiter-checkbox-row" onClick={() => setFormData(c => ({ ...c, rememberDevice: !c.rememberDevice }))}>
                <input
                  type="checkbox"
                  name="rememberDevice"
                  checked={formData.rememberDevice}
                  onChange={handleChange}
                  className="recruiter-checkbox-input"
                  onClick={e => e.stopPropagation()} // Prevent double toggle
                />
                <span className="recruiter-checkbox-label">
                  Remember this device for 30 days
                </span>
              </div>

              {/* Status Message Display */}
              {statusMessage && (
                <p className={`recruiter-status ${statusType}`} role="status" aria-live="polite">
                  {statusMessage}
                </p>
              )}

              {/* Submit Button */}
              <button type="submit" className="recruiter-submit-btn-gold" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              {/* Divider */}
              <div className="recruiter-divider">
                <span className="recruiter-divider-text">OR</span>
              </div>

              {/* Register Redirect */}
              <p className="recruiter-register-link-row">
                <Link to="/recruiter/signup" className="recruiter-register-link">
                  Don't have an account? Register your company
                </Link>
              </p>
            </form>
          </section>

          {/* Trusted Subtext below card */}
          <p className="recruiter-trusted-text">
            Trusted by over 10,000+ talent acquisition leaders worldwide. Secure SSL encrypted authentication.
          </p>
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

export default RecruiterSignInPage;
