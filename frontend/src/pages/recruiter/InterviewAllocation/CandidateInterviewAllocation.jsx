import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BellRing,
  BriefcaseBusiness,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Star,
  Trash2,
  Users,
  Video,
  X,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import AdminToast from '../../../components/common/AdminToast';
import { INTERVIEWS } from '../../../data/interviews';
import { VACANCIES } from '../../../data/vacancies';
import {
  getRescheduleRequests,
  getEndTime,
  checkPanelMemberAvailability,
  DEFAULT_PANEL_MEMBERS,
  checkUpcomingInterviewReminders,
  sendInterviewReminder,
  sendBulkInterviewReminders,
  generateGoogleCalendarLink,
  downloadIcsCalendarFile,
  getInterviewRemindersLog,
} from '../../../services/interviewService';
import {
  fetchInterviewSlots,
  fetchAllocations,
  allocateCandidate,
  deleteAllocation,
  resetAllocations,
  directRescheduleInterviewApi,
} from '../../../api/interviewApi';
import '../../../style.css';
import './CandidateInterviewAllocation.css';

export function formatDisplayTime(timeValue) {
  if (!timeValue) return '—';
  if (timeValue.includes('AM') || timeValue.includes('PM')) return timeValue;
  const match = timeValue.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeValue;
  let hours = Number(match[1]);
  const minutes = match[2];
  if (Number.isNaN(hours)) return timeValue;
  const period = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 || 12;
  return `${String(normalizedHours).padStart(2, '0')}:${minutes} ${period}`;
}

export function formatPanelDisplayName(name) {
  if (!name) return 'Panel A';
  return String(name).replace(/\s*\([^)]*\)/g, '').trim() || 'Panel A';
}

export function formatTimeRange(startTime, endTime) {
  if (!startTime || startTime === '—') return '—';
  const startStr = String(startTime).trim();
  if (startStr.includes('–') || startStr.includes(' - ')) {
    return startStr;
  }
  const formattedStart = formatDisplayTime(startStr);
  const formattedEnd = endTime ? formatDisplayTime(endTime) : getEndTime(formattedStart);
  return `${formattedStart} – ${formattedEnd}`;
}

// Initial Mock Candidates Data (3 allocated by default, 6 shortlisted)
export const INITIAL_CANDIDATES = [
  // 3 candidates allocated by default (match INITIAL_ALLOCATIONS)
  { id: 'APP-001', name: 'Alice Fernando', score: 88, status: 'ALLOCATED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-002', name: 'Kamal Perera', score: 82, status: 'ALLOCATED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-003', name: 'Nimal Silva', score: 79, status: 'ALLOCATED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  // 6 candidates shortlisted by default
  { id: 'APP-004', name: 'Dinesh Mendis', score: 76, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-005', name: 'Sanduni Wickramasinghe', score: 74, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-006', name: 'Ishara Gunasekara', score: 72, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-007', name: 'Malith Senanayake', score: 70, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-008', name: 'Tharindu Rathnayake', score: 68, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-009', name: 'Kasun Wijesinghe', score: 65, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
];

// Clean Default Mock Time Slots (6 balanced slots across roles, upcoming November 2026)
const INITIAL_SLOTS = [
  // Senior Software Engineer
  { id: 'SLOT-101', dateKey: '2026-11-20', date: '20 Nov 2026', dateShort: '20 Nov', time: '09:30 AM', end: '10:30 AM', type: 'Online', cap: 1, rem: 0, jobPosition: 'Senior Software Engineer', round: 'Technical Interview', panelName: 'Panel A (Technical Leads)' },
  { id: 'SLOT-102', dateKey: '2026-11-20', date: '20 Nov 2026', dateShort: '20 Nov', time: '02:00 PM', end: '03:00 PM', type: 'Physical', cap: 1, rem: 0, jobPosition: 'Senior Software Engineer', round: 'HR Portfolio Review', panelName: 'Panel A (Technical Leads)' },
  { id: 'SLOT-103', dateKey: '2026-11-21', date: '21 Nov 2026', dateShort: '21 Nov', time: '11:00 AM', end: '12:00 PM', type: 'Online', cap: 1, rem: 0, jobPosition: 'Senior Software Engineer', round: 'System Architecture', panelName: 'Panel A (Technical Leads)' },
  { id: 'SLOT-104', dateKey: '2026-11-22', date: '22 Nov 2026', dateShort: '22 Nov', time: '10:00 AM', end: '11:00 AM', type: 'Online', cap: 2, rem: 2, jobPosition: 'Senior Software Engineer', round: 'Technical Interview', panelName: 'Panel A (Technical Leads)' },

  // Backend Engineer
  { id: 'SLOT-105', dateKey: '2026-11-23', date: '23 Nov 2026', dateShort: '23 Nov', time: '01:30 PM', end: '02:30 PM', type: 'Physical', cap: 2, rem: 2, jobPosition: 'Backend Engineer', round: 'API Design & Database', panelName: 'Panel A (Technical Leads)' },

  // UI/UX Designer
  { id: 'SLOT-106', dateKey: '2026-11-24', date: '24 Nov 2026', dateShort: '24 Nov', time: '03:00 PM', end: '04:00 PM', type: 'Online', cap: 2, rem: 2, jobPosition: 'UI/UX Designer', round: 'Design Portfolio Review', panelName: 'Panel A (Technical Leads)' },
];

// Initial Allocation Results Data (3 mock allocations matching Panel Interview Schedule)
export const INITIAL_ALLOCATIONS = [
  {
    candidateId: 'APP-001',
    candidateName: 'Alice Fernando',
    slotId: 'SLOT-101',
    assignedTime: '09:30 AM – 10:30 AM',
    interviewDate: '20 Nov 2026',
    interviewType: 'Online',
    interviewMedia: 'Google Meet',
    meetingLocation: 'https://meet.google.com/new',
    meetingId: 'meet.google.com/new',
    meetingPasscode: 'Direct Video Link',
    panelName: 'Panel A (Technical Leads)',
    interviewRound: 'Technical Interview',
    jobPosition: 'Senior Software Engineer',
    status: 'ALLOCATED',
    score: 88,
  },
  {
    candidateId: 'APP-002',
    candidateName: 'Kamal Perera',
    slotId: 'SLOT-102',
    assignedTime: '02:00 PM – 03:00 PM',
    interviewDate: '20 Nov 2026',
    interviewType: 'Physical',
    interviewMedia: 'In-Person',
    meetingLocation: 'Engineering Interview Room 1, HQ Building',
    panelName: 'Panel A (Technical Leads)',
    interviewRound: 'HR Portfolio Review',
    jobPosition: 'Senior Software Engineer',
    status: 'ALLOCATED',
    score: 82,
  },
  {
    candidateId: 'APP-003',
    candidateName: 'Nimal Silva',
    slotId: 'SLOT-103',
    assignedTime: '11:00 AM – 12:00 PM',
    interviewDate: '21 Nov 2026',
    interviewType: 'Online',
    interviewMedia: 'Google Meet',
    meetingLocation: 'https://meet.google.com/new',
    meetingId: 'meet.google.com/new',
    meetingPasscode: 'Direct Video Link',
    panelName: 'Panel A (Technical Leads)',
    interviewRound: 'System Architecture',
    jobPosition: 'Senior Software Engineer',
    status: 'ALLOCATED',
    score: 79,
  },
];

// Helper to merge newly allocated candidates with initial allocations so default candidates are never lost
// Strictly filters out completed past sessions (e.g. Danushka Silva) which belong exclusively to Panel Schedule
export const mergeWithInitialAllocations = (incomingList) => {
    const filteredIncoming = (Array.isArray(incomingList) ? incomingList : []).filter((item) => {
      const isDanushka = (item.candidateName || '').toLowerCase().includes('danushka');
      const isCompleted = item.status === 'COMPLETED';
      return !isDanushka && !isCompleted;
    });

    if (filteredIncoming.length === 0) {
      return INITIAL_ALLOCATIONS;
    }
    const merged = [...filteredIncoming];
    INITIAL_ALLOCATIONS.forEach((init) => {
      const exists = merged.some(
        (item) =>
          String(item.candidateId) === String(init.candidateId) ||
          (item.candidateName &&
            init.candidateName &&
            item.candidateName.trim().toLowerCase() === init.candidateName.trim().toLowerCase())
      );
      if (!exists) {
        merged.push(init);
      }
    });
    return merged;
  };

  // Clean Storage Version to permanently purge old duplicate test entries and keep single default dataset
  const CLEAN_STORAGE_VERSION = 'v29_exclude_completed_danushka';

  export const resetToDefaultMockData = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('intellihire_allocations', JSON.stringify(INITIAL_ALLOCATIONS));
        localStorage.setItem('intellihire_candidates', JSON.stringify(INITIAL_CANDIDATES));
        localStorage.removeItem('intellihire_custom_slots');
        localStorage.removeItem('intellihire_interview_slots');
        localStorage.removeItem('intellihire_active_vacancy');
        localStorage.removeItem('intellihire_reschedule_requests');
        localStorage.setItem('intellihire_clean_version', CLEAN_STORAGE_VERSION);
        sessionStorage.setItem('intellihire_recruiter_session', 'active');
      }
    } catch { }
  };

  (() => {
    try {
      if (typeof window !== 'undefined') {
        const isNewSession = !sessionStorage.getItem('intellihire_recruiter_session');
        const isOutdatedVersion = localStorage.getItem('intellihire_clean_version') !== CLEAN_STORAGE_VERSION;
        if (isNewSession || isOutdatedVersion) {
          resetToDefaultMockData();
        }
      }
    } catch { }
  })();

  // Assigned panel data model (id, name, meetingType, roundLabel, members[])
  const INITIAL_PANELS = [
    {
      id: 'panel-a',
      name: 'Panel A (Technical Leads)',
      meetingType: 'Google Meet',
      meetingLink: 'https://meet.google.com/new',
      roundLabel: 'Round 1 · HR Screening',
      members: [
        { id: 'm1', name: 'Saman Tech', role: 'Technical Lead', email: 'saman.tech@company.com' },
        { id: 'm2', name: 'Nirosha HR', role: 'HR Manager', email: 'nirosha.hr@company.com' },
      ],
    },
  ];

  const MAX_VISIBLE_MEMBERS = 4;

  const PANEL_MEMBER_TONES = [
    { background: 'rgba(240, 185, 11, 0.15)', color: '#F0B90B' },
    { background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' },
    { background: 'rgba(34, 197, 94, 0.12)', color: '#4ADE80' },
    { background: 'rgba(168, 85, 247, 0.12)', color: '#C084FC' },
  ];

  const PANEL_MEETING_TYPES = {
    'Google Meet': { icon: Video, label: 'Video Call (Google Meet)' },
    'MS Teams': { icon: Video, label: 'Video Call (MS Teams)' },
    'Microsoft Teams': { icon: Video, label: 'Video Call (MS Teams)' },
    'Zoom': { icon: Video, label: 'Video Call (Zoom Meeting)' },
    'In-Person': { icon: MapPin, label: 'In-Person' },
    'Phone Screening': { icon: Phone, label: 'Phone Screening' },
  };

  function getMeetingTypeMeta(meetingType) {
    if (!meetingType) return { icon: MapPin, label: 'Not specified' };
    return PANEL_MEETING_TYPES[meetingType] || { icon: Video, label: meetingType };
  }

  function panelMemberInitials(name = '') {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  // Helper to convert slot date and time into a comparable timestamp for sorting
  function parseSlotDateTime(slot) {
    let timeMinutes = 0;
    const tStr = slot.time || slot.startTime || '';
    if (tStr) {
      const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const period = match[3] ? match[3].toUpperCase() : '';
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        timeMinutes = h * 60 + m;
      }
    }

    let dateTimestamp = 0;
    const dStr = slot.dateKey || slot.date || '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
      const [y, m, d] = dStr.split('-').map(Number);
      dateTimestamp = new Date(y, m - 1, d).getTime();
    } else if (dStr) {
      const withYear = /\d{4}/.test(dStr) ? dStr : `${dStr} 2026`;
      const parsed = new Date(withYear);
      if (!isNaN(parsed.getTime())) {
        dateTimestamp = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
      }
    }

    return dateTimestamp + timeMinutes * 60 * 1000;
  }

  function isSlotTimeInPast(slotDate, slotTimeStr) {
    if (!slotDate || !slotTimeStr) return false;
    const today = new Date();
    let dateFormatted = '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(slotDate)) {
      dateFormatted = slotDate;
    } else {
      const d = new Date(/\d{4}/.test(slotDate) ? slotDate : `${slotDate} ${today.getFullYear()}`);
      if (!isNaN(d.getTime())) {
        dateFormatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
    }
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (dateFormatted && dateFormatted < todayStr) return true;
    if (dateFormatted && dateFormatted > todayStr) return false;

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

  function AssignedPanelCard({ panel, onOpen }) {
    return (
      <button type="button" className="assigned-panel-card assigned-panel-card--trigger" onClick={onOpen}>
        <span className="assigned-panel-card__title">{panel.name}</span>
        <ChevronRight size={16} className="assigned-panel-card__chevron" />
      </button>
    );
  }

  function PanelDetailsModal({ panel, onClose, onEditPanel, onReassignPanel }) {
    const [showAllMembers, setShowAllMembers] = useState(false);
    const members = Array.isArray(panel.members) ? panel.members : [];
    const visibleMembers = showAllMembers ? members : members.slice(0, MAX_VISIBLE_MEMBERS);
    const hiddenCount = members.length - visibleMembers.length;
    const meetingMeta = getMeetingTypeMeta(panel.meetingType);
    const MeetingIcon = meetingMeta.icon;
    const isMeetingLinkUrl = panel.meetingLink && /^https?:\/\//i.test(panel.meetingLink);

    return (
      <div className="allocation-modal-backdrop" onClick={onClose}>
        <div className="allocation-modal" onClick={(event) => event.stopPropagation()}>
          <div className="allocation-modal__header">
            <h3>{panel.name}</h3>
            <button type="button" onClick={onClose} aria-label="Close panel details">
              <X size={18} />
            </button>
          </div>

          <div className="assigned-panel-modal">
            {panel.roundLabel && (
              <span className="assigned-panel-card__round-badge">{panel.roundLabel}</span>
            )}

            <div className="assigned-panel-card__meeting">
              <MeetingIcon size={16} className="assigned-panel-card__meeting-icon" />
              <span className="assigned-panel-card__meeting-label">{meetingMeta.label}</span>
              {isMeetingLinkUrl && (
                <a
                  className="assigned-panel-card__meeting-link"
                  href={panel.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={panel.meetingLink}
                  aria-label="Open meeting link"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            <div className="assigned-panel-card__members">
              <span className="assigned-panel-card__members-label">Panel Members</span>
              {members.length === 0 ? (
                <p className="assigned-panel-card__members-empty">No members assigned yet.</p>
              ) : (
                <div className="assigned-panel-card__members-list">
                  {visibleMembers.map((member, index) => (
                    <div className="assigned-panel-member" key={member.id || `member-${index}`}>
                      <div
                        className="assigned-panel-member__avatar"
                        style={PANEL_MEMBER_TONES[index % PANEL_MEMBER_TONES.length]}
                      >
                        {panelMemberInitials(member.name)}
                      </div>
                      <div className="assigned-panel-member__info">
                        <span className="assigned-panel-member__name">{member.name}</span>
                        <span className="assigned-panel-member__role">{member.role}</span>
                      </div>
                    </div>
                  ))}
                  {(hiddenCount > 0 || showAllMembers) && (
                    <button
                      type="button"
                      className="assigned-panel-member__more"
                      onClick={() => setShowAllMembers((prev) => !prev)}
                    >
                      {showAllMembers ? 'Show less' : `+${hiddenCount} more`}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="assigned-panel-card__actions">
              <button type="button" className="btn-ghost-dark" onClick={onEditPanel}>
                <Pencil size={13} />
                <span>Edit Panel</span>
              </button>
              <button type="button" className="btn-ghost-dark" onClick={onReassignPanel}>
                <RotateCcw size={13} />
                <span>Reassign</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default function CandidateInterviewAllocationPage({ embeddedVacancy = null }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Default to '' so all positions and rounds are visible by default ('All Job Positions')
    const [jobPosition, setJobPosition] = useState(() => {
      if (embeddedVacancy?.title) return embeddedVacancy.title;
      return '';
    });
    const [interviewRound, setInterviewRound] = useState('');
    const [interviewDate, setInterviewDate] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

    useEffect(() => {
      if (embeddedVacancy?.title) {
        setJobPosition(embeddedVacancy.title);
      }
    }, [embeddedVacancy]);

    const [candidates, setCandidates] = useState(() => {
      try {
        if (!sessionStorage.getItem('intellihire_recruiter_session')) {
          resetToDefaultMockData();
          return INITIAL_CANDIDATES;
        }
        const stored = localStorage.getItem('intellihire_candidates');
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const merged = [...parsed];
            INITIAL_CANDIDATES.forEach((init) => {
              const exists = merged.some(
                (c) => String(c.id) === String(init.id) || (c.name && init.name && c.name.trim().toLowerCase() === init.name.trim().toLowerCase())
              );
              if (!exists) {
                merged.push(init);
              }
            });
            return merged;
          }
        }
      } catch { }
      return INITIAL_CANDIDATES;
    });

    const [allocations, setAllocations] = useState(() => {
      try {
        const isOutdated = typeof window !== 'undefined' && localStorage.getItem('intellihire_clean_version') !== CLEAN_STORAGE_VERSION;
        if (isOutdated || !sessionStorage.getItem('intellihire_recruiter_session')) {
          resetToDefaultMockData();
          return INITIAL_ALLOCATIONS;
        }
        const stored = localStorage.getItem('intellihire_allocations');
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const merged = mergeWithInitialAllocations(parsed);
            return merged.map((item, idx) => {
              const isPhysical = item.interviewType === 'Physical';
              const media = isPhysical ? 'In-Person' : (item.interviewMedia || 'Google Meet');
              return {
                ...item,
                interviewMedia: media,
                meetingLocation: item.meetingLocation || (isPhysical ? 'Engineering Interview Room 1, HQ Building' : 'https://meet.google.com/new'),
                meetingId: item.meetingId || (!isPhysical ? 'meet.google.com/new' : ''),
                meetingPasscode: item.meetingPasscode || (!isPhysical ? 'Direct Video Link' : ''),
              };
            });
          }
        }
      } catch { }
      return INITIAL_ALLOCATIONS;
    });

    // Live load allocations & slots from backend PostgreSQL API on mount
    useEffect(() => {
      fetchAllocations()
        .then((res) => {
          if (res && res.allocations && Array.isArray(res.allocations) && res.allocations.length > 0) {
            const combined = mergeWithInitialAllocations(res.allocations);
            const enriched = combined.map((item, idx) => {
              const isPhysical = item.interviewType === 'Physical';
              const media = isPhysical ? 'In-Person' : (item.interviewMedia || 'Google Meet');
              return {
                ...item,
                interviewMedia: media,
                meetingLocation: item.meetingLocation || (isPhysical ? 'Engineering Interview Room 1, HQ Building' : 'https://meet.google.com/new'),
                meetingId: item.meetingId || (!isPhysical ? 'meet.google.com/new' : ''),
                meetingPasscode: item.meetingPasscode || (!isPhysical ? 'Direct Video Link' : ''),
              };
            });
            setAllocations(enriched);
            try {
              localStorage.setItem('intellihire_allocations', JSON.stringify(enriched));
            } catch (e) { }
          }
        })
        .catch((err) => {
          console.warn('Backend fetchAllocations fallback:', err.message);
        });

      fetchInterviewSlots()
        .then((res) => {
          if (res && res.slots && Array.isArray(res.slots) && res.slots.length > 0) {
            const mapped = res.slots.map((s) => {
              const dObj = new Date(s.interviewDate || s.rawDate);
              const shortDate = isNaN(dObj.getTime())
                ? (s.interviewDate || '30 Oct').substring(0, 6)
                : dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
              const displayTime = formatDisplayTime(s.startTime);
              const displayEnd = formatDisplayTime(s.endTime || getEndTime(s.startTime));
              return {
                id: `SLOT-${s.id}`,
                rawSlotId: s.id,
                dateKey: s.interviewDate,
                date: s.displayDate || s.interviewDate,
                dateShort: shortDate,
                time: displayTime,
                end: displayEnd,
                startTime: displayTime,
                endTime: displayEnd,
                type: s.interviewType || 'Online',
                cap: s.capacity || 1,
                capacity: s.capacity || 1,
                rem: s.candidate ? 0 : (s.capacity || 1),
                jobPosition: s.jobPosition,
                round: s.round,
                status: s.status,
                panelName: s.panelName || 'Panel A (Technical Leads)',
                assignedCandidate: s.candidate || null,
                isCustom: true,
              };
            });
            setCustomSlots((prev) => {
              const map = new Map();
              [...prev, ...mapped].forEach((s) => map.set(s.id, s));
              return Array.from(map.values());
            });
          }
        })
        .catch((err) => {
          console.warn('Backend fetchInterviewSlots fallback:', err.message);
        });
    }, []);

    // Live listener to sync custom slots from other components / tabs
    useEffect(() => {
      const handleSync = (e) => {
        // Do not sync if event was dispatched by this component itself
        if (e?.detail?.source === 'CandidateInterviewAllocation') return;
        try {
          const storedAlloc = localStorage.getItem('intellihire_allocations');
          if (storedAlloc !== null) {
            const parsed = JSON.parse(storedAlloc);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAllocations(mergeWithInitialAllocations(parsed));
            }
          }

          const storedCandidates = localStorage.getItem('intellihire_candidates');
          if (storedCandidates !== null) {
            const parsedC = JSON.parse(storedCandidates);
            if (Array.isArray(parsedC) && parsedC.length > 0) {
              const mergedC = [...parsedC];
              INITIAL_CANDIDATES.forEach((init) => {
                if (!mergedC.some((c) => String(c.id) === String(init.id) || (c.name && init.name && c.name.trim().toLowerCase() === init.name.trim().toLowerCase()))) {
                  mergedC.push(init);
                }
              });
              setCandidates(mergedC);
            }
          }
          const storedCustom = JSON.parse(localStorage.getItem('intellihire_custom_slots') || '[]');
          const storedSlots = JSON.parse(localStorage.getItem('intellihire_interview_slots') || '[]');
          if (storedCustom.length > 0 || storedSlots.length > 0) {
            const mappedInterviewSlots = storedSlots.map((s) => {
              const dObj = new Date(s.interviewDate || s.rawDate);
              const shortDate = isNaN(dObj.getTime())
                ? (s.interviewDate || '30 Oct').substring(0, 6)
                : dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
              const displayTime = formatDisplayTime(s.startTime);
              const displayEnd = formatDisplayTime(s.endTime || getEndTime(s.startTime));
              return {
                id: `SLOT-${s.id}`,
                dateKey: s.rawDate || s.interviewDate,
                date: s.interviewDate,
                dateShort: shortDate,
                time: displayTime,
                end: displayEnd,
                startTime: displayTime,
                endTime: displayEnd,
                type: s.interviewType || 'Online',
                cap: s.capacity || 1,
                capacity: s.capacity || 1,
                rem: s.assignedCandidate ? 0 : (s.capacity || 1),
                jobPosition: s.jobPosition,
                round: s.round,
                status: s.assignedCandidate ? 'BOOKED' : 'AVAILABLE',
                bookedCount: s.assignedCandidate ? 1 : 0,
                panelName: s.panelName || 'Panel A (Technical Leads)',
                assignedCandidate: s.assignedCandidate || null,
                isCustom: true,
              };
            });
            const map = new Map();
            [...storedCustom.map(c => ({ ...c, isCustom: true, time: formatDisplayTime(c.time || c.startTime), end: formatDisplayTime(c.end || c.endTime) })), ...mappedInterviewSlots].forEach((slot) => {
              if (!map.has(slot.id)) map.set(slot.id, slot);
            });
            setCustomSlots(Array.from(map.values()));
          }
        } catch (e) { }
      };

      window.addEventListener('storage', handleSync);
      window.addEventListener('intellihire_slots_updated', handleSync);
      return () => {
        window.removeEventListener('storage', handleSync);
        window.removeEventListener('intellihire_slots_updated', handleSync);
      };
    }, []);
    const [selectedSlotId, setSelectedSlotId] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
    const [allocationStatusFilter, setAllocationStatusFilter] = useState('ALL');
    const [pendingRescheduleCount, setPendingRescheduleCount] = useState(() => {
      try {
        const reqs = getRescheduleRequests();
        return (reqs || []).filter((r) => r.status === 'PENDING').length;
      } catch {
        return 0;
      }
    });

    useEffect(() => {
      const handleRequestsSync = () => {
        try {
          const reqs = getRescheduleRequests();
          setPendingRescheduleCount((reqs || []).filter((r) => r.status === 'PENDING').length);
        } catch { }
      };
      window.addEventListener('intellihire_slots_updated', handleRequestsSync);
      window.addEventListener('storage', handleRequestsSync);
      return () => {
        window.removeEventListener('intellihire_slots_updated', handleRequestsSync);
        window.removeEventListener('storage', handleRequestsSync);
      };
    }, []);
    const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
    const [previewSelectedCandidate, setPreviewSelectedCandidate] = useState(null);
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pendingReallocation, setPendingReallocation] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [reschedulingAllocation, setReschedulingAllocation] = useState(null);
    const [rescheduleSlotId, setRescheduleSlotId] = useState('');
    const [rescheduleMode, setRescheduleMode] = useState('slot'); // 'slot' | 'custom'
    const [rescheduleCustomDate, setRescheduleCustomDate] = useState(() => {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      return t.toISOString().split('T')[0];
    });
    const [rescheduleCustomStart, setRescheduleCustomStart] = useState('10:00');
    const [rescheduleCustomEnd, setRescheduleCustomEnd] = useState('11:00');
    const [rescheduleReason, setRescheduleReason] = useState('Adjusted schedule directly through IntelliHire');
    const [rescheduleAutoNotify, setRescheduleAutoNotify] = useState(true);
    const [viewingSlotModal, setViewingSlotModal] = useState(null);
    const [showNoCandidatesModal, setShowNoCandidatesModal] = useState(false);
    const [assignedPanels, setAssignedPanels] = useState(() =>
      Array.isArray(embeddedVacancy?.panels) ? embeddedVacancy.panels : INITIAL_PANELS
    );
    const [viewingPanel, setViewingPanel] = useState(null);
    const [notifiedCandidateIds, setNotifiedCandidateIds] = useState(() => {
      try {
        const stored = localStorage.getItem('intellihire_notified_candidate_ids');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return new Set(parsed);
          }
        }
      } catch { }
      return new Set();
    });

    const updateNotifiedCandidateIds = (updater) => {
      setNotifiedCandidateIds((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : new Set(updater);
        try {
          localStorage.setItem('intellihire_notified_candidate_ids', JSON.stringify(Array.from(next)));
        } catch { }
        return next;
      });
    };

    const handleNotifyCandidate = (item) => {
      updateNotifiedCandidateIds((prev) => {
        const next = new Set(prev);
        next.add(item.candidateId);
        return next;
      });
      setToast({
        type: 'success',
        message: `Interview invitation with meeting details sent to ${item.candidateName} successfully!`,
      });
    };

    const handleOpenEmailPreview = (specificCandidate = null) => {
      const allocated = filteredAllocations.filter((a) => a.status === 'ALLOCATED');
      if (allocated.length === 0) {
        setToast({ type: 'warning', message: 'No allocated candidates to notify.' });
        return;
      }
      setPreviewSelectedCandidate(specificCandidate || allocated[0]);
      setShowEmailPreviewModal(true);
    };

    const handleConfirmSendAllInvites = () => {
      const allocated = filteredAllocations.filter((a) => a.status === 'ALLOCATED');
      updateNotifiedCandidateIds((prev) => {
        const next = new Set(prev);
        allocated.forEach((a) => next.add(a.candidateId));
        return next;
      });
      setShowEmailPreviewModal(false);
      setToast({
        type: 'success',
        message: `All ${allocated.length} interview invitations with calendar links dispatched to candidates and panel members!`,
      });
    };

    const handleNotifyAllAllocated = () => {
      handleOpenEmailPreview();
    };

    const itemsPerPage = 4;
    const [slotPage, setSlotPage] = useState(1);
    const slotsPerPage = 6;

    // Header Navigation Active Tab State
    const activeSubTab = 'allocation'; // 'management' or 'allocation'

    const openPanelManager = () => {
      navigate('/recruiter/interviews', {
        state: { selectedVacancy: embeddedVacancy ? embeddedVacancy.title : jobPosition },
      });
    };

    // Helper to detect outdated slots from past dates/months (anything strictly before today 24 Oct 2026)
    function isOutdatedPastDate(dateVal) {
      if (!dateVal) return false;
      const str = String(dateVal).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str < '2026-10-24';
      }
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const today = new Date('2026-10-24T00:00:00');
        return parsed < today;
      }
      return false;
    }

    // Show Toast Utility using standard AdminToast
    const showToast = (message, type = 'success') => {
      setToast({ message, type });
    };

    const [customSlots, setCustomSlots] = useState(() => {
      try {
        const custom = JSON.parse(localStorage.getItem('intellihire_custom_slots') || '[]');
        const storedSlots = JSON.parse(localStorage.getItem('intellihire_interview_slots') || '[]');
        const mapped = storedSlots.map((s) => {
          const dObj = new Date(s.interviewDate || s.rawDate);
          const shortDate = isNaN(dObj.getTime())
            ? (s.interviewDate || '30 Oct').substring(0, 6)
            : dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          const displayTime = formatDisplayTime(s.startTime);
          const displayEnd = formatDisplayTime(s.endTime || getEndTime(s.startTime));
          return {
            id: `SLOT-${s.id}`,
            dateKey: s.rawDate || s.interviewDate,
            date: s.interviewDate,
            dateShort: shortDate,
            time: displayTime,
            end: displayEnd,
            startTime: displayTime,
            endTime: displayEnd,
            type: s.interviewType || 'Online',
            cap: s.capacity || 1,
            capacity: s.capacity || 1,
            rem: s.assignedCandidate ? 0 : (s.capacity || 1),
            jobPosition: s.jobPosition,
            round: s.round,
            status: s.assignedCandidate ? 'BOOKED' : 'AVAILABLE',
            bookedCount: s.assignedCandidate ? 1 : 0,
            panelName: s.panelName || 'Panel A (Technical Leads)',
            assignedCandidate: s.assignedCandidate || null,
            isCustom: true,
          };
        });
        const map = new Map();
        [...custom, ...mapped].forEach(s => {
          const isPast = Boolean(s.isPast || isSlotTimeInPast(s.dateKey || s.rawDate || s.date, s.time || s.startTime));
          if (!isOutdatedPastDate(s.dateKey || s.rawDate || s.date) && !isPast) {
            map.set(s.id, s);
          }
        });
        return Array.from(map.values());
      } catch {
        return [];
      }
    });

    const allSlots = useMemo(() => {
      const map = new Map();
      // Prioritize valid custom slots from panels/form (excluding any past slots)
      customSlots
        .filter((s) => !isOutdatedPastDate(s.dateKey || s.date) && !Boolean(s.isPast || isSlotTimeInPast(s.dateKey || s.date, s.time || s.startTime)))
        .forEach((s) => map.set(s.id, s));
      // INITIAL_SLOTS (future slots)
      INITIAL_SLOTS.forEach((s) => {
        if (!map.has(s.id) && !Boolean(s.isPast || isSlotTimeInPast(s.dateKey || s.date, s.time || s.startTime))) {
          map.set(s.id, s);
        }
      });
      return Array.from(map.values());
    }, [customSlots]);

    const allocationByCandidate = useMemo(
      () => new Map(allocations.map((allocation) => [String(allocation.candidateId), allocation])),
      [allocations]
    );

    const slotsWithRemaining = useMemo(() => {
      const rawSlotsList = allSlots.length > 0 ? allSlots : INITIAL_SLOTS;
      return rawSlotsList.map((rawSlot) => {
        const slot = embeddedVacancy ? { ...rawSlot, jobPosition: embeddedVacancy.title } : rawSlot;
        const allocatedCount = allocations.filter(
          (allocation) => allocation.status === 'ALLOCATED' && (
            String(allocation.slotId) === String(slot.id) ||
            (slot.id && String(slot.id).replace('SLOT-', '') === String(allocation.slotId).replace('SLOT-', ''))
          )
        ).length;
        const isBooked = Boolean(rawSlot.status === 'BOOKED' || rawSlot.assignedCandidate || allocatedCount >= slot.cap);
        return { ...slot, rem: isBooked ? 0 : Math.max(0, slot.cap - allocatedCount) };
      });
    }, [allSlots, allocations, embeddedVacancy]);

    const filteredCandidates = useMemo(() => {
      const activeAllocations = allocations.filter((a) => a.status === 'ALLOCATED' && a.slotId);
      const allocatedCandIds = new Set(activeAllocations.map((a) => String(a.candidateId)));
      const allocatedCandNames = new Set(
        activeAllocations.map((a) => (a.candidateName || '').toLowerCase().trim())
      );

      const seenNames = new Set();
      return candidates.filter((candidate) => {
        const lowerName = (candidate.name || '').toLowerCase().trim();
        const candIdStr = String(candidate.id);

        // Candidate is allocated strictly if they currently exist in active allocations
        const isAllocated =
          allocatedCandIds.has(candIdStr) ||
          allocatedCandNames.has(lowerName);

        if (isAllocated) return false;

        if (jobPosition) {
          const cPos = (candidate.jobPosition || candidate.role || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const curPos = jobPosition.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matchesPos = !curPos || !cPos || cPos === curPos || cPos.includes(curPos) || curPos.includes(cPos)
            || ((cPos.includes('software') || cPos.includes('fullstack')) && (curPos.includes('software') || curPos.includes('fullstack')));
          if (!matchesPos) return false;
        }

        if (candidateSearchQuery) {
          const q = candidateSearchQuery.toLowerCase().trim();
          const matchesName = lowerName.includes(q);
          const matchesId = candIdStr.toLowerCase().includes(q);
          if (!matchesName && !matchesId) return false;
        }

        if (seenNames.has(lowerName)) return false;
        seenNames.add(lowerName);

        return true;
      });
    }, [candidates, jobPosition, allocations, candidateSearchQuery]);

    const filteredSlots = useMemo(() => {
      const isPastSlot = (slot) => Boolean(slot.isPast || isSlotTimeInPast(slot.dateKey || slot.date, slot.time || slot.startTime));

      // Match on position & strictly exclude past slots
      const posMatches = slotsWithRemaining.filter((slot) => {
        if (isOutdatedPastDate(slot.dateKey || slot.date)) return false;
        if (isPastSlot(slot)) return false;
        if (!jobPosition) return true;
        const slotPos = (slot.jobPosition || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetPos = jobPosition.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!slotPos || !targetPos) return true;
        return slotPos === targetPos || slotPos.includes(targetPos) || targetPos.includes(slotPos)
          || ((slotPos.includes('software') || slotPos.includes('fullstack')) && (targetPos.includes('software') || targetPos.includes('fullstack')));
      });

      const displayPool = posMatches.length > 0
        ? posMatches
        : slotsWithRemaining.filter((s) => !isOutdatedPastDate(s.dateKey || s.date) && !isPastSlot(s));

      // Deduplicate slots strictly by normalized date + time to prevent any duplicates
      const normalizeSlotKey = (s) => {
        const d = (s.dateShort || s.date || s.dateKey || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const t = formatDisplayTime(s.time || s.startTime || '').toLowerCase().replace(/\s+/g, '');
        return `${d}-${t}`;
      };

      const uniqueMap = new Map();
      displayPool.forEach((s) => {
        if (isOutdatedPastDate(s.dateKey || s.date) || isPastSlot(s)) return;
        const key = normalizeSlotKey(s);
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, s);
        } else {
          // If this slot is BOOKED (rem === 0), keep the booked one so it reflects FULL accurately
          const existing = uniqueMap.get(key);
          if (existing.rem > 0 && s.rem === 0) {
            uniqueMap.set(key, s);
          }
        }
      });

      const allValid = Array.from(uniqueMap.values());

      // Sort slots chronologically
      allValid.sort((a, b) => {
        const diff = parseSlotDateTime(a) - parseSlotDateTime(b);
        if (diff !== 0) return diff;
        return String(a.id).localeCompare(String(b.id));
      });

      return allValid;
    }, [jobPosition, slotsWithRemaining]);

    useEffect(() => {
      if (!filteredSlots.some((slot) => slot.id === selectedSlotId && slot.rem > 0)) {
        setSelectedSlotId('');
      }
    }, [filteredSlots, selectedSlotId]);

    const totalSlotPages = Math.max(1, Math.ceil(filteredSlots.length / slotsPerPage));
    const paginatedSlots = useMemo(() => {
      const startIdx = (slotPage - 1) * slotsPerPage;
      return filteredSlots.slice(startIdx, startIdx + slotsPerPage);
    }, [filteredSlots, slotPage, slotsPerPage]);

    useEffect(() => {
      setSlotPage(1);
    }, [jobPosition, interviewRound, interviewDate]);

    useEffect(() => {
      if (slotPage > totalSlotPages) setSlotPage(totalSlotPages);
    }, [slotPage, totalSlotPages]);

    // Toggle selection for Candidate radio
    const handleToggleCandidateSelect = (id, forceSelect = false) => {
      setCandidates((prev) =>
        prev.map((c) => ({
          ...c,
          selected: c.id === id ? (forceSelect ? true : !c.selected) : false,
        }))
      );
    };

    // Select/Deselect All Candidates
    const handleSelectAllCandidates = (e) => {
      const isChecked = e.target.checked;
      const visibleIds = new Set(filteredCandidates.map((candidate) => candidate.id));
      setCandidates((prev) =>
        prev.map((candidate) =>
          visibleIds.has(candidate.id) ? { ...candidate, selected: isChecked } : candidate
        )
      );
    };

    const buildAllocationRecord = (candidate, slot) => {
      const isPhysical = slot.type === 'Physical';
      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        slotId: slot.id,
        assignedTime: formatTimeRange(slot.time || slot.startTime, slot.end || slot.endTime),
        interviewDate: slot.date,
        interviewType: slot.type,
        interviewMedia: isPhysical ? 'In-Person' : 'Google Meet',
        meetingLocation: isPhysical
          ? 'Engineering Interview Room 1, HQ Building'
          : (slot.meetingLocation || 'https://meet.google.com/new'),
        meetingId: isPhysical ? '' : 'meet.google.com/new',
        meetingPasscode: isPhysical ? '' : 'Direct Video Link',
        panelName: slot.panelName || assignedPanels[0]?.name || 'Panel A (Technical Leads)',
        interviewRound: (interviewRound && interviewRound !== 'All Rounds') ? interviewRound : (slot.round || candidate.round || 'Technical Interview'),
        jobPosition: jobPosition || slot.jobPosition || candidate.jobPosition || candidate.role || 'Senior Software Engineer',
        score: candidate.score || 85,
        status: 'ALLOCATED',
      };
    };

    const performManualAllocation = (selectedCands, slotToAssign) => {
      const candidatesToMove = selectedCands.filter(
        (candidate) => allocationByCandidate.get(candidate.id)?.slotId !== slotToAssign.id
      );
      if (candidatesToMove.length === 0) {
        showToast('The selected candidate(s) are already allocated to this slot.', 'error');
        return;
      }
      if (candidatesToMove.length > slotToAssign.rem) {
        showToast(
          `Only ${slotToAssign.rem} seat(s) remain in this slot. Reduce the candidate selection.`,
          'error'
        );
        return;
      }

      // 1. Calculate updated allocations synchronously
      const nextAllocations = [...allocations];
      candidatesToMove.forEach((candidate) => {
        const record = buildAllocationRecord(candidate, slotToAssign);
        const existingIndex = nextAllocations.findIndex(
          (item) => String(item.candidateId) === String(candidate.id) ||
            (item.candidateName && candidate.name && item.candidateName.toLowerCase().trim() === candidate.name.toLowerCase().trim())
        );
        if (existingIndex >= 0) {
          nextAllocations[existingIndex] = record;
        } else {
          nextAllocations.unshift(record);
        }
      });

      // 2. Calculate updated candidates synchronously
      const nextCandidates = candidates.map((candidate) => {
        const isMoved = candidatesToMove.some(
          (c) => String(c.id) === String(candidate.id) || (c.name && candidate.name && c.name.toLowerCase().trim() === candidate.name.toLowerCase().trim())
        );
        if (isMoved) {
          return { ...candidate, status: 'ALLOCATED', selected: false };
        }
        return candidate.selected ? { ...candidate, selected: false } : candidate;
      });

      // 3. Immediately persist synchronously to localStorage
      try {
        localStorage.setItem('intellihire_allocations', JSON.stringify(nextAllocations));
        localStorage.setItem('intellihire_candidates', JSON.stringify(nextCandidates));
      } catch { }

      // Persist to backend PostgreSQL API
      const rawSlotId = String(slotToAssign.rawSlotId || slotToAssign.id).replace('SLOT-', '');
      candidatesToMove.forEach((candidate) => {
        allocateCandidate(rawSlotId, {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email || `${(candidate.name || 'candidate').toLowerCase().replace(/\s+/g, '.')}@example.com`,
          score: candidate.score,
          avatar: candidate.avatar,
        }).catch((err) => console.error('Error allocating candidate to PostgreSQL:', err));
      });

      // 4. Update component state with precomputed arrays
      setAllocations(nextAllocations);
      setCandidates(nextCandidates);

      setSelectedSlotId('');
      setPendingReallocation(null);
      setCurrentPage(1);

      // 5. Dispatch event with source tag so this component does not self-overwrite
      window.dispatchEvent(
        new CustomEvent('intellihire_slots_updated', {
          detail: { source: 'CandidateInterviewAllocation' },
        })
      );

      showToast(
        `Allocated ${candidatesToMove.length} candidate(s) to ${slotToAssign.time} on ${slotToAssign.dateShort}. Google Calendar invite sent!`
      );
    };

    // Manual Allocate Button Action
    const handleManualAllocate = () => {
      // 1. Resolve selected candidate(s) strictly from visible active selection first
      let selectedCands = selectedVisibleCandidates;
      if (!selectedCands || selectedCands.length === 0) {
        selectedCands = filteredCandidates.filter((c) => c.selected);
      }
      if (!selectedCands || selectedCands.length === 0) {
        selectedCands = candidates.filter((c) => c.selected);
      }

      // 2. Resolve selected slot
      const slotToAssign = filteredSlots.find((slot) => slot.id === selectedSlotId) ||
        allSlots.find((slot) => slot.id === selectedSlotId);

      if (!selectedCands || selectedCands.length === 0) {
        showToast('Please select at least one candidate to allocate.', 'error');
        return;
      }
      if (!slotToAssign) {
        showToast('Please select an available time slot.', 'error');
        return;
      }
      if (slotToAssign.rem <= 0) {
        showToast(`Slot ${slotToAssign.time} (${slotToAssign.dateShort}) is fully booked!`, 'error');
        return;
      }

      // Mandatory Panel Member Availability Check before assignment
      const availCheck = checkPanelMemberAvailability(
        slotToAssign.panelName || 'Panel A',
        slotToAssign.dateKey || slotToAssign.date,
        slotToAssign.time || slotToAssign.startTime
      );
      if (availCheck.status === 'CONFLICT') {
        showToast(`Cannot allocate: ${availCheck.message}`, 'error');
        return;
      }
      if (availCheck.status === 'OFF_DUTY') {
        showToast(`Cannot allocate: ${availCheck.message}`, 'error');
        return;
      }
      const reallocations = selectedCands.filter((candidate) => {
        const existing = allocationByCandidate.get(candidate.id);
        return existing?.status === 'ALLOCATED' && existing.slotId !== slotToAssign.id;
      });
      if (reallocations.length > 0) {
        setPendingReallocation({ candidates: selectedCands, slot: slotToAssign });
        return;
      }
      performManualAllocation(selectedCands, slotToAssign);
    };

    // Remove Allocation Action (Unassign single candidate - returns immediately to shortlist)
    const handleRemoveAllocation = (candidateId, candName = null) => {
      const targetAlloc = allocations.find(
        (a) => String(a.candidateId) === String(candidateId) || (candName && (a.candidateName || '').toLowerCase().trim() === candName.toLowerCase().trim())
      );
      const candidateName = candName || targetAlloc?.candidateName;

      const nextAllocations = allocations.filter(
        (a) => String(a.candidateId) !== String(candidateId) && (!candidateName || (a.candidateName || '').toLowerCase().trim() !== candidateName.toLowerCase().trim())
      );

      const matchCandidate = (c) =>
        String(c.id) === String(candidateId) || (candidateName && (c.name || '').toLowerCase().trim() === candidateName.toLowerCase().trim());

      const matched = (candidates || []).find(matchCandidate);
      const remaining = (candidates || []).filter((c) => !matchCandidate(c));

      const restoredCandidate = {
        id: candidateId || matched?.id || `APP-${Date.now()}`,
        name: candidateName || matched?.name || targetAlloc?.candidateName || 'Candidate',
        score: targetAlloc?.score || matched?.score || 85,
        jobPosition: targetAlloc?.jobPosition || matched?.jobPosition || jobPosition || 'Senior Software Engineer',
        role: targetAlloc?.role || targetAlloc?.jobPosition || matched?.role || matched?.jobPosition || jobPosition || 'Senior Software Engineer',
        round: (interviewRound && interviewRound !== 'All Rounds') ? interviewRound : (targetAlloc?.interviewRound || matched?.round || 'Technical Interview'),
        status: 'SHORTLISTED',
        selected: false,
      };

      const nextCandidates = [restoredCandidate, ...remaining];

      try {
        localStorage.setItem('intellihire_allocations', JSON.stringify(nextAllocations));
        localStorage.setItem('intellihire_candidates', JSON.stringify(nextCandidates));
      } catch { }

      setAllocations(nextAllocations);
      setCandidates(nextCandidates);

      // Remove candidate from notified list if unassigned
      updateNotifiedCandidateIds((prev) => {
        const next = new Set(prev);
        next.delete(candidateId);
        return next;
      });

      // Persist removal to backend PostgreSQL API
      const targetIdentifier = candidateId || candidateName;
      if (targetIdentifier) {
        deleteAllocation(targetIdentifier).catch((err) => console.warn('Backend deleteAllocation fallback:', err));
      }

      window.dispatchEvent(
        new CustomEvent('intellihire_slots_updated', {
          detail: { source: 'CandidateInterviewAllocation' },
        })
      );
      showToast(`${candidateName || 'Candidate'} unassigned and returned to shortlist.`);
    };

    // Auto Allocate Algorithm
    const handleAutoAllocate = () => {
      const eligibleCandidates = [...filteredCandidates].sort((a, b) => b.score - a.score);
      const availableSlots = filteredSlots.map((slot) => ({ ...slot, rem: slot.rem }));

      if (eligibleCandidates.length === 0) {
        showToast('No shortlisted candidates available to allocate.', 'info');
        return;
      }
      if (availableSlots.filter((s) => s.rem > 0).length === 0) {
        showToast('No matching time slots with remaining capacity are available.', 'error');
        return;
      }

      const newAllocations = [...allocations];
      const allocatedCandIds = new Set();

      eligibleCandidates.forEach((cand) => {
        const availableSlot = availableSlots.find((slot) => slot.rem > 0);

        if (availableSlot) {
          availableSlot.rem -= 1;
          const record = buildAllocationRecord(cand, availableSlot);
          const exIdx = newAllocations.findIndex(
            (a) => String(a.candidateId) === String(cand.id) || (a.candidateName && a.candidateName.toLowerCase().trim() === cand.name.toLowerCase().trim())
          );
          if (exIdx >= 0) newAllocations[exIdx] = record;
          else newAllocations.unshift(record);
          allocatedCandIds.add(cand.id);
        }
      });

      const nextCandidates = candidates.map((candidate) => {
        if (allocatedCandIds.has(candidate.id)) {
          return { ...candidate, status: 'ALLOCATED', selected: false };
        }
        return { ...candidate, selected: false };
      });

      try {
        localStorage.setItem('intellihire_allocations', JSON.stringify(newAllocations));
        localStorage.setItem('intellihire_candidates', JSON.stringify(nextCandidates));
      } catch { }

      // Persist auto-allocations to backend PostgreSQL API
      eligibleCandidates.forEach((cand) => {
        const targetSlot = availableSlots.find((s) => s.rem > 0);
        if (targetSlot) {
          const rawSlotId = String(targetSlot.rawSlotId || targetSlot.id).replace('SLOT-', '');
          allocateCandidate(rawSlotId, {
            id: cand.id,
            name: cand.name,
            email: cand.email || `${(cand.name || 'candidate').toLowerCase().replace(/\s+/g, '.')}@example.com`,
            score: cand.score,
            avatar: cand.avatar,
          }).catch((err) => console.error('Error saving auto-allocation to PostgreSQL:', err));
        }
      });

      setAllocations(newAllocations);
      setCandidates(nextCandidates);

      setSelectedSlotId('');
      setCurrentPage(1);
      window.dispatchEvent(
        new CustomEvent('intellihire_slots_updated', {
          detail: { source: 'CandidateInterviewAllocation' },
        })
      );
      showToast(`Auto-allocated ${allocatedCandIds.size} candidate(s)! Google Calendar invites sent.`);
    };

    // Reset All Allocations (Unassign all candidates so all 9 go to shortlist)
    const handleResetAllAllocations = () => {
      // 1. Clear all allocations completely
      setAllocations([]);
      try {
        localStorage.setItem('intellihire_allocations', JSON.stringify([]));
      } catch (e) { }

      // Reset all allocations in backend PostgreSQL API
      resetAllocations().catch((err) => console.warn('Backend resetAllocations fallback:', err));

      // 2. Mark ALL 9 candidates as SHORTLISTED (0 allocated, 9 shortlisted)
      const allShortlistedCandidates = INITIAL_CANDIDATES.map((c) => ({
        ...c,
        status: 'SHORTLISTED',
        selected: false,
      }));
      setCandidates(allShortlistedCandidates);
      try {
        localStorage.setItem('intellihire_candidates', JSON.stringify(allShortlistedCandidates));
      } catch (e) { }

      // 3. Clear custom slots and interview slots completely to restore clean default state
      try {
        localStorage.removeItem('intellihire_custom_slots');
        localStorage.removeItem('intellihire_interview_slots');
      } catch (e) { }
      setCustomSlots([]);

      setSelectedSlotId('');
      updateNotifiedCandidateIds(new Set());
      try {
        localStorage.removeItem('intellihire_notified_candidate_ids');
      } catch (e) { }
      setShowResetConfirm(false);
      setCurrentPage(1);
      window.dispatchEvent(
        new CustomEvent('intellihire_slots_updated', {
          detail: { source: 'CandidateInterviewAllocation' },
        })
      );
      window.dispatchEvent(new Event('storage'));
      showToast('Reset completed: All allocations unassigned. All 9 candidates returned to shortlist.', 'success');
    };
    const handleResetAllocations = handleResetAllAllocations;

    const handleOpenDirectReschedule = (item) => {
      if (!item) return;
      if (item.allowDirectReschedule === false) {
        showToast('Direct rescheduling is locked by the initial scheduling policy for this session.', 'error');
        return;
      }
      const maxAllowed = item.maxReschedulesAllowed;
      const usedCount = Number(item.rescheduleCount || 0);
      if (maxAllowed && maxAllowed !== 'unlimited' && usedCount >= Number(maxAllowed)) {
        showToast(`Maximum allowed reschedules (${maxAllowed}) reached for ${item.candidateName}.`, 'error');
        return;
      }

      setReschedulingAllocation(item);
      setRescheduleMode('slot');
      setRescheduleSlotId(item.slotId ? String(item.slotId) : '');
      const t = new Date();
      t.setDate(t.getDate() + 1);
      const parsedDate = (() => {
        if (!item.interviewDate) return t.toISOString().split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(item.interviewDate)) return item.interviewDate;
        const d = new Date(item.interviewDate);
        return Number.isNaN(d.getTime()) ? t.toISOString().split('T')[0] : d.toISOString().split('T')[0];
      })();
      setRescheduleCustomDate(parsedDate);
      setRescheduleCustomStart('10:00');
      setRescheduleCustomEnd('11:00');
      setRescheduleReason('Adjusted schedule directly through IntelliHire');
      setRescheduleAutoNotify(item.autoNotifyOnReschedule !== false);
    };

    const handleConfirmReschedule = () => {
      if (!reschedulingAllocation) return;

      const to12HourStr = (hhmm) => {
        if (!hhmm || !hhmm.includes(':')) return hhmm;
        const [hRaw, mRaw] = hhmm.split(':');
        let h = parseInt(hRaw, 10);
        const period = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${String(h).padStart(2, '0')}:${mRaw} ${period}`;
      };

      const candidateRecord = rescheduleCandidate || {
        id: reschedulingAllocation.candidateId,
        name: reschedulingAllocation.candidateName,
        score: reschedulingAllocation.score || 85,
        jobPosition: reschedulingAllocation.jobPosition || jobPosition,
      };

      let newRecord = null;
      let summaryLabel = '';

      if (rescheduleMode === 'slot') {
        if (!rescheduleSlotId) {
          showToast('Select an available slot to reschedule this candidate.', 'error');
          return;
        }
        const targetSlot = slotsWithRemaining.find((slot) => String(slot.id) === String(rescheduleSlotId));
        if (!targetSlot) {
          showToast('Selected time slot not found.', 'error');
          return;
        }
        const isCurrentSlot = String(reschedulingAllocation.slotId) === String(targetSlot.id);
        if (!isCurrentSlot && targetSlot.rem <= 0) {
          showToast('The selected slot is fully booked.', 'error');
          return;
        }

        // Mandatory Panel Member Availability Check before rescheduling
        const availCheck = checkPanelMemberAvailability(
          targetSlot.panelName || 'Panel A',
          targetSlot.dateKey || targetSlot.date,
          targetSlot.time || targetSlot.startTime
        );
        if (availCheck.status === 'CONFLICT') {
          showToast(`Cannot reschedule: ${availCheck.message}`, 'error');
          return;
        }

        const built = buildAllocationRecord(candidateRecord, targetSlot);
        newRecord = {
          ...reschedulingAllocation,
          ...built,
          rescheduleCount: Number(reschedulingAllocation.rescheduleCount || 0) + 1,
          lastRescheduledAt: new Date().toISOString(),
          rescheduledReason: rescheduleReason || 'Moved to available slot',
          status: 'ALLOCATED',
        };
        summaryLabel = `${targetSlot.date} at ${targetSlot.time || targetSlot.startTime}`;

        // Persist backend direct reschedule
        directRescheduleInterviewApi({
          slotId: reschedulingAllocation.slotId,
          targetSlotId: targetSlot.id,
          candidateId: reschedulingAllocation.candidateId,
          candidateName: reschedulingAllocation.candidateName,
          reason: rescheduleReason,
        }).catch(() => {});
      } else {
        // Custom direct date/time mode
        if (!rescheduleCustomDate || !rescheduleCustomStart || !rescheduleCustomEnd) {
          showToast('Select date, start time, and end time for direct reschedule.', 'error');
          return;
        }
        if (rescheduleCustomStart >= rescheduleCustomEnd) {
          showToast('End time must be strictly after start time.', 'error');
          return;
        }

        const start12 = to12HourStr(rescheduleCustomStart);
        const end12 = to12HourStr(rescheduleCustomEnd);

        // Mandatory Panel Member Availability Check for custom timing
        const availCheck = checkPanelMemberAvailability(
          reschedulingAllocation.panelName || 'Panel A',
          rescheduleCustomDate,
          start12
        );
        if (availCheck.status === 'CONFLICT') {
          showToast(`Cannot reschedule: ${availCheck.message}`, 'error');
          return;
        }

        const dObj = new Date(rescheduleCustomDate);
        const displayDate = Number.isNaN(dObj.getTime())
          ? rescheduleCustomDate
          : dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeRange = `${start12} – ${end12}`;

        newRecord = {
          ...reschedulingAllocation,
          interviewDate: displayDate,
          assignedDate: rescheduleCustomDate,
          assignedTime: timeRange,
          assignedEndTime: end12,
          rescheduleCount: Number(reschedulingAllocation.rescheduleCount || 0) + 1,
          lastRescheduledAt: new Date().toISOString(),
          rescheduledReason: rescheduleReason || 'Direct custom reschedule',
          status: 'ALLOCATED',
        };
        summaryLabel = `${displayDate} (${timeRange})`;

        // Sync intellihire_interview_slots & intellihire_custom_slots so Panel Schedule reflects immediately
        try {
          const cleanSlotId = String(reschedulingAllocation.slotId || '').replace('SLOT-', '');
          const storedSlots = JSON.parse(localStorage.getItem('intellihire_interview_slots') || '[]');
          if (Array.isArray(storedSlots) && storedSlots.length > 0) {
            const nextStored = storedSlots.map((s) => {
              const candMatch = (s.candidate?.name || s.candidateName || '').toLowerCase() === (reschedulingAllocation.candidateName || '').toLowerCase();
              if (String(s.id) === cleanSlotId || candMatch) {
                return {
                  ...s,
                  rawDate: rescheduleCustomDate,
                  interviewDate: displayDate,
                  startTime: start12,
                  endTime: end12,
                  status: 'RESCHEDULED',
                  lastRescheduledAt: new Date().toISOString(),
                };
              }
              return s;
            });
            localStorage.setItem('intellihire_interview_slots', JSON.stringify(nextStored));
          }
        } catch { }

        directRescheduleInterviewApi({
          slotId: reschedulingAllocation.slotId,
          candidateId: reschedulingAllocation.candidateId,
          candidateName: reschedulingAllocation.candidateName,
          newDate: rescheduleCustomDate,
          newStartTime: start12,
          newEndTime: end12,
          reason: rescheduleReason,
        }).catch(() => {});
      }

      setAllocations((current) => {
        const next = current.map((allocation) => {
          const isTarget =
            allocation.candidateId === reschedulingAllocation.candidateId ||
            (allocation.candidateName &&
              reschedulingAllocation.candidateName &&
              allocation.candidateName.toLowerCase() === reschedulingAllocation.candidateName.toLowerCase());
          return isTarget ? newRecord : allocation;
        });
        try {
          localStorage.setItem('intellihire_allocations', JSON.stringify(next));
        } catch { }
        return next;
      });

      if (rescheduleAutoNotify && newRecord) {
        sendInterviewReminder({
          allocation: newRecord,
          type: 'RESCHEDULED',
          customNotes: rescheduleReason,
        }).catch(() => {});
        setRemindersLogTick((t) => t + 1);
      }

      setReschedulingAllocation(null);
      setRescheduleSlotId('');
      window.dispatchEvent(new Event('intellihire_slots_updated'));
      showToast(
        `${reschedulingAllocation.candidateName}'s interview rescheduled directly to ${summaryLabel}${rescheduleAutoNotify ? ' & updated reminders dispatched!' : '!'}`
      );
    };

    // Save Allocations
    const handleSaveAllocations = () => {
      const vId = embeddedVacancy?.id || 'VAC-001';
      allocations.forEach((alloc) => {
        if (alloc.status === 'ALLOCATED') {
          const existingIdx = INTERVIEWS.findIndex(
            (item) => item.vacancyId === vId && item.candidateName === alloc.candidateName
          );
          const record = {
            id: `${vId}-${alloc.candidateId}`,
            vacancyId: vId,
            candidateName: alloc.candidateName,
            date: alloc.interviewDate,
            time: alloc.assignedTime,
            round: interviewRound || 'Round 1',
            status: 'scheduled',
            interviewer: 'Interview Panel',
            location: alloc.interviewType === 'Physical' ? 'Office — Room 1A' : 'Google Meet',
          };
          if (existingIdx >= 0) {
            INTERVIEWS[existingIdx] = record;
          } else {
            INTERVIEWS.push(record);
          }
        }
      });
      showToast('Interview allocations saved and synced to schedule!');
    };

    // Filtered Allocations for display (strictly exclude completed sessions / Danushka Silva which belong solely to Panel Schedule)
    const filteredAllocations = useMemo(() => {
      let list = allocations.filter((a) => {
        const isDanushka = (a.candidateName || '').toLowerCase().includes('danushka');
        const isCompleted = a.status === 'COMPLETED';
        return !isDanushka && !isCompleted;
      });
      if (jobPosition) {
        const targetPos = jobPosition.toLowerCase().replace(/[^a-z0-9]/g, '');
        list = list.filter((a) => {
          const allocPos = (a.jobPosition || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return !targetPos || !allocPos || allocPos === targetPos || allocPos.includes(targetPos) || targetPos.includes(allocPos)
            || ((allocPos.includes('software') || allocPos.includes('fullstack')) && (targetPos.includes('software') || targetPos.includes('fullstack')));
        });
      }
      if (interviewRound && interviewRound !== 'All Rounds') {
        const irLower = interviewRound.toLowerCase().replace(/[^a-z0-9]/g, '');
        list = list.filter((a) => {
          if (!a.interviewRound) return true;
          const aRound = (a.interviewRound || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return aRound === irLower || aRound.includes(irLower) || irLower.includes(aRound)
            || ((aRound.includes('tech') || aRound.includes('system')) && (irLower.includes('tech') || irLower.includes('system')));
        });
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter((a) =>
          (a.candidateName || '').toLowerCase().includes(q) ||
          (a.interviewType || '').toLowerCase().includes(q) ||
          (a.status || '').toLowerCase().includes(q) ||
          (a.panelName || '').toLowerCase().includes(q) ||
          (a.interviewRound || '').toLowerCase().includes(q)
        );
      }
      return list;
    }, [allocations, jobPosition, interviewRound, searchQuery]);

    // Pagination calculations
    const totalResults = filteredAllocations.length;
    const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;
    const paginatedAllocations = useMemo(() => {
      const startIdx = (currentPage - 1) * itemsPerPage;
      return filteredAllocations.slice(startIdx, startIdx + itemsPerPage);
    }, [filteredAllocations, currentPage, itemsPerPage]);

    useEffect(() => {
      setCurrentPage(1);
    }, [jobPosition, searchQuery, allocationStatusFilter]);

    useEffect(() => {
      if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    // ── Interview Reminders & Pop-up Alarms State ──
    const [showRemindersModal, setShowRemindersModal] = useState(false);
    const [dismissedAlertBanner, setDismissedAlertBanner] = useState(false);
    const [remindersLogTick, setRemindersLogTick] = useState(0);

    const upcomingRemindersData = useMemo(() => {
      return checkUpcomingInterviewReminders(filteredAllocations);
    }, [filteredAllocations, remindersLogTick]);

    const handleSendSingleReminder = async (item, type = '24h') => {
      const res = await sendInterviewReminder({ allocation: item, type });
      setRemindersLogTick((t) => t + 1);
      setToast({
        type: 'success',
        message: `Automated ${type} reminder dispatched to ${item.candidateName} & panel (${item.panelEmails || item.panelMembers || 'panel members'})!`,
      });
    };

    const handleSendAllReminders = async (type = '24h') => {
      const allocated = filteredAllocations.filter((a) => a.status === 'ALLOCATED');
      if (allocated.length === 0) {
        setToast({ type: 'warning', message: 'No allocated interviews found to send reminders.' });
        return;
      }
      await sendBulkInterviewReminders(allocated, type);
      setRemindersLogTick((t) => t + 1);
      setToast({
        type: 'success',
        message: `Automated ${type} reminders & Google Calendar notifications dispatched to ${allocated.length} candidates and panel members!`,
      });
    };

    const selectedVisibleCandidates = filteredCandidates.filter((candidate) => candidate.selected);
    const selectedSlot = filteredSlots.find((slot) => slot.id === selectedSlotId);
    const rescheduleCandidate = reschedulingAllocation
      ? candidates.find(
        (c) =>
          c.id === reschedulingAllocation.candidateId ||
          (c.name && reschedulingAllocation.candidateName && c.name.toLowerCase() === reschedulingAllocation.candidateName.toLowerCase())
      ) || {
        id: reschedulingAllocation.candidateId,
        name: reschedulingAllocation.candidateName,
        jobPosition: reschedulingAllocation.jobPosition || jobPosition,
        round: reschedulingAllocation.interviewRound || reschedulingAllocation.round,
      }
      : null;

    const rescheduleOptions = useMemo(() => {
      if (!reschedulingAllocation) return [];

      return slotsWithRemaining.filter((slot) => {
        if (isOutdatedPastDate(slot.dateKey || slot.date)) return false;
        if (slot.isPast || isSlotTimeInPast(slot.dateKey || slot.date, slot.time || slot.startTime)) return false;

        const targetPos = (rescheduleCandidate?.jobPosition || reschedulingAllocation.jobPosition || jobPosition || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const slotPos = (slot.jobPosition || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (targetPos && slotPos) {
          const matchesPos = slotPos === targetPos || slotPos.includes(targetPos) || targetPos.includes(slotPos)
            || ((slotPos.includes('software') || slotPos.includes('fullstack')) && (targetPos.includes('software') || targetPos.includes('fullstack')));
          if (!matchesPos) return false;
        }

        const isCurrentSlot = String(slot.id) === String(reschedulingAllocation.slotId);
        return slot.rem > 0 || isCurrentSlot;
      });
    }, [reschedulingAllocation, rescheduleCandidate, slotsWithRemaining, jobPosition]);
    const allCandidatesSelected =
      filteredCandidates.length > 0 && filteredCandidates.every((candidate) => candidate.selected);

    const allPositions = useMemo(() => {
      const defaultPositions = [
        'Senior Software Engineer',
        'UI/UX Designer',
        'QA Automation Engineer',
        'Product Designer',
        'Senior Frontend Engineer',
        'Backend Engineer',
        'Business Analyst',
        'Product Manager',
        'DevOps Lead',
      ];
      const vacancyTitles = VACANCIES.map((v) => v.title);
      return Array.from(new Set([...vacancyTitles, ...defaultPositions, jobPosition].filter(Boolean)));
    }, [jobPosition]);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const mainContent = (
      <>
        {/* Standard IntelliHire Toast Notification */}
        <AdminToast toast={toast} onDismiss={() => setToast(null)} />

        {/* ── Upcoming Interview Pop-up Alert Banner ── */}
        {!dismissedAlertBanner && upcomingRemindersData.hasUpcomingAlerts && (
          <div
            style={{
              backgroundColor: '#1E222D',
              border: '1px solid rgba(240, 185, 11, 0.4)',
              borderLeft: '4px solid #F0B90B',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(240, 185, 11, 0.15)',
                  padding: '10px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BellRing size={20} style={{ color: '#F0B90B' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                    🔔 Upcoming Interview Pop-up Alert
                  </span>
                  <span
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#EF4444',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}
                  >
                    {upcomingRemindersData.upcomingWithin24h.length} Session(s) in next 24 hours
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9599A6' }}>
                  Next upcoming session:{' '}
                  <strong style={{ color: '#F0B90B' }}>
                    {upcomingRemindersData.upcomingWithin24h[0]?.candidateName}
                  </strong>{' '}
                  ({upcomingRemindersData.upcomingWithin24h[0]?.jobPosition}) —{' '}
                  <span style={{ color: '#4ADE80', fontWeight: 600 }}>
                    {upcomingRemindersData.upcomingWithin24h[0]?.countdownText}
                  </span>{' '}
                  ({upcomingRemindersData.upcomingWithin24h[0]?.assignedTime || upcomingRemindersData.upcomingWithin24h[0]?.startTime})
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowRemindersModal(true)}
                style={{
                  backgroundColor: '#F0B90B',
                  color: '#000000',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Bell size={13} />
                <span>Review &amp; Dispatch Reminders</span>
              </button>
              <button
                type="button"
                onClick={() => setDismissedAlertBanner(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#9599A6',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
                title="Dismiss alert banner"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── Filter Controls Card ── */}
        <div
          className="card-surface"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '14px 18px',
            marginBottom: '18px',
            borderRadius: '10px',
            border: '1px solid #2A2C38',
            backgroundColor: '#16171F',
          }}
        >
          {/* Left: Position & Round Filters */}
          <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', minWidth: 0 }}>
            {!embeddedVacancy && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.68rem', color: '#9599A6', fontWeight: 700, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BriefcaseBusiness size={12} style={{ color: '#F0B90B' }} />
                  <span>JOB POSITION</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    style={{
                      height: '35px',
                      minWidth: '175px',
                      padding: '0 26px 0 10px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      backgroundColor: '#0D0E13',
                      border: '1px solid #2A2C38',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Job Positions</option>
                    {allPositions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '10px', fontSize: '0.65rem', color: '#9599A6', pointerEvents: 'none' }}>▼</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.68rem', color: '#9599A6', fontWeight: 700, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock3 size={12} style={{ color: '#F0B90B' }} />
                <span>INTERVIEW ROUND</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                  value={interviewRound}
                  onChange={(e) => setInterviewRound(e.target.value)}
                  style={{
                    height: '35px',
                    minWidth: '170px',
                    padding: '0 26px 0 10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: '#0D0E13',
                    border: '1px solid #2A2C38',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Rounds</option>
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="Technical">Technical</option>
                  <option value="HR Screening">HR Screening</option>
                  <option value="HR Portfolio Review">HR Portfolio Review</option>
                  <option value="System Design Architecture">System Design Architecture</option>
                  <option value="Final Cultural Fit">Final Cultural Fit</option>
                  <option value="Final Management Round">Final Management Round</option>
                  {interviewRound && !['Technical Interview', 'Technical', 'HR Screening', 'HR Portfolio Review', 'System Design Architecture', 'Final Cultural Fit', 'Final Management Round', ''].includes(interviewRound) && (
                    <option value={interviewRound}>{interviewRound}</option>
                  )}
                </select>
                <span style={{ position: 'absolute', right: '10px', fontSize: '0.65rem', color: '#9599A6', pointerEvents: 'none' }}>▼</span>
              </div>
            </div>
          </div>

          {/* Right: Parallel badges & compact buttons */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {/* Quick Metrics Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#0D0E13',
              border: '1px solid #2A2C38',
              borderRadius: '6px',
              padding: '0 12px',
              height: '35px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#9599A6' }}>
                <Users size={12} style={{ color: '#F0B90B' }} />
                <span>Shortlisted:</span>
                <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>{filteredCandidates.length}</strong>
              </div>
              <span style={{ color: '#2A2C38' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#9599A6' }}>
                <CalendarDays size={12} style={{ color: '#60A5FA' }} />
                <span>Available Slots:</span>
                <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>{filteredSlots.length}</strong>
              </div>
            </div>

            {/* Compact Schedule Button */}
            <button
              type="button"
              onClick={() =>
                navigate('/recruiter/interviews', {
                  state: {
                    selectedVacancy: embeddedVacancy ? embeddedVacancy.title : jobPosition,
                    selectedRound: interviewRound,
                    openForm: true,
                  },
                })
              }
              title="Schedule a new interview time slot"
              style={{
                height: '35px',
                padding: '0 13px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#F0B90B',
                color: '#0D0E13',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <CalendarPlus size={13} />
              <span>+ Schedule New Slot</span>
            </button>

            {/* Compact Google Calendar Button */}
            <a
              href="https://calendar.google.com/calendar/r"
              target="_blank"
              rel="noopener noreferrer"
              title="Open Google Calendar in a new tab"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 12px',
                height: '35px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: '#1E222D',
                border: '1px solid #2A2C38',
                color: '#4285F4',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <Calendar size={13} style={{ color: '#4285F4' }} />
              <span>Google Calendar</span>
              <ExternalLink size={11} style={{ color: '#9599A6' }} />
            </a>
          </div>
        </div>

        {/* ── Bottom Card: Allocation Results ── */}
        <div className="card-surface results-card-section">
          <div className="card-header-bar flex-between border-bottom-header">
            <div className="card-title-group">
              <span className="gold-indicator"></span>
              <h2 className="card-title">Allocation Results</h2>
            </div>

            <div className="action-buttons-group" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div className="allocation-results-search">
                <Search size={15} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search results..."
                  aria-label="Search allocation results"
                />
              </div>
              <button
                type="button"
                onClick={handleResetAllAllocations}
                title="Unassign all candidates and clear allocations to start fresh"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '34px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#EF4444',
                  padding: '0 12px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                }}
              >
                <RotateCcw size={13} />
                <span>Reset All Allocations</span>
              </button>
              <button
                type="button"
                onClick={handleNotifyAllAllocated}
                title="Send email invitations with calendar links to all allocated candidates"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '34px',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  color: '#60A5FA',
                  padding: '0 12px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.12)';
                }}
              >
                <Send size={13} />
                <span>Preview &amp; Send Invites</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRemindersModal(true)}
                title="Manage automated reminders and pop-up alarms for candidates and panel"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '34px',
                  backgroundColor: 'rgba(240, 185, 11, 0.15)',
                  border: '1px solid rgba(240, 185, 11, 0.4)',
                  color: '#F0B90B',
                  padding: '0 12px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(240, 185, 11, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(240, 185, 11, 0.15)';
                }}
              >
                <Bell size={13} style={{ color: '#F0B90B' }} />
                <span>Reminders &amp; Pop-ups</span>
                {upcomingRemindersData.upcomingWithin24h.length > 0 && (
                  <span
                    style={{
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      borderRadius: '10px',
                      padding: '1px 6px',
                      marginLeft: '2px',
                    }}
                  >
                    {upcomingRemindersData.upcomingWithin24h.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="table-responsive">
            <table className="results-table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>CANDIDATE NAME</th>
                  <th style={{ whiteSpace: 'nowrap' }}>INTERVIEW ROUND</th>
                  <th style={{ whiteSpace: 'nowrap' }}>PANEL NAME</th>
                  <th style={{ whiteSpace: 'nowrap' }}>ASSIGNED TIME SLOT</th>
                  <th style={{ whiteSpace: 'nowrap' }}>INTERVIEW DATE</th>
                  <th style={{ whiteSpace: 'nowrap' }}>TYPE</th>
                  <th style={{ whiteSpace: 'nowrap' }}>STATUS</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAllocations.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px 16px', color: '#9599A6' }}>
                      No candidates allocated yet. Select candidates from the shortlist below to allocate.
                    </td>
                  </tr>
                ) : (
                  paginatedAllocations.map((item) => (
                    <tr key={item.candidateId}>
                      <td className="font-bold cand-name-cell" style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.candidateName}</td>
                      <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        <span
                          className="type-tag"
                          style={{
                            ...((r => {
                              const l = (r || '').toLowerCase();
                              if (l.includes('arch') || l.includes('system')) {
                                return { backgroundColor: 'rgba(240, 185, 11, 0.15)', color: '#F0B90B', border: '1px solid rgba(240, 185, 11, 0.35)' };
                              }
                              if (l.includes('port') || l.includes('hr') || l.includes('review') || l.includes('design')) {
                                return { backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', border: '1px solid rgba(168, 85, 247, 0.35)' };
                              }
                              return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.35)' };
                            })(item.interviewRound || item.round)),
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                          }}
                        >
                          {item.interviewRound || item.round || 'Technical Interview'}
                        </span>
                      </td>
                      <td style={{ color: '#E0E1E6', fontSize: '0.85rem', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        {formatPanelDisplayName(item.panelName || 'Panel A')}
                      </td>
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div className="time-slot-cell" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#F0B90B', fontWeight: 600, verticalAlign: 'middle' }}>
                          {item.assignedTime !== '—' && (
                            <Clock3 size={14} />
                          )}
                          <span>{formatTimeRange(item.assignedTime, item.assignedEndTime || item.endTime)}</span>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.interviewDate}</td>
                      <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: item.interviewType === 'Physical' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: item.interviewType === 'Physical' ? '#C084FC' : '#60A5FA',
                            border: `1px solid ${item.interviewType === 'Physical' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                          }}
                        >
                          {item.interviewType === 'Physical' ? '🏢 Physical' : '🌐 Online'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        <span
                          className={`status-result-badge ${item.status === 'ALLOCATED' ? 'badge-allocated' : 'badge-pending'
                            }`}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {item.status === 'ALLOCATED' ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>ALLOCATED</span>
                            </>
                          ) : (
                            <>
                              <Clock3 size={12} />
                              <span>PENDING</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        {item.status === 'ALLOCATED' && (
                          <div className="result-row-actions" style={{ display: 'inline-flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'nowrap', verticalAlign: 'middle' }}>
                            <button
                              type="button"
                              className="btn-notify-row"
                              onClick={() => handleOpenEmailPreview(item)}
                              title="Preview and send interview invitation with meeting credentials"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '3px 8px',
                                height: '26px',
                                borderRadius: '5px',
                                fontSize: '0.70rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                backgroundColor: notifiedCandidateIds.has(item.candidateId)
                                  ? 'rgba(34, 197, 94, 0.15)'
                                  : 'rgba(59, 130, 246, 0.15)',
                                border: `1px solid ${notifiedCandidateIds.has(item.candidateId)
                                    ? 'rgba(34, 197, 94, 0.4)'
                                    : 'rgba(59, 130, 246, 0.4)'
                                  }`,
                                color: notifiedCandidateIds.has(item.candidateId) ? '#4ADE80' : '#60A5FA',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {notifiedCandidateIds.has(item.candidateId) ? (
                                <>
                                  <Check size={11} />
                                  <span>Sent</span>
                                </>
                              ) : (
                                <>
                                  <Send size={11} />
                                  <span>Notify</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn-reschedule-row"
                              onClick={() => handleOpenDirectReschedule(item)}
                              title="Reschedule this candidate directly through the system"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '0 7px',
                                height: '26px',
                                fontSize: '0.69rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <RefreshCw size={10} />
                              <span>Reschedule</span>
                            </button>
                            <button
                              type="button"
                              className="btn-unassign-row"
                              onClick={() => handleRemoveAllocation(item.candidateId, item.candidateName)}
                              title="Unassign this candidate"
                              style={{ whiteSpace: 'nowrap', height: '26px', padding: '0 7px', fontSize: '0.69rem' }}
                            >
                              Unassign
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
          <div className="allocation-mobile-list results-mobile-list">
            {paginatedAllocations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 16px', color: '#9599A6' }}>
                No candidates allocated yet.
              </div>
            ) : (
              paginatedAllocations.map((item) => (
                <article className="allocation-result-mobile-card" key={`mobile-${item.candidateId}`}>
                  <div>
                    <strong>{item.candidateName}</strong>
                    <span className={`status-result-badge ${item.status === 'ALLOCATED' ? 'badge-allocated' : 'badge-pending'}`}>
                      {item.status}
                    </span>
                  </div>
                  <dl>
                    <div><dt>Round</dt><dd>{item.interviewRound || item.round || 'Technical Interview'}</dd></div>
                    <div><dt>Panel</dt><dd>{formatPanelDisplayName(item.panelName || 'Panel A')}</dd></div>
                    <div><dt>Date</dt><dd>{item.interviewDate}</dd></div>
                    <div><dt>Time</dt><dd>{item.assignedTime}</dd></div>
                    <div><dt>Type</dt><dd>{item.interviewType === 'Physical' ? '🏢 Physical' : '🌐 Online'}</dd></div>
                  </dl>
                  {item.status === 'ALLOCATED' && (
                    <div className="result-row-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      <button
                        type="button"
                        className="btn-notify-row"
                        onClick={() => handleOpenEmailPreview(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: notifiedCandidateIds.has(item.candidateId) ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          border: `1px solid ${notifiedCandidateIds.has(item.candidateId) ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
                          color: notifiedCandidateIds.has(item.candidateId) ? '#4ADE80' : '#60A5FA',
                        }}
                      >
                        {notifiedCandidateIds.has(item.candidateId) ? (
                          <>
                            <Check size={12} />
                            <span>Sent</span>
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            <span>Notify</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn-reschedule-row"
                        onClick={() => handleOpenDirectReschedule(item)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <RefreshCw size={11} />
                        <span>Reschedule</span>
                      </button>
                      <button type="button" className="btn-unassign-row" onClick={() => handleRemoveAllocation(item.candidateId, item.candidateName)}>
                        Unassign
                      </button>
                    </div>
                  )}
                </article>
              )))}
          </div>

          {/* Pagination Footer */}
          {filteredAllocations.length > itemsPerPage && (
            <div className="table-pagination-footer">
              <span className="pagination-info">
                Showing <strong>{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredAllocations.length)}</strong> of <strong>{filteredAllocations.length}</strong> allocation results
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`page-num-btn ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Dual Workspace Grid: Shortlisted Candidates | Action Buttons | Available Time Slots ── */}
        <div className="allocation-workspace-grid">
          {/* Left Card: Shortlisted Candidates */}
          <div className="card-surface candidate-list-card">
            <div className="card-header-bar flex-between" style={{ paddingBottom: '12px', borderBottom: '1px solid #2A2C38', gap: '8px' }}>
              <div className="card-title-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} style={{ color: '#F0B90B', flexShrink: 0 }} />
                <h3 className="card-title" style={{ margin: 0, fontSize: '0.92rem' }}>Shortlisted Candidates</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={12} style={{ position: 'absolute', left: '8px', color: '#9599A6', pointerEvents: 'none' }} />
                  <input
                    type="search"
                    placeholder="Filter candidate"
                    value={candidateSearchQuery}
                    onChange={(e) => setCandidateSearchQuery(e.target.value)}
                    style={{
                      height: '28px',
                      padding: '0 8px 0 24px',
                      fontSize: '0.73rem',
                      backgroundColor: '#0D0E13',
                      border: '1px solid #2A2C38',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      outline: 'none',
                      width: '126px',
                    }}
                  />
                </div>
                <span className="count-badge">{filteredCandidates.length} TO ALLOCATE</span>
              </div>
            </div>

            {filteredCandidates.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', color: '#9599A6' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#4ADE80', marginBottom: '12px' }}>
                  <CheckCircle2 size={24} />
                </div>
                <h4 style={{ color: '#FFFFFF', fontSize: '0.96rem', fontWeight: 700, margin: '0 0 6px 0' }}>
                  All Candidates Allocated!
                </h4>
                <p style={{ fontSize: '0.80rem', color: '#9599A6', maxWidth: '270px', margin: '0 auto', lineHeight: '1.5' }}>
                  All shortlisted candidates have been assigned to interview slots. Review their schedules in the Allocation Results table above.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="alloc-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px', textAlign: 'center' }}></th>
                      <th>CANDIDATE NAME</th>
                      <th>APP. ID</th>
                      <th>SCORE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((cand) => (
                      <tr
                        key={cand.id}
                        className={cand.selected ? 'row-selected' : ''}
                        onClick={() => handleToggleCandidateSelect(cand.id)}
                      >
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="radio"
                            name="allocation-candidate"
                            checked={Boolean(cand.selected)}
                            onChange={() => handleToggleCandidateSelect(cand.id, true)}
                            className="styled-checkbox"
                          />
                        </td>
                        <td className="cand-name-cell">
                          <span className="cand-name">{cand.name}</span>
                        </td>
                        <td className="app-id-cell">{cand.id}</td>
                        <td>
                          <span className="score-badge">{cand.score}%</span>
                        </td>
                        <td>
                          <span className={`status-pill ${cand.status === 'SHORTLISTED' ? 'pill-gold' : 'pill-grey'}`}>
                            {cand.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="allocation-mobile-list">
              {filteredCandidates.map((candidate) => (
                <button
                  type="button"
                  key={`mobile-${candidate.id}`}
                  className={`allocation-mobile-card candidate-mobile-card ${candidate.selected ? 'is-selected' : ''}`}
                  onClick={() => handleToggleCandidateSelect(candidate.id)}
                >
                  <span className="mobile-selection-indicator">
                    {candidate.selected && <Check size={13} />}
                  </span>
                  <span>
                    <strong>{candidate.name}</strong>
                    <small>{candidate.id}</small>
                  </span>
                  <span className="score-badge">{candidate.score}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Middle Action Controls */}
          <div className="middle-action-column">
            <div className="allocation-selection-summary">
              <strong>{selectedVisibleCandidates.length}</strong>
              <span>candidate{selectedVisibleCandidates.length === 1 ? '' : 's'}</span>
              <small>{selectedSlot ? `${selectedSlot.dateShort}, ${selectedSlot.time}` : 'No slot selected'}</small>
            </div>
            {selectedSlot && (
              <div style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '6px',
                padding: '6px 8px',
                fontSize: '0.72rem',
                color: '#22C55E',
                textAlign: 'center',
                margin: '6px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Panel Confirmed Available
                </span>
                <span style={{ fontSize: '0.68rem', color: '#FFFFFF', fontWeight: 600 }}>
                  {formatPanelDisplayName(selectedSlot.panelName || 'Panel A')}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#9599A6' }}>
                  Hours: 09:00 AM – 05:00 PM
                </span>
              </div>
            )}
            <button
              type="button"
              className="btn-primary-accent btn-allocate"
              onClick={handleManualAllocate}
              title="Allocate selected candidate to the chosen time slot"
            >
              <span>Allocate</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Right Card: Available Time Slots */}
          <div className="card-surface slots-list-card">
            <div className="card-header-bar flex-between" style={{ paddingBottom: '12px', borderBottom: '1px solid #2A2C38', gap: '8px' }}>
              <div className="card-title-group">
                <CalendarDays size={16} style={{ flexShrink: 0 }} />
                <h3 className="card-title" style={{ fontSize: '0.92rem' }}>Available Time Slots</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleAutoAllocate}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    height: '28px', padding: '0 10px', borderRadius: '6px',
                    backgroundColor: 'rgba(240, 185, 11, 0.1)', border: '1px solid #F0B90B', color: '#F0B90B',
                    fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  <Sparkles size={13} />
                  Auto-Assign
                </button>
                <span className="count-badge">{filteredSlots.length} SLOTS</span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="alloc-table">
                <thead>
                  <tr>
                    <th style={{ width: '28px', textAlign: 'center' }}></th>
                    <th>DATE</th>
                    <th>TIME</th>
                    <th>TYPE</th>
                    <th>PANEL &amp; AVAILABILITY</th>
                    <th style={{ textAlign: 'center' }}>CAP.</th>
                    <th style={{ textAlign: 'center' }}>REM.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.length === 0 && (
                    <tr>
                      <td colSpan="7" className="allocation-empty-cell">No available upcoming slots match the selected filters.</td>
                    </tr>
                  )}
                  {paginatedSlots.map((slot) => {
                    const isPast = Boolean(slot.isPast || isSlotTimeInPast(slot.dateKey || slot.date, slot.time || slot.startTime));
                    return (
                      <tr
                        key={slot.id}
                        className={`${selectedSlotId === slot.id ? 'row-selected' : ''} ${(slot.rem === 0 || isPast) ? 'row-disabled' : ''}`}
                        onClick={() => !isPast && slot.rem > 0 && setSelectedSlotId(slot.id)}
                        style={{ opacity: isPast ? 0.45 : 1 }}
                      >
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="radio"
                            name="allocation-slot"
                            checked={selectedSlotId === slot.id}
                            disabled={slot.rem === 0 || isPast}
                            onChange={() => !isPast && setSelectedSlotId(slot.id)}
                            className="styled-checkbox"
                            style={{ cursor: isPast ? 'not-allowed' : 'pointer' }}
                          />
                        </td>
                        <td className="slot-date-cell">{slot.dateShort}</td>
                        <td>
                          <div className="slot-time-cell">
                            <Clock3 size={12} style={{ flexShrink: 0, color: '#9599A6' }} />
                            <span>{formatTimeRange(slot.time || slot.startTime, slot.end || slot.endTime)}</span>
                            {isPast && (
                              <span style={{ marginLeft: '4px', color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                                Past
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className={`type-tag ${slot.type === 'Online' ? 'type-online' : 'type-physical'}`}>
                            {slot.type}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 600, color: '#F0B90B', fontSize: '0.76rem' }}>
                              {formatPanelDisplayName(slot.panelName || 'Panel A (Technical Leads)')}
                            </span>
                            {slot.rem === 0 ? (
                              <span style={{ color: '#EF4444', fontSize: '0.66rem', fontWeight: 700 }}>
                                🔴 Slot Full
                              </span>
                            ) : isPast ? (
                              <span style={{ color: '#9599A6', fontSize: '0.66rem', fontWeight: 600 }}>
                                Past Schedule
                              </span>
                            ) : (
                              <span style={{ color: '#22C55E', fontSize: '0.66rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E', flexShrink: 0 }}></span>
                                Available ({slot.rem} left)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="font-bold" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{slot.cap}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {slot.rem === 0 ? (
                            <span className="slot-full-badge">FULL</span>
                          ) : (
                            <span className="rem-count">{slot.rem}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredSlots.length > slotsPerPage && (
              <div className="table-pagination-footer" style={{ padding: '10px 14px 6px', borderTop: '1px solid #2A2C38', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="pagination-info" style={{ fontSize: '0.74rem', color: '#9599A6' }}>
                  Showing <strong>{(slotPage - 1) * slotsPerPage + 1}–{Math.min(slotPage * slotsPerPage, filteredSlots.length)}</strong> of <strong>{filteredSlots.length}</strong> slots
                </span>

                <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={slotPage === 1}
                    onClick={() => setSlotPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous Slots Page"
                    style={{ width: '28px', height: '28px' }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalSlotPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`page-num-btn ${pageNum === slotPage ? 'active' : ''}`}
                      onClick={() => setSlotPage(pageNum)}
                      style={{ width: '28px', height: '28px', fontSize: '0.76rem' }}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={slotPage === totalSlotPages}
                    onClick={() => setSlotPage((p) => Math.min(totalSlotPages, p + 1))}
                    aria-label="Next Slots Page"
                    style={{ width: '28px', height: '28px' }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="allocation-mobile-list">
              {filteredSlots.length === 0 && (
                <div className="allocation-mobile-empty">No slots match the selected filters.</div>
              )}
              {paginatedSlots.map((slot) => (
                <button
                  type="button"
                  key={`mobile-${slot.id}`}
                  disabled={slot.rem === 0}
                  className={`allocation-mobile-card slot-mobile-card ${selectedSlotId === slot.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedSlotId(slot.id)}
                >
                  <span>
                    <strong>{slot.dateShort}</strong>
                    <small>{formatDisplayTime(slot.time || slot.startTime)} – {formatDisplayTime(slot.end || slot.endTime)}</small>
                    <small style={{ color: '#F0B90B', display: 'block', marginTop: '2px' }}>
                      {formatPanelDisplayName(slot.panelName || 'Panel A')}
                    </small>
                  </span>
                  <span className={`type-tag ${slot.type === 'Online' ? 'type-online' : 'type-physical'}`}>
                    {slot.type}
                  </span>
                  {slot.rem === 0 ? <span className="slot-full-badge">FULL</span> : <span>{slot.rem} left</span>}
                </button>
              ))}
            </div>
          </div>
        </div>




        {pendingReallocation && (
          <div className="allocation-modal-backdrop" onClick={() => setPendingReallocation(null)}>
            <div className="allocation-modal" onClick={(event) => event.stopPropagation()}>
              <div className="allocation-modal__header">
                <h3>Confirm Reallocation</h3>
                <button type="button" onClick={() => setPendingReallocation(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="allocation-modal__body">
                <p>
                  {pendingReallocation.candidates.filter((candidate) =>
                    allocationByCandidate.get(candidate.id)?.status === 'ALLOCATED'
                  ).length} selected candidate(s) already have an interview slot.
                </p>
                <p>Their previous capacity will be restored when they are moved.</p>
              </div>
              <div className="allocation-modal__actions">
                <button type="button" className="allocation-modal-cancel" onClick={() => setPendingReallocation(null)}>Cancel</button>
                <button
                  type="button"
                  className="allocation-modal-confirm"
                  onClick={() => performManualAllocation(pendingReallocation.candidates, pendingReallocation.slot)}
                >
                  Confirm Reallocation
                </button>
              </div>
            </div>
          </div>
        )}


        {reschedulingAllocation && (
          <div className="allocation-modal-backdrop" onClick={() => setReschedulingAllocation(null)}>
            <div className="allocation-modal" style={{ width: 'min(540px, 100%)' }} onClick={(event) => event.stopPropagation()}>
              <div className="allocation-modal__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={18} style={{ color: '#F0B90B' }} />
                  <h3>Reschedule Interview Directly</h3>
                </div>
                <button type="button" onClick={() => setReschedulingAllocation(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="allocation-modal__body">
                {/* Current Session Info & Policy Pill */}
                <div
                  style={{
                    backgroundColor: '#0D0E13',
                    border: '1px solid #2A2C38',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                    <strong style={{ color: '#FFFFFF', fontSize: '0.88rem' }}>{reschedulingAllocation.candidateName}</strong>
                    <span
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.12)',
                        color: '#4ADE80',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ Direct Reschedule Enabled • Min {reschedulingAllocation.rescheduleNoticeHours || '24'}h Notice
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#9599A6' }}>
                    Current: <span style={{ color: '#F0B90B', fontWeight: 600 }}>{reschedulingAllocation.interviewDate} ({formatDisplayTime(reschedulingAllocation.assignedTime)})</span> • {formatPanelDisplayName(reschedulingAllocation.panelName || 'Panel A')}
                  </div>
                </div>

                {/* Mode Switcher: Move to Open Slot vs Pick Custom Date & Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setRescheduleMode('slot')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: rescheduleMode === 'slot' ? '1px solid #F0B90B' : '1px solid #2A2C38',
                      backgroundColor: rescheduleMode === 'slot' ? 'rgba(240, 185, 11, 0.14)' : '#0D0E13',
                      color: rescheduleMode === 'slot' ? '#F0B90B' : '#9599A6',
                    }}
                  >
                    Move to Open Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setRescheduleMode('custom')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: rescheduleMode === 'custom' ? '1px solid #60A5FA' : '1px solid #2A2C38',
                      backgroundColor: rescheduleMode === 'custom' ? 'rgba(59, 130, 246, 0.14)' : '#0D0E13',
                      color: rescheduleMode === 'custom' ? '#60A5FA' : '#9599A6',
                    }}
                  >
                    Set New Date &amp; Time Directly
                  </button>
                </div>

                {rescheduleMode === 'slot' ? (
                  <>
                    <label className="reschedule-slot-label" htmlFor="reschedule-slot" style={{ marginTop: 0 }}>
                      Select Available Time Slot
                    </label>
                    <select
                      id="reschedule-slot"
                      className="form-control"
                      value={rescheduleSlotId}
                      onChange={(event) => setRescheduleSlotId(event.target.value)}
                    >
                      <option value="">Select a slot</option>
                      {rescheduleOptions.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.date} · {formatDisplayTime(slot.time || slot.startTime)}–{formatDisplayTime(slot.end || slot.endTime)} · {slot.type} · {slot.rem} available {String(slot.id) === String(reschedulingAllocation.slotId) ? '(Current Slot)' : ''}
                        </option>
                      ))}
                      {rescheduleOptions.length === 0 && (
                        <option value="" disabled>No other available slots for this position — use Custom Date &amp; Time</option>
                      )}
                    </select>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label className="reschedule-slot-label" style={{ marginTop: 0 }}>New Interview Date</label>
                      <input
                        type="date"
                        value={rescheduleCustomDate}
                        onChange={(e) => setRescheduleCustomDate(e.target.value)}
                        className="form-control"
                        style={{ colorScheme: 'dark', padding: '0 12px' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="reschedule-slot-label" style={{ marginTop: 0 }}>Start Time</label>
                        <input
                          type="time"
                          value={rescheduleCustomStart}
                          onChange={(e) => setRescheduleCustomStart(e.target.value)}
                          className="form-control"
                          style={{ colorScheme: 'dark', padding: '0 12px' }}
                        />
                      </div>
                      <div>
                        <label className="reschedule-slot-label" style={{ marginTop: 0 }}>End Time</label>
                        <input
                          type="time"
                          value={rescheduleCustomEnd}
                          onChange={(e) => setRescheduleCustomEnd(e.target.value)}
                          className="form-control"
                          style={{ colorScheme: 'dark', padding: '0 12px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '12px' }}>
                  <label className="reschedule-slot-label" style={{ marginTop: 0 }}>Reschedule Reason / Note</label>
                  <input
                    type="text"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="Reason for rescheduling (optional)"
                    className="form-control"
                    style={{ padding: '0 12px' }}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rescheduleAutoNotify}
                    onChange={(e) => setRescheduleAutoNotify(e.target.checked)}
                    style={{ accentColor: '#22C55E', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#D1D5DB' }}>
                    Auto-send updated Google Calendar &amp; email reminder to candidate &amp; panel
                  </span>
                </label>
              </div>
              <div className="allocation-modal__actions">
                <button type="button" className="allocation-modal-cancel" onClick={() => setReschedulingAllocation(null)}>Cancel</button>
                <button type="button" className="allocation-modal-confirm" onClick={handleConfirmReschedule}>
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );

    if (embeddedVacancy) {
      return <div className="embedded-allocation-tab">{mainContent}</div>;
    }

    return (
      <div className="create-vacancy">
        <RecruiterSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeItem="Candidate Allocation"
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
            {/* ── Sub-navigation Tabs ── */}
            <div className="interview-subnav-tabs">
              <button
                className={`subnav-tab-btn ${activeSubTab === 'management' ? 'is-active' : ''}`}
                onClick={() => navigate('/recruiter/interviews')}
                type="button"
              >
                Time Slots
              </button>
              <button
                className={`subnav-tab-btn ${activeSubTab === 'allocation' ? 'is-active' : ''}`}
                onClick={() => navigate('/recruiter/interviews/allocation')}
                type="button"
              >
                Candidate Allocation
              </button>
              <button
                className="subnav-tab-btn"
                onClick={() => navigate('/panel/interviews')}
                type="button"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Panel Schedule</span>
                {pendingRescheduleCount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#F59E0B',
                      color: '#0D0E13',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      lineHeight: '1',
                    }}
                    title={`${pendingRescheduleCount} pending reschedule request(s)`}
                  >
                    {pendingRescheduleCount}
                  </span>
                )}
              </button>
            </div>

            {/* ── Page Heading Block ── */}
            <div style={{ marginBottom: '16px' }}>
              <h1 className="interview-page-title" style={{ margin: '0 0 4px 0', fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF' }}>
                Candidate Interview Allocation
              </h1>
              <p className="page-subtitle" style={{ margin: 0, fontSize: '0.86rem', color: '#9599A6' }}>
                Assign shortlisted candidates to available interview slots by priority.
              </p>
            </div>

            {mainContent}
          </div>
        </div>

        {/* No Candidates Modal */}
        {showNoCandidatesModal && (
          <div className="modal-backdrop" onClick={() => setShowNoCandidatesModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-bottom-header flex-between">
                <h3 className="modal-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Candidates Available</h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowNoCandidatesModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body text-center" style={{ padding: '32px 24px' }}>
                <Users size={48} style={{ color: '#9599A6', marginBottom: '16px', opacity: 0.5, display: 'inline-block' }} />
                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px', fontWeight: 600 }}>
                  No Shortlisted Candidates
                </h4>
                <p style={{ color: '#9599A6', fontSize: '0.85rem', marginBottom: '24px', lineHeight: '1.6' }}>
                  There are currently no shortlisted candidates available to assign to your panels. Proceed to the Applicants section to review and shortlist candidates.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn-ghost-dark"
                    onClick={() => setShowNoCandidatesModal(false)}
                    style={{ padding: '10px 20px', borderRadius: '6px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary-accent"
                    onClick={() => navigate('/recruiter/applicants/ranked')}
                    style={{ padding: '10px 20px', borderRadius: '6px' }}
                  >
                    Go to Applicants Section
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Email Invitation Preview Modal ── */}
        {showEmailPreviewModal && previewSelectedCandidate && (
          <div className="modal-backdrop" onClick={() => setShowEmailPreviewModal(false)} style={{ zIndex: 9999 }}>
            <div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '640px', width: '92%', backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '14px', overflow: 'hidden' }}
            >
              {/* Modal Header */}
              <div className="modal-header border-bottom-header flex-between" style={{ padding: '16px 22px', backgroundColor: '#1A1C26' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} style={{ color: '#F0B90B' }} />
                  <h3 className="modal-title" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                    Interview Invitation Email Preview
                  </h3>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowEmailPreviewModal(false)}
                  style={{ background: 'none', border: 'none', color: '#9599A6', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body" style={{ padding: '20px 22px' }}>
                {/* Recipient switcher (if multiple allocated candidates exist) */}
                {filteredAllocations.filter((a) => a.status === 'ALLOCATED').length > 1 && (
                  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600 }}>PREVIEWING RECIPIENT:</label>
                    <select
                      value={previewSelectedCandidate.candidateId}
                      onChange={(e) => {
                        const found = filteredAllocations.find((a) => a.candidateId === e.target.value);
                        if (found) setPreviewSelectedCandidate(found);
                      }}
                      style={{
                        backgroundColor: '#1E222D',
                        color: '#F0B90B',
                        border: '1px solid #2A2C38',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    >
                      {filteredAllocations.filter((a) => a.status === 'ALLOCATED').map((c) => (
                        <option key={c.candidateId} value={c.candidateId}>
                          {c.candidateName} — {formatDisplayTime(c.assignedTime)} ({c.interviewDate})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Email Envelope Container */}
                <div style={{ backgroundColor: '#1E222D', border: '1px solid #2A2C38', borderRadius: '10px', padding: '16px', fontSize: '0.82rem' }}>
                  {/* Meta details */}
                  <div style={{ borderBottom: '1px solid #2A2C38', paddingBottom: '10px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <span style={{ color: '#9599A6', fontWeight: 600 }}>From: </span>
                      <span style={{ color: '#FFFFFF', fontWeight: 500 }}>IntelliHire Recruitment Team &lt;interviews@intellihire.com&gt;</span>
                    </div>
                    <div>
                      <span style={{ color: '#9599A6', fontWeight: 600 }}>To: </span>
                      <span style={{ color: '#60A5FA', fontWeight: 600 }}>
                        {previewSelectedCandidate.candidateName} &lt;{previewSelectedCandidate.candidateName.toLowerCase().replace(/\s+/g, '.') || 'candidate'}@example.com&gt;
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9599A6', fontWeight: 600 }}>Subject: </span>
                      <span style={{ color: '#F0B90B', fontWeight: 700 }}>
                        Invitation: {previewSelectedCandidate.interviewRound || 'Technical Interview'} — {previewSelectedCandidate.jobPosition || 'Software Engineer'}
                      </span>
                    </div>
                  </div>

                  {/* Email Body Content */}
                  <div style={{ color: '#D1D5DB', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0 }}>Dear <strong>{previewSelectedCandidate.candidateName}</strong>,</p>
                    <p style={{ margin: 0 }}>
                      Congratulations! Following your evaluation, we are pleased to invite you for your upcoming <strong>{previewSelectedCandidate.interviewRound || 'Technical Interview'}</strong> for the <strong>{previewSelectedCandidate.jobPosition || 'Engineering'}</strong> role at IntelliHire.
                    </p>

                    <div style={{ backgroundColor: '#16171F', border: '1px solid rgba(240, 185, 11, 0.25)', borderRadius: '8px', padding: '12px 14px', margin: '6px 0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px', fontSize: '0.8rem' }}>
                        <span style={{ color: '#9599A6' }}>Date:</span>
                        <strong style={{ color: '#FFFFFF' }}>{previewSelectedCandidate.interviewDate}</strong>

                        <span style={{ color: '#9599A6' }}>Time:</span>
                        <strong style={{ color: '#F0B90B' }}>{formatDisplayTime(previewSelectedCandidate.assignedTime)}</strong>

                        <span style={{ color: '#9599A6' }}>Interview Mode:</span>
                        <span style={{ color: '#FFFFFF' }}>{previewSelectedCandidate.interviewType}</span>

                        <span style={{ color: '#9599A6' }}>Assigned Panel:</span>
                        <span style={{ color: '#FFFFFF' }}>{previewSelectedCandidate.panelName || 'Panel A (Technical Leads)'}</span>

                        <span style={{ color: '#9599A6' }}>Platform:</span>
                        <span style={{ color: '#F0B90B', fontWeight: 700 }}>
                          {previewSelectedCandidate.interviewMedia || (previewSelectedCandidate.interviewType === 'Physical' ? 'In-Person Office' : 'Google Meet')}
                        </span>

                        <span style={{ color: '#9599A6' }}>Meeting Venue / Link:</span>
                        <span style={{ color: '#F0B90B', wordBreak: 'break-all' }}>
                          {previewSelectedCandidate.meetingLocation || (previewSelectedCandidate.interviewType === 'Physical' ? 'Engineering Interview Room 1, HQ Building' : 'https://meet.google.com/new')}
                        </span>

                        {previewSelectedCandidate.interviewType !== 'Physical' && !previewSelectedCandidate.meetingLocation?.includes('meet.google') && previewSelectedCandidate.interviewMedia !== 'Google Meet' && (
                          <>
                            <span style={{ color: '#9599A6' }}>Meeting ID:</span>
                            <span style={{ color: '#FFFFFF', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                              {previewSelectedCandidate.meetingId || '284 912 049 192'}
                            </span>

                            <span style={{ color: '#9599A6' }}>Passcode:</span>
                            <span style={{ color: '#FFFFFF', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                              {previewSelectedCandidate.meetingPasscode || 'inTelli#2026'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#9599A6' }}>
                      A Google Calendar invitation has been attached to this email. Please join the meeting at least 5 minutes prior to commencement. If you have any questions or scheduling conflicts, please reply directly to this invitation.
                    </p>
                    <p style={{ margin: 0 }}>Best regards,<br /><strong style={{ color: '#FFFFFF' }}>IntelliHire Talent Acquisition Team</strong></p>
                  </div>
                </div>

                {/* Total recipients summary */}
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <span style={{ fontSize: '0.78rem', color: '#93C5FD' }}>
                    📨 Ready to dispatch invitations to <strong>{filteredAllocations.filter((a) => a.status === 'ALLOCATED').length}</strong> allocated candidate(s).
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#4ADE80', fontWeight: 600 }}>Includes Calendar .ics ✓</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '14px 22px', backgroundColor: '#1A1C26', borderTop: '1px solid #2A2C38', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-ghost-dark"
                  onClick={() => setShowEmailPreviewModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (previewSelectedCandidate) {
                      handleNotifyCandidate(previewSelectedCandidate);
                      setShowEmailPreviewModal(false);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid #3B82F6',
                    color: '#60A5FA',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Send size={13} />
                  <span>Send to {previewSelectedCandidate?.candidateName?.split(' ')[0] || 'Candidate'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSendAllInvites}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#3B82F6',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Send size={14} />
                  <span>Send All ({filteredAllocations.filter((a) => a.status === 'ALLOCATED').length}) Invites</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal: Automated Interview Reminders & Pop-up Alarms ── */}
        {showRemindersModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#1E222D',
                borderRadius: '14px',
                border: '1px solid #2A2C38',
                width: '100%',
                maxWidth: '940px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '18px 24px',
                  backgroundColor: '#16171F',
                  borderBottom: '1px solid #2A2C38',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      backgroundColor: 'rgba(240, 185, 11, 0.15)',
                      padding: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BellRing size={20} style={{ color: '#F0B90B' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                      Automated Interview Reminders &amp; Pop-up Alerts
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#9599A6' }}>
                      Automated reminders for candidates &amp; panel members via email and Google Calendar integrations
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRemindersModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9599A6',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div
                style={{
                  padding: '20px 24px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Automation Rules Summary */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#13141C',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#9599A6', fontWeight: 700, marginBottom: '4px' }}>
                      24-HOUR REMINDER
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#4ADE80', fontWeight: 700 }}>
                      ✓ Email &amp; Calendar Alarm
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9599A6', marginTop: '2px' }}>
                      Sent 1 day before to Candidate &amp; Panel
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#13141C',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#9599A6', fontWeight: 700, marginBottom: '4px' }}>
                      1-HOUR URGENT REMINDER
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#60A5FA', fontWeight: 700 }}>
                      ✓ Direct Meeting Link Alert
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9599A6', marginTop: '2px' }}>
                      Dispatched 60 mins before session starts
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#13141C',
                      border: '1px solid rgba(240, 185, 11, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#9599A6', fontWeight: 700, marginBottom: '4px' }}>
                      CALENDAR POP-UP ALARMS
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#F0B90B', fontWeight: 700 }}>
                      ✓ 15m Native Pop-up Alerts
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9599A6', marginTop: '2px' }}>
                      Google Calendar &amp; .ics VALARM alarms
                    </div>
                  </div>
                </div>

                {/* Section Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.03em' }}>
                    SCHEDULED SESSIONS &amp; AUTOMATION STATUS ({upcomingRemindersData.allWithStatus.filter((a) => a.status === 'ALLOCATED').length})
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#F0B90B', fontWeight: 600 }}>
                    {upcomingRemindersData.upcomingWithin24h.length} session(s) due within 24h
                  </span>
                </div>

                {/* Sessions Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upcomingRemindersData.allWithStatus.filter((a) => a.status === 'ALLOCATED').length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#9599A6', backgroundColor: '#13141C', borderRadius: '8px' }}>
                      No allocated candidate sessions found. Allocate candidates to slots to manage automated reminders.
                    </div>
                  ) : (
                    upcomingRemindersData.allWithStatus
                      .filter((a) => a.status === 'ALLOCATED')
                      .map((item) => {
                        const candEmail = item.candidateEmail || `${(item.candidateName || 'candidate').toLowerCase().replace(/\s+/g, '.')}@example.com`;
                        const panelEmailList = item.panelEmails || item.panelMembers || 'saman.tech@company.com';
                        const gcalUrl = generateGoogleCalendarLink({
                          title: `${item.jobPosition || 'Job Position'} Interview - ${item.candidateName}`,
                          description: `Candidate: ${item.candidateName}\nRound: ${item.interviewRound || 'Round'}\nVenue/Link: ${item.meetingLocation || 'Online'}`,
                          date: item.assignedDate || item.interviewDate || '2026-11-25',
                          startTime: item.assignedTime || item.startTime || '10:00 AM',
                          location: item.meetingLocation,
                          candidateEmail: candEmail,
                          panelEmails: panelEmailList,
                        });

                        return (
                          <div
                            key={item.id || item.candidateId}
                            style={{
                              backgroundColor: '#16171F',
                              border: item.isDue24h ? '1px solid rgba(240, 185, 11, 0.4)' : '1px solid #2A2C38',
                              borderRadius: '10px',
                              padding: '14px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '12px',
                              boxSizing: 'border-box',
                            }}
                          >
                            {/* Candidate & Job Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', minWidth: '180px' }}>
                              <img
                                src={item.candidateAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={item.candidateName}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #2A2C38', flexShrink: 0 }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                                  {item.candidateName}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#9599A6' }}>
                                  {item.jobPosition} • <span style={{ color: '#F0B90B' }}>{item.interviewRound || 'Round 1'}</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '1px', wordBreak: 'break-word' }}>
                                  Panel: {panelEmailList}
                                </div>
                              </div>
                            </div>

                            {/* Timing & Countdown Status */}
                            <div style={{ minWidth: '140px', flex: '0 1 auto' }}>
                              <div style={{ fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 600 }}>
                                📅 {item.assignedDate || item.interviewDate}
                              </div>
                              <div style={{ fontSize: '0.84rem', color: '#F0B90B', fontWeight: 700 }}>
                                ⏰ {formatDisplayTime(item.assignedTime || item.startTime)}
                              </div>
                              <div style={{ marginTop: '3px' }}>
                                <span
                                  style={{
                                    backgroundColor: item.isDue1h
                                      ? 'rgba(239, 68, 68, 0.2)'
                                      : item.isDue24h
                                        ? 'rgba(240, 185, 11, 0.2)'
                                        : 'rgba(34, 197, 94, 0.15)',
                                    color: item.isDue1h ? '#EF4444' : item.isDue24h ? '#F0B90B' : '#4ADE80',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {item.countdownText}
                                </span>
                              </div>
                            </div>

                            {/* Reminder Status Badges */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '115px' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: item.reminder24hSent ? '#4ADE80' : '#9599A6',
                                }}
                              >
                                {item.reminder24hSent ? '✓ 24h Reminder Sent' : '⏰ 24h Scheduled'}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: item.reminder1hSent ? '#60A5FA' : '#6B7280',
                                }}
                              >
                                {item.reminder1hSent ? '✓ 1h Urgent Sent' : '⏰ 1h Pending'}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleSendSingleReminder(item, '24h')}
                                title="Dispatch 24-Hour Reminder Email to Candidate and Panel"
                                style={{
                                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                  border: '1px solid rgba(59, 130, 246, 0.35)',
                                  color: '#60A5FA',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Mail size={12} />
                                <span>24h Remind</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSendSingleReminder(item, '1h')}
                                title="Dispatch 1-Hour Urgent Reminder Email to Candidate and Panel"
                                style={{
                                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.35)',
                                  color: '#EF4444',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Clock3 size={12} />
                                <span>1h Alert</span>
                              </button>

                              {/* Google Calendar Link with Guest Emails */}
                              <a
                                href={gcalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Add to Google Calendar with Pop-up Alarms"
                                style={{
                                  backgroundColor: 'rgba(240, 185, 11, 0.12)',
                                  border: '1px solid rgba(240, 185, 11, 0.35)',
                                  color: '#F0B90B',
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Calendar size={12} />
                                <span>G-Cal</span>
                              </a>

                              {/* Download .ics with Native VALARM Pop-ups */}
                              <button
                                type="button"
                                onClick={() => {
                                  downloadIcsCalendarFile({
                                    title: `${item.jobPosition || 'Job'} Interview - ${item.candidateName}`,
                                    description: `Candidate: ${item.candidateName}\nRound: ${item.interviewRound || 'Round'}\nVenue: ${item.meetingLocation || 'Online Google Meet'}\nPanel: ${panelEmailList}`,
                                    date: item.assignedDate || item.interviewDate || '2026-11-25',
                                    startTime: item.assignedTime || item.startTime || '10:00 AM',
                                    location: item.meetingLocation,
                                    candidateEmail: candEmail,
                                    panelEmails: panelEmailList,
                                  });
                                  setToast({
                                    type: 'success',
                                    message: `Calendar invitation (.ics) with 15-min and 24-hr pop-up alarms downloaded!`,
                                  });
                                }}
                                title="Download .ics file with native pop-up alarms for Google Calendar / Outlook"
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  color: '#FFFFFF',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Download size={12} />
                                <span>.ics</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: '16px 24px',
                  backgroundColor: '#16171F',
                  borderTop: '1px solid #2A2C38',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowRemindersModal(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleSendAllReminders('1h')}
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.18)',
                      border: '1px solid rgba(239, 68, 68, 0.45)',
                      color: '#EF4444',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Clock3 size={13} />
                    <span>Send 1h Urgent Reminders to All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendAllReminders('24h')}
                    style={{
                      backgroundColor: '#F0B90B',
                      border: 'none',
                      color: '#000000',
                      padding: '8px 20px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Bell size={13} />
                    <span>⚡ Send 24h Reminders to All (Candidates &amp; Panel)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
