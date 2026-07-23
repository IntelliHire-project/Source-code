import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import './SignupPage.css';

/**
 * Premium Recruiter Signup Page component matching the exact wireframe design
 * and visual standards.
 */
function RecruiterSignupPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    industry: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

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

    // Form validation
    if (!formData.companyName.trim()) {
      setStatusType('error');
      setStatusMessage('Company Name is required.');
      return;
    }

    if (!formData.contactName.trim()) {
      setStatusType('error');
      setStatusMessage('Contact Person Name is required.');
      return;
    }

    if (!formData.industry) {
      setStatusType('error');
      setStatusMessage('Please select your industry.');
      return;
    }

    // Password validation rule from mockup:
    // "Must contain at least 8 characters, one number, and one symbol."
    const hasNumber = /\d/.test(formData.password);
    const hasSymbol = /[^A-Za-z0-9]/.test(formData.password);
    if (formData.password.length < 8 || !hasNumber || !hasSymbol) {
      setStatusType('error');
      setStatusMessage('Password must be at least 8 characters and contain at least one number and one symbol.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatusType('error');
      setStatusMessage('Passwords do not match.');
      return;
    }

    if (!formData.agreeTerms) {
      setStatusType('error');
      setStatusMessage('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      // Integration with existing signup method (sending contactName as fullName)
      await signup(
        formData.contactName,
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      setStatusType('success');
      setStatusMessage('Company registered successfully! Redirecting...');

      // Clear form
      setFormData({
        companyName: '',
        contactName: '',
        industry: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
      });

      // Redirect to pending approval after successful registration
      setTimeout(() => {
        navigate('/recruiter/pending-approval');
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to register company.';
      setStatusType('error');
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recruiter-signup-shell">
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

      {/* Main Form Area */}
      <main className="recruiter-main">
        <div className="recruiter-wrapper">
          <section className="recruiter-card" aria-labelledby="register-card-title">
            <div className="recruiter-card-header">
              <div className="recruiter-icon-circle">
                {/* Center Card Briefcase Icon */}
                <svg className="recruiter-card-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h1 id="register-card-title" className="recruiter-title">Register Your Company</h1>
              <p className="recruiter-subtitle">Create an account to start posting jobs and finding top talent for your team.</p>
            </div>

            <form className="recruiter-form" onSubmit={handleSubmit}>
              {/* Company Name */}
              <div className="recruiter-field">
                <div className="recruiter-label-row">
                  <label className="recruiter-label" htmlFor="companyName">
                    Company Name<span className="recruiter-required">*</span>
                  </label>
                </div>
                <div className="recruiter-input-container">
                  {/* Building Icon */}
                  <svg className="recruiter-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                    <path d="M9 22v-4h6v4" />
                    <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
                  </svg>
                  <input
                    id="companyName"
                    className="recruiter-input"
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Global Tech Solutions"
                    required
                  />
                </div>
              </div>

              {/* Contact Person Name */}
              <div className="recruiter-field">
                <div className="recruiter-label-row">
                  <label className="recruiter-label" htmlFor="contactName">
                    Contact Person Name<span className="recruiter-required">*</span>
                  </label>
                </div>
                <div className="recruiter-input-container">
                  {/* User Icon */}
                  <svg className="recruiter-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="contactName"
                    className="recruiter-input"
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </div>
              </div>

              {/* Industry Selection */}
              <div className="recruiter-field">
                <div className="recruiter-label-row">
                  <label className="recruiter-label" htmlFor="industry">
                    Industry<span className="recruiter-required">*</span>
                  </label>
                </div>
                <div className="recruiter-input-container">
                  {/* Briefcase Icon */}
                  <svg className="recruiter-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <select
                    id="industry"
                    className="recruiter-input recruiter-select"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select your industry</option>
                    <option value="tech">Technology &amp; Software</option>
                    <option value="finance">Finance &amp; Banking</option>
                    <option value="healthcare">Healthcare &amp; Pharma</option>
                    <option value="education">Education &amp; E-learning</option>
                    <option value="manufacturing">Manufacturing &amp; Engineering</option>
                    <option value="retail">Retail &amp; E-commerce</option>
                    <option value="other">Other Industry</option>
                  </select>
                </div>
              </div>

              {/* Email Address */}
              <div className="recruiter-field">
                <div className="recruiter-label-row">
                  <label className="recruiter-label" htmlFor="email">
                    Email Address<span className="recruiter-required">*</span>
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
                <div className="recruiter-helper-text">
                  {/* Info Icon */}
                  <svg className="recruiter-helper-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>We'll send a verification link to this address.</span>
                </div>
              </div>

              {/* Password */}
              <div className="recruiter-field">
                <div className="recruiter-label-row">
                  <label className="recruiter-label" htmlFor="password">
                    Password<span className="recruiter-required">*</span>
                  </label>
                </div>
                <div className="recruiter-input-container">
                  {/* Lock Icon */}
                  <svg className="recruiter-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="password"
                    className="recruiter-input"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="recruiter-helper-text">
                  {/* Info Icon */}
                  <svg className="recruiter-helper-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>Must contain at least 8 characters, one number, and one symbol.</span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="recruiter-field">
                <div className="recruiter-label-row">
                  <label className="recruiter-label" htmlFor="confirmPassword">
                    Confirm Password<span className="recruiter-required">*</span>
                  </label>
                </div>
                <div className="recruiter-input-container">
                  {/* Shield Check Icon */}
                  <svg className="recruiter-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 11 2 2 4-4" />
                  </svg>
                  <input
                    id="confirmPassword"
                    className="recruiter-input"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {/* Terms and Privacy Checkbox */}
              <div className="recruiter-checkbox-row" onClick={() => setFormData(c => ({ ...c, agreeTerms: !c.agreeTerms }))}>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="recruiter-checkbox-input"
                  onClick={e => e.stopPropagation()} // Prevent double trigger
                  required
                />
                <span className="recruiter-checkbox-label">
                  I agree to the <Link to="/terms" className="recruiter-link" onClick={e => e.stopPropagation()}>Terms of Service</Link> and <Link to="/privacy" className="recruiter-link" onClick={e => e.stopPropagation()}>Privacy Policy</Link>.
                </span>
              </div>

              {/* Status Message Display */}
              {statusMessage && (
                <p className={`recruiter-status ${statusType}`} role="status" aria-live="polite">
                  {statusMessage}
                </p>
              )}

              {/* Submit Button */}
              <button type="submit" className="recruiter-submit-btn" disabled={loading}>
                {loading ? 'Registering...' : 'Register Company'}
              </button>

              {/* Login Redirect */}
              <p className="recruiter-login-prompt">
                Already have an account?
                <Link to="/recruiter/signin" className="recruiter-login-link">
                  Log in to your dashboard
                </Link>
              </p>
            </form>
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

export default RecruiterSignupPage;
