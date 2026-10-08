import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Sparkles,
  Briefcase,
  FileText,
  FileCheck,
  KeyRound,
  Users,
  Bell,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import logo from '../../logo.png';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/candidate/dashboard', exact: true },
  { label: 'CV insights', icon: Sparkles, path: '/candidate/cv-insights' },
  { label: 'Find jobs', icon: Briefcase, path: '/candidate/jobs' },
  { label: 'My applications', icon: FileText, path: '/candidate/applications' },
  { label: 'My assessments', icon: FileCheck, path: '/candidate/assessments' },
  { label: 'Mock interviews', icon: KeyRound, path: '/candidate/mock-interviews' },
  { label: 'Community', icon: Users, path: '/candidate/community' },
];

const BOTTOM_ITEMS = [
  { label: 'Notifications', icon: Bell, path: '/candidate/notifications' },
  { label: 'Settings', icon: Settings, path: '/candidate/settings' },
];

function CandidateSidebar({ isOpen = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function isActive(item) {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  }

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}
        aria-label="Candidate navigation"
      >
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
        <div className="admin-sidebar__logo">
          <img src={logo} alt="IntelliHire" style={{ height: '32px', width: 'auto', display: 'block' }} />
          <span className="admin-sidebar__logo-wordmark">IntelliHire</span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Candidate primary navigation">
          <ul className="admin-sidebar__list">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`admin-sidebar__item ${active ? 'is-active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-sidebar__divider" />

        <ul className="admin-sidebar__list">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`admin-sidebar__item ${active ? 'is-active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="admin-sidebar__divider" />

        <div className="admin-sidebar__user-card">
          <div className="admin-sidebar__user-info">
            <div className="admin-sidebar__user-avatar">
              <div className="admin-sidebar__avatar-placeholder">
                {user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'}
              </div>
            </div>
            <div className="admin-sidebar__user-details">
              <span className="admin-sidebar__user-name">{user?.fullName || 'User'}</span>
              <span className="admin-sidebar__user-role">Job Seeker</span>
            </div>
          </div>
          <button
            className="admin-sidebar__signout-btn"
            onClick={() => {
              logout();
              navigate('/signin');
              onClose();
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default CandidateSidebar;
