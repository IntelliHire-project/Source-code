import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building,
  Briefcase,
  CreditCard,
  MessageSquare,
  FileText,
  Activity,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Companies', icon: Building, path: '/admin/companies' },
  { label: 'Job moderation', icon: Briefcase, path: '/admin/job-moderation' },
  { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
  { label: 'Community mod.', icon: MessageSquare, path: '/admin/community-mod' },
  { label: 'Reports', icon: FileText, path: '/admin/reports' },
  { label: 'System health', icon: Activity, path: '/admin/system-health' },
];

const BOTTOM_ITEMS = [
  { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { label: 'System settings', icon: Settings, path: '/admin/settings' },
];

function AdminSidebar({ isOpen = false, onClose, activeItem }) {
  const location = useLocation();

  function isActive(item) {
    if (activeItem) return item.label === activeItem;
    // Highlight if current path starts with item's path (excluding Dashboard check)
    if (item.path === '/admin/dashboard') {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  }

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}
      <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar__logo">
          {/* Yellow Shield/Check Icon */}
          <div className="admin-sidebar__logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="var(--accent)" stroke="var(--accent)" />
              <polyline points="9 11 11 13 15 9" stroke="#16171F" />
            </svg>
          </div>
          <span className="admin-sidebar__logo-wordmark">IntelliHire</span>
        </div>

        <nav className="admin-sidebar__nav">
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
              <div className="admin-sidebar__avatar-placeholder">JT</div>
            </div>
            <div className="admin-sidebar__user-details">
              <span className="admin-sidebar__user-name">Julian Thorne</span>
              <span className="admin-sidebar__user-role">Senior Moderator</span>
            </div>
          </div>
          <button className="admin-sidebar__signout-btn" onClick={() => console.log('Sign Out clicked')}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
