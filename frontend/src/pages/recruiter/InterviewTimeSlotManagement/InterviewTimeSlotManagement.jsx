import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InterviewTimeSlotManagement.css';

const initialSlots = [
  {
    id: 1,
    jobPosition: 'Senior Fullstack Engineer',
    round: 'Technical',
    interviewDate: '25 Jul 2026',
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
    id: 2,
    jobPosition: 'UI/UX Designer',
    round: 'HR Portfolio Review',
    interviewDate: '25 Jul 2026',
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
    interviewDate: '26 Jul 2026',
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
    interviewDate: '27 Jul 2026',
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
    interviewDate: '28 Jul 2026',
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
    interviewDate: '29 Jul 2026',
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

function RecruiterInterviewTimeSlotManagementPage() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState(initialSlots);
  const [formData, setFormData] = useState(emptyForm);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const [viewingSlot, setViewingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtered Slots
  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        slot.jobPosition.toLowerCase().includes(query) ||
        slot.round.toLowerCase().includes(query) ||
        slot.status.toLowerCase().includes(query) ||
        slot.interviewType.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || slot.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || slot.interviewType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [slots, searchQuery, statusFilter, typeFilter]);

  // Paginated Slots
  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage) || 1;
  const paginatedSlots = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSlots.slice(start, start + itemsPerPage);
  }, [filteredSlots, currentPage]);

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
      interviewDate: slot.interviewDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: String(slot.capacity),
      meetingLocation: slot.meetingLocation || '',
      additionalNotes: slot.additionalNotes || '',
    });
    setFormError('');
    setMessage(`Editing slot #${slot.id}`);
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
      setMessage('Interview time slot created successfully.');
    }

    setFormData(emptyForm);
  };

  const confirmDeleteSlot = () => {
    if (deletingSlot) {
      setSlots(current => current.filter(slot => slot.id !== deletingSlot.id));
      setMessage(`Slot #${deletingSlot.id} deleted successfully.`);
      setDeletingSlot(null);
    }
  };

  return (
    <div className="recruiter-layout">
      {/* ── Fixed Sidebar Navigation ── */}
      <aside className="recruiter-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              <rect x="2" y="6" width="20" height="14" rx="2"></rect>
            </svg>
          </div>
          <span className="brand-name">IntelliHire</span>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>
          <button className="nav-item" type="button">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </button>
          <button className="nav-item" type="button">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Job Posts</span>
          </button>
          <button className="nav-item" type="button">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Candidates</span>
          </button>
          <button className="nav-item" type="button">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Assessments</span>
          </button>
          <button className="nav-item is-active" type="button">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <polyline points="9 16 11 18 15 14"></polyline>
            </svg>
            <span>Interviews</span>
          </button>

          <div className="nav-section-label">INSIGHTS</div>
          <button className="nav-item" type="button">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Analytics</span>
          </button>
          <button className="nav-item" type="button">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="recruiter-main">

        {/* ── TOP NAV BAR: Search LEFT | Notification + Profile RIGHT ── */}
        <div className="recruiter-topbar">
          <div className="topbar-search-wrap">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="topbar-search-input"
              placeholder="Search assessments, roles, or candidates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-right-group">
            <button className="icon-btn" type="button" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="notification-dot"></span>
            </button>

            <div className="recruiter-profile-stack">
              <div className="recruiter-avatar">AP</div>
              <div className="recruiter-info">
                <span className="recruiter-name">Alexander Pierce</span>
                <span className="recruiter-role">Talent Acquisition Lead</span>
              </div>
            </div>
          </div>
        </div>

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
          </div>

          {/* ── Clean Page Heading ── */}
          <div className="page-heading-block">
            <h1 className="page-title">Interview Time Slot Management</h1>
            <p className="page-subtitle">
              Create, manage, and schedule interview availability for shortlisted candidates.
            </p>
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

          {/* ── Add New Slot Button (visible when form is hidden) ── */}
          {!showForm && (
            <div className="page-action-bar">
              <button
                type="button"
                className="btn-primary-accent"
                onClick={handleToggleForm}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add New Time Slot</span>
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

              <div className="table-header-controls">
                <div className="table-search-box">
                  <input
                    type="text"
                    placeholder="Search slots..."
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="table-search-input"
                  />
                </div>

                <div className="filter-dropdown-container">
                  <button
                    type="button"
                    className={`btn-table-action ${statusFilter !== 'ALL' || typeFilter !== 'ALL' ? 'active-filter' : ''}`}
                    onClick={() => setShowFilterDropdown(prev => !prev)}
                  >
                    <span>Filter</span>
                    {(statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
                      <span className="filter-badge-dot"></span>
                    )}
                  </button>

                  {showFilterDropdown && (
                    <div className="filter-dropdown-menu">
                      <div className="filter-section">
                        <label className="filter-label">STATUS</label>
                        <select
                          value={statusFilter}
                          onChange={e => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="filter-select"
                        >
                          <option value="ALL">All Statuses</option>
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="FULLY BOOKED">FULLY BOOKED</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </div>

                      <div className="filter-section">
                        <label className="filter-label">INTERVIEW TYPE</label>
                        <select
                          value={typeFilter}
                          onChange={e => {
                            setTypeFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="filter-select"
                        >
                          <option value="ALL">All Types</option>
                          <option value="Online">Online</option>
                          <option value="Physical">Physical</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        className="btn-clear-filters"
                        onClick={() => {
                          setStatusFilter('ALL');
                          setTypeFilter('ALL');
                          setShowFilterDropdown(false);
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="table-responsive">
              <table className="slots-data-table">
                <thead>
                  <tr>
                    <th>Job Position</th>
                    <th>Round</th>
                    <th>Interview Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSlots.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="empty-table-cell">
                        <div className="empty-state-box">
                          <p>No interview time slots found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedSlots.map(slot => (
                      <tr key={slot.id}>
                        <td className="font-semibold text-white">{slot.jobPosition}</td>
                        <td>
                          <div className="round-cell">
                            <span>📋 {slot.round}</span>
                          </div>
                        </td>
                        <td>{slot.interviewDate}</td>
                        <td className="time-cell">{slot.startTime}</td>
                        <td className="time-cell">{slot.endTime}</td>
                        <td>
                          <span className={`type-badge type-${slot.interviewType.toLowerCase()}`}>
                            {slot.interviewType}
                          </span>
                        </td>
                        <td>
                          <div className="capacity-cell">
                            <span>👥 {slot.capacity}</span>
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
                              className="action-icon-btn"
                              title="View Details"
                              onClick={() => setViewingSlot(slot)}
                            >
                              👁
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn"
                              title="Edit Slot"
                              onClick={() => handleEditSlot(slot)}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn action-delete-btn"
                              title="Delete Slot"
                              onClick={() => setDeletingSlot(slot)}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Summary Footer */}
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
                >
                  Previous
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
                >
                  Next
                </button>
              </div>
            </div>
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
            <div className="modal-footer">
              <button type="button" className="btn-ghost-dark" onClick={() => setDeletingSlot(null)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={confirmDeleteSlot}>
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
