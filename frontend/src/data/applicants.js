/**
 * applicants.js — single shared applicant dataset + aggregation helpers.
 *
 * This is the ONLY owner of applicant-stage records in the vacancy domain.
 * Both the Active Vacancies list (VacancyManagementPage) and the Vacancy
 * Detail Dashboard (VacancyDetailPage) read from this module, filtered by
 * vacancyId, so the detail dashboard is a read/filter view over the same
 * source — never a separate copy of applicant data.
 *
 * Each record belongs to exactly one vacancy via `vacancyId` (the same id
 * space as `VACANCIES` in data/vacancies.js, e.g. "VAC-004").
 *
 * Derived helpers (`getFunnel`, `getShortlisted`, `deriveStage`,
 * `deriveNextStep`, `getTrackerStates`, ...) are consumed by the Vacancy
 * Detail Dashboard and keep the same signatures they previously had when
 * they lived inside data/vacancies.js, so call sites only change imports.
 */

import { TRACKER_STAGES } from './vacancies';
import { getInterviews } from './interviews';

export const APPLICANTS = [
  // ── VAC-001 · Senior Frontend Engineer ──
  { id: 'VAC-001-c1', vacancyId: 'VAC-001', name: 'Ayesha Khan', email: 'ayesha.khan@example.com', score: 92, stage: 'offer', appliedDate: '14 Jul 2026', resumeLink: '#resume-VAC-001-c1' },
  { id: 'VAC-001-c2', vacancyId: 'VAC-001', name: 'Tom Bradley', email: 'tom.bradley@example.com', score: 88, stage: 'interviewed', appliedDate: '15 Jul 2026', resumeLink: '#resume-VAC-001-c2' },
  { id: 'VAC-001-c3', vacancyId: 'VAC-001', name: 'Priya Nair', email: 'priya.nair@example.com', score: 87, stage: 'interviewed', appliedDate: '16 Jul 2026', resumeLink: '#resume-VAC-001-c3' },
  { id: 'VAC-001-c4', vacancyId: 'VAC-001', name: 'Leo Martins', email: 'leo.martins@example.com', score: 85, stage: 'shortlisted', appliedDate: '18 Jul 2026', resumeLink: '#resume-VAC-001-c4' },
  { id: 'VAC-001-c5', vacancyId: 'VAC-001', name: 'Sofia Rossi', email: 'sofia.rossi@example.com', score: 83, stage: 'shortlisted', appliedDate: '18 Jul 2026', resumeLink: '#resume-VAC-001-c5' },
  { id: 'VAC-001-c6', vacancyId: 'VAC-001', name: 'David Osei', email: 'david.osei@example.com', score: 76, stage: 'applied', appliedDate: '20 Jul 2026', resumeLink: '#resume-VAC-001-c6' },
  { id: 'VAC-001-c7', vacancyId: 'VAC-001', name: 'Hannah Lee', email: 'hannah.lee@example.com', score: 74, stage: 'applied', appliedDate: '21 Jul 2026', resumeLink: '#resume-VAC-001-c7' },
  { id: 'VAC-001-c8', vacancyId: 'VAC-001', name: 'Marcus Webb', email: 'marcus.webb@example.com', score: 62, stage: 'rejected', appliedDate: '19 Jul 2026', resumeLink: '#resume-VAC-001-c8' },

  // ── VAC-002 · Product Designer ──
  { id: 'VAC-002-c1', vacancyId: 'VAC-002', name: 'Nina Petrova', email: 'nina.petrova@example.com', score: 89, stage: 'applied', appliedDate: '10 Jul 2026', resumeLink: '#resume-VAC-002-c1' },
  { id: 'VAC-002-c2', vacancyId: 'VAC-002', name: 'Arjun Mehta', email: 'arjun.mehta@example.com', score: 88, stage: 'applied', appliedDate: '11 Jul 2026', resumeLink: '#resume-VAC-002-c2' },
  { id: 'VAC-002-c3', vacancyId: 'VAC-002', name: 'Elena Vargas', email: 'elena.vargas@example.com', score: 86, stage: 'applied', appliedDate: '12 Jul 2026', resumeLink: '#resume-VAC-002-c3' },
  { id: 'VAC-002-c4', vacancyId: 'VAC-002', name: 'Daniel Kim', email: 'daniel.kim@example.com', score: 85, stage: 'applied', appliedDate: '12 Jul 2026', resumeLink: '#resume-VAC-002-c4' },
  { id: 'VAC-002-c5', vacancyId: 'VAC-002', name: 'Mia Chen', email: 'mia.chen@example.com', score: 82, stage: 'applied', appliedDate: '18 Jul 2026', resumeLink: '#resume-VAC-002-c5' },
  { id: 'VAC-002-c6', vacancyId: 'VAC-002', name: 'Leo Duarte', email: 'leo.duarte@example.com', score: 80, stage: 'applied', appliedDate: '19 Jul 2026', resumeLink: '#resume-VAC-002-c6' },
  { id: 'VAC-002-c7', vacancyId: 'VAC-002', name: 'Grace Liu', email: 'grace.liu@example.com', score: 71, stage: 'applied', appliedDate: '20 Jul 2026', resumeLink: '#resume-VAC-002-c7' },
  { id: 'VAC-002-c8', vacancyId: 'VAC-002', name: 'Peter Novak', email: 'peter.novak@example.com', score: 65, stage: 'rejected', appliedDate: '17 Jul 2026', resumeLink: '#resume-VAC-002-c8' },
  { id: 'VAC-002-c9', vacancyId: 'VAC-002', name: 'Fatima Ali', email: 'fatima.ali@example.com', score: 63, stage: 'rejected', appliedDate: '16 Jul 2026', resumeLink: '#resume-VAC-002-c9' },

  // ── VAC-003 · Backend Engineer ──
  { id: 'VAC-003-c1', vacancyId: 'VAC-003', name: 'Ravi Menon', email: 'ravi.menon@example.com', score: 90, stage: 'shortlisted', appliedDate: '02 Jul 2026', resumeLink: '#resume-VAC-003-c1' },
  { id: 'VAC-003-c2', vacancyId: 'VAC-003', name: 'Alice Morgan', email: 'alice.morgan@example.com', score: 89, stage: 'shortlisted', appliedDate: '03 Jul 2026', resumeLink: '#resume-VAC-003-c2' },
  { id: 'VAC-003-c3', vacancyId: 'VAC-003', name: 'Jake Thompson', email: 'jake.thompson@example.com', score: 78, stage: 'applied', appliedDate: '04 Jul 2026', resumeLink: '#resume-VAC-003-c3' },
  { id: 'VAC-003-c4', vacancyId: 'VAC-003', name: 'Omar Haddad', email: 'omar.haddad@example.com', score: 77, stage: 'applied', appliedDate: '05 Jul 2026', resumeLink: '#resume-VAC-003-c4' },
  { id: 'VAC-003-c5', vacancyId: 'VAC-003', name: 'Chloe Bennett', email: 'chloe.bennett@example.com', score: 76, stage: 'applied', appliedDate: '06 Jul 2026', resumeLink: '#resume-VAC-003-c5' },
  { id: 'VAC-003-c6', vacancyId: 'VAC-003', name: 'Sam Okafor', email: 'sam.okafor@example.com', score: 68, stage: 'rejected', appliedDate: '05 Jul 2026', resumeLink: '#resume-VAC-003-c6' },
  { id: 'VAC-003-c7', vacancyId: 'VAC-003', name: 'Isabelle Moreau', email: 'isabelle.moreau@example.com', score: 61, stage: 'rejected', appliedDate: '07 Jul 2026', resumeLink: '#resume-VAC-003-c7' },

  // ── VAC-004 · BA Intern (worked example: 3 shortlisted, 0 interviews) ──
  { id: 'VAC-004-c1', vacancyId: 'VAC-004', name: 'Emma Watson', email: 'emma.watson@example.com', score: 86, stage: 'shortlisted', appliedDate: '20 Jul 2026', resumeLink: '#resume-VAC-004-c1' },
  { id: 'VAC-004-c2', vacancyId: 'VAC-004', name: 'James Carter', email: 'james.carter@example.com', score: 84, stage: 'shortlisted', appliedDate: '20 Jul 2026', resumeLink: '#resume-VAC-004-c2' },
  { id: 'VAC-004-c3', vacancyId: 'VAC-004', name: 'Olivia Brown', email: 'olivia.brown@example.com', score: 79, stage: 'shortlisted', appliedDate: '21 Jul 2026', resumeLink: '#resume-VAC-004-c3' },

  // ── VAC-006 · DevOps Engineer ──
  { id: 'VAC-006-c1', vacancyId: 'VAC-006', name: 'Ankit Sharma', email: 'ankit.sharma@example.com', score: 91, stage: 'hired', appliedDate: '07 Jun 2026', resumeLink: '#resume-VAC-006-c1' },
  { id: 'VAC-006-c2', vacancyId: 'VAC-006', name: 'Bethany Fox', email: 'bethany.fox@example.com', score: 84, stage: 'rejected', appliedDate: '08 Jun 2026', resumeLink: '#resume-VAC-006-c2' },
  { id: 'VAC-006-c3', vacancyId: 'VAC-006', name: 'Chris Nolan', email: 'chris.nolan@example.com', score: 79, stage: 'rejected', appliedDate: '09 Jun 2026', resumeLink: '#resume-VAC-006-c3' },
  { id: 'VAC-006-c4', vacancyId: 'VAC-006', name: 'Deepa Iyer', email: 'deepa.iyer@example.com', score: 74, stage: 'applied', appliedDate: '10 Jun 2026', resumeLink: '#resume-VAC-006-c4' },
];

/* ─────────────────────────────────────────────────────────────
   Queries — filter the shared dataset down to a single vacancy.
   ───────────────────────────────────────────────────────────── */

export function getApplicants(vacancyId) {
  return APPLICANTS.filter((applicant) => applicant.vacancyId === vacancyId);
}

/* ─────────────────────────────────────────────────────────────
   Derived helpers — used by the Vacancy Detail Dashboard.
   They accept the vacancy record so existing call sites keep
   their signatures; applicant lookup happens by vacancy.id.
   ───────────────────────────────────────────────────────────── */

export function getStageCounts(vacancy) {
  const counts = {
    applied: 0,
    shortlisted: 0,
    interviewed: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
  };
  getApplicants(vacancy.id).forEach((candidate) => {
    if (counts[candidate.stage] !== undefined) counts[candidate.stage] += 1;
  });
  return counts;
}

/**
 * Funnel: Applied → Shortlisted → Interviewed → Hired.
 * Shortlisted includes everyone past the applied stage; Interviewed
 * includes everyone who has been through an interview (incl. offer/hired).
 */
export function getFunnel(vacancy) {
  const counts = getStageCounts(vacancy);
  const total = getApplicants(vacancy.id).length;
  return {
    total,
    applied: total,
    shortlisted: counts.shortlisted + counts.interviewed + counts.offer + counts.hired,
    interviewed: counts.interviewed + counts.offer + counts.hired,
    hired: counts.hired,
    rejected: counts.rejected,
  };
}

export function getShortlisted(vacancy) {
  return getApplicants(vacancy.id)
    .filter((candidate) =>
      ['shortlisted', 'interviewed', 'offer', 'hired'].includes(candidate.stage),
    )
    .sort((a, b) => b.score - a.score);
}

export function getAvgMatchScore(vacancy) {
  const scores = getApplicants(vacancy.id)
    .map((candidate) => candidate.score)
    .filter((score) => Number.isFinite(score));
  if (!scores.length) return null;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/**
 * Current recruitment stage for the progress tracker.
 */
export function deriveStage(vacancy) {
  const counts = getStageCounts(vacancy);
  const applicants = getApplicants(vacancy.id);
  if (vacancy.status === 'closed') {
    return counts.hired > 0 ? 'hired' : 'closed';
  }
  if (applicants.length === 0) {
    return vacancy.status === 'draft' ? 'requisition' : 'sourcing';
  }
  if (counts.hired > 0) return 'hired';
  if (counts.offer > 0) return 'offer';
  if (counts.interviewed > 0) return 'interviewing';
  if (counts.shortlisted > 0) return 'shortlisted';
  return 'screening';
}

/**
 * Next-step callout text — generated from real vacancy data and
 * never blank (falls back when the vacancy has no applicants).
 */
export function deriveNextStep(vacancy) {
  const counts = getStageCounts(vacancy);
  const total = getApplicants(vacancy.id).length;

  if (vacancy.status === 'closed') {
    return counts.hired > 0
      ? 'Position filled — offer accepted'
      : 'Position closed — no candidate selected';
  }
  if (total === 0) {
    return 'No activity yet — share the vacancy to start sourcing';
  }
  if (counts.hired > 0) return 'Position filled — offer accepted';
  if (counts.offer > 0) {
    return `Awaiting offer decision for ${counts.offer} candidate${counts.offer > 1 ? 's' : ''}`;
  }
  const scheduled = getInterviews(vacancy.id).filter(
    (interview) => interview.status === 'scheduled',
  );
  if (scheduled.length > 0) {
    return `${scheduled.length} interview${scheduled.length > 1 ? 's' : ''} scheduled for ${
      scheduled[0].date
    }`;
  }
  if (counts.shortlisted > 0) {
    return `${counts.shortlisted} candidate${counts.shortlisted > 1 ? 's' : ''} shortlisted — schedule interviews`;
  }
  return `Review ${counts.applied} applicant${counts.applied > 1 ? 's' : ''} and shortlist the strongest matches`;
}

/**
 * Tracker node states: done = success, current = warning, upcoming = neutral.
 */
export function getTrackerStates(vacancy) {
  const stage = deriveStage(vacancy);
  const currentIdx =
    stage === 'hired'
      ? TRACKER_STAGES.length - 1
      : TRACKER_STAGES.findIndex((node) => node.id === stage);

  return TRACKER_STAGES.map((node, index) => {
    let state;
    if (stage === 'hired') {
      state = 'done';
    } else if (index < currentIdx) {
      state = 'done';
    } else if (index === currentIdx) {
      state = 'current';
    } else {
      state = 'upcoming';
    }
    return { ...node, state };
  });
}

export function getOutcome(vacancy) {
  const counts = getStageCounts(vacancy);
  if (vacancy.status === 'closed') {
    return counts.hired > 0
      ? { key: 'filled', label: 'Filled' }
      : { key: 'closed unfilled', label: 'Closed unfilled' };
  }
  return { key: 'still open', label: 'Still open' };
}
