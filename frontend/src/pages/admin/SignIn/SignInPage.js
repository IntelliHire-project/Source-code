import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import './SignInPage.css';

/**
 * Premium Admin Sign In Page component matching the high-security console design.
 */
function AdminSignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
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
      setStatusMessage('Administrator email and security password are required.');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      setStatusType('success');
      setStatusMessage('Access granted! Initializing administrator console...');

      // Redirect to dashboard after successful admin login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'System access denied. Invalid credentials.';
      setStatusType('error');
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-signin-shell">
      {/* Top Header Bar */}
      <header className="admin-topbar">
        <Link to="/" className="admin-brand" aria-label="IntelliHire Home">
          {/* Database/Server Icon Logo */}
          <svg className="admin-brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="8" x="2" y="3" rx="2" />
            <rect width="20" height="8" x="2" y="13" rx="2" />
            <line x1="6" y1="7" x2="6.01" y2="7" />
            <line x1="6" y1="17" x2="6.01" y2="17" />
          </svg>
          <span className="admin-brand-text">IntelliHire</span>
          <span className="admin-brand-badge">Admin</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="admin-wrapper">
          <section className="admin-card" aria-labelledby="admin-card-title">
            <div className="admin-card-header">
              <div className="admin-icon-circle">
                {/* Shield Lock Icon */}
                <svg className="admin-card-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <rect width="8" height="5" x="8" y="11" rx="1" />
                  <path d="M10 11V9a2 2 0 1 1 4 0v2" />
                </svg>
              </div>
              <h1 id="admin-card-title" className="admin-title">System Administrator Login</h1>
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              {/* Email Address */}
              <div className="admin-field">
                <div className="admin-label-row">
                  <label className="admin-label" htmlFor="email">
                    Admin Email Address
                  </label>
                </div>
                <div className="admin-input-container">
                  {/* Mail Icon */}
                  <svg className="admin-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    id="email"
                    className="admin-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@intellihire.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="admin-field">
                <div className="admin-label-row">
                  <label className="admin-label" htmlFor="password">
                    Security Password
                  </label>
                </div>
                <div className="admin-input-container">
                  {/* Lock Key Icon */}
                  <svg className="admin-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="password"
                    className="admin-input"
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
                    className="admin-input-eye"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      /* Eye Off Icon */
                      <svg className="admin-input-eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      /* Eye Icon */
                      <svg className="admin-input-eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me Checkbox */}
              <div className="admin-checkbox-row" onClick={() => setFormData(c => ({ ...c, rememberMe: !c.rememberMe }))}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="admin-checkbox-input"
                  onClick={e => e.stopPropagation()} // Prevent double toggle
                />
                <span className="admin-checkbox-label">
                  Remember administrator session
                </span>
              </div>

              {/* Status Message Display */}
              {statusMessage && (
                <p className={`admin-status ${statusType}`} role="status" aria-live="polite">
                  {statusMessage}
                </p>
              )}

              {/* Submit Button */}
              <button type="submit" className="admin-submit-btn" disabled={loading}>
                {loading ? 'Verifying Credentials...' : 'Authenticate Access'}
              </button>
            </form>

            <div className="admin-back-portal">
              <Link to="/signin" className="admin-portal-link">
                &larr; Back to Candidate Portal
              </Link>
            </div>
          </section>

          {/* Secure Audit Warning Box */}
          <div className="admin-warning-box">
            {/* Warning Shield Alert SVG */}
            <svg className="admin-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="admin-warning-text">
              <strong>Authorized Personnel Only.</strong> Unauthorized login attempts will trigger security alerts. All activity on this server is logged and audited under system policy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="admin-footer">
        <div className="admin-footer-links">
          <Link to="/privacy" className="admin-footer-link">Privacy Policy</Link>
          <Link to="/terms" className="admin-footer-link">Terms of Service</Link>
          <Link to="/support" className="admin-footer-link">Security Desk</Link>
        </div>
        <p className="admin-copyright">
          © 2026 IntelliHire Systems. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default AdminSignInPage;
