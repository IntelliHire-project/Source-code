/**
 * adminStorage.js
 * Central localStorage persistence layer for all IntelliHire admin panel data.
 * Each admin page reads/writes through these helpers so data survives page
 * refreshes and the Dashboard can compute live KPI stats from all stores.
 */

const KEYS = {
  USERS:              'ih_admin_users',
  RECRUITERS:         'ih_admin_recruiters',
  REPORTS:            'ih_admin_reports',
  COMMENTS:           'ih_admin_comments',
  TRANSACTIONS:       'ih_admin_transactions',
  AUDIT_LOGS:         'ih_admin_audit_logs',
  ADMIN_PROFILE:      'ih_admin_profile',
  REMOVED_POSTS:      'ih_admin_removed_posts',
  REMOVED_POSTS_DATA: 'ih_admin_removed_posts_data',
  USER_WARNINGS:      'ih_admin_user_warnings',
  MODERATION_LOGS:    'ih_admin_moderation_logs',
  COMMUNITY_POSTS:    'ih_community_posts',
};

// ── Internal helpers ───────────────────────────────────────────────────

function safeGet(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('[adminStorage] localStorage write failed for key:', key);
  }
}

// ── Users (ManageUsers page) ───────────────────────────────────────────

export function getUsers(initialData) {
  const stored = safeGet(KEYS.USERS);
  if (stored !== null) return stored;
  if (initialData) safeSet(KEYS.USERS, initialData);
  return initialData || [];
}

export function saveUsers(users) {
  safeSet(KEYS.USERS, users);
}

// ── Recruiters / Verification Queue (VerifyRecruiters page) ───────────

export function getRecruiters(initialData) {
  const stored = safeGet(KEYS.RECRUITERS);
  if (stored !== null) return stored;
  if (initialData) safeSet(KEYS.RECRUITERS, initialData);
  return initialData || [];
}

export function saveRecruiters(recruiters) {
  safeSet(KEYS.RECRUITERS, recruiters);
}

// ── Reported Content (ModerateCommunity page) ─────────────────────────

export function getReports(initialData) {
  const stored = safeGet(KEYS.REPORTS);
  if (stored !== null) return stored;
  if (initialData) safeSet(KEYS.REPORTS, initialData);
  return initialData || [];
}

export function saveReports(reports) {
  safeSet(KEYS.REPORTS, reports);
}

export function getComments(initialData) {
  const stored = safeGet(KEYS.COMMENTS);
  if (stored !== null) return stored;
  if (initialData) safeSet(KEYS.COMMENTS, initialData);
  return initialData || [];
}

export function saveComments(comments) {
  safeSet(KEYS.COMMENTS, comments);
}

export function dismissCommentFlag(commentId) {
  const comments = getComments();
  const target = comments.find(c => c.id === commentId);
  const updated = comments.filter(c => c.id !== commentId);
  saveComments(updated);
  if (target) {
    appendAuditLog({
      actionType: `Comment Approved: #${commentId}`,
      module: 'COMMUNITY_MOD',
      status: 'success'
    });
  }
  return updated;
}

export function removeComment(commentId) {
  const comments = getComments();
  const target = comments.find(c => c.id === commentId);
  const updated = comments.filter(c => c.id !== commentId);
  saveComments(updated);
  if (target) {
    appendAuditLog({
      actionType: `Comment Removed: #${commentId}`,
      module: 'COMMUNITY_MOD',
      status: 'warning'
    });
  }
  return updated;
}

export function bulkDismissReports(reportIds = []) {
  const reports = getReports();
  const updated = reports.filter(r => !reportIds.includes(r.id));
  saveReports(updated);
  appendAuditLog({
    actionType: `Bulk Reports Dismissed: ${reportIds.length} item(s)`,
    module: 'COMMUNITY_MOD',
    status: 'success'
  });
  return updated;
}

export function bulkRemoveReports(reportIds = []) {
  const reports = getReports();
  const toRemove = reports.filter(r => reportIds.includes(r.id));
  toRemove.forEach(target => {
    recordRemovedPost(target.targetPostId || target.id, target.title, {
      category: target.category,
      author: target.author || target.reportedBy,
      reason: 'Bulk removal policy enforcement'
    });
  });
  const updated = reports.filter(r => !reportIds.includes(r.id));
  saveReports(updated);
  appendAuditLog({
    actionType: `Bulk Reports Removed: ${reportIds.length} item(s)`,
    module: 'COMMUNITY_MOD',
    status: 'warning'
  });
  return updated;
}

/**
 * Submits a new community report from the frontend (Candidate or Recruiter community feed)
 * directly into the admin moderation queue (ModerateCommunity).
 */
export function submitCommunityReport({
  postId,
  title,
  snippet,
  content,
  category = 'Inappropriate',
  reportedBy = 'community_member',
  reason = '',
  severity = 'Medium',
  authorTrust = 75,
  flagMessage = ''
}) {
  const existingReports = getReports();
  const reportId = Math.floor(88000 + Math.random() * 10000);
  
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newReport = {
    id: reportId,
    targetPostId: postId || reportId,
    title: title || 'Reported Discussion Item',
    snippet: snippet || (content ? content.slice(0, 95) + '...' : 'Content reported by user'),
    content: content || snippet || 'No extended content provided.',
    category: category,
    reportedBy: reportedBy,
    date: dateStr,
    severity: severity,
    source: 'Web Community',
    authorTrust: authorTrust,
    violations: '1 Flagged / Under Review',
    flagMessage: flagMessage || (reason ? `User Report Note: ${reason}` : `Reported for ${category} by ${reportedBy}`)
  };

  const updatedReports = [newReport, ...existingReports];
  saveReports(updatedReports);

  appendAuditLog({
    actionType: `Report Submitted: #${reportId}`,
    module: 'COMMUNITY_MOD',
    status: 'pending',
    user: {
      name: reportedBy,
      email: `${reportedBy.toLowerCase().replace(/\s+/g, '.')}@intellihire.com`,
      color: '#F0B90B'
    }
  });

  return newReport;
}

// ── Removed Posts / Moderation Enforcement ────────────────────────────

export function getRemovedPostIds() {
  return safeGet(KEYS.REMOVED_POSTS) || [];
}

export function getRemovedPostsList() {
  return safeGet(KEYS.REMOVED_POSTS_DATA) || [];
}

export function recordRemovedPost(postId, postTitle = '', postData = {}) {
  const removed = getRemovedPostIds();
  const stringId = String(postId);
  if (!removed.includes(stringId)) {
    const updated = [...removed, stringId];
    safeSet(KEYS.REMOVED_POSTS, updated);
  }

  const removedList = getRemovedPostsList();
  if (!removedList.some(p => String(p.id) === stringId)) {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEntry = {
      id: stringId,
      title: postTitle || postData.title || `Post #${stringId}`,
      snippet: postData.snippet || postData.content || '',
      category: postData.category || 'Policy Violation',
      author: postData.author || postData.reportedBy || 'Unknown Author',
      removedAt: dateStr,
      removedBy: 'Head Moderator (Arthur V. Gold)',
      reason: postData.reason || postData.flagMessage || 'Moderator Policy Enforcement'
    };
    safeSet(KEYS.REMOVED_POSTS_DATA, [newEntry, ...removedList]);
  }

  appendAuditLog({
    actionType: `Content Removed: ${postTitle ? `"${postTitle.slice(0, 30)}..."` : stringId}`,
    module: 'COMMUNITY_MOD',
    status: 'success'
  });
}

export function restoreRemovedPost(postId) {
  const stringId = String(postId);
  const removed = getRemovedPostIds();
  const updatedIds = removed.filter(id => id !== stringId);
  safeSet(KEYS.REMOVED_POSTS, updatedIds);

  const removedList = getRemovedPostsList();
  const target = removedList.find(p => String(p.id) === stringId);
  const updatedList = removedList.filter(p => String(p.id) !== stringId);
  safeSet(KEYS.REMOVED_POSTS_DATA, updatedList);

  appendAuditLog({
    actionType: `Content Restored: ${target?.title ? `"${target.title.slice(0, 30)}..."` : stringId}`,
    module: 'COMMUNITY_MOD',
    status: 'success'
  });

  return target;
}

export function isPostRemoved(postId) {
  if (!postId) return false;
  const removed = getRemovedPostIds();
  return removed.includes(String(postId));
}

// ── User Warnings Management ──────────────────────────────────────────

export function getUserWarnings(author = '') {
  const allWarnings = safeGet(KEYS.USER_WARNINGS) || [];
  if (!author) return allWarnings;
  return allWarnings.filter(w => w.author?.toLowerCase() === author.toLowerCase());
}

export function dispatchUserWarning({
  author = 'Author',
  postTitle = '',
  category = 'Policy Violation',
  warningLevel = 'Level 1: General Policy Notice',
  message = '',
  postId = null
}) {
  const existing = safeGet(KEYS.USER_WARNINGS) || [];
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newWarning = {
    id: `warn-${Date.now()}`,
    author,
    postTitle,
    postId,
    category,
    warningLevel,
    message: message || `Violation of ${category} guidelines in post "${postTitle}".`,
    date: dateStr,
    issuedBy: 'Admin Moderator (Arthur V. Gold)'
  };

  safeSet(KEYS.USER_WARNINGS, [newWarning, ...existing]);

  appendAuditLog({
    actionType: `User Warned: @${author} (${warningLevel})`,
    module: 'COMMUNITY_MOD',
    status: 'warning',
    user: {
      name: author,
      email: `${author.toLowerCase().replace(/\s+/g, '.')}@intellihire.com`,
      color: '#F0B90B'
    }
  });

  return newWarning;
}

// ── Moderation Logs & Report Generation ───────────────────────────────

export function getModerationLogs() {
  const stored = safeGet(KEYS.MODERATION_LOGS);
  if (stored !== null) return stored;

  const initialLogs = [
    {
      id: 'mlog-101',
      timestamp: '2026-10-09 11:30:00',
      action: 'Content Removed',
      targetTitle: 'Free iPhone giveaway - Click link to claim now',
      category: 'Spam',
      author: 'crypto_giveaways',
      moderator: 'Arthur V. Gold',
      status: 'Action Taken',
      notes: 'Automated spam domain signature matched and verified by moderator.'
    },
    {
      id: 'mlog-102',
      timestamp: '2026-10-09 10:15:00',
      action: 'User Warned',
      targetTitle: 'Is it just me or is the site laggy',
      category: 'Inappropriate',
      author: 'DevUser99',
      moderator: 'Arthur V. Gold',
      status: 'Warning Issued',
      notes: 'Level 1 Policy Notice issued for off-topic complaint channel misuse.'
    },
    {
      id: 'mlog-103',
      timestamp: '2026-10-09 09:40:00',
      action: 'Report Dismissed',
      targetTitle: 'How I negotiated a 30% increase in my base salary',
      category: 'Career Growth',
      author: 'Sarah Jenkins',
      moderator: 'Arthur V. Gold',
      status: 'Resolved (No Violation)',
      notes: 'Report reviewed; content complies fully with community standards.'
    }
  ];

  safeSet(KEYS.MODERATION_LOGS, initialLogs);
  return initialLogs;
}

export function recordModerationLog({
  action = 'Moderation Action',
  targetTitle = 'Post',
  category = 'General',
  author = 'User',
  moderator = 'Arthur V. Gold',
  status = 'Completed',
  notes = ''
}) {
  const existing = getModerationLogs();
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newLog = {
    id: `mlog-${Date.now().toString().slice(-6)}`,
    timestamp: dateStr,
    action,
    targetTitle,
    category,
    author,
    moderator,
    status,
    notes: notes || `Moderator performed ${action} on "${targetTitle}".`
  };

  const updated = [newLog, ...existing].slice(0, 300);
  safeSet(KEYS.MODERATION_LOGS, updated);
  return newLog;
}

/**
 * Generates a structured CSV report.
 */
export function generateModerationCSVReport() {
  const logs = getModerationLogs();
  const headers = ['Log ID', 'Timestamp', 'Moderation Action', 'Post Title', 'Category', 'Target Author', 'Moderator', 'Status', 'Notes'];
  
  const rows = logs.map(log => [
    `"${log.id}"`,
    `"${log.timestamp}"`,
    `"${log.action}"`,
    `"${(log.targetTitle || '').replace(/"/g, '""')}"`,
    `"${log.category}"`,
    `"${log.author}"`,
    `"${log.moderator}"`,
    `"${log.status}"`,
    `"${(log.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return csvContent;
}

/**
 * Computes live moderation analytics summary for executive view.
 */
export function getModerationStatsSummary() {
  const logs = getModerationLogs();
  const reports = getReports();
  const removed = getRemovedPostsList();
  const warnings = getUserWarnings();

  const totalActions = logs.length;
  const totalRemoved = removed.length;
  const totalRestored = logs.filter(l => l.action.toLowerCase().includes('restore')).length;
  const totalWarnings = warnings.length;
  const totalPending = reports.length;

  return {
    totalActions,
    totalRemoved,
    totalRestored,
    totalWarnings,
    totalPending,
    resolutionRate: totalActions > 0 ? Math.round(((totalActions - totalPending) / Math.max(1, totalActions)) * 100) : 98,
    categories: {
      Spam: logs.filter(l => (l.category || '').toLowerCase() === 'spam').length,
      Harassment: logs.filter(l => (l.category || '').toLowerCase().includes('harass')).length,
      HateSpeech: logs.filter(l => (l.category || '').toLowerCase().includes('hate')).length,
      Inappropriate: logs.filter(l => (l.category || '').toLowerCase().includes('inappropriate')).length
    }
  };
}

// ── Dynamic Community Discussions Persistence ─────────────────────────

export function getCommunityPosts(initialPosts = []) {
  const stored = safeGet(KEYS.COMMUNITY_POSTS);
  if (stored !== null) return stored;
  if (initialPosts && initialPosts.length > 0) {
    safeSet(KEYS.COMMUNITY_POSTS, initialPosts);
    return initialPosts;
  }
  return [];
}

export function saveCommunityPosts(posts) {
  safeSet(KEYS.COMMUNITY_POSTS, posts);
}

export function createCommunityPost(post) {
  const existing = getCommunityPosts();
  const newPost = {
    id: post.id || `post-${Date.now()}`,
    initials: post.initials || 'ME',
    author: post.author || 'Current User',
    role: post.role || 'Member',
    time: 'Just now',
    category: post.category || 'General',
    title: post.title,
    excerpt: post.excerpt || (post.body ? post.body.slice(0, 140) + '...' : ''),
    body: post.body || post.excerpt || '',
    likes: 0,
    comments: 0,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    ...post
  };
  const updated = [newPost, ...existing];
  saveCommunityPosts(updated);
  return newPost;
}

// ── Transactions (Payments page) ──────────────────────────────────────

export function getTransactions(initialData) {
  const stored = safeGet(KEYS.TRANSACTIONS);
  if (stored !== null) return stored;
  if (initialData) safeSet(KEYS.TRANSACTIONS, initialData);
  return initialData || [];
}

export function saveTransactions(transactions) {
  safeSet(KEYS.TRANSACTIONS, transactions);
}

// ── Audit Logs (ViewAuditLogs page + auto-populated by other pages) ───

export function getAuditLogs(initialData) {
  const stored = safeGet(KEYS.AUDIT_LOGS);
  if (stored !== null) return stored;
  if (initialData) safeSet(KEYS.AUDIT_LOGS, initialData);
  return initialData || [];
}

export function appendAuditLog({ actionType, module, status = 'success', user } = {}) {
  const existing = safeGet(KEYS.AUDIT_LOGS) || [];
  const newEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    user: user || { name: 'Admin User', email: 'admin@intellihire.com', color: '#F0B90B' },
    actionType,
    module,
    ip: '192.168.1.1',
    status,
  };
  const updated = [newEntry, ...existing].slice(0, 500);
  safeSet(KEYS.AUDIT_LOGS, updated);
  return newEntry;
}

export function saveAuditLogs(logs) {
  safeSet(KEYS.AUDIT_LOGS, logs);
}

// ── Dashboard Stats (computed from all stores) ─────────────────────────

export function getDashboardStats() {
  const users        = safeGet(KEYS.USERS);
  const recruiters   = safeGet(KEYS.RECRUITERS);
  const reports      = safeGet(KEYS.REPORTS);
  const transactions = safeGet(KEYS.TRANSACTIONS);

  if (!users && !recruiters && !reports) {
    return {
      totalActiveUsers:  12845,
      activeVacancies:   3492,
      platformRevenue:   142390,
      revenueFormatted:  '$142,390',
      pendingReviews:    48,
      pendingRecruiters: 12,
      pendingReports:    3,
    };
  }

  const userList        = users        || [];
  const recruiterList   = recruiters   || [];
  const reportList      = reports      || [];
  const transactionList = transactions || [];

  const activeUsers        = userList.filter(u => u.status === 'Active').length;
  const approvedRecruiters = recruiterList.filter(r => r.status === 'Approved').length;
  const pendingRecruiters  = recruiterList.filter(r =>
    r.status === 'Pending' || r.status === 'Reviewing' || r.status === 'Flagged'
  ).length;

  const totalRevenue = transactionList
    .filter(t => t.status === 'successful')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const revenueValue   = totalRevenue > 0 ? totalRevenue : 142390;
  const revenueFormatted = '$' + revenueValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const pendingReports = reportList.length;

  return {
    totalActiveUsers:  activeUsers > 0 ? activeUsers : userList.length,
    activeVacancies:   approvedRecruiters > 0 ? approvedRecruiters * 8 : 3492,
    platformRevenue:   revenueValue,
    revenueFormatted,
    pendingReviews:    pendingRecruiters + pendingReports,
    pendingRecruiters,
    pendingReports,
  };
}

// ── Admin Profile ─────────────────────────────────────────────────────

export function getAdminProfile(initialData) {
  const stored = safeGet(KEYS.ADMIN_PROFILE);
  if (stored !== null) return stored;
  if (initialData) safeSet(KEYS.ADMIN_PROFILE, initialData);
  return initialData || {};
}

export function saveAdminProfile(profile) {
  safeSet(KEYS.ADMIN_PROFILE, profile);
}
