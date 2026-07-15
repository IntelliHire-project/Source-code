import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import Layout from '../../components/common/Layout';
import '../../App.css';

/**
 * Custom sign in page utilizing standard common components and useAuth context.
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
      }, 1000);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to sign in.';
      setStatusType('error');
      setStatusMessage(message);
    }
  };

  return (
    <Layout>
      <main className="signup-main">
        <section className="signup-card" aria-labelledby="signin-title">
          <h1 id="signin-title">Sign In to Your Account</h1>

          <form className="signup-form" onSubmit={handleSubmit}>
            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              autoComplete="email"
              icon="✉"
              required
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              icon="🔒"
              required
            />

            {statusMessage ? (
              <p className={`form-status ${statusType}`} role="status" aria-live="polite">
                {statusMessage}
              </p>
            ) : null}

            <Button type="submit" variant="primary">
              Sign In
            </Button>

            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>

            <div className="divider"><span>OR</span></div>

            <Button variant="social" type="button">
              <span className="social-icon google">◎</span>
              Continue with Google
            </Button>

            <Button variant="social" type="button">
              <span className="social-icon linkedin">in</span>
              Continue with LinkedIn
            </Button>
          </form>
        </section>
      </main>
    </Layout>
  );
}

export default SignInPage;
