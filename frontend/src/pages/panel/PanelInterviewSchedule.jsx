import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  User,
  AlertCircle,
  CheckCircle2,
  CalendarPlus,
  RefreshCw,
  Plus,
  Trash2,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Users,
  Star,
  Award,
  ClipboardCheck,
  Lock,
  Building2,
} from 'lucide-react';
import {
  getInterviewSlots,
  saveInterviewSlots,
  getPanelMembers,
  submitRescheduleRequest,
  generateGoogleCalendarLink,
  isPastOrToday,
  splitTimeRange,
  cleanSingleTime,
  getEndTime,
} from '../../services/interviewService';
import TopBar from '../../components/TopBar/TopBar';
import RecruiterSidebar from '../../components/common/RecruiterSidebar';
import './PanelInterviewSchedule.css';

// Helper: Format slot timing cleanly without duplicating end time
export const formatTimingDisplay = (startTime, endTime) => {
  if (!startTime) return '—';
  const startRaw = String(startTime).trim();
  const sParts = startRaw.split(/\s*(?:[\u2013\u2014–—-]|to)\s*/i).filter(Boolean);

  // If startTime itself is already a range (e.g. "11:00 AM – 12:00 PM" or "11:00 AM – 12:00 PM – 12:00 PM")
  if (sParts.length >= 2) {
    const s = cleanSingleTime(sParts[0]);
    const e = cleanSingleTime(sParts[sParts.length - 1]);
    return s && e && s !== e ? `${s} – ${e}` : s;
  }

  const s = cleanSingleTime(sParts[0] || startRaw);
  let e = '';
  if (endTime) {
    const eParts = String(endTime).split(/\s*(?:[\u2013\u2014–—-]|to)\s*/i).filter(Boolean);
    e = cleanSingleTime(eParts[eParts.length - 1] || endTime);
  } else {
    e = getEndTime(s);
  }

  if (e && e.toLowerCase() !== s.toLowerCase()) {
    return `${s} – ${e}`;
  }
  return s;
};

// Convert 12h or 24h string to HH:mm for <input type="time">
export const toTimeInputValue = (timeValue) => {
  if (!timeValue) return '10:00';
  const clean = String(timeValue).trim();
  if (/^\d{2}:\d{2}$/.test(clean)) return clean;
  if (/^\d{1}:\d{2}$/.test(clean)) return `0${clean}`;
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return '10:00';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3] ? match[3].toUpperCase() : '';
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

// Convert HH:mm (24h) to 'hh:mm AM/PM'
export const to12HourTime = (timeValue) => {
  if (!timeValue) return '10:00 AM';
  const clean = String(timeValue).trim();
  if (clean.includes('AM') || clean.includes('PM')) {
    const m = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (m) {
      return `${String(parseInt(m[1], 10)).padStart(2, '0')}:${m[2]} ${m[3].toUpperCase()}`;
    }
    return clean;
  }
  const match = clean.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return clean;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
};

// Calculate end time based on start time + minutes
export const calculateEndTime = (start24or12, durationMinutes = 60) => {
  const start24 = toTimeInputValue(start24or12);
  const [h, m] = start24.split(':').map(Number);
  const totalMins = (isNaN(h) ? 10 : h) * 60 + (isNaN(m) ? 0 : m) + Number(durationMinutes);
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  const end24 = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  return {
    time24: end24,
    time12: to12HourTime(end24),
  };
};

// Calculate duration in minutes between start and end
export const getDurationMinutes = (startTime, endTime) => {
  try {
    const s24 = toTimeInputValue(startTime);
    const e24 = toTimeInputValue(endTime);
    const [sh, sm] = s24.split(':').map(Number);
    const [eh, em] = e24.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) diff += 24 * 60;
    return diff || 60;
  } catch {
    return 60;
  }
};

// Format duration into readable string (e.g. "1 hr", "45 mins", "1 hr 30 mins")
export const formatDurationDisplay = (minutes) => {
  if (!minutes || minutes <= 0) return '1 hr';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} hr ${m} min`;
  if (h > 0) return `${h} hr`;
  return `${m} mins`;
};

const DURATION_PRESETS = [
  { label: '30 mins', mins: 30 },
  { label: '45 mins', mins: 45 },
  { label: '1 hour (Standard)', mins: 60 },
];

const RESCHEDULE_REASONS = [
  'Schedule Conflict / Prior Meeting',
  'Emergency / Personal Leave',
  'Technical / Connection Issue',
  'Candidate Unavailable / Requested by Candidate',
  'Need Extra Prep / Portfolio Review Time',
  'Other',
];

export default function PanelInterviewSchedule() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelMembers, setPanelMembers] = useState([]);
  const [selectedPanelistId, setSelectedPanelistId] = useState('ALL');
  const [slots, setSlots] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // Reschedule Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlotForReschedule, setSelectedSlotForReschedule] = useState(null);
  const [rescheduleReasonCategory, setRescheduleReasonCategory] = useState(RESCHEDULE_REASONS[0]);
  const [detailedNotes, setDetailedNotes] = useState('');
  const [proposedSlots, setProposedSlots] = useState([
    {
      id: 1,
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '11:00 AM',
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Evaluation & Feedback Modal State
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalSlot, setEvalSlot] = useState(null);
  const [evalScore, setEvalScore] = useState(4);
  const [evalStrengths, setEvalStrengths] = useState('');
  const [evalImprovements, setEvalImprovements] = useState('');
  const [evalRecommendation, setEvalRecommendation] = useState('HIRE');

  // Load data on mount & listen to live allocation updates
  useEffect(() => {
    const loadedPanelists = getPanelMembers();
    setPanelMembers(loadedPanelists);
    setSelectedPanelistId('ALL');
    refreshSlots();

    const handleSync = () => {
      refreshSlots();
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

  const refreshSlots = () => {
    const allSlots = getInterviewSlots();
    setSlots(allSlots);
  };

  const isAllView = selectedPanelistId === 'ALL';

  const currentPanelist = useMemo(() => {
    if (isAllView) {
      return {
        id: 'ALL',
        name: 'All Panel Members',
        role: 'Full Recruitment Schedule Overview',
        department: 'All Departments (Engineering & HR)',
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      };
    }
    return panelMembers.find((p) => p.id === selectedPanelistId) || panelMembers[0];
  }, [panelMembers, selectedPanelistId, isAllView]);

  // Filter slots for the active panelist (or show ALL slots if isAllView)
  const panelistSlots = useMemo(() => {
    if (isAllView) return slots;
    if (!currentPanelist) return [];
    return slots.filter((slot) => slot.panelMember?.id === currentPanelist.id || slot.panelMember?.email === currentPanelist.email);
  }, [slots, currentPanelist, isAllView]);

  // Sub-filter tabs
  const filteredSlots = useMemo(() => {
    if (activeFilter === 'UPCOMING') {
      return panelistSlots.filter((s) => s.status === 'SCHEDULED' || s.status === 'RESCHEDULED');
    }
    if (activeFilter === 'COMPLETED') {
      return panelistSlots.filter((s) => s.status === 'COMPLETED');
    }
    if (activeFilter === 'PENDING_RESCHEDULE') {
      return panelistSlots.filter((s) => s.status === 'RESCHEDULE_REQUESTED');
    }
    return panelistSlots;
  }, [panelistSlots, activeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = panelistSlots.length;
    const upcoming = panelistSlots.filter((s) => s.status === 'SCHEDULED' || s.status === 'RESCHEDULED').length;
    const completed = panelistSlots.filter((s) => s.status === 'COMPLETED').length;
    const pendingReschedules = panelistSlots.filter((s) => s.status === 'RESCHEDULE_REQUESTED').length;
    return { total, upcoming, completed, pendingReschedules };
  }, [panelistSlots]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Open Reschedule Modal
  const handleOpenRescheduleModal = (slot) => {
    setSelectedSlotForReschedule(slot);
    setRescheduleReasonCategory(RESCHEDULE_REASONS[0]);
    setDetailedNotes('');
    
    // Default proposed slot is 2 days later
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 2);
    const dateStr = defaultDate.toISOString().split('T')[0];

    const cleanStart = slot.startTime ? cleanSingleTime(splitTimeRange(slot.startTime).startTime) : '10:00 AM';
    // Strictly enforce standard 1-hour session (60 minutes) instead of 2 hours
    const { time12: cleanEnd } = calculateEndTime(cleanStart, 60);

    setProposedSlots([
      {
        id: 1,
        date: dateStr,
        startTime: to12HourTime(cleanStart),
        endTime: to12HourTime(cleanEnd),
      },
    ]);
    setModalOpen(true);
  };

  // Add another proposed slot
  const handleAddProposedSlot = () => {
    if (proposedSlots.length >= 3) {
      alert('You can propose up to 3 alternative time slots.');
      return;
    }
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + proposedSlots.length + 2);
    const dateStr = defaultDate.toISOString().split('T')[0];
    const defaultStart = proposedSlots.length === 1 ? '02:00 PM' : '04:00 PM';
    const defaultEnd = proposedSlots.length === 1 ? '03:00 PM' : '05:00 PM';

    setProposedSlots([
      ...proposedSlots,
      {
        id: Date.now(),
        date: dateStr,
        startTime: defaultStart,
        endTime: defaultEnd,
      },
    ]);
  };

  // Remove proposed slot
  const handleRemoveProposedSlot = (id) => {
    if (proposedSlots.length === 1) return;
    setProposedSlots(proposedSlots.filter((s) => s.id !== id));
  };

  // Update proposed slot fields (date, etc.)
  const handleUpdateProposedSlot = (id, field, value) => {
    setProposedSlots(
      proposedSlots.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Handle start/end time change from <input type="time">
  const handleSlotTimeChange = (id, field, value24) => {
    if (!value24) return;
    setProposedSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (field === 'startTime') {
          const newStart12 = to12HourTime(value24);
          // Always calculate standard 60 minutes (1 hour) end time
          const { time12: newEnd12 } = calculateEndTime(value24, 60);
          return {
            ...s,
            startTime: newStart12,
            endTime: newEnd12,
          };
        } else if (field === 'endTime') {
          return {
            ...s,
            endTime: to12HourTime(value24),
          };
        }
        return s;
      })
    );
  };

  // Quick duration preset click
  const handleSetDuration = (id, durationMins) => {
    setProposedSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const { time12: newEnd12 } = calculateEndTime(s.startTime, durationMins);
        return {
          ...s,
          endTime: newEnd12,
        };
      })
    );
  };

  // Submit Reschedule Request
  const handleSubmitReschedule = (e) => {
    e.preventDefault();
    if (!selectedSlotForReschedule) return;

    setSubmitting(true);

    const formattedProposed = proposedSlots.map((s, idx) => {
      const dateObj = new Date(s.date);
      const displayDate = isNaN(dateObj.getTime())
        ? s.date
        : dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
      return {
        id: `prop-${idx + 1}-${Date.now()}`,
        date: s.date,
        displayDate,
        startTime: to12HourTime(s.startTime),
        endTime: to12HourTime(s.endTime),
      };
    });

    const result = submitRescheduleRequest({
      slotId: selectedSlotForReschedule.id,
      panelMember: currentPanelist,
      candidateName: selectedSlotForReschedule.candidate?.name || 'Candidate',
      candidateEmail: selectedSlotForReschedule.candidate?.email || 'candidate@example.com',
      jobPosition: selectedSlotForReschedule.jobPosition,
      round: selectedSlotForReschedule.round,
      currentDate: selectedSlotForReschedule.interviewDate,
      currentDisplayDate: selectedSlotForReschedule.displayDate || selectedSlotForReschedule.interviewDate,
      currentTime: formatTimingDisplay(selectedSlotForReschedule.startTime, selectedSlotForReschedule.endTime),
      reasonCategory: rescheduleReasonCategory,
      detailedReason: detailedNotes,
      proposedSlots: formattedProposed,
    });

    if (result.success) {
      setModalOpen(false);
      refreshSlots();
      showToast(`Reschedule request sent for ${selectedSlotForReschedule.candidate?.name}! Recruiter has been notified.`);
    }
    setSubmitting(false);
  };

  // Open Evaluation Modal
  const handleOpenEvaluationModal = (slot) => {
    // If it's not already evaluated and date is upcoming (in future), disallow
    if (!slot.evaluation && !isPastOrToday(slot.interviewDate)) {
      showToast(`Evaluation is locked. This interview is scheduled for ${slot.displayDate || slot.interviewDate}. Evaluations unlock on the interview date.`);
      return;
    }

    setEvalSlot(slot);
    if (slot.evaluation) {
      setEvalScore(slot.evaluation.score || 4);
      setEvalStrengths(slot.evaluation.strengths || '');
      setEvalImprovements(slot.evaluation.improvements || '');
      setEvalRecommendation(slot.evaluation.recommendation || 'HIRE');
    } else {
      setEvalScore(4);
      setEvalStrengths('');
      setEvalImprovements('');
      setEvalRecommendation('HIRE');
    }
    setEvalModalOpen(true);
  };

  const handleSubmitEvaluation = (e) => {
    e.preventDefault();
    if (!evalSlot) return;

    if (!isPastOrToday(evalSlot.interviewDate)) {
      showToast(`Cannot submit evaluation for an upcoming interview. The interview session must take place first.`);
      return;
    }

    const updatedSlots = slots.map((s) => {
      if (s.id === evalSlot.id) {
        return {
          ...s,
          status: 'COMPLETED',
          evaluation: {
            score: evalScore,
            strengths: evalStrengths,
            improvements: evalImprovements,
            recommendation: evalRecommendation,
            evaluatedBy: currentPanelist?.name || 'Panel Member',
            submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          },
        };
      }
      return s;
    });

    setSlots(updatedSlots);
    saveInterviewSlots(updatedSlots);
    setEvalModalOpen(false);
    showToast(`Evaluation recorded successfully for ${evalSlot.candidate?.name}!`);
  };

  return (
    <div className="create-vacancy">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Panel Schedule"
      />
      
      <div className="create-vacancy__main">
        <TopBar
          user={{ name: currentPanelist?.name || 'Panel Member', role: currentPanelist?.role || 'Interviewer' }}
          notificationsCount={stats.pendingReschedules}
          searchPlaceholder="Search interview schedule..."
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <div className="recruiter-content" style={{ padding: '24px 32px 60px' }}>
          {/* Sub Navigation Pill Bar */}
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
                onClick={() => navigate('/recruiter/interviews')}
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
                }}
              >
                <Users size={16} />
                Candidate Allocation
              </button>

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
                <ShieldCheck size={16} />
                <span>Panel Schedule</span>
              </button>
            </div>
          </div>
          {/* ── Page Heading Block (Separated exactly like Allocation UI) ── */}
          <div style={{ marginBottom: '20px' }}>
            <h1 className="interview-page-title" style={{ margin: '0 0 6px 0', fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF' }}>
              Panel Member Interview Portal
            </h1>
            <p className="page-subtitle" style={{ margin: 0, fontSize: '0.88rem', color: '#9599A6' }}>
              View your assigned technical rounds, join live video sessions, and submit reschedule requests when conflicts arise.
            </p>
          </div>

          {/* Top Panel Workspace & Switcher Banner */}
          <div className="panel-hero-card" style={{ padding: '16px 22px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(240, 185, 11, 0.12)',
                border: '1px solid rgba(240, 185, 11, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F0B90B'
              }}>
                <Calendar size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#F0B90B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                  Current Panel Workspace
                </span>
                <span style={{ fontSize: '0.88rem', color: '#D1D5DB' }}>
                  Live video sessions, schedule overview & evaluation status
                </span>
              </div>
            </div>

          {/* Panelist Switcher (Allows testing different interviewers) */}
          <div className="panel-selector-wrap">
            <div className="panelist-pill">
              {currentPanelist && (
                <>
                  <img src={currentPanelist.avatar} alt={currentPanelist.name} className="panelist-avatar" />
                  <div className="panelist-meta">
                    <h3>{currentPanelist.name}</h3>
                    <span>{currentPanelist.department}</span>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="panel-selector-label">Switch Interviewer:</label>
              <select
                className="panel-user-select"
                value={selectedPanelistId}
                onChange={(e) => setSelectedPanelistId(e.target.value)}
              >
                <option value="ALL">👥 All Panel Members (View All)</option>
                {panelMembers.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.role.split('&')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Tabs Bar (Integrated with active counts & review action) */}
        <div className="panel-tabs-bar" style={{ marginTop: '8px' }}>
          <div className="panel-tab-group">
            <button
              className={`panel-tab-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              All Sessions <span className="tab-badge">{panelistSlots.length}</span>
            </button>
            <button
              className={`panel-tab-btn ${activeFilter === 'UPCOMING' ? 'active' : ''}`}
              onClick={() => setActiveFilter('UPCOMING')}
            >
              Upcoming Confirmed <span className="tab-badge">{stats.upcoming}</span>
            </button>
            <button
              className={`panel-tab-btn ${activeFilter === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setActiveFilter('COMPLETED')}
            >
              Completed & Evaluated <span className="tab-badge">{stats.completed}</span>
            </button>
            <button
              className={`panel-tab-btn ${activeFilter === 'PENDING_RESCHEDULE' ? 'active' : ''}`}
              onClick={() => setActiveFilter('PENDING_RESCHEDULE')}
            >
              Reschedule Requested <span className="tab-badge">{stats.pendingReschedules}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-modal-cancel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: stats.pendingReschedules > 0 ? 'rgba(240, 185, 11, 0.15)' : '#16171F',
                color: stats.pendingReschedules > 0 ? '#F0B90B' : '#FFFFFF',
                border: stats.pendingReschedules > 0 ? '1px solid #F0B90B' : '1px solid #2A2C38',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/recruiter/interviews', { state: { openRescheduleModal: true } })}
              title="Review, approve, or adjust reschedule requests in Recruiter Hub"
            >
              <RefreshCw size={14} />
              <span>Review Reschedule Requests</span>
              {stats.pendingReschedules > 0 && (
                <span style={{ backgroundColor: '#F0B90B', color: '#000', borderRadius: '10px', padding: '1px 6px', fontSize: '0.72rem', fontWeight: 800 }}>
                  {stats.pendingReschedules}
                </span>
              )}
            </button>

            <button
              type="button"
              className="btn-modal-cancel"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
              onClick={() => navigate('/recruiter/interviews')}
            >
              <ArrowLeft className="w-4 h-4" /> Recruiter Hub
            </button>
          </div>
        </div>

        {/* Interview Cards List */}
        {filteredSlots.length === 0 ? (
          <div style={{
            background: '#1E222D',
            borderRadius: '14px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #2A2C38',
            color: '#FFFFFF',
          }}>
            <Calendar className="w-12 h-12" style={{ color: '#9599A6', margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#FFFFFF' }}>No interviews found</h3>
            <p style={{ color: '#9599A6', margin: 0, fontSize: '14px' }}>
              No interviews match the current filter for {currentPanelist?.name}.
            </p>
          </div>
        ) : (
          <div className="panel-interviews-list">
            {filteredSlots.map((slot) => {
              const isPendingReschedule = slot.status === 'RESCHEDULE_REQUESTED';
              const isRescheduled = slot.status === 'RESCHEDULED';

              const gcalUrl = generateGoogleCalendarLink({
                title: `${slot.jobPosition} - ${slot.round} Interview (${slot.candidate?.name})`,
                description: `Candidate: ${slot.candidate?.name}\nEmail: ${slot.candidate?.email}\nRound: ${slot.round}\nNotes: ${slot.additionalNotes || 'N/A'}`,
                date: slot.interviewDate,
                startTime: slot.startTime,
                endTime: slot.endTime,
                location: slot.meetingLocation,
              });

              const statusClass = slot.status === 'COMPLETED'
                ? 'status-completed'
                : isPendingReschedule
                ? 'status-reschedule-requested'
                : 'status-scheduled';

              return (
                <div
                  key={slot.id}
                  className={`panel-interview-card ${statusClass}`}
                >
                  {/* Left: Candidate & Position */}
                  <div className="card-left">
                    <div className="candidate-avatar-wrap">
                      <img
                        src={slot.candidate?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={slot.candidate?.name}
                        className="candidate-avatar"
                      />
                      {slot.candidate?.matchScore && (
                        <div className="match-badge">{slot.candidate.matchScore}%</div>
                      )}
                    </div>

                    <div className="candidate-info">
                      <div className="role-tag-row">
                        <span className="role-badge">{slot.jobPosition}</span>
                        <span className="round-badge">{slot.round}</span>
                        {isAllView && slot.panelMember && (
                          <span className="panelist-chip">
                            <User size={12} /> {slot.panelMember.name}
                          </span>
                        )}
                        {slot.status === 'COMPLETED' ? (
                          <span className="status-tag status-tag-completed">
                            <CheckCircle2 size={12} /> Evaluated ({slot.evaluation?.recommendation || 'HIRE'})
                          </span>
                        ) : isPendingReschedule ? (
                          <span className="status-tag status-tag-pending">
                            <Clock size={12} /> Reschedule Pending
                          </span>
                        ) : (
                          <span className="status-tag status-tag-confirmed">
                            <CheckCircle2 size={12} /> Confirmed
                          </span>
                        )}
                      </div>
                      <h3>{slot.candidate?.name}</h3>
                      <p className="candidate-notes">
                        {slot.additionalNotes || 'Technical evaluation session.'}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Standardized Timing Box */}
                  <div className="card-timing-box">
                    <div className="timing-row date-row">
                      <Calendar size={14} className="timing-icon text-accent" />
                      <span className="timing-date-text">{slot.displayDate || slot.interviewDate}</span>
                    </div>
                    <div className="timing-row time-row">
                      <Clock size={13} className="timing-icon text-muted" />
                      <span className="timing-time-text">{formatTimingDisplay(slot.startTime, slot.endTime)}</span>
                    </div>
                    <div className="timing-mode-row">
                      <span className={`timing-mode-pill ${slot.interviewType === 'Physical' ? 'mode-physical' : 'mode-online'}`}>
                        {slot.interviewType === 'Physical' ? '🏢 In-person Suite 102' : '🌐 Online Meet'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Redesigned Premium Actions Box */}
                  <div className="card-actions-box">
                    {slot.status === 'COMPLETED' ? (
                      <>
                        <button
                          type="button"
                          className="btn-primary-action-cta view-eval"
                          onClick={() => handleOpenEvaluationModal(slot)}
                        >
                          <Award size={15} />
                          <span>View Evaluation ({slot.evaluation?.recommendation || 'HIRE'})</span>
                        </button>
                        <div className="card-actions-subrow">
                          <span className="subrow-status-pill completed">
                            <CheckCircle2 size={12} /> Session Concluded &amp; Evaluated
                          </span>
                        </div>
                      </>
                    ) : isPendingReschedule ? (
                      <>
                        <div className="btn-primary-action-cta reschedule-pending">
                          <Clock size={15} />
                          <span>Reschedule Pending Review</span>
                        </div>
                        <div className="card-actions-subrow">
                          <button
                            type="button"
                            className="subrow-action-btn reschedule"
                            onClick={() => navigate('/recruiter/interviews', { state: { openRescheduleModal: true } })}
                            style={{ width: '100%' }}
                            title="Review or Approve in Recruiter Hub"
                          >
                            <RefreshCw size={12} />
                            <span>Review / Approve in Recruiter Hub</span>
                          </button>
                        </div>
                      </>
                    ) : isPastOrToday(slot.interviewDate) ? (
                      <>
                        <button
                          type="button"
                          className="btn-primary-action-cta eval-ready"
                          onClick={() => handleOpenEvaluationModal(slot)}
                        >
                          <ClipboardCheck size={15} />
                          <span>Complete &amp; Evaluate</span>
                        </button>
                        <div className="card-actions-subrow">
                          {slot.meetingLocation && (
                            <a
                              href={slot.meetingLocation}
                              target="_blank"
                              rel="noreferrer"
                              className="subrow-action-btn"
                            >
                              <Video size={13} /> Meeting Link
                            </a>
                          )}
                          <a
                            href={gcalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="subrow-action-btn"
                            title="Add to Google Calendar"
                          >
                            <CalendarPlus size={13} /> Calendar
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        {slot.interviewType === 'Physical' ? (
                          <div className="btn-primary-action-cta in-person" title={slot.meetingLocation || 'Innovation Hub — Suite 102'}>
                            <Building2 size={15} />
                            <span>{slot.meetingLocation || 'Innovation Hub — Suite 102'}</span>
                          </div>
                        ) : (
                          <a
                            href={slot.meetingLocation}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary-action-cta join-call"
                          >
                            <Video size={15} />
                            <span>Join Video Call</span>
                            <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.8 }} />
                          </a>
                        )}
                        <div className="card-actions-subrow">
                          <a
                            href={gcalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="subrow-action-btn"
                            title="Add to Google Calendar"
                          >
                            <CalendarPlus size={13} /> Calendar
                          </a>
                          <button
                            type="button"
                            className="subrow-action-btn reschedule"
                            onClick={() => handleOpenRescheduleModal(slot)}
                            title="Request Reschedule"
                          >
                            <RefreshCw size={12} /> Reschedule
                          </button>
                        </div>
                        <div className="actions-footnote">
                          <Lock size={11} />
                          <span>Evaluation unlocks on {slot.displayDate || slot.interviewDate}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Reschedule Request Modal ── */}
      {modalOpen && selectedSlotForReschedule && (
        <div className="reschedule-modal-overlay">
          <div className="reschedule-modal-box">
            <div className="modal-header">
              <h2>
                <RefreshCw className="w-5 h-5 text-accent" style={{ color: 'var(--accent)' }} />
                Request Interview Reschedule
              </h2>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReschedule}>
              <div className="modal-body">
                {/* Current Interview Summary */}
                <div className="current-interview-summary">
                  <div className="summary-title">Current Scheduled Interview</div>
                  <div className="summary-details">
                    <div className="summary-main">
                      <strong>{selectedSlotForReschedule.candidate?.name}</strong>
                      <p>{selectedSlotForReschedule.jobPosition} • {selectedSlotForReschedule.round}</p>
                    </div>
                    <div className="summary-time">
                      <div className="date">{selectedSlotForReschedule.displayDate || selectedSlotForReschedule.interviewDate}</div>
                      <div className="time">{formatTimingDisplay(selectedSlotForReschedule.startTime, selectedSlotForReschedule.endTime)}</div>
                    </div>
                  </div>
                </div>

                {/* Reason Category */}
                <div className="form-field-group">
                  <label className="form-field-label">
                    <AlertCircle className="w-4 h-4 text-accent" style={{ color: 'var(--accent-dark)' }} />
                    Reason for Reschedule *
                  </label>
                  <select
                    className="form-select"
                    value={rescheduleReasonCategory}
                    onChange={(e) => setRescheduleReasonCategory(e.target.value)}
                    required
                  >
                    {RESCHEDULE_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Proposed New Times */}
                <div className="form-field-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2px' }}>
                    <label className="form-field-label" style={{ marginBottom: 0 }}>
                      <Calendar className="w-4 h-4 text-accent" style={{ color: 'var(--accent-dark)' }} />
                      Propose Available Dates &amp; Times (1 to 3 options) *
                    </label>
                    <span style={{ fontSize: '11px', color: '#9599A6' }}>
                      {proposedSlots.length} of 3 options added
                    </span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#858997', lineHeight: 1.4 }}>
                    Specify your preferred alternative dates and start/end times. The recruiter will select and confirm one of these options.
                  </p>

                  <div className="proposed-slots-container">
                    {proposedSlots.map((propSlot, index) => {
                      const duration = getDurationMinutes(propSlot.startTime, propSlot.endTime);
                      const dateFormatted = (() => {
                        try {
                          if (!propSlot.date) return 'Select date';
                          const dObj = new Date(propSlot.date);
                          return isNaN(dObj.getTime())
                            ? propSlot.date
                            : dObj.toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              });
                        } catch {
                          return propSlot.date;
                        }
                      })();

                      return (
                        <div key={propSlot.id} className="proposed-slot-card">
                          {/* Card Header */}
                          <div className="slot-card-header">
                            <div className="slot-card-title">
                              {proposedSlots.length > 1 && (
                                <span className={`slot-option-badge option-${index + 1}`}>
                                  Option {index + 1}
                                </span>
                              )}
                              <span className="slot-duration-pill">
                                <Clock size={11} /> {formatDurationDisplay(duration)}
                              </span>
                            </div>
                            {proposedSlots.length > 1 && (
                              <button
                                type="button"
                                className="remove-slot-btn-styled"
                                onClick={() => handleRemoveProposedSlot(propSlot.id)}
                                title="Remove this alternative option"
                              >
                                <Trash2 size={13} /> Remove
                              </button>
                            )}
                          </div>

                          {/* Inputs Grid: 3 clearly labeled columns */}
                          <div className="slot-inputs-grid">
                            {/* Column 1: Date */}
                            <div className="slot-input-col">
                              <label className="slot-sublabel">
                                <Calendar size={12} style={{ color: '#F0B90B' }} />
                                <span>Interview Date *</span>
                              </label>
                              <div
                                className="date-picker-input-container"
                                onClick={(e) => {
                                  const input = e.currentTarget.querySelector('input[type="date"]');
                                  if (input && typeof input.showPicker === 'function') {
                                    try { input.showPicker(); } catch (_) {}
                                  }
                                }}
                              >
                                <input
                                  type="date"
                                  className="form-input-styled date-picker-field"
                                  value={propSlot.date}
                                  min={new Date().toISOString().split('T')[0]}
                                  onChange={(e) => handleUpdateProposedSlot(propSlot.id, 'date', e.target.value)}
                                  required
                                />
                                <button
                                  type="button"
                                  className="date-picker-icon-btn"
                                  title="Open Calendar Date Picker"
                                  tabIndex={-1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const container = e.currentTarget.closest('.date-picker-input-container');
                                    const input = container?.querySelector('input[type="date"]');
                                    if (input && typeof input.showPicker === 'function') {
                                      try { input.showPicker(); } catch (_) {}
                                    } else {
                                      input?.focus();
                                    }
                                  }}
                                >
                                  <Calendar size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Column 2: Start Time */}
                            <div className="slot-input-col">
                              <label className="slot-sublabel">
                                <Clock size={12} style={{ color: '#60A5FA' }} />
                                <span>Start Time *</span>
                              </label>
                              <input
                                type="time"
                                className="form-input-styled time-picker-input"
                                value={toTimeInputValue(propSlot.startTime)}
                                onChange={(e) => handleSlotTimeChange(propSlot.id, 'startTime', e.target.value)}
                                required
                              />
                              <span className="time-preview-tag">
                                ⏰ {to12HourTime(propSlot.startTime)}
                              </span>
                            </div>

                            {/* Column 3: End Time */}
                            <div className="slot-input-col">
                              <label className="slot-sublabel">
                                <Clock size={12} style={{ color: '#4ADE80' }} />
                                <span>End Time *</span>
                              </label>
                              <input
                                type="time"
                                className="form-input-styled time-picker-input"
                                value={toTimeInputValue(propSlot.endTime)}
                                onChange={(e) => handleSlotTimeChange(propSlot.id, 'endTime', e.target.value)}
                                required
                              />
                              <span className="time-preview-tag">
                                🏁 {to12HourTime(propSlot.endTime)}
                              </span>
                            </div>
                          </div>

                          {/* Quick Duration Chips Bar */}
                          <div className="slot-presets-bar">
                            <span className="presets-label">Session Duration:</span>
                            <div className="duration-chips">
                              {DURATION_PRESETS.map((dp) => (
                                <button
                                  key={dp.mins}
                                  type="button"
                                  className={`duration-chip-btn ${duration === dp.mins ? 'active' : ''}`}
                                  onClick={() => handleSetDuration(propSlot.id, dp.mins)}
                                >
                                  {dp.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Live Visual Summary Preview */}
                          <div className="slot-summary-strip">
                            <div className="summary-strip-left">
                              <CheckCircle2 size={13} style={{ color: '#4ADE80' }} />
                              <span className="summary-strip-text">
                                <strong>{dateFormatted}</strong> &nbsp;·&nbsp;{' '}
                                <span className="highlight-time">
                                  {to12HourTime(propSlot.startTime)} – {to12HourTime(propSlot.endTime)}
                                </span>{' '}
                                <span className="summary-duration">({formatDurationDisplay(duration)} session)</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {proposedSlots.length < 3 && (
                      <button
                        type="button"
                        className="add-proposed-btn"
                        onClick={handleAddProposedSlot}
                      >
                        <Plus className="w-4 h-4" /> Add Another Alternative Slot ({proposedSlots.length} of 3 added)
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional Note to Recruiter */}
                <div className="form-field-group">
                  <label className="form-field-label">
                    <MessageSquare className="w-4 h-4" />
                    Note for Recruiter / Hiring Coordinator (Optional)
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide additional details regarding the clash or special instructions..."
                    value={detailedNotes}
                    onChange={(e) => setDetailedNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={submitting}
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Send Reschedule Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Interview Evaluation & Feedback ── */}
      {evalModalOpen && evalSlot && (
        <div className="reschedule-modal-overlay" onClick={() => setEvalModalOpen(false)}>
          <div className="reschedule-modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-title-icon" style={{ backgroundColor: 'rgba(240, 185, 11, 0.15)', color: '#F0B90B' }}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2>Interview Evaluation & Feedback</h2>
                  <p>Log evaluation score and hiring recommendation for candidate</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setEvalModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Upcoming Session Lock Warning */}
                {!isPastOrToday(evalSlot.interviewDate) && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#F87171',
                    fontSize: '0.86rem',
                  }}>
                    <Lock size={18} style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '2px' }}>Evaluation Locked for Upcoming Session</strong>
                      <span>This interview is scheduled for {evalSlot.displayDate || evalSlot.interviewDate}. You cannot submit an evaluation before the session date.</span>
                    </div>
                  </div>
                )}

                {/* Candidate & Slot Banner */}
                <div style={{ backgroundColor: '#1E222D', border: '1px solid #2A2C38', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '1rem', fontWeight: 700 }}>
                      {evalSlot.candidate?.name}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#9599A6' }}>
                      {evalSlot.jobPosition} • {evalSlot.round}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.74rem', color: '#F0B90B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Interviewer</span>
                    <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>{evalSlot.panelMember?.name || currentPanelist.name}</span>
                  </div>
                </div>

                {/* Score Selector (1-5 Stars / Rating) */}
                <div className="form-field-group">
                  <label className="form-field-label">Overall Rating / Score (1 - 5 Stars)</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        disabled={!isPastOrToday(evalSlot.interviewDate)}
                        onClick={() => setEvalScore(starVal)}
                        style={{
                          backgroundColor: evalScore >= starVal ? 'rgba(240, 185, 11, 0.2)' : '#16171F',
                          border: `1px solid ${evalScore >= starVal ? '#F0B90B' : '#2A2C38'}`,
                          color: evalScore >= starVal ? '#F0B90B' : '#6B7280',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 700,
                          cursor: !isPastOrToday(evalSlot.interviewDate) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Star size={16} fill={evalScore >= starVal ? '#F0B90B' : 'none'} />
                        {starVal}
                      </button>
                    ))}
                    <span style={{ fontSize: '0.85rem', color: '#F0B90B', fontWeight: 600, marginLeft: '6px' }}>
                      {evalScore === 5 ? 'Exceptional' : evalScore === 4 ? 'Strong' : evalScore === 3 ? 'Average' : 'Below Expectations'}
                    </span>
                  </div>
                </div>

                {/* Strengths & Observations */}
                <div className="form-field-group">
                  <label className="form-field-label">Key Technical Strengths & Observations</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Candidate demonstrated deep knowledge of architecture, clean coding practices, and team communication..."
                    value={evalStrengths}
                    onChange={(e) => setEvalStrengths(e.target.value)}
                    disabled={!isPastOrToday(evalSlot.interviewDate)}
                    required
                  />
                </div>

                {/* Areas for Improvement */}
                <div className="form-field-group">
                  <label className="form-field-label">Areas for Improvement</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Could improve in database indexing concepts and automated testing strategies..."
                    value={evalImprovements}
                    onChange={(e) => setEvalImprovements(e.target.value)}
                    disabled={!isPastOrToday(evalSlot.interviewDate)}
                  />
                </div>

                {/* Recommendation */}
                <div className="form-field-group">
                  <label className="form-field-label">Final Recommendation</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { key: 'HIRE', label: 'Strong Hire / Pass', color: '#4ADE80', bg: 'rgba(34, 197, 94, 0.15)' },
                      { key: 'HOLD', label: 'Hold / Review', color: '#F0B90B', bg: 'rgba(240, 185, 11, 0.15)' },
                      { key: 'REJECT', label: 'Do Not Recommend', color: '#F87171', bg: 'rgba(239, 68, 68, 0.15)' },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.key}
                        disabled={!isPastOrToday(evalSlot.interviewDate)}
                        onClick={() => setEvalRecommendation(opt.key)}
                        style={{
                          backgroundColor: evalRecommendation === opt.key ? opt.bg : '#16171F',
                          border: `1px solid ${evalRecommendation === opt.key ? opt.color : '#2A2C38'}`,
                          color: evalRecommendation === opt.key ? opt.color : '#9599A6',
                          padding: '10px 8px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: !isPastOrToday(evalSlot.interviewDate) ? 'not-allowed' : 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setEvalModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isPastOrToday(evalSlot.interviewDate)}
                  className="btn-modal-submit"
                  style={{
                    backgroundColor: !isPastOrToday(evalSlot.interviewDate) ? '#2A2C38' : '#F0B90B',
                    color: !isPastOrToday(evalSlot.interviewDate) ? '#6B7280' : '#000000',
                    cursor: !isPastOrToday(evalSlot.interviewDate) ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {!isPastOrToday(evalSlot.interviewDate) ? (
                    <>
                      <Lock className="w-4 h-4" /> Locked Until Session Date
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save Evaluation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="panel-toast">
          <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />
          <span>{toastMessage}</span>
        </div>
      )}
      </div>
    </div>
  );
}
