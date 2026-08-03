import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import './TopBar.css';

/**
 * TopBar — Reusable dashboard top bar component.
 *
 * Follows the IntelliHire Design System (system_design.md § 10).
 * Drop this into any dashboard layout to get breadcrumbs, search,
 * notifications, community link, and a profile dropdown.
 *
 * ──────────────────────────────────────────────────────────────
 * Props
 * ──────────────────────────────────────────────────────────────
 * @param {Object}   user                 - Current user object.
 * @param {string}   user.name            - Display name.
 * @param {string}  [user.role]           - Role label shown below name.
 * @param {string}  [user.avatar]         - Avatar image URL.
 * @param {Array}   [breadcrumbItems]     - Array of { label, path? } objects.
 *        If omitted, breadcrumbs are auto-generated from the current route.
 * @param {number}  [notificationsCount]  - Unread notification count (badge).
 * @param {string}  [searchPlaceholder]   - Placeholder text for search input.
 * @param {Function}[onSearch]            - Called with the search query string.
 * @param {Function}[onNotificationClick] - Called when the bell icon is clicked.
 * @param {Function}[onProfileClick]      - Called when "Profile" is selected from dropdown.
 * @param {Function}[onSettingsClick]     - Called when "Settings" is selected from dropdown.
 * @param {Function}[onLogout]            - Called when "Logout" is selected from dropdown.
 * @param {Function}[onHamburgerClick]    - Called when the mobile hamburger icon is clicked
 *        (use this to toggle the sidebar overlay on ≤ 1024px screens).
 * @param {string}  [className]           - Additional CSS classes on the root element.
 *
 * ──────────────────────────────────────────────────────────────
 * Integration Example
 * ──────────────────────────────────────────────────────────────
 *
 *   import TopBar from '../components/TopBar/TopBar';
 *
 *   function DashboardLayout() {
 *     const { user, logout } = useContext(AuthContext);
 *
 *     return (
 *       <div className="app-shell">
 *         <aside className="app-sidebar">…</aside>
 *         <main>
 *           <TopBar
 *             user={{ name: user.fullName, role: 'Recruiter', avatar: user.avatar }}
 *             notificationsCount={3}
 *             onSearch={(q) => console.log('Search:', q)}
 *             onNotificationClick={() => console.log('Notifications')}
 *             onCommunityClick={() => console.log('Community')}
 *             onLogout={logout}
 *           />
 *           <div className="app-content">{children}</div>
 *         </main>
 *       </div>
 *     );
 *   }
 */

/**
 * Generates breadcrumb items from the current URL pathname.
 * E.g. "/dashboard/projects/settings" → [Dashboard, Projects, Settings]
 */
function buildBreadcrumbsFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Dashboard' }];

  return segments.map((segment, index) => {
    const label = segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const path = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    return { label, path: isLast ? undefined : path };
  });
}

/**
 * Returns up to two uppercase initials from a name string.
 * E.g. "Jane Doe" → "JD", "alice" → "A"
 */
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function TopBar({
  user = {},
  breadcrumbItems,
  notificationsCount = 0,
  searchPlaceholder = 'Search…',
  onSearch,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
  onHamburgerClick,
  className = '',
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  // Auto-generate breadcrumbs from route when not explicitly provided
  const crumbs = breadcrumbItems || buildBreadcrumbsFromPath(location.pathname);

  // ── Search handler ──
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchValue(value);
      if (onSearch) onSearch(value);
    },
    [onSearch],
  );

  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(searchValue);
      }
    },
    [onSearch, searchValue],
  );

  // ── Close dropdown on outside click ──
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // ── Close dropdown on route change ──
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  return (
    <header className={`topbar ${className}`} role="banner">
      {/* ── Left: Hamburger (mobile) + Breadcrumbs ── */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        {onHamburgerClick && (
          <button
            className="topbar__hamburger"
            onClick={onHamburgerClick}
            aria-label="Toggle sidebar"
            type="button"
          >
            <Menu />
          </button>
        )}

        <nav className="topbar__breadcrumb" aria-label="Breadcrumb">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <React.Fragment key={crumb.label + index}>
                {index > 0 && (
                  <span className="topbar__breadcrumb-separator" aria-hidden="true">
                    /
                  </span>
                )}
                {crumb.path && !isLast ? (
                  <Link
                    to={crumb.path}
                    className="topbar__breadcrumb-item"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={`topbar__breadcrumb-item ${
                      isLast ? 'topbar__breadcrumb-item--active' : ''
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* ── Right: Search + Icons + Profile ── */}
      <div className="topbar__actions">
        {/* Search */}
        <div className="topbar__search">
          <input
            className="topbar__search-input"
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            aria-label="Search"
          />
          <Search className="topbar__search-icon" aria-hidden="true" />
        </div>

        {/* Notification bell */}
        <button
          className="topbar__icon-btn"
          onClick={onNotificationClick}
          aria-label={
            notificationsCount > 0
              ? `Notifications — ${notificationsCount} unread`
              : 'Notifications'
          }
          type="button"
        >
          <Bell />
          {notificationsCount > 0 && (
            <span className="topbar__badge" aria-hidden="true">
              {notificationsCount > 99 ? '99+' : notificationsCount}
            </span>
          )}
        </button>

        <span className="topbar__divider" aria-hidden="true" />

        {/* Profile */}
        <div
          className="topbar__profile"
          ref={profileRef}
          onClick={() => setDropdownOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setDropdownOpen((prev) => !prev);
            }
          }}
          role="button"
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="User menu"
        >
          {user.avatar ? (
            <span className="topbar__avatar">
              <img src={user.avatar} alt={user.name || 'User avatar'} />
            </span>
          ) : (
            <span className="topbar__avatar-initials" aria-hidden="true">
              {getInitials(user.name)}
            </span>
          )}

          <span className="topbar__user-info">
            <span className="topbar__user-name">{user.name || 'User'}</span>
            {user.role && (
              <span className="topbar__user-role">{user.role}</span>
            )}
          </span>

          <ChevronDown
            className={`topbar__chevron ${dropdownOpen ? 'topbar__chevron--open' : ''}`}
            aria-hidden="true"
          />

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="topbar__dropdown" ref={dropdownRef} role="menu">
              <button
                className="topbar__dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  if (onProfileClick) {
                    onProfileClick();
                  } else if (location.pathname.startsWith('/recruiter')) {
                    navigate('/recruiter/profile');
                  } else if (location.pathname.startsWith('/candidate')) {
                    navigate('/candidate/profile');
                  }
                }}
                role="menuitem"
                type="button"
              >
                <User /> Profile
              </button>
              <button
                className="topbar__dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  if (onSettingsClick) onSettingsClick();
                }}
                role="menuitem"
                type="button"
              >
                <Settings /> Settings
              </button>
              <div className="topbar__dropdown-divider" role="separator" />
              <button
                className="topbar__dropdown-item topbar__dropdown-item--danger"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  if (onLogout) onLogout();
                }}
                role="menuitem"
                type="button"
              >
                <LogOut /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
