import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Eye,
  CreditCard,
  Settings,
} from 'lucide-react';
import '../../style.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/recruiter/dashboard' },
  { label: 'Active Vacancies', icon: Briefcase, path: '/recruiter/vacancies' },
  { label: 'Create Vacancy', icon: PlusCircle, path: '/recruiter/create-vacancy' },
  { label: 'Vacancy Preview', icon: Eye, path: '/recruiter/vacancy-preview' },
  { label: 'Payment History', icon: CreditCard, path: '/recruiter/payments' },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', icon: Settings, path: '/recruiter/settings' },
];

function RecruiterSidebar({ isOpen = false, onClose, activeItem }) {
  const location = useLocation();

  function isActive(item) {
    if (activeItem) return item.label === activeItem;
    return location.pathname === item.path;
  }

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}
      <aside className={`app-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo__box">IH</span>
          <span className="sidebar-logo__wordmark">IntelliHire</span>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-item ${isActive(item) ? 'is-active' : ''}`}
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

        <div className="nav-divider" />

        <ul className="nav-list">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-item ${isActive(item) ? 'is-active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-user-chip">
          <div className="sidebar-user-chip__avatar">R</div>
          <div className="sidebar-user-chip__info">
            <span className="sidebar-user-chip__name">Recruiter</span>
            <span className="sidebar-user-chip__role">Recruiter Account</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default RecruiterSidebar;
