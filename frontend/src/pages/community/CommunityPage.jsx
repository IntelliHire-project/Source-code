import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './CommunityPage.css';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Static mock data
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const POPULAR_TOPICS = [
  { id: 1, icon: 'ðŸ“ˆ', label: 'Career Growth', count: '7.1k', active: true },
  { id: 2, icon: 'ðŸ’¬', label: 'Interview Prep', count: '31k' },
  { id: 3, icon: '#', label: 'Salary Negotiation', count: '47k' },
  { id: 4, icon: 'âš–ï¸', label: 'Work Life Balance', count: '2.1k' },
];

const CATEGORIES = [
  { id: 1, label: 'Announcements' },
  { id: 2, label: 'Job Referrals' },
  { id: 3, label: 'Tech Stack Q&A' },
  { id: 4, label: 'Success Stories' },
  { id: 5, label: 'Mental Health' },
];

const POSTS = [
  {
    id: 1,
    avatar: 'SJ',
    avatarColor: '#6B8CFF',
    author: 'Sarah Jenkins',
    role: 'Senior Marketing Manager',
    time: '2 hours ago',
    badge: 'Pinned',
    badgeType: 'pinned',
    category: 'Career Growth',
    title: 'How I negotiated a 30% increase in my base salary at a Series B startup',
    excerpt:
      'Salary negotiation is often the most stressful part of the hiring process. In this post, I break down the exact scripts I used, the research methodology for market rates, and how to handle the "what is your current salary" trap...',
    likes: 245,
    comments: 42,
  },
  {
    id: 2,
    avatar: 'DC',
    avatarColor: '#22C55E',
    author: 'David Chen',
    role: 'Full Stack Engineer',
    time: '5 hours ago',
    badge: null,
    category: 'Tech Stack Q&A',
    title: 'Is it still worth learning Next.js 13+ with the App Router transition?',
    excerpt:
      "I've been seeing a lot of mixed reviews regarding the stability and DX of the new App Router. As someone looking to specialize in frontend, should I focus on the Pages router first or jump straight into Server Components?",
    likes: 128,
    comments: 89,
  },
  {
    id: 3,
    avatar: 'MT',
    avatarColor: '#F0B90B',
    author: 'Marcus Thorne',
    role: 'Project Director',
    time: '8 hours ago',
    badge: null,
    category: 'Management',
    title: "The shift from IC to Manager: What they don't tell you in the handbook",
    excerpt:
      "Transitioning into management isn't just a step up; it's a career change. Your success is no longer measured by your output, but by the multiplication of your team's output. Here are 5 things I wish I knew...",
    likes: 562,
    comments: 112,
  },
  {
    id: 4,
    avatar: 'ER',
    avatarColor: '#E63946',
    author: 'Elena Rodriguez',
    role: 'Product Designer',
    time: '1 day ago',
    badge: null,
    category: 'Job Referrals',
    title: 'referring 5 junior designers for open roles at FinTech solutions',
    excerpt:
      "My company is expanding our design team and we have 5 open roles for juniors. If you have a portfolio with at least 2 strong case studies, please drop your link below. I'm happy to provide internal referrals for the right candidates...",
    likes: 319,
    comments: 156,
  },
];

const TRENDING = [
  { rank: 1, title: 'React vs. Angular in 2024: The Verdict', participants: '1.1k participants' },
  { rank: 2, title: 'Remote Work Tax Implications for Expats', participants: '640 participants' },
  { rank: 3, title: 'Best portfolio builders for UI/UX designers', participants: '580 participants' },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Sidebar nav items (shared for both roles)
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const NAV_ITEMS = [
  { id: 'dashboard', iconClass: 'fa-solid fa-gauge-high', label: 'Dashboard', path: '/dashboard' },
  { id: 'recruitment', iconClass: 'fa-solid fa-briefcase', label: 'Recruitment', path: '/recruitment' },
  { id: 'question-bank', iconClass: 'fa-solid fa-book-open', label: 'Question Bank', path: '/question-bank' },
  { id: 'assessments', iconClass: 'fa-solid fa-clipboard-check', label: 'Assessments', path: '/assessments' },
  { id: 'community', iconClass: 'fa-solid fa-users', label: 'Community', path: '/community', active: true },
  { id: 'moderator', iconClass: 'fa-solid fa-shield-halved', label: 'Moderator', path: '/moderator' },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Main Component
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CommunityPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('trending');
  const [savedPosts, setSavedPosts] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role || 'candidate';

  const handleSave = (postId) => {
    setSavedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/');
  };

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'AJ'
    : 'AJ';

  const userName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Alex Johnson'
    : 'Alex Johnson';

  const userRoleLabel = role === 'recruiter' ? 'Recruiter' : 'Candidate';

  return (
    <div className="comm-shell">
      {/* â”€â”€ Sidebar â”€â”€ */}
      <aside className={`comm-sidebar${sidebarOpen ? ' comm-sidebar--open' : ''}`} aria-label="Sidebar navigation">
        {/* Logo */}
        <div className="comm-sidebar-logo">
          <div className="comm-logo-box" aria-hidden="true">
            <i className="fa-solid fa-bolt" />
          </div>
          <span className="comm-logo-wordmark">TalentBridge</span>
        </div>

        {/* Nav */}
        <nav className="comm-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`comm-nav-item${item.active ? ' comm-nav-item--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`${item.iconClass} comm-nav-icon`} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Settings pinned bottom */}
        <div className="comm-sidebar-bottom">
          <div className="comm-sidebar-divider" aria-hidden="true" />
          <Link to="/settings" className="comm-nav-item">
            <i className="fa-solid fa-gear comm-nav-icon" aria-hidden="true" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="comm-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* â”€â”€ Main wrapper â”€â”€ */}
      <div className="comm-main-wrapper">
        {/* â”€â”€ Top Bar â”€â”€ */}
        <header className="comm-topbar" aria-label="Top navigation bar">
          <div className="comm-topbar-left">
            <button
              className="comm-hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              <i className="fa-solid fa-bars" />
            </button>
            <nav className="comm-breadcrumb" aria-label="Breadcrumb">
              <Link to="/" className="comm-breadcrumb-item">TalentBridge</Link>
              <i className="fa-solid fa-chevron-right comm-breadcrumb-sep" aria-hidden="true" />
              <Link to="/dashboard" className="comm-breadcrumb-item">Dashboard</Link>
              <i className="fa-solid fa-chevron-right comm-breadcrumb-sep" aria-hidden="true" />
              <span className="comm-breadcrumb-item comm-breadcrumb-item--active">Community</span>
            </nav>
          </div>

          <div className="comm-topbar-right">
            {/* Search */}
            <div className="comm-search-wrap">
              <i className="fa-solid fa-magnifying-glass comm-search-icon" aria-hidden="true" />
              <input
                className="comm-search-input"
                type="search"
                placeholder="Search platform..."
                aria-label="Search platform"
              />
            </div>

            {/* Notification bell */}
            <button className="comm-notif-btn" aria-label="View notifications">
              <i className="fa-solid fa-bell" aria-hidden="true" />
              <span className="comm-notif-dot" aria-label="Unread notifications" />
            </button>

            {/* User chip */}
            <div className="comm-user-chip">
              <div className="comm-user-avatar" aria-hidden="true">{userInitials}</div>
              <div className="comm-user-info">
                <span className="comm-user-name">{userName}</span>
                <span className="comm-user-role">{userRoleLabel}</span>
              </div>
            </div>
          </div>
        </header>

        {/* â”€â”€ Page Content â”€â”€ */}
        <main className="comm-content" id="main-content" aria-label="Community page content">
          {/* Hero Banner */}
          <section className="comm-hero" aria-labelledby="community-hero-title">
            <div className="comm-hero-overlay" aria-hidden="true" />
            <div className="comm-hero-body">
              <span className="comm-hero-eyebrow">COMMUNITY HUB</span>
              <h1 id="community-hero-title" className="comm-hero-title">
                Fuel Your Career Growth with<br />TalentBridge
              </h1>
              <p className="comm-hero-desc">
                Connect with industry experts, share your success stories, and get the insights you need to land your dream role.
              </p>
              <div className="comm-hero-actions">
                <button className="comm-btn comm-btn--primary" id="hero-create-post-btn">
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                  Create New Post
                </button>
                <button className="comm-btn comm-btn--outline" id="hero-guidelines-btn">
                  View Guidelines
                </button>
              </div>
            </div>
          </section>

          {/* â”€â”€ 3-Column Grid â”€â”€ */}
          <div className="comm-grid">
            {/* â”€â”€ Left Panel â”€â”€ */}
            <aside className="comm-left-panel" aria-label="Forum sidebar">
              {/* Search discussions */}
              <div className="comm-panel-search-wrap">
                <i className="fa-solid fa-magnifying-glass comm-panel-search-icon" aria-hidden="true" />
                <input
                  className="comm-panel-search"
                  type="search"
                  placeholder="Search discussions..."
                  aria-label="Search discussions"
                />
              </div>

              {/* Popular Topics */}
              <section className="comm-widget-section" aria-labelledby="popular-topics-title">
                <h2 id="popular-topics-title" className="comm-widget-heading">
                  <i className="fa-solid fa-fire-flame-curved comm-widget-heading-icon" aria-hidden="true" />
                  Popular Topics
                </h2>
                <ul className="comm-topic-list" role="list">
                  {POPULAR_TOPICS.map((topic) => (
                    <li key={topic.id}>
                      <button
                        className={`comm-topic-item${topic.active ? ' comm-topic-item--active' : ''}`}
                        aria-pressed={!!topic.active}
                        id={`topic-btn-${topic.id}`}
                      >
                        <span className="comm-topic-icon" aria-hidden="true">{topic.icon}</span>
                        <span className="comm-topic-label">{topic.label}</span>
                        <span className="comm-topic-count">{topic.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Categories */}
              <section className="comm-widget-section" aria-labelledby="categories-title">
                <h2 id="categories-title" className="comm-widget-heading">
                  <i className="fa-solid fa-table-cells comm-widget-heading-icon" aria-hidden="true" />
                  Categories
                </h2>
                <ul className="comm-category-list" role="list">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.id}>
                      <button className="comm-category-item" id={`category-btn-${cat.id}`}>
                        <i className="fa-solid fa-chevron-right comm-category-chevron" aria-hidden="true" />
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Community Pulse */}
              <section className="comm-widget-section" aria-labelledby="community-pulse-title">
                <h2 id="community-pulse-title" className="comm-pulse-heading">Community Pulse</h2>
                <div className="comm-pulse-row">
                  <span className="comm-pulse-label">Active Now</span>
                  <span className="comm-pulse-value">1,429</span>
                </div>
                <div className="comm-pulse-row">
                  <span className="comm-pulse-label">Total Discussions</span>
                  <span className="comm-pulse-value">17.5k</span>
                </div>
                <div className="comm-pulse-row">
                  <span className="comm-pulse-label">Experts Online</span>
                  <div className="comm-pulse-avatars" aria-hidden="true">
                    <div className="comm-pulse-avatar" style={{ background: '#6B8CFF' }}>E</div>
                    <div className="comm-pulse-avatar" style={{ background: '#22C55E' }}>M</div>
                    <div className="comm-pulse-avatar" style={{ background: '#F0B90B', color: '#16171F' }}>R</div>
                  </div>
                </div>
              </section>
            </aside>

            {/* â”€â”€ Feed â”€â”€ */}
            <section className="comm-feed" aria-label="Discussion feed">
              {/* Tabs */}
              <div className="comm-tabs" role="tablist" aria-label="Feed filter">
                {[
                  { key: 'trending', label: 'Trending' },
                  { key: 'latest', label: 'Latest' },
                  { key: 'top-rated', label: 'Top Rated' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={`comm-tab${activeTab === tab.key ? ' comm-tab--active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                    id={`tab-${tab.key}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Posts */}
              <div className="comm-post-list" role="feed" aria-label="Community posts">
                {POSTS.map((post) => (
                  <article
                    key={post.id}
                    className="comm-post-card"
                    aria-labelledby={`post-title-${post.id}`}
                  >
                    {/* Post header */}
                    <div className="comm-post-header">
                      <div className="comm-post-author">
                        <div
                          className="comm-post-avatar"
                          style={{
                            background: post.avatarColor,
                            color: post.avatarColor === '#F0B90B' ? '#16171F' : '#fff',
                          }}
                          aria-hidden="true"
                        >
                          {post.avatar}
                        </div>
                        <div className="comm-post-meta">
                          <span className="comm-post-author-name">{post.author}</span>
                          <span className="comm-post-author-role">
                            {post.role} Â· {post.time}
                          </span>
                        </div>
                      </div>
                      <div className="comm-post-header-right">
                        {post.badge && (
                          <span className="comm-badge comm-badge--pinned">{post.badge}</span>
                        )}
                        <span className="comm-badge comm-badge--category">{post.category}</span>
                        <button className="comm-post-more" aria-label={`More options for post by ${post.author}`}>
                          <i className="fa-solid fa-ellipsis" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Title & excerpt */}
                    <h3 id={`post-title-${post.id}`} className="comm-post-title">
                      {post.title}
                    </h3>
                    <p className="comm-post-excerpt">{post.excerpt}</p>

                    {/* Actions row */}
                    <div className="comm-post-actions">
                      <div className="comm-post-reactions">
                        <button
                          className="comm-reaction-btn"
                          aria-label={`${post.likes} likes`}
                          id={`like-btn-${post.id}`}
                        >
                          <i className="fa-regular fa-heart" aria-hidden="true" />
                          <span>{post.likes}</span>
                        </button>
                        <button
                          className="comm-reaction-btn"
                          aria-label={`${post.comments} comments`}
                          id={`comment-btn-${post.id}`}
                        >
                          <i className="fa-regular fa-comment" aria-hidden="true" />
                          <span>{post.comments}</span>
                        </button>
                        <button
                          className="comm-reaction-btn"
                          aria-label="Share post"
                          id={`share-btn-${post.id}`}
                        >
                          <i className="fa-solid fa-share-nodes" aria-hidden="true" />
                          <span>Share</span>
                        </button>
                      </div>
                      <button
                        className={`comm-save-btn${savedPosts[post.id] ? ' comm-save-btn--saved' : ''}`}
                        aria-label={savedPosts[post.id] ? 'Unsave post' : 'Save post'}
                        aria-pressed={!!savedPosts[post.id]}
                        onClick={() => handleSave(post.id)}
                        id={`save-btn-${post.id}`}
                      >
                        <i
                          className={savedPosts[post.id] ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}
                          aria-hidden="true"
                        />
                        <span>{savedPosts[post.id] ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More */}
              <div className="comm-load-more-wrap">
                <button
                  className="comm-btn comm-btn--ghost"
                  id="load-more-discussions-btn"
                >
                  Load More Discussions
                </button>
              </div>
            </section>

            {/* â”€â”€ Right Rail â”€â”€ */}
            <aside className="comm-right-rail" aria-label="Right sidebar widgets">
              {/* Have a question? */}
              <div className="comm-widget comm-widget--dark" aria-labelledby="have-question-title">
                <h2 id="have-question-title" className="comm-widget-title comm-widget-title--light">
                  Have a question?
                </h2>
                <p className="comm-widget-desc">
                  Start a discussion and get answers from our global community of experts.
                </p>
                <button className="comm-btn comm-btn--primary comm-widget-cta-btn" id="create-new-thread-btn">
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                  Create New Thread
                </button>
              </div>

              {/* Trending Right Now */}
              <div className="comm-widget" aria-labelledby="trending-now-title">
                <h2 id="trending-now-title" className="comm-widget-title">Trending Right Now</h2>
                <ol className="comm-trending-list" aria-label="Trending discussions">
                  {TRENDING.map((item) => (
                    <li key={item.rank} className="comm-trending-item">
                      <span className="comm-trending-rank" aria-label={`Rank ${item.rank}`}>
                        #{item.rank}
                      </span>
                      <div className="comm-trending-info">
                        <span className="comm-trending-title">{item.title}</span>
                        <span className="comm-trending-participants">
                          <i className="fa-solid fa-users comm-trending-users-icon" aria-hidden="true" />
                          {item.participants}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Expert Spotlight */}
              <div className="comm-widget" aria-labelledby="expert-spotlight-title">
                <h2 id="expert-spotlight-title" className="comm-widget-title">Expert Spotlight</h2>
                <div className="comm-expert-card">
                  <div className="comm-expert-avatar-wrap">
                    <div className="comm-expert-avatar" aria-hidden="true">AR</div>
                    <span className="comm-expert-online-dot" aria-label="Expert is online" />
                  </div>
                  <div className="comm-expert-info">
                    <span className="comm-expert-name">Alex Rivera</span>
                    <span className="comm-expert-role">
                      <i className="fa-solid fa-shield-halved comm-expert-shield" aria-hidden="true" />
                      Staff Engineer @ TechFlow
                    </span>
                  </div>
                </div>
                <blockquote className="comm-expert-quote">
                  "Passionate about mentoring early-career engineers and architecting scalable React applications."
                </blockquote>
                <button
                  className="comm-btn comm-btn--ghost comm-expert-view-btn"
                  id="view-expert-profile-btn"
                >
                  View Profile
                </button>
              </div>

              {/* Footer links */}
              <div className="comm-rail-footer">
                <nav className="comm-rail-footer-links" aria-label="Community footer navigation">
                  <a href="/about" className="comm-rail-footer-link">About</a>
                  <a href="/guidelines" className="comm-rail-footer-link">Guidelines</a>
                  <a href="/privacy" className="comm-rail-footer-link">Privacy</a>
                  <a href="/terms" className="comm-rail-footer-link">Terms</a>
                  <a href="/support" className="comm-rail-footer-link">Support</a>
                </nav>
                <p className="comm-rail-copyright">Â© 2026 TalentBridge Community. v2.4.0</p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CommunityPage;
