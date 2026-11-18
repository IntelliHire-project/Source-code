import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Pencil,
  Plus,
  Trash2,
  Users,
  Calendar,
  CalendarPlus,
  ExternalLink,
  Video,
  Building,
  Clock,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Send,
  X,
  ChevronRight,
  Check,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import AdminToast from '../../../components/common/AdminToast';
import '../../../style.css';
import './InterviewTimeSlotManagement.css';
import '../../../components/common/VacancySelectorModal.css';
import { VACANCIES } from '../../../data/vacancies';
import { MOCK_CANDIDATES, enrichCandidateDetails, CandidateDetailView } from '../RankedApplicants/RankedApplicants';
import {
  getRescheduleRequests,
  approveRescheduleRequest,
  rejectRescheduleRequest,
  customRescheduleSlot,
  getInterviewSlots,
  saveInterviewSlots,
  getEndTime,
} from '../../../services/interviewService';
import {
  fetchInterviewSlots,
  createInterviewSlot,
  updateInterviewSlot,
  deleteInterviewSlot,
} from '../../../api/interviewApi';
import { INITIAL_CANDIDATES, INITIAL_ALLOCATIONS, resetToDefaultMockData, formatPanelDisplayName } from '../InterviewAllocation/CandidateInterviewAllocation';

const CLEAN_STORAGE_VERSION = 'v13_valid_meet_links';
(() => {
  try {
    if (typeof window !== 'undefined') {
      const isNewSession = !sessionStorage.getItem('intellihire_recruiter_session');
      const isOutdatedVersion = localStorage.getItem('intellihire_clean_version') !== CLEAN_STORAGE_VERSION;
      if (isNewSession || isOutdatedVersion) {
        if (typeof resetToDefaultMockData === 'function') {
          resetToDefaultMockData();
        } else {
          localStorage.setItem('intellihire_allocations', JSON.stringify(INITIAL_ALLOCATIONS));
          localStorage.setItem('intellihire_candidates', JSON.stringify(INITIAL_CANDIDATES));
          localStorage.removeItem('intellihire_custom_slots');
          localStorage.removeItem('intellihire_interview_slots');
          localStorage.removeItem('intellihire_active_vacancy');
          localStorage.removeItem('intellihire_reschedule_requests');
          localStorage.setItem('intellihire_clean_version', CLEAN_STORAGE_VERSION);
          sessionStorage.setItem('intellihire_recruiter_session', 'active');
        }
      }
    }
  } catch { }
})();

// ── Google Calendar URL Helper ─────────────────────────────────────────────
const generateGoogleCalendarUrl = ({ title, description, interviewDate, startTime, endTime, location }) => {
  try {
    const parseDateTime = (dStr, tStr) => {
      if (!dStr) return new Date();
      const dateObj = new Date(dStr.includes('-') ? dStr : dStr);
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
    const startObj = parseDateTime(interviewDate, startTime);
    const endObj = parseDateTime(interviewDate, endTime || startTime);
    const startIso = startObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = endObj.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', title || 'IntelliHire Interview');
    url.searchParams.append('details', description || 'Interview scheduled via IntelliHire Platform');
    url.searchParams.append('dates', `${startIso}/${endIso}`);
    if (location) url.searchParams.append('location', location);
    return url.toString();
  } catch (e) {
    return 'https://calendar.google.com';
  }
};

const initialSlots = [
  {
    id: 1,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Technical',
    interviewDate: '23 Oct 2026',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    interviewType: 'Online',
    capacity: 5,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/sde-conf-mtg',
    additionalNotes: 'Focus on React state management and Node.js microservices architecture.',
    bookedCount: 2,
    isPast: true,
  },
  {
    id: 7,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'System Design',
    interviewDate: '02 Nov 2026',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    interviewType: 'Online',
    capacity: 4,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/fst-arch-rev',
    additionalNotes: 'Architecture discussion covering scalability, APIs, and database design.',
    bookedCount: 1,
  },
  {
    id: 8,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Final Panel',
    interviewDate: '05 Nov 2026',
    startTime: '01:30 PM',
    endTime: '02:30 PM',
    interviewType: 'Physical',
    capacity: 3,
    status: 'AVAILABLE',
    meetingLocation: 'Engineering Conference Room, 2nd Floor',
    additionalNotes: 'Final discussion with the engineering manager and technical panel.',
    bookedCount: 1,
  },
  {
    id: 9,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Technical',
    interviewDate: '06 Nov 2026',
    startTime: '09:30 AM',
    endTime: '10:30 AM',
    interviewType: 'Online',
    capacity: 5,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/eng-tech-int',
    additionalNotes: 'Coding and debugging exercise focused on React and Node.js.',
    bookedCount: 2,
  },
  {
    id: 10,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Backend Deep Dive',
    interviewDate: '10 Nov 2026',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    interviewType: 'Physical',
    capacity: 4,
    status: 'AVAILABLE',
    meetingLocation: 'Engineering Interview Room 1',
    additionalNotes: 'API design, database performance, and service reliability discussion.',
    bookedCount: 1,
  },
  {
    id: 11,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Frontend Architecture',
    interviewDate: '12 Nov 2026',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    interviewType: 'Online',
    capacity: 4,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/fnd-arch-dsk',
    additionalNotes: 'Frontend architecture, accessibility, performance, and testing discussion.',
    bookedCount: 1,
  },
  {
    id: 2,
    jobPosition: 'UI/UX Designer',
    round: 'HR Portfolio Review',
    interviewDate: '02 Nov 2026',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    interviewType: 'Physical',
    capacity: 3,
    status: 'AVAILABLE',
    meetingLocation: 'Conference Room B, 3rd Floor, Main HQ',
    additionalNotes: 'Candidate should bring printed portfolio or tablet presentation.',
    bookedCount: 1,
  },
  {
    id: 3,
    jobPosition: 'QA Automation Engineer',
    round: 'Final Cultural Fit',
    interviewDate: '04 Nov 2026',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    interviewType: 'Online',
    capacity: 4,
    status: 'AVAILABLE',
    meetingLocation: 'https://zoom.us/j/987654321',
    additionalNotes: 'Evaluation completed by Lead QA Manager. Panel feedback recorded.',
    bookedCount: 1,
  },
  {
    id: 4,
    jobPosition: 'Business Analyst',
    round: 'Technical Case Study',
    interviewDate: '05 Nov 2026',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    interviewType: 'Physical',
    capacity: 2,
    status: 'AVAILABLE',
    meetingLocation: 'Interview Suite 102, Innovation Hub',
    additionalNotes: 'Case study brief will be handed over 15 mins prior to commencement.',
    bookedCount: 1,
  },
  {
    id: 5,
    jobPosition: 'Product Manager',
    round: 'HR Screening',
    interviewDate: '06 Nov 2026',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    interviewType: 'Online',
    capacity: 6,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/pms-scnr-omx',
    additionalNotes: 'Initial background screening and career roadmap alignment.',
    bookedCount: 2,
  },
  {
    id: 6,
    jobPosition: 'DevOps Lead',
    round: 'Architecture Final',
    interviewDate: '09 Nov 2026',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    interviewType: 'Physical',
    capacity: 3,
    status: 'AVAILABLE',
    meetingLocation: 'Executive Boardroom A',
    additionalNotes: 'Whiteboard system design challenge with VP of Engineering.',
    bookedCount: 1,
  },
  {
    id: 12,
    jobPosition: 'Product Designer',
    round: 'Technical Interview',
    interviewDate: '04 Nov 2026',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    interviewType: 'Online',
    capacity: 4,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/pdr-dsgn-rev',
    additionalNotes: 'Portfolio review, design system critique, and UX problem-solving.',
    bookedCount: 1,
  },
  {
    id: 13,
    jobPosition: 'Product Designer',
    round: 'HR Screening',
    interviewDate: '06 Nov 2026',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    interviewType: 'Physical',
    capacity: 3,
    status: 'AVAILABLE',
    meetingLocation: 'Design Studio 4A, Creative Wing',
    additionalNotes: 'Discussion on design process, collaboration with cross-functional teams.',
    bookedCount: 0,
  },
];

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTomorrowInputValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultVacancy = 'Senior Software Engineer';

export const generateValidMeetingUrl = (platform = 'Google Meet') => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const getPart = (len) => Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  if (platform === 'Microsoft Teams') {
    const threadId = Math.random().toString(36).substring(2, 8);
    return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${threadId}%40thread.v2/0`;
  }
  if (platform === 'Zoom') {
    const zoomId = Math.floor(1000000000 + Math.random() * 9000000000);
    return `https://zoom.us/j/${zoomId}?pwd=intelli${Math.floor(100 + Math.random() * 900)}`;
  }
  // Google Meet strictly enforces 3-4-3 lowercase letters: xxx-yyyy-zzz
  return `https://meet.google.com/${getPart(3)}-${getPart(4)}-${getPart(3)}`;
};

function isSlotTimeInPast(slotDate, slotTimeStr) {
  if (!slotDate || !slotTimeStr) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (slotDate < todayStr) return true;
  if (slotDate > todayStr) return false;
  const currentMinutes = today.getHours() * 60 + today.getMinutes();
  let slotMinutes = 0;
  const match = slotTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : '';
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    slotMinutes = h * 60 + m;
  }
  return slotMinutes <= currentMinutes;
}

const emptyForm = {
  jobPosition: defaultVacancy,
  interviewRound: 'Technical Interview',
  customRoundName: '',
  interviewMedia: 'Google Meet',
  interviewType: 'Online',
  interviewDate: new Date().getHours() >= 17 ? getTomorrowInputValue() : getTodayInputValue(),
  startTime: '09:00',
  endTime: '10:00',
  capacity: '3',
  panelName: 'Panel A (Technical Leads)',
  panelEmails: 'saman.tech@company.com, nirosha.hr@company.com',
  meetingLocation: '',
  additionalNotes: '',
};

export const CANDIDATES_BY_ROLE = {
  'Senior Software Engineer': [
    { id: 'APP-001', name: 'Alice Fernando', score: 88, status: 'ALLOCATED', email: 'alice.f@example.com', role: 'Senior Software Engineer' },
    { id: 'APP-002', name: 'Kamal Perera', score: 82, status: 'ALLOCATED', email: 'kamal.p@example.com', role: 'Senior Software Engineer' },
    { id: 'APP-003', name: 'Nimal Silva', score: 79, status: 'ALLOCATED', email: 'nimal.s@example.com', role: 'Senior Software Engineer' },
    { id: 'APP-004', name: 'Dinesh Mendis', score: 76, status: 'SHORTLISTED', email: 'dinesh.m@example.com', role: 'Senior Software Engineer' },
    { id: 'APP-005', name: 'Sanduni Wickramasinghe', score: 74, status: 'SHORTLISTED', email: 'sanduni.w@example.com', role: 'Senior Software Engineer' },
    { id: 'APP-006', name: 'Ishara Gunasekara', score: 72, status: 'SHORTLISTED', email: 'ishara.g@example.com', role: 'Senior Software Engineer' },
    { id: 'APP-007', name: 'Malith Senanayake', score: 70, status: 'SHORTLISTED', email: 'malith.s@example.com', role: 'Senior Software Engineer' },
    { id: 'APP-008', name: 'Tharindu Rathnayake', score: 68, status: 'SHORTLISTED', email: 'tharindu.r@example.com', role: 'Senior Software Engineer' },
    { id: 'APP-009', name: 'Kasun Wijesinghe', score: 65, status: 'SHORTLISTED', email: 'kasun.w@example.com', role: 'Senior Software Engineer' },
  ],
  'Senior Fullstack Engineer': [
    { id: 'APP-001', name: 'Alice Fernando', score: 88, status: 'ALLOCATED', email: 'alice.f@example.com', role: 'Senior Fullstack Engineer' },
    { id: 'APP-002', name: 'Kamal Perera', score: 82, status: 'ALLOCATED', email: 'kamal.p@example.com', role: 'Senior Fullstack Engineer' },
    { id: 'APP-003', name: 'Nimal Silva', score: 79, status: 'ALLOCATED', email: 'nimal.s@example.com', role: 'Senior Fullstack Engineer' },
    { id: 'APP-004', name: 'Dinesh Mendis', score: 76, status: 'SHORTLISTED', email: 'dinesh.m@example.com', role: 'Senior Fullstack Engineer' },
  ],
  'Senior Frontend Engineer': [
    { id: 'APP-001', name: 'Alice Fernando', score: 88, status: 'ALLOCATED', email: 'alice.f@example.com', role: 'Senior Frontend Engineer' },
    { id: 'APP-004', name: 'Dinesh Mendis', score: 76, status: 'SHORTLISTED', email: 'dinesh.m@example.com', role: 'Senior Frontend Engineer' },
  ],
  'Backend Engineer': [
    { id: 'APP-002', name: 'Kamal Perera', score: 82, status: 'ALLOCATED', email: 'kamal.p@example.com', role: 'Backend Engineer' },
    { id: 'APP-004', name: 'Dinesh Mendis', score: 76, status: 'SHORTLISTED', email: 'dinesh.m@example.com', role: 'Backend Engineer' },
    { id: 'APP-009', name: 'Kasun Wijesinghe', score: 65, status: 'SHORTLISTED', email: 'kasun.w@example.com', role: 'Backend Engineer' },
  ],
  'DevOps Engineer': [
    { id: 'APP-009', name: 'Kasun Wijesinghe', score: 65, status: 'SHORTLISTED', email: 'kasun.w@example.com', role: 'DevOps Engineer' },
  ],
  'DevOps Lead': [
    { id: 'APP-009', name: 'Kasun Wijesinghe', score: 65, status: 'SHORTLISTED', email: 'kasun.w@example.com', role: 'DevOps Lead' },
  ],
  'UI/UX Designer': [
    { id: 'APP-005', name: 'Sanduni Wickramasinghe', score: 74, status: 'SHORTLISTED', email: 'sanduni.w@example.com', role: 'UI/UX Designer' },
    { id: 'APP-006', name: 'Ishara Gunasekara', score: 72, status: 'SHORTLISTED', email: 'ishara.g@example.com', role: 'UI/UX Designer' },
  ],
  'Product Designer': [
    { id: 'APP-005', name: 'Sanduni Wickramasinghe', score: 74, status: 'SHORTLISTED', email: 'sanduni.w@example.com', role: 'Product Designer' },
    { id: 'APP-006', name: 'Ishara Gunasekara', score: 72, status: 'SHORTLISTED', email: 'ishara.g@example.com', role: 'Product Designer' },
  ],
  'QA Automation Engineer': [
    { id: 'APP-007', name: 'Malith Senanayake', score: 70, status: 'SHORTLISTED', email: 'malith.s@example.com', role: 'QA Automation Engineer' },
  ],
  'Business Analyst': [
    { id: 'APP-008', name: 'Tharindu Rathnayake', score: 68, status: 'SHORTLISTED', email: 'tharindu.r@example.com', role: 'Business Analyst' },
  ],
  'Product Manager': [
    { id: 'APP-032', name: 'Kavindi Weerakkody', score: 82, status: 'SHORTLISTED', email: 'kavindi.w@example.com', role: 'Product Manager' },
  ],
};

function formatSlotDateShort(dateValue) {
  if (!dateValue) return '03 Aug';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    const s = String(dateValue);
    return s.length > 6 ? s.substring(0, 6) : s;
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(timeValue) {
  if (!timeValue) return '';
  if (timeValue.includes('AM') || timeValue.includes('PM')) return timeValue;
  const [hoursStr, minutesStr] = timeValue.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeValue;
  const period = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 || 12;
  return `${String(normalizedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function toDateInputValue(dateValue) {
  if (!dateValue) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildGoogleCalendarUrl({ title, description, dateStr, startTimeStr, endTimeStr, location, addEmails }) {
  let formattedDate = '';
  if (dateStr) {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      formattedDate = `${y}${m}${day}`;
    } else {
      formattedDate = (dateStr || '').replace(/-/g, '');
    }
  }

  const format24h = (tStr, defaultH) => {
    if (!tStr) return `${defaultH}0000`;
    const match = tStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return `${defaultH}0000`;
    let h = parseInt(match[1], 10);
    const m = match[2];
    const period = match[3] ? match[3].toUpperCase() : null;
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}${m}00`;
  };

  const startT = format24h(startTimeStr, '09');
  const endT = format24h(endTimeStr, '10');
  const dates = formattedDate ? `${formattedDate}T${startT}/${formattedDate}T${endT}` : '';

  const params = new URLSearchParams();
  params.set('action', 'TEMPLATE');
  if (title) params.set('text', title);
  if (dates) params.set('dates', dates);
  if (description) params.set('details', description);
  if (location) params.set('location', location);

  if (addEmails && typeof addEmails === 'string') {
    const validEmails = addEmails
      .split(',')
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && !e.endsWith('@company.com'));
    if (validEmails.length > 0) {
      params.set('add', validEmails.join(','));
    }
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toTimeInputValue(timeValue) {
  if (!timeValue) return '';
  if (/^\d{2}:\d{2}$/.test(timeValue)) return timeValue;
  const match = timeValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '';
  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === 'AM' && hours === 12) hours = 0;
  if (period === 'PM' && hours !== 12) hours += 12;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

function timeToMinutes(timeValue) {
  const normalized = toTimeInputValue(timeValue);
  if (!normalized) return Number.NaN;
  const [hours, minutes] = normalized.split(':').map(Number);
  return hours * 60 + minutes;
}

function getWeekDays(dateStr) {
  let d;
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, day] = dateStr.split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else {
    d = new Date(dateStr || new Date());
  }
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday is 0
  const startOfWeek = new Date(d);
  startOfWeek.setDate(diff);
  return Array.from({ length: 7 }).map((_, i) => {
    const cd = new Date(startOfWeek);
    cd.setDate(startOfWeek.getDate() + i);
    return cd;
  });
}

function RecruiterInterviewTimeSlotManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateVacancy = location.state?.selectedVacancy;
  const stateRounds = location.state?.roundTitles;
  const stateSelectedRound = location.state?.selectedRound;
  const initialForm = {
    ...emptyForm,
    jobPosition: stateVacancy || 'Senior Software Engineer',
    interviewRound: stateSelectedRound || (stateRounds && stateRounds[0]) || 'Technical Interview',
  };

  const [slots, setSlots] = useState(() => {
    try {
      if (!sessionStorage.getItem('intellihire_recruiter_session')) {
        if (typeof resetToDefaultMockData === 'function') {
          resetToDefaultMockData();
        }
        return initialSlots;
      }
      const stored = localStorage.getItem('intellihire_interview_slots');
      if (stored) return JSON.parse(stored);
    } catch { }
    return initialSlots;
  });
  const [formData, setFormData] = useState(initialForm);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [showZohoModal, setShowZohoModal] = useState(false);
  const [selectedFormatType, setSelectedFormatType] = useState('Google Meet');
  const [showInlineForm, setShowInlineForm] = useState(Boolean(location.state?.openForm));
  const [showPreview, setShowPreview] = useState(false);
  const [showManualAssign, setShowManualAssign] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [autoAssignSummary, setAutoAssignSummary] = useState(null);

  // If we arrived from another page requesting to open the form directly, skip the choice modal
  // Wait, the flow is: Hero card -> Choice Modal -> Inline Form.
  // We can just open the Choice modal directly, or the inline form. I'll open the Choice modal.
  const [activeZohoType, setActiveZohoType] = useState('Google Meet');
  const [positionFilter, setPositionFilter] = useState(stateVacancy || 'Senior Software Engineer');
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [viewingSlot, setViewingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const todayInputValue = getTodayInputValue();

  // Fetch live slots from PostgreSQL backend on mount
  useEffect(() => {
    fetchInterviewSlots()
      .then(res => {
        if (res && res.slots && Array.isArray(res.slots) && res.slots.length > 0) {
          setSlots(res.slots);
          saveInterviewSlots(res.slots);
        }
      })
      .catch(err => {
        console.warn('Backend fetch fallback:', err.message);
      });
  }, []);

  // Keyboard navigation for Format Selector Modal (Enter to continue, Escape to close)
  useEffect(() => {
    if (!showZohoModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowZohoModal(false);
      } else if (e.key === 'Enter' && selectedFormatType) {
        handleChooseZohoType(selectedFormatType);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showZohoModal, selectedFormatType]);

  // Dynamic candidate list matching the active job position
  const currentShortlisted = useMemo(() => {
    const pos = (formData.jobPosition || '').trim();

    // 0. Prefer candidates saved in intellihire_candidates if available
    try {
      const stored = localStorage.getItem('intellihire_candidates');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const targetPos = pos.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matched = parsed.filter(c => {
            if (!targetPos) return true;
            const cPos = (c.jobPosition || c.role || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return !cPos || cPos === targetPos || cPos.includes(targetPos) || targetPos.includes(cPos)
              || ((cPos.includes('software') || cPos.includes('fullstack')) && (targetPos.includes('software') || targetPos.includes('fullstack')));
          });
          if (matched.length > 0) {
            return matched.map(c => ({ ...c, role: pos || c.role || c.jobPosition, jobPosition: pos || c.jobPosition || c.role }));
          }
        }
      }
    } catch { }

    if (!pos) return CANDIDATES_BY_ROLE['Senior Software Engineer'] || [];

    // 1. Direct exact match
    if (CANDIDATES_BY_ROLE[pos] && CANDIDATES_BY_ROLE[pos].length > 0) {
      return CANDIDATES_BY_ROLE[pos].map((c) => ({ ...c, role: pos, jobPosition: pos }));
    }

    // 2. Normalized / fuzzy match against CANDIDATES_BY_ROLE keys
    const norm = pos.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [roleKey, candList] of Object.entries(CANDIDATES_BY_ROLE)) {
      const normKey = roleKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (
        normKey === norm ||
        norm.includes(normKey) ||
        normKey.includes(norm) ||
        (norm.includes('devops') && normKey.includes('devops')) ||
        (norm.includes('frontend') && normKey.includes('frontend')) ||
        (norm.includes('backend') && normKey.includes('backend')) ||
        (norm.includes('qa') && normKey.includes('qa')) ||
        (norm.includes('design') && normKey.includes('design')) ||
        (norm.includes('intern') && normKey.includes('intern')) ||
        (norm.includes('analyst') && normKey.includes('analyst'))
      ) {
        return candList.map((c) => ({ ...c, role: pos, jobPosition: pos }));
      }
    }

    // 3. Realistic dynamic candidate list for any custom vacancy
    return [
      { id: `APP-${pos.replace(/[^a-zA-Z]/g, '').substring(0, 3)}-001`, name: 'Kasun Wijesinghe', score: 85, status: 'SHORTLISTED', email: 'kasun.w@example.com', role: pos, jobPosition: pos },
      { id: `APP-${pos.replace(/[^a-zA-Z]/g, '').substring(0, 3)}-002`, name: 'Nuwan Pradeep', score: 81, status: 'SHORTLISTED', email: 'nuwan.p@example.com', role: pos, jobPosition: pos },
      { id: `APP-${pos.replace(/[^a-zA-Z]/g, '').substring(0, 3)}-003`, name: 'Ankit Sharma', score: 78, status: 'SHORTLISTED', email: 'ankit.s@example.com', role: pos, jobPosition: pos },
    ];
  }, [formData.jobPosition]);

  // Synchronize form and filter when navigating with location.state
  useEffect(() => {
    if (location.state?.selectedVacancy || location.state?.selectedRound || location.state?.openForm || location.state?.openRescheduleModal) {
      if (location.state.selectedVacancy) {
        setPositionFilter(location.state.selectedVacancy);
        setFormData(prev => ({
          ...prev,
          jobPosition: location.state.selectedVacancy,
          ...(location.state.selectedRound ? { interviewRound: location.state.selectedRound } : {})
        }));
      }
      if (location.state.selectedRound) {
        setFormData(prev => ({ ...prev, interviewRound: location.state.selectedRound }));
      }
      if (location.state.openForm) {
        setShowInlineForm(true);
        setTimeout(() => {
          const formElem = document.getElementById('intelli-inline-interview-form');
          if (formElem) formElem.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
      if (location.state.openRescheduleModal) {
        setShowRescheduleModal(true);
      }
    }
  }, [location.state]);

  // Dynamic Rounds Pipeline State
  const [roundsCount, setRoundsCount] = useState(() => location.state?.roundsCount || 3);
  const [roundTypes, setRoundTypes] = useState(() => {
    if (stateRounds && stateRounds.length > 0) {
      return stateRounds;
    }
    return [
      'Technical Interview',
      'HR Screening',
      'HR Portfolio Review',
      'Technical / Live Coding',
      'System Design Architecture',
      'Final Management Round',
    ];
  });
  const [customRoundInput, setCustomRoundInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Dynamic Panels & Time Slots Generator State (Default to tomorrow if today's business hours are past)
  // Only Panel A is created by default. Recruiter can add more panels using "+ Add Panel" if needed.
  const [panels, setPanels] = useState(() => {
    const today = getTodayInputValue();
    const tomorrow = getTomorrowInputValue();
    const nowH = new Date().getHours();
    const defaultDate = nowH >= 17 ? tomorrow : today;
    return [
      {
        id: 1,
        name: 'Panel A (Technical Leads)',
        emails: 'saman.tech@company.com, nirosha.hr@company.com',
        capacity: 2,
        selectedDate: defaultDate,
        slots: [
          { id: 1, date: defaultDate, startTime: '09:00', endTime: '10:00', type: 'Online', assignedCandidate: null },
          { id: 2, date: defaultDate, startTime: '11:00', endTime: '12:00', type: 'Online', assignedCandidate: null },
        ],
      },
    ];
  });

  const syncCandidateAllocations = (updatedPanels, explicitType = null) => {
    try {
      const currentActiveType = explicitType || formData.interviewType || (activeZohoType === 'In-Person' || formData.interviewMedia === 'In-Person' ? 'Physical' : 'Online');
      const getStoredAlloc = () => {
        try {
          const raw = localStorage.getItem('intellihire_allocations');
          if (raw !== null) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
          }
        } catch { }
        return INITIAL_ALLOCATIONS;
      };
      const getStoredCands = () => {
        try {
          const raw = localStorage.getItem('intellihire_candidates');
          if (raw !== null) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        } catch { }
        return INITIAL_CANDIDATES;
      };

      const existingAllocations = getStoredAlloc();
      const existingCandidates = getStoredCands();

      const currentFormCandidateNames = new Set(
        currentShortlisted.map(c => c.name)
      );
      const allocatedInForm = new Map();
      (updatedPanels || []).forEach(p => {
        (p.slots || []).forEach(s => {
          if (s.assignedCandidate) {
            allocatedInForm.set(s.assignedCandidate.name, {
              candidate: s.assignedCandidate,
              slot: s,
              panel: p,
            });
          }
        });
      });

      // Preserve all existing allocations and update/prepend newly allocated candidates
      const nextAllocations = [...existingAllocations];
      const newlyAllocatedCandIds = new Set();
      const newlyAllocatedCandNames = new Set();

      allocatedInForm.forEach(({ candidate, slot, panel }, candName) => {
        const candId = candidate.id || `APP-${candName.replace(/\s+/g, '')}`;
        newlyAllocatedCandIds.add(String(candId));
        newlyAllocatedCandNames.add(candName.toLowerCase().trim());

        const slotRawDate = slot.date || panel.selectedDate || getTodayInputValue();
        const startTimeStr = formatTime(slot.startTime || '09:00 AM');
        const endTimeStr = formatTime(slot.endTime || getEndTime(slot.startTime || '09:00 AM') || '10:00 AM');
        const timeRange = `${startTimeStr} – ${endTimeStr}`;

        const record = {
          candidateId: candId,
          candidateName: candidate.name,
          slotId: `SLOT-${panel.id}-${slot.id}`,
          assignedTime: timeRange,
          interviewDate: formatDate(slotRawDate),
          interviewType: slot.type || currentActiveType,
          panelName: panel.name || 'Panel A (Technical Leads)',
          interviewRound: formData.interviewRound || 'Technical Interview',
          jobPosition: candidate.jobPosition || candidate.role || formData.jobPosition || 'Senior Software Engineer',
          score: candidate.score || 85,
          status: 'ALLOCATED',
        };
        const exIdx = nextAllocations.findIndex(a =>
          (a.candidateId && String(a.candidateId) === String(candId)) ||
          (a.candidateName && a.candidateName.toLowerCase().trim() === candName.toLowerCase().trim())
        );
        if (exIdx >= 0) {
          nextAllocations[exIdx] = { ...nextAllocations[exIdx], ...record };
        } else {
          nextAllocations.unshift(record);
        }
      });

      localStorage.setItem('intellihire_allocations', JSON.stringify(nextAllocations));

      // Synchronize all current slots to intellihire_custom_slots so Available Time Slots table updates live
      const activePanelsList = updatedPanels || panels;
      const allSlotsToSync = [];
      const now = new Date();
      const todayStr = getTodayInputValue();
      activePanelsList.forEach(p => {
        (p.slots || []).forEach(s => {
          const slotRawDate = s.date || p.selectedDate || todayStr;
          const dObj = new Date(slotRawDate);
          const shortDate = isNaN(dObj.getTime())
            ? '24 Oct'
            : dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          const displayTime = formatTime(s.startTime || '09:00 AM');
          const displayEnd = formatTime(s.endTime || '10:00 AM');
          allSlotsToSync.push({
            id: `SLOT-${p.id}-${s.id}`,
            dateKey: slotRawDate,
            date: formatDate(slotRawDate),
            dateShort: shortDate,
            time: displayTime,
            end: displayEnd,
            startTime: displayTime,
            endTime: displayEnd,
            type: s.type || currentActiveType,
            cap: 1,
            capacity: 1,
            rem: s.assignedCandidate ? 0 : 1,
            jobPosition: formData.jobPosition || 'Senior Software Engineer',
            round: formData.interviewRound || 'Technical Interview',
            status: s.assignedCandidate ? 'BOOKED' : 'AVAILABLE',
            panelName: p.name,
            isPast: isSlotTimeInPast(slotRawDate, s.startTime),
            isCustom: true
          });
        });
      });
      // Merge with existing custom slots without duplicates or outdated dates
      const existingCustom = JSON.parse(localStorage.getItem('intellihire_custom_slots') || '[]');
      const customMap = new Map();
      existingCustom
        .filter(s => s && (!s.dateKey || s.dateKey >= '2026-10-24'))
        .forEach(s => {
          const key = `${s.dateKey || s.date}-${s.time || s.startTime}`;
          customMap.set(key, s);
        });
      allSlotsToSync
        .filter(s => s && (!s.dateKey || s.dateKey >= '2026-10-24'))
        .forEach(s => {
          const key = `${s.dateKey || s.date}-${s.time || s.startTime}`;
          customMap.set(key, s);
        });
      localStorage.setItem('intellihire_custom_slots', JSON.stringify(Array.from(customMap.values())));
      window.dispatchEvent(new CustomEvent('intellihire_slots_updated', { detail: { source: 'InterviewTimeSlotManagement' } }));
      window.dispatchEvent(new Event('storage'));

      // Keep all candidates, marking any that are allocated anywhere as ALLOCATED
      const allAllocatedNames = new Set([
        ...existingAllocations.filter(a => a.status === 'ALLOCATED').map(a => (a.candidateName || '').toLowerCase().trim()),
        ...Array.from(allocatedInForm.keys()).map(name => name.toLowerCase().trim())
      ]);

      // Base candidate pool: strictly use existingCandidates if available, or INITIAL_CANDIDATES (never expand to 27 mock candidates)
      const basePool = (existingCandidates && existingCandidates.length > 0) ? existingCandidates : INITIAL_CANDIDATES;
      const candidatesMap = new Map();
      basePool.forEach(c => {
        if (c && c.name) candidatesMap.set(c.name.toLowerCase().trim(), c);
      });

      // If any candidate was allocated in the form and is not yet in the pool, add only that candidate!
      allocatedInForm.forEach(({ candidate }) => {
        if (candidate && candidate.name) {
          const key = candidate.name.toLowerCase().trim();
          if (!candidatesMap.has(key)) {
            candidatesMap.set(key, {
              id: candidate.id || `APP-${Date.now()}`,
              name: candidate.name,
              score: candidate.score || 85,
              status: 'ALLOCATED',
              jobPosition: candidate.jobPosition || candidate.role || formData.jobPosition || 'Senior Software Engineer',
              role: candidate.role || formData.jobPosition || 'Senior Software Engineer',
              round: formData.interviewRound || 'Technical Interview',
              selected: false,
            });
          }
        }
      });

      const updatedCandidates = Array.from(candidatesMap.values()).map(c => {
        const isAlloc = allAllocatedNames.has((c.name || '').toLowerCase().trim());
        return {
          ...c,
          status: isAlloc ? 'ALLOCATED' : 'SHORTLISTED',
        };
      });
      localStorage.setItem('intellihire_candidates', JSON.stringify(updatedCandidates));
    } catch (err) {
      console.error('Failed to sync allocations:', err);
    }
  };

  // Candidates who are not yet allocated to any panel slot (defined after panels state to prevent ReferenceError)
  const unallocatedShortlisted = useMemo(() => {
    const allocatedCandidateNames = new Set(
      panels.flatMap(p => (p.slots || []).filter(s => s.assignedCandidate).map(s => s.assignedCandidate.name))
    );
    return currentShortlisted.filter(cand => !allocatedCandidateNames.has(cand.name));
  }, [currentShortlisted, panels]);

  // Reschedule Requests State
  const [rescheduleRequests, setRescheduleRequests] = useState(() => getRescheduleRequests());
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [activeRequestTab, setActiveRequestTab] = useState('PENDING');
  const [selectedReviewRequest, setSelectedReviewRequest] = useState(null);
  const [customRescheduleDate, setCustomRescheduleDate] = useState('');
  const [customRescheduleStart, setCustomRescheduleStart] = useState('');
  const [customRescheduleEnd, setCustomRescheduleEnd] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const refreshRescheduleRequests = () => {
    const reqs = getRescheduleRequests();
    setRescheduleRequests(reqs);
    setSlots(getInterviewSlots());
  };

  const pendingReschedulesCount = useMemo(() => {
    return (rescheduleRequests || []).filter(r => r.status === 'PENDING').length;
  }, [rescheduleRequests]);

  const handleApproveProposed = (reqId, proposedSlot) => {
    const res = approveRescheduleRequest(reqId, proposedSlot);
    if (res.success) {
      refreshRescheduleRequests();
      setToast({ type: 'success', message: `Reschedule approved for ${proposedSlot.displayDate}!` });
      setSelectedReviewRequest(null);
    }
  };

  const handleDeclineRequest = (reqId, reason) => {
    const res = rejectRescheduleRequest(reqId, reason);
    if (res.success) {
      refreshRescheduleRequests();
      setToast({ type: 'info', message: 'Reschedule request declined.' });
      setSelectedReviewRequest(null);
    }
  };

  const handleApplyCustomSlot = (reqId) => {
    if (!customRescheduleDate || !customRescheduleStart || !customRescheduleEnd) {
      alert('Please fill in Date, Start Time, and End Time.');
      return;
    }
    const dObj = new Date(customRescheduleDate);
    const displayDate = dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const customSlot = {
      date: customRescheduleDate,
      displayDate,
      startTime: customRescheduleStart,
      endTime: customRescheduleEnd,
    };
    const res = customRescheduleSlot(reqId, customSlot, customNotes);
    if (res.success) {
      refreshRescheduleRequests();
      setToast({ type: 'success', message: `Custom slot allocated for ${displayDate}!` });
      setSelectedReviewRequest(null);
    }
  };

  const handlePanelDateChange = (panelId, dateStr) => {
    setPanels(prev =>
      prev.map(p => {
        if (p.id !== panelId) return p;
        return {
          ...p,
          selectedDate: dateStr,
          slots: dateStr ? p.slots.map(s => (s.date === p.selectedDate ? { ...s, date: dateStr } : s)) : p.slots,
        };
      })
    );
    if (dateStr) {
      setFormData(current => ({ ...current, interviewDate: dateStr }));
    }
  };

  const handleRoundsCountChange = count => {
    const num = Math.max(1, Math.min(6, Number(count)));
    setRoundsCount(num);
    const defaultOptions = [
      'HR Screening',
      'Technical / Live Coding',
      'System Design Architecture',
      'Final Cultural Fit',
      'Portfolio Review',
      'Management Round',
    ];
    setRoundTypes(prev => {
      const updated = [...prev];
      while (updated.length < num) {
        updated.push(defaultOptions[updated.length % defaultOptions.length]);
      }
      return updated.slice(0, num);
    });
  };

  const handleRoundTypeSelect = (index, value) => {
    setRoundTypes(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleAddCustomRound = () => {
    if (!customRoundInput.trim()) return;
    setRoundTypes(prev => [...prev, customRoundInput.trim()]);
    setRoundsCount(prev => prev + 1);
    setFormData(prev => ({ ...prev, interviewRound: customRoundInput.trim() }));
    setCustomRoundInput('');
    setShowCustomInput(false);
  };

  const handlePanelCapacityChange = (panelId, newCapacity) => {
    const maxCapacity = Math.max(1, MOCK_CANDIDATES.filter(c => c.shortlisted).length);
    const cap = Math.max(1, Math.min(maxCapacity, Number(newCapacity)));
    setPanels(prev =>
      prev.map(p => {
        if (p.id !== panelId) return p;
        return {
          ...p,
          capacity: cap,
        };
      })
    );
  };

  const handleDailySlotCountChange = (panelId, date, newCount) => {
    let desiredCount = Math.max(0, Number(newCount));
    setPanels(prev =>
      prev.map(p => {
        if (p.id !== panelId) return p;

        const otherDateSlots = p.slots.filter(s => s.date !== date);
        let thisDateSlots = p.slots.filter(s => s.date === date);
        const defaultTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

        if (thisDateSlots.length < desiredCount) {
          let nextId = p.slots.length > 0 ? Math.max(...p.slots.map(s => s.id)) + 1 : 1;
          while (thisDateSlots.length < desiredCount) {
            const timeVal = defaultTimes[thisDateSlots.length % defaultTimes.length] || '09:00';
            thisDateSlots.push({ id: nextId++, date: date, startTime: timeVal });
          }
        } else if (thisDateSlots.length > desiredCount) {
          thisDateSlots = thisDateSlots.slice(0, desiredCount);
        }

        const totalSlots = otherDateSlots.length + thisDateSlots.length;
        return {
          ...p,
          capacity: Math.max(p.capacity, totalSlots, 1),
          slots: [...otherDateSlots, ...thisDateSlots],
        };
      })
    );
  };

  const handleAddManualSlot = (panelId, targetDate) => {
    setPanels(prev => {
      const nextPanels = prev.map(p => {
        if (p.id !== panelId) return p;
        let d = targetDate || p.selectedDate;
        const now = new Date();
        const isToday = d === getTodayInputValue();
        let defaultTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        if (isToday) {
          const curH = now.getHours();
          const futureTimes = defaultTimes.filter(t => parseInt(t.split(':')[0], 10) > curH);
          if (futureTimes.length > 0) {
            defaultTimes = futureTimes;
          } else {
            d = getTomorrowInputValue();
            defaultTimes = ['09:00', '10:00', '11:00', '13:00', '14:00'];
          }
        }
        const existingOnDate = p.slots.filter(s => s.date === d);
        const nextTime = defaultTimes[existingOnDate.length % defaultTimes.length] || '09:00';
        const [h, m] = nextTime.split(':').map(Number);
        const nextEndTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const nextId = p.slots.length ? Math.max(...p.slots.map(s => s.id)) + 1 : 1;
        const currentSlotType = formData.interviewType || (activeZohoType === 'In-Person' || formData.interviewMedia === 'In-Person' ? 'Physical' : 'Online');
        const newSlots = [...p.slots, { id: nextId, date: d, startTime: nextTime, endTime: nextEndTime, type: currentSlotType, assignedCandidate: null }];
        return {
          ...p,
          selectedDate: d,
          capacity: Math.max(p.capacity, newSlots.length, 1),
          slots: newSlots,
        };
      });
      syncCandidateAllocations(nextPanels);
      return nextPanels;
    });
    setToast({ type: 'success', message: 'New future time slot added successfully.' });
  };

  const handleRemoveManualSlot = (panelId, slotId) => {
    setPanels(prev => {
      const next = prev.map(p => {
        if (p.id !== panelId) return p;
        const updated = p.slots.filter(s => s.id !== slotId);
        return {
          ...p,
          slots: updated,
        };
      });
      syncCandidateAllocations(next);
      return next;
    });
    if (selectedSlotKey === `${panelId}-${slotId}`) {
      setSelectedSlotKey(null);
      setSelectedSlotId(null);
    }
    setToast({ type: 'success', message: 'Time slot deleted successfully.' });
  };

  const handleDeleteSlotFromAvailable = (panelId, slotId) => {
    handleRemoveManualSlot(panelId, slotId);
  };

  const handleResetForm = () => {
    const defaultDate = new Date().getHours() >= 17 ? getTomorrowInputValue() : getTodayInputValue();
    setFormData({
      ...emptyForm,
      interviewDate: defaultDate,
      jobPosition: defaultVacancy,
      interviewRound: 'Technical Interview',
    });
    const defaultPanels = [
      {
        id: 1,
        name: 'Panel A (Technical Leads)',
        emails: 'saman.tech@company.com, nirosha.hr@company.com',
        capacity: 2,
        selectedDate: defaultDate,
        slots: [
          { id: 1, date: defaultDate, startTime: '09:00', endTime: '10:00', type: 'Online', assignedCandidate: null },
          { id: 2, date: defaultDate, startTime: '11:00', endTime: '12:00', type: 'Online', assignedCandidate: null },
        ],
      },
    ];
    setPanels(defaultPanels);
    setSelectedCandidates([]);
    setSelectedSlotKey(null);
    setSelectedSlotId(null);
    setAutoAssignSummary(null);
    syncCandidateAllocations(defaultPanels);
    setToast({ type: 'success', message: 'Time slot form reset to default values.' });
  };

  const hasTimeConflict = (panel, slot) => {
    if (!panel || !slot || !slot.startTime) return false;
    const sNorm = toTimeInputValue(slot.startTime);
    return panel.slots.some(
      other => other.id !== slot.id && other.date === slot.date && toTimeInputValue(other.startTime) === sNorm
    );
  };

  const handlePanelEmailChange = (panelId, emailVal) => {
    setPanels(prev =>
      prev.map(p => (p.id === panelId ? { ...p, emails: emailVal } : p))
    );
  };

  const handlePanelNameChange = (panelId, nameVal) => {
    setPanels(prev =>
      prev.map(p => (p.id === panelId ? { ...p, name: nameVal } : p))
    );
  };

  const handleSlotTimeChange = (panelId, slotId, field, val) => {
    setPanels(prev => {
      const next = prev.map(p => {
        if (p.id !== panelId) return p;
        return {
          ...p,
          slots: p.slots.map(s => {
            if (s.id !== slotId) return s;
            const updated = { ...s, [field]: val };
            if (field === 'startTime' && val) {
              const match = val.match(/^(\d{1,2}):(\d{2})/);
              if (match) {
                let h = parseInt(match[1], 10);
                const m = match[2];
                const endH = (h + 1) % 24;
                updated.endTime = `${String(endH).padStart(2, '0')}:${m}`;
              }
            }
            return updated;
          }),
        };
      });
      syncCandidateAllocations(next);
      return next;
    });
  };

  const handleAddPanel = () => {
    const nextId = panels.length + 1;
    const today = getTodayInputValue();
    setPanels(prev => [
      ...prev,
      {
        id: nextId,
        name: `Panel ${String.fromCharCode(64 + nextId)} (Senior Panel)`,
        emails: 'evaluator@company.com, hr@company.com',
        capacity: 2,
        selectedDate: today,
        slots: [
          { id: 1, date: today, startTime: '14:00', endTime: '15:00', assignedCandidate: null },
          { id: 2, date: today, startTime: '15:15', endTime: '16:15', assignedCandidate: null },
        ],
      },
    ]);
  };

  const handleRemovePanel = panelId => {
    if (panels.length <= 1) return;
    setPanels(prev => prev.filter(p => p.id !== panelId));
  };

  const jobPositions = useMemo(
    () => {
      const positions = [...new Set(slots.map(slot => slot.jobPosition))];
      if (positionFilter && !positions.includes(positionFilter)) {
        positions.push(positionFilter);
      }
      return positions.sort();
    },
    [slots, positionFilter]
  );

  // Filtered Slots
  const filteredSlots = useMemo(() => {
    return slots.filter(slot => slot.jobPosition === positionFilter);
  }, [slots, positionFilter]);

  // Paginated Slots
  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage) || 1;
  const paginatedSlots = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSlots.slice(start, start + itemsPerPage);
  }, [filteredSlots, currentPage]);


  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (jobPositions.length > 0 && !jobPositions.includes(positionFilter)) {
      setPositionFilter(jobPositions[0]);
      setCurrentPage(1);
    }
  }, [jobPositions, positionFilter]);

  useEffect(() => {
    if (location.state?.editSlot) {
      const slot = location.state.editSlot;
      setActiveZohoType(location.state.activeZohoType || 'Log');
      setEditingSlotId(slot.id || 'SLOT-101');
      setShowInlineForm(true);
      setFormData({
        interviewDate: slot.dateKey || '2026-08-03',
        meetingLocation: slot.location || 'Executive Boardroom 3B, 2nd Floor, HQ Building',
        additionalNotes: 'Candidate demonstrated exceptional problem solving abilities, clean code architecture knowledge, and strong technical communication during the live session.',
      });
      setTimeout(() => {
        const el = document.getElementById('intelli-inline-interview-form');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [location.state]);

  const handleFieldChange = event => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
  };

  const handleOpenCreateInterview = () => {
    setSelectedFormatType('Google Meet');
    setShowZohoModal(true);
  };

  const handleChooseZohoType = (type) => {
    setShowZohoModal(false);
    setActiveZohoType(type);
    let selectedMedia = 'Google Meet';
    let isOnline = true;
    if (type === 'In-Person' || type === 'Physical') {
      selectedMedia = 'In-Person';
      isOnline = false;
    } else if (type === 'Log') {
      selectedMedia = 'Log';
      isOnline = false;
    }
    const resolvedType = isOnline ? 'Online' : (type === 'Log' ? 'Logged' : 'Physical');
    const initialDate = panels[0]?.selectedDate || new Date().toISOString().split('T')[0];
    setFormData({
      ...emptyForm,
      jobPosition: positionFilter,
      interviewMedia: selectedMedia,
      interviewType: resolvedType,
      interviewDate: initialDate,
      meetingLocation: !isOnline
        ? 'Executive Boardroom 3B, 2nd Floor, HQ Tower'
        : (type === 'Google Meet' || isOnline ? generateValidMeetingUrl('Google Meet') : 'Past Session Evaluation Log'),
    });
    // Immediately synchronize all panel slots with the chosen interview type
    setPanels(prevPanels => {
      const updated = prevPanels.map(p => ({
        ...p,
        slots: (p.slots || []).map(s => ({
          ...s,
          type: resolvedType,
        })),
      }));
      syncCandidateAllocations(updated, resolvedType);
      return updated;
    });
    setEditingSlotId(null);
    setShowInlineForm(true);
    setTimeout(() => {
      const formElem = document.getElementById('intelli-inline-interview-form');
      if (formElem) formElem.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleToggleForm = () => {
    setShowInlineForm(prev => !prev);
    if (editingSlotId) {
      setEditingSlotId(null);
      setFormData(emptyForm);
    }
  };

  const handleReset = () => {
    setFormData(emptyForm);
    setEditingSlotId(null);
    setFormError('');
    setMessage('');
  };

  const handleMediaSelect = (media) => {
    const isOnline = media !== 'In-Person';
    const newType = isOnline ? 'Online' : 'Physical';
    setActiveZohoType(media === 'In-Person' ? 'In-Person' : 'Google Meet');
    setFormData(current => {
      let autoLocation = current.meetingLocation;
      if (media === 'Google Meet' && (!autoLocation || autoLocation.includes('teams') || autoLocation.includes('zoom') || !autoLocation.includes('meet.google.com'))) {
        autoLocation = generateValidMeetingUrl('Google Meet');
      } else if ((media === 'MS Teams' || media === 'Microsoft Teams') && (!autoLocation || !autoLocation.includes('teams.microsoft.com'))) {
        autoLocation = generateValidMeetingUrl('Microsoft Teams');
      } else if (media === 'Zoom' && (!autoLocation || !autoLocation.includes('zoom.us'))) {
        autoLocation = generateValidMeetingUrl('Zoom');
      } else if (media === 'In-Person' && (autoLocation.includes('http') || !autoLocation)) {
        autoLocation = 'Main Engineering Conference Room, 2nd Floor';
      }
      return {
        ...current,
        interviewMedia: media,
        interviewType: newType,
        meetingLocation: autoLocation,
      };
    });
    // Synchronize all panel slots when media type changes
    setPanels(prevPanels => {
      const updated = prevPanels.map(p => ({
        ...p,
        slots: (p.slots || []).map(s => ({
          ...s,
          type: newType,
        })),
      }));
      syncCandidateAllocations(updated, newType);
      return updated;
    });
  };

  const handleSelectUpfrontMedia = (media) => {
    handleMediaSelect(media);
    setShowInlineForm(true);
    window.scrollTo({ top: 260, behavior: 'smooth' });
  };

  const handleEditSlot = slot => {
    setEditingSlotId(slot.id);
    setShowInlineForm(true);
    const roundVal = ['Technical', 'HR Screening', 'HR Portfolio Review', 'Technical Case Study', 'System Design', 'Final Cultural Fit'].includes(slot.round)
      ? slot.round
      : 'Custom';

    setFormData({
      jobPosition: slot.jobPosition,
      interviewRound: roundVal,
      customRoundName: roundVal === 'Custom' ? slot.round : '',
      interviewMedia: slot.interviewMedia || (slot.interviewType === 'Physical' ? 'In-Person' : 'Google Meet'),
      interviewType: slot.interviewType || 'Online',
      interviewDate: toDateInputValue(slot.interviewDate),
      startTime: toTimeInputValue(slot.startTime),
      endTime: toTimeInputValue(slot.endTime),
      capacity: String(slot.capacity),
      panelName: slot.panelName || 'Panel A (Technical Leads)',
      panelEmails: slot.panelEmails || 'techlead@company.com, hr@company.com',
      meetingLocation: slot.meetingLocation || '',
      additionalNotes: slot.additionalNotes || '',
    });
    setFormError('');
    setTimeout(() => {
      const formElem = document.getElementById('intelli-inline-interview-form');
      if (formElem) formElem.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = event => {
    event.preventDefault();
    setFormError('');

    const effectiveDate = formData.interviewDate || panels[0]?.selectedDate || new Date().toISOString().split('T')[0];

    if (!effectiveDate) {
      setToast({ type: 'error', message: 'Interview date is required.' });
      setFormError('Interview date is required.');
      return;
    }

    const formattedDate = formatDate(effectiveDate);
    const roundSummary = roundTypes.join(', ');

    const currentSlotInterviewType = formData.interviewType || (formData.interviewMedia === 'In-Person' || activeZohoType === 'In-Person' ? 'Physical' : 'Online');

    if (editingSlotId) {
      const updatedPayload = {
        jobPosition: formData.jobPosition,
        round: roundSummary,
        interviewDate: effectiveDate,
        interviewType: currentSlotInterviewType,
        panelName: panels[0]?.name || 'Panel A (Technical Leads)',
        panelEmails: panels[0]?.emails || 'techlead@company.com, hr@company.com',
        meetingLocation: formData.meetingLocation,
        additionalNotes: formData.additionalNotes,
      };
      updateInterviewSlot(editingSlotId, updatedPayload).catch(() => { });

      setSlots(current => {
        const next = current.map(slot => {
          if (slot.id === editingSlotId) {
            return {
              ...slot,
              jobPosition: formData.jobPosition,
              round: roundSummary,
              interviewMedia: formData.interviewMedia,
              interviewDate: formattedDate,
              interviewType: currentSlotInterviewType,
              panelName: panels[0]?.name || 'Panel A (Technical Leads)',
              panelEmails: panels[0]?.emails || 'techlead@company.com, hr@company.com',
              meetingLocation: formData.meetingLocation,
              additionalNotes: formData.additionalNotes,
            };
          }
          return slot;
        });
        saveInterviewSlots(next);
        return next;
      });
      setToast({ type: 'success', message: 'Interview slot updated successfully!' });
    } else {
      let createdSlots = [];
      let baseId = slots.length ? Math.max(...slots.map(s => s.id)) + 1 : 1;

      // Auto fallback: if recruiter hasn't configured slots for a panel, add 1 default slot
      const activePanels = panels.map(p => {
        if (!p.slots || p.slots.length === 0) {
          return {
            ...p,
            slots: [{ id: 1, date: p.selectedDate || effectiveDate, startTime: '09:00', endTime: '10:00' }],
          };
        }
        return p;
      });

      activePanels.forEach(p => {
        p.slots.forEach((sRow, idx) => {
          const slotRawDate = sRow.date || p.selectedDate || effectiveDate;
          createdSlots.push({
            id: baseId++,
            rawDate: slotRawDate,
            jobPosition: formData.jobPosition || 'Senior Software Engineer',
            round: formData.interviewRound || roundTypes[idx % roundTypes.length] || 'Technical Round',
            interviewMedia: formData.interviewMedia,
            interviewDate: formatDate(slotRawDate),
            startTime: formatTime(sRow.startTime || '09:00'),
            endTime: formatTime(sRow.endTime || '10:00'),
            interviewType: currentSlotInterviewType,
            capacity: p.capacity || 1,
            status: 'AVAILABLE',
            panelName: p.name,
            panelEmails: p.emails,
            meetingLocation: formData.meetingLocation || (formData.interviewMedia === 'Google Meet' ? generateValidMeetingUrl('Google Meet') : 'Main Office Conference Room'),
            additionalNotes: formData.additionalNotes || 'N/A',
            bookedCount: sRow.assignedCandidate ? 1 : 0,
            assignedCandidate: sRow.assignedCandidate || null,
          });
        });
      });

      setSlots(current => {
        const next = [...createdSlots, ...current];
        saveInterviewSlots(next);
        return next;
      });

      // Send to backend PostgreSQL API
      createdSlots.forEach(s => {
        const candidatePayload = (s.assignedCandidate && s.assignedCandidate.name) ? {
          id: s.assignedCandidate.id,
          name: s.assignedCandidate.name,
          email: s.assignedCandidate.email || `${s.assignedCandidate.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          score: s.assignedCandidate.score || 85,
          avatar: s.assignedCandidate.avatar || '',
        } : null;

        createInterviewSlot({
          jobPosition: s.jobPosition,
          round: s.round,
          interviewDate: s.rawDate || effectiveDate,
          startTime: s.startTime,
          endTime: s.endTime,
          interviewType: s.interviewType,
          meetingLocation: s.meetingLocation,
          capacity: s.capacity,
          panelName: s.panelName,
          panelEmails: s.panelEmails,
          additionalNotes: s.additionalNotes,
          candidate: candidatePayload,
          status: candidatePayload ? 'SCHEDULED' : 'AVAILABLE',
          bookedCount: candidatePayload ? 1 : 0,
        }).catch(err => console.error('Error saving slot to database:', err));
      });

      // Synchronize directly with Candidate Interview Allocation
      try {
        const newAllocSlots = createdSlots.map(s => {
          const rawDate = s.rawDate || effectiveDate;
          const dObj = new Date(rawDate);
          const shortDate = isNaN(dObj.getTime()) ? (s.interviewDate || '30 Oct').substring(0, 6) : dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          return {
            id: `SLOT-${s.id}`,
            dateKey: rawDate,
            date: s.interviewDate,
            dateShort: shortDate,
            time: s.startTime,
            end: s.endTime,
            startTime: s.startTime,
            endTime: s.endTime,
            type: s.interviewType || currentSlotInterviewType,
            cap: s.capacity,
            capacity: s.capacity,
            rem: s.assignedCandidate ? Math.max(0, s.capacity - 1) : s.capacity,
            jobPosition: s.jobPosition,
            round: s.round,
            status: 'AVAILABLE',
            bookedCount: s.assignedCandidate ? 1 : 0,
            panelName: s.panelName,
            panelEmails: s.panelEmails,
            meetingLocation: s.meetingLocation,
            isCustom: true,
          };
        });
        const existing = JSON.parse(localStorage.getItem('intellihire_custom_slots') || '[]');
        const map = new Map();
        existing
          .filter(s => s && (!s.dateKey || s.dateKey >= '2026-10-24'))
          .forEach(s => map.set(`${s.dateKey || s.date}-${s.time || s.startTime}`, s));
        newAllocSlots
          .filter(s => s && (!s.dateKey || s.dateKey >= '2026-10-24'))
          .forEach(s => map.set(`${s.dateKey || s.date}-${s.time || s.startTime}`, s));
        localStorage.setItem('intellihire_custom_slots', JSON.stringify(Array.from(map.values())));

        // Directly sync any allocated candidate from the submitted form to intellihire_allocations
        const currentAllocations = (() => {
          try {
            const raw = localStorage.getItem('intellihire_allocations');
            if (raw !== null) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) return parsed;
            }
          } catch { }
          return INITIAL_ALLOCATIONS;
        })();

        createdSlots.forEach(s => {
          if (s.assignedCandidate && s.assignedCandidate.name) {
            const cand = s.assignedCandidate;
            const candId = cand.id || `APP-${cand.name.replace(/\s+/g, '')}`;
            const timeRange = `${formatTime(s.startTime)} – ${formatTime(s.endTime || getEndTime(s.startTime))}`;
            const allocRecord = {
              candidateId: candId,
              candidateName: cand.name,
              slotId: `SLOT-${s.id}`,
              assignedTime: timeRange,
              interviewDate: s.interviewDate,
              interviewType: s.interviewType || currentSlotInterviewType,
              panelName: s.panelName || 'Panel A (Technical Leads)',
              interviewRound: s.round || formData.interviewRound || 'Technical Interview',
              jobPosition: cand.jobPosition || cand.role || s.jobPosition || formData.jobPosition || 'Senior Software Engineer',
              status: 'ALLOCATED',
              score: cand.score || 85,
            };
            const exIdx = currentAllocations.findIndex(a =>
              (a.candidateId && String(a.candidateId) === String(candId)) ||
              (a.candidateName && a.candidateName.trim().toLowerCase() === cand.name.trim().toLowerCase())
            );
            if (exIdx >= 0) {
              currentAllocations[exIdx] = { ...currentAllocations[exIdx], ...allocRecord };
            } else {
              currentAllocations.unshift(allocRecord);
            }
          }
        });
        localStorage.setItem('intellihire_allocations', JSON.stringify(currentAllocations));

        // Update intellihire_candidates in localStorage for any assigned candidates
        const existingCands = (() => {
          try {
            const raw = localStorage.getItem('intellihire_candidates');
            if (raw !== null) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
          } catch { }
          return INITIAL_CANDIDATES;
        })();

        let nextCands = [...existingCands];
        createdSlots.forEach(s => {
          if (s.assignedCandidate && s.assignedCandidate.name) {
            const candName = s.assignedCandidate.name.trim();
            const lower = candName.toLowerCase();
            const idx = nextCands.findIndex(c => (c.name || '').trim().toLowerCase() === lower);
            if (idx >= 0) {
              nextCands[idx] = { ...nextCands[idx], status: 'ALLOCATED' };
            } else {
              nextCands.unshift({
                id: s.assignedCandidate.id || `APP-${Date.now()}`,
                name: candName,
                score: s.assignedCandidate.score || 85,
                status: 'ALLOCATED',
                jobPosition: s.assignedCandidate.jobPosition || s.assignedCandidate.role || s.jobPosition || formData.jobPosition || 'Senior Software Engineer',
                role: s.assignedCandidate.role || s.jobPosition || formData.jobPosition || 'Senior Software Engineer',
                round: s.round || formData.interviewRound || 'Technical Interview',
                selected: false,
              });
            }
          }
        });
        localStorage.setItem('intellihire_candidates', JSON.stringify(nextCands));

        // Do not force active vacancy into localStorage to avoid filtering Candidate Allocation unexpectedly

        syncCandidateAllocations(activePanels);
        window.dispatchEvent(new CustomEvent('intellihire_slots_updated', { detail: { source: 'InterviewTimeSlotManagement' } }));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Failed to sync allocation slots to localStorage:', err);
      }

      setPositionFilter(formData.jobPosition);
      setCurrentPage(1);

      if (activeZohoType === 'Log') {
        setToast({ type: 'success', message: 'Interview evaluation record logged successfully!' });
      } else {
        setToast({ type: 'success', message: 'Interview slot created successfully!' });
      }
    }

    setFormData(emptyForm);
    setShowInlineForm(false);

    if (stateVacancy && window.history.length > 1) {
      navigate(-1);
    }
  };

  const confirmDeleteSlot = () => {
    if (deletingSlot) {
      deleteInterviewSlot(deletingSlot.id).catch(err => console.warn('Backend slot delete error:', err));
      setSlots(current => {
        const next = current.filter(slot => slot.id !== deletingSlot.id);
        saveInterviewSlots(next);
        return next;
      });
      setToast({ type: 'success', message: `Slot #${deletingSlot.id} deleted successfully.` });
      setDeletingSlot(null);
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="create-vacancy">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Time Slots"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          searchPlaceholder="Search vacancies, candidates, or interviews..."
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        {/* Content Container */}
        <div className="recruiter-content">
          {/* ── Sub Navigation Pill Bar ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px',
            backgroundColor: '#16171F',
            border: '1px solid #2A2C38',
            borderRadius: '12px',
            padding: '8px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                style={{
                  backgroundColor: '#F0B90B',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <Calendar size={16} />
                Time Slots
              </button>

              <button
                type="button"
                onClick={() => navigate('/recruiter/interviews/allocation')}
                style={{
                  backgroundColor: '#1E222D',
                  color: '#FFFFFF',
                  border: '1px solid #2A2C38',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <Users size={16} />
                Candidate Allocation
              </button>

              <button
                type="button"
                onClick={() => setShowRescheduleModal(true)}
                style={{
                  backgroundColor: pendingReschedulesCount > 0 ? 'rgba(240, 185, 11, 0.15)' : '#1E222D',
                  color: pendingReschedulesCount > 0 ? '#F0B90B' : '#FFFFFF',
                  border: pendingReschedulesCount > 0 ? '1px solid #F0B90B' : '1px solid #2A2C38',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: pendingReschedulesCount > 0 ? '0 0 12px rgba(240, 185, 11, 0.25)' : 'none',
                }}
              >
                <RefreshCw size={16} />
                <span>Reschedule Requests</span>
                {pendingReschedulesCount > 0 && (
                  <span style={{
                    backgroundColor: '#F0B90B',
                    color: '#000000',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    marginLeft: '4px',
                  }}>
                    {pendingReschedulesCount} Pending
                  </span>
                )}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => navigate('/panel/interviews')}
                style={{
                  backgroundColor: '#1E222D',
                  color: '#9599A6',
                  border: '1px solid #2A2C38',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#F0B90B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9599A6';
                  e.currentTarget.style.borderColor = '#2A2C38';
                }}
              >
                <ShieldCheck size={15} style={{ color: '#F0B90B' }} />
                <span>Open Panel Member Portal</span>
              </button>
            </div>
          </div>

          {/* ── IntelliHire Interviews Hero Card (Rendered only when form is NOT active) ── */}
          {!showInlineForm && (
            <div
              style={{
                backgroundColor: '#16171F',
                border: '1px solid rgba(240, 185, 11, 0.22)',
                borderRadius: '20px',
                padding: '44px 32px',
                textAlign: 'center',
                maxWidth: '620px',
                margin: '32px auto 40px auto',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
                background: 'linear-gradient(145deg, #191B24 0%, #12131A 100%)',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 20px auto',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(240, 185, 11, 0.12)',
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px solid rgba(240, 185, 11, 0.3)',
                  boxShadow: '0 4px 20px rgba(240, 185, 11, 0.15)',
                }}
              >
                <Calendar size={40} style={{ color: '#F0B90B' }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                Interviews
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#9599A6', maxWidth: '480px', margin: '0 auto 26px auto', lineHeight: 1.6 }}>
                Schedule interviews with candidates who have applied for positions. Setup video meetings, in-person rounds, panel assignments, and Google Calendar sync.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleOpenCreateInterview}
                  style={{
                    padding: '12px 32px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    backgroundColor: '#F0B90B',
                    color: '#0D0E12',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(240, 185, 11, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>Create Interview</span>
                </button>
              </div>
            </div>
          )}




          {/* ── Section: Dynamic Inline Configuration Form (Rendered Directly On Page) ── */}
          {showInlineForm && (
            <div
              id="intelli-inline-interview-form"
              style={{
                backgroundColor: '#16171F',
                border: '1px solid rgba(240, 185, 11, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                position: 'relative',
                zIndex: 1,
                width: '100%',
                marginTop: '10px',
              }}
            >
              <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator,
                input[type="time"]::-webkit-calendar-picker-indicator {
                  opacity: 0 !important;
                  width: 32px !important;
                  height: 100% !important;
                  position: absolute !important;
                  right: 0 !important;
                  top: 0 !important;
                  cursor: pointer !important;
                  z-index: 2;
                }

                select.form-control, select {
                  appearance: none !important;
                  -webkit-appearance: none !important;
                  -moz-appearance: none !important;
                  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23F0B90B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") !important;
                  background-repeat: no-repeat !important;
                  background-position: right 12px center !important;
                  background-size: 14px !important;
                  padding-right: 36px !important;
                }

                .slot-form input.form-control, 
                .slot-form select.form-control,
                .slot-form select {
                  border: 1px solid rgba(255, 255, 255, 0.25) !important;
                }

                .slot-form input.form-control:focus, 
                .slot-form select.form-control:focus {
                  border-color: #F0B90B !important;
                  box-shadow: 0 0 0 2px rgba(240, 185, 11, 0.2) !important;
                }
              `}</style>

              {/* ── Form Header ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', borderLeft: '4px solid #F0B90B', paddingLeft: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    {editingSlotId
                      ? `Edit Interview Time Slot #${editingSlotId}`
                      : (activeZohoType === 'In-Person'
                        ? 'Schedule In-person Physical Interview'
                        : (activeZohoType === 'Log'
                          ? 'Log Completed / Past Interview Data'
                          : 'Schedule Online Video Interview'))}
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: '#9599A6', margin: '4px 0 0 0' }}>
                    {activeZohoType === 'In-Person'
                      ? 'Set up physical office venue, room location, building access & panel members'
                      : (activeZohoType === 'Log'
                        ? 'Log past candidate interview outcome, ratings, and panel evaluation notes'
                        : 'Configure Google Meet / MS Teams link, panel member emails, and calendar sync')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInlineForm(false)}
                  style={{ fontSize: '1.4rem', color: '#9599A6', cursor: 'pointer', background: 'none', border: 'none', padding: '0 4px', lineHeight: 1 }}
                  title="Close Form"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="slot-form">

                {/* ── Section 1: Job Position & Vacancy ── */}
                <div style={{ padding: '18px', backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                        1. JOB POSITION &amp; VACANCY
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#9599A6' }}>
                        The vacancy this interview time slot and panel allocation applies to.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, backgroundColor: '#1E222D', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#9599A6', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.03em' }}>
                        Selected Vacancy
                      </label>
                      <select
                        name="jobPosition"
                        value={formData.jobPosition}
                        onChange={(e) => {
                          handleFieldChange(e);
                          setPositionFilter(e.target.value);
                          setSelectedCandidates([]);
                          setSelectedSlotKey(null);
                          setSelectedSlotId(null);
                          setAutoAssignSummary(null);
                        }}
                        className="form-control"
                        style={{ fontSize: '0.84rem', backgroundColor: '#16171F', color: '#FFFFFF', width: '100%' }}
                      >
                        {Array.from(new Set([
                          formData.jobPosition,
                          'Product Designer',
                          'Senior Software Engineer',
                          'Senior Fullstack Engineer',
                          'UI/UX Designer',
                          'QA Automation Engineer',
                          'Business Analyst',
                          'Product Manager',
                          'DevOps Lead',
                          ...(Array.isArray(VACANCIES) ? VACANCIES.map(v => v.title) : [])
                        ])).filter(Boolean).map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Select Interview Round ── */}
                <div style={{ padding: '18px', backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                        2. SELECT INTERVIEW ROUND
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#9599A6' }}>
                        Select the interview round you are scheduling for, or add a missing round.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {!showCustomInput ? (
                        <button
                          type="button"
                          onClick={() => setShowCustomInput(true)}
                          style={{
                            backgroundColor: 'rgba(240, 185, 11, 0.12)',
                            color: '#F0B90B',
                            border: '1px solid #F0B90B',
                            borderRadius: '8px',
                            padding: '5px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Plus size={14} style={{ color: '#F0B90B' }} />
                          <span>Add Missing Round</span>
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="New round name..."
                            value={customRoundInput}
                            onChange={(e) => setCustomRoundInput(e.target.value)}
                            className="form-control"
                            style={{ fontSize: '0.8rem', backgroundColor: '#1E222D', color: '#FFFFFF', padding: '4px 8px' }}
                          />
                          <button
                            type="button"
                            className="btn-primary-accent"
                            onClick={handleAddCustomRound}
                            style={{ padding: '5px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="btn-ghost-dark"
                            onClick={() => setShowCustomInput(false)}
                            style={{ padding: '5px 8px', fontSize: '0.78rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, backgroundColor: '#1E222D', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#9599A6', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.03em' }}>
                        Selected Round
                      </label>
                      <select
                        name="interviewRound"
                        value={formData.interviewRound}
                        onChange={handleFieldChange}
                        className="form-control"
                        style={{ fontSize: '0.84rem', backgroundColor: '#16171F', color: '#FFFFFF', width: '100%' }}
                      >
                        {formData.interviewRound && !['Technical Interview', 'HR Screening', 'HR Portfolio Review', 'Technical / Live Coding', 'System Design Architecture', 'Final Management Round', 'Final Cultural Fit', 'Portfolio Review', 'Management Round', ...roundTypes].includes(formData.interviewRound) && (
                          <option value={formData.interviewRound}>{formData.interviewRound}</option>
                        )}
                        <option value="Technical Interview">Technical Interview</option>
                        <option value="HR Screening">HR Screening</option>
                        <option value="HR Portfolio Review">HR Portfolio Review</option>
                        <option value="Technical / Live Coding">Technical / Live Coding</option>
                        <option value="System Design Architecture">System Design Architecture</option>
                        <option value="Final Management Round">Final Management Round</option>
                        <option value="Final Cultural Fit">Final Cultural Fit</option>
                        <option value="Portfolio Review">Portfolio Review</option>
                        <option value="Management Round">Management Round</option>
                        {roundTypes.filter(rt => !['Technical Interview', 'HR Screening', 'HR Portfolio Review', 'Technical / Live Coding', 'System Design Architecture', 'Final Management Round', 'Final Cultural Fit', 'Portfolio Review', 'Management Round'].includes(rt)).map((rt, i) => (
                          <option key={i} value={rt}>{rt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Panel Assignments & Time Slots Generator ── */}
                <div style={{ padding: '18px', backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {activeZohoType === 'Log' ? '3. CONDUCTED SESSION PANEL & TIME SLOT' : '3. PANEL ASSIGNMENTS & DYNAMIC TIME SLOTS GENERATOR'}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#9599A6' }}>
                        {activeZohoType === 'Log'
                          ? 'Record panel member emails & the completed interview session time'
                          : 'Set candidate capacity per panel to auto-generate exact time slots & sync panel emails to Google Calendar'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPanel}
                      style={{
                        backgroundColor: 'rgba(240, 185, 11, 0.15)',
                        color: '#F0B90B',
                        border: '1px solid #F0B90B',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Plus size={14} style={{ color: '#F0B90B' }} />
                      <span>Add Panel</span>
                    </button>
                  </div>

                  {panels.map((p, pIdx) => {
                    const weekDays = getWeekDays(p.selectedDate);
                    return (
                      <div key={p.id} style={{ marginBottom: '16px', backgroundColor: '#1E222D', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)', overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '380px' }}>

                          {/* Left Column: Panel Info */}
                          <div style={{ padding: '16px', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '12px' }}>
                              <input
                                type="text"
                                value={p.name}
                                onChange={(e) => handlePanelNameChange(p.id, e.target.value)}
                                className="form-control"
                                style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem', width: '100%', padding: '6px 12px', backgroundColor: '#16171F', borderRadius: '6px', marginBottom: '12px' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600, margin: 0 }}>
                                  TOTAL CANDIDATE CAPACITY:
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max={Math.max(1, MOCK_CANDIDATES.filter(c => c.shortlisted).length)}
                                  value={p.capacity}
                                  onChange={(e) => handlePanelCapacityChange(p.id, e.target.value)}
                                  className="form-control"
                                  style={{ backgroundColor: '#16171F', color: '#FFFFFF', width: '80px', padding: '4px 8px' }}
                                />
                                <span style={{ color: '#22C55E', fontWeight: 500, fontSize: '0.7rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                                  Total shortlisted count: {MOCK_CANDIDATES.filter(c => c.shortlisted).length}
                                </span>
                              </div>
                            </div>

                            <div style={{ flex: 1 }}>
                              <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600, display: 'block', marginBottom: '8px' }}>PANEL MEMBER EMAILS (ATTENDEES)</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(p.emails ? p.emails.split(',') : ['']).map((emailStr, eIdx) => (
                                  <div key={eIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                      type="email"
                                      value={emailStr.trim()}
                                      onChange={(e) => {
                                        const emailArr = p.emails ? p.emails.split(',').map((item) => item.trim()) : [''];
                                        emailArr[eIdx] = e.target.value;
                                        handlePanelEmailChange(p.id, emailArr.join(', '));
                                      }}
                                      className="form-control"
                                      placeholder={`Evaluator #${eIdx + 1} Email`}
                                      style={{ fontSize: '0.84rem', backgroundColor: '#16171F', color: '#FFFFFF' }}
                                    />
                                    {(p.emails ? p.emails.split(',').length : 1) > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const emailArr = p.emails.split(',').map((item) => item.trim()).filter((_, idx) => idx !== eIdx);
                                          handlePanelEmailChange(p.id, emailArr.join(', '));
                                        }}
                                        style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const emailArr = p.emails ? p.emails.split(',').map((item) => item.trim()) : [];
                                    emailArr.push('');
                                    handlePanelEmailChange(p.id, emailArr.join(', '));
                                  }}
                                  style={{
                                    backgroundColor: 'rgba(240, 185, 11, 0.15)',
                                    color: '#F0B90B',
                                    border: '1px solid #F0B90B',
                                    borderRadius: '6px',
                                    padding: '4px 12px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    width: 'fit-content',
                                    marginTop: '4px'
                                  }}
                                >
                                  <Plus size={13} style={{ color: '#F0B90B' }} />
                                  <span>Add Email</span>
                                </button>
                              </div>
                            </div>

                            {panels.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePanel(p.id)}
                                style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, alignSelf: 'flex-start', marginTop: '16px' }}
                              >
                                Remove Panel
                              </button>
                            )}
                          </div>

                          {/* Right Column: Calendar View */}
                          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#13141C' }}>
                            {/* Date Picker Header */}
                            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#9599A6', fontWeight: 600, fontSize: '0.75rem' }}>CALENDAR DATE</span>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  value={p.selectedDate}
                                  placeholder="YYYY-MM-DD"
                                  onChange={(e) => {
                                    handlePanelDateChange(p.id, e.target.value);
                                  }}
                                  style={{
                                    backgroundColor: '#1E222D',
                                    color: '#FFFFFF',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    padding: '4px 28px 4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    colorScheme: 'dark',
                                    width: '135px',
                                    cursor: 'text'
                                  }}
                                />
                                <input
                                  type="date"
                                  value={p.selectedDate}
                                  onChange={(e) => {
                                    if (e.target.value) handlePanelDateChange(p.id, e.target.value);
                                  }}
                                  id={`panel-native-date-${p.id}`}
                                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                                />
                                <button
                                  type="button"
                                  title="Pick date from calendar"
                                  onClick={() => {
                                    const el = document.getElementById(`panel-native-date-${p.id}`);
                                    if (el && el.showPicker) {
                                      try { el.showPicker(); } catch (_) { }
                                    } else if (el) {
                                      el.click();
                                    }
                                  }}
                                  style={{ position: 'absolute', right: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                >
                                  <Calendar size={14} style={{ color: '#F0B90B' }} />
                                </button>
                              </div>
                            </div>

                            {/* Date Strip */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#16171F', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              {weekDays.map((wd, i) => {
                                const y = wd.getFullYear();
                                const m = String(wd.getMonth() + 1).padStart(2, '0');
                                const d = String(wd.getDate()).padStart(2, '0');
                                const wdStr = `${y}-${m}-${d}`;
                                const isPast = wdStr < todayInputValue;
                                const isSelected = wdStr === p.selectedDate;
                                const dayLabel = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][wd.getDay()];
                                const dateNum = wd.getDate();
                                return (
                                  <div
                                    key={i}
                                    onClick={() => {
                                      if (isPast) return;
                                      handlePanelDateChange(p.id, wdStr);
                                    }}
                                    title={isPast ? 'Previous dates cannot be selected' : wdStr}
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      cursor: isPast ? 'not-allowed' : 'pointer',
                                      gap: '6px',
                                      opacity: isPast ? 0.35 : 1
                                    }}
                                  >
                                    <span style={{ fontSize: '0.75rem', color: isPast ? '#666' : isSelected ? '#FFFFFF' : '#9599A6', fontWeight: 600 }}>{dayLabel}</span>
                                    <div style={{
                                      width: '28px', height: '28px', borderRadius: '50%',
                                      backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                                      color: isSelected ? '#000000' : isPast ? '#666' : '#FFFFFF',
                                      textDecoration: isPast ? 'line-through' : 'none',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s'
                                    }}>
                                      {dateNum}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Simple Slots List for Selected Date */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E222D', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '8px' }}>
                                <label className="form-label" style={{ fontSize: '0.8rem', color: '#9599A6', fontWeight: 700, margin: 0 }}>SLOTS FOR THIS DAY:</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={p.slots.filter(s => s.date === p.selectedDate).length}
                                    onChange={(e) => handleDailySlotCountChange(p.id, p.selectedDate, e.target.value)}
                                    className="form-control"
                                    style={{ backgroundColor: '#13141C', color: '#FFFFFF', width: '60px', padding: '6px 8px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddManualSlot(p.id, p.selectedDate)}
                                    style={{
                                      backgroundColor: 'rgba(240, 185, 11, 0.15)',
                                      color: '#F0B90B',
                                      border: '1px solid #F0B90B',
                                      borderRadius: '6px',
                                      padding: '5px 12px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    <Plus size={13} />
                                    <span>Add Slot</span>
                                  </button>
                                </div>
                              </div>

                              {p.selectedDate === todayInputValue && new Date().getHours() >= 17 && (
                                <div style={{
                                  backgroundColor: 'rgba(240, 185, 11, 0.12)',
                                  border: '1px solid rgba(240, 185, 11, 0.3)',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  color: '#F0B90B',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '8px'
                                }}>
                                  <Clock size={14} />
                                  <span>Today interview hours have ended (after 5 PM). Slots scheduled on today are marked past; select tomorrow for new interviews.</span>
                                </div>
                              )}

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {p.slots.filter(s => s.date === p.selectedDate).map((s, idx) => {
                                  const isConflict = hasTimeConflict(p, s);
                                  const isPastTime = isSlotTimeInPast(s.date, s.startTime);
                                  return (
                                    <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        backgroundColor: isConflict ? 'rgba(239, 68, 68, 0.12)' : (isPastTime ? 'rgba(255, 255, 255, 0.03)' : 'rgba(66, 133, 244, 0.1)'),
                                        borderLeft: `3px solid ${isConflict ? '#EF4444' : (isPastTime ? '#6E7079' : '#4285F4')}`,
                                        padding: '12px 16px',
                                        borderRadius: '6px',
                                        opacity: isPastTime ? 0.6 : 1,
                                        transition: 'all 0.2s'
                                      }}>
                                        <span style={{ color: isConflict ? '#EF4444' : '#9599A6', fontSize: '0.8rem', fontWeight: 600, width: '60px' }}>Slot #{idx + 1}</span>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                                          <input
                                            type="time"
                                            value={toTimeInputValue(s.startTime) || '09:00'}
                                            onChange={(e) => handleSlotTimeChange(p.id, s.id, 'startTime', e.target.value)}
                                            style={{
                                              backgroundColor: '#1E222D',
                                              color: '#FFFFFF',
                                              border: `1px solid ${isConflict ? '#EF4444' : 'rgba(255, 255, 255, 0.15)'}`,
                                              padding: '6px 32px 6px 12px',
                                              borderRadius: '6px',
                                              fontSize: '0.85rem',
                                              colorScheme: 'dark',
                                              width: '100%',
                                              cursor: 'pointer'
                                            }}
                                          />
                                          <Clock size={14} style={{ position: 'absolute', right: '12px', color: isConflict ? '#EF4444' : (isPastTime ? '#6E7079' : '#4285F4'), pointerEvents: 'none' }} />
                                        </div>
                                        {isPastTime && (
                                          <span style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                            Past Time
                                          </span>
                                        )}
                                        <button
                                          onClick={() => handleRemoveManualSlot(p.id, s.id)}
                                          style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            color: '#EF4444',
                                            cursor: 'pointer',
                                            fontSize: '1.1rem',
                                            lineHeight: 1,
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                          }}
                                          title="Remove Slot"
                                        >
                                          ×
                                        </button>
                                      </div>
                                      {isConflict && (
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          color: '#EF4444',
                                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                          borderRadius: '6px',
                                          padding: '4px 10px',
                                          fontSize: '0.72rem',
                                          fontWeight: 600
                                        }}>
                                          <AlertCircle size={13} style={{ flexShrink: 0 }} />
                                          <span>⚠️ {p.name || 'This Panel'} is already assigned at this time</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {p.slots.filter(s => s.date === p.selectedDate).length === 0 && (
                                  <div style={{ color: '#9599A6', fontSize: '0.85rem', textAlign: 'center', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                    <span>No slots added for this date.</span>
                                    <button
                                      type="button"
                                      onClick={() => handleAddManualSlot(p.id, p.selectedDate)}
                                      style={{
                                        backgroundColor: 'rgba(240, 185, 11, 0.15)',
                                        color: '#F0B90B',
                                        border: '1px solid #F0B90B',
                                        borderRadius: '8px',
                                        padding: '7px 16px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                      }}
                                    >
                                      <Plus size={14} />
                                      <span>+ Add Time Slot for this date</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Section 4: Mode-Specific Venue / Link Details ── */}
                <div style={{ padding: '18px', backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '12px', marginBottom: '18px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {activeZohoType === 'Log' ? '4. PAST EVALUATION RATING & RECOMMENDATION' : '4. ADDITIONAL DETAILS & VENUE'}
                  </h4>
                  <div className="form-grid-2">
                    {activeZohoType === 'In-Person' ? (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600 }}>PHYSICAL OFFICE VENUE &amp; ROOM LOCATION</label>
                        <input
                          type="text"
                          name="meetingLocation"
                          placeholder="e.g. Executive Boardroom 3B, 2nd Floor, HQ Building"
                          value={formData.meetingLocation}
                          onChange={handleFieldChange}
                          className="form-control"
                          style={{ backgroundColor: '#1E222D', color: '#FFFFFF' }}
                        />
                      </div>
                    ) : activeZohoType === 'Log' ? (
                      <>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600 }}>CANDIDATE EVALUATION RATING</label>
                          <div className="select-input-wrap">
                            <select className="form-control" style={{ backgroundColor: '#1E222D', color: '#FFFFFF' }}>
                              <option value="5">⭐⭐⭐⭐⭐ (5 Stars - Exceptional)</option>
                              <option value="4">⭐⭐⭐⭐ (4 Stars - Strong Hire)</option>
                              <option value="3">⭐⭐⭐ (3 Stars - Average / Borderline)</option>
                              <option value="2">⭐⭐ (2 Stars - Weak Candidate)</option>
                              <option value="1">⭐ (1 Star - Reject)</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600 }}>FINAL HIRING DECISION RECOMMENDATION</label>
                          <div className="select-input-wrap">
                            <select className="form-control" style={{ backgroundColor: '#1E222D', color: '#FFFFFF' }}>
                              <option value="NEXT_ROUND">✅ Recommended for Next Round</option>
                              <option value="HIRED">🎉 Direct Hire Recommendation</option>
                              <option value="HOLD">⏳ Hold / Under Further Review</option>
                              <option value="REJECTED">❌ Not Recommended / Rejected</option>
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="form-group">
                        {/* Interview Platform Selector */}
                        <div style={{ marginBottom: '10px' }}>
                          <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                            SELECT INTERVIEW PLATFORM
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                const validMeetUrl = generateValidMeetingUrl('Google Meet');
                                setFormData(prev => ({
                                  ...prev,
                                  interviewMedia: 'Google Meet',
                                  meetingLocation: validMeetUrl
                                }));
                                setToast({ type: 'success', message: 'Switched to Google Meet' });
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: (formData.interviewMedia || 'Google Meet') === 'Google Meet' ? '1px solid #4285F4' : '1px solid #2A2C38',
                                backgroundColor: (formData.interviewMedia || 'Google Meet') === 'Google Meet' ? 'rgba(66, 133, 244, 0.15)' : '#1E222D',
                                color: (formData.interviewMedia || 'Google Meet') === 'Google Meet' ? '#60A5FA' : '#9599A6',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Video size={13} />
                              <span>Google Meet</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const validTeamsUrl = generateValidMeetingUrl('Microsoft Teams');
                                setFormData(prev => ({
                                  ...prev,
                                  interviewMedia: 'Microsoft Teams',
                                  meetingLocation: validTeamsUrl
                                }));
                                setToast({ type: 'success', message: 'Switched to Microsoft Teams' });
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: formData.interviewMedia === 'Microsoft Teams' ? '1px solid #7C3AED' : '1px solid #2A2C38',
                                backgroundColor: formData.interviewMedia === 'Microsoft Teams' ? 'rgba(124, 58, 237, 0.15)' : '#1E222D',
                                color: formData.interviewMedia === 'Microsoft Teams' ? '#A78BFA' : '#9599A6',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Video size={13} />
                              <span>MS Teams</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const validZoomUrl = generateValidMeetingUrl('Zoom');
                                setFormData(prev => ({
                                  ...prev,
                                  interviewMedia: 'Zoom',
                                  meetingLocation: validZoomUrl
                                }));
                                setToast({ type: 'success', message: 'Switched to Zoom' });
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: formData.interviewMedia === 'Zoom' ? '1px solid #0284C7' : '1px solid #2A2C38',
                                backgroundColor: formData.interviewMedia === 'Zoom' ? 'rgba(2, 132, 199, 0.15)' : '#1E222D',
                                color: formData.interviewMedia === 'Zoom' ? '#38BDF8' : '#9599A6',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Video size={13} />
                              <span>Zoom</span>
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                          <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600, margin: 0 }}>
                            ONLINE MEETING LINK ({((formData.interviewMedia || 'Google Meet').toUpperCase())})
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {(!formData.interviewMedia || formData.interviewMedia === 'Google Meet') && (
                              <a
                                href="https://meet.google.com/new"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backgroundColor: 'rgba(66, 133, 244, 0.12)',
                                  border: '1px solid rgba(66, 133, 244, 0.35)',
                                  color: '#60A5FA',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.70rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Open an instant live Google Meet room directly on Google servers"
                              >
                                <Video size={11} />
                                <span>Instant Call (meet.new) ↗</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const media = formData.interviewMedia || 'Google Meet';
                                const genUrl = generateValidMeetingUrl(media);
                                setFormData(prev => ({ ...prev, meetingLocation: genUrl }));
                                setToast({ type: 'success', message: `Valid ${media} link generated!` });
                              }}
                              title={`Generate a valid format ${formData.interviewMedia || 'Google Meet'} link`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: 'rgba(240, 185, 11, 0.15)',
                                border: '1px solid #F0B90B',
                                color: '#F0B90B',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Sparkles size={12} />
                              <span>⚡ Generate {formData.interviewMedia === 'Microsoft Teams' ? 'Teams' : formData.interviewMedia === 'Zoom' ? 'Zoom' : 'Meet'} Link</span>
                            </button>
                          </div>
                        </div>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="text"
                            name="meetingLocation"
                            placeholder={formData.interviewMedia === 'Microsoft Teams' ? 'e.g. https://teams.microsoft.com/l/meetup-join/...' : formData.interviewMedia === 'Zoom' ? 'e.g. https://zoom.us/j/...' : 'e.g. https://meet.google.com/sde-conf-mtg'}
                            value={formData.meetingLocation}
                            onChange={handleFieldChange}
                            className="form-control"
                            style={{ backgroundColor: '#1E222D', color: '#FFFFFF', paddingRight: formData.meetingLocation ? '95px' : '12px' }}
                          />
                          {formData.meetingLocation && (
                            <a
                              href={formData.meetingLocation}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                position: 'absolute',
                                right: '8px',
                                backgroundColor: 'rgba(66, 133, 244, 0.15)',
                                color: '#60A5FA',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                textDecoration: 'none'
                              }}
                            >
                              <ExternalLink size={11} /> Test Link
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="form-group" style={{ gridColumn: activeZohoType === 'Log' ? 'span 2' : 'auto' }}>
                      <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600 }}>
                        {activeZohoType === 'In-Person'
                          ? 'SECURITY & BUILDING INSTRUCTIONS'
                          : (activeZohoType === 'Log'
                            ? 'PANEL EVALUATION FEEDBACK NOTES & REMARKS'
                            : 'ADDITIONAL INSTRUCTIONS')}
                      </label>
                      <input
                        type="text"
                        name="additionalNotes"
                        placeholder={
                          activeZohoType === 'In-Person'
                            ? 'e.g. Show ID at main reception, visitor pass required...'
                            : (activeZohoType === 'Log'
                              ? 'e.g. Excellent problem solving skills, strong technical depth...'
                              : 'Instructions for panel members or candidates...')
                        }
                        value={formData.additionalNotes}
                        onChange={handleFieldChange}
                        className="form-control"
                        style={{ backgroundColor: '#1E222D', color: '#FFFFFF' }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section 5: Auto-Assign Candidates Preview ── */}
                {!editingSlotId && activeZohoType !== 'Log' && (
                  <div style={{ padding: '18px', backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '12px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                        5. CANDIDATE MATCHING &amp; ALLOCATION
                      </h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!showPreview) {
                              let candIdx = 0;
                              const shortlisted = currentShortlisted || [];
                              if (shortlisted.length > 0) {
                                const nextPanels = panels.map(p => ({
                                  ...p,
                                  slots: p.slots.map(s => {
                                    if (s.assignedCandidate) return s;
                                    const c = shortlisted[candIdx % shortlisted.length];
                                    candIdx++;
                                    return { ...s, assignedCandidate: c };
                                  })
                                }));
                                setPanels(nextPanels);
                                syncCandidateAllocations(nextPanels);
                                setToast({ type: 'success', message: 'Auto-assigned candidates across configured panels.' });
                              }
                            }
                            setShowPreview(!showPreview);
                            if (showManualAssign) setShowManualAssign(false);
                          }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '6px',
                            backgroundColor: 'rgba(240, 185, 11, 0.1)', border: '1px solid #F0B90B', color: '#F0B90B',
                            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          <Sparkles size={14} />
                          {showPreview ? 'Hide Candidate Matches' : 'Auto-Assign Candidates'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowManualAssign(!showManualAssign);
                            if (showPreview) setShowPreview(false);
                          }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '6px',
                            backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#FFFFFF',
                            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          <Users size={14} />
                          {showManualAssign ? 'Hide Manual Assignment' : 'Manually Assign Candidates'}
                        </button>
                      </div>
                    </div>

                    {showPreview && (
                      <div style={{ padding: '16px', backgroundColor: '#13141C', border: '1px solid #2A2C38', borderRadius: '12px' }}>
                        {currentShortlisted.length === 0 ? (
                          <div style={{ padding: '24px', textAlign: 'center' }}>
                            <Users size={32} style={{ color: '#9599A6', marginBottom: '12px', opacity: 0.5, display: 'inline-block' }} />
                            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '8px', fontWeight: 600 }}>
                              No Shortlisted Candidates
                            </h4>
                            <p style={{ color: '#9599A6', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.6' }}>
                              There are currently no shortlisted candidates available for {formData.jobPosition}. Proceed to the Applicants section to review and shortlist candidates.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="btn-primary-accent"
                                onClick={() => navigate('/recruiter/applicants/ranked')}
                                style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem' }}
                              >
                                Go to Applicants Section
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                              <CheckCircle2 size={16} style={{ color: '#22C55E' }} />
                              <h5 style={{ margin: 0, color: '#FFFFFF', fontSize: '0.85rem' }}>AI Auto-Assignment Preview</h5>
                            </div>
                            <p style={{ margin: '0 0 16px 0', fontSize: '0.75rem', color: '#9599A6' }}>
                              The following top-ranked shortlisted candidates will be matched and assigned to your configured panels upon saving. You can modify assignments if needed.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {panels.map((p, idx) => (
                                <div key={p.id} style={{ padding: '12px', backgroundColor: '#1E222D', borderRadius: '8px', border: '1px solid #2A2C38' }}>
                                  <strong style={{ color: '#F0B90B', fontSize: '0.75rem', display: 'block', marginBottom: '10px' }}>{p.name}</strong>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {p.slots.map((s, sIdx) => {
                                      const c = s.assignedCandidate;
                                      return (
                                        <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingBottom: '6px', borderBottom: sIdx < p.slots.length - 1 ? '1px solid #2A2C38' : 'none' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9599A6', minWidth: '150px' }}>
                                            <Clock size={12} />
                                            <span>{formatTime(s.startTime || '09:00')} – {formatTime(s.endTime || getEndTime(s.startTime || '09:00'))}</span>
                                          </div>

                                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <select
                                              value={c?.name || ''}
                                              onChange={(e) => {
                                                const newCandName = e.target.value;
                                                const selectedCand = currentShortlisted.find(cand => cand.name === newCandName) || null;
                                                const nextPanels = panels.map(pan => pan.id === p.id ? {
                                                  ...pan,
                                                  slots: pan.slots.map(slot => slot.id === s.id ? { ...slot, assignedCandidate: selectedCand } : slot)
                                                } : pan);
                                                setPanels(nextPanels);
                                                syncCandidateAllocations(nextPanels);
                                              }}
                                              style={{
                                                backgroundColor: '#1E222D', color: '#FFFFFF',
                                                border: '1px solid #2A2C38', borderRadius: '6px',
                                                padding: '6px 8px', fontSize: '0.75rem', outline: 'none',
                                                flex: 1
                                              }}
                                            >
                                              <option value="">Select Candidate...</option>
                                              {currentShortlisted.filter(cand => !panels.some(pan => pan.slots.some(slot => slot.id !== s.id && slot.assignedCandidate?.name === cand.name))).map(cand => (
                                                <option key={cand.name} value={cand.name}>{cand.name} ({cand.score}%)</option>
                                              ))}
                                            </select>

                                            {c && (
                                              <span style={{ color: '#22C55E', fontWeight: 500, fontSize: '0.7rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                                                {c.score || 90}% Match
                                              </span>
                                            )}
                                          </div>

                                          <div style={{ marginLeft: '16px' }}>
                                            <button
                                              type="button"
                                              onClick={(e) => { e.preventDefault(); setViewingCandidate(c); }}
                                              disabled={!c}
                                              style={{
                                                background: 'none', border: '1px solid rgba(96, 165, 250, 0.3)', color: c ? '#60A5FA' : '#9599A6',
                                                fontSize: '0.7rem', cursor: c ? 'pointer' : 'not-allowed', padding: '4px 10px', borderRadius: '4px',
                                                backgroundColor: c ? 'rgba(96, 165, 250, 0.05)' : 'transparent', fontWeight: 600
                                              }}
                                            >
                                              View Details
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {showManualAssign && (
                      <div style={{ padding: '16px', backgroundColor: '#13141C', border: '1px solid #2A2C38', borderRadius: '12px', marginTop: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '0.85fr auto 1.15fr', gap: '20px', alignItems: 'flex-start' }}>

                          {/* Left side: Shortlisted Candidates */}
                          <div style={{ backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '12px', padding: '16px', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={16} style={{ color: '#F0B90B' }} />
                                <h5 style={{ margin: 0, color: '#FFFFFF', fontSize: '0.9rem' }}>Shortlisted Candidates</h5>
                              </div>
                              <span style={{ backgroundColor: '#1E222D', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', color: '#9599A6', fontWeight: 600 }}>
                                {unallocatedShortlisted.length} REMAINING
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '36px 1.6fr 1fr 1fr', paddingBottom: '12px', borderBottom: '1px solid #2A2C38', fontSize: '0.7rem', color: '#9599A6', fontWeight: 700, textTransform: 'uppercase' }}>
                              <div></div>
                              <div>Candidate Name</div>
                              <div>Score</div>
                              <div></div>
                            </div>

                            <div>
                              {unallocatedShortlisted.length === 0 ? (
                                <div style={{ padding: '24px 0', textAlign: 'center', color: '#9599A6', fontSize: '0.82rem' }}>
                                  {currentShortlisted.length === 0
                                    ? `No shortlisted candidates found for ${formData.jobPosition}.`
                                    : 'All shortlisted candidates have been allocated to slots!'}
                                </div>
                              ) : (
                                unallocatedShortlisted.map((cand, idx) => {
                                  return (
                                    <div key={cand.id || idx} style={{ display: 'grid', gridTemplateColumns: '36px 1.6fr 1fr 1fr', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #2A2C38' }}>
                                      <div>
                                        <input
                                          type="radio"
                                          name="candidateSelect"
                                          checked={selectedCandidates.includes(cand.name)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedCandidates([cand.name]);
                                            }
                                          }}
                                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                      </div>
                                      <div>
                                        <div style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <span>{cand.name}</span>
                                        </div>
                                        <div style={{ color: '#9599A6', fontSize: '0.72rem' }}>{cand.role || formData.jobPosition}</div>
                                      </div>
                                      <div style={{ color: '#22C55E', fontSize: '0.85rem', fontWeight: 700 }}>{cand.score}%</div>
                                      <div>
                                        <button
                                          type="button"
                                          onClick={(e) => { e.preventDefault(); setViewingCandidate(cand); }}
                                          style={{
                                            background: 'none', border: '1px solid rgba(96, 165, 250, 0.3)', color: '#60A5FA',
                                            fontSize: '0.7rem', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px',
                                            backgroundColor: 'rgba(96, 165, 250, 0.05)', fontWeight: 600
                                          }}
                                        >
                                          View Details
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Middle side: Allocate/Remove buttons */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '40px' }}>
                            <div style={{ backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '12px', padding: '16px', width: '140px', textAlign: 'center' }}>
                              <div style={{ color: '#F0B90B', fontSize: '1.2rem', fontWeight: 800 }}>{selectedCandidates.length}</div>
                              <div style={{ color: '#9599A6', fontSize: '0.75rem', marginBottom: '8px' }}>
                                {selectedCandidates.length === 1 ? 'candidate' : 'candidates'}
                              </div>
                              <div style={{ color: '#9599A6', fontSize: '0.65rem' }}>{selectedSlotKey ? 'Slot selected' : 'No slot selected'}</div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (selectedCandidates.length > 0 && selectedSlotKey) {
                                  const candObj = unallocatedShortlisted.find(c => c.name === selectedCandidates[0]) || currentShortlisted.find(c => c.name === selectedCandidates[0]);
                                  if (!candObj) return;
                                  const nextPanels = panels.map(p => ({
                                    ...p,
                                    slots: p.slots.map(s => {
                                      if (`${p.id}-${s.id}` === selectedSlotKey) {
                                        return { ...s, assignedCandidate: candObj };
                                      }
                                      return s;
                                    })
                                  }));
                                  setPanels(nextPanels);
                                  syncCandidateAllocations(nextPanels);
                                  setToast({ type: 'success', message: `Allocated ${candObj.name} to slot successfully!` });
                                  setSelectedCandidates([]);
                                  setSelectedSlotKey(null);
                                  setSelectedSlotId(null);
                                  setAutoAssignSummary(null);
                                }
                              }}
                              disabled={selectedCandidates.length === 0 || !selectedSlotKey}
                              style={{
                                backgroundColor: (selectedCandidates.length > 0 && selectedSlotKey) ? '#F0B90B' : 'rgba(240, 185, 11, 0.5)',
                                color: '#0D0E12',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: (selectedCandidates.length > 0 && selectedSlotKey) ? 'pointer' : 'not-allowed',
                                width: '140px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              Allocate <ArrowRight size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (selectedSlotKey) {
                                  const nextPanels = panels.map(p => ({
                                    ...p,
                                    slots: p.slots.map(s => {
                                      if (`${p.id}-${s.id}` === selectedSlotKey) {
                                        return { ...s, assignedCandidate: null };
                                      }
                                      return s;
                                    })
                                  }));
                                  setPanels(nextPanels);
                                  syncCandidateAllocations(nextPanels);
                                  setToast({ type: 'success', message: 'Candidate removed from slot.' });
                                  setSelectedCandidates([]);
                                  setSelectedSlotKey(null);
                                  setSelectedSlotId(null);
                                  setAutoAssignSummary(null);
                                } else if (selectedCandidates.length > 0) {
                                  const candName = selectedCandidates[0];
                                  const nextPanels = panels.map(p => ({
                                    ...p,
                                    slots: p.slots.map(s => {
                                      if (s.assignedCandidate && s.assignedCandidate.name === candName) {
                                        return { ...s, assignedCandidate: null };
                                      }
                                      return s;
                                    })
                                  }));
                                  setPanels(nextPanels);
                                  syncCandidateAllocations(nextPanels);
                                  setToast({ type: 'success', message: `Removed allocation for ${candName}.` });
                                  setSelectedCandidates([]);
                                  setSelectedSlotKey(null);
                                  setSelectedSlotId(null);
                                  setAutoAssignSummary(null);
                                }
                              }}
                              disabled={!selectedSlotKey && selectedCandidates.length === 0}
                              style={{
                                backgroundColor: 'transparent',
                                color: '#9599A6',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '1px solid #2A2C38',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: (selectedSlotKey || selectedCandidates.length > 0) ? 'pointer' : 'not-allowed',
                                width: '140px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: (selectedSlotKey || selectedCandidates.length > 0) ? 1 : 0.5
                              }}
                            >
                              <ArrowLeft size={14} /> Remove
                            </button>
                          </div>

                          {/* Right side: Available Time Slots */}
                          <div style={{ backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '12px', padding: '16px', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CalendarDays size={16} style={{ color: '#F0B90B' }} />
                                <h5 style={{ margin: 0, color: '#FFFFFF', fontSize: '0.9rem' }}>Available Time Slots</h5>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const shortlisted = [...currentShortlisted].sort((a, b) => (b.score || 0) - (a.score || 0));
                                    if (shortlisted.length > 0) {
                                      let candIdx = 0;
                                      let summary = [];
                                      const nextPanels = panels.map(p => ({
                                        ...p,
                                        slots: p.slots.map(s => {
                                          if (s.assignedCandidate) {
                                            summary.push({ candidate: s.assignedCandidate, slot: { ...s, panelNo: p.id }, panelName: p.name });
                                            return s;
                                          }
                                          if (isSlotTimeInPast(s.date, s.startTime)) return s;
                                          if (candIdx >= shortlisted.length) return s;
                                          const c = shortlisted[candIdx];
                                          candIdx++;
                                          summary.push({ candidate: c, slot: { ...s, panelNo: p.id }, panelName: p.name });
                                          return { ...s, assignedCandidate: c };
                                        })
                                      }));

                                      while (candIdx < shortlisted.length) {
                                        summary.push({ candidate: shortlisted[candIdx], slot: null, panelName: 'Unassigned Candidates' });
                                        candIdx++;
                                      }

                                      setPanels(nextPanels);
                                      syncCandidateAllocations(nextPanels);
                                      setAutoAssignSummary(summary);
                                      setToast({ type: 'success', message: 'Auto-assigned candidates across available time slots.' });
                                    }
                                  }}
                                  style={{
                                    backgroundColor: 'rgba(240, 185, 11, 0.1)', border: '1px solid #F0B90B', color: '#F0B90B',
                                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
                                  }}
                                >
                                  <Sparkles size={12} /> Auto-Assign
                                </button>
                                {(() => {
                                  const availableCount = panels.reduce((sum, p) => sum + p.slots.filter(s => !s.assignedCandidate).length, 0);
                                  return (
                                    <span style={{ backgroundColor: '#1E222D', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', color: '#9599A6', fontWeight: 600 }}>
                                      {availableCount} SLOTS
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '32px 0.8fr 1.6fr 0.9fr 0.8fr 0.45fr 0.45fr 36px', paddingBottom: '12px', borderBottom: '1px solid #2A2C38', fontSize: '0.7rem', color: '#9599A6', fontWeight: 700, textTransform: 'uppercase' }}>
                              <div></div>
                              <div>Date</div>
                              <div>Time Period</div>
                              <div>Panel</div>
                              <div>Type</div>
                              <div style={{ textAlign: 'center' }}>Cap.</div>
                              <div style={{
                                textAlign:
                                  'center'
                              }}>Rem.</div>
                              <div style={{ textAlign: 'center' }}>Act.</div>
                            </div>

                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                              {(() => {
                                const currentSlotType = formData.interviewType || (activeZohoType === 'In-Person' || formData.interviewMedia === 'In-Person' ? 'Physical' : 'Online');
                                const availableSlots = panels.flatMap((p, pIdx) =>
                                  p.slots
                                    .filter(slot => !slot.assignedCandidate)
                                    .map(slot => ({
                                      ...slot,
                                      panelId: p.id,
                                      panelNo: pIdx + 1,
                                      panelActualName: p.name,
                                      type: slot.type || currentSlotType
                                    }))
                                );

                                if (availableSlots.length === 0) {
                                  return (
                                    <div style={{ padding: '28px 16px', textAlign: 'center', color: '#9599A6', fontSize: '0.82rem' }}>
                                      All created time slots have been allocated to candidates.
                                    </div>
                                  );
                                }

                                return availableSlots.map((slot) => {
                                  const slotKey = `${slot.panelId}-${slot.id}`;
                                  const isSelected = selectedSlotKey === slotKey;
                                  const isPast = isSlotTimeInPast(slot.date, slot.startTime);
                                  const formatTimeAmPm = (tStr) => {
                                    if (!tStr) return '09:00 AM';
                                    const m = tStr.match(/^(\d{1,2}):(\d{2})/);
                                    if (!m) return tStr;
                                    let h = parseInt(m[1], 10);
                                    const min = m[2];
                                    const p2 = h >= 12 ? 'PM' : 'AM';
                                    h = h % 12 || 12;
                                    return `${String(h).padStart(2, '0')}:${min} ${p2}`;
                                  };
                                  return (
                                    <div key={slotKey} style={{ display: 'grid', gridTemplateColumns: '32px 0.8fr 1.6fr 0.9fr 0.8fr 0.45fr 0.45fr 36px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #2A2C38', backgroundColor: isSelected ? 'rgba(240, 185, 11, 0.05)' : 'transparent', opacity: isPast ? 0.45 : 1 }}>
                                      <div>
                                        <input
                                          type="radio"
                                          name="selectedSlot"
                                          checked={isSelected}
                                          disabled={isPast}
                                          onChange={() => {
                                            if (isPast) return;
                                            setSelectedSlotKey(slotKey);
                                            setSelectedSlotId(slot.id);
                                          }}
                                          style={{ width: '16px', height: '16px', cursor: isPast ? 'not-allowed' : 'pointer' }}
                                        />
                                      </div>
                                      <div style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600 }}>{formatSlotDateShort(slot.date)}</div>
                                      <div style={{ color: '#FFFFFF', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                        <Clock size={12} style={{ color: '#9599A6' }} />
                                        <span>{formatTimeAmPm(slot.startTime)} – {formatTimeAmPm(slot.endTime || getEndTime(slot.startTime))}</span>
                                        {isPast && (
                                          <span style={{ marginLeft: '4px', color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                                            Past
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 600 }}>{formatPanelDisplayName(slot.panelActualName || `Panel ${slot.panelNo}`)}</div>
                                      <div>
                                        <span style={{
                                          backgroundColor: (slot.interviewMedia === 'Microsoft Teams' || (slot.meetingLocation && slot.meetingLocation.includes('teams')))
                                            ? 'rgba(124, 58, 237, 0.15)'
                                            : (slot.interviewMedia === 'Zoom' || (slot.meetingLocation && slot.meetingLocation.includes('zoom')))
                                            ? 'rgba(2, 132, 199, 0.15)'
                                            : slot.type === 'Online'
                                            ? 'rgba(66, 133, 244, 0.1)'
                                            : 'rgba(168, 85, 247, 0.1)',
                                          color: (slot.interviewMedia === 'Microsoft Teams' || (slot.meetingLocation && slot.meetingLocation.includes('teams')))
                                            ? '#A78BFA'
                                            : (slot.interviewMedia === 'Zoom' || (slot.meetingLocation && slot.meetingLocation.includes('zoom')))
                                            ? '#38BDF8'
                                            : slot.type === 'Online'
                                            ? '#60A5FA'
                                            : '#A855F7',
                                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600
                                        }}>
                                          {(slot.meetingLocation && slot.meetingLocation.includes('teams')) ? 'MS Teams' : (slot.meetingLocation && slot.meetingLocation.includes('zoom')) ? 'Zoom' : (slot.interviewMedia || slot.type)}
                                        </span>
                                      </div>
                                      <div style={{ textAlign: 'center', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 700 }}>1</div>
                                      <div style={{ textAlign: 'center', color: '#22C55E', fontSize: '0.82rem', fontWeight: 700 }}>1</div>
                                      <div style={{ textAlign: 'center' }}>
                                        <button
                                          type="button"
                                          title="Delete this time slot"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSlotFromAvailable(slot.panelId, slot.id);
                                          }}
                                          style={{
                                            background: 'rgba(239, 68, 68, 0.12)',
                                            border: '1px solid rgba(239, 68, 68, 0.35)',
                                            color: '#EF4444',
                                            cursor: 'pointer',
                                            width: '26px',
                                            height: '26px',
                                            borderRadius: '6px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 0,
                                            transition: 'all 0.15s ease'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                                          }}
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Auto Assign Summary Section */}
                        {autoAssignSummary && autoAssignSummary.length > 0 && (
                          <div style={{ marginTop: '24px', backgroundColor: '#16171F', border: '1px solid #22C55E', borderRadius: '12px', padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                              <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
                              <h5 style={{ margin: 0, color: '#FFFFFF', fontSize: '1rem', fontWeight: 700 }}>Auto-Assignment Details</h5>
                            </div>
                            <p style={{ color: '#9599A6', fontSize: '0.8rem', marginBottom: '20px', lineHeight: 1.5 }}>
                              Candidates have been optimally matched to available time slots based on their ranking score and earliest availability.
                            </p>

                            <div>
                              {(() => {
                                const allShortlisted = currentShortlisted;

                                const groupedByPanel = autoAssignSummary.reduce((acc, match) => {
                                  if (!acc[match.panelName]) acc[match.panelName] = [];
                                  acc[match.panelName].push(match);
                                  return acc;
                                }, {});
                                return Object.entries(groupedByPanel).map(([panelName, matches]) => (
                                  <div key={panelName} style={{ marginBottom: '20px' }}>
                                    <h6 style={{ color: '#F0B90B', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #2A2C38', paddingBottom: '6px' }}>
                                      {panelName}
                                    </h6>
                                    <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #2A2C38', backgroundColor: '#1E222D' }}>
                                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                        <thead>
                                          <tr style={{ backgroundColor: '#16171F', borderBottom: '1px solid #2A2C38' }}>
                                            <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#9599A6', fontWeight: 600, textTransform: 'uppercase' }}>Candidate</th>
                                            <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#9599A6', fontWeight: 600, textTransform: 'uppercase' }}>Match Score</th>
                                            <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#9599A6', fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
                                            <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#9599A6', fontWeight: 600, textTransform: 'uppercase' }}>Time</th>
                                            <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#9599A6', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {matches.map((match, idx) => (
                                            <tr key={idx} style={{ borderBottom: idx < matches.length - 1 ? '1px solid #2A2C38' : 'none' }}>
                                              <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                                                    {match.candidate.name.charAt(0)}
                                                  </div>
                                                  <select
                                                    value={match.candidate.name}
                                                    disabled={!match.slot}
                                                    onChange={(e) => {
                                                      const newCandName = e.target.value;
                                                      if (newCandName === match.candidate.name) return;

                                                      const selectedCand = allShortlisted.find(c => c.name === newCandName) || null;

                                                      let oldSlotId = null;
                                                      let oldPanelId = null;
                                                      if (selectedCand) {
                                                        panels.forEach(p => {
                                                          p.slots.forEach(s => {
                                                            if (s.assignedCandidate && s.assignedCandidate.name === newCandName) {
                                                              oldSlotId = s.id;
                                                              oldPanelId = p.id;
                                                            }
                                                          });
                                                        });
                                                      }

                                                      const currentCand = match.candidate;
                                                      const targetPanelId = match.slot.panelNo;
                                                      const targetSlotId = match.slot.id;

                                                      const newPanels = panels.map(p => ({
                                                        ...p,
                                                        slots: p.slots.map(s => {
                                                          if (p.id === targetPanelId && s.id === targetSlotId) {
                                                            return { ...s, assignedCandidate: selectedCand };
                                                          }
                                                          if (oldSlotId && p.id === oldPanelId && s.id === oldSlotId) {
                                                            return { ...s, assignedCandidate: currentCand };
                                                          }
                                                          return s;
                                                        })
                                                      }));

                                                      let newSummary = [];
                                                      newPanels.forEach(p => {
                                                        p.slots.forEach(s => {
                                                          if (s.assignedCandidate) {
                                                            newSummary.push({ candidate: s.assignedCandidate, slot: { ...s, panelNo: p.id }, panelName: p.name });
                                                          }
                                                        });
                                                      });
                                                      setAutoAssignSummary(newSummary);
                                                      setPanels(newPanels);
                                                      syncCandidateAllocations(newPanels);
                                                    }}
                                                    style={{
                                                      backgroundColor: 'transparent',
                                                      color: '#FFFFFF',
                                                      border: '1px solid rgba(255, 255, 255, 0.15)',
                                                      borderRadius: '6px',
                                                      padding: '4px 8px',
                                                      fontSize: '0.85rem',
                                                      fontWeight: 600,
                                                      outline: 'none',
                                                      width: '180px',
                                                      cursor: 'pointer',
                                                      appearance: 'none'
                                                    }}
                                                  >
                                                    <option value="" style={{ color: '#000' }}>Unassign...</option>
                                                    {allShortlisted.map(c => (
                                                      <option key={c.name} value={c.name} style={{ color: '#000' }}>
                                                        {c.name}
                                                      </option>
                                                    ))}
                                                  </select>
                                                </div>
                                              </td>
                                              <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                <div style={{ color: '#22C55E', fontSize: '0.8rem', fontWeight: 700 }}>{match.candidate.score || match.candidate.displayScore}%</div>
                                              </td>
                                              <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                {match.slot ? (
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontSize: '0.8rem' }}>
                                                    <Calendar size={14} style={{ color: '#F0B90B' }} />
                                                    <span>{formatSlotDateShort(match.slot.date)}</span>
                                                  </div>
                                                ) : (
                                                  <span style={{ color: '#EF4444' }}>-</span>
                                                )}
                                              </td>
                                              <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                {match.slot ? (
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontSize: '0.8rem' }}>
                                                    <Clock size={14} style={{ color: '#F0B90B' }} />
                                                    <span>{formatTime(match.slot.startTime || '09:00 AM')} – {formatTime(match.slot.endTime || getEndTime(match.slot.startTime || '09:00 AM'))}</span>
                                                  </div>
                                                ) : (
                                                  <span style={{ color: '#EF4444' }}>-</span>
                                                )}
                                              </td>
                                              <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                {match.slot ? (
                                                  <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                                                    ASSIGNED
                                                  </span>
                                                ) : (
                                                  <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                                                    UNASSIGNED
                                                  </span>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Form Buttons */}
                <div className="form-actions-row" style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn-primary-accent" style={{ padding: '12px 24px' }}>
                    <span>
                      {editingSlotId
                        ? 'Update Interview Slot'
                        : (activeZohoType === 'Log' ? 'Save Logged Interview' : 'Save & Sync Google Calendar')}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="btn-ghost-dark"
                    onClick={handleResetForm}
                    title="Clear form inputs and reset candidate matching"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 20px', border: '1px solid #2A2C38' }}
                  >
                    <RefreshCw size={14} />
                    <span>Reset Form</span>
                  </button>
                  <button type="button" className="btn-ghost-dark" onClick={() => setShowInlineForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Standard IntelliHire Toast Notification */}
          <AdminToast toast={toast} onDismiss={() => setToast(null)} />


          {/* Footer Branding */}
          <footer className="portal-footer">
            <span>© 2026 IntelliHire Recruiter Portal. All rights reserved.</span>
            <div className="footer-links">
              <a href="#doc">Documentation</a>
              <a href="#privacy">Privacy Policy</a>
              <a href="#support">Support</a>
            </div>
          </footer>
        </div>
      </div>

      {/* ── Modal: View Details ── */}
      {viewingSlot && (
        <div className="modal-backdrop" onClick={() => setViewingSlot(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Interview Slot Details</h3>
              <button type="button" className="modal-close-btn" onClick={() => setViewingSlot(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-detail-row">
                <span className="detail-label">Job Position:</span>
                <span className="detail-val font-bold">{viewingSlot.jobPosition}</span>
              </div>
              <div className="modal-detail-row">
                <span className="detail-label">Interview Round:</span>
                <span className="detail-val">{viewingSlot.round}</span>
              </div>
              <div className="modal-detail-row">
                <span className="detail-label">Assigned Panel:</span>
                <span className="detail-val" style={{ color: '#F0B90B', fontWeight: 600 }}>
                  {viewingSlot.panelName || 'Panel A (Technical Leads)'}
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="detail-label">Panel Member Emails:</span>
                <span className="detail-val font-mono" style={{ fontSize: '0.84rem' }}>
                  {viewingSlot.panelEmails || 'saman.tech@company.com, nirosha.hr@company.com'}
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="detail-label">Date &amp; Time:</span>
                <span className="detail-val">
                  {viewingSlot.interviewDate} ({viewingSlot.startTime} - {viewingSlot.endTime})
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="detail-label">Platform &amp; Capacity:</span>
                <span className="detail-val">
                  {viewingSlot.interviewMedia || viewingSlot.interviewType} | {viewingSlot.bookedCount}/{viewingSlot.capacity} candidates booked
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="detail-label">Location / Link:</span>
                <span className="detail-val highlight-val">{viewingSlot.meetingLocation || 'N/A'}</span>
              </div>
              <div className="modal-detail-row">
                <span className="detail-label">Additional Notes:</span>
                <span className="detail-val">{viewingSlot.additionalNotes || 'No notes provided.'}</span>
              </div>
              <div className="modal-detail-row">
                <span className="detail-label">Current Status:</span>
                <span className={`status-pill status-${viewingSlot.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {viewingSlot.status}
                </span>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #2A2C38' }}>
              <a
                href={generateGoogleCalendarUrl({
                  title: `IntelliHire Interview: ${viewingSlot.round} (${viewingSlot.jobPosition})`,
                  description: `📌 INTELLIHIRE INTERVIEW DETAILS:\n• Job Position: ${viewingSlot.jobPosition}\n• Interview Round: ${viewingSlot.round}\n• Scheduled Time Slot: ${viewingSlot.interviewDate} (${viewingSlot.startTime} - ${viewingSlot.endTime})\n• Platform / Media: ${viewingSlot.interviewMedia || viewingSlot.interviewType}\n• Capacity: ${viewingSlot.bookedCount}/${viewingSlot.capacity} Candidates Allocated\n\n👥 ASSIGNED PANEL:\n• Name: ${viewingSlot.panelName || 'Panel A'}\n• Panel Emails: ${viewingSlot.panelEmails || 'N/A'}\n• Venue / Link: ${viewingSlot.meetingLocation || 'N/A'}\n\n📝 NOTES:\n${viewingSlot.additionalNotes || 'N/A'}`,
                  interviewDate: viewingSlot.interviewDate,
                  startTime: viewingSlot.startTime,
                  endTime: viewingSlot.endTime,
                  location: viewingSlot.meetingLocation,
                  attendees: viewingSlot.panelEmails ? viewingSlot.panelEmails.split(',').map(e => e.trim()) : [],
                })}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(66, 133, 244, 0.12)',
                  color: '#4285F4',
                  border: '1px solid rgba(66, 133, 244, 0.4)',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                <Calendar size={16} />
                <span>Add to Google Calendar</span>
                <ExternalLink size={13} />
              </a>
              <button
                type="button"
                className="btn-primary-accent"
                style={{ flex: 1, padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setViewingSlot(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Confirmation ── */}
      {deletingSlot && (
        <div className="modal-backdrop" onClick={() => setDeletingSlot(null)}>
          <div className="modal-card modal-card-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-danger">Confirm Slot Deletion</h3>
              <button type="button" className="modal-close-btn" onClick={() => setDeletingSlot(null)}>
                ×
              </button>
            </div>
            <div className="modal-body text-center">
              <p>
                Are you sure you want to delete the time slot for{' '}
                <strong>{deletingSlot.jobPosition}</strong> ({deletingSlot.round} - {deletingSlot.interviewDate})?
              </p>
              <p className="text-muted-sm">This action cannot be undone.</p>
            </div>
            <div className="modal-footer delete-modal-actions">
              <button type="button" className="delete-modal-btn delete-modal-cancel" onClick={() => setDeletingSlot(null)}>
                Cancel
              </button>
              <button type="button" className="delete-modal-btn delete-modal-confirm" onClick={confirmDeleteSlot}>
                Delete Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 1: Format Selector Modal (Matches Choose Job Opportunity style) ── */}
      {showZohoModal && (
        <div className="vacancy-modal-overlay" onClick={() => setShowZohoModal(false)}>
          <div
            className="vacancy-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative' }}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowZohoModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'grid',
                placeItems: 'center',
                color: '#9599A6',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.15s ease',
                padding: 0,
                zIndex: 10
              }}
              title="Close"
            >
              <X size={16} />
            </button>

            {/* Header with Circular Gold Icon */}
            <div className="vacancy-modal-header">
              <div className="vacancy-modal-icon-wrap">
                <Video size={24} className="vacancy-modal-icon" />
              </div>
              <h2 className="vacancy-modal-title">Choose Interview Format</h2>
              <p className="vacancy-modal-subtitle">
                To set up time slots, assign panel members, and configure candidate invitations, please select an interview format below.
              </p>
            </div>

            {/* Modal Body / Cards List */}
            <div className="vacancy-modal-body">
              <div className="vacancy-cards-list">
                {/* Option 1: Online Video Interview */}
                <div
                  className={`vacancy-select-card ${selectedFormatType === 'Google Meet' ? 'is-selected' : ''}`}
                  onClick={() => setSelectedFormatType('Google Meet')}
                  onDoubleClick={() => handleChooseZohoType('Google Meet')}
                  title="Click to select, double-click to continue"
                >
                  {selectedFormatType === 'Google Meet' && (
                    <div className="vacancy-selected-checkmark">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                  <div className="vacancy-card-main">
                    <div className="vacancy-card-info">
                      <span className="vacancy-card-code">#VIRTUAL</span>
                      <h3 className="vacancy-card-title">Online Video Interview</h3>
                    </div>
                    <div className="vacancy-card-status-wrap">
                      <span className="vacancy-status-badge status-active">
                        Remote
                      </span>
                    </div>
                  </div>
                </div>

                {/* Option 2: In-Person Physical Interview */}
                <div
                  className={`vacancy-select-card ${selectedFormatType === 'In-Person' ? 'is-selected' : ''}`}
                  onClick={() => setSelectedFormatType('In-Person')}
                  onDoubleClick={() => handleChooseZohoType('In-Person')}
                  title="Click to select, double-click to continue"
                >
                  {selectedFormatType === 'In-Person' && (
                    <div className="vacancy-selected-checkmark">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                  <div className="vacancy-card-main">
                    <div className="vacancy-card-info">
                      <span className="vacancy-card-code">#ON-SITE</span>
                      <h3 className="vacancy-card-title">In-Person Physical Interview</h3>
                    </div>
                    <div className="vacancy-card-status-wrap">
                      <span className="vacancy-status-badge status-active">
                        On-Site
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Select & Continue Button */}
            <div className="vacancy-modal-footer">
              <button
                type="button"
                className="vacancy-confirm-btn"
                disabled={!selectedFormatType}
                onClick={() => {
                  if (selectedFormatType) {
                    handleChooseZohoType(selectedFormatType);
                  }
                }}
              >
                Select &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal: Reschedule Requests Center ── */}
      {showRescheduleModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(13, 14, 19, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#16171F',
              border: '1px solid #2A2C38',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                backgroundColor: '#191B24',
                borderBottom: '1px solid #2A2C38',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(240, 185, 11, 0.15)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#F0B90B',
                  }}
                >
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Panel Member Reschedule Requests
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#9599A6' }}>
                    Review, approve, or adjust reschedule requests submitted by interview panel members.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', backgroundColor: '#0D0E13', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveRequestTab('PENDING')}
                    style={{
                      backgroundColor: activeRequestTab === 'PENDING' ? '#F0B90B' : 'transparent',
                      color: activeRequestTab === 'PENDING' ? '#000' : '#9599A6',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Pending ({pendingReschedulesCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRequestTab('ALL')}
                    style={{
                      backgroundColor: activeRequestTab === 'ALL' ? '#F0B90B' : 'transparent',
                      color: activeRequestTab === 'ALL' ? '#000' : '#9599A6',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    All History ({rescheduleRequests.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9599A6',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Request List Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {rescheduleRequests.filter(r => activeRequestTab === 'ALL' || r.status === activeRequestTab).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#9599A6' }}>
                  <CheckCircle2 size={40} style={{ color: '#22C55E', margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#FFFFFF', fontSize: '1rem' }}>No pending requests!</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>All panel interview schedules are currently confirmed and up-to-date.</p>
                </div>
              ) : (
                rescheduleRequests
                  .filter(r => activeRequestTab === 'ALL' || r.status === activeRequestTab)
                  .map((req) => {
                    const isPending = req.status === 'PENDING';
                    const isApproved = req.status === 'APPROVED';
                    const isRejected = req.status === 'REJECTED';

                    return (
                      <div
                        key={req.id}
                        style={{
                          backgroundColor: '#1E222D',
                          border: isPending ? '1px solid #F0B90B' : '1px solid #2A2C38',
                          borderRadius: '12px',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                        }}
                      >
                        {/* Top: Panel Member & Candidate info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img
                              src={req.panelMember?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                              alt={req.panelMember?.name}
                              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F0B90B' }}
                            />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '0.98rem', fontWeight: 700 }}>
                                  {req.panelMember?.name}
                                </h4>
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#2A2C38', color: '#F0B90B', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  PANELIST
                                </span>
                              </div>
                              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#9599A6' }}>
                                Candidate: <strong style={{ color: '#FFFFFF' }}>{req.candidateName}</strong> • {req.jobPosition} ({req.round})
                              </p>
                            </div>
                          </div>

                          <div>
                            {isPending && (
                              <span style={{ backgroundColor: 'rgba(240, 185, 11, 0.15)', color: '#F0B90B', border: '1px solid #F0B90B', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={12} /> Pending Review
                              </span>
                            )}
                            {isApproved && (
                              <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid #22C55E', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle2 size={12} /> Rescheduled & Approved
                              </span>
                            )}
                            {isRejected && (
                              <span style={{ backgroundColor: 'rgba(230, 57, 70, 0.15)', color: '#E63946', border: '1px solid #E63946', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                                Request Declined
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Mid: Reason & Notes */}
                        <div style={{ backgroundColor: '#16171F', padding: '12px 16px', borderRadius: '8px', border: '1px solid #2A2C38' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F0B90B', textTransform: 'uppercase' }}>
                              Reason: {req.reasonCategory}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#FFFFFF', lineHeight: 1.45 }}>
                            "{req.detailedReason || 'Requesting a reschedule due to scheduling conflict.'}"
                          </p>
                        </div>

                        {/* Timing Comparison: Current vs Proposed */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '14px' }}>
                          <div style={{ backgroundColor: '#16171F', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(230, 57, 70, 0.3)' }}>
                            <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: '#E63946', fontWeight: 700, marginBottom: '4px' }}>
                              Current Assigned Time
                            </span>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>{req.currentDisplayDate}</div>
                            <div style={{ fontSize: '0.78rem', color: '#9599A6' }}>{req.currentTime}</div>
                          </div>

                          <div style={{ backgroundColor: '#16171F', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(240, 185, 11, 0.3)' }}>
                            <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: '#F0B90B', fontWeight: 700, marginBottom: '6px' }}>
                              Panelist's Proposed Available Slots ({req.proposedSlots?.length || 0})
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {req.proposedSlots?.map((prop, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: '#1E222D',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #2A2C38',
                                  }}
                                >
                                  <div>
                                    <strong style={{ color: '#FFFFFF', fontSize: '0.82rem' }}>{prop.displayDate}</strong>
                                    <span style={{ color: '#9599A6', fontSize: '0.78rem', marginLeft: '6px' }}>
                                      {prop.startTime} - {prop.endTime}
                                    </span>
                                  </div>

                                  {isPending && (
                                    <button
                                      type="button"
                                      onClick={() => handleApproveProposed(req.id, prop)}
                                      style={{
                                        backgroundColor: '#22C55E',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      <CheckCircle2 size={13} /> Approve This Slot
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions for Pending Requests */}
                        {isPending && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #2A2C38', paddingTop: '14px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                const reason = prompt('Enter decline reason for the panelist:');
                                if (reason !== null) handleDeclineRequest(req.id, reason);
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: '1px solid #E63946',
                                color: '#E63946',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Decline Request
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const newDate = prompt('Enter custom date (YYYY-MM-DD):', req.currentDate);
                                if (newDate) {
                                  const start = prompt('Enter start time (e.g. 10:00 AM):', '10:00 AM');
                                  const end = prompt('Enter end time (e.g. 11:00 AM):', '11:00 AM');
                                  if (start && end) {
                                    const dObj = new Date(newDate);
                                    const displayDate = dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                    customRescheduleSlot(req.id, { date: newDate, displayDate, startTime: start, endTime: end }, 'Custom time scheduled by HR');
                                    refreshRescheduleRequests();
                                    setMessage(`Custom slot assigned for ${displayDate}!`);
                                  }
                                }
                              }}
                              style={{
                                backgroundColor: '#16171F',
                                border: '1px solid #F0B90B',
                                color: '#F0B90B',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Assign Custom Slot
                            </button>
                          </div>
                        )}

                        {/* Resolution notes if resolved */}
                        {!isPending && req.resolutionNotes && (
                          <div style={{ fontSize: '0.78rem', color: '#9599A6', borderTop: '1px solid #2A2C38', paddingTop: '10px' }}>
                            <strong>Resolution:</strong> {req.resolutionNotes}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', backgroundColor: '#191B24', borderTop: '1px solid #2A2C38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/panel/interviews')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#F0B90B',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={16} /> Open Panelist Portal View
              </button>

              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                style={{
                  backgroundColor: '#F0B90B',
                  color: '#000',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Candidate Detail View ── */}
      {viewingCandidate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-dark, #0D0E12)', zIndex: 9999, overflowY: 'auto', padding: '24px' }}>
          <CandidateDetailView
            candidate={enrichCandidateDetails(viewingCandidate)}
            onBack={() => setViewingCandidate(null)}
            onShortlist={() => { }}
            onReject={() => { }}
            onApprove={() => { }}
          />
        </div>
      )}
    </div>
  );
}

export default RecruiterInterviewTimeSlotManagementPage;
