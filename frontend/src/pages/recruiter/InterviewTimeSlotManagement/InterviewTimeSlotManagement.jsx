import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Users,
  Calendar,
  ExternalLink,
  Video,
  Building,
  Clock,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './InterviewTimeSlotManagement.css';
import { VACANCIES } from '../../../data/vacancies';

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
    interviewDate: '03 Aug 2026',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    interviewType: 'Online',
    capacity: 5,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/abc-tech-interview',
    additionalNotes: 'Focus on React state management and Node.js microservices architecture.',
    bookedCount: 2,
  },
  {
    id: 7,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'System Design',
    interviewDate: '04 Aug 2026',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    interviewType: 'Online',
    capacity: 4,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/fullstack-system-design',
    additionalNotes: 'Architecture discussion covering scalability, APIs, and database design.',
    bookedCount: 1,
  },
  {
    id: 8,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Final Panel',
    interviewDate: '06 Aug 2026',
    startTime: '01:30 PM',
    endTime: '02:30 PM',
    interviewType: 'Physical',
    capacity: 3,
    status: 'FULLY BOOKED',
    meetingLocation: 'Engineering Conference Room, 2nd Floor',
    additionalNotes: 'Final discussion with the engineering manager and technical panel.',
    bookedCount: 3,
  },
  {
    id: 9,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Technical',
    interviewDate: '05 Aug 2026',
    startTime: '09:30 AM',
    endTime: '10:30 AM',
    interviewType: 'Online',
    capacity: 5,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/fullstack-technical-b',
    additionalNotes: 'Coding and debugging exercise focused on React and Node.js.',
    bookedCount: 3,
  },
  {
    id: 10,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Backend Deep Dive',
    interviewDate: '07 Aug 2026',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    interviewType: 'Physical',
    capacity: 4,
    status: 'AVAILABLE',
    meetingLocation: 'Engineering Interview Room 1',
    additionalNotes: 'API design, database performance, and service reliability discussion.',
    bookedCount: 2,
  },
  {
    id: 11,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Frontend Architecture',
    interviewDate: '10 Aug 2026',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    interviewType: 'Online',
    capacity: 4,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/frontend-architecture',
    additionalNotes: 'Frontend architecture, accessibility, performance, and testing discussion.',
    bookedCount: 1,
  },
  {
    id: 12,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Engineering Manager',
    interviewDate: '11 Aug 2026',
    startTime: '03:30 PM',
    endTime: '04:30 PM',
    interviewType: 'Physical',
    capacity: 3,
    status: 'AVAILABLE',
    meetingLocation: 'Engineering Conference Room, 2nd Floor',
    additionalNotes: 'Leadership, collaboration, delivery ownership, and career goals discussion.',
    bookedCount: 2,
  },
  {
    id: 2,
    jobPosition: 'UI/UX Designer',
    round: 'HR Portfolio Review',
    interviewDate: '03 Aug 2026',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    interviewType: 'Physical',
    capacity: 3,
    status: 'FULLY BOOKED',
    meetingLocation: 'Conference Room B, 3rd Floor, Main HQ',
    additionalNotes: 'Candidate should bring printed portfolio or tablet presentation.',
    bookedCount: 3,
  },
  {
    id: 3,
    jobPosition: 'QA Automation Engineer',
    round: 'Final Cultural Fit',
    interviewDate: '04 Aug 2026',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    interviewType: 'Online',
    capacity: 4,
    status: 'COMPLETED',
    meetingLocation: 'https://zoom.us/j/987654321',
    additionalNotes: 'Evaluation completed by Lead QA Manager. Panel feedback recorded.',
    bookedCount: 4,
  },
  {
    id: 4,
    jobPosition: 'Business Analyst',
    round: 'Technical Case Study',
    interviewDate: '05 Aug 2026',
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
    interviewDate: '06 Aug 2026',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    interviewType: 'Online',
    capacity: 6,
    status: 'AVAILABLE',
    meetingLocation: 'https://meet.google.com/pm-screening-room',
    additionalNotes: 'Initial background screening and career roadmap alignment.',
    bookedCount: 3,
  },
  {
    id: 6,
    jobPosition: 'DevOps Lead',
    round: 'Architecture Final',
    interviewDate: '07 Aug 2026',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    interviewType: 'Physical',
    capacity: 3,
    status: 'FULLY BOOKED',
    meetingLocation: 'Executive Boardroom A',
    additionalNotes: 'Whiteboard system design challenge with VP of Engineering.',
    bookedCount: 3,
  },
];

const defaultVacancy = VACANCIES.find(v => v.status === 'published')?.title || 'Senior Fullstack Engineer';

const emptyForm = {
  jobPosition: defaultVacancy,
  interviewRound: 'Technical',
  customRoundName: '',
  interviewMedia: 'Google Meet',
  interviewType: 'Online',
  interviewDate: '',
  startTime: '09:00',
  endTime: '10:00',
  capacity: '3',
  panelName: 'Panel A (Technical Leads)',
  panelEmails: 'saman.tech@company.com, nirosha.hr@company.com',
  meetingLocation: '',
  additionalNotes: '',
};

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

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function RecruiterInterviewTimeSlotManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateVacancy = location.state?.selectedVacancy;
  const initialForm = stateVacancy ? { ...emptyForm, jobPosition: stateVacancy } : emptyForm;

  const [slots, setSlots] = useState(initialSlots);
  const [formData, setFormData] = useState(initialForm);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [showZohoModal, setShowZohoModal] = useState(location.state?.openForm || false);
  const [showInlineForm, setShowInlineForm] = useState(false);
  
  // If we arrived from another page requesting to open the form directly, skip the choice modal
  // Wait, the flow is: Hero card -> Choice Modal -> Inline Form.
  // We can just open the Choice modal directly, or the inline form. I'll open the Choice modal.
  const [activeZohoType, setActiveZohoType] = useState('Google Meet');
  const [positionFilter, setPositionFilter] = useState(initialSlots[0].jobPosition);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const [viewingSlot, setViewingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const todayInputValue = getTodayInputValue();

  // Dynamic Rounds Pipeline State
  const [roundsCount, setRoundsCount] = useState(3);
  const [roundTypes, setRoundTypes] = useState([
    'HR Screening',
    'Technical / Live Coding',
    'System Design Architecture',
  ]);
  const [customRoundInput, setCustomRoundInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Dynamic Panels & Time Slots Generator State
  const [panels, setPanels] = useState([
    {
      id: 1,
      name: 'Panel A (Technical Leads)',
      emails: 'saman.tech@company.com, nirosha.hr@company.com',
      capacity: 3,
      slots: [
        { id: 1, startTime: '09:00', endTime: '10:00' },
        { id: 2, startTime: '10:15', endTime: '11:15' },
        { id: 3, startTime: '11:30', endTime: '12:30' },
      ],
    },
  ]);

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
    setCustomRoundInput('');
    setShowCustomInput(false);
  };

  const handlePanelCapacityChange = (panelId, newCapacity) => {
    const cap = Math.max(1, Math.min(10, Number(newCapacity)));
    setPanels(prev =>
      prev.map(p => {
        if (p.id !== panelId) return p;
        const slotsCopy = [...p.slots];
        while (slotsCopy.length < cap) {
          const slotNum = slotsCopy.length + 1;
          slotsCopy.push({ id: slotNum, startTime: '', endTime: '' });
        }
        return {
          ...p,
          capacity: cap,
          slots: slotsCopy.slice(0, cap),
        };
      })
    );
  };

  const handleAddManualSlot = panelId => {
    setPanels(prev =>
      prev.map(p => {
        if (p.id !== panelId) return p;
        const nextId = p.slots.length + 1;
        return {
          ...p,
          capacity: p.slots.length + 1,
          slots: [...p.slots, { id: nextId, startTime: '', endTime: '' }],
        };
      })
    );
  };

  const handleRemoveManualSlot = (panelId, slotId) => {
    setPanels(prev =>
      prev.map(p => {
        if (p.id !== panelId) return p;
        if (p.slots.length <= 1) return p;
        const updated = p.slots.filter(s => s.id !== slotId);
        return {
          ...p,
          capacity: updated.length,
          slots: updated,
        };
      })
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
    setPanels(prev =>
      prev.map(p => {
        if (p.id !== panelId) return p;
        return {
          ...p,
          slots: p.slots.map(s => (s.id === slotId ? { ...s, [field]: val } : s)),
        };
      })
    );
  };

  const handleAddPanel = () => {
    const nextId = panels.length + 1;
    setPanels(prev => [
      ...prev,
      {
        id: nextId,
        name: `Panel ${String.fromCharCode(64 + nextId)} (Senior Panel)`,
        emails: 'evaluator@company.com, hr@company.com',
        capacity: 2,
        slots: [
          { id: 1, startTime: '14:00', endTime: '15:00' },
          { id: 2, startTime: '15:15', endTime: '16:15' },
        ],
      },
    ]);
  };

  const handleRemovePanel = panelId => {
    if (panels.length <= 1) return;
    setPanels(prev => prev.filter(p => p.id !== panelId));
  };

  const jobPositions = useMemo(
    () => [...new Set(slots.map(slot => slot.jobPosition))].sort(),
    [slots]
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
    if (!message) return undefined;
    const timeoutId = window.setTimeout(() => setMessage(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

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
    setShowZohoModal(true);
  };

  const handleChooseZohoType = (type) => {
    setShowZohoModal(false);
    setActiveZohoType(type);
    let selectedMedia = 'Google Meet';
    let isOnline = true;
    if (type === 'In-Person') {
      selectedMedia = 'In-Person';
      isOnline = false;
    } else if (type === 'Log') {
      selectedMedia = 'Log';
      isOnline = false;
    }
    setFormData({
      ...emptyForm,
      interviewMedia: selectedMedia,
      interviewType: isOnline ? 'Online' : (type === 'Log' ? 'Logged' : 'Physical'),
      meetingLocation: type === 'In-Person' 
        ? 'Executive Boardroom 3B, 2nd Floor, HQ Tower' 
        : (type === 'Google Meet' ? `https://meet.google.com/intelli-${Math.random().toString(36).substring(2, 7)}` : 'Past Session Evaluation Log'),
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
    setFormData(current => {
      const isOnline = media !== 'In-Person';
      let autoLocation = current.meetingLocation;
      if (media === 'Google Meet' && (!autoLocation || autoLocation.includes('teams'))) {
        autoLocation = `https://meet.google.com/intelli-${Math.random().toString(36).substring(2, 7)}`;
      } else if (media === 'MS Teams' && (!autoLocation || autoLocation.includes('meet'))) {
        autoLocation = `https://teams.microsoft.com/l/meetup-join/intelli-${Math.random().toString(36).substring(2, 7)}`;
      } else if (media === 'In-Person' && (autoLocation.includes('http') || !autoLocation)) {
        autoLocation = 'Main Engineering Conference Room, 2nd Floor';
      }
      return {
        ...current,
        interviewMedia: media,
        interviewType: isOnline ? 'Online' : 'Physical',
        meetingLocation: autoLocation,
      };
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
    setMessage('');

    if (!formData.interviewDate) {
      setFormError('Interview date is required.');
      return;
    }

    const formattedDate = formatDate(formData.interviewDate);
    const roundSummary = roundTypes.join(', ');

    if (editingSlotId) {
      setSlots(current =>
        current.map(slot => {
          if (slot.id === editingSlotId) {
            return {
              ...slot,
              jobPosition: formData.jobPosition,
              round: roundSummary,
              interviewMedia: formData.interviewMedia,
              interviewDate: formattedDate,
              interviewType: formData.interviewMedia === 'In-Person' ? 'Physical' : 'Online',
              panelName: panels[0]?.name || 'Panel A (Technical Leads)',
              panelEmails: panels[0]?.emails || 'techlead@company.com, hr@company.com',
              meetingLocation: formData.meetingLocation,
              additionalNotes: formData.additionalNotes,
            };
          }
          return slot;
        })
      );
      setMessage('Interview setup updated & synced to Google Calendar!');
    } else {
      let createdSlots = [];
      let baseId = slots.length ? Math.max(...slots.map(s => s.id)) + 1 : 1;

      panels.forEach(p => {
        p.slots.forEach((sRow, idx) => {
          createdSlots.push({
            id: baseId++,
            jobPosition: formData.jobPosition,
            round: roundTypes[idx % roundTypes.length] || 'Technical Round',
            interviewMedia: formData.interviewMedia,
            interviewDate: formattedDate,
            startTime: formatTime(sRow.startTime),
            endTime: formatTime(sRow.endTime),
            interviewType: formData.interviewMedia === 'In-Person' ? 'Physical' : 'Online',
            capacity: p.capacity,
            status: 'AVAILABLE',
            panelName: p.name,
            panelEmails: p.emails,
            meetingLocation: formData.meetingLocation || (formData.interviewMedia === 'Google Meet' ? `https://meet.google.com/intelli-${Math.random().toString(36).substring(2, 7)}` : 'Main Office Conference Room'),
            additionalNotes: formData.additionalNotes || 'N/A',
            bookedCount: 0,
          });
        });
      });

      setSlots(current => [...createdSlots, ...current]);
      setPositionFilter(formData.jobPosition);
      setCurrentPage(1);

      if (activeZohoType === 'Log') {
        setMessage(`Successfully logged ${createdSlots.length} past interview evaluation record(s)!`);
      } else {
        setMessage(`Successfully created ${createdSlots.length} interview time slots across ${panels.length} panel(s) & synced guest emails to Google Calendar!`);

        // Automatically open Google Calendar event creation page in a new browser tab for upcoming interviews
        if (panels.length > 0 && panels[0].slots.length > 0) {
          const p1 = panels[0];
          const s1 = p1.slots[0];
          const gcalUrl = buildGoogleCalendarUrl({
            title: `IntelliHire Interview: ${formData.customRoundName || formData.interviewRound} (${formData.jobPosition})`,
            description: `INTELLIHIRE INTERVIEW DETAILS:\n  Job Position: ${formData.jobPosition}\n  Interview Round: ${formData.customRoundName || formData.interviewRound}\n  Platform / Media: ${formData.interviewMedia}\n  Panel: ${p1.name}\n  Emails: ${p1.emails}\n  Notes: ${formData.additionalNotes || 'N/A'}`,
            dateStr: formData.interviewDate,
            startTimeStr: s1.startTime,
            endTimeStr: s1.endTime,
            location: formData.meetingLocation || (formData.interviewMedia === 'Google Meet' ? 'Google Meet Online' : 'Main Office Conference Room'),
            addEmails: p1.emails,
          });

          window.open(gcalUrl, '_blank');
        }
      }
    }

    setFormData(emptyForm);
    setShowInlineForm(false);

    // Auto back to previous active vacancy page immediately after saving!
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/vacancies/VAC-001');
    }
  };

  const confirmDeleteSlot = () => {
    if (deletingSlot) {
      setSlots(current => current.filter(slot => slot.id !== deletingSlot.id));
      setMessage(`Slot #${deletingSlot.id} deleted successfully.`);
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
          <button
            type="button"
            onClick={() => navigate('/recruiter/vacancies')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              padding: '0',
              color: '#94A3B8',
              fontSize: '0.98rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '10px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#60A5FA')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <ArrowLeft size={16} />
            <span>Back to Vacancies</span>
          </button>

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

                {/* ── Section 1: Interview Date ── */}
                <div style={{ padding: '18px', backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '12px', marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                    1. INTERVIEW DATE
                  </h4>
                  <div style={{ maxWidth: '300px' }}>
                    <label className="form-label" style={{ fontSize: '0.76rem', color: '#9599A6', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>
                      {activeZohoType === 'Log' ? 'CONDUCTED DATE' : 'SELECT DATE'}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="date"
                        name="interviewDate"
                        min={activeZohoType === 'Log' ? undefined : todayInputValue}
                        value={formData.interviewDate}
                        onChange={handleFieldChange}
                        className="form-control"
                        style={{ colorScheme: 'dark', backgroundColor: '#1E222D', color: '#FFFFFF', borderRadius: '8px', padding: '8px 32px 8px 12px', fontSize: '0.85rem', width: '100%' }}
                      />
                      <CalendarDays size={16} style={{ position: 'absolute', right: '10px', color: '#F0B90B', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Dynamic Interview Rounds Pipeline ── */}
                <div style={{ padding: '18px', backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                        2. DYNAMIC INTERVIEW ROUNDS PIPELINE
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#9599A6' }}>
                        Select total rounds for this hiring pipeline (e.g. 1, 2, 3, 4, 5) or add custom rounds
                      </p>
                    </div>

                    {/* Right-aligned container with Add Custom Round Name on Top & Rounds Count Next Down */}
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
                          <span>Add Custom Round Name</span>
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Custom round name..."
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

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.78rem', color: '#9599A6', fontWeight: 600 }}>Rounds Count:</label>
                        <select
                          value={roundsCount}
                          onChange={(e) => handleRoundsCountChange(e.target.value)}
                          style={{
                            backgroundColor: '#1E222D',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          <option value={1}>1 Round</option>
                          <option value={2}>2 Rounds</option>
                          <option value={3}>3 Rounds</option>
                          <option value={4}>4 Rounds</option>
                          <option value={5}>5 Rounds</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dynamically Rendered Round Sections */}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(roundsCount, 3)}, 1fr)`, gap: '12px' }}>
                    {roundTypes.map((roundTitle, idx) => (
                      <div key={idx} style={{ backgroundColor: '#1E222D', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                        <div style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.03em' }}>
                          Round {idx + 1} Title
                        </div>
                        <select
                          value={roundTitle}
                          onChange={(e) => handleRoundTypeSelect(idx, e.target.value)}
                          className="form-control"
                          style={{ fontSize: '0.84rem', backgroundColor: '#16171F', color: '#FFFFFF' }}
                        >
                          <option value="HR Screening">HR Screening</option>
                          <option value="Technical / Live Coding">Technical / Live Coding</option>
                          <option value="System Design Architecture">System Design Architecture</option>
                          <option value="Final Cultural Fit">Final Cultural Fit</option>
                          <option value="Portfolio Review">Portfolio Review</option>
                          <option value="Management Round">Management Round</option>
                          <option value={roundTitle}>{roundTitle}</option>
                        </select>
                      </div>
                    ))}
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

                  {panels.map((p, pIdx) => (
                    <div key={p.id} style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#1E222D', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handlePanelNameChange(p.id, e.target.value)}
                          className="form-control"
                          style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.88rem', maxWidth: '280px', padding: '5px 10px', backgroundColor: '#16171F', borderRadius: '6px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                            }}
                          >
                            <Plus size={13} style={{ color: '#F0B90B' }} />
                            <span>Add Panel Member Email</span>
                          </button>
                          {panels.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePanel(p.id)}
                              style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                            >
                              Remove Panel
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600 }}>PANEL MEMBER EMAILS (ATTENDEES)</label>
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
                                placeholder={`Panel Member #${eIdx + 1} Email (e.g. evaluator${eIdx + 1}@company.com)`}
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
                                  title="Remove Email"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600 }}>CANDIDATE CAPACITY (INTERVIEW COUNT)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={p.capacity}
                            onChange={(e) => handlePanelCapacityChange(p.id, e.target.value)}
                            className="form-control"
                            placeholder="How many candidates?"
                            style={{ backgroundColor: '#16171F', color: '#FFFFFF' }}
                          />
                        </div>
                      </div>

                      {/* Manual Time Slot Space for this Panel */}
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ fontSize: '0.76rem', color: '#9599A6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={15} style={{ color: '#F0B90B', stroke: '#F0B90B' }} />
                            <span>{activeZohoType === 'Log' ? 'CONDUCTED TIME SLOT:' : `MANUALLY CONFIGURED TIME SLOTS (${p.slots.length} SLOTS):`}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddManualSlot(p.id)}
                            style={{
                              backgroundColor: 'rgba(240, 185, 11, 0.15)',
                              color: '#F0B90B',
                              border: '1px solid #F0B90B',
                              borderRadius: '6px',
                              padding: '3px 10px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Plus size={13} style={{ color: '#F0B90B' }} />
                            <span>Add Slot</span>
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
                          {p.slots.map((slot) => (
                            <div key={slot.id} style={{ padding: '8px 10px', backgroundColor: '#16171F', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600 }}>
                                  Slot #{slot.id}
                                </span>
                                {p.slots.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveManualSlot(p.id, slot.id)}
                                    style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1 }}
                                    title="Remove Slot"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => handleSlotTimeChange(p.id, slot.id, 'startTime', e.target.value)}
                                    className="form-control"
                                    style={{ fontSize: '0.78rem', padding: '4px 24px 4px 6px', colorScheme: 'dark', backgroundColor: '#1E222D', color: '#FFFFFF', width: '100%' }}
                                  />
                                  <Clock size={13} style={{ position: 'absolute', right: '6px', color: '#F0B90B', pointerEvents: 'none' }} />
                                </div>
                                <span style={{ color: '#9599A6', fontSize: '0.78rem' }}>to</span>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => handleSlotTimeChange(p.id, slot.id, 'endTime', e.target.value)}
                                    className="form-control"
                                    style={{ fontSize: '0.78rem', padding: '4px 24px 4px 6px', colorScheme: 'dark', backgroundColor: '#1E222D', color: '#FFFFFF', width: '100%' }}
                                  />
                                  <Clock size={13} style={{ position: 'absolute', right: '6px', color: '#F0B90B', pointerEvents: 'none' }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
                        <label className="form-label" style={{ fontSize: '0.74rem', color: '#9599A6', fontWeight: 600 }}>AUTO-GENERATED MEETING LINK (GOOGLE MEET / TEAMS)</label>
                        <input
                          type="text"
                          name="meetingLocation"
                          placeholder="Auto-generated meeting URL..."
                          value={formData.meetingLocation}
                          onChange={handleFieldChange}
                          className="form-control"
                          style={{ backgroundColor: '#1E222D', color: '#FFFFFF' }}
                        />
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

                {/* Form Buttons */}
                <div className="form-actions-row" style={{ marginTop: '24px' }}>
                  <button type="submit" className="btn-primary-accent" style={{ padding: '12px 24px' }}>
                    <span>
                      {editingSlotId
                        ? 'Update Interview Slot'
                        : (activeZohoType === 'Log' ? 'Save Logged Interview' : 'Save & Sync Google Calendar')}
                    </span>
                  </button>
                  <button type="button" className="btn-ghost-dark" onClick={() => setShowInlineForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Toast / Message Notification */}
          {message && (
            <div className="alert-toast alert-success">
              <span>{message}</span>
              <button type="button" className="toast-close" onClick={() => setMessage('')}>
                ×
              </button>
            </div>
          )}
          {formError && (
            <div className="alert-toast alert-danger">
              <button type="button" className="toast-close" onClick={() => setFormError('')}>
                ×
              </button>
            </div>
          )}


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

      {/* ── Modal 1: Zoho Recruit Style Choice Modal ── */}
      {showZohoModal && (
        <div className="modal-backdrop" onClick={() => setShowZohoModal(false)}>
          <div
            className="modal-card zoho-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '90%',
              borderRadius: '16px',
              backgroundColor: '#16171F',
              border: '1px solid #2A2C38',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              padding: '0',
              overflow: 'hidden',
              backgroundColor: '#16171F',
              border: '1px solid rgba(240, 185, 11, 0.25)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div className="modal-header border-bottom-header flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid #2A2C38' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '22px', backgroundColor: '#F0B90B', borderRadius: '4px' }} />
                <h3 className="modal-title" style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                  Create Interview
                </h3>
              </div>
              <button
                type="button"
                className="toast-close"
                onClick={() => setShowZohoModal(false)}
                style={{
                  fontSize: '1.4rem',
                  color: '#9599A6',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Choice 1: In-person Interview */}
              <div
                className="zoho-modal-choice-card"
                onClick={() => handleChooseZohoType('In-Person')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '18px',
                  padding: '18px 20px',
                  backgroundColor: '#1E222D',
                  border: '1px solid #2A2C38',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(240, 185, 11, 0.12)',
                    color: '#F0B90B',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Building size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    In-person Interview
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#9599A6', margin: '6px 0 0 0', lineHeight: 1.45 }}>
                    Schedule and conduct Interviews with Candidates, Interviewers, Recruiters and Contacts.
                  </p>
                </div>
              </div>

              {/* Choice 2: Video Interview */}
              <div
                className="zoho-modal-choice-card"
                onClick={() => handleChooseZohoType('Google Meet')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '18px',
                  padding: '18px 20px',
                  backgroundColor: '#1E222D',
                  border: '1px solid #2A2C38',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(240, 185, 11, 0.12)',
                    color: '#F0B90B',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Video size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    Video Interview
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#9599A6', margin: '6px 0 0 0', lineHeight: 1.45 }}>
                    Schedule and conduct both recorded and live video Interviews with Candidates, Recruiters and Interviewers.
                  </p>
                </div>
              </div>

              {/* Choice 3: Log an Interview */}
              <div
                className="zoho-modal-choice-card"
                onClick={() => handleChooseZohoType('Log')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '18px',
                  padding: '18px 20px',
                  backgroundColor: '#1E222D',
                  border: '1px solid #2A2C38',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(240, 185, 11, 0.12)',
                    color: '#F0B90B',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    Log an Interview
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#9599A6', margin: '6px 0 0 0', lineHeight: 1.45 }}>
                    Log Interview data that had happened in the past or spontaneously.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterInterviewTimeSlotManagementPage;
