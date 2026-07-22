import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Layout from '../../components/common/Layout';
import '../../App.css';

/**
 * Re-designed Premium Signup Page component matching the exact wireframe design
 * and visual standards in system_design.md.
 */
function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [cvFile, setCvFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  const fileInputRef = useRef(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setFormData(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Drag and drop handlers
  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['.pdf', '.doc', '.docx'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (file.size > 5 * 1024 * 1024) {
        setStatusType('error');
        setStatusMessage('File size exceeds the 5MB limit.');
        return;
      }

      setCvFile(file);
      setStatusMessage('');
    }
  };

  const handleFileSelect = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setStatusType('error');
        setStatusMessage('File size exceeds the 5MB limit.');
        return;
      }
      setCvFile(file);
      setStatusMessage('');
    }
  };

  const handleRemoveFile = e => {
    e.stopPropagation();
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setStatusMessage('');
    setStatusType('');

    // Password validation rule from wireframe
    const specialCharRegex = /[^A-Za-z0-9]/;
    if (formData.password.length < 8 || !specialCharRegex.test(formData.password)) {
      setStatusType('error');
      setStatusMessage('Password must be at least 8 characters and contain at least one special character.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatusType('error');
      setStatusMessage('Passwords do not match.');
      return;
    }

    if (!formData.agreeTerms) {
      setStatusType('error');
      setStatusMessage('You must agree to the terms before creating an account.');
      return;
    }

    try {
      const data = await signup(
        formData.fullName,
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      setStatusType('success');
      setStatusMessage(data.message || 'Account created successfully.');

      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
      });
      setCvFile(null);

      // Redirect to dashboard (or signin) after successful registration
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to create account.';
      setStatusType('error');
      setStatusMessage(message);
    }
  };

  return (
    <Layout theme="dark">
      <main className="auth-main">
        <div className="auth-wrapper">

          {/* Logo Header */}
          <Link to="/" className="auth-brand" aria-label="IntelliHire Home">
            <svg className="auth-brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 11 2 2 4-4" />
            </svg>
            <span className="auth-brand-text">IntelliHire</span>
          </Link>

          {/* Form Header */}
          <div className="auth-header">
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">Join thousands of elite candidates discovering premium opportunities.</p>
          </div>

          {/* Form Container */}
          <section className="auth-card" aria-labelledby="signup-card-title">
            <h2 id="signup-card-title" className="sr-only">Sign up form</h2>

            <form className="auth-form" onSubmit={handleSubmit}>

              {/* Full Name Field */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label" htmlFor="fullName">Full Name</label>
                </div>
                <div className="auth-input-container">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="fullName"
                    className="auth-input"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Alexander Pierce"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

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
                <div className="auth-helper">
                  <span className="auth-helper-asterisk">*</span>
                  <span>We'll send a verification link to this email.</span>
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
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="auth-helper">
                  <span className="auth-helper-asterisk">*</span>
                  <span>Must be at least 8 characters with one special symbol.</span>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
                </div>
                <div className="auth-input-container">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 11 2 2 4-4" />
                  </svg>
                  <input
                    id="confirmPassword"
                    className="auth-input"
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

              {/* Upload CV Area */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label" htmlFor="cv-upload-input">Upload Your CV</label>
                  <span className="auth-label-optional">Optional</span>
                </div>

                <input
                  id="cv-upload-input"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                />

                {!cvFile ? (
                  <div
                    className={`auth-upload-zone ${isDragging ? 'dragging' : ''}`}
                    onClick={triggerFileInput}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <svg className="auth-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    <p className="auth-upload-title">Click or drag to upload CV</p>
                    <p className="auth-upload-subtitle">PDF, DOC up to 5MB</p>
                  </div>
                ) : (
                  <div className="auth-file-selected">
                    <div className="auth-file-info">
                      <svg className="auth-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div className="auth-file-details">
                        <span className="auth-file-name">{cvFile.name}</span>
                        <span className="auth-file-size">{(cvFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="auth-file-remove"
                      onClick={handleRemoveFile}
                      aria-label="Remove selected CV file"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Terms and conditions Checkbox */}
              <div className="auth-checkbox-row" onClick={() => setFormData(c => ({ ...c, agreeTerms: !c.agreeTerms }))}>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="auth-checkbox-input"
                  onClick={e => e.stopPropagation()} // Prevent double toggle
                  required
                />
                <span className="auth-checkbox-label">
                  I agree to the <Link to="/terms" className="auth-link" onClick={e => e.stopPropagation()}>Terms &amp; Conditions</Link> and <Link to="/privacy" className="auth-link" onClick={e => e.stopPropagation()}>Privacy Policy</Link>.
                </span>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <p className={`form-status ${statusType}`} role="status" aria-live="polite">
                  {statusMessage}
                </p>
              )}

              {/* Submit Button */}
              <button type="submit" className="auth-submit-btn">
                <span>Create Account</span>
                <svg className="auth-submit-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              {/* Switch to login */}
              <p className="auth-switch">
                Already have an account? <Link to="/signin" className="auth-link">Log in here</Link>
              </p>

              {/* Social authentication divider */}
              <div className="auth-divider">
                <span className="auth-divider-text">Or Continue With</span>
              </div>

              {/* Social Login buttons */}
              <div className="auth-social-row">
                <button type="button" className="auth-social-btn" aria-label="Continue with Google">
                  <span className="auth-social-icon">
                    <svg className="auth-social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                  </span>
                  <span>Continue with Google</span>
                </button>

                <button type="button" className="auth-social-btn" aria-label="Continue with LinkedIn">
                  <span className="auth-social-icon">
                    <svg className="auth-social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0077B5" />
                    </svg>
                  </span>
                  <span>Continue with LinkedIn</span>
                </button>
              </div>

            </form>
          </section>

          {/* Secure Footer area */}
          <footer className="auth-footer">
            <div className="auth-secure-tag">
              <svg className="auth-secure-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Secure Enterprise-Grade Encryption Active</span>
            </div>
            <div className="auth-version-pill">
              v1.0.4-wireframe-candidate-portal
            </div>
          </footer>

        </div>
      </main>
    </Layout>
  );
}

export default SignupPage;
