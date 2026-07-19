
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import Layout from '../../components/common/Layout';
import '../../App.css';

/**
 * Refactored signup page component utilizando standard common components and useAuth context.
 */
function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
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
      // Redirect to sign in after successful sign up
      setTimeout(() => {
        navigate('/signin');
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to create account.';
      setStatusType('error');
      setStatusMessage(message);
    }
  };

  return (
    <Layout>
      <main className="signup-main">
        <section className="signup-card" aria-labelledby="signup-title">
          <h1 id="signup-title">Create Your Account</h1>

          <form className="signup-form" onSubmit={handleSubmit}>
            <InputField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
              icon="👤"
              required
            />

            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              helperText="Must be a valid email address"
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
              helperText="Min 8 characters, include a number"
              autoComplete="new-password"
              icon="🔒"
              required
            />

            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              icon="🔒"
              required
            />

            <label className="terms">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <span>
                I agree to the <Link to="/">Terms &amp; Conditions</Link>
              </span>
            </label>
            <p className="terms-note">By clicking this, you accept our data privacy policy.</p>

            {statusMessage ? (
              <p className={`form-status ${statusType}`} role="status" aria-live="polite">
                {statusMessage}
              </p>
            ) : null}

            <Button type="submit" variant="primary">
              Create Account
            </Button>

            <p className="auth-switch">
              Already have an account? <Link to="/signin">Log In</Link>
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

export default SignupPage;
