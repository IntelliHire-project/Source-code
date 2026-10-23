import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
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

// Initial Mock Candidates Data (Compact candidates per role)
export const INITIAL_CANDIDATES = [
  // Senior Software Engineer
  { id: 'APP-001', name: 'Alice Fernando', score: 88, status: 'ALLOCATED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-002', name: 'Kamal Perera', score: 82, status: 'ALLOCATED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-003', name: 'Nimal Silva', score: 79, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-004', name: 'Dinesh Mendis', score: 75, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-005', name: 'Sanduni Wickramasinghe', score: 73, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', role: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  // UI/UX Designer
  { id: 'APP-007', name: 'Ishara Gunasekara', score: 84, status: 'SHORTLISTED', jobPosition: 'UI/UX Designer', role: 'UI/UX Designer', round: 'HR Portfolio Review', selected: false },
  // QA Automation Engineer
  { id: 'APP-008', name: 'Malith Senanayake', score: 77, status: 'SHORTLISTED', jobPosition: 'QA Automation Engineer', role: 'QA Automation Engineer', round: 'Technical Interview', selected: false },
  // Business Analyst
  { id: 'APP-009', name: 'Tharindu Rathnayake', score: 80, status: 'SHORTLISTED', jobPosition: 'Business Analyst', role: 'Business Analyst', round: 'Technical Interview', selected: false },
  // Product Manager
  { id: 'APP-010', name: 'Kavindu Weerasinghe', score: 86, status: 'SHORTLISTED', jobPosition: 'Product Manager', role: 'Product Manager', round: 'Technical Interview', selected: false },
  // DevOps Lead
  { id: 'APP-011', name: 'Kasun Wijesinghe', score: 83, status: 'SHORTLISTED', jobPosition: 'DevOps Lead', role: 'DevOps Lead', round: 'Technical Interview', selected: false },
  // Product Designer
  { id: 'APP-012', name: 'Nina Petrova', score: 89, status: 'ALLOCATED', jobPosition: 'Product Designer', role: 'Product Designer', round: 'Technical Interview', selected: false },
  { id: 'APP-013', name: 'Arjun Mehta', score: 88, status: 'SHORTLISTED', jobPosition: 'Product Designer', role: 'Product Designer', round: 'Technical Interview', selected: false },
  { id: 'APP-014', name: 'Elena Vargas', score: 86, status: 'SHORTLISTED', jobPosition: 'Product Designer', role: 'Product Designer', round: 'Technical Interview', selected: false },
];

// Initial Mock Time Slots Data (1 past slot on 23 Oct to demo validation, remaining future dates in next month Nov 2026)
const INITIAL_SLOTS = [
  // Senior Software Engineer
  { id: 'SLOT-100', dateKey: '2026-10-23', date: '23 Oct 2026', dateShort: '23 Oct', time: '09:00 AM', end: '10:00 AM', type: 'Online', cap: 1, rem: 1, jobPosition: 'Senior Software Engineer', round: 'Technical Interview', isPast: true },
  { id: 'SLOT-101', dateKey: '2026-11-02', date: '02 Nov 2026', dateShort: '02 Nov', time: '09:00 AM', end: '10:00 AM', type: 'Online', cap: 1, rem: 0, jobPosition: 'Senior Software Engineer', round: 'Technical Interview' },
  { id: 'SLOT-102', dateKey: '2026-11-02', date: '02 Nov 2026', dateShort: '02 Nov', time: '11:00 AM', end: '12:00 PM', type: 'Physical', cap: 2, rem: 1, jobPosition: 'Senior Software Engineer', round: 'System Architecture' },
  { id: 'SLOT-103', dateKey: '2026-11-05', date: '05 Nov 2026', dateShort: '05 Nov', time: '02:00 PM', end: '03:00 PM', type: 'Online', cap: 2, rem: 2, jobPosition: 'Senior Software Engineer', round: 'Technical Interview' },
  { id: 'SLOT-104', dateKey: '2026-11-10', date: '10 Nov 2026', dateShort: '10 Nov', time: '10:00 AM', end: '11:00 AM', type: 'Physical', cap: 2, rem: 2, jobPosition: 'Senior Software Engineer', round: 'System Architecture' },
  { id: 'SLOT-105', dateKey: '2026-11-12', date: '12 Nov 2026', dateShort: '12 Nov', time: '03:30 PM', end: '04:30 PM', type: 'Online', cap: 2, rem: 2, jobPosition: 'Senior Software Engineer', round: 'Technical Interview' },

  // Product Designer
  { id: 'SLOT-200', dateKey: '2026-10-23', date: '23 Oct 2026', dateShort: '23 Oct', time: '09:00 AM', end: '10:00 AM', type: 'Online', cap: 1, rem: 1, jobPosition: 'Product Designer', round: 'Portfolio Review', isPast: true },
  { id: 'SLOT-201', dateKey: '2026-11-02', date: '02 Nov 2026', dateShort: '02 Nov', time: '09:30 AM', end: '10:30 AM', type: 'Online', cap: 2, rem: 1, jobPosition: 'Product Designer', round: 'Portfolio Review' },
  { id: 'SLOT-202', dateKey: '2026-11-04', date: '04 Nov 2026', dateShort: '04 Nov', time: '01:30 PM', end: '02:30 PM', type: 'Physical', cap: 2, rem: 2, jobPosition: 'Product Designer', round: 'Portfolio Review' },
  { id: 'SLOT-203', dateKey: '2026-11-06', date: '06 Nov 2026', dateShort: '06 Nov', time: '03:00 PM', end: '04:00 PM', type: 'Online', cap: 2, rem: 2, jobPosition: 'Product Designer', round: 'Portfolio Review' },
];

// Initial Allocation Results Data
export const INITIAL_ALLOCATIONS = [
  {
    candidateId: 'APP-012',
    candidateName: 'Nina Petrova',
    slotId: 'SLOT-201',
    assignedTime: '09:30 AM',
    interviewDate: '02 Nov 2026',
    interviewType: 'Online',
    panelName: 'Panel A (Design Lead)',
    interviewRound: 'Technical Interview',
    jobPosition: 'Product Designer',
    status: 'ALLOCATED',
    score: 89,
  },
  {
    candidateId: 'APP-002',
    candidateName: 'Kamal Perera',
    slotId: 'SLOT-102',
    assignedTime: '02:00 PM',
    interviewDate: '06 Nov 2026',
    interviewType: 'Physical',
    panelName: 'Panel B (HR & Culture Panel)',
    interviewRound: 'HR Portfolio Review',
    jobPosition: 'Senior Software Engineer',
    status: 'ALLOCATED',
    score: 82,
  },
  {
    candidateId: 'APP-001',
    candidateName: 'Alice Fernando',
    slotId: 'SLOT-101',
    assignedTime: '11:00 AM',
    interviewDate: '04 Nov 2026',
    interviewType: 'Online',
    panelName: 'Panel C (Live Coding Panel)',
    interviewRound: 'System Architecture',
    jobPosition: 'Senior Software Engineer',
    status: 'ALLOCATED',
    score: 88,
  },
];

// Assigned panel data model (id, name, meetingType, roundLabel, members[])
const INITIAL_PANELS = [
  {
    id: 'panel-a',
    name: 'Panel A (Technical Leads)',
    meetingType: 'Google Meet',
    meetingLink: 'https://meet.google.com/xyz-123',
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

  // State Management
  // State Management - Default empty so all roles and rounds are visible without being filtered out
  const [jobPosition, setJobPosition] = useState(() => {
    if (embeddedVacancy) return embeddedVacancy.title;
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
      const stored = localStorage.getItem('intellihire_candidates');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const storedByName = new Map(parsed.map((c) => [(c.name || '').toLowerCase(), c]));
          const merged = INITIAL_CANDIDATES.map((initC) => {
            const fromStored = storedByName.get((initC.name || '').toLowerCase());
            return fromStored ? { ...initC, ...fromStored } : initC;
          });
          const initNames = new Set(INITIAL_CANDIDATES.map((c) => (c.name || '').toLowerCase()));
          parsed.forEach((c) => {
            if (c && c.name && !initNames.has(c.name.toLowerCase())) {
              merged.push(c);
            }
          });
          if (embeddedVacancy) {
            const forVacancy = merged.filter(
              (c) => c.jobPosition === embeddedVacancy.title || c.role === embeddedVacancy.title
            );
            if (forVacancy.length > 0) return forVacancy;
          }
          return merged;
        }
      }
    } catch {}
    if (embeddedVacancy) {
      const vacancyCandidates = INITIAL_CANDIDATES.filter((c) => c.jobPosition === embeddedVacancy.title);
      if (vacancyCandidates.length > 0) return vacancyCandidates;
      return INITIAL_CANDIDATES.map((c) => ({ ...c, jobPosition: embeddedVacancy.title }));
    }
    return INITIAL_CANDIDATES;
  });
  const [allocations, setAllocations] = useState(() => {
    try {
      const stored = localStorage.getItem('intellihire_allocations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          if (parsed.length >= 3) return parsed;
          // Merge to ensure 3 candidates are always allocated
          const existingNames = new Set(parsed.map((p) => (p.candidateName || '').toLowerCase()));
          const toAdd = INITIAL_ALLOCATIONS.filter(
            (init) => !existingNames.has((init.candidateName || '').toLowerCase())
          );
          const merged = [...parsed, ...toAdd].slice(0, 3);
          localStorage.setItem('intellihire_allocations', JSON.stringify(merged));
          return merged;
        }
      }
    } catch {}
    localStorage.setItem('intellihire_allocations', JSON.stringify(INITIAL_ALLOCATIONS));
    return INITIAL_ALLOCATIONS;
  });

  // Live listener to ensure any time slots or allocations added in the Time Slot form reflect immediately
  useEffect(() => {
    const handleSync = () => {
      try {
        const storedAlloc = localStorage.getItem('intellihire_allocations');
        if (storedAlloc) {
          setAllocations(JSON.parse(storedAlloc));
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
            const displayEnd = formatDisplayTime(s.endTime);
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
              rem: s.assignedCandidate ? Math.max(0, (s.capacity || 1) - 1) : (s.capacity || 1),
              jobPosition: s.jobPosition,
              round: s.round,
              status: 'AVAILABLE',
              bookedCount: s.assignedCandidate ? 1 : 0,
              isCustom: true,
            };
          });
          const map = new Map();
          [...storedCustom.map(c => ({ ...c, isCustom: true, time: formatDisplayTime(c.time || c.startTime), end: formatDisplayTime(c.end || c.endTime) })), ...mappedInterviewSlots].forEach((slot) => {
            if (!map.has(slot.id)) map.set(slot.id, slot);
          });
          setCustomSlots(Array.from(map.values()));
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('intellihire_slots_updated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('intellihire_slots_updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [allocationStatusFilter, setAllocationStatusFilter] = useState('ALL');
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [previewSelectedCandidate, setPreviewSelectedCandidate] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingReallocation, setPendingReallocation] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [reschedulingAllocation, setReschedulingAllocation] = useState(null);
  const [rescheduleSlotId, setRescheduleSlotId] = useState('');
  const [viewingSlotModal, setViewingSlotModal] = useState(null);
  const [showNoCandidatesModal, setShowNoCandidatesModal] = useState(false);
  const [assignedPanels, setAssignedPanels] = useState(() =>
    Array.isArray(embeddedVacancy?.panels) ? embeddedVacancy.panels : INITIAL_PANELS
  );
  const [viewingPanel, setViewingPanel] = useState(null);
  const [notifiedCandidateIds, setNotifiedCandidateIds] = useState(() => new Set());

  const handleNotifyCandidate = (item) => {
    setNotifiedCandidateIds((prev) => {
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
    setNotifiedCandidateIds((prev) => {
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
  
  // Header Navigation Active Tab State
  const activeSubTab = 'allocation'; // 'management' or 'allocation'

  const openPanelManager = () => {
    navigate('/recruiter/interviews', {
      state: { selectedVacancy: embeddedVacancy ? embeddedVacancy.title : jobPosition },
    });
  };

// Helper to detect outdated slots from past months (e.g. August, early October)
function isOutdatedPastDate(dateVal) {
  if (!dateVal) return false;
  if (/Aug|Jul|Jun|Sep/i.test(dateVal)) return true;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal) && dateVal < '2026-10-23') return true;
  if (/\b(0[1-9]|1[0-9]|2[0-2])\s+Oct\s+2026/i.test(dateVal)) return true;
  return false;
}

  // Show Toast Utility using standard AdminToast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const [customSlots, setCustomSlots] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('intellihire_custom_slots') || '[]');
      return custom.filter((s) => !isOutdatedPastDate(s.dateKey || s.rawDate || s.date));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const storedCandidates = localStorage.getItem('intellihire_candidates');
        if (storedCandidates) {
          setCandidates(JSON.parse(storedCandidates));
        }
        const storedAllocations = localStorage.getItem('intellihire_allocations');
        if (storedAllocations) {
          setAllocations(JSON.parse(storedAllocations));
        }

        const custom = JSON.parse(localStorage.getItem('intellihire_custom_slots') || '[]');
        const validCustom = custom.filter((s) => !isOutdatedPastDate(s.dateKey || s.rawDate || s.date));
        setCustomSlots(validCustom);
      } catch {}
    };
    handleSync();
    window.addEventListener('intellihire_slots_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('intellihire_slots_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const allSlots = useMemo(() => {
    const map = new Map();
    // Prioritize valid custom slots from panels/form
    customSlots
      .filter((s) => !isOutdatedPastDate(s.dateKey || s.date))
      .forEach((s) => map.set(s.id, s));
    // INITIAL_SLOTS (1 past slot + future slots)
    INITIAL_SLOTS.forEach((s) => {
      if (!map.has(s.id)) map.set(s.id, s);
    });
    return Array.from(map.values());
  }, [customSlots]);

  const allocationByCandidate = useMemo(
    () => new Map(allocations.map((allocation) => [allocation.candidateId, allocation])),
    [allocations]
  );

  const slotsWithRemaining = useMemo(() => {
    const rawSlotsList = allSlots.length > 0 ? allSlots : INITIAL_SLOTS;
    return rawSlotsList.map((rawSlot) => {
      const slot = embeddedVacancy ? { ...rawSlot, jobPosition: embeddedVacancy.title } : rawSlot;
      const allocatedCount = allocations.filter(
        (allocation) => allocation.status === 'ALLOCATED' && allocation.slotId === slot.id
      ).length;
      return { ...slot, rem: Math.max(0, slot.cap - allocatedCount) };
    });
  }, [allSlots, allocations, embeddedVacancy]);

  const contextualAllocations = useMemo(() => {
    if (!jobPosition && !interviewRound) return allocations;

    const visibleCandidates = candidates.filter((candidate) => {
      if (!jobPosition) return true;
      const cPos = (candidate.jobPosition || candidate.role || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const curPos = jobPosition.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cPos === curPos || cPos.includes(curPos) || curPos.includes(cPos)
        || ((cPos.includes('software') || cPos.includes('fullstack')) && (curPos.includes('software') || curPos.includes('fullstack')));
    });
    const visibleIds = new Set(visibleCandidates.map((c) => c.id));
    const visibleNames = new Set(visibleCandidates.map((c) => (c.name || '').toLowerCase()));

    const filtered = allocations.filter((allocation) => {
      if (jobPosition) {
        const matchId = allocation.candidateId && visibleIds.has(allocation.candidateId);
        const matchName = allocation.candidateName && visibleNames.has((allocation.candidateName || '').toLowerCase());
        const allocPos = (allocation.jobPosition || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetPos = jobPosition.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchPos = allocPos && (allocPos.includes(targetPos) || targetPos.includes(allocPos) ||
          ((allocPos.includes('software') || allocPos.includes('fullstack')) && (targetPos.includes('software') || targetPos.includes('fullstack'))));
        if (!matchId && !matchName && !matchPos) return false;
      }
      if (interviewRound) {
        if (allocation.interviewRound && allocation.interviewRound !== interviewRound) return false;
      }
      return true;
    });

    // Ensure at least 3 candidates are displayed if available
    return filtered.length >= 3 ? filtered : allocations;
  }, [allocations, candidates, jobPosition, interviewRound]);

  const filteredCandidates = useMemo(() => {
    const allocatedNames = new Set(
      contextualAllocations
        .filter((a) => a.status === 'ALLOCATED' && a.slotId)
        .map((a) => (a.candidateName || '').toLowerCase().trim())
    );
    const allocatedIds = new Set(
      contextualAllocations
        .filter((a) => a.status === 'ALLOCATED' && a.slotId)
        .map((a) => a.candidateId)
    );

    const seenNames = new Set();
    return candidates.filter((candidate) => {
      if (jobPosition) {
        const cPos = (candidate.jobPosition || candidate.role || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const curPos = jobPosition.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchesPos = !curPos || !cPos || cPos === curPos || cPos.includes(curPos) || curPos.includes(cPos)
          || ((cPos.includes('software') || cPos.includes('fullstack')) && (curPos.includes('software') || curPos.includes('fullstack')));
        if (!matchesPos) return false;
      }

      const lowerName = (candidate.name || '').toLowerCase().trim();
      if (seenNames.has(lowerName)) return false;
      seenNames.add(lowerName);

      // If candidate is already allocated to a slot, exclude from unallocated shortlist
      const isAllocated = allocatedIds.has(candidate.id) || allocatedNames.has(lowerName);
      return !isAllocated;
    }).slice(0, 6);
  }, [candidates, jobPosition, contextualAllocations]);

  const filteredSlots = useMemo(() => {
    // Match on position
    const posMatches = slotsWithRemaining.filter((slot) => {
      if (isOutdatedPastDate(slot.dateKey || slot.date)) return false;
      if (!jobPosition) return true;
      const slotPos = (slot.jobPosition || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const targetPos = jobPosition.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!slotPos || !targetPos) return true;
      return slotPos === targetPos || slotPos.includes(targetPos) || targetPos.includes(slotPos)
        || ((slotPos.includes('software') || slotPos.includes('fullstack')) && (targetPos.includes('software') || targetPos.includes('fullstack')));
    });

    const displayPool = posMatches.length > 0
      ? posMatches
      : slotsWithRemaining.filter((s) => !isOutdatedPastDate(s.dateKey || s.date));

    // Deduplicate slots by unique date + time + panel to avoid runaway duplicates
    const uniqueMap = new Map();
    displayPool.forEach((s) => {
      const key = `${s.date || s.dateKey}-${s.time || s.startTime}-${s.panelName || ''}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, s);
      }
    });

    const allValid = Array.from(uniqueMap.values());
    const pastSlots = allValid.filter((s) => s.isPast || isSlotTimeInPast(s.dateKey || s.date, s.time || s.startTime));
    const futureSlots = allValid.filter((s) => !(s.isPast || isSlotTimeInPast(s.dateKey || s.date, s.time || s.startTime)));

    // Sort future slots chronologically
    futureSlots.sort((a, b) => {
      const diff = parseSlotDateTime(a) - parseSlotDateTime(b);
      if (diff !== 0) return diff;
      return String(a.id).localeCompare(String(b.id));
    });

    // Exactly 1 past slot at top (for validation demo) + remaining future slots (up to 6 total)
    const result = [];
    if (pastSlots.length > 0) {
      result.push({ ...pastSlots[0], isPast: true });
    }
    futureSlots.forEach((s) => {
      if (result.length < 6) result.push(s);
    });

    return result;
  }, [jobPosition, slotsWithRemaining]);

  useEffect(() => {
    if (!filteredSlots.some((slot) => slot.id === selectedSlotId && slot.rem > 0)) {
      setSelectedSlotId('');
    }
  }, [filteredSlots, selectedSlotId]);

  // Toggle selection for Candidate radio
  const handleToggleCandidateSelect = (id) => {
    setCandidates((prev) =>
      prev.map((c) => ({
        ...c,
        selected: c.id === id ? !c.selected : false,
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

  const buildAllocationRecord = (candidate, slot) => ({
    candidateId: candidate.id,
    candidateName: candidate.name,
    slotId: slot.id,
    assignedTime: formatDisplayTime(slot.time || slot.startTime),
    interviewDate: slot.date,
    interviewType: slot.type,
    panelName: slot.panelName || assignedPanels[0]?.name || 'Panel A (Technical Leads)',
    interviewRound: slot.round || interviewRound,
    status: 'ALLOCATED',
  });

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

    setAllocations((current) => {
      const next = [...current];
      candidatesToMove.forEach((candidate) => {
        const record = buildAllocationRecord(candidate, slotToAssign);
        const existingIndex = next.findIndex((item) => item.candidateId === candidate.id);
        if (existingIndex >= 0) next[existingIndex] = record;
        else next.push(record);
      });
      return next;
    });
    setCandidates((current) =>
      current.map((candidate) => {
        const isMoved = candidatesToMove.some((c) => c.id === candidate.id);
        if (isMoved) {
          return { ...candidate, status: 'ALLOCATED', selected: false };
        }
        return candidate.selected ? { ...candidate, selected: false } : candidate;
      })
    );
    setSelectedSlotId('');
    setPendingReallocation(null);
    showToast(
      `Allocated ${candidatesToMove.length} candidate(s) to ${slotToAssign.time} on ${slotToAssign.dateShort}. Google Calendar invite sent!`
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem('intellihire_allocations', JSON.stringify(allocations));
    } catch {}
  }, [allocations]);

  useEffect(() => {
    try {
      localStorage.setItem('intellihire_candidates', JSON.stringify(candidates));
    } catch {}
  }, [candidates]);

  // Manual Allocate Button Action
  const handleManualAllocate = () => {
    const visibleIds = new Set(filteredCandidates.map((candidate) => candidate.id));
    const selectedCands = candidates.filter(
      (candidate) => candidate.selected && visibleIds.has(candidate.id)
    );
    const slotToAssign = filteredSlots.find((slot) => slot.id === selectedSlotId);
    if (selectedCands.length === 0) {
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

  // Remove Allocation Action (Unassign single candidate)
  const handleRemoveAllocation = (candidateId) => {
    const targetAlloc = allocations.find((a) => a.candidateId === candidateId);
    setAllocations((prev) => prev.filter((a) => a.candidateId !== candidateId));
    setCandidates((prev) => {
      const exists = prev.some((c) => c.id === candidateId || (targetAlloc && (c.name || '').toLowerCase() === (targetAlloc.candidateName || '').toLowerCase()));
      if (exists) {
        return prev.map((c) =>
          c.id === candidateId || (targetAlloc && (c.name || '').toLowerCase() === (targetAlloc.candidateName || '').toLowerCase())
            ? { ...c, status: 'SHORTLISTED', selected: false }
            : c
        );
      }
      if (targetAlloc) {
        return [
          ...prev,
          {
            id: targetAlloc.candidateId || candidateId,
            name: targetAlloc.candidateName,
            score: targetAlloc.score || 85,
            jobPosition: targetAlloc.jobPosition || jobPosition || 'Senior Software Engineer',
            role: targetAlloc.jobPosition || jobPosition || 'Senior Software Engineer',
            round: targetAlloc.interviewRound || targetAlloc.round || 'Technical Interview',
            status: 'SHORTLISTED',
            selected: false,
          },
        ];
      }
      return prev;
    });
    showToast(`Candidate unassigned and returned to shortlist.`);
  };

  // Auto Allocate Algorithm
  const handleAutoAllocate = () => {
    const eligibleCandidates = [...filteredCandidates].sort((a, b) => b.score - a.score);
    const availableSlots = filteredSlots.map((slot) => ({ ...slot, rem: slot.rem }));
    
    if (eligibleCandidates.length === 0) {
      setShowNoCandidatesModal(true);
      return;
    }
    if (availableSlots.filter((s) => s.rem > 0).length === 0) {
      showToast('No matching time slots with remaining capacity are available.', 'error');
      return;
    }
    
    const visibleIds = new Set(eligibleCandidates.map((candidate) => candidate.id));
    const newAllocations = allocations.filter((allocation) => !visibleIds.has(allocation.candidateId));
    const allocatedCandIds = new Set();

    eligibleCandidates.forEach((cand) => {
      const availableSlot = availableSlots.find((slot) => slot.rem > 0);

      if (availableSlot) {
        availableSlot.rem -= 1;
        newAllocations.push(buildAllocationRecord(cand, availableSlot));
        allocatedCandIds.add(cand.id);
      } else {
        newAllocations.push({
          candidateId: cand.id,
          candidateName: cand.name,
          slotId: null,
          assignedTime: '—',
          interviewDate: '—',
          interviewType: '—',
          status: 'PENDING',
        });
      }
    });

    setAllocations(newAllocations);
    setCandidates((current) =>
      current.map((candidate) => {
        if (allocatedCandIds.has(candidate.id)) {
          return { ...candidate, status: 'ALLOCATED', selected: false };
        }
        return { ...candidate, selected: false };
      })
    );
    setSelectedSlotId('');
    showToast('Auto-allocation completed! Google Calendar invites sent to allocated candidates.');
  };

  // Reset All Allocations (Bulk Clear)
  const handleResetAllAllocations = () => {
    // 1. Gather all candidates currently present in allocations
    const candidatesFromAllocations = (allocations || []).map((a) => ({
      id: a.candidateId || `APP-${(a.candidateName || '').replace(/\s+/g, '')}`,
      name: a.candidateName,
      score: a.score || 85,
      jobPosition: a.jobPosition || jobPosition || 'Senior Software Engineer',
      role: a.jobPosition || jobPosition || 'Senior Software Engineer',
      round: a.interviewRound || a.round || 'Technical Interview',
      status: 'SHORTLISTED',
      selected: false,
    }));

    // 2. Clear all allocations
    setAllocations([]);
    try {
      localStorage.removeItem('intellihire_allocations');
      localStorage.setItem('intellihire_allocations', JSON.stringify([]));
    } catch (e) {}

    // 3. Clear candidate assignments from custom slots
    try {
      const customSlots = JSON.parse(localStorage.getItem('intellihire_custom_slots') || '[]');
      if (customSlots.length > 0) {
        const cleared = customSlots.map((s) => ({ ...s, assignedCandidate: null, bookedCount: 0 }));
        localStorage.setItem('intellihire_custom_slots', JSON.stringify(cleared));
      }
    } catch (e) {}

    // 4. Update candidates state: restore all candidates to SHORTLISTED and ensure all unassigned candidates appear in shortlist table below
    setCandidates((prev) => {
      const map = new Map();

      // Existing candidates in state -> set status: SHORTLISTED
      (prev || []).forEach((c) => {
        const key = (c.name || '').toLowerCase().trim();
        if (key) {
          map.set(key, { ...c, status: 'SHORTLISTED', selected: false });
        }
      });

      // Candidates from allocations -> ensure they exist with status: SHORTLISTED
      candidatesFromAllocations.forEach((c) => {
        const key = (c.name || '').toLowerCase().trim();
        if (key) {
          const existing = map.get(key);
          map.set(key, {
            ...(existing || {}),
            ...c,
            status: 'SHORTLISTED',
            selected: false,
            jobPosition: c.jobPosition || existing?.jobPosition || jobPosition || 'Senior Software Engineer',
          });
        }
      });

      // Ensure INITIAL_CANDIDATES are included
      INITIAL_CANDIDATES.forEach((initC) => {
        const key = (initC.name || '').toLowerCase().trim();
        if (!map.has(key)) {
          map.set(key, { ...initC, status: 'SHORTLISTED', selected: false });
        }
      });

      const updatedList = Array.from(map.values());
      try {
        localStorage.setItem('intellihire_candidates', JSON.stringify(updatedList));
      } catch (e) {}
      return updatedList;
    });

    setSelectedSlotId('');
    setNotifiedCandidateIds(new Set());
    setShowResetConfirm(false);
    window.dispatchEvent(new Event('intellihire_slots_updated'));
    showToast('All allocations have been reset. Candidates are returned to shortlist.', 'success');
  };
  const handleResetAllocations = handleResetAllAllocations;

  const handleConfirmReschedule = () => {
    const candidate = candidates.find(
      (item) => item.id === reschedulingAllocation?.candidateId
    );
    const targetSlot = slotsWithRemaining.find((slot) => slot.id === rescheduleSlotId);
    if (!candidate || !targetSlot) {
      showToast('Select an available slot to reschedule this candidate.', 'error');
      return;
    }
    const isCurrentSlot = reschedulingAllocation.slotId === targetSlot.id;
    if (!isCurrentSlot && targetSlot.rem <= 0) {
      showToast('The selected slot is fully booked.', 'error');
      return;
    }
    setAllocations((current) =>
      current.map((allocation) =>
        allocation.candidateId === candidate.id
          ? buildAllocationRecord(candidate, targetSlot)
          : allocation
      )
    );
    setReschedulingAllocation(null);
    setRescheduleSlotId('');
    showToast(`${candidate.name}'s interview was rescheduled successfully.`);
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

  // Filtered Allocations for display
  const filteredAllocations = useMemo(() => {
    let list = contextualAllocations;
    if (allocationStatusFilter && allocationStatusFilter !== 'ALL') {
      list = list.filter((a) => (a.status || '').toUpperCase() === allocationStatusFilter.toUpperCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        (a.candidateName || '').toLowerCase().includes(q) ||
        (a.interviewType || '').toLowerCase().includes(q) ||
        (a.status || '').toLowerCase().includes(q) ||
        (a.panelName || '').toLowerCase().includes(q) ||
        (a.interviewRound || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [contextualAllocations, searchQuery, allocationStatusFilter]);

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

  const selectedVisibleCandidates = filteredCandidates.filter((candidate) => candidate.selected);
  const selectedSlot = filteredSlots.find((slot) => slot.id === selectedSlotId);
  const rescheduleCandidate = candidates.find(
    (candidate) => candidate.id === reschedulingAllocation?.candidateId
  );
  const rescheduleOptions = rescheduleCandidate
    ? slotsWithRemaining.filter(
        (slot) =>
          slot.jobPosition === rescheduleCandidate.jobPosition &&
          slot.round === rescheduleCandidate.round &&
          (slot.rem > 0 || slot.id === reschedulingAllocation?.slotId)
      )
    : [];
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

      {/* ── Filter Controls Card ── */}
      <div 
        className="card-surface" 
        style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between', 
          flexWrap: 'nowrap', 
          gap: '12px', 
          padding: '12px 18px', 
          marginBottom: '20px',
          borderRadius: '10px',
          border: '1px solid #2A2C38',
          backgroundColor: '#16171F',
          overflowX: 'auto'
        }}
      >
        {/* Left: Position & Round Filters */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', flexShrink: 0 }}>
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
                    minWidth: '190px',
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
                  minWidth: '180px',
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

        {/* Right: Parallel badges & compact buttons on the same single line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
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

              <div className="action-buttons-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                <div className="allocation-status-filter" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    value={allocationStatusFilter}
                    onChange={(e) => setAllocationStatusFilter(e.target.value)}
                    title="Filter allocations by status"
                    style={{
                      height: '35px',
                      padding: '0 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: '#1E222D',
                      border: '1px solid #2A2C38',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ALLOCATED">Allocated</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="RESCHEDULED">Rescheduled</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleResetAllAllocations}
                  title="Unassign all candidates and clear allocations to start fresh"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#EF4444',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
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
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    color: '#60A5FA',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
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
                  <span>Send All Invites</span>
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="table-responsive">
              <table className="results-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>CANDIDATE NAME</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>INTERVIEW ROUND</th>
                    <th style={{ width: '16%', whiteSpace: 'nowrap' }}>PANEL NAME</th>
                    <th style={{ width: '13%', whiteSpace: 'nowrap' }}>ASSIGNED TIME SLOT</th>
                    <th style={{ width: '11%', whiteSpace: 'nowrap' }}>INTERVIEW DATE</th>
                    <th style={{ width: '8%', whiteSpace: 'nowrap' }}>INTERVIEW TYPE</th>
                    <th style={{ width: '11%', whiteSpace: 'nowrap' }}>ALLOCATION STATUS</th>
                    <th style={{ width: '11%', textAlign: 'right', whiteSpace: 'nowrap' }}>ACTION</th>
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
                        {item.panelName || 'Panel A'}
                      </td>
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div className="time-slot-cell" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#F0B90B', fontWeight: 600, verticalAlign: 'middle' }}>
                          {item.assignedTime !== '—' && (
                            <Clock3 size={14} />
                          )}
                          <span>{formatDisplayTime(item.assignedTime)}</span>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.interviewDate}</td>
                      <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.interviewType}</td>
                      <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        <span
                          className={`status-result-badge ${
                            item.status === 'ALLOCATED' ? 'badge-allocated' : 'badge-pending'
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
                              onClick={() => handleNotifyCandidate(item)}
                              title="Send interview invitation and meeting details"
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
                                border: `1px solid ${
                                  notifiedCandidateIds.has(item.candidateId)
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
                              onClick={() => {
                                setReschedulingAllocation(item);
                                setRescheduleSlotId(item.slotId);
                              }}
                              style={{ whiteSpace: 'nowrap', height: '26px', padding: '0 8px', fontSize: '0.70rem' }}
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              className="btn-unassign-row"
                              onClick={() => handleRemoveAllocation(item.candidateId)}
                              title="Unassign this candidate"
                              style={{ whiteSpace: 'nowrap', height: '26px', padding: '0 8px', fontSize: '0.70rem' }}
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
                    <div><dt>Panel</dt><dd>{item.panelName || 'Panel A'}</dd></div>
                    <div><dt>Date</dt><dd>{item.interviewDate}</dd></div>
                    <div><dt>Time</dt><dd>{item.assignedTime}</dd></div>
                    <div><dt>Type</dt><dd>{item.interviewType}</dd></div>
                  </dl>
                  {item.status === 'ALLOCATED' && (
                    <div className="result-row-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      <button
                        type="button"
                        className="btn-notify-row"
                        onClick={() => handleNotifyCandidate(item)}
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
                      <button type="button" className="btn-reschedule-row" onClick={() => {
                        setReschedulingAllocation(item);
                        setRescheduleSlotId(item.slotId);
                      }}>Reschedule</button>
                      <button type="button" className="btn-unassign-row" onClick={() => handleRemoveAllocation(item.candidateId)}>
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
                Showing <strong>{paginatedAllocations.length}</strong> of <strong>{filteredAllocations.length}</strong> allocation results
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
              <div className="card-header-bar flex-between">
                <div className="card-title-group">
                  <Users size={16} />
                  <h3 className="card-title">Shortlisted Candidates</h3>
                </div>
                <span className="count-badge">{filteredCandidates.length} TOTAL</span>
              </div>

              {filteredCandidates.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9599A6', borderTop: '1px solid #2A2C38' }}>
                  <Users size={32} style={{ marginBottom: '16px', opacity: 0.3, display: 'inline-block' }} />
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '8px', fontWeight: 600 }}>No candidates found</h4>
                  <p style={{ fontSize: '0.8rem', lineHeight: '1.5', maxWidth: '250px', margin: '0 auto' }}>
                    No candidates have been shortlisted yet. Open candidate details to shortlist them.
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
                              onChange={() => handleToggleCandidateSelect(cand.id)}
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
              <button
                type="button"
                className="btn-primary-accent btn-allocate"
                onClick={handleManualAllocate}
              >
                <span>Allocate</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                className="btn-ghost-dark btn-remove-alloc"
                onClick={() => {
                  const selected = selectedVisibleCandidates;
                  if (selected.length === 0) {
                    showToast('Select a candidate to remove allocation.', 'error');
                  } else {
                    const selectedIds = new Set(selected.map((candidate) => candidate.id));
                    setAllocations((current) =>
                      current.map((allocation) =>
                        selectedIds.has(allocation.candidateId)
                          ? { ...allocation, slotId: null, assignedTime: '—', interviewDate: '—', interviewType: '—', status: 'PENDING' }
                          : allocation
                      )
                    );
                    setCandidates((current) =>
                      current.map((candidate) =>
                        selectedIds.has(candidate.id) ? { ...candidate, status: 'SHORTLISTED', selected: false } : candidate
                      )
                    );
                    showToast(`Removed allocations for ${selected.length} candidate(s).`);
                  }
                }}
              >
                <ArrowLeft size={14} />
                <span>Remove</span>
              </button>
            </div>

            {/* Right Card: Available Time Slots */}
            <div className="card-surface slots-list-card">
              <div className="card-header-bar flex-between">
                <div className="card-title-group">
                  <CalendarDays size={16} />
                  <h3 className="card-title">Available Time Slots</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    type="button"
                    onClick={handleAutoAllocate}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', 
                      padding: '6px 12px', borderRadius: '6px', 
                      backgroundColor: 'rgba(240, 185, 11, 0.1)', border: '1px solid #F0B90B', color: '#F0B90B',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={14} />
                    Auto-Assign
                  </button>
                  <span className="count-badge">{filteredSlots.length} SLOTS</span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="alloc-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px', textAlign: 'center' }}></th>
                      <th>DATE</th>
                      <th>TIME</th>
                      <th>TYPE</th>
                      <th>CAP.</th>
                      <th>REM.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlots.length === 0 && (
                      <tr>
                        <td colSpan="6" className="allocation-empty-cell">No slots match the selected filters.</td>
                      </tr>
                    )}
                    {filteredSlots.map((slot) => {
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
                          <td className="slot-time-cell">
                            <Clock3 size={12} />
                            <span>{formatDisplayTime(slot.time || slot.startTime)}</span>
                            {isPast && (
                              <span style={{ marginLeft: '4px', color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                                Past
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`type-tag ${slot.type === 'Online' ? 'type-online' : 'type-physical'}`}>
                              {slot.type}
                            </span>
                          </td>
                          <td className="font-bold">{slot.cap}</td>
                          <td>
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
              <div className="allocation-mobile-list">
                {filteredSlots.length === 0 && (
                  <div className="allocation-mobile-empty">No slots match the selected filters.</div>
                )}
                {filteredSlots.map((slot) => (
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
          <div className="allocation-modal" onClick={(event) => event.stopPropagation()}>
            <div className="allocation-modal__header">
              <h3>Reschedule Interview</h3>
              <button type="button" onClick={() => setReschedulingAllocation(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="allocation-modal__body">
              <p>Select a new slot for <strong>{reschedulingAllocation.candidateName}</strong>.</p>
              <label className="reschedule-slot-label" htmlFor="reschedule-slot">Available time slot</label>
              <select
                id="reschedule-slot"
                className="form-control"
                value={rescheduleSlotId}
                onChange={(event) => setRescheduleSlotId(event.target.value)}
              >
                <option value="">Select a slot</option>
                {rescheduleOptions.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.date} · {formatDisplayTime(slot.time || slot.startTime)}–{formatDisplayTime(slot.end || slot.endTime)} · {slot.type} · {slot.rem} available
                  </option>
                ))}
              </select>
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
              Time Slot Management
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
            >
              Panel Schedule & Reschedules
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

                      <span style={{ color: '#9599A6' }}>Meeting Venue / Link:</span>
                      <span style={{ color: '#60A5FA', wordBreak: 'break-all' }}>
                        {previewSelectedCandidate.meetingLocation || (previewSelectedCandidate.interviewType === 'Physical' ? 'Engineering Interview Room 1, HQ Building' : 'https://meet.google.com/intelli-xyz-123')}
                      </span>
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
                <span>Confirm &amp; Send All Invites ({filteredAllocations.filter((a) => a.status === 'ALLOCATED').length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
