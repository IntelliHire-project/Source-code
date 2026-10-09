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
  getModerationStatsSummary
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
});
