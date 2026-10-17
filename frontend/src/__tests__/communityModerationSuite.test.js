/**
 * communityModerationSuite.test.js
 * Comprehensive automated test suite for Week 12: SCRUM-747, 748, 749, 750, 751, 752
 *
 * Covers:
 * - SCRUM-765: Functional Testing (Reporting, Remove, Restore, Warn, CSV Generation)
 * - SCRUM-766: Integration Testing (End-to-End moderation workflow)
 * - SCRUM-767: Bug Fixing & Edge Cases
 */

import {
  submitCommunityReport,
  recordRemovedPost,
  restoreRemovedPost,
  isPostRemoved,
  dispatchUserWarning,
  getUserWarnings,
  getModerationLogs,
  recordModerationLog,
  generateModerationCSVReport,
  getModerationStatsSummary,
  bulkDismissReports,
  bulkRemoveReports,
  dismissCommentFlag,
  removeComment,
  getComments,
  saveComments,
  getReports
} from '../services/adminStorage';

describe('Community Moderation & Administration Test Suite [SCRUM-752]', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── SCRUM-765: Functional Testing ──────────────────────────────────────

  describe('SCRUM-765: Functional Testing', () => {
    test('should submit a community report with custom category and reason [SCRUM-749]', () => {
      const report = submitCommunityReport({
        postId: 'test-post-1',
        title: 'Spam Link Promotion',
        snippet: 'Click here for free coins',
        category: 'Spam',
        reportedBy: 'candidate_user',
        reason: 'Known phishing domain pattern',
        severity: 'High'
      });

      expect(report).toBeDefined();
      expect(report.title).toBe('Spam Link Promotion');
      expect(report.category).toBe('Spam');
      expect(report.reportedBy).toBe('candidate_user');
      expect(report.severity).toBe('High');
    });

    test('should record removed content and hide it from platform [SCRUM-759]', () => {
      recordRemovedPost('violating-post-123', 'Inappropriate Discussion Title', {
        category: 'Hate Speech',
        author: 'OffensiveUser'
      });

      expect(isPostRemoved('violating-post-123')).toBe(true);
    });

    test('should restore previously removed content back to public feed [SCRUM-760]', () => {
      recordRemovedPost('falsely-flagged-456', 'Valid Career Discussion');
      expect(isPostRemoved('falsely-flagged-456')).toBe(true);

      const restored = restoreRemovedPost('falsely-flagged-456');
      expect(restored).toBeDefined();
      expect(isPostRemoved('falsely-flagged-456')).toBe(false);
    });

    test('should dispatch formal user warning and track strikes [SCRUM-761]', () => {
      const warning = dispatchUserWarning({
        author: 'SpamAuthor',
        postTitle: 'Earn $5000 Daily Scheme',
        category: 'Spam',
        warningLevel: 'Level 2: Strict Policy Violation Strike',
        message: 'Promotional schemes are prohibited.'
      });

      expect(warning).toBeDefined();
      expect(warning.author).toBe('SpamAuthor');
      expect(warning.warningLevel).toContain('Level 2');

      const userWarnings = getUserWarnings('SpamAuthor');
      expect(userWarnings.length).toBeGreaterThanOrEqual(1);
    });

    test('should generate structured CSV report for compliance export [SCRUM-764]', () => {
      recordModerationLog({
        action: 'Content Removed [SCRUM-759]',
        targetTitle: 'Phishing Post Sample',
        category: 'Spam',
        author: 'Scammer',
        moderator: 'Arthur V. Gold',
        status: 'Action Taken'
      });

      const csvContent = generateModerationCSVReport();
      expect(typeof csvContent).toBe('string');
      expect(csvContent).toContain('Log ID,Timestamp,Moderation Action');
      expect(csvContent).toContain('Phishing Post Sample');
      expect(csvContent).toContain('Arthur V. Gold');
    });

    test('should execute bulk dismissal and bulk removal on selected reports', () => {
      const report1 = submitCommunityReport({ postId: 'bulk-1', title: 'Report One' });
      const report2 = submitCommunityReport({ postId: 'bulk-2', title: 'Report Two' });
      const report3 = submitCommunityReport({ postId: 'bulk-3', title: 'Report Three' });

      // Bulk remove report1 and report2
      const afterBulkRemove = bulkRemoveReports([report1.id, report2.id]);
      expect(isPostRemoved('bulk-1')).toBe(true);
      expect(isPostRemoved('bulk-2')).toBe(true);
      expect(afterBulkRemove.some(r => r.id === report1.id)).toBe(false);
      expect(afterBulkRemove.some(r => r.id === report2.id)).toBe(false);

      // Bulk dismiss report3
      const afterBulkDismiss = bulkDismissReports([report3.id]);
      expect(afterBulkDismiss.some(r => r.id === report3.id)).toBe(false);
    });

    test('should dismiss comment flags and remove offending comments', () => {
      const initial = [
        { id: 101, author: 'troll_1', category: 'SPAM', text: 'Spam comment text' },
        { id: 102, author: 'abuser_2', category: 'HARASSMENT', text: 'Abusive text' }
      ];
      saveComments(initial);

      // Approve/dismiss flag on comment 101
      const afterDismiss = dismissCommentFlag(101);
      expect(afterDismiss.some(c => c.id === 101)).toBe(false);
      expect(afterDismiss.length).toBe(1);

      // Delete/remove offending comment 102
      const afterRemove = removeComment(102);
      expect(afterRemove.some(c => c.id === 102)).toBe(false);
      expect(afterRemove.length).toBe(0);
    });
  });

  // ── SCRUM-766: Integration Testing ────────────────────────────────────

  describe('SCRUM-766: Integration Testing', () => {
    test('end-to-end lifecycle: Report -> Admin Review -> Removal -> Restoration -> Audit Log', () => {
      // 1. Candidate flags post
      const report = submitCommunityReport({
        postId: 'lifecycle-post-99',
        title: 'Unfair Assessment Discussion',
        snippet: 'Criticizing interview questions unfairly',
        category: 'Inappropriate',
        reportedBy: 'Recruiter_Sara'
      });
      expect(report.id).toBeDefined();

      // 2. Admin removes post
      recordRemovedPost('lifecycle-post-99', report.title);
      expect(isPostRemoved('lifecycle-post-99')).toBe(true);

      // 3. Admin restores post after appeal
      restoreRemovedPost('lifecycle-post-99');
      expect(isPostRemoved('lifecycle-post-99')).toBe(false);

      // 4. Verify analytics summary updates
      const stats = getModerationStatsSummary();
      expect(stats.totalActions).toBeGreaterThanOrEqual(1);
      expect(stats.resolutionRate).toBeGreaterThanOrEqual(0);
    });
  });

  // ── SCRUM-767: Bug Fixing & Edge Cases ────────────────────────────────

  describe('SCRUM-767: Bug Fixing & Edge Cases', () => {
    test('should safely handle empty post IDs without crashing', () => {
      expect(isPostRemoved(null)).toBe(false);
      expect(isPostRemoved(undefined)).toBe(false);
      expect(isPostRemoved('')).toBe(false);
    });

    test('should properly sanitize double quotes in CSV generation', () => {
      recordModerationLog({
        targetTitle: 'Post with "Quotes" inside',
        notes: 'Notes with "special" punctuation'
      });

      const csv = generateModerationCSVReport();
      expect(csv).toContain('""Quotes""');
      expect(csv).toContain('""special""');
    });
  });

  // ── Advanced Record Tracking & Filtering ──────────────────────────────
  describe('Advanced Record Tracking, Filtering & Search', () => {
    test('should accurately filter action logs by category and action type', () => {
      recordModerationLog({ action: 'Content Removed', targetTitle: 'Spam 1', category: 'Spam' });
      recordModerationLog({ action: 'User Warned: Level 1', targetTitle: 'Warning 1', category: 'Inappropriate' });
      recordModerationLog({ action: 'Content Restored', targetTitle: 'Restored 1', category: 'General' });

      const logs = getModerationLogs();
      const removedLogs = logs.filter(l => l.action.toLowerCase().includes('remove'));
      const warnedLogs = logs.filter(l => l.action.toLowerCase().includes('warn'));
      const restoredLogs = logs.filter(l => l.action.toLowerCase().includes('restore'));

      expect(removedLogs.length).toBeGreaterThanOrEqual(1);
      expect(warnedLogs.length).toBeGreaterThanOrEqual(1);
      expect(restoredLogs.length).toBeGreaterThanOrEqual(1);
    });

    test('should filter warnings by strike level correctly', () => {
      dispatchUserWarning({ author: 'userA', warningLevel: 'Level 1: General Policy Notice' });
      dispatchUserWarning({ author: 'userB', warningLevel: 'Level 2: Strict Policy Violation Strike' });

      const allWarnings = getUserWarnings();
      const level1 = allWarnings.filter(w => w.warningLevel?.includes('1'));
      const level2 = allWarnings.filter(w => w.warningLevel?.includes('2'));

      expect(level1.length).toBeGreaterThanOrEqual(1);
      expect(level2.length).toBeGreaterThanOrEqual(1);
    });
  });
});
