/**
 * statusColors.js
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for every status / decision label used
 * in the product (vacancy status, applicant stage, admin review
 * decision, interview status, funnel/outcome states, tracker tones).
 *
 * EVERY value below is the NAME of an existing CSS custom property
 * defined in `frontend/src/styles/tokens.css` (the theme file that
 * implements system_design.md § 1). We only ever reference those
 * variables — never raw hex values — so the source of truth for
 * color values stays in the theme file.
 *
 * Canonical semantic tokens (from tokens.css):
 *   success  → --success                #22C55E
 *   warning  → --warning                #F0B90B
 *   danger   → --crisis                 #E63946
 *   info     → --accent-info            #6B8CFF
 *   neutral  → --text-on-dark-muted     #9599A6
 *
 * Rules:
 *  - To support a NEW status label, map it to one of the tokens
 *    above. Never hardcode a new color.
 *  - Consumers should read `statusToken(status)` (or STATUS_TONES)
 *    and apply it via `var(--status-color)` on the element.
 *
 * Domain map (matches the "Color System" section of the vacancy
 * dashboard task):
 *   Vacancy status        → Published=success, Draft=warning, Closed=neutral
 *   Applicant stage       → Applied=neutral, Shortlisted=info,
 *                           Interviewed=info, Hired=success,
 *                           Rejected/Dropped=danger
 *   Admin review decision → Approved=success, Pending=warning,
 *                           Changes Requested=warning, Rejected=danger
 */

export const STATUS_COLORS = {
  // ── Vacancy status ──
  published: '--success',
  draft: '--warning',
  closed: '--text-on-dark-muted',

  // ── Applicant stage ──
  applied: '--text-on-dark-muted',
  shortlisted: '--accent-info',
  interviewed: '--accent-info',
  offer: '--warning',
  hired: '--success',
  rejected: '--crisis',
  dropped: '--crisis',

  // ── Admin review decision ──
  approved: '--success',
  pending: '--warning',
  'changes requested': '--warning',
  'changes_requested': '--warning',

  // ── Interview status ──
  scheduled: '--accent-info',
  completed: '--success',
  rescheduled: '--warning',
  cancelled: '--text-on-dark-muted',

  // ── Recruitment outcome (Summary tab) ──
  filled: '--success',
  'still open': '--accent-info',
  'closed unfilled': '--text-on-dark-muted',
};

/**
 * Generic tone → token mapping for state-driven components
 * (progress tracker nodes, approval timeline steppers).
 */
export const STATUS_TONES = {
  success: '--success',
  warning: '--warning',
  danger: '--crisis',
  info: '--accent-info',
  neutral: '--text-on-dark-muted',
};

/**
 * Resolve a status label to its theme token name.
 * Falls back to the neutral token for anything unmapped so a
 * badge is never unstyled (but the label text always carries meaning).
 */
export function statusToken(status) {
  return STATUS_COLORS[status] || '--text-on-dark-muted';
}
