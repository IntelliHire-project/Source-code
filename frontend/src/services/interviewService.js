/**
 * Interview & Reschedule Service for IntelliHire
 * Manages interview slots, panel member assignments, and the full lifecycle
 * of interview rescheduling requests.
 */

import * as interviewApi from '../api/interviewApi';

const STORAGE_KEYS = {
  SLOTS: 'intellihire_interview_slots',
  RESCHEDULE_REQUESTS: 'intellihire_reschedule_requests',
  PANEL_MEMBERS: 'intellihire_panel_members',
};

// Initial Mock Panel Members - Single Consistent List with Availability Metadata
export const DEFAULT_PANEL_MEMBERS = [
  {
    id: 'pm-1',
    name: 'Saman Tech',
    email: 'saman.tech@company.com',
    role: 'Technical Lead & Interviewer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialties: ['React', 'Node.js', 'System Architecture'],
    availableHours: '09:00 AM – 05:00 PM',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxDailyInterviews: 4,
    status: 'AVAILABLE',
  },
  {
    id: 'pm-2',
    name: 'Nirosha HR',
    email: 'nirosha.hr@company.com',
    role: 'HR Manager & Culture Fit Interviewer',
    department: 'Human Resources',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialties: ['HR Screening', 'Culture Fit', 'Portfolio Review'],
    availableHours: '09:00 AM – 05:00 PM',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxDailyInterviews: 5,
    status: 'AVAILABLE',
  },
  {
    id: 'pm-3',
    name: 'Dilhani Wickramasinghe',
    email: 'dilhani.w@company.com',
    role: 'Talent Acquisition Lead',
    department: 'Talent Acquisition',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    specialties: ['Talent Sourcing', 'Behavioral Interview', 'Leadership'],
    availableHours: '09:00 AM – 05:00 PM',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxDailyInterviews: 4,
    status: 'AVAILABLE',
  },
  {
    id: 'pm-4',
    name: 'Ruwan Bandara',
    email: 'ruwan.b@company.com',
    role: 'Principal Engineer & System Architect',
    department: 'Platform Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialties: ['Distributed Systems', 'Cloud & DevOps', 'Database Architecture'],
    availableHours: '09:00 AM – 05:00 PM',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxDailyInterviews: 4,
    status: 'AVAILABLE',
  },
];

// Initial Mock Interview Slots with Panel Members assigned (Strictly matching Candidate Allocation Results)
export const DEFAULT_SLOTS = [
  {
    id: 1,
    jobPosition: 'Senior Software Engineer',
    vacancyId: 'v-1',
    round: 'Technical Interview',
    interviewDate: '2026-10-22',
    displayDate: '22 Oct 2026',
    startTime: '09:30 AM',
    endTime: '10:30 AM',
    interviewType: 'Online',
    status: 'COMPLETED', // COMPLETED with evaluation on past date
    meetingLocation: 'https://meet.google.com/new',
    capacity: 1,
    bookedCount: 1,
    panelMember: DEFAULT_PANEL_MEMBERS[0], // Saman Tech
    candidate: {
      id: 'APP-000',
      name: 'Danushka Silva',
      email: 'danushka.silva@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      matchScore: 92,
    },
    additionalNotes: 'Live coding session completed. Architecture evaluation and problem-solving interview.',
    evaluation: {
      candidateName: 'Danushka Silva',
      score: 4,
      strengths: 'Demonstrated exceptional understanding of React performance optimization, state management, and clean architecture principles.',
      improvements: 'Can further explore advanced Redis caching and automated end-to-end testing pipelines.',
      recommendation: 'HIRE',
      evaluatedBy: 'Saman Tech',
      submittedAt: '22 Oct 2026',
    },
  },
  {
    id: 2,
    jobPosition: 'Senior Software Engineer',
    vacancyId: 'v-1',
    round: 'HR Portfolio Review',
    interviewDate: '2026-11-20',
    displayDate: '20 Nov 2026',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    interviewType: 'Physical',
    status: 'RESCHEDULE_REQUESTED',
    meetingLocation: 'Innovation Hub — Interview Suite 102',
    capacity: 1,
    bookedCount: 1,
    panelMember: DEFAULT_PANEL_MEMBERS[1], // Nirosha HR
    candidate: {
      id: 'APP-002',
      name: 'Kamal Perera',
      email: 'kamal.perera@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      matchScore: 82,
    },
    additionalNotes: 'Review portfolio artifacts, team leadership experience, and cultural fit.',
  },
  {
    id: 3,
    jobPosition: 'Senior Software Engineer',
    vacancyId: 'v-1',
    round: 'System Architecture',
    interviewDate: '2026-11-21',
    displayDate: '21 Nov 2026',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    interviewType: 'Online',
    status: 'SCHEDULED', // UPCOMING FUTURE DATE - Evaluation is LOCKED
    meetingLocation: 'https://meet.google.com/new',
    capacity: 1,
    bookedCount: 1,
    panelMember: DEFAULT_PANEL_MEMBERS[3], // Ruwan Bandara
    candidate: {
      id: 'APP-003',
      name: 'Nimal Silva',
      email: 'nimal.silva@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      matchScore: 79,
    },
    additionalNotes: 'Upcoming technical round. Evaluation is locked until the interview date has arrived.',
  },
  {
    id: 4,
    jobPosition: 'Senior Software Engineer',
    vacancyId: 'v-1',
    round: 'Technical Interview',
    interviewDate: '2026-11-23',
    displayDate: '23 Nov 2026',
    startTime: '09:30 AM',
    endTime: '10:30 AM',
    interviewType: 'Online',
    status: 'SCHEDULED', // UPCOMING FUTURE DATE - Evaluation is LOCKED
    meetingLocation: 'https://meet.google.com/new',
    capacity: 1,
    bookedCount: 1,
    panelMember: DEFAULT_PANEL_MEMBERS[0], // Saman Tech
    candidate: {
      id: 'APP-001',
      name: 'Alice Fernando',
      email: 'alice.fernando@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      matchScore: 88,
    },
    additionalNotes: 'Live coding session and React performance assessment round. Evaluation unlocks on the interview date.',
  },
];

// Initial Mock Reschedule Requests
export const DEFAULT_RESCHEDULE_REQUESTS = [
  {
    id: 'req-201',
    slotId: 2,
    requestedBy: 'PANEL_MEMBER', // 'PANEL_MEMBER' or 'CANDIDATE'
    panelMember: DEFAULT_PANEL_MEMBERS[1], // Nirosha HR
    candidateName: 'Kamal Perera',
    candidateEmail: 'kamal.perera@example.com',
    jobPosition: 'Senior Software Engineer',
    round: 'HR Portfolio Review',
    currentDate: '2026-11-20',
    currentDisplayDate: '20 Nov 2026',
    currentTime: '02:00 PM - 03:00 PM',
    reasonCategory: 'Schedule Conflict / Urgent Meeting',
    detailedReason: 'Prior urgent leadership sync scheduled at this time. Requesting to reschedule to an alternative slot.',
    proposedSlots: [
      {
        id: 'prop-1',
        date: '2026-11-23',
        displayDate: '23 Nov 2026',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
      },
      {
        id: 'prop-2',
        date: '2026-11-24',
        displayDate: '24 Nov 2026',
        startTime: '03:30 PM',
        endTime: '04:30 PM',
      },
    ],
    status: 'PENDING', // 'PENDING', 'APPROVED', 'REJECTED'
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    resolutionNotes: '',
  },
];

const MONTH_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

// Helper: Convert display date string to ISO 'YYYY-MM-DD'
export const toIsoDateString = (dStr) => {
  if (!dStr) return '2026-11-05';
  const clean = dStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    const day = parts[0].padStart(2, '0');
    const mon = MONTH_MAP[parts[1].toLowerCase().slice(0, 3)] || '11';
    const year = parts[2] || '2026';
    return `${year}-${mon}-${day}`;
  }
  return '2026-11-05';
};

// Helper: Convert date string (ISO 'YYYY-MM-DD' or other) to readable display string 'DD Mon YYYY'
export const toDisplayDateString = (dStr) => {
  if (!dStr) return '';
  const clean = String(dStr).trim();
  if (/^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/.test(clean)) return clean;
  const matchDmy = clean.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (matchDmy) {
    return `${matchDmy[1].padStart(2, '0')} ${matchDmy[2]} ${matchDmy[3]}`;
  }
  const matchIso = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchIso) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mon = months[parseInt(matchIso[2], 10) - 1] || 'Nov';
    return `${matchIso[3].padStart(2, '0')} ${mon} ${matchIso[1]}`;
  }
  try {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  } catch (_) {}
  return clean;
};

// Helper: Calculate end time (+1 hour)
export const getEndTime = (timeStr) => {
  if (!timeStr) return '11:00 AM';
  const cleanStr = String(timeStr).split(/\s*(?:[\u2013\u2014–—-]|to)\s*/i)[0].trim();
  const m = cleanStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!m) return '11:00 AM';
  let hrs = parseInt(m[1], 10);
  const mins = m[2];
  let ampm = m[3] ? m[3].toUpperCase() : 'AM';
  hrs = hrs + 1;
  if (hrs === 12) {
    ampm = ampm === 'AM' ? 'PM' : 'AM';
  } else if (hrs > 12) {
    hrs = hrs - 12;
  }
  return `${String(hrs).padStart(2, '0')}:${mins} ${ampm}`;
};

// Helper: Clean a single time string (e.g. '09:00 AM', '11:00', etc.)
export const cleanSingleTime = (tStr) => {
  if (!tStr) return '';
  const match = String(tStr).match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  return match ? match[1].trim() : String(tStr).trim();
};

// Helper: Cleanly split a time or time range string into separate startTime and endTime
export const splitTimeRange = (timeStr, defaultStart = '10:00 AM') => {
  if (!timeStr) {
    const s = cleanSingleTime(defaultStart) || '10:00 AM';
    return { startTime: s, endTime: getEndTime(s) };
  }
  const clean = String(timeStr).trim();
  const parts = clean.split(/\s*(?:[\u2013\u2014–—-]|to)\s*/i).filter(Boolean);
  if (parts.length >= 2) {
    const s = cleanSingleTime(parts[0]);
    const e = cleanSingleTime(parts[parts.length - 1]);
    return {
      startTime: s,
      endTime: e || getEndTime(s),
    };
  }
  const s = cleanSingleTime(clean);
  return {
    startTime: s,
    endTime: getEndTime(s),
  };
};

const CANDIDATE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
];

// Helper: Check whether a date is in the past or today (format: YYYY-MM-DD or display date)
export const isPastOrToday = (dateStr) => {
  if (!dateStr) return false;
  const iso = toIsoDateString(dateStr);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return iso <= todayStr;
};

// Helper: Generate Google Calendar URL
export const generateGoogleCalendarLink = ({ title, description, date, startTime, endTime, location }) => {
  try {
    const timing = splitTimeRange(startTime);
    const cleanStart = timing.startTime;
    const cleanEnd = (endTime && !endTime.includes('–') && !endTime.includes(' - ')) ? cleanSingleTime(endTime) : timing.endTime;

    const parseDateTime = (dStr, tStr) => {
      if (!dStr) return new Date();
      const iso = toIsoDateString(dStr);
      const dateObj = new Date(iso);
      if (tStr) {
        const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          let hrs = parseInt(match[1], 10);
          const mins = parseInt(match[2], 10);
          const ampm = match[3];
          if (ampm) {
            if (ampm.toUpperCase() === 'PM' && hrs < 12) hrs += 12;
            if (ampm.toUpperCase() === 'AM' && hrs === 12) hrs = 0;
          }
          dateObj.setHours(hrs, mins, 0, 0);
        }
      }
      return dateObj;
    };

    const startObj = parseDateTime(date, cleanStart);
    const endObj = parseDateTime(date, cleanEnd || cleanStart);
    const startIso = startObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = endObj.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', title || 'IntelliHire Interview');
    url.searchParams.append('details', description || 'Interview scheduled via IntelliHire Recruitment Platform');
    url.searchParams.append('dates', `${startIso}/${endIso}`);
    if (location) url.searchParams.append('location', location);
    return url.toString();
  } catch (e) {
    return 'https://calendar.google.com';
  }
};

// ── Service API ──────────────────────────────────────────────────────────

export const getInterviewSlots = () => {
  try {
    const CLEAN_SLOTS_VERSION = 'v27_four_sessions_sync';
    if (typeof window !== 'undefined' && localStorage.getItem('intellihire_panel_clean_ver') !== CLEAN_SLOTS_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.SLOTS);
      localStorage.setItem('intellihire_panel_clean_ver', CLEAN_SLOTS_VERSION);
    }

    let baseSlots = [];
    const stored = localStorage.getItem(STORAGE_KEYS.SLOTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly filter out open unallocated slots (status AVAILABLE) and phantom duplicate HOLD evaluations
          const validInStored = parsed.filter((s) => {
            if (!s || s.status === 'AVAILABLE') return false;
            // Discard duplicate phantom evaluations with HOLD
            if (s.status === 'COMPLETED' && s.evaluation?.recommendation === 'HOLD') return false;
            return true;
          });
          if (validInStored.length >= 3) {
            baseSlots = validInStored;
          }
        }
      } catch {}
    }
    if (baseSlots.length === 0) {
      baseSlots = [...DEFAULT_SLOTS];
    }

    // Always sanitize baseSlots and strictly deduplicate by candidate name (including completed fallback)
    const deduplicatedSlots = [];
    const seenCandidateNames = new Set();
    baseSlots.forEach((slot) => {
      const parsed = splitTimeRange(slot.startTime, '10:00 AM');
      const cleanEnd = (slot.endTime && !slot.endTime.includes('–') && !slot.endTime.includes(' - ') && slot.endTime !== slot.startTime)
        ? cleanSingleTime(slot.endTime)
        : parsed.endTime;
      const sanitized = {
        ...slot,
        startTime: parsed.startTime,
        endTime: cleanEnd,
      };

      const candNameKey = (sanitized.candidate?.name || sanitized.candidateName || (sanitized.status === 'COMPLETED' ? 'danushka silva' : `slot-${sanitized.id}`)).trim().toLowerCase();
      if (!seenCandidateNames.has(candNameKey)) {
        seenCandidateNames.add(candNameKey);
        deduplicatedSlots.push(sanitized);
      }
    });

    // Ensure all 4 core default sessions exist in baseSlots
    DEFAULT_SLOTS.forEach((defSlot) => {
      const defNameKey = (defSlot.candidate?.name || '').trim().toLowerCase();
      const exists = deduplicatedSlots.some((s) => {
        const sKey = (s.candidate?.name || s.candidateName || (s.status === 'COMPLETED' ? 'danushka silva' : '')).trim().toLowerCase();
        return sKey === defNameKey;
      });
      if (!exists) {
        deduplicatedSlots.push(defSlot);
      }
    });

    baseSlots = deduplicatedSlots;

    // Read live allocations from Candidate Interview Allocation UI (intellihire_allocations)
    const allocJson = localStorage.getItem('intellihire_allocations');
    if (allocJson) {
      try {
        const allocations = JSON.parse(allocJson);
        if (Array.isArray(allocations) && allocations.length > 0) {
          const activeAllocations = allocations.filter((a) => a.status === 'ALLOCATED');

          if (activeAllocations.length > 0) {
            const merged = [];
            const matchedBaseSlotIds = new Set();

            // 1. Keep completed evaluation slots intact from baseSlots (only official HIRE evaluation)
            baseSlots
              .filter((s) => s.status === 'COMPLETED' && s.evaluation?.recommendation !== 'HOLD')
              .forEach((s) => {
                merged.push(s);
                matchedBaseSlotIds.add(s.id);
              });

            activeAllocations.forEach((alloc, idx) => {
              // Match existing slot by candidate ID or Name (excluding already completed evaluation slots)
              const existing = baseSlots.find(
                (s) =>
                  s.status !== 'COMPLETED' &&
                  (s.candidate?.id === alloc.candidateId ||
                    s.candidate?.name?.trim().toLowerCase() === (alloc.candidateName || '').trim().toLowerCase())
              );

              if (existing) {
                matchedBaseSlotIds.add(existing.id);
                // Parse assignedTime or existing time to guarantee separate start and end times
                const rawTime = alloc.assignedTime || existing.startTime || '11:00 AM';
                const parsed = splitTimeRange(rawTime, '11:00 AM');
                const sTime = parsed.startTime;
                let eTime = parsed.endTime;

                if (!alloc.assignedTime && existing.endTime && existing.endTime !== existing.startTime && !existing.endTime.includes('–')) {
                  eTime = cleanSingleTime(existing.endTime);
                }

                merged.push({
                  ...existing,
                  jobPosition: alloc.jobPosition || existing.jobPosition,
                  round: alloc.interviewRound || existing.round,
                  interviewDate: toIsoDateString(alloc.interviewDate || existing.interviewDate),
                  displayDate: alloc.interviewDate || existing.displayDate,
                  startTime: sTime,
                  endTime: eTime,
                  interviewType: alloc.interviewType || existing.interviewType,
                  meetingLocation: alloc.meetingLocation || existing.meetingLocation,
                  meetingId: alloc.meetingId || existing.meetingId,
                  meetingPasscode: alloc.meetingPasscode || existing.meetingPasscode,
                });
              } else {
                // Newly allocated candidate from Candidate Allocation!
                let pm = DEFAULT_PANEL_MEMBERS[idx % DEFAULT_PANEL_MEMBERS.length];
                const roundLower = (alloc.interviewRound || '').toLowerCase();
                const panelLower = (alloc.panelName || '').toLowerCase();
                if (panelLower.includes('dilhani') || panelLower.includes('panel b') || roundLower.includes('design') || roundLower.includes('product')) {
                  pm = DEFAULT_PANEL_MEMBERS[2]; // Dilhani Wickramasinghe
                } else if (panelLower.includes('ruwan') || panelLower.includes('panel c') || roundLower.includes('arch') || roundLower.includes('system') || roundLower.includes('intern') || roundLower.includes('ba')) {
                  pm = DEFAULT_PANEL_MEMBERS[3]; // Ruwan Bandara
                } else if (panelLower.includes('nirosha') || (panelLower.includes('hr') && !panelLower.includes('tech')) || roundLower.includes('culture')) {
                  pm = DEFAULT_PANEL_MEMBERS[1]; // Nirosha HR
                } else {
                  pm = DEFAULT_PANEL_MEMBERS[0]; // Saman Tech
                }

                const parsed = splitTimeRange(alloc.assignedTime || '02:00 PM', '02:00 PM');

                merged.push({
                  id: `slot-alloc-${alloc.candidateId || idx + 10}`,
                  jobPosition: alloc.jobPosition || 'Senior Software Engineer',
                  vacancyId: 'v-1',
                  round: alloc.interviewRound || 'Technical Interview',
                  interviewDate: toIsoDateString(alloc.interviewDate),
                  displayDate: alloc.interviewDate || '20 Nov 2026',
                  startTime: parsed.startTime,
                  endTime: parsed.endTime,
                  interviewType: alloc.interviewType || 'Online',
                  status: 'SCHEDULED',
                  meetingLocation:
                    alloc.meetingLocation ||
                    (alloc.interviewType === 'Physical'
                      ? 'Innovation Hub — Interview Suite 102'
                      : 'https://meet.google.com/new'),
                  meetingId: alloc.meetingId || '',
                  meetingPasscode: alloc.meetingPasscode || '',
                  capacity: 1,
                  bookedCount: 1,
                  panelMember: pm,
                  candidate: {
                    id: alloc.candidateId || `APP-${idx + 10}`,
                    name: alloc.candidateName,
                    email: `${(alloc.candidateName || 'candidate').toLowerCase().replace(/\s+/g, '.')}@example.com`,
                    avatar: CANDIDATE_AVATARS[idx % CANDIDATE_AVATARS.length],
                    matchScore: alloc.score || 80,
                  },
                  additionalNotes: `Allocated via Candidate Allocation for ${alloc.interviewRound || 'technical review'}.`,
                });
              }
            });

            // 2. Preserve any remaining baseSlots (e.g. other scheduled interviews)
            baseSlots.forEach((s) => {
              if (!matchedBaseSlotIds.has(s.id) && s.status !== 'COMPLETED') {
                merged.push(s);
              }
            });

            // Deduplicate merged strictly by candidate name
            const finalMerged = [];
            const mergedSeenNames = new Set();
            merged.forEach((s) => {
              const nameKey = (s.candidate?.name || s.candidateName || (s.status === 'COMPLETED' ? 'danushka silva' : `slot-${s.id}`)).trim().toLowerCase();
              if (!mergedSeenNames.has(nameKey)) {
                mergedSeenNames.add(nameKey);
                finalMerged.push(s);
              }
            });

            // Guarantee all 4 core default slots are present
            DEFAULT_SLOTS.forEach((def) => {
              const defKey = (def.candidate?.name || '').trim().toLowerCase();
              if (!mergedSeenNames.has(defKey)) {
                mergedSeenNames.add(defKey);
                finalMerged.push(def);
              }
            });

            localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(finalMerged));
            return finalMerged;
          }
        }
      } catch (e) {
        console.error('Error syncing intellihire_allocations into slots:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(baseSlots));
    return baseSlots;
  } catch (err) {
    console.error('Failed to load slots from localStorage:', err);
    return DEFAULT_SLOTS;
  }
};

export const saveInterviewSlots = (slots) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  } catch (err) {
    console.error('Failed to save slots to localStorage:', err);
  }
};

export const getRescheduleRequests = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RESCHEDULE_REQUESTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.some(r => r.candidateName?.includes('Sophia') || r.panelMember?.name?.includes('Watson'))) {
        localStorage.removeItem(STORAGE_KEYS.RESCHEDULE_REQUESTS);
      } else {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load reschedule requests:', err);
  }
  localStorage.setItem(STORAGE_KEYS.RESCHEDULE_REQUESTS, JSON.stringify(DEFAULT_RESCHEDULE_REQUESTS));
  return DEFAULT_RESCHEDULE_REQUESTS;
};

export const saveRescheduleRequests = (requests) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RESCHEDULE_REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save reschedule requests:', err);
  }
};

export const getPanelMembers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PANEL_MEMBERS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && (parsed.some(p => p.name?.includes('Watson') || p.name?.includes('Vance')) || !parsed[0]?.availableHours)) {
        localStorage.removeItem(STORAGE_KEYS.PANEL_MEMBERS);
      } else {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load panel members:', err);
  }
  localStorage.setItem(STORAGE_KEYS.PANEL_MEMBERS, JSON.stringify(DEFAULT_PANEL_MEMBERS));
  return DEFAULT_PANEL_MEMBERS;
};

/**
 * Check availability of a panel member for a given date and optional time.
 * Validates against:
 * - Working days (Monday to Friday)
 * - Standard working hours (09:00 AM - 05:00 PM)
 * - Daily interview capacity (maxDailyInterviews, typically 4-5)
 * - Time overlap/conflicts with existing scheduled interviews
 *
 * @param {string|object} panelMemberOrEmail - Panel member object, ID ('pm-1'), or email
 * @param {string} dateStr - Date string (YYYY-MM-DD or display date)
 * @param {string|null} timeStr - Optional start time (e.g. '09:30 AM' or '09:30')
 * @param {Array|null} existingSlots - Optional list of slots; defaults to stored slots
 * @returns {object} Availability details & status indicators
 */
export const checkPanelMemberAvailability = (
  panelMemberOrEmail,
  dateStr,
  timeStr = null,
  existingSlots = null
) => {
  // 1. Resolve panel member
  let member = null;
  if (typeof panelMemberOrEmail === 'object' && panelMemberOrEmail !== null) {
    member = panelMemberOrEmail;
  } else if (typeof panelMemberOrEmail === 'string') {
    const query = panelMemberOrEmail.trim().toLowerCase();
    member = DEFAULT_PANEL_MEMBERS.find(
      (m) =>
        m.id.toLowerCase() === query ||
        m.email.toLowerCase() === query ||
        m.name.toLowerCase() === query ||
        m.name.toLowerCase().includes(query)
    );
  }

  if (!member) {
    member = {
      id: 'pm-custom',
      name: typeof panelMemberOrEmail === 'string' ? panelMemberOrEmail : 'Panel Evaluator',
      email: typeof panelMemberOrEmail === 'string' && panelMemberOrEmail.includes('@') ? panelMemberOrEmail : 'evaluator@company.com',
      role: 'Interview Panel Member',
      department: 'Hiring Team',
      availableHours: '09:00 AM – 05:00 PM',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      maxDailyInterviews: 4,
      status: 'AVAILABLE',
    };
  }

  const maxDaily = member.maxDailyInterviews || 4;
  const targetIso = toIsoDateString(dateStr);

  // 2. Check Day of Week (Weekend check)
  const dParts = targetIso.split('-').map(Number);
  const dObj = new Date(dParts[0], dParts[1] - 1, dParts[2]);
  const dayIndex = isNaN(dObj.getTime()) ? 1 : dObj.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayIndex === 0 || dayIndex === 6;

  // 3. Resolve existing slots
  const allSlots = Array.isArray(existingSlots) ? existingSlots : getInterviewSlots();

  // Find all slots scheduled for this panel member on this date
  const memberSlotsOnDate = allSlots.filter((s) => {
    if (!s) return false;
    const sDateIso = toIsoDateString(s.interviewDate || s.date || s.dateKey);
    if (sDateIso !== targetIso) return false;

    // Check if slot belongs to this member
    const slotMemberId = s.panelMember?.id;
    const slotMemberEmail = (s.panelMember?.email || s.panelEmails || '').toLowerCase();
    const slotMemberName = (s.panelMember?.name || s.panelName || '').toLowerCase();
    const targetEmail = (member.email || '').toLowerCase();
    const targetName = (member.name || '').toLowerCase();

    const matchesId = slotMemberId && slotMemberId === member.id;
    const matchesEmail = targetEmail && slotMemberEmail.includes(targetEmail);
    const matchesName = targetName && (slotMemberName.includes(targetName) || (member.id && s.panelName?.toLowerCase().includes(member.name.toLowerCase())));

    return matchesId || matchesEmail || matchesName;
  });

  const bookedCount = memberSlotsOnDate.length;
  const remainingCount = Math.max(0, maxDaily - bookedCount);

  // Extract booked time ranges for display
  const bookedTimeSlots = memberSlotsOnDate.map((s) => ({
    id: s.id,
    startTime: s.startTime,
    endTime: s.endTime,
    candidateName: s.candidate?.name || s.candidateName || 'Candidate',
    round: s.round || 'Interview',
    status: s.status,
  }));

  // 4. Time Check (if timeStr is provided)
  let timeConflict = null;
  let isOutsideHours = false;

  if (timeStr) {
    const timing = splitTimeRange(timeStr);
    const cleanStart = timing.startTime;

    // Check standard hours (09:00 AM to 05:00 PM)
    const match = cleanStart.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const period = match[3] ? match[3].toUpperCase() : '';
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      const minutesFromMidnight = h * 60 + m;

      // 9:00 AM is 540 min, 5:00 PM (17:00) is 1020 min
      if (minutesFromMidnight < 540 || minutesFromMidnight >= 1020) {
        isOutsideHours = true;
      }
    }

    // Check direct time overlap
    timeConflict = memberSlotsOnDate.find((s) => {
      const sTiming = splitTimeRange(s.startTime);
      return sTiming.startTime.toLowerCase() === cleanStart.toLowerCase();
    });
  }

  // 5. Determine status, badge color, and message
  if (isWeekend) {
    return {
      available: false,
      status: 'OFF_DUTY',
      badgeColor: '#EF4444',
      badgeText: '🔴 Non-working Day (Weekend)',
      message: `${member.name} is off-duty on weekends. Standard working days: Monday – Friday.`,
      bookedCount,
      maxDaily,
      remainingCount: 0,
      availableHours: member.availableHours || '09:00 AM – 05:00 PM',
      hasConflict: false,
      timeConflict: null,
      bookedTimeSlots,
      member,
    };
  }

  if (timeConflict) {
    return {
      available: false,
      status: 'CONFLICT',
      badgeColor: '#EF4444',
      badgeText: '🔴 Schedule Conflict',
      message: `Schedule Conflict: ${member.name} is already assigned at ${timeConflict.startTime} with ${timeConflict.candidate?.name || 'another candidate'}.`,
      bookedCount,
      maxDaily,
      remainingCount,
      availableHours: member.availableHours || '09:00 AM – 05:00 PM',
      hasConflict: true,
      timeConflict,
      bookedTimeSlots,
      member,
    };
  }

  if (isOutsideHours) {
    return {
      available: false,
      status: 'OUTSIDE_HOURS',
      badgeColor: '#F0B90B',
      badgeText: '⚠️ Outside Working Hours',
      message: `Time is outside ${member.name}'s standard working hours (${member.availableHours || '09:00 AM – 05:00 PM'}).`,
      bookedCount,
      maxDaily,
      remainingCount,
      availableHours: member.availableHours || '09:00 AM – 05:00 PM',
      hasConflict: false,
      timeConflict: null,
      bookedTimeSlots,
      member,
    };
  }

  if (bookedCount >= maxDaily) {
    return {
      available: false,
      status: 'FULLY_BOOKED',
      badgeColor: '#EF4444',
      badgeText: `🔴 Fully Booked (${bookedCount}/${maxDaily})`,
      message: `${member.name} has reached maximum daily interview capacity (${maxDaily}/${maxDaily} slots filled).`,
      bookedCount,
      maxDaily,
      remainingCount: 0,
      availableHours: member.availableHours || '09:00 AM – 05:00 PM',
      hasConflict: false,
      timeConflict: null,
      bookedTimeSlots,
      member,
    };
  }

  if (bookedCount > 0) {
    return {
      available: true,
      status: 'PARTIALLY_BOOKED',
      badgeColor: '#F0B90B',
      badgeText: `🟡 Partially Available (${remainingCount} slot${remainingCount > 1 ? 's' : ''} left)`,
      message: `${member.name} is available (${bookedCount}/${maxDaily} booked, ${remainingCount} slot${remainingCount > 1 ? 's' : ''} remaining).`,
      bookedCount,
      maxDaily,
      remainingCount,
      availableHours: member.availableHours || '09:00 AM – 05:00 PM',
      hasConflict: false,
      timeConflict: null,
      bookedTimeSlots,
      member,
    };
  }

  return {
    available: true,
    status: 'AVAILABLE',
    badgeColor: '#22C55E',
    badgeText: `🟢 Available (${maxDaily}/${maxDaily} slots free)`,
    message: `${member.name} is fully available on this date (${member.availableHours || '09:00 AM – 05:00 PM'}).`,
    bookedCount: 0,
    maxDaily,
    remainingCount: maxDaily,
    availableHours: member.availableHours || '09:00 AM – 05:00 PM',
    hasConflict: false,
    timeConflict: null,
    bookedTimeSlots: [],
    member,
  };
};

/**
 * Get overall availability for a panel (which may contain multiple emails/members).
 */
export const getPanelAvailabilitySummary = (
  panelOrEmails,
  dateStr,
  timeStr = null,
  existingSlots = null
) => {
  let emails = [];
  if (typeof panelOrEmails === 'string') {
    emails = panelOrEmails.split(',').map((e) => e.trim()).filter(Boolean);
  } else if (panelOrEmails && panelOrEmails.emails) {
    emails = panelOrEmails.emails.split(',').map((e) => e.trim()).filter(Boolean);
  }

  if (emails.length === 0) {
    emails = ['saman.tech@company.com'];
  }

  const membersAvailability = emails.map((email) =>
    checkPanelMemberAvailability(email, dateStr, timeStr, existingSlots)
  );

  const hasConflict = membersAvailability.some((a) => a.status === 'CONFLICT');
  const hasOutsideHours = membersAvailability.some((a) => a.status === 'OUTSIDE_HOURS');
  const allFullyBooked = membersAvailability.every((a) => a.status === 'FULLY_BOOKED');
  const anyWeekend = membersAvailability.some((a) => a.status === 'OFF_DUTY');

  let overallStatus = 'AVAILABLE';
  let overallBadgeColor = '#22C55E';
  let overallBadgeText = '🟢 Available';

  if (hasConflict) {
    overallStatus = 'CONFLICT';
    overallBadgeColor = '#EF4444';
    overallBadgeText = '🔴 Schedule Conflict';
  } else if (anyWeekend) {
    overallStatus = 'OFF_DUTY';
    overallBadgeColor = '#EF4444';
    overallBadgeText = '🔴 Weekend / Non-working Day';
  } else if (allFullyBooked) {
    overallStatus = 'FULLY_BOOKED';
    overallBadgeColor = '#EF4444';
    overallBadgeText = '🔴 Fully Booked';
  } else if (hasOutsideHours) {
    overallStatus = 'OUTSIDE_HOURS';
    overallBadgeColor = '#F0B90B';
    overallBadgeText = '⚠️ Outside Working Hours';
  } else if (membersAvailability.some((a) => a.status === 'PARTIALLY_BOOKED')) {
    overallStatus = 'PARTIALLY_BOOKED';
    overallBadgeColor = '#F0B90B';
    overallBadgeText = '🟡 Partially Available';
  }

  return {
    overallStatus,
    overallBadgeColor,
    overallBadgeText,
    membersAvailability,
  };
};

/**
 * Submit a new Reschedule Request from a Panel Member
 */
export const submitRescheduleRequest = ({
  slotId,
  panelMember,
  candidateName,
  candidateEmail,
  jobPosition,
  round,
  currentDate,
  currentDisplayDate,
  currentTime,
  reasonCategory,
  detailedReason,
  proposedSlots,
}) => {
  const requests = getRescheduleRequests();
  const slots = getInterviewSlots();

  const newRequest = {
    id: `req-${Date.now()}`,
    slotId,
    requestedBy: 'PANEL_MEMBER',
    panelMember,
    candidateName,
    candidateEmail,
    jobPosition,
    round,
    currentDate,
    currentDisplayDate,
    currentTime,
    reasonCategory,
    detailedReason,
    proposedSlots,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    resolutionNotes: '',
  };

  const updatedRequests = [newRequest, ...requests];
  saveRescheduleRequests(updatedRequests);

  // Update corresponding slot status
  const updatedSlots = slots.map((slot) => {
    if (slot.id === slotId) {
      return {
        ...slot,
        status: 'RESCHEDULE_REQUESTED',
      };
    }
    return slot;
  });
  saveInterviewSlots(updatedSlots);

  try {
    interviewApi.createRescheduleRequest({
      slotId,
      requestedBy: 'PANEL_MEMBER',
      panelMember,
      candidateName,
      candidateEmail,
      jobPosition,
      round,
      currentDate,
      currentTime,
      reasonCategory,
      detailedReason,
      proposedSlots,
    }).catch(() => {});
  } catch (_) {}

  return { success: true, request: newRequest };
};

/**
 * Synchronize approved/rescheduled interview time & date to candidate allocation results in localStorage
 */
export const syncRescheduledAllocation = ({
  slotId,
  candidateName,
  candidateId,
  newDate,
  newDisplayDate,
  newStartTime,
  newEndTime,
}) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const rawAlloc = localStorage.getItem('intellihire_allocations');
    const allocations = rawAlloc ? JSON.parse(rawAlloc) : [];

    const cleanDisplayDate = toDisplayDateString(newDisplayDate || newDate);
    const cleanStart = cleanSingleTime(newStartTime);
    const cleanEnd = cleanSingleTime(newEndTime) || getEndTime(cleanStart);
    const timeRangeStr = `${cleanStart} – ${cleanEnd}`;

    const candNameClean = (candidateName || '').trim().toLowerCase();
    const candIdClean = (candidateId || '').trim().toLowerCase();
    const slotIdStr = String(slotId || '').toLowerCase();

    let matched = false;
    const nextAllocations = (Array.isArray(allocations) ? allocations : []).map((alloc) => {
      const matchByName = candNameClean && (alloc.candidateName || '').trim().toLowerCase() === candNameClean;
      const matchById = candIdClean && (alloc.candidateId || '').trim().toLowerCase() === candIdClean;
      const matchBySlot = slotIdStr && (
        String(alloc.slotId || '').toLowerCase() === slotIdStr ||
        String(alloc.slotId || '').toLowerCase() === `slot-${slotIdStr}` ||
        slotIdStr.includes(String(alloc.slotId || '').toLowerCase())
      );

      if (matchByName || matchById || matchBySlot) {
        matched = true;
        return {
          ...alloc,
          interviewDate: cleanDisplayDate || alloc.interviewDate,
          rawDate: newDate || alloc.rawDate,
          assignedTime: timeRangeStr,
          startTime: cleanStart,
          endTime: cleanEnd,
          assignedEndTime: cleanEnd,
        };
      }
      return alloc;
    });

    if (matched) {
      localStorage.setItem('intellihire_allocations', JSON.stringify(nextAllocations));
    }

    // Also update custom slots if present
    const rawCustom = localStorage.getItem('intellihire_custom_slots');
    if (rawCustom) {
      try {
        const customSlots = JSON.parse(rawCustom);
        if (Array.isArray(customSlots)) {
          const nextCustom = customSlots.map((cs) => {
            if (
              String(cs.id) === slotIdStr ||
              `slot-${cs.id}`.toLowerCase() === slotIdStr ||
              (candNameClean && (cs.assignedCandidate?.name || '').trim().toLowerCase() === candNameClean)
            ) {
              return {
                ...cs,
                date: cleanDisplayDate || cs.date,
                dateShort: cleanDisplayDate ? cleanDisplayDate.slice(0, 6) : cs.dateShort,
                time: cleanStart,
                startTime: cleanStart,
                end: cleanEnd,
                endTime: cleanEnd,
              };
            }
            return cs;
          });
          localStorage.setItem('intellihire_custom_slots', JSON.stringify(nextCustom));
        }
      } catch (e) {}
    }

    // Notify all open pages / components listening to intellihire_slots_updated
    window.dispatchEvent(new CustomEvent('intellihire_slots_updated', {
      detail: { source: 'approveReschedule', candidateName, newDate: cleanDisplayDate, assignedTime: timeRangeStr }
    }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to sync rescheduled allocation to localStorage:', err);
  }
};

/**
 * Approve a Reschedule Request and Auto-Update the Slot
 */
export const approveRescheduleRequest = (requestId, selectedProposedSlot, recruiterNotes = '') => {
  const requests = getRescheduleRequests();
  const slots = getInterviewSlots();

  const request = requests.find((r) => r.id === requestId);
  if (!request) return { success: false, error: 'Request not found' };

  // Update request
  const updatedRequests = requests.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: 'APPROVED',
        resolvedAt: new Date().toISOString(),
        acceptedSlot: selectedProposedSlot,
        resolutionNotes: recruiterNotes || `Approved proposed slot: ${selectedProposedSlot.displayDate} from ${selectedProposedSlot.startTime} to ${selectedProposedSlot.endTime}`,
      };
    }
    return r;
  });
  saveRescheduleRequests(updatedRequests);

  // Update the slot
  let targetSlot = null;
  const updatedSlots = slots.map((slot) => {
    if (slot.id === request.slotId) {
      targetSlot = slot;
      return {
        ...slot,
        interviewDate: selectedProposedSlot.date,
        displayDate: selectedProposedSlot.displayDate,
        startTime: selectedProposedSlot.startTime,
        endTime: selectedProposedSlot.endTime,
        status: 'RESCHEDULED',
        lastRescheduledAt: new Date().toISOString(),
      };
    }
    return slot;
  });
  saveInterviewSlots(updatedSlots);

  // Sync updated date & time to Candidate Allocation Results table (intellihire_allocations)
  syncRescheduledAllocation({
    slotId: request.slotId,
    candidateName: request.candidateName || targetSlot?.candidate?.name,
    candidateId: targetSlot?.candidate?.id,
    newDate: selectedProposedSlot.date,
    newDisplayDate: selectedProposedSlot.displayDate,
    newStartTime: selectedProposedSlot.startTime,
    newEndTime: selectedProposedSlot.endTime,
  });

  try {
    interviewApi.approveRescheduleRequestApi(requestId, {
      selectedProposedSlot,
      recruiterNotes,
    }).catch(() => {});
  } catch (_) {}

  return { success: true, updatedRequest: updatedRequests.find((r) => r.id === requestId) };
};

/**
 * Decline / Reject a Reschedule Request
 */
export const rejectRescheduleRequest = (requestId, rejectionReason = '') => {
  const requests = getRescheduleRequests();
  const slots = getInterviewSlots();

  const request = requests.find((r) => r.id === requestId);
  if (!request) return { success: false, error: 'Request not found' };

  // Update request
  const updatedRequests = requests.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: 'REJECTED',
        resolvedAt: new Date().toISOString(),
        resolutionNotes: rejectionReason || 'Declined due to scheduling constraints. Original slot remains active.',
      };
    }
    return r;
  });
  saveRescheduleRequests(updatedRequests);

  // Reset slot status to SCHEDULED
  const updatedSlots = slots.map((slot) => {
    if (slot.id === request.slotId) {
      return {
        ...slot,
        status: 'SCHEDULED',
      };
    }
    return slot;
  });
  saveInterviewSlots(updatedSlots);

  try {
    interviewApi.rejectRescheduleRequestApi(requestId, {
      rejectionReason,
    }).catch(() => {});
  } catch (_) {}

  return { success: true };
};

/**
 * Custom Reschedule: Assign a custom date & time
 */
export const customRescheduleSlot = (requestId, customSlotData, notes = '') => {
  const requests = getRescheduleRequests();
  const slots = getInterviewSlots();

  const request = requests.find((r) => r.id === requestId);
  if (!request) return { success: false, error: 'Request not found' };

  const updatedRequests = requests.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: 'APPROVED',
        resolvedAt: new Date().toISOString(),
        acceptedSlot: customSlotData,
        resolutionNotes: notes || `Custom slot assigned by recruiter: ${customSlotData.displayDate} (${customSlotData.startTime} - ${customSlotData.endTime})`,
      };
    }
    return r;
  });
  saveRescheduleRequests(updatedRequests);

  let targetSlot = null;
  const updatedSlots = slots.map((slot) => {
    if (slot.id === request.slotId) {
      targetSlot = slot;
      return {
        ...slot,
        interviewDate: customSlotData.date,
        displayDate: customSlotData.displayDate,
        startTime: customSlotData.startTime,
        endTime: customSlotData.endTime,
        meetingLocation: customSlotData.meetingLocation || slot.meetingLocation,
        status: 'RESCHEDULED',
        lastRescheduledAt: new Date().toISOString(),
      };
    }
    return slot;
  });
  saveInterviewSlots(updatedSlots);

  // Sync updated date & time to Candidate Allocation Results table (intellihire_allocations)
  syncRescheduledAllocation({
    slotId: request.slotId,
    candidateName: request.candidateName || targetSlot?.candidate?.name,
    candidateId: targetSlot?.candidate?.id,
    newDate: customSlotData.date,
    newDisplayDate: customSlotData.displayDate,
    newStartTime: customSlotData.startTime,
    newEndTime: customSlotData.endTime,
  });

  try {
    interviewApi.customRescheduleSlotApi(requestId, {
      customSlotData,
      notes,
    }).catch(() => {});
  } catch (_) {}

  return { success: true };
};

export { interviewApi };
