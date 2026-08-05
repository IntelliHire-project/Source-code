/**
 * interviews.js — single shared interview-schedule dataset.
 *
 * Only owner of scheduled/completed interview records in the vacancy
 * domain. The Vacancy Detail Dashboard's "Interview Schedule" tab reads
 * from this module filtered by vacancyId (same id space as data/vacancies.js),
 * so scheduling shown on the dashboard traces back to this one source.
 */

export const INTERVIEWS = [
  // ── VAC-001 · Senior Frontend Engineer ──
  { id: 'VAC-001-i1', vacancyId: 'VAC-001', candidateName: 'Tom Bradley', date: '24 Jul 2026', time: '10:00 AM', round: 'Round 1', status: 'completed', interviewer: 'Jordan Patel', location: 'Google Meet' },
  { id: 'VAC-001-i2', vacancyId: 'VAC-001', candidateName: 'Priya Nair', date: '25 Jul 2026', time: '02:00 PM', round: 'Round 1', status: 'completed', interviewer: 'Jordan Patel', location: 'Google Meet' },
  { id: 'VAC-001-i3', vacancyId: 'VAC-001', candidateName: 'Leo Martins', date: '28 Jul 2026', time: '11:00 AM', round: 'Round 1', status: 'scheduled', interviewer: 'Jordan Patel', location: 'Google Meet' },
  { id: 'VAC-001-i4', vacancyId: 'VAC-001', candidateName: 'Sofia Rossi', date: '29 Jul 2026', time: '03:00 PM', round: 'Round 1', status: 'scheduled', interviewer: 'Jordan Patel', location: 'Google Meet' },
  { id: 'VAC-001-i5', vacancyId: 'VAC-001', candidateName: 'Tom Bradley', date: '31 Jul 2026', time: '10:00 AM', round: 'Round 2', status: 'completed', interviewer: 'Amelia Stone', location: 'Office — Room 2A' },

  // ── VAC-002 · Product Designer ──
  { id: 'VAC-002-i1', vacancyId: 'VAC-002', candidateName: 'Mia Chen', date: '25 Jul 2026', time: '09:30 AM', round: 'Round 1', status: 'completed', interviewer: 'Amelia Stone', location: 'Google Meet' },
  { id: 'VAC-002-i2', vacancyId: 'VAC-002', candidateName: 'Leo Duarte', date: '26 Jul 2026', time: '01:00 PM', round: 'Round 1', status: 'completed', interviewer: 'Amelia Stone', location: 'Google Meet' },
  { id: 'VAC-002-i3', vacancyId: 'VAC-002', candidateName: 'Nina Petrova', date: '04 Aug 2026', time: '10:00 AM', round: 'Round 1', status: 'scheduled', interviewer: 'Amelia Stone', location: 'Google Meet' },
  { id: 'VAC-002-i4', vacancyId: 'VAC-002', candidateName: 'Arjun Mehta', date: '04 Aug 2026', time: '02:00 PM', round: 'Round 1', status: 'scheduled', interviewer: 'Amelia Stone', location: 'Google Meet' },
  { id: 'VAC-002-i5', vacancyId: 'VAC-002', candidateName: 'Elena Vargas', date: '04 Aug 2026', time: '04:00 PM', round: 'Round 1', status: 'scheduled', interviewer: 'Lucy Grant', location: 'Google Meet' },

  // ── VAC-006 · DevOps Engineer ──
  { id: 'VAC-006-i1', vacancyId: 'VAC-006', candidateName: 'Ankit Sharma', date: '15 Jun 2026', time: '11:00 AM', round: 'Round 1', status: 'completed', interviewer: 'Jordan Patel', location: 'Google Meet' },
  { id: 'VAC-006-i2', vacancyId: 'VAC-006', candidateName: 'Ankit Sharma', date: '19 Jun 2026', time: '02:00 PM', round: 'Round 2', status: 'completed', interviewer: 'Amelia Stone', location: 'Office — Room 3B' },
  { id: 'VAC-006-i3', vacancyId: 'VAC-006', candidateName: 'Ankit Sharma', date: '23 Jun 2026', time: '10:00 AM', round: 'Panel', status: 'completed', interviewer: 'Emma Clarke', location: 'Office — Room 1A' },
  { id: 'VAC-006-i4', vacancyId: 'VAC-006', candidateName: 'Bethany Fox', date: '16 Jun 2026', time: '10:00 AM', round: 'Round 1', status: 'cancelled', interviewer: 'Jordan Patel', location: 'Google Meet' },
];

export function getInterviews(vacancyId) {
  return INTERVIEWS.filter((interview) => interview.vacancyId === vacancyId);
}
