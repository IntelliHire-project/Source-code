import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import Layout from '../../../components/common/Layout';
import '../../../App.css';

/**
 * Re-designed Premium Sign In Page component matching the signup design
 * and visual standards in system_design.md.
 */
function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(current => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setStatusMessage('');
    setStatusType('');

    try {
      await login(formData.email, formData.password);
      setStatusType('success');
      setStatusMessage('Signed in successfully!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to sign in.';
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
            <h1 className="auth-title">Sign In to Your Account</h1>
            <p className="auth-subtitle">Welcome back! Please enter your details to access your dashboard.</p>
          </div>

          {/* Form Container */}
          <section className="auth-card" aria-labelledby="signin-card-title">
            <h2 id="signin-card-title" className="sr-only">Sign in form</h2>
            
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
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <p className={`form-status ${statusType}`} role="status" aria-live="polite">
                  {statusMessage}
                </p>
              )}

              {/* Submit Button */}
              <button type="submit" className="auth-submit-btn">
                <span>Sign In</span>
                <svg className="auth-submit-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              {/* Switch to signup */}
              <p className="auth-switch">
                Don't have an account? <Link to="/signup" className="auth-link">Sign up here</Link>
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

export default SignInPage;
