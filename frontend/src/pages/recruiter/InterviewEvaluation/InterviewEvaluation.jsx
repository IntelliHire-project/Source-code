import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Edit2,
  RotateCcw,
  Save,
  Send,
  Search,
  CalendarDays,
  Clock3,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './InterviewEvaluation.css';

// ─── Synchronized Candidate Data ──────────────────────────────────────────────
const CANDIDATES = [
  { name: 'Alice Fernando', role: 'Senior Fullstack Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { name: 'Kamal Perera', role: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { name: 'Nimal Silva', role: 'QA Automation Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { name: 'Sara Jayawardena', role: 'Business Analyst', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { name: 'Ruwan Bandara', role: 'Product Manager', avatar: null },
  { name: 'Dilhani Wickramasinghe', role: 'DevOps Lead', avatar: null },
];

const JOB_POSITIONS = [
  'Senior Fullstack Engineer',
  'UI/UX Designer',
  'QA Automation Engineer',
  'Business Analyst',
  'Product Manager',
  'DevOps Lead',
];

const INTERVIEW_ROUNDS = [
  'Technical',
  'HR Portfolio Review',
  'Final Cultural Fit',
  'Technical Case Study',
  'HR Screening',
  'Architecture Final',
];

const PANEL_MEMBERS = [
  'J. Silva (Tech Lead)',
  'K. Perera (Senior Dev)',
  'M. Dias (HR Manager)',
  'R. Fernando (Engineering VP)',
  'T. Kumara (Senior QA)',
  'S. Ali (Product Director)',
  'N. Gupta (HR Lead)',
];

// ─── Initial Evaluation Records ───────────────────────────────────────────────
const INITIAL_RECORDS = [
  {
    id: 'EVL-001',
    candidateName: 'Alice Fernando',
    candidateRole: 'Senior Fullstack Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    panel: ['J. Silva (Tech Lead)', 'K. Perera (Senior Dev)', 'N. Gupta (HR Lead)'],
    interviewRound: 'Technical',
    interviewDate: '03 Aug 2026',
    commSkills: 4,
    techSkills: 5,
    problemSolving: 4,
    teamwork: 4,
    overallRating: 4,
    remarks: 'Excellent knowledge of React, Node.js microservices, and system design. Communicates clearly under pressure.',
    recommendation: 'Hire',
    status: 'Completed',
  },
  {
    id: 'EVL-002',
    candidateName: 'Kamal Perera',
    candidateRole: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    panel: ['M. Dias (HR Manager)', 'R. Fernando (Engineering VP)', 'S. Ali (Product Director)'],
    interviewRound: 'HR Portfolio Review',
    interviewDate: '03 Aug 2026',
    commSkills: 4,
    techSkills: 3,
    problemSolving: 4,
    teamwork: 5,
    overallRating: 4,
    remarks: 'Strong portfolio with excellent user-centered design thinking. Minor gaps in design system experience.',
    recommendation: 'Hold',
    status: 'In Review',
  },
  {
    id: 'EVL-003',
    candidateName: 'Nimal Silva',
    candidateRole: 'QA Automation Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    panel: ['J. Silva (Tech Lead)', 'K. Perera (Senior Dev)', 'N. Gupta (HR Lead)'],
    interviewRound: 'Final Cultural Fit',
    interviewDate: '04 Aug 2026',
    commSkills: 3,
    techSkills: 4,
    problemSolving: 3,
    teamwork: 4,
    overallRating: 3,
    remarks: 'Good automation skills but showed some difficulty with cross-functional collaboration scenarios.',
    recommendation: 'Reject',
    status: 'Draft',
  },
  {
    id: 'EVL-004',
    candidateName: 'Sara Jayawardena',
    candidateRole: 'Business Analyst',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    panel: ['M. Dias (HR Manager)', 'T. Kumara (Senior QA)', 'S. Ali (Product Director)'],
    interviewRound: 'Technical Case Study',
    interviewDate: '05 Aug 2026',
    commSkills: 5,
    techSkills: 4,
    problemSolving: 5,
    teamwork: 5,
    overallRating: 5,
    remarks: 'Outstanding case study presentation. Identified pain points with remarkable analytical precision.',
    recommendation: 'Hire',
    status: 'Pending',
  },
  {
    id: 'EVL-005',
    candidateName: 'Ruwan Bandara',
    candidateRole: 'Product Manager',
    avatar: null,
    panel: ['J. Silva (Tech Lead)', 'K. Perera (Senior Dev)', 'N. Gupta (HR Lead)'],
    interviewRound: 'HR Screening',
    interviewDate: '06 Aug 2026',
    commSkills: 4,
    techSkills: 3,
    problemSolving: 4,
    teamwork: 4,
    overallRating: 4,
    remarks: 'Great product vision and stakeholder management experience. Background aligns well with team culture.',
    recommendation: 'Hold',
    status: 'In Review',
  },
  {
    id: 'EVL-006',
    candidateName: 'Dilhani Wickramasinghe',
    candidateRole: 'DevOps Lead',
    avatar: null,
    panel: ['J. Silva (Tech Lead)', 'K. Perera (Senior Dev)', 'N. Gupta (HR Lead)'],
    interviewRound: 'Architecture Final',
    interviewDate: '07 Aug 2026',
    commSkills: 4,
    techSkills: 5,
    problemSolving: 5,
    teamwork: 3,
    overallRating: 5,
    remarks: 'Exceptional architecture knowledge and CI/CD pipeline design. Best candidate for the DevOps Lead role.',
    recommendation: 'Hire',
    status: 'Completed',
  },
];

const EMPTY_FORM = {
  jobPosition: 'Senior Fullstack Engineer',
  interviewRound: 'Technical',
  interviewDate: '2026-08-03',
  interviewTime: '09:00',
  panelMember1: 'J. Silva (Tech Lead)',
  panelMember2: 'K. Perera (Senior Dev)',
  hrRepresentative: 'N. Gupta (HR Lead)',
  candidateName: 'Alice Fernando',
  commSkills: 4,
  techSkills: 5,
  problemSolving: 4,
  teamwork: 4,
  overallRating: 4,
  remarks: '',
  recommendation: 'Hire',
};

// ─── Star Rating Component ─────────────────────────────────────────────────
function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hovered || value) ? 'filled' : ''}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          disabled={readOnly}
          aria-label={`${star} star`}
        >
          <Star size={16} fill={star <= (hovered || value) ? '#F0B90B' : 'none'} />
        </button>
      ))}
    </div>
  );
}

// ─── Avatar Component ──────────────────────────────────────────────────────
function CandidateAvatar({ name, avatar, size = 36 }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const colors = ['#F0B90B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316'];
  const color = colors[name.charCodeAt(0) % colors.length];
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="record-avatar-img"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <div
      className="record-avatar-fallback"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

// ─── Recommendation Badge ──────────────────────────────────────────────────
function RecBadge({ value }) {
  const map = {
    Hire: 'rec-hire',
    Hold: 'rec-hold',
    Reject: 'rec-reject',
  };
  return <span className={`rec-badge ${map[value] || ''}`}>{value}</span>;
}

// ─── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ value }) {
  const map = {
    Completed: 'status-completed',
    'In Review': 'status-inreview',
    Draft: 'status-draft',
    Pending: 'status-pending',
  };
  return <span className={`status-badge ${map[value] || ''}`}>{value}</span>;
}

function PanelSummary({ members }) {
  const [activeMember, setActiveMember] = useState(null);
  return (
    <div className="panel-summary">
      <div className="panel-avatar-stack">
        {members.slice(0, 3).map((member, index) => {
          const displayName = member.split(' (')[0];
          const initials = displayName
            .split(/\s+/)
            .map((part) => part.replace('.', '').charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return (
            <button
              type="button"
              className={`panel-member-avatar panel-member-avatar-${index + 1}`}
              key={member}
              title={member}
              aria-label={`Show panel member ${member}`}
              onClick={(event) => {
                event.stopPropagation();
                setActiveMember(activeMember === member ? null : member);
              }}
            >
              {initials}
            </button>
          );
        })}
      </div>
      {activeMember && (
        <span className="panel-member-popover" role="status">
          {activeMember}
        </span>
      )}
    </div>
  );
}

function toDateInputValue(dateValue) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue || '')) return dateValue;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDisplayDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Main Page ─────────────────────────────────────────────────────────────
function InterviewEvaluationPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [viewRecord, setViewRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const ITEMS_PER_PAGE = 5;

  // ── Derived candidate info from form selection ──
  const selectedCandidate = CANDIDATES.find((c) => c.name === formData.candidateName) || CANDIDATES[0];

  // ── Filtered records ──
  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.candidateName.toLowerCase().includes(q) ||
        r.candidateRole.toLowerCase().includes(q) ||
        r.interviewRound.toLowerCase().includes(q) ||
        r.recommendation.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [records, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecords, currentPage]);

  const showToast = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
  };

  useEffect(() => {
    if (!message) return undefined;
    const timeoutId = window.setTimeout(() => setMessage(''), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    if (name === 'candidateName') {
      const candidate = CANDIDATES.find((item) => item.name === value);
      setFormData((prev) => ({
        ...prev,
        candidateName: value,
        jobPosition: candidate?.role || prev.jobPosition,
      }));
      return;
    }
    if (name === 'jobPosition') {
      const candidate = CANDIDATES.find((item) => item.role === value);
      setFormData((prev) => ({
        ...prev,
        jobPosition: value,
        candidateName: candidate?.name || prev.candidateName,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const validateEvaluation = (requireRemarks = false) => {
    const panel = [formData.panelMember1, formData.panelMember2, formData.hrRepresentative];
    if (new Set(panel).size !== panel.length) {
      showToast('Each panel member must be unique.', 'error');
      return false;
    }
    if (!formData.interviewDate || !formData.interviewTime) {
      showToast('Interview date and time are required.', 'error');
      return false;
    }
    const interviewDate = new Date(`${formData.interviewDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (interviewDate < today) {
      showToast('Interview date cannot be in the past.', 'error');
      return false;
    }
    if (requireRemarks && !formData.remarks.trim()) {
      showToast('Please enter interview remarks before submitting.', 'error');
      return false;
    }
    const duplicate = records.some(
      (record) =>
        record.id !== editingId &&
        record.candidateName === formData.candidateName &&
        record.interviewRound === formData.interviewRound
    );
    if (duplicate) {
      showToast('An evaluation already exists for this candidate and interview round.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateEvaluation(false)) return;
    const candidate = CANDIDATES.find((c) => c.name === formData.candidateName) || CANDIDATES[0];
    const newRecord = {
      id: editingId || `EVL-${String(Math.max(...records.map((record) => Number(record.id.split('-')[1]))) + 1).padStart(3, '0')}`,
      candidateName: formData.candidateName,
      candidateRole: candidate.role,
      avatar: candidate.avatar,
      panel: [formData.panelMember1, formData.panelMember2, formData.hrRepresentative].filter(Boolean),
      interviewRound: formData.interviewRound,
      interviewDate: formatDisplayDate(formData.interviewDate),
      commSkills: formData.commSkills,
      techSkills: formData.techSkills,
      problemSolving: formData.problemSolving,
      teamwork: formData.teamwork,
      overallRating: formData.overallRating,
      remarks: formData.remarks,
      recommendation: formData.recommendation,
      status: 'Draft',
    };

    if (editingId) {
      setRecords((prev) => prev.map((r) => (r.id === editingId ? { ...newRecord, status: r.status } : r)));
      showToast(`Evaluation for ${formData.candidateName} updated successfully.`);
    } else {
      setRecords((prev) => [newRecord, ...prev]);
      showToast(`Evaluation for ${formData.candidateName} saved as draft.`);
    }
    
    localStorage.setItem('interview_panel_created', 'true');
    if (localStorage.getItem('scheduling_pending') === 'true') {
      localStorage.removeItem('scheduling_pending');
      setTimeout(() => {
        navigate('/recruiter/applicants/ranked');
      }, 1500);
    }
    
    handleReset();
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!validateEvaluation(true)) return;
    const candidate = CANDIDATES.find((c) => c.name === formData.candidateName) || CANDIDATES[0];
    const newRecord = {
      id: editingId || `EVL-${String(Math.max(...records.map((record) => Number(record.id.split('-')[1]))) + 1).padStart(3, '0')}`,
      candidateName: formData.candidateName,
      candidateRole: candidate.role,
      avatar: candidate.avatar,
      panel: [formData.panelMember1, formData.panelMember2, formData.hrRepresentative].filter(Boolean),
      interviewRound: formData.interviewRound,
      interviewDate: formatDisplayDate(formData.interviewDate),
      commSkills: formData.commSkills,
      techSkills: formData.techSkills,
      problemSolving: formData.problemSolving,
      teamwork: formData.teamwork,
      overallRating: formData.overallRating,
      remarks: formData.remarks,
      recommendation: formData.recommendation,
      status: 'Pending',
    };

    if (editingId) {
      setRecords((prev) => prev.map((r) => (r.id === editingId ? newRecord : r)));
      showToast(`Evaluation for ${formData.candidateName} submitted for review.`);
    } else {
      setRecords((prev) => [newRecord, ...prev]);
      showToast(`Evaluation for ${formData.candidateName} submitted successfully.`);
    }
    
    localStorage.setItem('interview_panel_created', 'true');
    if (localStorage.getItem('scheduling_pending') === 'true') {
      localStorage.removeItem('scheduling_pending');
      setTimeout(() => {
        navigate('/recruiter/applicants/ranked');
      }, 1500);
    }
    
    handleReset();
    setShowForm(false);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setFormData({
      jobPosition: record.candidateRole,
      interviewRound: record.interviewRound,
      interviewDate: toDateInputValue(record.interviewDate),
      interviewTime: '09:00',
      panelMember1: record.panel[0] || '',
      panelMember2: record.panel[1] || '',
      hrRepresentative: record.panel[2] || '',
      candidateName: record.candidateName,
      commSkills: record.commSkills,
      techSkills: record.techSkills,
      problemSolving: record.problemSolving,
      teamwork: record.teamwork,
      overallRating: record.overallRating,
      remarks: record.remarks,
      recommendation: record.recommendation,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="create-vacancy">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Panel & Evaluation"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          searchPlaceholder="Search assessments, roles, or candidates..."
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <div className="recruiter-content">

          {/* ── Sub-navigation Tabs ── */}
          <div className="interview-subnav-tabs">
            <button
              className="subnav-tab-btn"
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
              className="subnav-tab-btn is-active"
              onClick={() => navigate('/recruiter/interviews/evaluation')}
              type="button"
            >
              Panel &amp; Evaluation
            </button>
          </div>

          {/* ── Page Heading + Action Button ── */}
          <div className="eval-page-header">
            <div className="eval-heading-copy">
              <h1 className="page-title">Interview Panel &amp; Evaluation Management</h1>
              <p className="page-subtitle">
                Assign interview panels and record candidate evaluation results.
              </p>
            </div>
            <button
              type="button"
              className="eval-assign-trigger"
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                  handleReset();
                } else {
                  handleReset();
                  setShowForm(true);
                }
              }}
            >
              {showForm ? <X size={15} /> : <Plus size={15} />}
              <span>{showForm ? 'Close Evaluation Form' : 'Assign Interview Panel'}</span>
            </button>
          </div>

          {/* ── Toast ── */}
          {message && (
            <div className={`alert-toast ${messageType === 'error' ? 'alert-danger' : 'alert-success'}`}>
              <span>{message}</span>
              <button type="button" className="toast-close" onClick={() => setMessage('')}>×</button>
            </div>
          )}

          {showForm && (
            <>
          {/* ─────────────────────────────────────────────────────── */}
          {/* SECTION 1: Interview Information Card                   */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="card-surface eval-card">
            <div className="card-header-bar">
              <span className="gold-indicator" />
              <h2 className="card-title">Interview Information</h2>
            </div>

            <div className="eval-info-grid">
              <div className="eval-form-group">
                <label className="eval-label" htmlFor="jobPosition">Job Position</label>
                <select
                  id="jobPosition"
                  name="jobPosition"
                  className="eval-select"
                  value={formData.jobPosition}
                  onChange={handleFieldChange}
                >
                  {JOB_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="eval-form-group">
                <label className="eval-label" htmlFor="interviewRound">Interview Round</label>
                <select
                  id="interviewRound"
                  name="interviewRound"
                  className="eval-select"
                  value={formData.interviewRound}
                  onChange={handleFieldChange}
                >
                  {INTERVIEW_ROUNDS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="eval-form-group">
                <label className="eval-label" htmlFor="interviewDate">Interview Date</label>
                <div className="eval-input-icon-wrap">
                  <CalendarDays size={14} />
                  <input
                    id="interviewDate"
                    name="interviewDate"
                    type="date"
                    className="eval-input"
                    value={formData.interviewDate}
                    onChange={handleFieldChange}
                  />
                </div>
              </div>

              <div className="eval-form-group">
                <label className="eval-label" htmlFor="interviewTime">Interview Time</label>
                <div className="eval-input-icon-wrap">
                  <Clock3 size={14} />
                  <input
                    id="interviewTime"
                    name="interviewTime"
                    type="time"
                    className="eval-input"
                    value={formData.interviewTime}
                    onChange={handleFieldChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────── */}
          {/* SECTION 2: Two-Column — Panel Assignment + Evaluation  */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="eval-two-col">

            {/* LEFT: Panel Assignment */}
            <div className="card-surface eval-card eval-panel-col">
              <div className="card-header-bar">
                <span className="gold-indicator" />
                <h2 className="card-title">Panel Assignment</h2>
              </div>

              <div className="eval-panel-fields">
                <div className="eval-form-group">
                  <label className="eval-label" htmlFor="panelMember1">Panel Member 1</label>
                  <select
                    id="panelMember1"
                    name="panelMember1"
                    className="eval-select"
                    value={formData.panelMember1}
                    onChange={handleFieldChange}
                  >
                    {PANEL_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="eval-form-group">
                  <label className="eval-label" htmlFor="panelMember2">Panel Member 2</label>
                  <select
                    id="panelMember2"
                    name="panelMember2"
                    className="eval-select"
                    value={formData.panelMember2}
                    onChange={handleFieldChange}
                  >
                    {PANEL_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="eval-form-group">
                  <label className="eval-label" htmlFor="hrRepresentative">HR Representative</label>
                  <select
                    id="hrRepresentative"
                    name="hrRepresentative"
                    className="eval-select"
                    value={formData.hrRepresentative}
                    onChange={handleFieldChange}
                  >
                    {PANEL_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

              </div>
            </div>

            {/* RIGHT: Candidate Evaluation */}
            <div className="card-surface eval-card eval-eval-col">
              <div className="card-header-bar">
                <span className="gold-indicator" />
                <h2 className="card-title">Candidate Evaluation</h2>
              </div>

              <div className="eval-candidate-section">
                <div className="eval-form-group">
                  <label className="eval-label" htmlFor="candidateName">Candidate Name</label>
                  <select
                    id="candidateName"
                    name="candidateName"
                    className="eval-select"
                    value={formData.candidateName}
                    onChange={handleFieldChange}
                  >
                    {CANDIDATES.filter((candidate) => candidate.role === formData.jobPosition).map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Score Grid */}
                <div className="eval-scores-grid">
                  <div className="eval-form-group">
                    <label className="eval-label">Communication Skills</label>
                    <select
                      name="commSkills"
                      className="eval-select"
                      value={formData.commSkills}
                      onChange={handleFieldChange}
                    >
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="eval-form-group">
                    <label className="eval-label">Technical Skills</label>
                    <select
                      name="techSkills"
                      className="eval-select"
                      value={formData.techSkills}
                      onChange={handleFieldChange}
                    >
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="eval-form-group">
                    <label className="eval-label">Problem Solving</label>
                    <select
                      name="problemSolving"
                      className="eval-select"
                      value={formData.problemSolving}
                      onChange={handleFieldChange}
                    >
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="eval-form-group">
                    <label className="eval-label">Teamwork</label>
                    <select
                      name="teamwork"
                      className="eval-select"
                      value={formData.teamwork}
                      onChange={handleFieldChange}
                    >
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                {/* Overall Star Rating */}
                <div className="eval-form-group">
                  <label className="eval-label">Overall Rating</label>
                  <StarRating
                    value={formData.overallRating}
                    onChange={(val) => handleRatingChange('overallRating', val)}
                  />
                </div>

                {/* Remarks */}
                <div className="eval-form-group">
                  <label className="eval-label" htmlFor="remarks">Interview Remarks</label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    className="eval-textarea"
                    rows={3}
                    value={formData.remarks}
                    onChange={handleFieldChange}
                    placeholder="Enter interview remarks and observations..."
                  />
                </div>

                {/* Recommendation */}
                <div className="eval-form-group">
                  <label className="eval-label">Recommendation</label>
                  <div className="eval-rec-buttons">
                    {['Hire', 'Hold', 'Reject'].map((rec) => (
                      <button
                        key={rec}
                        type="button"
                        className={`rec-btn rec-btn-${rec.toLowerCase()} ${formData.recommendation === rec ? 'selected' : ''}`}
                        onClick={() => setFormData((prev) => ({ ...prev, recommendation: rec }))}
                      >
                        {rec === 'Hire' && <CheckCircle size={14} />}
                        {rec === 'Hold' && <AlertCircle size={14} />}
                        {rec === 'Reject' && <X size={14} />}
                        {rec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="eval-action-row">
                  <button type="button" className="btn-eval-save" onClick={handleSave}>
                    <Save size={14} />
                    Save Evaluation
                  </button>
                  <button type="button" className="btn-eval-submit" onClick={handleSubmit}>
                    <Send size={14} />
                    Submit Evaluation
                  </button>
                  <button type="button" className="btn-eval-reset" onClick={handleReset}>
                    <RotateCcw size={14} />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {/* ─────────────────────────────────────────────────────── */}
          {/* SECTION 3: Evaluation Records Table                     */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="card-surface eval-card">
            <div className="card-header-bar">
              <span className="gold-indicator" />
              <h2 className="card-title">Evaluation Records</h2>
              <div className="eval-record-search">
                <Search size={14} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search evaluations..."
                  aria-label="Search evaluation records"
                />
              </div>
            </div>

            <div className="eval-table-wrap">
              <table className="eval-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Interview Panel</th>
                    <th>Rating</th>
                    <th>Recommendation</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="record-candidate-cell">
                          <CandidateAvatar name={record.candidateName} avatar={record.avatar} />
                          <div>
                            <div className="record-candidate-name">{record.candidateName}</div>
                            <div className="record-candidate-role">{record.candidateRole}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <PanelSummary members={record.panel} />
                      </td>
                      <td>
                        <StarRating value={record.overallRating} readOnly />
                      </td>
                      <td>
                        <RecBadge value={record.recommendation} />
                      </td>
                      <td>
                        <StatusBadge value={record.status} />
                      </td>
                      <td>
                        <div className="record-actions">
                          <button
                            type="button"
                            className="tbl-btn tbl-btn-view"
                            onClick={() => setViewRecord(record)}
                            title="View Details"
                            aria-label={`View ${record.candidateName}'s evaluation`}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            className="tbl-btn tbl-btn-edit"
                            onClick={() => handleEdit(record)}
                            disabled={record.status === 'Completed'}
                            title={record.status === 'Completed' ? 'Completed evaluations cannot be edited' : 'Edit Evaluation'}
                            aria-label={`Edit ${record.candidateName}'s evaluation`}
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-row">No evaluation records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="eval-mobile-records">
              {paginatedRecords.length === 0 && (
                <div className="eval-mobile-empty">No evaluation records found.</div>
              )}
              {paginatedRecords.map((record) => (
                <article className="eval-mobile-record-card" key={`mobile-${record.id}`}>
                  <div className="eval-mobile-record-card__header">
                    <div className="record-candidate-cell">
                      <CandidateAvatar name={record.candidateName} avatar={record.avatar} />
                      <div>
                        <div className="record-candidate-name">{record.candidateName}</div>
                        <div className="record-candidate-role">{record.candidateRole}</div>
                      </div>
                    </div>
                    <StatusBadge value={record.status} />
                  </div>
                  <div className="eval-mobile-record-card__body">
                    <StarRating value={record.overallRating} readOnly />
                    <RecBadge value={record.recommendation} />
                    <PanelSummary members={record.panel} />
                  </div>
                  <div className="record-actions">
                    <button
                      type="button"
                      className="tbl-btn tbl-btn-view"
                      onClick={() => setViewRecord(record)}
                      aria-label={`View ${record.candidateName}'s evaluation`}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className="tbl-btn tbl-btn-edit"
                      disabled={record.status === 'Completed'}
                      onClick={() => handleEdit(record)}
                      aria-label={`Edit ${record.candidateName}'s evaluation`}
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {filteredRecords.length > ITEMS_PER_PAGE && (
              <div className="eval-pagination-row">
              <span className="pagination-info">
                Showing{' '}
                <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredRecords.length)}</strong>
                –
                <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)}</strong>
                {' '}of{' '}
                <strong>{filteredRecords.length}</strong>{' '}evaluation records
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`page-num-btn ${currentPage === page ? 'is-active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* View Details Modal                                         */}
      {/* ─────────────────────────────────────────────────────────── */}
      {viewRecord && (
        <div className="eval-modal-overlay" onClick={() => setViewRecord(null)}>
          <div className="eval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="eval-modal-header">
              <h3 className="eval-modal-title">Evaluation Details — {viewRecord.candidateName}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setViewRecord(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="eval-modal-body">
              <div className="modal-candidate-row">
                <CandidateAvatar name={viewRecord.candidateName} avatar={viewRecord.avatar} size={48} />
                <div>
                  <div className="modal-cand-name">{viewRecord.candidateName}</div>
                  <div className="modal-cand-role">{viewRecord.candidateRole}</div>
                </div>
                <RecBadge value={viewRecord.recommendation} />
                <StatusBadge value={viewRecord.status} />
              </div>

              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="modal-info-label">Interview Round</span>
                  <span className="modal-info-value">{viewRecord.interviewRound}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Interview Date</span>
                  <span className="modal-info-value">{viewRecord.interviewDate}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Panel Members</span>
                  <span className="modal-info-value">{viewRecord.panel.join(' · ')}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Overall Rating</span>
                  <StarRating value={viewRecord.overallRating} readOnly />
                </div>
              </div>

              <div className="modal-scores-grid">
                {[
                  { label: 'Communication Skills', val: viewRecord.commSkills },
                  { label: 'Technical Skills', val: viewRecord.techSkills },
                  { label: 'Problem Solving', val: viewRecord.problemSolving },
                  { label: 'Teamwork', val: viewRecord.teamwork },
                ].map(({ label, val }) => (
                  <div key={label} className="modal-score-item">
                    <span className="modal-score-label">{label}</span>
                    <div className="modal-score-bar-wrap">
                      <div
                        className="modal-score-bar"
                        style={{ width: `${(val / 5) * 100}%` }}
                      />
                    </div>
                    <span className="modal-score-val">{val}/5</span>
                  </div>
                ))}
              </div>

              {viewRecord.remarks && (
                <div className="modal-remarks-block">
                  <span className="modal-info-label">Interview Remarks</span>
                  <p className="modal-remarks-text">{viewRecord.remarks}</p>
                </div>
              )}
            </div>

            <div className="eval-modal-footer">
              <button
                type="button"
                className="btn-eval-edit-modal"
                disabled={viewRecord.status === 'Completed'}
                onClick={() => { handleEdit(viewRecord); setViewRecord(null); }}
              >
                <Edit2 size={14} />
                Edit Evaluation
              </button>
              <button type="button" className="btn-modal-close" onClick={() => setViewRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewEvaluationPage;
