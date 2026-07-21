import React from 'react';
import logo from '../../logo.png';
import '../../App.css';

/**
 * Common application layout container (includes Header and Footer).
 * Supports theme="dark" for the premium wireframe signup/signin page shell.
 */
function Layout({ children, theme }) {
  if (theme === 'dark') {
    return (
      <div className="auth-page-shell">
        {children}
      </div>
    );
  }

  return (
    <div className="signup-shell">
      <header className="topbar" aria-label="IntelliHire brand">
        <img className="brand-logo" src={logo} alt="IntelliHire" />
      </header>

      {children}

      <footer className="footer">
        <p>© 2026 Applicant Gateway. All rights reserved.</p>
        <nav aria-label="Footer links">
          <a href="/">Terms of Service</a>
          <a href="/">Privacy Policy</a>
          <a href="/">Cookie Policy</a>
        </nav>
      </footer>
    </div>
  );
}

export default Layout;
