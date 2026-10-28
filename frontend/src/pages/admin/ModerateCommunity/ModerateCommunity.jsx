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
  Download,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  FileText,
  Search,
  Filter
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
  getUserWarnings,
  getModerationLogs,
  recordModerationLog,
  generateModerationCSVReport,
  getModerationStatsSummary,
  bulkDismissReports,
  bulkRemoveReports,
  dismissCommentFlag,
  removeComment
} from '../../../services/adminStorage';
import './ModerateCommunity.css';

// Initial Mock Reports matching mockup layout & fields (2 clean default items)
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
    date: '2026-10-27 18:20',
    severity: 'High',
    source: 'Web',
    authorTrust: 15,
    violations: '12 Warnings / 2 Temporaries',
    flagMessage: 'Automated Flag: Potential incitement of violence detected in Paragraph 2.'
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
    date: '2026-10-27 15:45',
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
  }
];

const AUTOMATED_REPORTERS = ['bot_hunter', 'system_ai', 'phish_hunter'];

const USER_FILTER_OPTIONS = [
  { value: 'all', label: 'All Personnel' },
  { value: 'automated', label: 'Automated Reports' },
  { value: 'human', label: 'Human Users' },
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
  
  // Navigation View: 'active' | 'removed' | 'warnings' | 'logs'
  const [activeTab, setActiveTab] = useState('active');

  // Persistence States
  const [reports, setReports] = useState(() => getReports(INITIAL_REPORTS));
  const [comments, setComments] = useState(() => getComments(INITIAL_COMMENTS));
  const [removedList, setRemovedList] = useState(() => getRemovedPostsList());
  const [warningsList, setWarningsList] = useState(() => getUserWarnings());
  const [moderationLogs, setModerationLogs] = useState(() => getModerationLogs());

  // Modals & Notifications
  const [selectedReport, setSelectedReport] = useState(null);
  const [warningTarget, setWarningTarget] = useState(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Selection and filters (Tab 1)
  const [checkedIds, setCheckedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  
  // Tab 2: Removed Archive search & preview
  const [removedSearchQuery, setRemovedSearchQuery] = useState('');
  const [previewRemovedPost, setPreviewRemovedPost] = useState(null);

  // Tab 3: Warnings search & strike filter
  const [warningSearchQuery, setWarningSearchQuery] = useState('');
  const [warningLevelFilter, setWarningLevelFilter] = useState('all');

  // Tab 4: Logs search, action filter & pagination
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('all');
  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const logsPerPage = 5;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [openFilter, setOpenFilter] = useState(null);
  const filterBarRef = useRef(null);

  useEffect(() => {
    setReports(getReports(INITIAL_REPORTS));
    setComments(getComments(INITIAL_COMMENTS));
    setRemovedList(getRemovedPostsList());
    setWarningsList(getUserWarnings());
    setModerationLogs(getModerationLogs());
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, userFilter, actionFilter, activeTab]);

  useEffect(() => {
    setLogCurrentPage(1);
  }, [logSearchQuery, logActionFilter, activeTab]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const statsSummary = useMemo(() => getModerationStatsSummary(), [reports, removedList, warningsList, moderationLogs]);

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

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage));

  // Filtered Removed Posts (Tab 2)
  const filteredRemovedList = useMemo(() => {
    return removedList.filter((item) => {
      const q = removedSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.author || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.reason || '').toLowerCase().includes(q)
      );
    });
  }, [removedList, removedSearchQuery]);

  // Filtered Warnings (Tab 3)
  const filteredWarningsList = useMemo(() => {
    return warningsList.filter((warn) => {
      const q = warningSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (warn.author || '').toLowerCase().includes(q) ||
        (warn.postTitle || '').toLowerCase().includes(q) ||
        (warn.message || '').toLowerCase().includes(q);

      const matchesLevel =
        warningLevelFilter === 'all' ||
        (warningLevelFilter === 'level-1' && warn.warningLevel?.includes('1')) ||
        (warningLevelFilter === 'level-2' && warn.warningLevel?.includes('2')) ||
        (warningLevelFilter === 'level-3' && warn.warningLevel?.includes('3'));

      return matchesSearch && matchesLevel;
    });
  }, [warningsList, warningSearchQuery, warningLevelFilter]);

  // Filtered & Paginated Logs (Tab 4)
  const filteredLogs = useMemo(() => {
    return moderationLogs.filter((log) => {
      const q = logSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (log.targetTitle || '').toLowerCase().includes(q) ||
        (log.author || '').toLowerCase().includes(q) ||
        (log.moderator || '').toLowerCase().includes(q) ||
        (log.action || '').toLowerCase().includes(q) ||
        (log.notes || '').toLowerCase().includes(q);

      const matchesAction =
        logActionFilter === 'all' ||
        (logActionFilter === 'removed' && log.action.toLowerCase().includes('remove')) ||
        (logActionFilter === 'restored' && log.action.toLowerCase().includes('restore')) ||
        (logActionFilter === 'warned' && log.action.toLowerCase().includes('warn')) ||
        (logActionFilter === 'dismissed' && log.action.toLowerCase().includes('dismiss'));

      return matchesSearch && matchesAction;
    });
  }, [moderationLogs, logSearchQuery, logActionFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (logCurrentPage - 1) * logsPerPage;
    return filteredLogs.slice(start, start + logsPerPage);
  }, [filteredLogs, logCurrentPage]);

  const totalLogPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage));

  // Checkbox functions
  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      setCheckedIds(paginatedReports.map((r) => r.id));
    } else {
      setCheckedIds([]);
    }
  };

  const handleToggleSelectRow = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ── Moderation Actions ──────────────────────────────────────────────

  const handleResolveSingle = (id) => {
    const updatedReports = reports.filter((r) => r.id !== id);
    setReports(updatedReports);
    saveReports(updatedReports);
    setCheckedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleIgnoreReport = (id) => {
    const target = reports.find(r => r.id === id);
    recordModerationLog({
      action: 'Report Dismissed',
      targetTitle: target?.title || `Report #${id}`,
      category: target?.category || 'General',
      author: target?.author || target?.reportedBy,
      status: 'Resolved (No Violation)',
      notes: 'Moderator reviewed report and dismissed without penalty.'
    });
    handleResolveSingle(id);
    setSelectedReport(null);
    setModerationLogs(getModerationLogs());
    setToast({ type: 'info', message: `Report #${id} dismissed. Content kept.` });
  };

  // Bulk Moderation Actions
  const handleBulkDismiss = () => {
    if (checkedIds.length === 0) return;
    const count = checkedIds.length;
    checkedIds.forEach((id) => {
      const target = reports.find((r) => r.id === id);
      recordModerationLog({
        action: 'Report Dismissed',
        targetTitle: target?.title || `Report #${id}`,
        category: target?.category || 'General',
        author: target?.author || target?.reportedBy,
        status: 'Resolved (No Violation)',
        notes: 'Bulk dismissed by moderator without penalty.'
      });
    });
    const updatedReports = bulkDismissReports(checkedIds);
    setReports(updatedReports);
    setCheckedIds([]);
    setModerationLogs(getModerationLogs());
    setToast({ type: 'info', message: `${count} report(s) dismissed in bulk.` });
  };

  const handleBulkRemove = () => {
    if (checkedIds.length === 0) return;
    const count = checkedIds.length;
    checkedIds.forEach((id) => {
      const target = reports.find((r) => r.id === id);
      if (target) {
        recordModerationLog({
          action: 'Content Removed',
          targetTitle: target?.title || `Post #${id}`,
          category: target?.category || 'Violation',
          author: target?.author || target?.reportedBy,
          status: 'Removed & Archived',
          notes: 'Bulk removal policy enforcement by moderator.'
        });
      }
    });
    const updatedReports = bulkRemoveReports(checkedIds);
    setReports(updatedReports);
    setCheckedIds([]);
    setRemovedList(getRemovedPostsList());
    setModerationLogs(getModerationLogs());
    setToast({ type: 'success', message: `${count} post(s) removed and archived in bulk.` });
  };

  // Flagged Comment Moderation Handlers
  const handleDismissComment = (commentId) => {
    const target = comments.find((c) => c.id === commentId);
    const updated = dismissCommentFlag(commentId);
    setComments(updated);
    recordModerationLog({
      action: 'Comment Approved',
      targetTitle: target?.text ? (target.text.slice(0, 35) + '...') : `Comment #${commentId}`,
      category: target?.category || 'Comment',
      author: target?.author || 'Unknown',
      status: 'Approved',
      notes: 'Flag reviewed and cleared by moderator.'
    });
    setModerationLogs(getModerationLogs());
    setToast({ type: 'info', message: 'Comment flag cleared. Content approved.' });
  };

  const handleRemoveComment = (commentId) => {
    const target = comments.find((c) => c.id === commentId);
    const updated = removeComment(commentId);
    setComments(updated);
    recordModerationLog({
      action: 'Comment Removed',
      targetTitle: target?.text ? (target.text.slice(0, 35) + '...') : `Comment #${commentId}`,
      category: target?.category || 'Violation',
      author: target?.author || 'Unknown',
      status: 'Deleted',
      notes: 'Offending comment deleted by moderator.'
    });
    setModerationLogs(getModerationLogs());
    setToast({ type: 'error', message: `Offending comment by @${target?.author || 'user'} removed.` });
  };

  // Remove Content Action
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

    recordModerationLog({
      action: 'Content Removed',
      targetTitle: targetReport?.title || `Post #${id}`,
      category: targetReport?.category || 'Violation',
      author: targetReport?.author || targetReport?.reportedBy,
      status: 'Removed & Archived',
      notes: targetReport?.flagMessage || 'Moderator policy enforcement'
    });

    handleResolveSingle(id);
    setSelectedReport(null);
    setRemovedList(getRemovedPostsList());
    setModerationLogs(getModerationLogs());
    setToast({ type: 'success', message: `Post #${id} removed and archived.` });
  };

  // Restore Content Action
  const handleRestorePost = (postId) => {
    const restored = restoreRemovedPost(postId);
    recordModerationLog({
      action: 'Content Restored',
      targetTitle: restored?.title || `Post #${postId}`,
      category: restored?.category || 'Restored',
      author: restored?.author || 'Author',
      status: 'Restored to Feed',
      notes: 'Content restored to public community feed after review.'
    });

    setRemovedList(getRemovedPostsList());
    setModerationLogs(getModerationLogs());
    setToast({
      type: 'success',
      message: `"${restored?.title || postId}" has been restored to the community feed.`
    });
  };

  // Warn User Action
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

    recordModerationLog({
      action: `User Warned: ${warningLevel}`,
      targetTitle: warningTarget.title,
      category: warningTarget.category,
      author: authorName,
      status: 'Strike Issued',
      notes: note
    });

    handleResolveSingle(warningTarget.id);
    setWarningsList(getUserWarnings());
    setModerationLogs(getModerationLogs());
    setWarningTarget(null);
    setToast({
      type: 'warning',
      message: `Official warning (${warningLevel}) dispatched to @${authorName}.`
    });
  };

  // Ban User & Purge
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

    recordModerationLog({
      action: `User Banned & Purged`,
      targetTitle: `All posts by @${author}`,
      category: 'Permanent Ban',
      author: author,
      status: 'Banned',
      notes: 'Severe policy violation; account banned and content purged.'
    });

    setSelectedReport(null);
    setRemovedList(getRemovedPostsList());
    setModerationLogs(getModerationLogs());
    
    setToast({ type: 'error', message: `User "${author}" permanently banned and content purged.` });
  };

  // Export CSV Report Download
  const handleExportCSVReport = () => {
    const csvData = generateModerationCSVReport();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const nowStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `IntelliHire_Moderation_Report_${nowStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ type: 'success', message: 'Moderation report exported successfully as CSV.' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setUserFilter('all');
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
          {/* Header section with Report Generator Actions */}
          <div className="moderation-header">
            <div className="moderation-header__title-group">
              <h1>Community Moderation</h1>
              <p>Review flagged discussions, execute moderation actions, and maintain platform compliance records.</p>
            </div>
            <div className="moderation-header__actions">
              <button
                type="button"
                className="mod-header-btn secondary"
                onClick={() => setSummaryModalOpen(true)}
                title="View Analytics Summary"
              >
                <BarChart3 size={16} color="#F0B90B" />
                <span>Executive Summary</span>
              </button>
              <button
                type="button"
                className="mod-header-btn primary"
                onClick={handleExportCSVReport}
                title="Export Moderation Logs as CSV"
              >
                <Download size={16} />
                <span>Export CSV Report</span>
              </button>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
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

            <button
              type="button"
              className={`mod-pill-btn ${activeTab === 'logs' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              <FileText size={15} />
              <span>Moderation Action Logs</span>
              <span className="mod-pill-badge">{moderationLogs.length}</span>
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
              <div className="txn-kpi-sub positive">⚡ Live Queue Synced</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">REMOVED CONTENT</span>
                <div className="txn-kpi-icon"><Trash2 size={16} /></div>
              </div>
              <div className="txn-kpi-val">{removedList.length}</div>
              <div className="txn-kpi-sub">Restore enabled</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">WARNINGS ISSUED</span>
                <div className="txn-kpi-icon"><ShieldAlert size={16} /></div>
              </div>
              <div className="txn-kpi-val">{warningsList.length}</div>
              <div className="txn-kpi-sub positive">Tracked in Profile</div>
            </div>
            <div className="txn-kpi-card">
              <div className="txn-kpi-top">
                <span className="txn-kpi-label">ACTION LOGS RECORDED</span>
                <div className="txn-kpi-icon"><FileSpreadsheet size={16} /></div>
              </div>
              <div className="txn-kpi-val">{moderationLogs.length}</div>
              <div className="txn-kpi-sub positive">100% Traceable</div>
            </div>
          </section>

          {/* Tab 1: Active Reports Queue */}
          {activeTab === 'active' && (
            <div className="moderation-grid">
              <section className="reports-section">
                {checkedIds.length > 0 && (
                  <div className="bulk-actions-toolbar">
                    <div className="bulk-actions-toolbar__info">
                      <span className="bulk-count-badge">{checkedIds.length}</span>
                      <span className="bulk-count-text">
                        {checkedIds.length === 1 ? 'report' : 'reports'} selected
                      </span>
                      <button
                        type="button"
                        className="bulk-deselect-btn"
                        onClick={() => setCheckedIds([])}
                      >
                        Clear Selection
                      </button>
                    </div>
                    <div className="bulk-actions-toolbar__btns">
                      <button
                        type="button"
                        className="bulk-action-btn dismiss"
                        onClick={handleBulkDismiss}
                        title="Dismiss all selected reports without penalty"
                      >
                        <Check size={14} />
                        <span>Dismiss Selected ({checkedIds.length})</span>
                      </button>
                      <button
                        type="button"
                        className="bulk-action-btn remove"
                        onClick={handleBulkRemove}
                        title="Remove all selected posts and archive them"
                      >
                        <Trash2 size={14} />
                        <span>Remove Selected ({checkedIds.length})</span>
                      </button>
                    </div>
                  </div>
                )}
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
                        <th className="col-post-title">Post Title</th>
                        <th className="col-category">Category</th>
                        <th className="col-reporter">Reported By</th>
                        <th className="col-date">Date</th>
                        <th className="col-actions text-right">Actions</th>
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
                            <td className="actions-td">
                              <div className="actions-cell">
                                <button
                                  className="action-icon-btn view"
                                  title="Review Details"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="action-icon-btn warn-btn"
                                  title="Warn Author"
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
                                  title="Remove Post"
                                  onClick={() => handleRemovePost(report)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
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
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div className="comment-card" key={comment.id}>
                          <div className="comment-card__header">
                            <span className="comment-card__author">@{comment.author}</span>
                            <span className={`comment-card__badge ${comment.category === 'SPAM' ? 'spam' : ''}`}>
                              {comment.category}
                            </span>
                          </div>
                          <p className="comment-card__text">{comment.text}</p>
                          <div className="comment-card__actions">
                            <button
                              type="button"
                              className="comment-action-btn approve"
                              title="Approve / Dismiss Flag"
                              onClick={() => handleDismissComment(comment.id)}
                            >
                              <Check size={13} />
                              <span>Keep</span>
                            </button>
                            <button
                              type="button"
                              className="comment-action-btn delete"
                              title="Delete Offending Comment"
                              onClick={() => handleRemoveComment(comment.id)}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="comment-card-empty">
                        <ShieldCheck size={28} color="#4EBE88" />
                        <p>All clean! No flagged comments pending review.</p>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Tab 2: Restore Content Archive */}
          {activeTab === 'removed' && (
            <section className="reports-section" style={{ width: '100%' }}>
              <div className="tab-table-controls">
                <div className="tab-search-box">
                  <Search size={15} className="tab-search-icon" />
                  <input
                    type="text"
                    className="tab-search-input"
                    placeholder="Search removed posts by title, author, or reason..."
                    value={removedSearchQuery}
                    onChange={(e) => setRemovedSearchQuery(e.target.value)}
                  />
                  {removedSearchQuery && (
                    <button className="tab-search-clear" onClick={() => setRemovedSearchQuery('')} aria-label="Clear search">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="tab-count-indicator">
                  Showing <strong>{filteredRemovedList.length}</strong> archived {filteredRemovedList.length === 1 ? 'post' : 'posts'}
                </div>
              </div>

              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Removed Content Title</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Removed Date</th>
                      <th>Moderator Policy Reason</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRemovedList.length > 0 ? (
                      filteredRemovedList.map((item) => (
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
                          <td className="reporter-cell">@{item.author}</td>
                          <td className="date-cell">{item.removedAt}</td>
                          <td style={{ fontSize: '0.8rem', color: '#D1D5DB' }}>{item.reason}</td>
                          <td className="actions-td">
                            <div className="actions-cell">
                              <button
                                type="button"
                                className="action-icon-btn view"
                                title="Preview Archived Content"
                                onClick={() => setPreviewRemovedPost(item)}
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn restore-btn"
                                title="Restore Content to Public Feed"
                                onClick={() => handleRestorePost(item.id)}
                              >
                                <RotateCcw size={14} />
                                <span>Restore</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="table-empty-state">
                          <Check size={32} color="#4EBE88" />
                          <p>{removedSearchQuery ? 'No archived posts match your search query.' : 'No posts are currently archived or removed. When you remove a post, it will appear here with one-click restore options.'}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Tab 3: Dispatched User Warnings */}
          {activeTab === 'warnings' && (
            <section className="reports-section" style={{ width: '100%' }}>
              <div className="tab-table-controls">
                <div className="tab-search-box">
                  <Search size={15} className="tab-search-icon" />
                  <input
                    type="text"
                    className="tab-search-input"
                    placeholder="Search warnings by author or post title..."
                    value={warningSearchQuery}
                    onChange={(e) => setWarningSearchQuery(e.target.value)}
                  />
                  {warningSearchQuery && (
                    <button className="tab-search-clear" onClick={() => setWarningSearchQuery('')} aria-label="Clear search">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="tab-filter-pills">
                  <span className="tab-filter-label">Strike Level:</span>
                  {[
                    { key: 'all', label: 'All Strikes' },
                    { key: 'level-1', label: 'Level 1' },
                    { key: 'level-2', label: 'Level 2' },
                    { key: 'level-3', label: 'Level 3' }
                  ].map((lvl) => (
                    <button
                      key={lvl.key}
                      type="button"
                      className={`tab-filter-pill-btn ${warningLevelFilter === lvl.key ? 'active' : ''}`}
                      onClick={() => setWarningLevelFilter(lvl.key)}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

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
                    {filteredWarningsList.length > 0 ? (
                      filteredWarningsList.map((warn) => (
                        <tr key={warn.id}>
                          <td className="reporter-cell" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                            @{warn.author}
                          </td>
                          <td>
                            <span className={`warn-level-badge ${warn.warningLevel?.includes('1') ? 'level-1' : warn.warningLevel?.includes('2') ? 'level-2' : 'level-3'}`}>
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
                          <p>{warningSearchQuery || warningLevelFilter !== 'all' ? 'No warning records match the selected filters.' : 'No user warnings dispatched yet. Use "Warn Author" on any reported post to issue strikes.'}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Tab 4: Moderation Action Logs */}
          {activeTab === 'logs' && (
            <section className="reports-section" style={{ width: '100%' }}>
              <div className="tab-table-controls">
                <div className="tab-search-box">
                  <Search size={15} className="tab-search-icon" />
                  <input
                    type="text"
                    className="tab-search-input"
                    placeholder="Search logs by action, title, author, or moderator..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                  />
                  {logSearchQuery && (
                    <button className="tab-search-clear" onClick={() => setLogSearchQuery('')} aria-label="Clear search">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="tab-filter-pills">
                  <span className="tab-filter-label">Action:</span>
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'removed', label: 'Removed' },
                    { key: 'restored', label: 'Restored' },
                    { key: 'warned', label: 'Warned' },
                    { key: 'dismissed', label: 'Dismissed' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`tab-filter-pill-btn ${logActionFilter === item.key ? 'active' : ''}`}
                      onClick={() => setLogActionFilter(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>Timestamp</th>
                      <th>Moderation Action</th>
                      <th>Post Title / Target</th>
                      <th>Author</th>
                      <th>Moderator</th>
                      <th>Status / Notes</th>
                      <th className="text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.length > 0 ? (
                      paginatedLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#9599A6' }}>{log.id}</td>
                          <td className="date-cell">{log.timestamp}</td>
                          <td>
                            <span className="category-badge" style={{ background: '#1E222D', border: '1px solid #2A2C38', color: '#F0B90B' }}>
                              {log.action}
                            </span>
                          </td>
                          <td className="post-title-text" style={{ maxWidth: '240px' }}>{log.targetTitle}</td>
                          <td className="reporter-cell">@{log.author}</td>
                          <td style={{ color: '#D1D5DB', fontSize: '0.82rem' }}>{log.moderator}</td>
                          <td style={{ fontSize: '0.78rem', color: '#9599A6' }}>{log.notes}</td>
                          <td className="actions-td">
                            <button
                              type="button"
                              className="action-icon-btn view"
                              title="Inspect Log Entry"
                              onClick={() => setSelectedLogDetail(log)}
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="table-empty-state">
                          <FileText size={32} color="#4EBE88" />
                          <p>{logSearchQuery || logActionFilter !== 'all' ? 'No action logs match your filter criteria.' : 'No moderation action logs recorded yet.'}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredLogs.length > 0 && (
                <div className="table-footer">
                  <span className="table-footer__info">
                    Showing {Math.min(filteredLogs.length, (logCurrentPage - 1) * logsPerPage + 1)}-
                    {Math.min(filteredLogs.length, logCurrentPage * logsPerPage)} of {filteredLogs.length} logs
                  </span>
                  <div className="pagination-group">
                    <button
                      className="pagination-btn"
                      disabled={logCurrentPage === 1}
                      onClick={() => setLogCurrentPage((c) => Math.max(1, c - 1))}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalLogPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`pagination-btn ${logCurrentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setLogCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="pagination-btn"
                      disabled={logCurrentPage === totalLogPages}
                      onClick={() => setLogCurrentPage((c) => Math.min(totalLogPages, c + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Review Modal details overlay */}
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
                Keep & Warn Author
              </button>
              <button 
                className="btn-modal-remove" 
                onClick={() => handleRemovePost(selectedReport)}
              >
                Remove Content
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

      {/* Warn User Modal */}
      {warningTarget && (
        <WarnUserModal
          target={warningTarget}
          onClose={() => setWarningTarget(null)}
          onDispatch={handleDispatchWarning}
        />
      )}

      {/* Executive Summary Analytics Modal */}
      {summaryModalOpen && (
        <div className="modal-backdrop" onClick={() => setSummaryModalOpen(false)}>
          <div className="review-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="review-modal__header">
              <div className="review-modal__title-group">
                <span className="review-modal__alert-icon" style={{ background: 'rgba(240, 185, 11, 0.15)', color: '#F0B90B' }}>
                  <BarChart3 size={20} />
                </span>
                <h2>Executive Moderation Analytics</h2>
              </div>
              <button className="btn-close-modal" onClick={() => setSummaryModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="review-modal__body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#101118', border: '1px solid #2A2C38', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#9599A6', fontWeight: 700 }}>RESOLUTION RATE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4EBE88', marginTop: '4px' }}>{statsSummary.resolutionRate}%</div>
                </div>
                <div style={{ padding: '12px', background: '#101118', border: '1px solid #2A2C38', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#9599A6', fontWeight: 700 }}>ACTIONS LOGGED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F0B90B', marginTop: '4px' }}>{statsSummary.totalActions}</div>
                </div>
                <div style={{ padding: '12px', background: '#101118', border: '1px solid #2A2C38', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#9599A6', fontWeight: 700 }}>STRIKES ACTIVE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FF7A00', marginTop: '4px' }}>{statsSummary.totalWarnings}</div>
                </div>
              </div>

              <div style={{ marginTop: '16px', padding: '16px', background: '#101118', border: '1px solid #2A2C38', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#FFFFFF' }}>Violation Breakdown by Category</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#E2E4E9' }}>
                    <span>Spam & Commercial Promotion</span>
                    <strong>{statsSummary.categories.Spam || 2} Cases</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#E2E4E9' }}>
                    <span>Inappropriate / Vulgarity</span>
                    <strong>{statsSummary.categories.Inappropriate || 2} Cases</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#E2E4E9' }}>
                    <span>Hate Speech & Harassment</span>
                    <strong>{statsSummary.categories.HateSpeech || 1} Cases</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="review-modal__footer">
              <button type="button" className="btn-modal-ignore" onClick={() => setSummaryModalOpen(false)}>
                Close
              </button>
              <button
                type="button"
                className="btn-modal-ban"
                onClick={() => {
                  handleExportCSVReport();
                  setSummaryModalOpen(false);
                }}
              >
                <Download size={14} style={{ marginRight: '6px' }} />
                Export CSV Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Removed Content Modal */}
      {previewRemovedPost && (
        <div className="modal-backdrop" onClick={() => setPreviewRemovedPost(null)}>
          <div className="review-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="review-modal__header">
              <div className="review-modal__title-group">
                <span className="review-modal__alert-icon" style={{ color: '#F0B90B' }}>
                  <RotateCcw size={20} />
                </span>
                <h2>Archived Content Preview</h2>
              </div>
              <button className="btn-close-modal" onClick={() => setPreviewRemovedPost(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="review-modal__body">
              <div className="review-modal__meta">
                Author: <span className="meta-author">@{previewRemovedPost.author}</span> • Category:
                <span className="meta-reason-badge">{previewRemovedPost.category}</span>
              </div>

              <div className="reported-post-box">
                <h4 className="reported-post-box__title">{previewRemovedPost.title}</h4>
                <p className="reported-post-box__content">{previewRemovedPost.snippet || 'No extended snippet available.'}</p>
              </div>

              <div style={{ background: 'rgba(230, 57, 70, 0.08)', borderLeft: '3px solid #FF5A65', padding: '12px 14px', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF5A65', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Removal Policy Rationale</span>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#E2E4E9' }}>{previewRemovedPost.reason || 'Moderator policy enforcement'}</p>
                <small style={{ color: '#9599A6', marginTop: '4px', display: 'block' }}>Removed on: {previewRemovedPost.removedAt}</small>
              </div>
            </div>

            <div className="review-modal__footer" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button type="button" className="btn-modal-ignore" onClick={() => setPreviewRemovedPost(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn-modal-ban"
                style={{ background: '#4EBE88', borderColor: '#4EBE88', color: '#0D0E13' }}
                onClick={() => {
                  handleRestorePost(previewRemovedPost.id);
                  setPreviewRemovedPost(null);
                }}
              >
                <RotateCcw size={14} style={{ marginRight: '6px' }} />
                Restore to Live Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Action Log Detail Inspector Modal */}
      {selectedLogDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedLogDetail(null)}>
          <div className="review-modal" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="review-modal__header">
              <div className="review-modal__title-group">
                <span className="review-modal__alert-icon" style={{ color: '#F0B90B' }}>
                  <FileText size={20} />
                </span>
                <h2>Action Log Inspector #{selectedLogDetail.id}</h2>
              </div>
              <button className="btn-close-modal" onClick={() => setSelectedLogDetail(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="review-modal__body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#101118', border: '1px solid #2A2C38', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9599A6', fontWeight: 700, textTransform: 'uppercase' }}>ACTION TYPE</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F0B90B', marginTop: '4px' }}>{selectedLogDetail.action}</div>
                </div>
                <div style={{ padding: '12px', background: '#101118', border: '1px solid #2A2C38', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9599A6', fontWeight: 700, textTransform: 'uppercase' }}>RECORDED TIMESTAMP</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E2E4E9', marginTop: '4px' }}>{selectedLogDetail.timestamp}</div>
                </div>
              </div>

              <div style={{ padding: '14px', background: '#101118', border: '1px solid #2A2C38', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#9599A6' }}>Target Post / Target:</span>
                  <strong style={{ color: '#FFFFFF', maxWidth: '300px', textAlign: 'right' }}>{selectedLogDetail.targetTitle}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#9599A6' }}>Target Author:</span>
                  <strong style={{ color: '#F0B90B' }}>@{selectedLogDetail.author}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#9599A6' }}>Executing Moderator:</span>
                  <strong style={{ color: '#4EBE88' }}>{selectedLogDetail.moderator}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#9599A6' }}>Compliance Status:</span>
                  <strong style={{ color: '#E2E4E9' }}>{selectedLogDetail.status}</strong>
                </div>
              </div>

              <div style={{ padding: '12px 14px', background: '#1B1D26', border: '1px solid #2A2C38', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9599A6', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Audit & Moderator Notes</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#E2E4E9', lineHeight: 1.5 }}>{selectedLogDetail.notes}</p>
              </div>
            </div>

            <div className="review-modal__footer" style={{ gridTemplateColumns: '1fr' }}>
              <button type="button" className="btn-modal-ignore" onClick={() => setSelectedLogDetail(null)}>
                Dismiss Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * WarnUserModal — Dispatches official strikes and policy notices to authors
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
              <p>Issue an official policy violation strike to the content creator.</p>
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
