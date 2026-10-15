import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  Users,
  Calendar,
  BarChart2,
  ClipboardCheck,
  Bell,
  Building2,
  MessagesSquare,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  LogOut,
} from 'lucide-react';
import '../../style.css';
import { useAuth } from '../../hooks/useAuth';
import { CLOUDINARY_ASSETS } from '../../constants/assets';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/recruiter/dashboard' },
  {
    label: 'Job vacancies',
    icon: Briefcase,
    subItems: [
      { label: 'Active Vacancies', path: '/recruiter/vacancies' },
      { label: 'Create Vacancy', path: '/recruiter/create-vacancy' },
    ],
  },
  {
    label: 'Applicants',
    icon: Users,
    subItems: [
      { label: 'All Applicants', path: '/recruiter/applicants/all' },
      { label: 'Ranked Applicants', path: '/recruiter/applicants/ranked' },
      { label: 'Shortlisted', path: '/recruiter/applicants/shortlisted' },
      { label: 'Interviewed', path: '/recruiter/applicants/interviewed' },
    ],
  },
  {
    label: 'Interviews',
    icon: Calendar,
    subItems: [
      { label: 'Time Slot Management', path: '/recruiter/interviews' },
      { label: 'Candidate Allocation', path: '/recruiter/interviews/allocation' },
      { label: 'Panel Schedule & Reschedules', path: '/panel/interviews' },
    ],
  },
  {
    label: 'Analytics',
    icon: BarChart2,
    subItems: [
      { label: 'Applicant Analytics', path: '/recruiter/analytics/applicants' },
      { label: 'Shortlisting Analytics', path: '/recruiter/analytics/shortlisting' },
      { label: 'Assessment Performance', path: '/recruiter/analytics/assessment' },
      { label: 'Recruitment Progress', path: '/recruiter/analytics/progress' },
    ],
  },
  { label: 'Payments', icon: CreditCard, path: '/recruiter/payments' },
  { label: 'Community', icon: MessagesSquare, path: '/recruiter/community' },
];

const BOTTOM_ITEMS = [
  { label: 'Notifications', icon: Bell, path: '/recruiter/notifications' },
  { label: 'Company profile', icon: Building2, path: '/recruiter/company-profile' },
];

function RecruiterSidebar({ isOpen = false, onClose, activeItem }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState({
    'Job vacancies': true,
    Applicants: true,
    Assessments: true,
    Interviews: true,
    Analytics: true,
  });

  useEffect(() => {
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, []);

  useEffect(() => {
    // If current route is a sub-item of any nav item, expand that nav item
    NAV_ITEMS.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some((sub) => {
          if (activeItem) return sub.label === activeItem;
          return location.pathname === sub.path;
        });
        if (hasActiveSubItem) {
          setExpandedItems((prev) => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [location.pathname, activeItem]);

  function isActive(item) {
    if (activeItem && item.label === activeItem) return true;
    return location.pathname === item.path;
  }

  function isParentActive(item) {
    if (item.subItems) {
      return item.label === activeItem || item.subItems.some((subItem) => isActive(subItem));
    }
    return isActive(item);
  }

  const toggleExpand = (label) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      {/* Floating Expand button when sidebar is collapsed (desktop only) */}
      <button
        type="button"
        className="sidebar-expand-floating-btn"
        onClick={() => {
          document.body.classList.remove('sidebar-collapsed');
          localStorage.setItem('sidebar_collapsed', 'false');
        }}
        aria-label="Expand sidebar"
      >
        <ChevronRight size={18} />
      </button>

      <aside
        className={`app-sidebar ${isOpen ? 'is-open' : ''}`}
        aria-label="Recruiter navigation"
      >
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={CLOUDINARY_ASSETS.logoPrimary}
              alt="IntelliHire"
              style={{ height: '32px', width: '32px', objectFit: 'contain', display: 'block' }}
            />
            <span className="sidebar-logo__wordmark">IntelliHire</span>
          </div>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => {
              const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
              localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
            }}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Recruiter primary navigation">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const hasSubItems = !!item.subItems;
              const isExpanded = !!expandedItems[item.label];
              const active = hasSubItems ? isParentActive(item) : isActive(item);

              if (hasSubItems) {
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      className={`nav-item nav-item-collapsible ${active ? 'is-active' : ''}`}
                      onClick={() => {
                        toggleExpand(item.label);
                        if (item.label === 'Applicants') {
                          navigate('/recruiter/applicants/ranked');
                        } else if (item.label === 'Assessments') {
                          navigate('/recruiter/assessments');
                        }
                      }}
                    >
                      <span className="nav-item-content">
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </span>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {isExpanded && (
                      <ul className="sidebar-sub-list">
                        {item.subItems.map((sub) => (
                          <li key={sub.path}>
                            <Link
                              to={sub.path}
                              className={`sidebar-sub-item ${isActive(sub) ? 'is-active' : ''}`}
                              onClick={onClose}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-item ${active ? 'is-active' : ''}`}
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
          <div className="sidebar-user-chip__avatar">
            {user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'R'}
          </div>
          <div className="sidebar-user-chip__info">
            <span className="sidebar-user-chip__name">{user?.fullName || 'Recruiter'}</span>
            <span className="sidebar-user-chip__role">Recruiter Account</span>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-user-chip__signout"
          onClick={() => {
            logout();
            navigate('/signin');
            onClose();
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </aside>
    </>
  );
}

export default RecruiterSidebar;
