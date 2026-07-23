import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Eye,
  CreditCard,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import '../../style.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/recruiter/dashboard' },
  { label: 'Active Vacancies', icon: Briefcase, path: '/recruiter/vacancies' },
  { label: 'Create Vacancy', icon: PlusCircle, path: '/recruiter/create-vacancy' },
  { label: 'Vacancy Preview', icon: Eye, path: '/recruiter/vacancy-preview' },
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
  { label: 'Payment History', icon: CreditCard, path: '/recruiter/payments' },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', icon: Settings, path: '/recruiter/settings' },
];

function RecruiterSidebar({ isOpen = false, onClose, activeItem }) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({
    Applicants: true,
  });

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
    if (activeItem) return item.label === activeItem;
    return location.pathname === item.path;
  }

  function isParentActive(item) {
    if (item.subItems) {
      return item.subItems.some((subItem) => isActive(subItem));
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
      <aside className={`app-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo__box">IH</span>
          <span className="sidebar-logo__wordmark">IntelliHire</span>
        </div>

        <nav className="sidebar-nav">
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
                      onClick={() => toggleExpand(item.label)}
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
