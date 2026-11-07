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

// Initial Mock Panel Members - Single Consistent List
export const DEFAULT_PANEL_MEMBERS = [
  {
    id: 'pm-1',
    name: 'Saman Tech',
    email: 'saman.tech@company.com',
    role: 'Technical Lead & Interviewer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialties: ['React', 'Node.js', 'System Architecture'],
  },
  {
    id: 'pm-2',
    name: 'Nirosha HR',
    email: 'nirosha.hr@company.com',
    role: 'HR Manager & Culture Fit Interviewer',
    department: 'Human Resources',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialties: ['HR Screening', 'Culture Fit', 'Portfolio Review'],
  },
  {
    id: 'pm-3',
    name: 'Dilhani Wickramasinghe',
    email: 'dilhani.w@company.com',
    role: 'Talent Acquisition Lead',
    department: 'Talent Acquisition',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    specialties: ['Talent Sourcing', 'Behavioral Interview', 'Leadership'],
  },
  {
    id: 'pm-4',
    name: 'Ruwan Bandara',
    email: 'ruwan.b@company.com',
    role: 'Principal Engineer & System Architect',
    department: 'Platform Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialties: ['Distributed Systems', 'Cloud & DevOps', 'Database Architecture'],
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
    meetingLocation: 'https://meet.google.com/intelli-tech-round',
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
    additionalNotes: 'Live coding session completed. Architecture evaluation and problem-solving interview.',
    evaluation: {
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
    interviewDate: '2026-11-02',
    displayDate: '02 Nov 2026',
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
    interviewDate: '2026-11-04',
    displayDate: '04 Nov 2026',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    interviewType: 'Online',
    status: 'SCHEDULED', // UPCOMING FUTURE DATE - Evaluation is LOCKED
    meetingLocation: 'https://meet.google.com/intelli-architecture-eval',
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
    currentDate: '2026-11-02',
    currentDisplayDate: '02 Nov 2026',
    currentTime: '02:00 PM - 03:00 PM',
    reasonCategory: 'Schedule Conflict / Urgent Meeting',
    detailedReason: 'Prior urgent leadership sync scheduled at this time. Requesting to reschedule to an alternative slot.',
    proposedSlots: [
      {
        id: 'prop-1',
        date: '2026-11-05',
        displayDate: '05 Nov 2026',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
      },
      {
        id: 'prop-2',
        date: '2026-11-06',
        displayDate: '06 Nov 2026',
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
    let baseSlots = [];
    const stored = localStorage.getItem(STORAGE_KEYS.SLOTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseSlots = parsed;
        }
      } catch {}
    }
    if (baseSlots.length === 0) {
      baseSlots = [...DEFAULT_SLOTS];
    }

    // Always sanitize baseSlots so startTime and endTime are never corrupted or duplicated
    baseSlots = baseSlots.map((slot) => {
      const parsed = splitTimeRange(slot.startTime, '10:00 AM');
      const cleanEnd = (slot.endTime && !slot.endTime.includes('–') && !slot.endTime.includes(' - ') && slot.endTime !== slot.startTime)
        ? cleanSingleTime(slot.endTime)
        : parsed.endTime;
      return {
        ...slot,
        startTime: parsed.startTime,
        endTime: cleanEnd,
      };
    });

    // Read live allocations from Candidate Interview Allocation UI (intellihire_allocations)
    const allocJson = localStorage.getItem('intellihire_allocations');
    if (allocJson) {
      try {
        const allocations = JSON.parse(allocJson);
        if (Array.isArray(allocations)) {
          if (allocations.length === 0) {
            localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify([]));
            return [];
          }
          const activeAllocations = allocations.filter((a) => a.status === 'ALLOCATED');

          if (activeAllocations.length > 0) {
            const merged = [];

            activeAllocations.forEach((alloc, idx) => {
              // Match existing slot by candidate ID or Name
              const existing = baseSlots.find(
                (s) =>
                  s.candidate?.id === alloc.candidateId ||
                  s.candidate?.name?.trim().toLowerCase() === (alloc.candidateName || '').trim().toLowerCase()
              );

              if (existing) {
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
                });
              } else {
                // Newly allocated candidate from Candidate Allocation!
                let pm = DEFAULT_PANEL_MEMBERS[idx % DEFAULT_PANEL_MEMBERS.length];
                const roundLower = (alloc.interviewRound || '').toLowerCase();
                if (roundLower.includes('hr') || roundLower.includes('culture') || roundLower.includes('portfolio')) {
                  pm = DEFAULT_PANEL_MEMBERS[1]; // Nirosha HR
                } else if (roundLower.includes('arch') || roundLower.includes('system') || roundLower.includes('lead')) {
                  pm = DEFAULT_PANEL_MEMBERS[3]; // Ruwan Bandara
                } else if (roundLower.includes('design') || roundLower.includes('product')) {
                  pm = DEFAULT_PANEL_MEMBERS[2]; // Dilhani Wickramasinghe
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
                  displayDate: alloc.interviewDate || '05 Nov 2026',
                  startTime: parsed.startTime,
                  endTime: parsed.endTime,
                  interviewType: alloc.interviewType || 'Online',
                  status: 'SCHEDULED',
                  meetingLocation:
                    alloc.interviewType === 'Physical'
                      ? 'Innovation Hub — Interview Suite 102'
                      : 'https://meet.google.com/intelli-tech-round',
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

            localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(merged));
            return merged;
          }
        }
      } catch (e) {
        console.error('Error syncing intellihire_allocations into slots:', e);
      }
    }

    return baseSlots;
  } catch (err) {
    console.error('Failed to load slots from localStorage:', err);
    return DEFAULT_SLOTS;
  }
};

export const saveInterviewSlots = (slots) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    if (Array.isArray(slots) && slots.length > 0) {
      interviewApi.bulkCreateInterviewSlots(slots).catch(() => {});
    }
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
      if (Array.isArray(parsed) && parsed.some(p => p.name?.includes('Watson') || p.name?.includes('Vance'))) {
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
