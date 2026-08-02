import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './InterviewTimeSlotManagement.css';

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

const emptyForm = {
  jobPosition: 'Senior Fullstack Engineer',
  interviewRound: 'Technical',
  interviewType: 'Online',
  interviewDate: '',
  startTime: '',
  endTime: '',
  capacity: '',
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
  const [slots, setSlots] = useState(initialSlots);
  const [formData, setFormData] = useState(emptyForm);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [positionFilter, setPositionFilter] = useState(initialSlots[0].jobPosition);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const [viewingSlot, setViewingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const todayInputValue = getTodayInputValue();
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

  const handleFieldChange = event => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
  };

  const handleToggleForm = () => {
    setShowForm(prev => !prev);
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

  const handleEditSlot = slot => {
    setEditingSlotId(slot.id);
    setShowForm(true);
    setFormData({
      jobPosition: slot.jobPosition,
      interviewRound: slot.round,
      interviewType: slot.interviewType,
      interviewDate: toDateInputValue(slot.interviewDate),
      startTime: toTimeInputValue(slot.startTime),
      endTime: toTimeInputValue(slot.endTime),
      capacity: String(slot.capacity),
      meetingLocation: slot.meetingLocation || '',
      additionalNotes: slot.additionalNotes || '',
    });
    setFormError('');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = event => {
    event.preventDefault();
    setFormError('');
    setMessage('');

    if (!formData.interviewDate || !formData.startTime || !formData.endTime || !formData.capacity) {
      setFormError('Interview date, start time, end time, and capacity are required.');
      return;
    }

    const capacityNumber = Number(formData.capacity);
    if (!Number.isInteger(capacityNumber) || capacityNumber < 1) {
      setFormError('Capacity must be a positive whole number.');
      return;
    }

    if (formData.interviewDate < todayInputValue) {
      setFormError('Interview date cannot be in the past.');
      return;
    }

    const startMinutes = timeToMinutes(formData.startTime);
    const endMinutes = timeToMinutes(formData.endTime);
    if (endMinutes <= startMinutes) {
      setFormError('End time must be later than start time.');
      return;
    }

    const hasOverlap = slots.some(slot => {
      if (slot.id === editingSlotId || slot.jobPosition !== formData.jobPosition) return false;
      if (toDateInputValue(slot.interviewDate) !== formData.interviewDate) return false;
      const existingStart = timeToMinutes(slot.startTime);
      const existingEnd = timeToMinutes(slot.endTime);
      return startMinutes < existingEnd && endMinutes > existingStart;
    });
    if (hasOverlap) {
      setFormError('This time overlaps with another slot for the selected job position.');
      return;
    }

    const formattedDate = formatDate(formData.interviewDate);
    const formattedStart = formatTime(formData.startTime);
    const formattedEnd = formatTime(formData.endTime);

    if (editingSlotId) {
      setSlots(current =>
        current.map(slot => {
          if (slot.id === editingSlotId) {
            return {
              ...slot,
              jobPosition: formData.jobPosition,
              round: formData.interviewRound,
              interviewDate: formattedDate,
              startTime: formattedStart,
              endTime: formattedEnd,
              interviewType: formData.interviewType,
              capacity: capacityNumber,
              meetingLocation: formData.meetingLocation,
              additionalNotes: formData.additionalNotes,
              status: capacityNumber <= slot.bookedCount ? 'FULLY BOOKED' : slot.status,
            };
          }
          return slot;
        })
      );
      setMessage('Interview time slot updated successfully.');
      setEditingSlotId(null);
    } else {
      const newSlot = {
        id: slots.length ? Math.max(...slots.map(s => s.id)) + 1 : 1,
        jobPosition: formData.jobPosition,
        round: formData.interviewRound,
        interviewDate: formattedDate,
        startTime: formattedStart,
        endTime: formattedEnd,
        interviewType: formData.interviewType,
        capacity: capacityNumber,
        status: 'AVAILABLE',
        meetingLocation: formData.meetingLocation || 'To be shared with candidate',
        additionalNotes: formData.additionalNotes || 'N/A',
        bookedCount: 0,
      };

      setSlots(current => [newSlot, ...current]);
      setPositionFilter(formData.jobPosition);
      setCurrentPage(1);
      setMessage('Interview time slot created successfully.');
    }

    setFormData(emptyForm);
    setShowForm(false);
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

          {/* ── Sub-navigation Tabs ── */}
          <div className="interview-subnav-tabs">
            <button
              className="subnav-tab-btn is-active"
              onClick={() => navigate('/recruiter/interviews')}
              type="button"
            >
              Time Slot Management
            </button>
            <button
              className="subnav-tab-btn"
              onClick={() => navigate('/recruiter/interviews/allocation')}
              type="button"
            >
              Candidate Allocation
            </button>
            <button
              className="subnav-tab-btn"
              onClick={() => navigate('/recruiter/interviews/invitations')}
              type="button"
            >
              Invitations &amp; Communication
            </button>
            <button
              className="subnav-tab-btn"
              onClick={() => navigate('/recruiter/interviews/evaluation')}
              type="button"
            >
              Panel &amp; Evaluation
            </button>
          </div>

          {/* ── Clean Page Heading ── */}
          <div className="page-heading-block">
            <div>
              <h1 className="interview-page-title">Interview Time Slot Management</h1>
              <p className="page-subtitle">
                Create, manage, and schedule interview availability for candidates.
              </p>
            </div>
            {!showForm && (
              <button
                type="button"
                className="add-slot-trigger"
                onClick={handleToggleForm}
              >
                <Plus size={17} strokeWidth={2.5} />
                <span>Add New Time Slot</span>
              </button>
            )}
          </div>

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
              <span>{formError}</span>
              <button type="button" className="toast-close" onClick={() => setFormError('')}>
                ×
              </button>
            </div>
          )}

          {/* ── Card 1: Time Slot Form Card ── */}
          {showForm && (
            <div className="card-surface form-card-section">
              <div className="card-header-bar">
                <span className="gold-indicator"></span>
                <h2 className="card-title">
                  {editingSlotId ? `Edit Interview Time Slot #${editingSlotId}` : 'Interview Time Slot Form'}
                </h2>
                <button
                  type="button"
                  className="btn-hide-form"
                  onClick={handleToggleForm}
                >
                  {showForm ? '– Hide Form' : '+ Add New Time Slot'}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="slot-form">
                {/* Grid Row 1: 3 columns */}
                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">JOB POSITION</label>
                    <div className="select-input-wrap">
                      <select
                        name="jobPosition"
                        value={formData.jobPosition}
                        onChange={handleFieldChange}
                        className="form-control"
                      >
                        <option value="Senior Fullstack Engineer">Senior Fullstack Engineer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="QA Automation Engineer">QA Automation Engineer</option>
                        <option value="Business Analyst">Business Analyst</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="DevOps Lead">DevOps Lead</option>
                      </select>
                      <span className="select-arrow">▼</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">INTERVIEW ROUND</label>
                    <div className="select-input-wrap">
                      <select
                        name="interviewRound"
                        value={formData.interviewRound}
                        onChange={handleFieldChange}
                        className="form-control"
                      >
                        <option value="Technical">Technical / Coding</option>
                        <option value="HR Screening">HR Screening</option>
                        <option value="HR Portfolio Review">HR Portfolio Review</option>
                        <option value="Technical Case Study">Technical Case Study</option>
                        <option value="Final Cultural Fit">Final Cultural Fit</option>
                        <option value="Architecture Final">Architecture Final</option>
                      </select>
                      <span className="select-arrow">▼</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">INTERVIEW TYPE</label>
                    <div className="select-input-wrap">
                      <select
                        name="interviewType"
                        value={formData.interviewType}
                        onChange={handleFieldChange}
                        className="form-control"
                      >
                        <option value="Online">Online (Google Meet / Zoom)</option>
                        <option value="Physical">Physical (In-Person)</option>
                      </select>
                      <span className="select-arrow">▼</span>
                    </div>
                  </div>
                </div>

                {/* Grid Row 2: 4 columns */}
                <div className="form-grid-4">
                  <div className="form-group">
                    <label className="form-label">INTERVIEW DATE</label>
                    <input
                      type="date"
                      name="interviewDate"
                      min={todayInputValue}
                      value={formData.interviewDate}
                      onChange={handleFieldChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">START TIME</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleFieldChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">END TIME</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleFieldChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CAPACITY</label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      placeholder="e.g. 5"
                      value={formData.capacity}
                      onChange={handleFieldChange}
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Grid Row 3: 2 columns */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">MEETING LINK / LOCATION</label>
                    <input
                      type="text"
                      name="meetingLocation"
                      placeholder="Enter meeting link or physical location..."
                      value={formData.meetingLocation}
                      onChange={handleFieldChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ADDITIONAL NOTES</label>
                    <input
                      type="text"
                      name="additionalNotes"
                      placeholder="Any additional instructions or candidate notes..."
                      value={formData.additionalNotes}
                      onChange={handleFieldChange}
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="form-actions-row">
                  <button type="submit" className="btn-primary-accent">
                    <span>{editingSlotId ? 'Update Time Slot' : 'Save Time Slot'}</span>
                  </button>
                  <button type="button" className="btn-ghost-dark" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Card 2: Scheduled Time Slots Table Card ── */}
          <div className="card-surface table-card-section">
            <div className="table-card-header">
              <div className="card-header-bar">
                <span className="gold-indicator"></span>
                <h2 className="card-title">Scheduled Interview Time Slots</h2>
              </div>
            </div>

            <div className="slot-filter-toolbar">
              <div className="position-selector">
                <label htmlFor="slot-position-filter">Job Position</label>
                <select
                  id="slot-position-filter"
                  value={positionFilter}
                  onChange={e => {
                    setPositionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {jobPositions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
              <span className="slot-count-label">
                {filteredSlots.length} {filteredSlots.length === 1 ? 'slot' : 'slots'}
              </span>
            </div>

            {/* Table Container */}
            <div className="table-responsive">
              <table className="slots-data-table">
                <thead>
                  <tr>
                    <th>Round</th>
                    <th>Date &amp; Time</th>
                    <th>Type</th>
                    <th>Booked / Total</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSlots.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table-cell">
                        <div className="empty-state-box">
                          <p>No interview time slots found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedSlots.map(slot => {
                      const actionsLocked = slot.status === 'FULLY BOOKED' || slot.status === 'COMPLETED';
                      return (
                      <tr key={slot.id}>
                        <td>
                          <div className="round-cell">
                            <ClipboardList size={15} aria-hidden="true" />
                            <span>{slot.round}</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-time-cell">
                            <span><CalendarDays size={14} aria-hidden="true" />{slot.interviewDate}</span>
                            <small>{slot.startTime} – {slot.endTime}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`type-badge type-${slot.interviewType.toLowerCase()}`}>
                            {slot.interviewType}
                          </span>
                        </td>
                        <td>
                          <div className="capacity-cell">
                            <Users size={15} aria-hidden="true" />
                            <span>{slot.bookedCount} / {slot.capacity}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill status-${slot.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {slot.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="action-buttons-wrap">
                            <button
                              type="button"
                              className="action-icon-btn action-view-btn"
                              title="View Details"
                              aria-label={`View slot ${slot.id} details`}
                              onClick={() => setViewingSlot(slot)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn action-edit-btn"
                              title={actionsLocked ? `${slot.status} slots cannot be edited` : 'Edit Slot'}
                              aria-label={`Edit slot ${slot.id}`}
                              disabled={actionsLocked}
                              onClick={() => handleEditSlot(slot)}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn action-delete-btn"
                              title={actionsLocked ? `${slot.status} slots cannot be deleted` : 'Delete Slot'}
                              aria-label={`Delete slot ${slot.id}`}
                              disabled={actionsLocked}
                              onClick={() => setDeletingSlot(slot)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mobile-slot-list">
              {paginatedSlots.length === 0 && (
                <div className="mobile-slot-empty">No interview time slots found for this job position.</div>
              )}
              {paginatedSlots.map(slot => {
                const actionsLocked = slot.status === 'FULLY BOOKED' || slot.status === 'COMPLETED';
                return (
                  <article className="mobile-slot-card" key={`mobile-${slot.id}`}>
                    <div className="mobile-slot-card__header">
                      <div className="round-cell">
                        <ClipboardList size={16} aria-hidden="true" />
                        <strong>{slot.round}</strong>
                      </div>
                      <span className={`status-pill status-${slot.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {slot.status}
                      </span>
                    </div>
                    <div className="mobile-slot-card__details">
                      <span><CalendarDays size={15} /> {slot.interviewDate}</span>
                      <span>{slot.startTime} – {slot.endTime}</span>
                      <span className={`type-badge type-${slot.interviewType.toLowerCase()}`}>{slot.interviewType}</span>
                      <span><Users size={15} /> {slot.bookedCount} / {slot.capacity} booked</span>
                    </div>
                    <div className="mobile-slot-card__actions">
                      <button type="button" className="mobile-slot-action mobile-slot-view" onClick={() => setViewingSlot(slot)}>
                        <Eye size={15} /> View
                      </button>
                      <button type="button" className="mobile-slot-action mobile-slot-edit" disabled={actionsLocked} onClick={() => handleEditSlot(slot)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button type="button" className="mobile-slot-action mobile-slot-delete" disabled={actionsLocked} onClick={() => setDeletingSlot(slot)}>
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination & Summary Footer */}
            {filteredSlots.length > itemsPerPage && (
              <div className="table-pagination-footer">
              <span className="pagination-info">
                Showing {filteredSlots.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
                {Math.min(currentPage * itemsPerPage, filteredSlots.length)} of {filteredSlots.length} interview time slots
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`page-num-btn ${currentPage === pageNum ? 'active-page' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              </div>
            )}
          </div>

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
                <span className="detail-label">Date & Time:</span>
                <span className="detail-val">
                  {viewingSlot.interviewDate} ({viewingSlot.startTime} - {viewingSlot.endTime})
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="detail-label">Type & Capacity:</span>
                <span className="detail-val">
                  {viewingSlot.interviewType} | {viewingSlot.bookedCount}/{viewingSlot.capacity} candidates booked
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
            <div className="modal-footer">
              <button type="button" className="btn-primary-accent" onClick={() => setViewingSlot(null)}>
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
    </div>
  );
}

export default RecruiterInterviewTimeSlotManagementPage;
