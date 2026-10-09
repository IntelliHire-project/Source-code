import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Check,
  Eye,
  Trash2,
  X,
  SlidersHorizontal,
  MessageSquare,
  User,
  Calendar,
  Zap,
  Clock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Bell
} from 'lucide-react';
import AdminSidebar from '../../../components/common/AdminSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import AdminToast from '../../../components/common/AdminToast';
import {
  getReports,
  saveReports,
  getComments,
  saveComments,
  appendAuditLog,
  recordRemovedPost,
  getRemovedPostsList,
  restoreRemovedPost,
  dispatchUserWarning,
  getUserWarnings
} from '../../../services/adminStorage';
import './ModerateCommunity.css';

// Initial Mock Reports matching mockup layout & fields
const INITIAL_REPORTS = [
  {
    id: 88291,
    targetPostId: 'salary-negotiation',
    title: 'Why the current political climate is failing...',
    snippet: 'The system is completely rigged. Anyone who supports the [Redacted Sector] is fundamentally against...',
    content: "The system is completely rigged. Anyone who supports the [Redacted Sector] is fundamentally against humanity and should be dealt with accordingly. We don't need logic, we need action against these monsters who believe they can rule us with their outdated ideologies...",
    category: 'Hate Speech',
    reportedBy: 'bot_hunter',
    author: 'PoliticalVoice',
    date: '2026-10-09 06:50',
    severity: 'High',
    source: 'Web',
    authorTrust: 15,
    violations: '12 Warnings / 2 Temporaries',
    flagMessage: 'Automated Flag: Potential incitement of violence detected in Paragraph 2.'
  },
  {
    id: 88290,
    targetPostId: 'post-iphone-spam',
    title: 'Free iPhone giveaway - Click link to claim now',
    snippet: 'Hey everyone! I just got a free iPhone 15 by clicking this link, it actually works! Try it...',
    content: 'Hey everyone! I just got a free iPhone 15 by clicking this link, it actually works! Try it out before it gets taken down. No credit card required, just enter your email address and verify. http://freeiphones.spam.net',
    category: 'Spam',
    reportedBy: 'system_ai',
    author: 'crypto_giveaways',
    date: '2026-10-09 06:50',
    severity: 'Medium',
    source: 'Mobile App',
    authorTrust: 45,
    violations: '2 Warnings / 0 Temporaries',
    flagMessage: 'Automated Flag: Known spam link pattern detected.'
  },
  {
    id: 88289,
    targetPostId: 'post-lag-inapp',
    title: 'Is it just me or is the site laggy',
    snippet: 'Every time I try to upload my portfolio or search for candidates, the loader spins for...',
    content: 'Every time I try to upload my portfolio or search for candidates, the loader spins for ages and then crashes. Anyone else having this issue today? It makes it impossible to complete recruiter assessments.',
    category: 'Inappropriate',
    reportedBy: 'sara_smith',
    author: 'DevUser99',
    date: '2026-10-09 06:10',
    severity: 'Low',
    source: 'API',
    authorTrust: 95,
    violations: '0 Warnings / 0 Temporaries'
  },
  {
    id: 88288,
    targetPostId: 'post-earn5000',
    title: 'Earn $5000/week from home working 1 hour a day!',
    snippet: 'Simple tasks, no experience required. We train you. Just need an internet connection...',
    content: 'Simple tasks, no experience required. We train you. Just need an internet connection. Start earning immediately. Click here to sign up: http://getrichquick.spam',
    category: 'Spam',
    reportedBy: 'system_ai',
    author: 'quick_cash_biz',
    date: '2026-10-09 05:40',
    severity: 'Medium',
    source: 'Web',
    authorTrust: 30,
    violations: '5 Warnings / 1 Temporary',
    flagMessage: 'Automated Flag: High volume posting pattern.'
  },
  {
    id: 88287,
    targetPostId: 'post-unprofessional-rec',
    title: 'Unprofessional recruiter experience at Apex Corp',
    snippet: 'The recruiter showed up 20 minutes late to my interview and started eating during...',
    content: "The recruiter showed up 20 minutes late to my interview and started eating during the call. Absolutely unprofessional behavior. I asked them questions and they didn't even respond. Has anyone had similar experiences?",
    category: 'Inappropriate',
    reportedBy: 'candidate_anon',
    author: 'Anonymous_Candidate',
    date: '2026-10-09 04:30',
    severity: 'Low',
    source: 'Web',
    authorTrust: 80,
    violations: '1 Warning / 0 Temporaries'
  },
  {
    id: 88286,
    targetPostId: 'post-security-alert',
    title: 'Your account has been compromised, reset immediately',
    snippet: 'Security Alert: We detected suspicious login attempts on your account. Please log in...',
    content: 'Security Alert: We detected suspicious login attempts on your account. Please log in immediately at http://login-verify-account-portal.com to secure your data and reset your access settings.',
    category: 'Spam',
    reportedBy: 'phish_hunter',
    author: 'SecurityDesk_Fake',
    date: '2026-10-09 03:15',
    severity: 'High',
    source: 'API',
    authorTrust: 10,
    violations: '20 Warnings / 4 Temporaries',
    flagMessage: 'Automated Flag: Phishing credential harvesting domain signature matched.'
  }
];

const INITIAL_COMMENTS = [
  {
    id: 1,
    author: 'troll_master',
    category: 'HARASSMENT',
    text: '"You are absolutely clueless about this..."'
  },
  {
    id: 2,
    author: 'crypto_guy',
    category: 'SPAM',
    text: '"Buy $GOLDEN tokens now! 🚀"'
  },
  {
    id: 3,
    author: 'angry_user9',
    category: 'HATE SPEECH',
    text: '"This community is rubbish, go away..."'
  },
  {
    id: 4,
    author: 'spambot_300',
    category: 'SPAM',
    text: '"Get cheap designer replicas at replicaStore.io"'
  }
];

const AUTOMATED_REPORTERS = ['bot_hunter', 'system_ai', 'phish_hunter'];

const USER_FILTER_OPTIONS = [
  { value: 'all', label: 'All Personnel' },
  { value: 'automated', label: 'Automated Reports' },
  { value: 'human', label: 'Human Users' },
];

const DATE_FILTER_OPTIONS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

const ACTION_FILTER_OPTIONS = [
  { value: 'all', label: 'Any Interaction' },
  { value: 'spam', label: 'Spam' },
  { value: 'hate-speech', label: 'Hate Speech' },
  { value: 'inappropriate', label: 'Inappropriate' },
  { value: 'harassment', label: 'Harassment' },
];

const toFilterKey = (value) => (value || '').toLowerCase().replace(/\s+/g, '-');

function ModerateContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Main Navigation View: 'active' | 'removed' | 'warnings' (SCRUM-750)
  const [activeTab, setActiveTab] = useState('active');

  // Persistence State
  const [reports, setReports] = useState(() => getReports(INITIAL_REPORTS));
  const [comments, setComments] = useState(() => getComments(INITIAL_COMMENTS));
  const [removedList, setRemovedList] = useState(() => getRemovedPostsList());
  const [warningsList, setWarningsList] = useState(() => getUserWarnings());

  // Modals & Notifications
  const [selectedReport, setSelectedReport] = useState(null);
  const [warningTarget, setWarningTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // Selection and filter states
  const [checkedIds, setCheckedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [openFilter, setOpenFilter] = useState(null);
  const filterBarRef = useRef(null);

  // Synchronize state on tab change or mount
  useEffect(() => {
    setRemovedList(getRemovedPostsList());
    setWarningsList(getUserWarnings());
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, userFilter, dateFilter, actionFilter, activeTab]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const titleText = report.title || '';
      const snippetText = report.snippet || '';
      const reporterText = report.reportedBy || '';
      const catText = report.category || '';

      const matchesSearch =
        titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippetText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reporterText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catText.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUser =
        userFilter === 'all' ||
        (userFilter === 'automated'
          ? AUTOMATED_REPORTERS.includes(report.reportedBy)
          : !AUTOMATED_REPORTERS.includes(report.reportedBy));

      const matchesAction =
        actionFilter === 'all' || toFilterKey(report.category) === actionFilter;

      return matchesSearch && matchesUser && matchesAction;
    });
  }, [reports, searchQuery, userFilter, actionFilter]);

  // Paginated reports
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage));

  // Checkbox functions
  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedReports.map((r) => r.id);
      setCheckedIds(pageIds);
    } else {
      setCheckedIds([]);
    }
  };

  const handleToggleSelectRow = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ── Moderation Actions (SCRUM-750) ───────────────────────────────────

  // 1. Resolve / Ignore Report
  const handleResolveSingle = (id) => {
    const updatedReports = reports.filter((r) => r.id !== id);
    setReports(updatedReports);
    saveReports(updatedReports);
    setCheckedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleIgnoreReport = (id) => {
    handleResolveSingle(id);
    setSelectedReport(null);
    setToast({ type: 'info', message: `Report #${id} dismissed. Content kept.` });
    appendAuditLog({ actionType: `Report Dismissed: #${id}`, module: 'COMMUNITY_MOD' });
  };

  // 2. SCRUM-759: Remove Content
  const handleRemovePost = (reportOrId) => {
    const id = typeof reportOrId === 'object' ? reportOrId.id : reportOrId;
    const targetReport = typeof reportOrId === 'object' ? reportOrId : reports.find((r) => r.id === id);

    const targetPostId = targetReport?.targetPostId || id;
    recordRemovedPost(targetPostId, targetReport?.title || `Post #${id}`, {
      title: targetReport?.title,
      snippet: targetReport?.snippet || targetReport?.content,
      category: targetReport?.category,
      author: targetReport?.author || targetReport?.reportedBy,
      reason: targetReport?.flagMessage || 'Moderator policy enforcement'
    });

    handleResolveSingle(id);
    setSelectedReport(null);
    setRemovedList(getRemovedPostsList());
    setToast({ type: 'success', message: `Post #${id} removed and archived [SCRUM-759].` });
  };

  // 3. SCRUM-760: Restore Content
  const handleRestorePost = (postId) => {
    const restored = restoreRemovedPost(postId);
    setRemovedList(getRemovedPostsList());
    setToast({
      type: 'success',
      message: `"${restored?.title || postId}" has been restored to the community feed [SCRUM-760].`
    });
  };

  // 4. SCRUM-761: Warn User
  const handleOpenWarnModal = (report) => {
    setWarningTarget(report);
    setSelectedReport(null);
  };

  const handleDispatchWarning = ({ warningLevel, note }) => {
    if (!warningTarget) return;

    const authorName = warningTarget.author || warningTarget.reportedBy || 'Author';
    dispatchUserWarning({
      author: authorName,
      postTitle: warningTarget.title,
      postId: warningTarget.targetPostId || warningTarget.id,
      category: warningTarget.category,
      warningLevel: warningLevel,
      message: note
    });

    handleResolveSingle(warningTarget.id);
    setWarningsList(getUserWarnings());
    setWarningTarget(null);
    setToast({
      type: 'warning',
      message: `Official warning (${warningLevel}) dispatched to @${authorName} [SCRUM-761].`
    });
  };

  // 5. Ban User & Purge Content
  const handleBanUserAndPurge = (report) => {
    const author = report.reportedBy || report.author;
    const postsByAuthor = reports.filter((r) => r.reportedBy === author || r.author === author);
    postsByAuthor.forEach((p) => recordRemovedPost(p.targetPostId || p.id, p.title));
    
    const updatedReports = reports.filter((r) => r.reportedBy !== author && r.author !== author);
    const updatedComments = comments.filter((c) => c.author !== author);
    
    setReports(updatedReports);
    saveReports(updatedReports);
    setComments(updatedComments);
    saveComments(updatedComments);
    setCheckedIds((prev) => prev.filter((id) => !postsByAuthor.some((p) => p.id === id)));
    setSelectedReport(null);
    setRemovedList(getRemovedPostsList());
    
    setToast({ type: 'error', message: `User "${author}" permanently banned and content purged.` });
    appendAuditLog({ actionType: `User Banned & Purged: ${author}`, module: 'COMMUNITY_MOD', status: 'failure' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setUserFilter('all');
    setDateFilter('all');
    setActionFilter('all');
    setCurrentPage(1);
    setOpenFilter(null);
  };

  const getFilterLabel = (options, value) => options.find((option) => option.value === value)?.label;

  return (
    <div className="admin-theme admin-dashboard">
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Community mod."
      />

      <div className="admin-dashboard__main">
        <TopBar
          user={{ name: 'Arthur V. Gold', role: 'HEAD MODERATOR' }}
          notificationsCount={reports.length}
          searchPlaceholder="Search reports, authors, or violations..."
          onSearch={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="moderation-page">
          {/* Header section */}
          <div className="moderation-header">
            <div className="moderation-header__title-group">
              <h1>Community Moderation</h1>
              <p>Review flagged discussions, execute moderation actions, and maintain platform standards.</p>
            </div>
          </div>

          {/* Sub-navigation Tabs: SCRUM-750 (Queue, Restore Archive, User Warnings) */}
          <div className="mod-subnav-pills" role="tablist">
            <button
              type="button"
              className={`mod-pill-btn ${activeTab === 'active' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              <AlertTriangle size={15} />
              <span>Active Reports Queue</span>
              <span className="mod-pill-badge">{reports.length}</span>
            </button>

            <button
              type="button"
              className={`mod-pill-btn ${activeTab === 'removed' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('removed')}
            >
              <RotateCcw size={15} />
              <span>Removed Content [Restore Archive]</span>
              <span className="mod-pill-badge">{removedList.length}</span>
            </button>

            <button
              type="button"
              className={`mod-pill-btn ${activeTab === 'warnings' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('warnings')}
            >
              <ShieldAlert size={15} />
              <span>Dispatched Warnings</span>
              <span className="mod-pill-badge">{warningsList.length}</span>
            </button>
          </div>

          {/* KPI Stat Cards */}
          <section className="txn-kpis moderation-stats" aria-label="Moderation Metrics" style={{ marginBottom: '24px' }}>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">PENDING REPORTS</span>
                <div className="txn-kpi-icon"><Clock size={16} /></div>
              </div>
              <div className="txn-kpi-val">{reports.length}</div>
              <div className="txn-kpi-sub positive">⚡ Live Synced with Community</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">REMOVED ITEMS (SCRUM-759)</span>
                <div className="txn-kpi-icon"><Trash2 size={16} /></div>
              </div>
              <div className="txn-kpi-val">{removedList.length}</div>
              <div className="txn-kpi-sub">Restore available</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">DISPATCHED WARNINGS (SCRUM-761)</span>
                <div className="txn-kpi-icon"><ShieldAlert size={16} /></div>
              </div>
              <div className="txn-kpi-val">{warningsList.length}</div>
              <div className="txn-kpi-sub positive">Enforced & Logged</div>
            </div>
          </section>

          {/* Tab 1: Active Reports Queue */}
          {activeTab === 'active' && (
            <div className="moderation-grid">
              <section className="reports-section">
                <div className="reports-table-wrapper">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th className="td-checkbox">
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            onChange={handleToggleSelectAll}
                            checked={
                              paginatedReports.length > 0 &&
                              paginatedReports.every((r) => checkedIds.includes(r.id))
                            }
                          />
                        </th>
                        <th>Post Title</th>
                        <th>Category</th>
                        <th>Reported By</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReports.length > 0 ? (
                        paginatedReports.map((report) => (
                          <tr 
                            key={report.id} 
                            className={checkedIds.includes(report.id) ? 'selected' : ''}
                          >
                            <td className="td-checkbox">
                              <input
                                type="checkbox"
                                className="custom-checkbox"
                                checked={checkedIds.includes(report.id)}
                                onChange={() => handleToggleSelectRow(report.id)}
                              />
                            </td>
                            <td className="post-title-cell">
                              <span className="post-title-text">{report.title}</span>
                              <span className="post-snippet-text">{report.snippet}</span>
                            </td>
                            <td>
                              <span className={`category-badge ${toFilterKey(report.category)}`}>
                                {report.category}
                              </span>
                            </td>
                            <td className={`reporter-cell ${AUTOMATED_REPORTERS.includes(report.reportedBy) ? 'bot-flag' : ''}`}>
                              {report.reportedBy}
                            </td>
                            <td className="date-cell">{report.date}</td>
                            <td className="actions-cell">
                              <button
                                className="action-icon-btn view"
                                title="Review Details (SCRUM-749)"
                                onClick={() => setSelectedReport(report)}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="action-icon-btn warn-btn"
                                title="Warn Author (SCRUM-761)"
                                onClick={() => handleOpenWarnModal(report)}
                              >
                                <ShieldAlert size={16} />
                              </button>
                              <button
                                className="action-icon-btn approve"
                                title="Dismiss / Keep"
                                onClick={() => handleResolveSingle(report.id)}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                className="action-icon-btn reject"
                                title="Remove Post (SCRUM-759)"
                                onClick={() => handleRemovePost(report)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="table-empty-state">
                            <ShieldCheck size={36} color="#4EBE88" />
                            <p>All clean! No reported content pending moderator review.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredReports.length > 0 && (
                  <div className="table-footer">
                    <span className="table-footer__info">
                      Showing {Math.min(filteredReports.length, (currentPage - 1) * itemsPerPage + 1)}-
                      {Math.min(filteredReports.length, currentPage * itemsPerPage)} of {filteredReports.length} reports
                    </span>
                    <div className="pagination-group">
                      <button
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        className="pagination-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Right side Filters & Comments widget */}
              <aside className="widgets-section">
                <div className="widget-card" ref={filterBarRef}>
                  <h3 className="widget-title">
                    <SlidersHorizontal size={14} />
                    Queue Filters
                  </h3>

                  <div className="queue-filters">
                    <div className="queue-filter-group">
                      <span className="queue-filter-label">Reporter Type</span>
                      <div className="queue-select-wrapper">
                        <button
                          type="button"
                          className="queue-select queue-select-btn"
                          onClick={() => setOpenFilter((current) => (current === 'user' ? null : 'user'))}
                        >
                          <span className="queue-select-btn__left">
                            <User size={14} className="queue-select-icon" />
                            <span>{getFilterLabel(USER_FILTER_OPTIONS, userFilter)}</span>
                          </span>
                          <span className={`queue-select-chevron ${openFilter === 'user' ? 'open' : ''}`}>▾</span>
                        </button>
                        {openFilter === 'user' && (
                          <div className="queue-select-menu">
                            {USER_FILTER_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                className={`queue-select-option ${userFilter === option.value ? 'active' : ''}`}
                                onClick={() => {
                                  setUserFilter(option.value);
                                  setOpenFilter(null);
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="queue-filter-group">
                      <span className="queue-filter-label">Violation Category</span>
                      <div className="queue-select-wrapper">
                        <button
                          type="button"
                          className="queue-select queue-select-btn"
                          onClick={() => setOpenFilter((current) => (current === 'action' ? null : 'action'))}
                        >
                          <span className="queue-select-btn__left">
                            <Zap size={14} className="queue-select-icon" />
                            <span>{getFilterLabel(ACTION_FILTER_OPTIONS, actionFilter)}</span>
                          </span>
                          <span className={`queue-select-chevron ${openFilter === 'action' ? 'open' : ''}`}>▾</span>
                        </button>
                        {openFilter === 'action' && (
                          <div className="queue-select-menu">
                            {ACTION_FILTER_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                className={`queue-select-option ${actionFilter === option.value ? 'active' : ''}`}
                                onClick={() => {
                                  setActionFilter(option.value);
                                  setOpenFilter(null);
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="btn-reset-filters" onClick={handleResetFilters}>
                    Reset Filters
                  </button>
                </div>

                <div className="widget-card">
                  <h3 className="widget-title">
                    <MessageSquare size={14} />
                    Flagged Comments Feed
                  </h3>
                  <div className="comments-feed">
                    {comments.map((comment) => (
                      <div className="comment-card" key={comment.id}>
                        <div className="comment-card__header">
                          <span className="comment-card__author">{comment.author}</span>
                          <span className={`comment-card__badge ${comment.category === 'SPAM' ? 'spam' : ''}`}>
                            {comment.category}
                          </span>
                        </div>
                        <p className="comment-card__text">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Tab 2: SCRUM-760 Restore Content Archive */}
          {activeTab === 'removed' && (
            <section className="reports-section" style={{ width: '100%' }}>
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Removed Content Title</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Removed Date</th>
                      <th>Moderator Policy Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {removedList.length > 0 ? (
                      removedList.map((item) => (
                        <tr key={item.id}>
                          <td className="post-title-cell">
                            <span className="post-title-text" style={{ textDecoration: 'line-through', color: '#9599A6' }}>
                              {item.title}
                            </span>
                            <span className="post-snippet-text">{item.snippet}</span>
                          </td>
                          <td>
                            <span className="category-badge spam">{item.category}</span>
                          </td>
                          <td className="reporter-cell">{item.author}</td>
                          <td className="date-cell">{item.removedAt}</td>
                          <td style={{ fontSize: '0.8rem', color: '#D1D5DB' }}>{item.reason}</td>
                          <td>
                            <button
                              type="button"
                              className="action-icon-btn restore-btn"
                              title="Restore Content to Public Feed (SCRUM-760)"
                              onClick={() => handleRestorePost(item.id)}
                            >
                              <RotateCcw size={14} />
                              <span>Restore Post</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="table-empty-state">
                          <Check size={32} color="#4EBE88" />
                          <p>No posts are currently archived or removed. When you remove a post, it will appear here with one-click restore options.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Tab 3: SCRUM-761 Dispatched User Warnings */}
          {activeTab === 'warnings' && (
            <section className="reports-section" style={{ width: '100%' }}>
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Target Author</th>
                      <th>Warning Level (Strike)</th>
                      <th>Target Post Title</th>
                      <th>Category</th>
                      <th>Notice Message</th>
                      <th>Issued Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warningsList.length > 0 ? (
                      warningsList.map((warn) => (
                        <tr key={warn.id}>
                          <td className="reporter-cell" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                            @{warn.author}
                          </td>
                          <td>
                            <span className={`warn-level-badge ${warn.warningLevel.includes('1') ? 'level-1' : warn.warningLevel.includes('2') ? 'level-2' : 'level-3'}`}>
                              {warn.warningLevel}
                            </span>
                          </td>
                          <td className="post-title-text">{warn.postTitle}</td>
                          <td><span className="category-badge inappropriate">{warn.category}</span></td>
                          <td style={{ fontSize: '0.8rem', color: '#E2E4E9' }}>{warn.message}</td>
                          <td className="date-cell">{warn.date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="table-empty-state">
                          <ShieldCheck size={32} color="#4EBE88" />
                          <p>No user warnings dispatched yet. Use "Warn Author" on any reported post to issue strikes.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Review Modal details overlay (SCRUM-749 & SCRUM-750) */}
      {selectedReport && (
        <div className="modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal__header">
              <div className="review-modal__title-group">
                <span className="review-modal__alert-icon">
                  <AlertTriangle size={20} />
                </span>
                <h2>Review Reported Post #{selectedReport.id}</h2>
              </div>
              <button 
                className="btn-close-modal" 
                onClick={() => setSelectedReport(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="review-modal__body">
              <div className="review-modal__meta">
                Reported by <span className="meta-author">{selectedReport.reportedBy}</span> for
                <span className="meta-reason-badge">{selectedReport.category}</span>
              </div>

              <div className="reported-post-box">
                <h4 className="reported-post-box__title">{selectedReport.title}</h4>
                <p className="reported-post-box__content">{selectedReport.content}</p>
                {selectedReport.flagMessage && (
                  <div className="automated-flag-alert">
                    <p className="automated-flag-alert__text">{selectedReport.flagMessage}</p>
                  </div>
                )}
              </div>

              <div className="trust-score-section">
                <div className="trust-score-widget">
                  <span className="trust-score-label">Author Trust Score</span>
                  <div className="trust-score-bar-wrapper">
                    <div 
                      className="trust-score-bar-fill" 
                      style={{ 
                        width: `${selectedReport.authorTrust || 60}%`,
                        backgroundColor: (selectedReport.authorTrust || 60) < 30 ? '#FF5A65' : (selectedReport.authorTrust || 60) < 70 ? 'var(--accent)' : 'var(--accent-success)'
                      }} 
                    />
                  </div>
                  <span 
                    className="trust-score-caption"
                    style={{
                      color: (selectedReport.authorTrust || 60) < 30 ? '#FF5A65' : (selectedReport.authorTrust || 60) < 70 ? 'var(--accent)' : 'var(--accent-success)'
                    }}
                  >
                    {(selectedReport.authorTrust || 60) < 30 ? 'Critical Risk' : (selectedReport.authorTrust || 60) < 70 ? 'Moderate' : 'Good'} ({selectedReport.authorTrust || 60}/100)
                  </span>
                </div>

                <div className="violations-widget">
                  <span className="violations-label">Historical Violations</span>
                  <span className="violations-value">{selectedReport.violations || '1 Active Report'}</span>
                </div>
              </div>
            </div>

            <div className="review-modal__footer">
              <button 
                className="btn-modal-ignore" 
                onClick={() => handleIgnoreReport(selectedReport.id)}
              >
                Dismiss Report
              </button>
              <button 
                className="btn-modal-keep-warn" 
                onClick={() => handleOpenWarnModal(selectedReport)}
              >
                Keep & Warn Author (SCRUM-761)
              </button>
              <button 
                className="btn-modal-remove" 
                onClick={() => handleRemovePost(selectedReport)}
              >
                Remove Content (SCRUM-759)
              </button>
              <button 
                className="btn-modal-ban" 
                onClick={() => handleBanUserAndPurge(selectedReport)}
              >
                Ban User & Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warn User Modal (SCRUM-761) */}
      {warningTarget && (
        <WarnUserModal
          target={warningTarget}
          onClose={() => setWarningTarget(null)}
          onDispatch={handleDispatchWarning}
        />
      )}
    </div>
  );
}

/**
 * WarnUserModal — SCRUM-761 Dispatches official strikes and policy notices to authors
 */
function WarnUserModal({ target, onClose, onDispatch }) {
  const [warningLevel, setWarningLevel] = useState('Level 1: General Policy Notice');
  const [note, setNote] = useState('');

  const levels = [
    { value: 'Level 1: General Policy Notice', label: 'Level 1: First Warning Notice', desc: 'Mild reminder of IntelliHire guidelines. Content kept.' },
    { value: 'Level 2: Strict Policy Violation Strike', label: 'Level 2: Formal Policy Violation Strike', desc: 'Author receives an official strike on their profile record.' },
    { value: 'Level 3: Final Strike Before Suspension', label: 'Level 3: Final Suspension Warning', desc: 'Final notice before account restriction or permanent ban.' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onDispatch({
      warningLevel,
      note: note.trim() || `Official notice for ${target.category} violations.`
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="warn-modal" onClick={(e) => e.stopPropagation()}>
        <div className="warn-modal__header">
          <div className="warn-modal__title-box">
            <div className="warn-modal__alert-icon">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3>Dispatch Formal User Warning</h3>
              <p>Issue an official policy violation strike to the content creator [SCRUM-761].</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="warn-modal__body">
          <div className="warn-user-card">
            <div>
              <strong>Target Author: @{target.author || target.reportedBy}</strong>
              <small>Post: "{target.title}"</small>
            </div>
            <span className="category-badge inappropriate">{target.category}</span>
          </div>

          <div className="report-form-group">
            <label className="report-form-label">Warning Severity Level</label>
            <div className="warn-level-list">
              {levels.map((lvl) => (
                <label key={lvl.value} className={`warn-level-card ${warningLevel === lvl.value ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="warnLevel"
                    value={lvl.value}
                    checked={warningLevel === lvl.value}
                    onChange={() => setWarningLevel(lvl.value)}
                  />
                  <div className="warn-level-details">
                    <strong>{lvl.label}</strong>
                    <small>{lvl.desc}</small>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="report-form-group">
            <label className="report-form-label">Moderator Message / Instruction to User</label>
            <textarea
              className="report-textarea"
              rows="3"
              placeholder="e.g. Please refrain from posting commercial affiliate links or abusive content..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="warn-modal__footer">
            <button type="button" className="button secondary compact" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button primary compact" style={{ background: '#F0B90B', color: '#0D0E13' }}>
              Dispatch Warning to User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModerateContent;
