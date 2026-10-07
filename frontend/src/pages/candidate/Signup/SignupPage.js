import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import Layout from '../../../components/common/Layout';
import '../../../App.css';

/**
 * Re-designed Premium Signup Page component matching the exact wireframe design
 * and visual standards in system_design.md.
 */
function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [cvFile, setCvFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (fileExt !== '.pdf' && file.type !== 'application/pdf') {
        setStatusType('error');
        setStatusMessage('Invalid file format. Only PDF files are allowed.');
        return;
      }

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
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (fileExt !== '.pdf' && file.type !== 'application/pdf') {
        setStatusType('error');
        setStatusMessage('Invalid file format. Only PDF files are allowed.');
        return;
      }

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
      const data = await signup({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'candidate',
        cvFile,
      });

      setStatusType('success');
      setStatusMessage('Account created successfully! Redirecting to sign in...');

      const registeredEmail = formData.email;

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
      });
      setCvFile(null);

      // Redirect to the candidate login page after successful registration
      setTimeout(() => {
        navigate('/signin', {
          state: { email: registeredEmail, message: 'Account created successfully! Please sign in.' },
        });
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to create account.';
      setStatusType('error');
      setStatusMessage(message);
    }
  };

  return (
    <Layout theme="dark">
      <main className="auth-split-layout">
        
        {/* Left Hero Side */}
        <section className="auth-hero-side">
          <Link to="/" className="auth-brand" aria-label="IntelliHire Home">
            <svg className="auth-brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 11 2 2 4-4" />
            </svg>
            <span className="auth-brand-text">IntelliHire</span>
          </Link>

          <div className="auth-hero-content">
            <h1 className="auth-hero-title">Launch Your Career <br /> with <span className="text-accent">Confidence</span></h1>
            <p className="auth-hero-subtitle">
              IntelliHire is a smart recruitment and career guidance system that helps candidates showcase their skills, discover suitable opportunities, and get AI-powered insights to grow in their careers.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrapper">
                  <svg className="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text">AI Resume Analysis</span>
                  <span className="auth-feature-desc">Get AI-powered feedback to improve your resume.</span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrapper">
                  <svg className="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text">Intelligent Job Matching</span>
                  <span className="auth-feature-desc">Find roles that match your skills and career goals.</span>
                </div>
              </div>



              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrapper">
                  <svg className="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text">Personalized Career Guidance</span>
                  <span className="auth-feature-desc">Receive tailored recommendations for your career.</span>
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
                  <span className="auth-feature-text">Application Tracking</span>
                  <span className="auth-feature-desc">Track and manage your job applications in one place.</span>
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
                  <span className="auth-feature-desc" style={{fontSize: '11px'}}>Your data is encrypted<br/>and fully protected.</span>
                </div>
              </div>
              <div className="auth-footer-feature">
                <svg className="auth-footer-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text" style={{fontSize: '13px'}}>AI Powered</span>
                  <span className="auth-feature-desc" style={{fontSize: '11px'}}>Smart algorithms for<br/>better career decisions.</span>
                </div>
              </div>
              <div className="auth-footer-feature">
                <svg className="auth-footer-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <div className="auth-feature-text-block">
                  <span className="auth-feature-text" style={{fontSize: '13px'}}>Recruiter Verified</span>
                  <span className="auth-feature-desc" style={{fontSize: '11px'}}>Opportunities from<br/>trusted employers.</span>
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
          <section className="auth-card" aria-labelledby="signup-card-title">
            <div className="auth-card-header">
              <div className="auth-card-icon-wrapper">
                <svg className="auth-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 id="signup-card-title" className="auth-title">Create Your Account</h2>
            </div>

            {/* Role Toggle Switch */}
            <div className="auth-role-toggle">
              <span className="auth-role-tab active">Candidate</span>
              <Link to="/recruiter/signup" className="auth-role-tab">Recruiter</Link>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>

              {/* Row 1: Name and Email */}
              <div className="auth-row">
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
              </div>

              {/* Row 2: Passwords */}
              <div className="auth-row">
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
                      autoComplete="new-password"
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

                <div className="auth-field">
                  <div className="auth-label-row">
                    <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
                  </div>
                  <div className="auth-input-container">
                    <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      id="confirmPassword"
                      className="auth-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-input-icon-right"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Phone */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label" htmlFor="phone">Phone Number</label>
                </div>
                <div className="auth-input-container">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input
                    id="phone"
                    className="auth-input"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    autoComplete="tel"
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
                  accept=".pdf,application/pdf"
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
                    <p className="auth-upload-title">Drag & drop your CV here</p>
                    <p className="auth-upload-subtitle">PDF up to 5MB</p>
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

              {/* Switch to login */}
              <p className="auth-switch" style={{ marginTop: '24px' }}>
                Already have an account? <Link to="/signin" className="auth-link">Log in here</Link>
              </p>

            </form>
          </section>



          </div>
        </section>
      </main>
    </Layout>
  );
}

export default SignupPage;
