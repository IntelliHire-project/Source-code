/**
 * adminStorage.js
 * Central localStorage persistence layer for all IntelliHire admin panel data.
 * Each admin page reads/writes through these helpers so data survives page
 * refreshes and the Dashboard can compute live KPI stats from all stores.
 */

const KEYS = {
  USERS:        'ih_admin_users',
  RECRUITERS:   'ih_admin_recruiters',
  REPORTS:      'ih_admin_reports',
  COMMENTS:     'ih_admin_comments',
  TRANSACTIONS: 'ih_admin_transactions',
  AUDIT_LOGS:   'ih_admin_audit_logs',
  ADMIN_PROFILE:'ih_admin_profile',
  REMOVED_POSTS:'ih_admin_removed_posts',
  REMOVED_POSTS_DATA:'ih_admin_removed_posts_data',
  USER_WARNINGS:'ih_admin_user_warnings',
  COMMUNITY_POSTS:'ih_community_posts',
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

/**
 * Returns the persisted user list, or seeds localStorage with initialData
 * and returns that if nothing is stored yet.
 */
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

  // Auto-log to Audit Logs for compliance & admin visibility
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

// ── Removed Posts / Moderation Enforcement (SCRUM-759, SCRUM-760) ───

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

  // Save detailed record in removed list for Restore capability
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
    actionType: `Post Removed [SCRUM-759]: ${postTitle ? `"${postTitle.slice(0, 30)}..."` : stringId}`,
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
    actionType: `Post Restored [SCRUM-760]: ${target?.title ? `"${target.title.slice(0, 30)}..."` : stringId}`,
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

// ── User Warnings Management (SCRUM-761) ──────────────────────────────

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
    actionType: `User Warned [SCRUM-761]: ${author} (${warningLevel})`,
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

/**
 * Appends a single new event to the front of the audit log (most-recent first).
 * Automatically stamps the current time and fills in default admin user details.
 *
 * @param {object} entry
 * @param {string} entry.actionType  — e.g. 'User Created', 'Recruiter Approved'
 * @param {string} entry.module      — e.g. 'USER_MGMT', 'RECRUITER_VERIFY'
 * @param {'success'|'failure'|'pending'} [entry.status]
 * @param {object} [entry.user]      — override default admin actor
 */
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
  const updated = [newEntry, ...existing].slice(0, 500); // keep latest 500 entries
  safeSet(KEYS.AUDIT_LOGS, updated);
  return newEntry;
}

export function saveAuditLogs(logs) {
  safeSet(KEYS.AUDIT_LOGS, logs);
}

// ── Dashboard Stats (computed from all stores) ─────────────────────────

/**
 * Computes live KPI values from whatever is currently in localStorage.
 * Falls back to the original hardcoded AdminDashboard defaults when storage
 * is empty (i.e. on very first visit before any page has seeded data).
 */
export function getDashboardStats() {
  const users        = safeGet(KEYS.USERS);
  const recruiters   = safeGet(KEYS.RECRUITERS);
  const reports      = safeGet(KEYS.REPORTS);
  const transactions = safeGet(KEYS.TRANSACTIONS);

  // Nothing stored yet — return original static defaults
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
