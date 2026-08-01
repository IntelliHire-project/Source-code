import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Check,
  Eye,
  Trash2,
  X,
  SlidersHorizontal,
  MessageSquare,
  Search,
  Filter,
  CheckSquare,
  FileDown
} from 'lucide-react';
import AdminSidebar from '../../../components/common/AdminSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import './ModerateCommunity.css';

// Initial Mock Reports matching mockup layout & fields
const INITIAL_REPORTS = [
  {
    id: 88291,
    title: 'Why the current political climate is failing...',
    snippet: 'The system is completely rigged. Anyone who supports the [Redacted Sector] is fundamentally against...',
    content: "The system is completely rigged. Anyone who supports the [Redacted Sector] is fundamentally against humanity and should be dealt with accordingly. We don't need logic, we need action against these monsters who believe they can rule us with their outdated ideologies...",
    category: 'Hate Speech',
    reportedBy: 'bot_hunter',
    date: '2023-10-24 06:50',
    severity: 'High',
    source: 'Web',
    authorTrust: 15,
    violations: '12 Warnings / 2 Temporaries',
    flagMessage: 'Automated Flag: Potential incitement of violence detected in Paragraph 2.'
  },
  {
    id: 88290,
    title: 'Free iPhone giveaway - Click link to claim now',
    snippet: 'Hey everyone! I just got a free iPhone 15 by clicking this link, it actually works! Try it...',
    content: 'Hey everyone! I just got a free iPhone 15 by clicking this link, it actually works! Try it out before it gets taken down. No credit card required, just enter your email address and verify. http://freeiphones.spam.net',
    category: 'Spam',
    reportedBy: 'system_ai',
    date: '2023-10-24 06:50',
    severity: 'Medium',
    source: 'Mobile App',
    authorTrust: 45,
    violations: '2 Warnings / 0 Temporaries',
    flagMessage: 'Automated Flag: Known spam link pattern detected.'
  },
  {
    id: 88289,
    title: 'Is it just me or is the site laggy',
    snippet: 'Every time I try to upload my portfolio or search for candidates, the loader spins for...',
    content: 'Every time I try to upload my portfolio or search for candidates, the loader spins for ages and then crashes. Anyone else having this issue today? It makes it impossible to complete recruiter assessments.',
    category: 'Inappropriate',
    reportedBy: 'sara_smith',
    date: '2023-10-24 06:10',
    severity: 'Low',
    source: 'API',
    authorTrust: 95,
    violations: '0 Warnings / 0 Temporaries'
  },
  {
    id: 88288,
    title: 'Earn $5000/week from home working 1 hour a day!',
    snippet: 'Simple tasks, no experience required. We train you. Just need an internet connection...',
    content: 'Simple tasks, no experience required. We train you. Just need an internet connection. Start earning immediately. Click here to sign up: http://getrichquick.spam',
    category: 'Spam',
    reportedBy: 'system_ai',
    date: '2023-10-24 05:40',
    severity: 'Medium',
    source: 'Web',
    authorTrust: 30,
    violations: '5 Warnings / 1 Temporary',
    flagMessage: 'Automated Flag: High volume posting pattern.'
  },
  {
    id: 88287,
    title: 'Unprofessional recruiter experience at Apex Corp',
    snippet: 'The recruiter showed up 20 minutes late to my interview and started eating during...',
    content: "The recruiter showed up 20 minutes late to my interview and started eating during the call. Absolutely unprofessional behavior. I asked them questions and they didn't even respond. Has anyone had similar experiences?",
    category: 'Inappropriate',
    reportedBy: 'candidate_anon',
    date: '2023-10-24 04:30',
    severity: 'Low',
    source: 'Web',
    authorTrust: 80,
    violations: '1 Warning / 0 Temporaries'
  },
  {
    id: 88286,
    title: 'Your account has been compromised, reset immediately',
    snippet: 'Security Alert: We detected suspicious login attempts on your account. Please log in...',
    content: 'Security Alert: We detected suspicious login attempts on your account. Please log in immediately at http://login-verify-account-portal.com to secure your data and reset your access settings.',
    category: 'Spam',
    reportedBy: 'phish_hunter',
    date: '2023-10-24 03:15',
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

function ModerateContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Selection and filter states
  const [checkedIds, setCheckedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState(null); // 'High', 'Medium', 'Low'
  const [sourceFilter, setSourceFilter] = useState(null); // 'Web', 'Mobile App', 'API'
  
  // Stats counters (simulating larger numbers)
  const [totalReported, setTotalReported] = useState(1248);
  const [pendingCount, setPendingCount] = useState(294);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSeverity = !severityFilter || report.severity === severityFilter;
      const matchesSource = !sourceFilter || report.source === sourceFilter;

      return matchesSearch && matchesSeverity && matchesSource;
    });
  }, [reports, searchQuery, severityFilter, sourceFilter]);

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

  // Row operations
  const handleResolveSingle = (id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setCheckedIds((prev) => prev.filter((itemId) => itemId !== id));
    setPendingCount((prev) => Math.max(0, prev - 1));
    setTotalReported((prev) => Math.max(0, prev - 1));
  };

  const handleDeleteSingle = (id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setCheckedIds((prev) => prev.filter((itemId) => itemId !== id));
    setPendingCount((prev) => Math.max(0, prev - 1));
  };

  const handleResolveSelected = () => {
    const count = checkedIds.length;
    setReports((prev) => prev.filter((r) => !checkedIds.includes(r.id)));
    setPendingCount((prev) => Math.max(0, prev - count));
    setTotalReported((prev) => Math.max(0, prev - count));
    setCheckedIds([]);
  };

  // Modal actions
  const handleIgnoreReport = (id) => {
    handleResolveSingle(id);
    setSelectedReport(null);
  };

  const handleKeepAndWarn = (id) => {
    handleResolveSingle(id);
    setSelectedReport(null);
    alert(`A warnings notification has been dispatched to the author of post #${id}.`);
  };

  const handleRemovePost = (id) => {
    handleDeleteSingle(id);
    setSelectedReport(null);
  };

  const handleBanUserAndPurge = (report) => {
    const author = report.reportedBy;
    const postsByAuthor = reports.filter((r) => r.reportedBy === author);
    const count = postsByAuthor.length;

    setReports((prev) => prev.filter((r) => r.reportedBy !== author));
    setComments((prev) => prev.filter((c) => c.author !== author));
    setPendingCount((prev) => Math.max(0, prev - count));
    setCheckedIds((prev) => prev.filter((id) => !postsByAuthor.some((p) => p.id === id)));
    setSelectedReport(null);

    alert(`User ${author} has been permanently banned and all their contributions purged.`);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Report ID,Title,Category,Reported By,Date,Severity,Source"].join(",") + "\n"
      + reports.map(r => `${r.id},"${r.title}",${r.category},${r.reportedBy},${r.date},${r.severity},${r.source}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `intellihire_moderation_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSeverityFilter(null);
    setSourceFilter(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Community mod."
      />

      <div className="admin-dashboard__main">
        <TopBar
          user={{ name: 'Arthur V. Gold', role: 'HEAD MODERATOR' }}
          notificationsCount={5}
          searchPlaceholder="Search reports, users, or post IDs..."
          onSearch={(q) => setSearchQuery(q)}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="moderation-page">
          {/* Header section */}
          <div className="moderation-header">
            <div className="moderation-header__title-group">
              <h1>Community Moderation</h1>
              <p>Manage and resolve reported content across the ecosystem.</p>
            </div>
            <div className="moderation-header__actions">
              <button className="btn-export" onClick={handleExportCSV}>
                <FileDown size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Export CSV
              </button>
              <button 
                className="btn-resolve-all" 
                onClick={handleResolveSelected}
                disabled={checkedIds.length === 0}
              >
                <CheckSquare size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Resolve Selected
              </button>
            </div>
          </div>

          {/* Stats Widget Row */}
          <section className="moderation-stats" aria-label="Moderation Metrics">
            <div className="stat-card">
              <span className="stat-card__label">Reported Items</span>
              <div className="stat-card__value-group">
                <span className="stat-card__value">{totalReported.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Pending Reports</span>
              <div className="stat-card__value-group">
                <span className="stat-card__value">{pendingCount}</span>
                <span className="stat-card__trend up">+22%</span>
              </div>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="moderation-grid">
            {/* Left side: reports table */}
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
                            <span className={`category-badge ${report.category.toLowerCase().replace(' ', '-')}`}>
                              {report.category}
                            </span>
                          </td>
                          <td className={`reporter-cell ${report.reportedBy === 'bot_hunter' || report.reportedBy === 'system_ai' ? 'bot-flag' : ''}`}>
                            {report.reportedBy}
                          </td>
                          <td className="date-cell">{report.date}</td>
                          <td className="actions-cell">
                            <button
                              className="action-icon-btn view"
                              title="Review Details"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="action-icon-btn approve"
                              title="Resolve / Dismiss"
                              onClick={() => handleResolveSingle(report.id)}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className="action-icon-btn reject"
                              title="Delete Post"
                              onClick={() => handleDeleteSingle(report.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="table-empty-state">
                          <AlertTriangle size={32} />
                          <p>No reports found matching the selected filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination footer */}
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

            {/* Right side: widgets */}
            <aside className="widgets-section">
              {/* Filter controls widget */}
              <div className="widget-card">
                <h3 className="widget-title">
                  <SlidersHorizontal size={14} />
                  Queue Control
                </h3>
                
                <div className="filter-group">
                  <div className="filter-group-title">Severity Level</div>
                  <div className="filter-badge-list">
                    {['High', 'Medium', 'Low'].map((sev) => (
                      <button
                        key={sev}
                        className={`filter-pill ${severityFilter === sev ? 'active' : ''}`}
                        onClick={() => setSeverityFilter(severityFilter === sev ? null : sev)}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="widget-divider" />

                <div className="filter-group">
                  <div className="filter-group-title">Content Source</div>
                  <div className="filter-badge-list">
                    {['Web', 'Mobile App', 'API'].map((src) => (
                      <button
                        key={src}
                        className={`filter-pill ${sourceFilter === src ? 'active' : ''}`}
                        onClick={() => setSourceFilter(sourceFilter === src ? null : src)}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="widget-divider" />

                <button className="btn-reset-filters" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>

              {/* Recent flagged comments widget */}
              <div className="widget-card">
                <h3 className="widget-title">
                  <MessageSquare size={14} />
                  Recent Comments
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
                        width: `${selectedReport.authorTrust}%`,
                        backgroundColor: selectedReport.authorTrust < 30 ? '#FF5A65' : selectedReport.authorTrust < 70 ? 'var(--accent)' : 'var(--accent-success)'
                      }} 
                    />
                  </div>
                  <span 
                    className="trust-score-caption"
                    style={{
                      color: selectedReport.authorTrust < 30 ? '#FF5A65' : selectedReport.authorTrust < 70 ? 'var(--accent)' : 'var(--accent-success)'
                    }}
                  >
                    {selectedReport.authorTrust < 30 ? 'Critical' : selectedReport.authorTrust < 70 ? 'Medium' : 'Good'} ({selectedReport.authorTrust}/100)
                  </span>
                </div>

                <div className="violations-widget">
                  <span className="violations-label">Historical Violations</span>
                  <span className="violations-value">{selectedReport.violations}</span>
                </div>
              </div>
            </div>

            <div className="review-modal__footer">
              <button 
                className="btn-modal-ignore" 
                onClick={() => handleIgnoreReport(selectedReport.id)}
              >
                Ignore Report
              </button>
              <button 
                className="btn-modal-keep-warn" 
                onClick={() => handleKeepAndWarn(selectedReport.id)}
              >
                Keep & Warn
              </button>
              <button 
                className="btn-modal-remove" 
                onClick={() => handleRemovePost(selectedReport.id)}
              >
                Remove Post
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
    </div>
  );
}

export default ModerateContent;
