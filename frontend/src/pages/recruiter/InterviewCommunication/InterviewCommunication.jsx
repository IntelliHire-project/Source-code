import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Plus,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  XCircle,
  Send,
  Calendar,
  User,
  Briefcase,
  Layers,
  FileText,
  AlertCircle,
  Check,
  CalendarClock,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './InterviewCommunication.css';

// Initial Mock Invitations Data perfectly synchronized across all Interview pages
const INITIAL_INVITATIONS = [
  {
    id: 'INV-1001',
    candidateName: 'Alice Fernando',
    candidateRole: 'Senior Fullstack Engineer',
    email: 'alice.fernando@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    roundType: 'Technical',
    sentDate: '03 Aug 2026',
    expiryDate: '06 Aug 2026',
    status: 'Accepted',
    meetingLink: 'https://meet.google.com/tech-interview-alice',
  },
  {
    id: 'INV-1002',
    candidateName: 'Kamal Perera',
    candidateRole: 'UI/UX Designer',
    email: 'kamal.perera@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    roundType: 'HR Portfolio Review',
    sentDate: '03 Aug 2026',
    expiryDate: '06 Aug 2026',
    status: 'Pending Response',
    meetingLink: 'https://meet.google.com/portfolio-kamal',
  },
  {
    id: 'INV-1003',
    candidateName: 'Nimal Silva',
    candidateRole: 'QA Automation Engineer',
    email: 'nimal.silva@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    roundType: 'Final Cultural Fit',
    sentDate: '04 Aug 2026',
    expiryDate: '07 Aug 2026',
    status: 'Sent',
    meetingLink: 'https://meet.google.com/cultural-fit-nimal',
  },
  {
    id: 'INV-1004',
    candidateName: 'Sara Jayawardena',
    candidateRole: 'Business Analyst',
    email: 'sara.j@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    roundType: 'Technical Case Study',
    sentDate: '05 Aug 2026',
    expiryDate: '08 Aug 2026',
    status: 'Declined',
    meetingLink: 'https://meet.google.com/case-study-sara',
  },
  {
    id: 'INV-1005',
    candidateName: 'Ruwan Bandara',
    candidateRole: 'Product Manager',
    email: 'ruwan.bandara@example.com',
    avatar: null,
    roundType: 'HR Screening',
    sentDate: '06 Aug 2026',
    expiryDate: '09 Aug 2026',
    status: 'Expired',
    meetingLink: 'https://meet.google.com/hr-screening-ruwan',
  },
  {
    id: 'INV-1006',
    candidateName: 'Dilhani Wickramasinghe',
    candidateRole: 'DevOps Lead',
    email: 'dilhani.w@example.com',
    avatar: null,
    roundType: 'Architecture Final',
    sentDate: '07 Aug 2026',
    expiryDate: '10 Aug 2026',
    status: 'Accepted',
    meetingLink: 'https://meet.google.com/architecture-dilhani',
  },
];

export default function InterviewCommunication() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invitations, setInvitations] = useState(INITIAL_INVITATIONS);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Toast & Modal State
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [reschedulingInvite, setReschedulingInvite] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    interviewDate: '2026-08-12',
    startTime: '10:00',
    meetingLink: '',
  });

  // New Invite Form State
  const [newInvite, setNewInvite] = useState({
    candidateName: '',
    candidateRole: 'Senior Fullstack Engineer',
    email: '',
    roundType: 'Technical',
    expiryDays: '3',
    customNotes: 'Please confirm your availability for the technical round.',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Show Toast Helper
  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  useEffect(() => {
    if (!toastMsg) return undefined;
    const timeoutId = window.setTimeout(() => setToastMsg(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toastMsg]);

  const invitationStats = useMemo(() => {
    const accepted = invitations.filter((invitation) => invitation.status === 'Accepted').length;
    const pending = invitations.filter(
      (invitation) => invitation.status === 'Pending Response' || invitation.status === 'Sent'
    ).length;
    return {
      total: invitations.length,
      accepted,
      pending,
      completionRate: invitations.length ? Math.round((accepted / invitations.length) * 100) : 0,
    };
  }, [invitations]);

  // Filtered Invitations
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      const matchesSearch =
        inv.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.candidateRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        inv.status.toUpperCase().replace(/\s+/g, '_') === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invitations, searchQuery, statusFilter]);

  // Pagination Math
  const totalPages = Math.ceil(filteredInvitations.length / itemsPerPage) || 1;
  const paginatedInvitations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvitations.slice(start, start + itemsPerPage);
  }, [filteredInvitations, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Handle Send New Invite
  const handleCreateInvite = (e) => {
    e.preventDefault();
    if (!newInvite.candidateName || !newInvite.email) {
      showToast('Please fill in candidate name and email address.', 'error');
      return;
    }
    const normalizedEmail = newInvite.email.trim().toLowerCase();
    if (invitations.some((invitation) => invitation.email.toLowerCase() === normalizedEmail)) {
      showToast('An invitation already exists for this email address.', 'error');
      return;
    }

    const sentDate = new Date();
    const expiryDate = new Date(sentDate);
    expiryDate.setDate(expiryDate.getDate() + Number(newInvite.expiryDays));
    const formatDisplayDate = (date) =>
      date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const createdRecord = {
      id: `INV-${String(Math.max(...invitations.map((invitation) => Number(invitation.id.split('-')[1]))) + 1)}`,
      candidateName: newInvite.candidateName.trim(),
      candidateRole: newInvite.candidateRole,
      email: normalizedEmail,
      avatar: null,
      roundType: newInvite.roundType,
      sentDate: formatDisplayDate(sentDate),
      expiryDate: formatDisplayDate(expiryDate),
      status: 'Sent',
      meetingLink: 'https://meet.google.com/interview-new-invite',
    };

    setInvitations((current) => [createdRecord, ...current]);
    setIsSendModalOpen(false);
    showToast(`Interview invitation sent successfully to ${newInvite.email}!`, 'success');
    setNewInvite({
      candidateName: '',
      candidateRole: 'Senior Fullstack Engineer',
      email: '',
      roundType: 'Technical',
      expiryDays: '3',
      customNotes: 'Please confirm your availability for the technical round.',
    });
  };

  // Handle Resend Email
  const handleResend = (invite) => {
    if (invite.status === 'Accepted') {
      showToast(`${invite.candidateName} has already accepted this invitation.`, 'error');
      return;
    }
    setInvitations((current) =>
      current.map((item) =>
        item.id === invite.id ? { ...item, status: 'Sent', sentDate: 'Today' } : item
      )
    );
    showToast(`Invitation email re-sent to ${invite.candidateName} (${invite.email})`, 'success');
  };

  const openRescheduleModal = (invite) => {
    setReschedulingInvite(invite);
    setRescheduleData({
      interviewDate: '2026-08-12',
      startTime: '10:00',
      meetingLink: invite.meetingLink,
    });
  };

  const handleReschedule = (event) => {
    event.preventDefault();
    if (!rescheduleData.interviewDate || !rescheduleData.startTime || !rescheduleData.meetingLink.trim()) {
      showToast('Date, time, and meeting link/location are required.', 'error');
      return;
    }
    const selectedDate = new Date(`${rescheduleData.interviewDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showToast('The rescheduled interview date cannot be in the past.', 'error');
      return;
    }
    const displayDate = selectedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    setInvitations((current) =>
      current.map((invitation) =>
        invitation.id === reschedulingInvite.id
          ? {
              ...invitation,
              interviewDate: displayDate,
              interviewTime: rescheduleData.startTime,
              meetingLink: rescheduleData.meetingLink.trim(),
              status: 'Sent',
            }
          : invitation
      )
    );
    setReschedulingInvite(null);
    showToast(`Interview rescheduled and ${reschedulingInvite.candidateName} was notified.`);
  };

  // Render Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="status-pill accepted">
            <CheckCircle size={14} /> Accepted
          </span>
        );
      case 'Pending Response':
        return (
          <span className="status-pill pending">
            <Clock size={14} /> Pending Response
          </span>
        );
      case 'Sent':
        return (
          <span className="status-pill sent">
            <Send size={14} /> Sent
          </span>
        );
      case 'Declined':
        return (
          <span className="status-pill declined">
            <XCircle size={14} /> Declined
          </span>
        );
      case 'Expired':
        return (
          <span className="status-pill expired">
            <RotateCcw size={14} /> Expired
          </span>
        );
      default:
        return <span className="status-pill expired">{status}</span>;
    }
  };

  return (
    <div className="create-vacancy">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Invitations & Email"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          searchPlaceholder="Search assessments, roles, or candidates..."
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        {/* Content Container */}
        <div className="recruiter-content">

          {/* Sub-navigation Tabs */}
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
              className="subnav-tab-btn is-active"
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

          <div className="comm-page-heading">
            <h1 className="page-title">Interview Communication Management</h1>
            <p className="page-subtitle">
              Send interview invitations, monitor candidate responses, and manage schedule changes.
            </p>
          </div>

          {/* Toast Notification Alert */}
          {toastMsg && (
            <div className={`alert-toast alert-${toastType === 'error' ? 'danger' : 'success'}`}>
              <span>{toastMsg}</span>
              <button type="button" className="toast-close" onClick={() => setToastMsg('')}>
                ×
              </button>
            </div>
          )}

          {/* Page Heading & Main Actions */}
          <div className="interview-comm-container">

            {/* 4 Stat Cards */}
            <div className="comm-stats-grid">
              <div className="comm-stat-card">
                <div className="comm-stat-info">
                  <span className="comm-stat-label">TOTAL SENT</span>
                  <span className="comm-stat-value">{invitationStats.total}</span>
                </div>
                <div className="comm-stat-icon-wrap">
                  <Mail size={24} />
                </div>
              </div>

              <div className="comm-stat-card">
                <div className="comm-stat-info">
                  <span className="comm-stat-label">ACCEPTED</span>
                  <span className="comm-stat-value">{invitationStats.accepted}</span>
                </div>
                <div className="comm-stat-icon-wrap success">
                  <CheckCircle size={24} />
                </div>
              </div>

              <div className="comm-stat-card">
                <div className="comm-stat-info">
                  <span className="comm-stat-label">PENDING</span>
                  <span className="comm-stat-value">{invitationStats.pending}</span>
                </div>
                <div className="comm-stat-icon-wrap pending">
                  <Clock size={24} />
                </div>
              </div>

              <div className="comm-stat-card">
                <div className="comm-stat-info">
                  <span className="comm-stat-label">COMPLETION RATE</span>
                  <span className="comm-stat-value">{invitationStats.completionRate}%</span>
                </div>
                <div className="comm-stat-icon-wrap accent">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* Active Invitations Section Header */}
            <div className="comm-table-header">
              <div className="comm-table-title-group">
                <h2 className="comm-table-title">Active Invitations</h2>
                <p className="comm-table-subtitle">
                  Monitor and manage candidate responses for scheduled interview rounds.
                </p>
              </div>

              <div className="comm-table-actions">
                <div className="comm-search-box">
                  <Search size={16} className="comm-search-icon" />
                  <input
                    type="text"
                    className="comm-search-input"
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="comm-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="PENDING_RESPONSE">Pending Response</option>
                  <option value="SENT">Sent</option>
                  <option value="DECLINED">Declined</option>
                  <option value="EXPIRED">Expired</option>
                </select>

                <button
                  type="button"
                  className="btn-send-invite"
                  onClick={() => setIsSendModalOpen(true)}
                >
                  <Plus size={18} /> Send New Invite
                </button>
              </div>
            </div>

            {/* Table Surface */}
            <div className="comm-table-card">
              <div className="comm-table-wrapper">
                <table className="comm-table">
                  <thead>
                    <tr>
                      <th>CANDIDATE</th>
                      <th>ROUND TYPE</th>
                      <th>SENT DATE</th>
                      <th>EXPIRY</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInvitations.length > 0 ? (
                      paginatedInvitations.map((inv) => (
                        <tr key={inv.id}>
                          <td>
                            <div className="cand-cell">
                              <div className="cand-avatar">
                                {inv.avatar ? (
                                  <img src={inv.avatar} alt={inv.candidateName} />
                                ) : (
                                  inv.candidateName.charAt(0)
                                )}
                              </div>
                              <div className="cand-meta">
                                <span className="cand-name">{inv.candidateName}</span>
                                <span className="cand-role">{inv.candidateRole}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="round-pill">
                              <Calendar size={14} className="round-icon" />
                              <span>{inv.roundType}</span>
                            </div>
                          </td>
                          <td>{inv.sentDate}</td>
                          <td>{inv.expiryDate}</td>
                          <td>{renderStatusBadge(inv.status)}</td>
                          <td>
                            <div className="table-actions-cell">
                              <button
                                type="button"
                                className="action-icon-btn"
                                title="View Invitation Details"
                                onClick={() => {
                                  setSelectedInvite(inv);
                                  setIsDetailModalOpen(true);
                                }}
                              >
                                <ExternalLink size={16} />
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn action-reschedule"
                                title="Reschedule Interview"
                                onClick={() => openRescheduleModal(inv)}
                              >
                                <CalendarClock size={16} />
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn"
                                title="Resend Email Invitation"
                                disabled={inv.status === 'Accepted'}
                                onClick={() => handleResend(inv)}
                              >
                                <Mail size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9599A6' }}>
                          No invitations found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="comm-mobile-list">
                {paginatedInvitations.length === 0 && (
                  <div className="comm-mobile-empty">No invitations found matching your criteria.</div>
                )}
                {paginatedInvitations.map((invitation) => (
                  <article className="comm-mobile-card" key={`mobile-${invitation.id}`}>
                    <div className="comm-mobile-card__header">
                      <div className="cand-cell">
                        <div className="cand-avatar">
                          {invitation.avatar ? <img src={invitation.avatar} alt="" /> : invitation.candidateName.charAt(0)}
                        </div>
                        <div className="cand-meta">
                          <span className="cand-name">{invitation.candidateName}</span>
                          <span className="cand-role">{invitation.candidateRole}</span>
                        </div>
                      </div>
                      {renderStatusBadge(invitation.status)}
                    </div>
                    <div className="comm-mobile-card__details">
                      <span><Calendar size={14} /> {invitation.roundType}</span>
                      <span>Sent: {invitation.sentDate}</span>
                      <span>Expires: {invitation.expiryDate}</span>
                    </div>
                    <div className="comm-mobile-card__actions">
                      <button type="button" onClick={() => {
                        setSelectedInvite(invitation);
                        setIsDetailModalOpen(true);
                      }}><ExternalLink size={15} /> Details</button>
                      <button type="button" onClick={() => openRescheduleModal(invitation)}>
                        <CalendarClock size={15} /> Reschedule
                      </button>
                      <button type="button" disabled={invitation.status === 'Accepted'} onClick={() => handleResend(invitation)}>
                        <Mail size={15} /> Resend
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Table Pagination Footer */}
              {filteredInvitations.length > itemsPerPage && (
                <div className="table-pagination-footer">
                <span className="pagination-info">
                  Showing <strong>{paginatedInvitations.length}</strong> of <strong>{filteredInvitations.length}</strong> invitations
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

            {/* Bottom Widgets (2 Cards Grid) */}
            <div className="comm-bottom-grid">
              {/* Left Widget: Invitation Performance */}
              <div className="comm-bottom-card">
                <div className="comm-card-header">
                  <h3 className="comm-card-title">Invitation Performance</h3>
                  <p className="comm-card-subtitle">
                    Average response latency and acceptance metrics across departments over the last 30 days.
                  </p>
                </div>

                <div className="analytics-body">
                  <div className="dept-bar-group">
                    <div className="dept-bar-info">
                      <span className="dept-name">Engineering (Technical Rounds)</span>
                      <span className="dept-value">84% Acceptance (3.2 hrs avg response)</span>
                    </div>
                    <div className="dept-progress-track">
                      <div className="dept-progress-fill" style={{ width: '84%' }}></div>
                    </div>
                  </div>

                  <div className="dept-bar-group">
                    <div className="dept-bar-info">
                      <span className="dept-name">Product & Design (System/Portfolio Rounds)</span>
                      <span className="dept-value">76% Acceptance (4.5 hrs avg response)</span>
                    </div>
                    <div className="dept-progress-track">
                      <div className="dept-progress-fill" style={{ width: '76%' }}></div>
                    </div>
                  </div>

                  <div className="dept-bar-group">
                    <div className="dept-bar-info">
                      <span className="dept-name">Management & HR (Culture/Screening)</span>
                      <span className="dept-value">91% Acceptance (1.8 hrs avg response)</span>
                    </div>
                    <div className="dept-progress-track">
                      <div className="dept-progress-fill" style={{ width: '91%' }}></div>
                    </div>
                  </div>

                  <div className="analytics-footer-note">
                    <RotateCcw size={15} />
                    <span>Analytical visualization of response latency is automatically synchronized with candidate interactions.</span>
                  </div>
                </div>
              </div>

              {/* Right Widget: Recent Feedback & Activity */}
              <div className="comm-bottom-card">
                <div className="comm-card-header">
                  <h3 className="comm-card-title">Recent Feedback</h3>
                  <p className="comm-card-subtitle">Latest invitation activities and candidate RSVPs.</p>
                </div>

                <div className="activity-feed">
                  <div className="activity-item">
                    <div className="activity-avatar">
                      <User size={16} />
                    </div>
                    <div className="activity-content">
                      <span className="activity-text">
                        Invitation accepted for the Lead Technical round.
                      </span>
                      <span className="activity-meta">SARAH JENKINS • HR • 2m ago</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-avatar">
                      <User size={16} />
                    </div>
                    <div className="activity-content">
                      <span className="activity-text">
                        3 Invitations expired for the DevOps position.
                      </span>
                      <span className="activity-meta">SYSTEM • AUTOMATED • 1h ago</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-avatar">
                      <User size={16} />
                    </div>
                    <div className="activity-content">
                      <span className="activity-text">
                        New invitation template 'Premium Obsidian' created.
                      </span>
                      <span className="activity-meta">ALEXANDER PIERCE • ADMIN • 4h ago</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-view-all-notifs"
                  onClick={() => showToast('Opening notification history panel...')}
                >
                  View All Notifications
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Send New Invite Modal ── */}
      {isSendModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSendModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Send New Interview Invitation</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsSendModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateInvite}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">CANDIDATE NAME</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Kasun Kalhara"
                    value={newInvite.candidateName}
                    onChange={(e) => setNewInvite({ ...newInvite, candidateName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CANDIDATE EMAIL ADDRESS</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. kasun@example.com"
                    value={newInvite.email}
                    onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">JOB POSITION</label>
                    <select
                      className="form-control"
                      value={newInvite.candidateRole}
                      onChange={(e) => setNewInvite({ ...newInvite, candidateRole: e.target.value })}
                    >
                      <option value="Senior Fullstack Engineer">Senior Fullstack Engineer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="QA Automation Engineer">QA Automation Engineer</option>
                      <option value="Product Manager">Product Manager</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">INTERVIEW ROUND</label>
                    <select
                      className="form-control"
                      value={newInvite.roundType}
                      onChange={(e) => setNewInvite({ ...newInvite, roundType: e.target.value })}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Cultural Fit">Cultural Fit</option>
                      <option value="System Design">System Design</option>
                      <option value="HR Screening">HR Screening</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">EXPIRY PERIOD (DAYS)</label>
                  <select
                    className="form-control"
                    value={newInvite.expiryDays}
                    onChange={(e) => setNewInvite({ ...newInvite, expiryDays: e.target.value })}
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">CUSTOM EMAIL MESSAGE / NOTES</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newInvite.customNotes}
                    onChange={(e) => setNewInvite({ ...newInvite, customNotes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsSendModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-send-invite">
                  <Send size={16} /> Dispatch Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Interview Modal */}
      {reschedulingInvite && (
        <div className="modal-overlay" onClick={() => setReschedulingInvite(null)}>
          <div className="modal-dialog modal-dialog-sm" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reschedule – {reschedulingInvite.candidateName}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setReschedulingInvite(null)} aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleReschedule}>
              <div className="modal-body">
                <div className="form-grid-2 comm-modal-grid">
                  <div className="form-group">
                    <label className="form-label">NEW INTERVIEW DATE</label>
                    <input
                      type="date"
                      className="form-control"
                      value={rescheduleData.interviewDate}
                      onChange={(event) => setRescheduleData((current) => ({ ...current, interviewDate: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">START TIME</label>
                    <input
                      type="time"
                      className="form-control"
                      value={rescheduleData.startTime}
                      onChange={(event) => setRescheduleData((current) => ({ ...current, startTime: event.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">MEETING LINK / LOCATION</label>
                  <input
                    type="text"
                    className="form-control"
                    value={rescheduleData.meetingLink}
                    onChange={(event) => setRescheduleData((current) => ({ ...current, meetingLink: event.target.value }))}
                    required
                  />
                </div>
                <div className="reschedule-notice">
                  <AlertCircle size={16} />
                  The candidate will receive an updated schedule notification.
                </div>
              </div>
              <div className="modal-footer comm-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setReschedulingInvite(null)}>Cancel</button>
                <button type="submit" className="btn-send-invite">
                  <CalendarClock size={16} /> Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Details Modal ── */}
      {isDetailModalOpen && selectedInvite && (
        <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Invitation Details – {selectedInvite.candidateName}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsDetailModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A2C38', paddingBottom: '10px' }}>
                  <span style={{ color: '#9599A6' }}>Invitation ID:</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{selectedInvite.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A2C38', paddingBottom: '10px' }}>
                  <span style={{ color: '#9599A6' }}>Candidate Email:</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{selectedInvite.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A2C38', paddingBottom: '10px' }}>
                  <span style={{ color: '#9599A6' }}>Job Position:</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{selectedInvite.candidateRole}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A2C38', paddingBottom: '10px' }}>
                  <span style={{ color: '#9599A6' }}>Interview Round:</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{selectedInvite.roundType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A2C38', paddingBottom: '10px' }}>
                  <span style={{ color: '#9599A6' }}>Status:</span>
                  <span>{renderStatusBadge(selectedInvite.status)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A2C38', paddingBottom: '10px' }}>
                  <span style={{ color: '#9599A6' }}>Meeting Link:</span>
                  <a href={selectedInvite.meetingLink} target="_blank" rel="noreferrer" style={{ color: '#F0B90B' }}>
                    Open Google Meet
                  </a>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-send-invite"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleResend(selectedInvite);
                }}
              >
                <Mail size={16} /> Resend Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
