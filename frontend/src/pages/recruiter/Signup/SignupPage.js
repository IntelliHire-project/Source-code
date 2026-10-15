import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import Layout from '../../../components/common/Layout';
import { CLOUDINARY_ASSETS } from '../../../constants/assets';
import '../../../App.css';

/**
 * Premium Recruiter Signup Page component matching the exact visual standards
 * of the candidate authentication flow.
 */
function RecruiterSignupPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companyWebsite: '',
    companyRegNumber: '',
    companyLocation: '',
    companyLinkedin: '',
    contactName: '',
    jobTitle: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!formData.industry) {
      setStatusType('error');
      setStatusMessage('Please select your industry.');
      return;
    }

    if (!formData.companyWebsite.trim()) {
      setStatusType('error');
      setStatusMessage('Company Website is required.');
      return;
    }

    if (!formData.companyRegNumber.trim()) {
      setStatusType('error');
      setStatusMessage('Company Registration Number is required.');
      return;
    }

    if (!formData.companyLocation.trim()) {
      setStatusType('error');
      setStatusMessage('Company Location is required.');
      return;
    }

    if (!formData.contactName.trim()) {
      setStatusType('error');
      setStatusMessage('Full Name is required.');
      return;
    }

    if (!formData.jobTitle.trim()) {
      setStatusType('error');
      setStatusMessage('Job Title is required.');
      return;
    }

    if (!formData.email.trim()) {
      setStatusType('error');
      setStatusMessage('Business Email is required.');
      return;
    }

    if (!formData.phone.trim()) {
      setStatusType('error');
      setStatusMessage('Phone Number is required.');
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
      // Register company with recruiter profile details
      const data = await signup({
        fullName: formData.contactName,
        contactName: formData.contactName,
        companyName: formData.companyName,
        industry: formData.industry,
        companyWebsite: formData.companyWebsite,
        companyRegNumber: formData.companyRegNumber,
        companyLocation: formData.companyLocation,
        companyLinkedin: formData.companyLinkedin,
        jobTitle: formData.jobTitle,
        email: formData.email,
        phone: formData.phone,
        linkedinUrl: formData.linkedinUrl,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'recruiter',
      });

      setStatusType('success');
      setStatusMessage('Registration submitted successfully! Redirecting...');

      // Clear form
      setFormData({
        companyName: '',
        industry: '',
        companyWebsite: '',
        companyRegNumber: '',
        companyLocation: '',
        companyLinkedin: '',
        contactName: '',
        jobTitle: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
      });

      // Redirect to the pending approval page after successful registration
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
    <Layout theme="dark">
      <main className="auth-split-layout">
        
        {/* Left Hero Side */}
        <section className="auth-hero-side">
          <Link to="/" className="auth-brand" aria-label="IntelliHire Home">
            <img
              src={CLOUDINARY_ASSETS.logoPrimary}
              alt="IntelliHire Logo"
              className="auth-brand-logo"
            />
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
                <svg className="auth-footer-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <img
                src={CLOUDINARY_ASSETS.logoPrimary}
                alt="IntelliHire Logo"
                className="auth-brand-logo"
              />
              <span className="auth-brand-text">IntelliHire</span>
            </Link>

            {/* Form Container */}
            <section className="auth-card" aria-labelledby="register-card-title">
              <div className="auth-card-header">
                <div className="auth-card-icon-wrapper">
                  {/* Briefcase Icon */}
                  <svg className="auth-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h2 id="register-card-title" className="auth-title">Register Your Company</h2>
              </div>

              {/* Role Toggle Switch */}
              <div className="auth-role-toggle">
                <Link to="/signup" className="auth-role-tab">Candidate</Link>
                <span className="auth-role-tab active">Recruiter</span>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {/* --- Company Information --- */}
                <h3 style={{ color: '#fff', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.25rem' }}>Company Information</h3>
                
                <div className="auth-row">
                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="companyName">Company Name *</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="companyName"
                        className="auth-input"
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Tech Solutions"
                        required
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="industry">Industry *</label>
                    </div>
                    <div className="auth-input-container">
                      <select
                        id="industry"
                        className="auth-input recruiter-select"
                        name="industry"
                        style={{ paddingLeft: '14px', paddingRight: '14px', appearance: 'none', background: 'transparent' }}
                        value={formData.industry}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled style={{ backgroundColor: '#0B0B0F' }}>Select industry</option>
                        <option value="tech" style={{ backgroundColor: '#0B0B0F' }}>Technology &amp; Software</option>
                        <option value="finance" style={{ backgroundColor: '#0B0B0F' }}>Finance &amp; Banking</option>
                        <option value="healthcare" style={{ backgroundColor: '#0B0B0F' }}>Healthcare &amp; Pharma</option>
                        <option value="education" style={{ backgroundColor: '#0B0B0F' }}>Education &amp; E-learning</option>
                        <option value="manufacturing" style={{ backgroundColor: '#0B0B0F' }}>Manufacturing &amp; Engineering</option>
                        <option value="retail" style={{ backgroundColor: '#0B0B0F' }}>Retail &amp; E-commerce</option>
                        <option value="other" style={{ backgroundColor: '#0B0B0F' }}>Other Industry</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="auth-row">
                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="companyWebsite">Company Website *</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="companyWebsite"
                        className="auth-input"
                        type="url"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        required
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="companyRegNumber">Company Registration Number *</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="companyRegNumber"
                        className="auth-input"
                        type="text"
                        name="companyRegNumber"
                        value={formData.companyRegNumber}
                        onChange={handleChange}
                        placeholder="e.g. CRN-12345"
                        required
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-row">
                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="companyLocation">Company Location *</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="companyLocation"
                        className="auth-input"
                        type="text"
                        name="companyLocation"
                        value={formData.companyLocation}
                        onChange={handleChange}
                        placeholder="City, Country"
                        required
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="companyLinkedin">Company LinkedIn URL</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="companyLinkedin"
                        className="auth-input"
                        type="url"
                        name="companyLinkedin"
                        value={formData.companyLinkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/company/..."
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* --- Recruiter Information --- */}
                <h3 style={{ color: '#fff', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.25rem' }}>Recruiter Information</h3>

                <div className="auth-row">
                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="contactName">Full Name *</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="contactName"
                        className="auth-input"
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        placeholder="e.g. Jane Doe"
                        required
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="jobTitle">Job Title / Position *</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="jobTitle"
                        className="auth-input"
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="e.g. Senior HR Manager"
                        required
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-row">
                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="email">Business Email *</label>
                    </div>
                    <div className="auth-input-container">
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
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="phone">Phone Number *</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="phone"
                        className="auth-input"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        required
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-row">
                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="linkedinUrl">LinkedIn Profile URL</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="linkedinUrl"
                        className="auth-input"
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/..."
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* --- Account --- */}
                <h3 style={{ color: '#fff', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.25rem' }}>Account</h3>

                <div className="auth-row">
                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="password">Password *</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="password"
                        className="auth-input"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        style={{ paddingLeft: '14px' }}
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
                      <label className="auth-label" htmlFor="confirmPassword">Confirm Password *</label>
                    </div>
                    <div className="auth-input-container">
                      <input
                        id="confirmPassword"
                        className="auth-input"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        style={{ paddingLeft: '14px' }}
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

                {/* Terms and conditions Checkbox */}
                <div className="auth-checkbox-row" onClick={() => setFormData(c => ({ ...c, agreeTerms: !c.agreeTerms }))}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="auth-checkbox-input"
                    onClick={e => e.stopPropagation()} // Prevent double trigger
                    required
                  />
                  <span className="auth-checkbox-label">
                    I agree to the <Link to="/terms" className="auth-link" onClick={e => e.stopPropagation()}>Terms of Service</Link> and <Link to="/privacy" className="auth-link" onClick={e => e.stopPropagation()}>Privacy Policy</Link>.
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
                  {loading ? 'Registering...' : 'Register Company'}
                </button>

                {/* Switch to Login */}
                <p className="auth-switch">
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

export default RecruiterSignupPage;
