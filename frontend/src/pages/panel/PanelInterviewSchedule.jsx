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
} from 'lucide-react';
import {
  getInterviewSlots,
  getPanelMembers,
  submitRescheduleRequest,
  generateGoogleCalendarLink,
} from '../../services/interviewService';
import TopBar from '../../components/TopBar/TopBar';
import RecruiterSidebar from '../../components/common/RecruiterSidebar';
import './PanelInterviewSchedule.css';

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
  const [selectedPanelistId, setSelectedPanelistId] = useState('');
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

  // Load data on mount
  useEffect(() => {
    const loadedPanelists = getPanelMembers();
    setPanelMembers(loadedPanelists);
    if (loadedPanelists.length > 0) {
      setSelectedPanelistId(loadedPanelists[0].id);
    }
    refreshSlots();
  }, []);

  const refreshSlots = () => {
    const allSlots = getInterviewSlots();
    setSlots(allSlots);
  };

  const currentPanelist = useMemo(() => {
    return panelMembers.find((p) => p.id === selectedPanelistId) || panelMembers[0];
  }, [panelMembers, selectedPanelistId]);

  // Filter slots for the active panelist
  const panelistSlots = useMemo(() => {
    if (!currentPanelist) return [];
    return slots.filter((slot) => slot.panelMember?.id === currentPanelist.id || slot.panelMember?.email === currentPanelist.email);
  }, [slots, currentPanelist]);

  // Sub-filter tabs
  const filteredSlots = useMemo(() => {
    if (activeFilter === 'UPCOMING') {
      return panelistSlots.filter((s) => s.status === 'SCHEDULED' || s.status === 'RESCHEDULED');
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
    const pendingReschedules = panelistSlots.filter((s) => s.status === 'RESCHEDULE_REQUESTED').length;
    return { total, upcoming, pendingReschedules };
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
    
    // Default proposed slot is 1 or 2 days later
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 2);
    const dateStr = defaultDate.toISOString().split('T')[0];

    setProposedSlots([
      {
        id: 1,
        date: dateStr,
        startTime: slot.startTime || '10:00 AM',
        endTime: slot.endTime || '11:00 AM',
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
    setProposedSlots([
      ...proposedSlots,
      {
        id: Date.now(),
        date: defaultDate.toISOString().split('T')[0],
        startTime: '02:00 PM',
        endTime: '03:00 PM',
      },
    ]);
  };

  // Remove proposed slot
  const handleRemoveProposedSlot = (id) => {
    if (proposedSlots.length === 1) return;
    setProposedSlots(proposedSlots.filter((s) => s.id !== id));
  };

  // Update proposed slot fields
  const handleUpdateProposedSlot = (id, field, value) => {
    setProposedSlots(
      proposedSlots.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Submit Reschedule Request
  const handleSubmitReschedule = (e) => {
    e.preventDefault();
    if (!selectedSlotForReschedule) return;

    setSubmitting(true);

    const formattedProposed = proposedSlots.map((s, idx) => {
      const dateObj = new Date(s.date);
      const displayDate = dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return {
        id: `prop-${idx + 1}-${Date.now()}`,
        date: s.date,
        displayDate,
        startTime: s.startTime,
        endTime: s.endTime,
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
      currentTime: `${selectedSlotForReschedule.startTime} - ${selectedSlotForReschedule.endTime}`,
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

  return (
    <div className="create-vacancy">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Panel Schedule & Reschedules"
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
                Time Slot Management
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
                <span>Panel Schedule & Reschedules</span>
              </button>
            </div>
          </div>
        {/* Top Hero Banner */}
        <div className="panel-hero-card">
          <div className="panel-hero-info">
            <h1>
              <ShieldCheck className="w-7 h-7 text-accent" style={{ color: 'var(--accent)' }} />
              Panel Member Interview Portal
            </h1>
            <p>
              View your assigned technical rounds, join live video sessions, and submit reschedule requests when conflicts arise.
            </p>
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
                {panelMembers.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.role.split('&')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="panel-stats-grid">
          <div className="panel-stat-card">
            <div className="panel-stat-icon blue">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="panel-stat-info">
              <span>Total Assigned</span>
              <h2>{stats.total}</h2>
            </div>
          </div>

          <div className="panel-stat-card">
            <div className="panel-stat-icon green">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="panel-stat-info">
              <span>Upcoming Confirmed</span>
              <h2>{stats.upcoming}</h2>
            </div>
          </div>

          <div className="panel-stat-card">
            <div className="panel-stat-icon gold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="panel-stat-info">
              <span>Reschedule Pending</span>
              <h2>{stats.pendingReschedules}</h2>
            </div>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="panel-tabs-bar">
          <div className="panel-tab-group">
            <button
              className={`panel-tab-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              All Interviews <span className="tab-badge">{panelistSlots.length}</span>
            </button>
            <button
              className={`panel-tab-btn ${activeFilter === 'UPCOMING' ? 'active' : ''}`}
              onClick={() => setActiveFilter('UPCOMING')}
            >
              Confirmed Active <span className="tab-badge">{stats.upcoming}</span>
            </button>
            <button
              className={`panel-tab-btn ${activeFilter === 'PENDING_RESCHEDULE' ? 'active' : ''}`}
              onClick={() => setActiveFilter('PENDING_RESCHEDULE')}
            >
              Reschedule Requested <span className="tab-badge">{stats.pendingReschedules}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn-modal-cancel"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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

              return (
                <div
                  key={slot.id}
                  className={`panel-interview-card ${isPendingReschedule ? 'pending-reschedule' : ''} ${isRescheduled ? 'rescheduled-done' : ''}`}
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
                        {isPendingReschedule && (
                          <span className="status-tag reschedule_requested">
                            <Clock className="w-3 h-3" /> Reschedule Pending
                          </span>
                        )}
                        {isRescheduled && (
                          <span className="status-tag rescheduled">
                            <CheckCircle2 className="w-3 h-3" /> Rescheduled
                          </span>
                        )}
                        {!isPendingReschedule && !isRescheduled && (
                          <span className="status-tag scheduled">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        )}
                      </div>
                      <h3>{slot.candidate?.name}</h3>
                      <p className="candidate-notes">
                        {slot.additionalNotes || 'Technical evaluation session.'}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Timing Details */}
                  <div className="card-timing">
                    <div className="timing-item date">
                      <Calendar className="w-4 h-4" />
                      <span>{slot.displayDate || slot.interviewDate}</span>
                    </div>
                    <div className="timing-item">
                      <Clock className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="card-actions">
                    {/* Google Meet Link */}
                    {slot.meetingLocation && (
                      <a
                        href={slot.meetingLocation}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-meet-join"
                      >
                        <Video className="w-4 h-4" /> Join Call
                      </a>
                    )}

                    {/* Google Calendar Link */}
                    <a
                      href={gcalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-gcal"
                      title="Add to Google Calendar"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </a>

                    {/* Request Reschedule Trigger */}
                    {isPendingReschedule ? (
                      <button className="btn-reschedule-trigger pending" disabled>
                        <Clock className="w-4 h-4" /> Awaiting HR Review
                      </button>
                    ) : (
                      <button
                        className="btn-reschedule-trigger"
                        onClick={() => handleOpenRescheduleModal(slot)}
                      >
                        <RefreshCw className="w-4 h-4" /> Request Reschedule
                      </button>
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
                      <div className="time">{selectedSlotForReschedule.startTime} - {selectedSlotForReschedule.endTime}</div>
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
                  <label className="form-field-label">
                    <Calendar className="w-4 h-4" />
                    Propose Your Available Dates & Times (1 to 3 options) *
                  </label>
                  <div className="proposed-slots-container">
                    {proposedSlots.map((propSlot, index) => (
                      <div key={propSlot.id} className="proposed-slot-row">
                        <input
                          type="date"
                          className="form-input"
                          value={propSlot.date}
                          onChange={(e) => handleUpdateProposedSlot(propSlot.id, 'date', e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 10:00 AM"
                          value={propSlot.startTime}
                          onChange={(e) => handleUpdateProposedSlot(propSlot.id, 'startTime', e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 11:00 AM"
                          value={propSlot.endTime}
                          onChange={(e) => handleUpdateProposedSlot(propSlot.id, 'endTime', e.target.value)}
                          required
                        />
                        {proposedSlots.length > 1 && (
                          <button
                            type="button"
                            className="remove-slot-btn"
                            onClick={() => handleRemoveProposedSlot(propSlot.id)}
                            title="Remove this proposed slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    {proposedSlots.length < 3 && (
                      <button
                        type="button"
                        className="add-proposed-btn"
                        onClick={handleAddProposedSlot}
                      >
                        <Plus className="w-4 h-4" /> Add Another Alternative Slot
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
