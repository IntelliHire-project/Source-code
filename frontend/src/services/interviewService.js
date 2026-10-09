/**
 * Interview & Reschedule Service for IntelliHire
 * Manages interview slots, panel member assignments, and the full lifecycle
 * of interview rescheduling requests.
 */

const STORAGE_KEYS = {
  SLOTS: 'intellihire_interview_slots',
  RESCHEDULE_REQUESTS: 'intellihire_reschedule_requests',
  PANEL_MEMBERS: 'intellihire_panel_members',
};

// Initial Mock Panel Members
export const DEFAULT_PANEL_MEMBERS = [
  {
    id: 'pm-1',
    name: 'Dr. Emily Watson',
    email: 'emily.watson@intellihire.com',
    role: 'Lead AI Engineer & Technical Interviewer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialties: ['Machine Learning', 'Python', 'System Architecture'],
  },
  {
    id: 'pm-2',
    name: 'Marcus Vance',
    email: 'marcus.vance@intellihire.com',
    role: 'Senior Fullstack Architect',
    department: 'Platform Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialties: ['React', 'Node.js', 'Distributed Systems'],
  },
  {
    id: 'pm-3',
    name: 'Sarah Chen',
    email: 'sarah.chen@intellihire.com',
    role: 'Director of Product Engineering',
    department: 'Management',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    specialties: ['Culture Fit', 'Leadership', 'System Design'],
  },
];

// Initial Mock Interview Slots with Panel Members assigned
export const DEFAULT_SLOTS = [
  {
    id: 1,
    jobPosition: 'Senior Fullstack Engineer',
    vacancyId: 'v-1',
    round: 'Technical Round',
    interviewDate: '2026-10-14',
    displayDate: '14 Oct 2026',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    interviewType: 'Online',
    status: 'SCHEDULED', // SCHEDULED, RESCHEDULE_REQUESTED, RESCHEDULED, COMPLETED, CANCELLED
    meetingLocation: 'https://meet.google.com/abc-tech-interview',
    capacity: 1,
    bookedCount: 1,
    panelMember: DEFAULT_PANEL_MEMBERS[1], // Marcus Vance
    candidate: {
      id: 'c-101',
      name: 'Alexander Wright',
      email: 'alex.wright@example.com',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      matchScore: 94,
    },
    additionalNotes: 'Focus on React performance, Redux, Node.js concurrency, and PostgreSQL indexing.',
  },
  {
    id: 2,
    jobPosition: 'Lead AI Engineer',
    vacancyId: 'v-2',
    round: 'Deep Learning & NLP Round',
    interviewDate: '2026-10-15',
    displayDate: '15 Oct 2026',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    interviewType: 'Online',
    status: 'RESCHEDULE_REQUESTED',
    meetingLocation: 'https://meet.google.com/ai-nlp-interview',
    capacity: 1,
    bookedCount: 1,
    panelMember: DEFAULT_PANEL_MEMBERS[0], // Dr. Emily Watson
    candidate: {
      id: 'c-102',
      name: 'Sophia Rodriguez',
      email: 'sophia.r@example.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      matchScore: 91,
    },
    additionalNotes: 'Review transformer fine-tuning experience, spaCy, and PyTorch deployment.',
  },
  {
    id: 3,
    jobPosition: 'DevOps & Cloud Specialist',
    vacancyId: 'v-3',
    round: 'System Architecture & Final Panel',
    interviewDate: '2026-10-16',
    displayDate: '16 Oct 2026',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    interviewType: 'Online',
    status: 'SCHEDULED',
    meetingLocation: 'https://meet.google.com/cloud-arch-eval',
    capacity: 1,
    bookedCount: 1,
    panelMember: DEFAULT_PANEL_MEMBERS[2], // Sarah Chen
    candidate: {
      id: 'c-103',
      name: 'Daniel Kim',
      email: 'daniel.kim@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      matchScore: 88,
    },
    additionalNotes: 'Evaluate Kubernetes cluster provisioning, CI/CD pipeline reliability, and Docker security.',
  },
  {
    id: 4,
    jobPosition: 'Senior Fullstack Engineer',
    vacancyId: 'v-1',
    round: 'System Design',
    interviewDate: '2026-10-18',
    displayDate: '18 Oct 2026',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    interviewType: 'Online',
    status: 'SCHEDULED',
    meetingLocation: 'https://meet.google.com/fullstack-system-design',
    capacity: 1,
    bookedCount: 1,
    panelMember: DEFAULT_PANEL_MEMBERS[1], // Marcus Vance
    candidate: {
      id: 'c-104',
      name: 'Liam O\'Connor',
      email: 'liam.oc@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      matchScore: 96,
    },
    additionalNotes: 'Microservices event streaming with Kafka, database partitioning, and caching strategies.',
  },
];

// Initial Mock Reschedule Requests
export const DEFAULT_RESCHEDULE_REQUESTS = [
  {
    id: 'req-201',
    slotId: 2,
    requestedBy: 'PANEL_MEMBER', // 'PANEL_MEMBER' or 'CANDIDATE'
    panelMember: DEFAULT_PANEL_MEMBERS[0],
    candidateName: 'Sophia Rodriguez',
    candidateEmail: 'sophia.r@example.com',
    jobPosition: 'Lead AI Engineer',
    round: 'Deep Learning & NLP Round',
    currentDate: '2026-10-15',
    currentDisplayDate: '15 Oct 2026',
    currentTime: '11:00 AM - 12:00 PM',
    reasonCategory: 'Schedule Conflict / Urgent Meeting',
    detailedReason: 'I have an unavoidable keynote presentation and sprint demo at 11:00 AM on 15 Oct. Kindly reschedule to one of my proposed alternative slots.',
    proposedSlots: [
      {
        id: 'prop-1',
        date: '2026-10-16',
        displayDate: '16 Oct 2026',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
      },
      {
        id: 'prop-2',
        date: '2026-10-16',
        displayDate: '16 Oct 2026',
        startTime: '03:30 PM',
        endTime: '04:30 PM',
      },
      {
        id: 'prop-3',
        date: '2026-10-17',
        displayDate: '17 Oct 2026',
        startTime: '09:30 AM',
        endTime: '10:30 AM',
      },
    ],
    status: 'PENDING', // 'PENDING', 'APPROVED', 'REJECTED'
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    resolutionNotes: '',
  },
];

// Helper: Generate Google Calendar URL
export const generateGoogleCalendarLink = ({ title, description, date, startTime, endTime, location }) => {
  try {
    const parseDateTime = (dStr, tStr) => {
      if (!dStr) return new Date();
      const dateObj = new Date(dStr);
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

    const startObj = parseDateTime(date, startTime);
    const endObj = parseDateTime(date, endTime || startTime);
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
    const stored = localStorage.getItem(STORAGE_KEYS.SLOTS);
    if (stored) return JSON.parse(stored);
  } catch (err) {
    console.error('Failed to load slots from localStorage:', err);
  }
  localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(DEFAULT_SLOTS));
  return DEFAULT_SLOTS;
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
    if (stored) return JSON.parse(stored);
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
    if (stored) return JSON.parse(stored);
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

  return { success: true, request: newRequest };
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
  const updatedSlots = slots.map((slot) => {
    if (slot.id === request.slotId) {
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

  const updatedSlots = slots.map((slot) => {
    if (slot.id === request.slotId) {
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

  return { success: true };
};
