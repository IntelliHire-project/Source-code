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
